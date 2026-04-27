"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Search,
} from "lucide-react";
import Button, { Input } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
  specialInstructions: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  deliveryAddress: string;
  deliveryPhone: string;
  orderNotes?: string;
  paymentMethod: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_ICONS = {
  PENDING: AlertCircle,
  CONFIRMED: Clock,
  PREPARING: Package,
  READY: CheckCircle,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination(data.pagination);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data.order : order)),
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getStatusIcon = (status: string) => {
    const IconComponent =
      STATUS_ICONS[status as keyof typeof STATUS_ICONS] || AlertCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Orders Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 text-gray-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-black">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => viewOrderDetails(order)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    role="button"
                  >
                    <td className="px-6 py-4 font-medium text-blue-600 group-hover:underline">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Order {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={closeOrderModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Customer Info
                  </h3>
                  <div className="space-y-2 text-sm text-black">
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer.name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.customer.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-sm text-black">
                    <p>
                      <strong>Method:</strong> {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <div className="pt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border">
                <h3 className="font-bold mb-4 text-gray-900">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm text-black"
                    >
                      <div>
                        <span className="font-semibold text-gray-700">
                          {item.quantity}x
                        </span>{" "}
                        {item.product?.name || "Unknown Product"}
                      </div>
                      <span className="font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Grand Total</span>
                  <span className="text-xl font-black text-blue-600">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="mt-8 flex gap-3 flex-wrap border-t pt-6">
                {selectedOrder.status === "PENDING" && (
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "CONFIRMED")
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Confirm Order
                  </Button>
                )}
                {selectedOrder.status === "CONFIRMED" && (
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "PREPARING")
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Start Preparing
                  </Button>
                )}
                {selectedOrder.status === "PREPARING" && (
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "READY")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark as Ready
                  </Button>
                )}
                {selectedOrder.status === "READY" && (
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "COMPLETED")
                    }
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    Mark Completed
                  </Button>
                )}
                {(selectedOrder.status === "PENDING" ||
                  selectedOrder.status === "CONFIRMED") && (
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "CANCELLED")
                    }
                    className="ml-auto px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
