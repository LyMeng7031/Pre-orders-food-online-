import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG: Create Product API Started ===");

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No auth header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("❌ Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("✅ Auth verified for user:", decoded.userId);

    // Connect to database
    try {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("✅ Database connected");
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role !== "OWNER") {
      console.log("❌ Not owner role:", user.role);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("✅ User verified:", user.name, user.role);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("✅ Request body parsed:", body);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, description, price, category, preparationTime } = body;
    console.log("📝 Product data:", {
      name,
      description,
      price,
      category,
      preparationTime,
    });

    // Basic validation
    if (!name || !description || !price || !category || !preparationTime) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Try to import Product model
    let Product;
    try {
      Product = require("@/models/Product").default;
      console.log("✅ Product model imported");
    } catch (importError) {
      console.error("❌ Product model import error:", importError);
      return NextResponse.json(
        { error: "Model import failed" },
        { status: 500 },
      );
    }

    // Create product with minimal data first
    try {
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        preparationTime: Number(preparationTime),
        owner: user._id,
      };

      console.log("🔨 Creating product with data:", productData);

      const product = await Product.create(productData);
      console.log("✅ Product created successfully:", product._id);

      return NextResponse.json(
        {
          message: "Product created successfully",
          product: {
            id: product._id,
            name: product.name,
            category: product.category,
          },
        },
        { status: 201 },
      );
    } catch (createError) {
      console.error("❌ Product creation error:", createError);
      return NextResponse.json(
        {
          error: "Failed to create product",
          details:
            createError instanceof Error
              ? createError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
