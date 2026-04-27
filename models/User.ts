import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["CUSTOMER", "OWNER", "ADMIN"],
    default: "CUSTOMER",
  },
  phone: String,
  address: String,
  profileImage: String,
  // Restaurant specific fields
  restaurantName: String,
  restaurantDescription: String,
  restaurantImage: String,
  backgroundImage: String,
  cuisine: String,
  openingHours: String,
  deliveryRadius: { type: Number, default: 5 }, // in miles
  minOrder: { type: Number, default: 0 }, // minimum order amount

  // Approval status for restaurant owners
  isApproved: { type: Boolean, default: false },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
