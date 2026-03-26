// app/api/auth/login/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();

  const { email, password: loginPassword } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return Response.json({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(loginPassword, user.password);

  if (!isMatch) {
    return Response.json({ error: "Wrong password" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET!,
  );

  // Return user without password
  const userObj = user.toObject();
  const { password: userPassword, ...userWithoutPassword } = userObj;

  return Response.json({ token, user: userWithoutPassword });
}
