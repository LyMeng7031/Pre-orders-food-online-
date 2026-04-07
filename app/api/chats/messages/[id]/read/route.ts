// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/auth";
// import ChatMessage from "@/models/ChatMessage";
// import mongoose from "mongoose";

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     // Await params to get the message ID
//     const { id } = await params;

//     // Verify authentication
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     await mongoose.connect(process.env.MONGODB_URI || "");

//     // Find the message
//     const message = await ChatMessage.findById(id);
//     if (!message) {
//       return NextResponse.json({ error: "Message not found" }, { status: 404 });
//     }

//     // Check if user is the recipient of this message
//     if (message.recipient.toString() !== decoded.userId) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     // Mark as read if not already read
//     if (!message.isRead) {
//       message.isRead = true;
//       message.readAt = new Date();
//       await message.save();
//     }

//     return NextResponse.json({
//       message: "Message marked as read",
//       message: message,
//     });
//   } catch (error) {
//     console.error("Error marking message as read:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }
