// app/api/orders/route.ts
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req: Request) {
  await connectDB();

  const data = await req.json();

  const order = await Order.create(data);

  return Response.json(order);
}
