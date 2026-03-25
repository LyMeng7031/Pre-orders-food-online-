import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import mongoose from "mongoose";
import { createNotificationFromTemplate } from "@/lib/notifications";

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
      recipient,
      content,
      messageType = "TEXT",
      relatedOrder,
      relatedDeadlineOrder,
      imageUrl,
    } = body;

    // Validate required fields
    if (!recipient || !content) {
      return NextResponse.json(
        { error: "Recipient and content are required" },
        { status: 400 },
      );
    }

    // Check if users can communicate
    const senderUser = await User.findById(decoded.userId);
    const recipientUser = await User.findById(recipient);

    if (!senderUser || !recipientUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Business rules for chat
    const canCommunicate =
      // Customer can chat with restaurant owner (if they have orders)
      (senderUser.role === "CUSTOMER" && recipientUser.role === "OWNER") ||
      // Restaurant owner can chat with customer (if they have orders)
      (senderUser.role === "OWNER" && recipientUser.role === "CUSTOMER") ||
      // Admin can chat with anyone
      senderUser.role === "ADMIN";

    if (!canCommunicate) {
      return NextResponse.json(
        { error: "Cannot start chat with this user" },
        { status: 403 },
      );
    }

    // Create chat message
    const chatMessage = new ChatMessage({
      sender: decoded.userId,
      recipient,
      content,
      messageType,
      relatedOrder,
      relatedDeadlineOrder,
      imageUrl,
      imageName: imageUrl ? `Image_${Date.now()}` : undefined,
    });

    await chatMessage.save();

    // Get recipient details for notification
    const recipientName = recipientUser.name;
    const senderName = senderUser.name;

    // Send notification to recipient about new message
    await createNotificationFromTemplate(
      "newChatMessage",
      recipient,
      decoded.userId,
      chatMessage._id.toString(),
      senderName,
      recipientName,
      content,
    );

    // Populate sender and recipient info for response
    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate("sender", "name role")
      .populate("recipient", "name role");

    return NextResponse.json({
      message: "Message sent successfully",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("withUser");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query for chat conversations
    const query: any = {
      $or: [
        { sender: decoded.userId, recipient: otherUserId },
        { recipient: decoded.userId, sender: otherUserId },
      ],
    };

    // If no specific user, get all conversations for current user
    if (!otherUserId) {
      query.$or = [{ sender: decoded.userId }, { recipient: decoded.userId }];
    }

    // Fetch messages with pagination
    const messages = await ChatMessage.find(query)
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get unread count
    const unreadCount = await ChatMessage.countDocuments({
      recipient: decoded.userId,
      isRead: false,
    });

    // Get unique conversation partners
    let conversationPartners;
    try {
      conversationPartners = await ChatMessage.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(decoded.userId) },
              { recipient: new mongoose.Types.ObjectId(decoded.userId) },
            ],
          },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: {
                  $eq: ["$sender", new mongoose.Types.ObjectId(decoded.userId)],
                },
                then: "$recipient",
                else: "$sender",
              },
            },
          },
        },
        {
          $sort: { lastMessage: -1 },
        },
      ]);
    } catch (aggregateError) {
      console.error("Aggregation error:", aggregateError);
      // Fallback to simple query if aggregation fails
      const sentMessages = await ChatMessage.find({ sender: decoded.userId })
        .populate("recipient", "name role")
        .sort({ createdAt: -1 });

      const receivedMessages = await ChatMessage.find({
        recipient: decoded.userId,
      })
        .populate("sender", "name role")
        .sort({ createdAt: -1 });

      const allMessages = [...sentMessages, ...receivedMessages];

      // Create unique partners list
      const partnersMap = new Map();
      allMessages.forEach((msg) => {
        const partnerId =
          msg.sender._id === decoded.userId
            ? msg.recipient._id
            : msg.sender._id;
        const partner =
          msg.sender._id === decoded.userId ? msg.recipient : msg.sender;

        if (!partnersMap.has(partnerId)) {
          partnersMap.set(partnerId, {
            _id: partnerId,
            name: partner.name,
            role: partner.role,
            lastMessage: msg.createdAt,
            unreadCount: 0,
          });
        }
      });

      // Count unread messages for each partner
      for (const [partnerId, partner] of partnersMap) {
        const unreadCount = allMessages.filter(
          (msg) => msg.recipient._id === partnerId && !msg.isRead,
        ).length;
        partner.unreadCount = unreadCount;
      }

      conversationPartners = Array.from(partnersMap.values());
    }

    return NextResponse.json({
      messages,
      conversationPartners,
      unreadCount,
      currentPage: page,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
