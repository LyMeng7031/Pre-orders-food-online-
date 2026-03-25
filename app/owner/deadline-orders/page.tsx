"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  User,
  ArrowLeft,
  Filter,
} from "lucide-react";

interface DeadlineOrder {
  _id: string;
  items: Array<{
    product: {
      name: string;
      image?: string;
      price: number;
    };
    quantity: number;
    price: number;
    specialInstructions: string;
  }>;
  totalAmount: number;
  status: string;
  deadlineTime: string;
  bookingTime: string;
  preparationTime: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deadlineWarningSent: boolean;
  createdAt: string;
}

export default function OwnerDeadlineOrdersPage() {
  const [orders, setOrders] = useState<DeadlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "OWNER") {
      router.push(parsedUser.role === "ADMIN" ? "/admin" : "/customer");
      return;
    }

    if (!parsedUser.isApproved) {
      router.push("/login?message=Your account is pending admin approval.");
      return;
    }

    setUser(parsedUser);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/deadline-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch deadline orders");
      }
    } catch (error) {
      console.error("Error fetching deadline orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/deadline-orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("An error occurred while updating the order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-orange-100 text-orange-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "MISSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <Calendar className="w-4 h-4" />;
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" />;
      case "PREPARING":
        return <Clock className="w-4 h-4" />;
      case "READY":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "MISSED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (deadlineTime: string, status: string) => {
    return (
      new Date(deadlineTime) < new Date() &&
      !["COMPLETED", "CANCELLED"].includes(status)
    );
  };

  const getTimeUntilDeadline = (deadlineTime: string) => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs < 0) return "Overdue";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const filteredOrders = orders.filter(
    (order) => filterStatus === "ALL" || order.status === filterStatus,
  );

  const urgentOrders = orders.filter(
    (order) =>
      isOverdue(order.deadlineTime, order.status) ||
      (new Date(order.deadlineTime).getTime() - new Date().getTime() <
        2 * 60 * 60 * 1000 &&
        !["COMPLETED", "CANCELLED"].includes(order.status)),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deadline orders...</p>
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Deadline Orders
                </h1>
                <p className="text-gray-600">
                  {urgentOrders.length > 0 && (
                    <span className="text-red-600 font-medium">
                      ⚠️ {urgentOrders.length} urgent order
                      {urgentOrders.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {urgentOrders.length === 0 && <span>No urgent orders</span>}
                </p>
              </div>
            </div>

            {urgentOrders.length > 0 && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {urgentOrders.length} Urgent
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            {[
              "ALL",
              "BOOKED",
              "CONFIRMED",
              "PREPARING",
              "READY",
              "COMPLETED",
              "CANCELLED",
              "MISSED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {filterStatus === "ALL"
                ? "No deadline orders yet"
                : `No ${filterStatus.toLowerCase()} orders`}
            </h2>
            <p className="text-gray-600">
              Deadline orders will appear here when customers schedule them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  isOverdue(order.deadlineTime, order.status)
                    ? "border-red-500"
                    : order.status === "READY"
                      ? "border-green-500"
                      : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order from {order.customerName}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(order.bookingTime).toLocaleDateString()} at{" "}
                      {new Date(order.bookingTime).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        Deadline:{" "}
                        {new Date(order.deadlineTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Prep Time: ~{order.preparationTime} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Contact: {order.customerPhone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      ${order.totalAmount.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        isOverdue(order.deadlineTime, order.status)
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {isOverdue(order.deadlineTime, order.status)
                        ? "OVERDUE"
                        : `Time left: ${getTimeUntilDeadline(order.deadlineTime)}`}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Order Items:
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs">🍽️</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">
                              {item.product.name}
                            </span>
                            <span className="text-gray-600 ml-2">
                              x{item.quantity}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-gray-500 text-xs mt-1">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.customerEmail && (
                      <span>Email: {order.customerEmail}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {order.status === "BOOKED" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "CONFIRMED")
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Confirm Order
                      </button>
                    )}

                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "PREPARING")
                        }
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => updateOrderStatus(order._id, "READY")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === "READY" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "COMPLETED")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Mark Completed
                      </button>
                    )}

                    {["BOOKED", "CONFIRMED"].includes(order.status) && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "CANCELLED")
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
