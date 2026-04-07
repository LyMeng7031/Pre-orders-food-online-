import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Create Product API Started ===");

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
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
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Get user and verify role
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Access denied - Owner role required" },
        { status: 403 },
      );
    }

    console.log("✅ User verified:", user.name, user.role);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("✅ Request body parsed:", body);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details:
            parseError instanceof Error ? parseError.message : "Invalid JSON",
        },
        { status: 400 },
      );
    }

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
    const missingFields = [];
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      missingFields.push("name");
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      missingFields.push("description");
    }
    if (
      price === undefined ||
      price === null ||
      isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      missingFields.push("price (must be a valid positive number)");
    }
    if (!category || typeof category !== "string") {
      missingFields.push("category");
    }
    if (
      preparationTime === undefined ||
      preparationTime === null ||
      isNaN(Number(preparationTime)) ||
      Number(preparationTime) < 1
    ) {
      missingFields.push("preparationTime (must be a valid positive number)");
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing or invalid required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate category enum
    const validCategories = [
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
    ];
    console.log(
      "Received category:",
      category,
      "Valid categories:",
      validCategories,
    );

    // Simple category validation - just ensure it exists
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    // Validate spicy level
    const spicyLevelNum = Number(spicyLevel) || 0;
    if (spicyLevelNum < 0 || spicyLevelNum > 5) {
      return NextResponse.json(
        { error: "Spicy level must be between 0 and 5" },
        { status: 400 },
      );
    }

    // Validate ingredients and allergens arrays
    const validatedIngredients = Array.isArray(ingredients) ? ingredients : [];
    const validatedAllergens = Array.isArray(allergens) ? allergens : [];

    // Create product
    try {
      console.log("🔨 Creating product...");

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim().toUpperCase(), // Convert to uppercase for database
        preparationTime: Number(preparationTime),
        spicyLevel: spicyLevelNum,
        ingredients: validatedIngredients,
        allergens: validatedAllergens,
        image: (typeof image === "string" ? image.trim() : "") || "",
        owner: user._id,
      };

      console.log("📦 Product data to create:", productData);

      const product = await Product.create(productData);

      console.log("✅ Product created successfully:", product._id);

      return NextResponse.json(
        {
          message: "Product created successfully",
          product: {
            ...product.toObject(),
            id: product._id,
          },
        },
        { status: 201 },
      );
    } catch (createError) {
      console.error("❌ Product creation error:", createError);

      // Log detailed error information
      if (createError instanceof Error) {
        console.error("Error name:", createError.name);
        console.error("Error message:", createError.message);
        console.error("Error stack:", createError.stack);
      }

      if (
        createError instanceof Error &&
        createError.message.includes("duplicate key")
      ) {
        return NextResponse.json(
          { error: "A product with this name already exists" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create product in database",
          details:
            createError instanceof Error
              ? createError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/products:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Get user and verify role
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    // Build query
    const query: any = { owner: user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.isAvailable = status === "available";
    }

    // Get products with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
