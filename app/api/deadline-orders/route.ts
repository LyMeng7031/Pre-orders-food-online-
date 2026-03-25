import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import DeadlineOrder from "@/models/DeadlineOrder";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";
import { createNotificationFromTemplate } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
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

    if (decoded.role && decoded.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create deadline orders" },
        { status: 403 },
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    const body = await request.json();
    const { items, deadlineTime, customerName, customerPhone, customerEmail } =
      body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!deadlineTime) {
      return NextResponse.json(
        { error: "Deadline time is required" },
        { status: 400 },
      );
    }

    // Get product details and calculate total
    let totalAmount = 0;
    let orderItems = [];
    let preparationTime = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isAvailable) {
        return NextResponse.json(
          {
            error: `Product ${item.product} not available`,
          },
          { status: 400 },
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      preparationTime = Math.max(
        preparationTime,
        product.preparationTime || 15,
      );

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        specialInstructions: item.specialInstructions || "",
      });
    }

    // Create deadline order
    const deadlineOrder = new DeadlineOrder({
      customer: decoded.userId,
      owner: items[0].owner, // Get owner from first product
      items: orderItems,
      totalAmount,
      deadlineTime: new Date(deadlineTime),
      bookingTime: new Date(),
      preparationTime,
      customerName,
      customerPhone,
      customerEmail,
    });

    await deadlineOrder.save();

    // Get owner details for notification
    const ownerUser = await User.findById(items[0].owner);

    // Send notification to restaurant owner
    await createNotificationFromTemplate(
      "deadlineOrderPlaced",
      deadlineOrder.owner.toString(),
      decoded.userId,
      deadlineOrder._id.toString(),
      customerName,
      ownerUser.restaurantName || ownerUser.name,
      new Date(deadlineTime),
    );

    return NextResponse.json({
      message: "Deadline order created successfully",
      order: deadlineOrder,
    });
  } catch (error) {
    console.error("Error creating deadline order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Get orders based on user role
    let orders;
    if (decoded.role === "CUSTOMER") {
      // Customers see their own deadline orders
      const query: any = { customer: decoded.userId };
      if (status) query.status = status;

      orders = await DeadlineOrder.find(query)
        .populate("owner", "name restaurantName")
        .populate("items.product", "name image price")
        .sort({ deadlineTime: -1 });
    } else if (decoded.role === "OWNER") {
      // Owners see deadline orders for their restaurant
      const query: any = { owner: decoded.userId };
      if (status) query.status = status;

      orders = await DeadlineOrder.find(query)
        .populate("customer", "name email phone")
        .populate("items.product", "name image price")
        .sort({ deadlineTime: -1 });
    } else {
      // Admins see all deadline orders
      const query: any = {};
      if (status) query.status = status;

      orders = await DeadlineOrder.find(query)
        .populate("customer", "name email phone")
        .populate("owner", "name restaurantName")
        .populate("items.product", "name image price")
        .sort({ deadlineTime: -1 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching deadline orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
