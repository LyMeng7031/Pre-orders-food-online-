import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Notification from "@/models/Notification";
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

    // Try to connect to database
    try {
      await mongoose.connect(process.env.MONGODB_URI || "");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      // Return empty results if database fails
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        hasMore: false,
      });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = { recipient: decoded.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Fetch notifications with error handling
    let notifications = [];
    let unreadCount = 0;

    try {
      // Check if Notification model exists
      const NotificationModel = mongoose.models.Notification;
      if (!NotificationModel) {
        console.log("Notification model not found, returning empty results");
        return NextResponse.json({
          notifications: [],
          unreadCount: 0,
          hasMore: false,
        });
      }

      notifications =
        (await NotificationModel.find(query)
          .populate("sender", "name restaurantName")
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)) || [];

      // Get unread count
      unreadCount =
        (await NotificationModel.countDocuments({
          recipient: decoded.userId,
          isRead: false,
        })) || 0;
    } catch (dbError) {
      console.error("Database error fetching notifications:", dbError);
      // Return empty results if database fails
      notifications = [];
      unreadCount = 0;
    }

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error", notifications: [], unreadCount: 0 },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (for creating notifications)
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
      recipient,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority = "MEDIUM",
      actionUrl,
      metadata,
    } = body;

    // Validate required fields
    if (!recipient || !type || !title || !message) {
      return NextResponse.json(
        {
          error: "recipient, type, title, and message are required",
        },
        { status: 400 },
      );
    }

    // Create notification
    const notification = new Notification({
      recipient,
      sender: decoded.userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      actionUrl,
      metadata,
    });

    await notification.save();

    return NextResponse.json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
