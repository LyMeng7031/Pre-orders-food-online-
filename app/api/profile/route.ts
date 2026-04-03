import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  // For now (simple), get first OWNER
  const user = await User.findOne({ role: "OWNER" });

  return Response.json(user);
}

export async function PUT(req: Request) {
  await connectDB();

  const data = await req.json();
  const user = await User.findOneAndUpdate(
    { role: "OWNER" },
    { $set: data },
    { new: true },
  );
  return Response.json(user);
}
