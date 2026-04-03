import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import ChatMessage from "@/models/ChatMessage";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params to get the conversation ID
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

    const userId = decoded.userId;
    const conversationId = id;

    // Get all messages between the current user and the conversation partner
    const messages = await ChatMessage.find({
      $or: [
        {
          $and: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(conversationId) },
          ],
        },
        {
          $and: [
            { sender: new mongoose.Types.ObjectId(conversationId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
        },
      ],
    })
      .populate("sender", "name email role profileImage restaurantName")
      .populate("recipient", "name email role profileImage restaurantName")
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
