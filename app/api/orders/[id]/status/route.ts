import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { createNotificationFromTemplate } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has permission to update this order
    if (decoded.role === "OWNER" && order.owner.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (
      decoded.role === "CUSTOMER" &&
      order.customer.toString() !== decoded.userId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
        // Set actual delivery time when marked as delivered
        ...(status === "DELIVERED" && { actualDeliveryTime: new Date() }),
      },
      { new: true, returnDocument: "after" },
    )
      .populate("customer", "name email phone")
      .populate("owner", "name restaurantName")
      .populate("items.product", "name image price");

    // Send notification to customer about status update
    if (updatedOrder.customer && status !== "CANCELLED") {
      await createNotificationFromTemplate(
        "orderStatusUpdate",
        updatedOrder.customer._id.toString(),
        updatedOrder.owner._id.toString(),
        updatedOrder._id.toString(),
        status,
      );
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
