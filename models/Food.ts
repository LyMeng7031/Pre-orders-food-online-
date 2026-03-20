// models/Food.ts
import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  ownerId: String,
});

export default mongoose.models.Food || mongoose.model("Food", FoodSchema);
