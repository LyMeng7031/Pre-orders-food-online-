import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // FIXED: params is now a Promise
) {
  try {
    // FIXED: You must 'await' the params to get the 'id'
    const { id } = await params;

    // Connect to your database
    await connectDB();

    // Find the owner by ID
    const owner = await User.findById(id);

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
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
