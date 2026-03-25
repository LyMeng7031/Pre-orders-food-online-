import mongoose from "mongoose";

const DeadlineOrderSchema = new mongoose.Schema({
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
      price: { type: Number, required: true }, // Price at time of booking
      specialInstructions: String,
    },
  ],
  totalAmount: { type: Number, required: true },

  // Deadline/Booking Information
  deadlineTime: { type: Date, required: true }, // When customer wants to pick up
  bookingTime: { type: Date, required: true }, // When order was placed
  preparationTime: { type: Number, required: true }, // Estimated preparation time in minutes

  // Status
  status: {
    type: String,
    enum: [
      "BOOKED",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
      "MISSED",
    ],
    default: "BOOKED",
  },

  // Customer Information
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },

  // Notifications
  deadlineWarningSent: { type: Boolean, default: false },
  deadlineWarningTime: { type: Date }, // When warning was sent

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.DeadlineOrder ||
  mongoose.model("DeadlineOrder", DeadlineOrderSchema);
