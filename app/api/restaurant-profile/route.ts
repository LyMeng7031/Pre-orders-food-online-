import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Get restaurant ID from URL params
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("id");

    await mongoose.connect(process.env.MONGODB_URI || "");

    if (restaurantId) {
      // Public view - get specific restaurant profile
      const restaurant = await User.findById(restaurantId)
        .select("-password")
        .lean();

      if (!restaurant || restaurant.role !== "OWNER") {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 },
        );
      }

      // Return public profile data
      return NextResponse.json({
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          restaurantName: restaurant.restaurantName,
          restaurantDescription: restaurant.restaurantDescription,
          restaurantImage: restaurant.restaurantImage,
          cuisine: restaurant.cuisine,
          openingHours: restaurant.openingHours,
          deliveryRadius: restaurant.deliveryRadius,
          minOrder: restaurant.minOrder,
          isApproved: restaurant.isApproved,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt,
        },
      });
    } else {
      // Authenticated owner view - requires token
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const restaurant = await User.findById(decoded.userId)
        .select("-password")
        .lean();

      if (!restaurant || restaurant.role !== "OWNER") {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          restaurantName: restaurant.restaurantName,
          restaurantDescription: restaurant.restaurantDescription,
          restaurantImage: restaurant.restaurantImage,
          backgroundImage: restaurant.backgroundImage,
          cuisine: restaurant.cuisine,
          openingHours: restaurant.openingHours,
          deliveryRadius: restaurant.deliveryRadius,
          minOrder: restaurant.minOrder,
          isApproved: restaurant.isApproved,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    console.log("🔍 Auth header received:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ No auth header or invalid format");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔍 Token extracted:", token ? "Token exists" : "No token"); // Debug log

    const decoded = verifyToken(token);
    console.log("🔍 Token verification result:", decoded ? "Valid" : "Invalid"); // Debug log

    if (!decoded) {
      console.error("❌ Token verification failed");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    const body = await request.json();
    const {
      name,
      email,
      phone,
      restaurantName,
      restaurantDescription,
      restaurantImage,
      backgroundImage,
      cuisine,
      openingHours,
      deliveryRadius,
      minOrder,
    } = body;

    // Find the restaurant owner
    const restaurant = await User.findById(decoded.userId);
    if (!restaurant || restaurant.role !== "OWNER") {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // Validate required fields
    if (!name || !email || !restaurantName) {
      return NextResponse.json(
        { error: "Name, email, and restaurant name are required" },
        { status: 400 },
      );
    }

    // Update restaurant profile
    const updatedRestaurant = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          name,
          email,
          phone,
          restaurantName,
          restaurantDescription,
          restaurantImage,
          backgroundImage,
          cuisine,
          openingHours,
          deliveryRadius,
          minOrder,
        },
      },
      { new: true, returnDocument: "after" },
    ).select("-password");

    return NextResponse.json({
      message: "Profile updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
