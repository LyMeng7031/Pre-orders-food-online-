import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Connect to your database
    await connectDB();

    // Find the owner by ID
    const owner = await User.findById(id);

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Fetch products for this owner
    const products = await Product.find({
      owner: id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      owner,
      products,
    });
  } catch (error) {
    console.error("Error fetching owner products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
