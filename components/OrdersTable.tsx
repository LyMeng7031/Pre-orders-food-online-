"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket/client";

type Order = {
  id: number;
  customer: string;
  food: string;
  pickupTime: string;
  status: string;
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    socket.on("new-order", (data: Order) => {
      setOrders((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("new-order");
    };
  }, []);

  const updateStatus = (id: number, status: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-4">Live Orders</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Customer</th>
            <th className="p-2">Food</th>
            <th className="p-2">Pickup Time</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t text-center">
              <td className="p-2">{order.customer}</td>
              <td className="p-2">{order.food}</td>
              <td className="p-2">{order.pickupTime}</td>
              <td className="p-2">
                <span className="px-2 py-1 bg-gray-200 rounded">
                  {order.status}
                </span>
              </td>

              <td className="p-2 flex gap-2 justify-center">
                <button
                  onClick={() => updateStatus(order.id, "Preparing")}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Completed")}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Complete
                </button>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-gray-500 text-center">
                No orders yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
