// models/Order.ts
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }, // Store price at time of order
      specialInstructions: String,
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"],
    default: "PENDING",
  },
  pickupTime: { type: Date, required: true },
  orderDeadline: { type: Date, required: true },
  customerComments: String,
  preparationNotes: String,
  paymentMethod: {
    type: String,
    enum: ["CASH", "CARD", "ONLINE"],
    default: "CASH",
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "REFUNDED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
