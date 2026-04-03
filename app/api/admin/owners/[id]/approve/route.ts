import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params to get the id
    const { id } = await params;

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

    // Get the owner to approve
    const owner = await User.findById(id);
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "User is not an owner" },
        { status: 400 },
      );
    }

    // Approve the owner
    const updatedOwner = await User.findByIdAndUpdate(
      id,
      {
        isApproved: true,
        approvalDate: new Date(),
        rejectionReason: undefined,
        updatedAt: new Date(),
      },
      { new: true, returnDocument: "after" },
    ).select("-password");

    return NextResponse.json({
      message: "Owner approved successfully",
      owner: updatedOwner,
    });
  } catch (error) {
    console.error("Error approving owner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
