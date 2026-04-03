import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(
  token: string,
): { userId: string; role?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
  } catch (error) {
    return null;
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "CUSTOMER" | "OWNER" = "CUSTOMER",
) {
  const hashedPassword = await hashPassword(password);
  return User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}
