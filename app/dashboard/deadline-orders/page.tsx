"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Download,
  ChevronLeft,
  Eye,
  Edit,
  Timer,
  Users,
  Package,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Button, { Input, Select } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/Modal";
import CalendarView from "@/components/CalendarView";

interface DeadlineOrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
  specialInstructions: string;
}

interface DeadlineOrder {
  _id: string;
  items: DeadlineOrderItem[];
  totalAmount: number;
  status:
    | "BOOKED"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED"
    | "MISSED";
  deadlineTime: string;
  bookingTime: string;
  preparationTime: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deadlineWarningSent: boolean;
  deadlineWarningTime?: string;
  customerId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface DeadlineStats {
  totalOrders: number;
  urgentOrders: number;
  upcomingOrders: number;
  overdueOrders: number;
  todayRevenue: number;
  weeklyRevenue: number;
  completedToday: number;
  avgPreparationTime: number;
}

const STATUS_COLORS = {
  BOOKED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  MISSED: "bg-red-200 text-red-900",
};

const URGENCY_COLORS = {
  URGENT: "bg-red-100 text-red-800 border-red-300",
  VERY_URGENT: "bg-red-200 text-red-900 border-red-400",
  UPCOMING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  SAFE: "bg-green-100 text-green-800 border-green-300",
};

export default function DeadlineOrdersPage() {
  const [orders, setOrders] = useState<DeadlineOrder[]>([]);
  const [stats, setStats] = useState<DeadlineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedOrder, setSelectedOrder] = useState<DeadlineOrder | null>(
    null,
  );
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchDeadlineOrders();
    fetchStats();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDeadlineOrders();
        fetchStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDeadlineOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedUrgency && { urgency: selectedUrgency }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      });

      const response = await fetch(`/api/deadline-orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);

        // Check for urgent orders and create notifications
        const urgentOrders = data.orders.filter((order: DeadlineOrder) =>
          isOrderUrgent(order.deadlineTime),
        );

        if (urgentOrders.length > 0) {
          setNotifications([
            `${urgentOrders.length} urgent order(s) need attention!`,
            ...notifications.slice(0, 2), // Keep only 3 notifications
          ]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch deadline orders");
      }
    } catch (error) {
      console.error("Error fetching deadline orders:", error);
      setError("Failed to load deadline orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/deadline-orders/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const isOrderUrgent = (deadlineTime: string): boolean => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 2 && hoursDiff > 0;
  };

  const isOrderVeryUrgent = (deadlineTime: string): boolean => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 1 && hoursDiff > 0;
  };

  const isOrderOverdue = (deadlineTime: string): boolean => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    return deadline < now;
  };

  const getUrgencyLevel = (
    deadlineTime: string,
  ): "VERY_URGENT" | "URGENT" | "UPCOMING" | "SAFE" => {
    if (isOrderVeryUrgent(deadlineTime)) return "VERY_URGENT";
    if (isOrderUrgent(deadlineTime)) return "URGENT";
    if (isOrderOverdue(deadlineTime)) return "URGENT";
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 6 ? "UPCOMING" : "SAFE";
  };

  const getCountdown = (deadlineTime: string): string => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const timeDiff = deadline.getTime() - now.getTime();

    if (timeDiff < 0) {
      return "Overdue";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/deadline-orders/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(
          orders.map((order) => (order._id === orderId ? data.order : order)),
        );
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const exportReport = async (type: "daily" | "weekly" | "monthly") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reports?type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report");
    }
  };

  const viewOrderDetails = (order: DeadlineOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
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
                <ChevronLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Deadline Orders
                </h1>
                <p className="text-gray-600">
                  Manage time-sensitive orders efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Alerts
                      </h4>
                      <div className="space-y-2">
                        {notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="text-sm text-red-600 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            {notification}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                Auto-refresh
              </button>

              {/* Export Reports */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReport("daily")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Daily Report
                </button>
                <button
                  onClick={() => exportReport("weekly")}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Weekly Report
                </button>
                <button
                  onClick={() => exportReport("monthly")}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Monthly Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Urgent Orders</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.urgentOrders}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.todayRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Today</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.completedToday}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer name or product..."
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { value: "", label: "All Status" },
                  { value: "BOOKED", label: "Booked" },
                  { value: "CONFIRMED", label: "Confirmed" },
                  { value: "PREPARING", label: "Preparing" },
                  { value: "READY", label: "Ready" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" },
                  { value: "MISSED", label: "Missed" },
                ]}
              />
            </div>

            {/* Urgency Filter */}
            <div className="lg:w-48">
              <Select
                value={selectedUrgency}
                onChange={(value) => setSelectedUrgency(value)}
                options={[
                  { value: "", label: "All Urgency" },
                  { value: "URGENT", label: "Urgent (≤2h)" },
                  { value: "UPCOMING", label: "Upcoming (≤6h)" },
                  { value: "SAFE", label: "Safe (>6h)" },
                ]}
              />
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(value) =>
                  setDateRange({ ...dateRange, start: value })
                }
                placeholder="Start date"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(value) => setDateRange({ ...dateRange, end: value })}
                placeholder="End date"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No deadline orders found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus || selectedUrgency
                ? "No orders match your filters. Try adjusting your search criteria."
                : "You haven't received any deadline orders yet."}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "calendar" ? (
              <CalendarView orders={orders} onOrderClick={viewOrderDetails} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Countdown
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => {
                        const urgencyLevel = getUrgencyLevel(
                          order.deadlineTime,
                        );
                        const isOverdue = isOrderOverdue(order.deadlineTime);

                        return (
                          <tr
                            key={order._id}
                            className={`hover:bg-gray-50 ${
                              urgencyLevel === "VERY_URGENT" ? "bg-red-50" : ""
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-gray-500">
                                  {order.customerEmail}
                                </div>
                                <div className="text-gray-500">
                                  {order.customerPhone}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="space-y-1">
                                {order.items.slice(0, 2).map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    {item.product.image && (
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-6 h-6 rounded object-cover"
                                      />
                                    )}
                                    <span>
                                      {item.quantity}x {item.product.name}
                                    </span>
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <div className="text-gray-500 text-xs">
                                    +{order.items.length - 2} more items
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>
                                  {new Date(
                                    order.deadlineTime,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-gray-500">
                                  {new Date(
                                    order.deadlineTime,
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                <span
                                  className={`font-medium ${
                                    isOverdue
                                      ? "text-red-600"
                                      : urgencyLevel === "VERY_URGENT"
                                        ? "text-red-600"
                                        : urgencyLevel === "URGENT"
                                          ? "text-orange-600"
                                          : urgencyLevel === "UPCOMING"
                                            ? "text-yellow-600"
                                            : "text-green-600"
                                  }`}
                                >
                                  {getCountdown(order.deadlineTime)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => viewOrderDetails(order)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Status update buttons */}
                                {order.status === "BOOKED" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "CONFIRMED")
                                    }
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "CONFIRMED" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "PREPARING")
                                    }
                                    className="text-purple-600 hover:text-purple-900"
                                  >
                                    <Package className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "PREPARING" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "READY")
                                    }
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "READY" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "COMPLETED")
                                    }
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowOrderModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Deadline Order Details
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Customer Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p className="font-medium">
                          {selectedOrder.customerName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">
                          {selectedOrder.customerEmail}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone:</span>
                        <p className="font-medium">
                          {selectedOrder.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Order Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${STATUS_COLORS[selectedOrder.status]}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Total Amount:
                        </span>
                        <p className="font-medium text-lg">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Deadline:</span>
                        <p className="font-medium">
                          {new Date(
                            selectedOrder.deadlineTime,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Countdown:
                        </span>
                        <p
                          className={`font-medium ${
                            isOrderOverdue(selectedOrder.deadlineTime)
                              ? "text-red-600"
                              : isOrderVeryUrgent(selectedOrder.deadlineTime)
                                ? "text-red-600"
                                : isOrderUrgent(selectedOrder.deadlineTime)
                                  ? "text-orange-600"
                                  : "text-green-600"
                          }`}
                        >
                          {getCountdown(selectedOrder.deadlineTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Preparation Time:
                        </span>
                        <p className="font-medium">
                          {selectedOrder.preparationTime} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {item.product.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}{" "}
                            = ${(item.quantity * item.price).toFixed(2)}
                          </p>
                          {item.specialInstructions && (
                            <p className="text-sm text-gray-500 italic">
                              Special instructions: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Update Status
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.status === "BOOKED" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "CONFIRMED")
                        }
                        size="sm"
                      >
                        Confirm Order
                      </Button>
                    )}
                    {selectedOrder.status === "CONFIRMED" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "PREPARING")
                        }
                        size="sm"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {selectedOrder.status === "PREPARING" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "READY")
                        }
                        size="sm"
                      >
                        Mark Ready
                      </Button>
                    )}
                    {selectedOrder.status === "READY" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "COMPLETED")
                        }
                        size="sm"
                      >
                        Complete Order
                      </Button>
                    )}
                    {(selectedOrder.status === "BOOKED" ||
                      selectedOrder.status === "CONFIRMED") && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "CANCELLED")
                        }
                        variant="danger"
                        size="sm"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
