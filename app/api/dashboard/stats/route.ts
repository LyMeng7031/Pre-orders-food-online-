import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

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

    // Only allow owners to access dashboard stats
    if (decoded.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    const ownerId = decoded.userId;

    // Get current date and month boundaries
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total products count
    const totalProducts = await Product.countDocuments({ owner: ownerId });

    // Get active products count
    const activeProducts = await Product.countDocuments({
      owner: ownerId,
      isAvailable: true,
    });

    // Get orders statistics
    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      completedOrders,
      thisMonthOrders,
    ] = await Promise.all([
      Order.countDocuments({ owner: ownerId }),
      Order.countDocuments({
        owner: ownerId,
        status: { $in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
      }),
      Order.countDocuments({
        owner: ownerId,
        createdAt: { $gte: todayStart },
      }),
      Order.countDocuments({ owner: ownerId, status: "COMPLETED" }),
      Order.countDocuments({
        owner: ownerId,
        createdAt: { $gte: monthStart },
      }),
    ]);

    // Calculate revenue
    const [totalRevenue, thisMonthRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(ownerId),
            status: "COMPLETED",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(ownerId),
            status: "COMPLETED",
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Get unique customers count
    const totalCustomers = await Order.distinct("customer", { owner: ownerId });

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers: totalCustomers.length,
      pendingOrders,
      todayOrders,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      activeProducts,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
