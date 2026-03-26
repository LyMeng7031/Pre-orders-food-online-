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

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Get all restaurant owners with their profiles
    const owners = await User.find({
      role: "OWNER",
      isApproved: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Restaurant owners retrieved successfully",
      owners: owners.map((owner) => ({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        restaurantName: owner.restaurantName,
        restaurantDescription: owner.restaurantDescription,
        restaurantImage: owner.restaurantImage,
        cuisine: owner.cuisine,
        openingHours: owner.openingHours,
        deliveryRadius: owner.deliveryRadius,
        minOrder: owner.minOrder,
        isApproved: owner.isApproved,
        createdAt: owner.createdAt,
        profileImage: owner.profileImage,
      })),
    });
  } catch (error) {
    console.error("Error fetching restaurant owners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
