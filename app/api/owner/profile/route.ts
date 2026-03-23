import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

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

    // Get user
    await mongoose.connect(process.env.MONGODB_URI || "");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        restaurantName: user.restaurantName,
        restaurantDescription: user.restaurantDescription,
        cuisine: user.cuisine,
        openingHours: user.openingHours,
        deliveryRadius: user.deliveryRadius,
        minOrder: user.minOrder,
        profileImage: user.profileImage,
        restaurantImage: user.restaurantImage,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user
    await mongoose.connect(process.env.MONGODB_URI || "");
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      restaurantName,
      restaurantDescription,
      cuisine,
      openingHours,
      deliveryRadius,
      minOrder,
      profileImage,
      restaurantImage,
    } = body;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
        restaurantName: restaurantName || user.restaurantName,
        restaurantDescription:
          restaurantDescription || user.restaurantDescription,
        cuisine: cuisine || user.cuisine,
        openingHours: openingHours || user.openingHours,
        deliveryRadius:
          deliveryRadius !== undefined ? deliveryRadius : user.deliveryRadius,
        minOrder: minOrder !== undefined ? minOrder : user.minOrder,
        profileImage:
          profileImage !== undefined ? profileImage : user.profileImage,
        restaurantImage:
          restaurantImage !== undefined
            ? restaurantImage
            : user.restaurantImage,
        updatedAt: new Date(),
      },
      { new: true },
    ).select("-password");

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
