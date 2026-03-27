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

    // Only allow owners to access reports
    if (decoded.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "daily";

    await mongoose.connect(process.env.MONGODB_URI || "");

    const ownerId = decoded.userId;
    const now = new Date();
    let startDate: Date, endDate: Date;

    // Set date range based on report type
    switch (reportType) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
    }

    // Get orders for the specified period
    const orders = await DeadlineOrder.find({
      owner: ownerId,
      createdAt: { $gte: startDate, $lt: endDate },
    })
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    // Generate report data
    const reportData = {
      reportType,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      },
      summary: {
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
        cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
        missedOrders: orders.filter((o) => o.status === "MISSED").length,
        pendingOrders: orders.filter((o) =>
          ["BOOKED", "CONFIRMED", "PREPARING", "READY"].includes(o.status),
        ).length,
        totalRevenue: orders
          .filter((o) => o.status === "COMPLETED")
          .reduce((sum, order) => sum + order.totalAmount, 0),
        avgOrderValue:
          orders.length > 0
            ? orders.reduce((sum, order) => sum + order.totalAmount, 0) /
              orders.length
            : 0,
      },
      // Peak hours analysis
      peakHours: analyzePeakHours(orders),
      // Most ordered products
      topProducts: analyzeTopProducts(orders),
      // Order status breakdown
      statusBreakdown: analyzeStatusBreakdown(orders),
      // Detailed orders list
      orders: orders.map((order) => ({
        orderId: order._id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        status: order.status,
        totalAmount: order.totalAmount,
        deadlineTime: order.deadlineTime,
        bookingTime: order.bookingTime,
        preparationTime: order.preparationTime,
        items: order.items.map((item) => ({
          productName: (item.product as any)?.name || "Unknown",
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    };

    // Generate CSV content
    const csvContent = generateCSV(reportData);

    // Set response headers for CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${reportType}-report-${new Date().toISOString().split("T")[0]}.csv"`,
    );

    return new NextResponse(csvContent, { headers });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function analyzePeakHours(
  orders: any[],
): Array<{ hour: number; count: number; percentage: number }> {
  const hourCounts: Record<number, number> = {};

  orders.forEach((order) => {
    const hour = new Date(order.deadlineTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const totalOrders = orders.length;
  return Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 peak hours
}

function analyzeTopProducts(
  orders: any[],
): Array<{
  productName: string;
  quantity: number;
  revenue: number;
  orders: number;
}> {
  const productStats: Record<
    string,
    { quantity: number; revenue: number; orders: Set<string> }
  > = {};

  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const productName = (item.product as any)?.name || "Unknown Product";
      if (!productStats[productName]) {
        productStats[productName] = {
          quantity: 0,
          revenue: 0,
          orders: new Set(),
        };
      }
      productStats[productName].quantity += item.quantity;
      productStats[productName].revenue += item.quantity * item.price;
      productStats[productName].orders.add(order._id);
    });
  });

  return Object.entries(productStats)
    .map(([productName, stats]) => ({
      productName,
      quantity: stats.quantity,
      revenue: stats.revenue,
      orders: stats.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 products
}

function analyzeStatusBreakdown(
  orders: any[],
): Array<{ status: string; count: number; percentage: number }> {
  const statusCounts: Record<string, number> = {
    BOOKED: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    MISSED: 0,
  };

  orders.forEach((order) => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  const totalOrders = orders.length;
  return Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function generateCSV(reportData: any): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Status",
    "Total Amount",
    "Deadline Time",
    "Booking Time",
    "Preparation Time (min)",
    "Items Count",
    "Created At",
  ];

  const csvRows = [headers.join(",")];

  // Add summary section
  csvRows.push("");
  csvRows.push("SUMMARY");
  csvRows.push(`Total Orders,${reportData.summary.totalOrders}`);
  csvRows.push(`Completed Orders,${reportData.summary.completedOrders}`);
  csvRows.push(`Cancelled Orders,${reportData.summary.cancelledOrders}`);
  csvRows.push(`Missed Orders,${reportData.summary.missedOrders}`);
  csvRows.push(`Pending Orders,${reportData.summary.pendingOrders}`);
  csvRows.push(`Total Revenue,$${reportData.summary.totalRevenue.toFixed(2)}`);
  csvRows.push(
    `Average Order Value,$${reportData.summary.avgOrderValue.toFixed(2)}`,
  );
  csvRows.push("");

  // Add detailed orders
  csvRows.push("DETAILED ORDERS");
  csvRows.push(headers.join(","));

  reportData.orders.forEach((order: any) => {
    const row = [
      order.orderId,
      `"${order.customerName}"`,
      `"${order.customerEmail}"`,
      `"${order.customerPhone}"`,
      order.status,
      order.totalAmount.toFixed(2),
      new Date(order.deadlineTime).toLocaleString(),
      new Date(order.bookingTime).toLocaleString(),
      order.preparationTime,
      order.items.length,
      new Date(order.createdAt).toLocaleString(),
    ];
    csvRows.push(row.join(","));
  });

  // Add peak hours
  csvRows.push("");
  csvRows.push("PEAK HOURS");
  csvRows.push("Hour,Count,Percentage");
  reportData.peakHours.forEach((peak: any) => {
    csvRows.push(`${peak.hour},${peak.count},${peak.percentage}%`);
  });

  // Add top products
  csvRows.push("");
  csvRows.push("TOP PRODUCTS");
  csvRows.push("Product Name,Quantity Sold,Revenue,Number of Orders");
  reportData.topProducts.forEach((product: any) => {
    csvRows.push(
      `"${product.productName}",${product.quantity},${product.revenue.toFixed(2)},${product.orders}`,
    );
  });

  return csvRows.join("\n");
}
