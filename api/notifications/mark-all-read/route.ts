import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import NotificationService from "@/lib/notificationService";

// Initialize notification service
let notificationService: NotificationService;

function getNotificationService(): NotificationService {
  if (!notificationService) {
    const { Server } = require("socket.io");
    const http = require("http");
    const server = http.createServer();
    const io = new Server(server);
    notificationService = new NotificationService(io);
  }
  return notificationService;
}

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication using Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const service = getNotificationService();
    await service.markAllAsRead(decoded.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 },
    );
  }
}
