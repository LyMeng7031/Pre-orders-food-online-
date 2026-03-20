import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getIO } from "@/lib/socket/server";

// Optional: define the shape of your Order response
type Data = {
  message?: string;
  order?: any; // You can replace 'any' with your Order type if you have one
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const order = await Order.create(req.body);

      // Send notification to dashboard
      const io = getIO();
      io.emit("new-order", {
        message: "New order received",
        order,
      });

      return res.status(200).json({ order });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
