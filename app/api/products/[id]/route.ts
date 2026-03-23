import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get product and verify ownership
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.owner.toString() !== user._id.toString()) {
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
      isAvailable,
    } = body;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(category && { category }),
        ...(preparationTime && { preparationTime }),
        ...(spicyLevel !== undefined && { spicyLevel }),
        ...(ingredients && { ingredients }),
        ...(allergens && { allergens }),
        ...(image !== undefined && { image }),
        ...(isAvailable !== undefined && { isAvailable }),
        updatedAt: new Date(),
      },
      { new: true },
    );

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get product and verify ownership
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.owner.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete product
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get product and verify ownership
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.owner.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
