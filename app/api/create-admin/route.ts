import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@restaurant.com" });
    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin account already exists",
        email: "admin@restaurant.com",
        password: "admin123",
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123");

    const admin = new User({
      name: "System Administrator",
      email: "admin@restaurant.com",
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true,
      isActive: true,
    });

    await admin.save();

    return NextResponse.json({
      message: "Admin account created successfully!",
      email: "admin@restaurant.com",
      password: "admin123",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 },
    );
  }
}
