// app/api/auth/login/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password: loginPassword } = await req.json();

    const user = await User.findOne({ email });

    // 1. Specific Email Error (401 Unauthorized)
    if (!user) {
      return Response.json(
        { error: "User not found with this email" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);

    // 2. Specific Password Error (401 Unauthorized)
    if (!isMatch) {
      return Response.json(
        { error: "Wrong password. Please try again." },
        { status: 401 },
      );
    }

    // 3. Deactivated Account (403 Forbidden)
    if (!user.isActive) {
      return Response.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 403 },
      );
    }

    // 4. Approval Check (403 Forbidden)
    if (user.role === "OWNER" && !user.isApproved) {
      return Response.json(
        {
          error:
            "Your restaurant account is pending approval. Please wait for admin approval.",
          needsApproval: true,
        },
        { status: 403 },
      );
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
    );

    // Return user without password
    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;

    return Response.json({ token, user: userWithoutPassword }, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json(
      { error: "An unexpected server error occurred." },
      { status: 500 },
    );
  }
}
