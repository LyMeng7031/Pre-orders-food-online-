// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
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

    await mongoose.connect(process.env.MONGODB_URI || "");

    const body = await request.json();
    const {
      items,
      deliveryAddress,
      deliveryPhone,
      orderNotes,
      paymentMethod = "CASH",
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Get product details and calculate total
    let totalAmount = 0;
    const orderItems = [];

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

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        specialInstructions: item.specialInstructions || "",
      });
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = new Order({
      orderNumber,
      customer: decoded.userId,
      owner: items[0].owner, // Get owner from first product
      items: orderItems,
      totalAmount,
      deliveryAddress,
      deliveryPhone,
      orderNotes,
      paymentMethod,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    });

    await order.save();

    // Get user and owner details for notification
    const user = await User.findById(decoded.userId);
    const ownerUser = await User.findById(order.owner);

    // Send notification to restaurant owner
    await createNotificationFromTemplate(
      "orderPlaced",
      order.owner.toString(),
      decoded.userId,
      order._id.toString(),
      user.name,
      ownerUser.restaurantName || ownerUser.name,
    );

    return NextResponse.json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
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

    // Get orders based on user role
    let orders;
    if (decoded.role === "CUSTOMER") {
      // Customers see their own orders
      orders = await Order.find({ customer: decoded.userId })
        .populate("owner", "name restaurantName")
        .populate("items.product", "name image")
        .sort({ createdAt: -1 });
    } else if (decoded.role === "OWNER") {
      // Owners see orders for their restaurant
      orders = await Order.find({ owner: decoded.userId })
        .populate("customer", "name email phone")
        .populate("items.product", "name image")
        .sort({ createdAt: -1 });
    } else {
      // Admins see all orders
      orders = await Order.find({})
        .populate("customer", "name email phone")
        .populate("owner", "name restaurantName")
        .populate("items.product", "name image")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
