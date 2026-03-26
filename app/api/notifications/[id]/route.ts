import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

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

    await mongoose.connect(process.env.MONGODB_URI || "");

    const body = await request.json();
    const { markAsRead, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { recipient: decoded.userId, isRead: false },
        {
          isRead: true,
          readAt: new Date(),
        },
      );

      return NextResponse.json({
        message: "All notifications marked as read",
      });
    }

    if (markAsRead) {
      // Mark specific notification as read
      const notification = await Notification.findByIdAndUpdate(
        id,
        {
          isRead: true,
          readAt: new Date(),
        },
        { new: true },
      );

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 },
        );
      }

      // Check if user owns this notification
      if (notification.recipient.toString() !== decoded.userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({
        message: "Notification marked as read",
        notification,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
