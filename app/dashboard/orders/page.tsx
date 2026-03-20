"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  return (
    <div>
      {orders.map((o: any) => (
        <div key={o._id}>
          {o.status} - ${o.total}
        </div>
      ))}
    </div>
  );
}
