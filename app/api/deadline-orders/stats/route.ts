import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import DeadlineOrder from "@/models/DeadlineOrder";
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

    // Only allow owners to access deadline order stats
    if (decoded.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    const ownerId = decoded.userId;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get current date and time for urgency calculations
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Get various statistics
    const [
      totalOrders,
      urgentOrders, // Orders due within 2 hours
      upcomingOrders, // Orders due within 6 hours
      overdueOrders, // Orders past deadline
      todayOrders,
      completedToday,
      thisWeekOrders,
      thisMonthOrders,
      avgPreparationTimeResult,
    ] = await Promise.all([
      // Total deadline orders
      DeadlineOrder.countDocuments({ owner: ownerId }),

      // Urgent orders (deadline within 2 hours)
      DeadlineOrder.countDocuments({
        owner: ownerId,
        deadlineTime: { $lte: twoHoursFromNow, $gte: now },
        status: { $in: ["BOOKED", "CONFIRMED", "PREPARING", "READY"] },
      }),

      // Upcoming orders (deadline within 6 hours)
      DeadlineOrder.countDocuments({
        owner: ownerId,
        deadlineTime: { $lte: sixHoursFromNow, $gte: now },
        status: { $in: ["BOOKED", "CONFIRMED", "PREPARING", "READY"] },
      }),

      // Overdue orders
      DeadlineOrder.countDocuments({
        owner: ownerId,
        deadlineTime: { $lt: now },
        status: { $in: ["BOOKED", "CONFIRMED", "PREPARING", "READY"] },
      }),

      // Today's orders
      DeadlineOrder.countDocuments({
        owner: ownerId,
        createdAt: { $gte: todayStart },
      }),

      // Completed today
      DeadlineOrder.countDocuments({
        owner: ownerId,
        status: "COMPLETED",
        updatedAt: { $gte: todayStart },
      }),

      // This week's orders
      DeadlineOrder.countDocuments({
        owner: ownerId,
        createdAt: { $gte: weekStart },
      }),

      // This month's orders
      DeadlineOrder.countDocuments({
        owner: ownerId,
        createdAt: { $gte: monthStart },
      }),

      // Average preparation time
      DeadlineOrder.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
        { $group: { _id: null, avgPrepTime: { $avg: "$preparationTime" } } },
      ]),
    ]);

    // Calculate revenue
    const [todayRevenue, thisWeekRevenue, thisMonthRevenue] = await Promise.all(
      [
        DeadlineOrder.aggregate([
          {
            $match: {
              owner: new mongoose.Types.ObjectId(ownerId),
              status: "COMPLETED",
              updatedAt: { $gte: todayStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        DeadlineOrder.aggregate([
          {
            $match: {
              owner: new mongoose.Types.ObjectId(ownerId),
              status: "COMPLETED",
              updatedAt: { $gte: weekStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        DeadlineOrder.aggregate([
          {
            $match: {
              owner: new mongoose.Types.ObjectId(ownerId),
              status: "COMPLETED",
              updatedAt: { $gte: monthStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ],
    );

    const stats = {
      totalOrders,
      urgentOrders,
      upcomingOrders,
      overdueOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      thisWeekRevenue: thisWeekRevenue[0]?.total || 0,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      completedToday,
      avgPreparationTime: Math.round(
        avgPreparationTimeResult[0]?.avgPrepTime || 15,
      ),

      // Additional calculated metrics
      completionRate:
        todayOrders > 0 ? Math.round((completedToday / todayOrders) * 100) : 0,
      weeklyGrowth:
        thisWeekOrders > 0
          ? Math.round((todayOrders / thisWeekOrders) * 100)
          : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching deadline order stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
