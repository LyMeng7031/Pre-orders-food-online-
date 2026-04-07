import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User"; // Keep existing User model for now
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

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("id");
    const type = searchParams.get("type") || "basic";

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    await mongoose.connect(process.env.MONGODB_URI || "");

    // Find the restaurant owner
    const owner = await User.findById(ownerId).select("-password");
    if (!owner) {
      return NextResponse.json(
        { error: "Restaurant owner not found" },
        { status: 404 },
      );
    }

    // Check if user is a restaurant owner
    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "User is not a restaurant owner" },
        { status: 403 },
      );
    }

    // Return different profile based on type
    let profile;
    if (type === "professional") {
      profile = {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        // Professional profile information
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
        // Professional specific fields
        professionalTitle: owner.professionalTitle || "",
        professionalExperience: owner.professionalExperience || "",
        professionalSkills: owner.professionalSkills || [],
        professionalEducation: owner.professionalEducation || [],
        professionalCertifications: owner.professionalCertifications || [],
        professionalLinkedIn: owner.professionalLinkedIn || "",
        professionalPortfolio: owner.professionalPortfolio || [],
        professionalHourlyRate: owner.professionalHourlyRate || 0,
        professionalAvailability: owner.professionalAvailability || "",
      };
    } else {
      // Basic restaurant profile (default)
      profile = {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
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
      };
    }

    return NextResponse.json({
      message: "Profile retrieved successfully",
      owner: profile,
    });
  } catch (error) {
    console.error("Error fetching owner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
