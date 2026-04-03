import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import ChatMessage from "@/models/ChatMessage";
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

    const body = await request.json();
    const { markAsRead } = body;

    if (!markAsRead) {
      return NextResponse.json(
        { error: "markAsRead is required" },
        { status: 400 },
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Find and update message
    const message = await ChatMessage.findByIdAndUpdate(
      id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true, returnDocument: "after" },
    );

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user has permission to mark this message as read
    if (message.recipient.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      message: "Message marked as read successfully",
      chatMessage: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
