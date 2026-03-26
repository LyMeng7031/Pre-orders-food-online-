import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
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

    // Check if user is a restaurant owner
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can create profiles" },
        { status: 403 },
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    const body = await request.json();
    const {
      name,
      email,
      phone,
      restaurantName,
      restaurantDescription,
      cuisine,
      openingHours,
      deliveryRadius,
      minOrder,
      restaurantImage,
    } = body;

    // Validate required fields
    if (!name || !email || !restaurantName) {
      return NextResponse.json(
        { error: "Name, email, and restaurant name are required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: "OWNER",
      _id: { $ne: user._id }, // Exclude current user
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Update user profile with restaurant information
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          restaurantName,
          restaurantDescription,
          cuisine,
          openingHours,
          deliveryRadius,
          minOrder,
          restaurantImage,
        },
        $setOnInsert: { isApproved: false }, // Reset approval status when profile is updated
      },
      { new: true, returnDocument: "after" },
    ).select("-password");

    return NextResponse.json({
      message: "Profile created successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error creating restaurant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
