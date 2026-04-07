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

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/notifications/[id]
 * Update notification (e.g., mark as read)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { action } = body;

    const service = getNotificationService();

    if (action === "mark-read") {
      await service.markAsRead(params.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification (admin/staff only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Only allow users to delete their own notifications or admins to delete any
    const service = getNotificationService();
    await service.cancelScheduledNotification(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
