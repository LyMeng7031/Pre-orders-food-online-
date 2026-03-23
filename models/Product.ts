// models/Product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ["MEALS", "DRINKS", "SNACKS", "DESSERTS", "APPETIZERS"],
    required: true,
  },
  image: { type: String },
  preparationTime: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  spicyLevel: { type: Number, default: 0, min: 0, max: 5 },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
