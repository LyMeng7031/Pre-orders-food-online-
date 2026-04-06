import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get all available products (foods)
    const foods = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .select(
        "name description price category image preparationTime spicyLevel ingredients allergens",
      );

    return NextResponse.json({
      success: true,
      foods: foods.map((food) => ({
        _id: food._id,
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        preparationTime: food.preparationTime,
        spicyLevel: food.spicyLevel,
        ingredients: food.ingredients,
        allergens: food.allergens,
      })),
    });
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 },
    );
  }
}
