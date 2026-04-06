import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    // Check if restaurant owner exists
    const restaurantOwner = await User.findById(params.id);
    if (!restaurantOwner || restaurantOwner.role !== "OWNER") {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // Fetch products for this restaurant owner
    const products = await Product.find({
      owner: params.id,
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
        _id: restaurantOwner._id,
        name: restaurantOwner.restaurantName || restaurantOwner.name,
        description: restaurantOwner.restaurantDescription || "",
        image: restaurantOwner.restaurantImage || "",
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
