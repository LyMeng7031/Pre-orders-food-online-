import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import mongoose from "mongoose";
import { createNotificationFromTemplate } from "@/lib/notifications";

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

    const userId = decoded.userId;

    // Get all conversations for the current user
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$recipient", new mongoose.Types.ObjectId(userId)],
                    },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      {
        $unwind: "$participant",
      },
      {
        $project: {
          _id: 1,
          participant: {
            _id: "$participant._id",
            name: "$participant.name",
            email: "$participant.email",
            role: "$participant.role",
            profileImage: "$participant.profileImage",
            restaurantName: "$participant.restaurantName",
          },
          lastMessage: {
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
            isRead: "$lastMessage.isRead",
          },
          unreadCount: 1,
          relatedOrder: "$lastMessage.relatedOrder",
          relatedDeadlineOrder: "$lastMessage.relatedDeadlineOrder",
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
      recipientId,
      content,
      messageType = "TEXT",
      relatedOrder,
      relatedDeadlineOrder,
      imageUrl,
      imageName,
    } = body;

    // Validate required fields
    if (!recipientId || !content) {
      return NextResponse.json(
        { error: "Recipient ID and content are required" },
        { status: 400 },
      );
    }

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 },
      );
    }

    // Create message
    const message = new ChatMessage({
      sender: decoded.userId,
      recipient: recipientId,
      content,
      messageType,
      relatedOrder,
      relatedDeadlineOrder,
      imageUrl,
      imageName,
    });

    await message.save();

    // Populate sender details for response
    await message.populate(
      "sender",
      "name email role profileImage restaurantName",
    );

    // Send notification to recipient
    await createNotificationFromTemplate(
      "newChatMessage",
      recipientId,
      decoded.userId,
      message._id.toString(),
      content,
      recipient.name,
    );

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
