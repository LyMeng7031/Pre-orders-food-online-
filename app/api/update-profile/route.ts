import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

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
      professionalTitle,
      professionalExperience,
      professionalSkills,
      professionalEducation,
      professionalCertifications,
      professionalLinkedIn,
      professionalPortfolio,
      professionalHourlyRate,
      professionalAvailability,
    } = body;

    // Find the user to update
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a restaurant owner
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can update profiles" },
        { status: 403 },
      );
    }

    // Update user profile with all information
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
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
          professionalTitle,
          professionalExperience,
          professionalSkills,
          professionalEducation,
          professionalCertifications,
          professionalLinkedIn,
          professionalPortfolio,
          professionalHourlyRate,
          professionalAvailability,
        },
        $setOnInsert: { isApproved: false }, // Reset approval status when profile is updated
      },
      { new: true, returnDocument: "after" },
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
