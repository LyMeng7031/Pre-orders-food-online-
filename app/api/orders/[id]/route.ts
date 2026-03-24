import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(
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

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Find order and populate related data
    const order = await Order.findById(id)
      .populate("customer", "name email phone")
      .populate("owner", "name restaurantName")
      .populate("items.product", "name image price");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has permission to view this order
    if (
      decoded.role === "CUSTOMER" &&
      order.customer._id.toString() !== decoded.userId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (
      decoded.role === "OWNER" &&
      order.owner._id.toString() !== decoded.userId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
