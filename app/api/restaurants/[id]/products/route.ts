import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Restaurant from "@/models/Restaurant";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(params.id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // Fetch products for this restaurant
    const products = await Product.find({
      restaurant: params.id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        category: product.category,
        isAvailable: product.isAvailable,
        preparationTime: product.preparationTime,
        spicyLevel: product.spicyLevel,
        ingredients: product.ingredients,
        allergens: product.allergens,
      })),
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description,
        image: restaurant.image,
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
