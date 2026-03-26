import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
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
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 },
      );
    }

    // Get all owners (excluding admins and customers)
    const owners = await User.find({ role: "OWNER" })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ owners });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
