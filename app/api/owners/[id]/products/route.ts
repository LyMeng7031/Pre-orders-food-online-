import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    // Verify owner exists and is active
    const owner = await User.findById(params.id);
    if (!owner || owner.role !== "OWNER" || !owner.isActive) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get available products for this owner
    const products = await Product.find({
      owner: params.id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching owner products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
