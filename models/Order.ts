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
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }, // Store price at time of order
      specialInstructions: String,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ],
    default: "PENDING",
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "REFUNDED"],
    default: "PENDING",
  },
  deliveryAddress: { type: String, required: true },
  deliveryPhone: { type: String, required: true },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  orderNotes: { type: String },
  paymentMethod: {
    type: String,
    enum: ["CASH", "CARD", "ONLINE"],
    default: "CASH",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
