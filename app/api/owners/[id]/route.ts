import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    const owner = await User.findById(params.id).select("-password");

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Not an owner" }, { status: 404 });
    }

    if (!owner.isActive) {
      return NextResponse.json(
        { error: "Owner account is not active" },
        { status: 404 },
      );
    }

    return NextResponse.json({ owner });
  } catch (error) {
    console.error("Error fetching owner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
