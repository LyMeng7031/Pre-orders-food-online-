// models/MenuItem.ts
import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      "MAIN_COURSE",
      "APPETIZERS",
      "BEVERAGES",
      "DESSERTS",
      "SOUPS",
      "SALADS",
      "SANDWICHES",
      "PASTA",
      "PIZZA",
      "BREAKFAST",
    ],
  },
  image: String,
  isAvailable: { type: Boolean, default: true },
  preparationTime: Number, // in minutes
  ingredients: [String],
  allergens: [String],
  spicyLevel: { type: Number, min: 0, max: 5, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.MenuItem ||
  mongoose.model("MenuItem", MenuItemSchema);
