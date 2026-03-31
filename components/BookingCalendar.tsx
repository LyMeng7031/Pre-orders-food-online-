"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "DELIVERED"
    | "CANCELLED";
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
}

interface BookingCalendarProps {
  className?: string;
}

export default function BookingCalendar({
  className = "",
}: BookingCalendarProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Fetch orders for current month
  useEffect(() => {
    fetchOrders();
  }, [currentDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const response = await fetch(
        `/api/orders?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get orders for specific date
  const getOrdersForDate = (date: Date) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-orange-100 text-orange-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{monthYear}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            List
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {orders.length} orders this month
        </div>
      </div>

      {viewMode === "calendar" ? (
        <>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayOrders = day ? getOrdersForDate(day) : [];
              const hasOrders = dayOrders.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    day ? "hover:bg-gray-50 border-gray-200" : "border-gray-100"
                  } ${
                    selectedDate &&
                    day?.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-50 border-blue-300"
                      : ""
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {day.getDate()}
                      </div>
                      {hasOrders && (
                        <div className="space-y-1">
                          {dayOrders.slice(0, 2).map((order, i) => (
                            <div
                              key={order._id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(order.status)}`}
                              title={`${order.orderNumber} - ${order.customer.name}`}
                            >
                              {order.orderNumber.slice(-4)}
                            </div>
                          ))}
                          {dayOrders.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayOrders.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* List View */
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found for this month</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {order.customer.name}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>

                {order.items.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {order.items.length} items • {order.items[0]?.product?.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {getOrdersForDate(selectedDate).map((order) => (
              <div
                key={order._id}
                className="bg-white p-3 rounded border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  Customer: {order.customer.name}
                </div>
                <div className="text-sm text-gray-600">
                  Items: {order.items.length} • Total: $
                  {order.totalAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
