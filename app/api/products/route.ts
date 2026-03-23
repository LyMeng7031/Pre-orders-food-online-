import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user and verify role
    await mongoose.connect(process.env.MONGODB_URI || "");
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      preparationTime,
      spicyLevel,
      ingredients,
      allergens,
      image,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !preparationTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      preparationTime,
      spicyLevel: spicyLevel || 0,
      ingredients: ingredients || [],
      allergens: allergens || [],
      image: image || "",
      owner: user._id,
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user and verify role
    await mongoose.connect(process.env.MONGODB_URI || "");
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get products for this owner
    const products = await Product.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .populate("owner", "name email");

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
