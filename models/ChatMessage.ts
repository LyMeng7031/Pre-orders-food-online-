import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true, trim: true },
  messageType: {
    type: String,
    enum: ["TEXT", "IMAGE", "ORDER_UPDATE", "SYSTEM"],
    default: "TEXT",
  },
  // For order-related messages
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  relatedDeadlineOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeadlineOrder",
  },
  // For image messages
  imageUrl: String,
  imageName: String,
  // Read status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
