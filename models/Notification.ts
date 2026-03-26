import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "ORDER_PLACED", // To owner: New order received
      "ORDER_STATUS", // To customer: Order status updated
      "ORDER_CANCELLED", // To both: Order cancelled
      "OWNER_APPROVED", // To owner: Account approved
      "OWNER_REJECTED", // To owner: Account rejected
      "PAYMENT_RECEIVED", // To owner: Payment received
      "DELIVERY_UPDATE", // To customer: Delivery update
      "SYSTEM_UPDATE", // General system notifications
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Related order, user, etc.
  relatedType: { type: String }, // "order", "user", "product"
  isRead: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM",
  },
  actionUrl: { type: String }, // URL to redirect when clicked
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date },
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
