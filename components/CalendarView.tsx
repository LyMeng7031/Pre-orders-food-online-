"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  DollarSign,
} from "lucide-react";
interface DeadlineOrder {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
    specialInstructions: string;
  }>;
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

interface CalendarViewProps {
  orders: DeadlineOrder[];
  onOrderClick?: (order: DeadlineOrder) => void;
}

export default function CalendarView({
  orders,
  onOrderClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getOrdersForDate = (date: Date) => {
    if (!date) return [];

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );

    return orders.filter((order) => {
      const orderDate = new Date(order.deadlineTime);
      return orderDate >= startOfDay && orderDate < endOfDay;
    });
  };

  const getDateStatus = (date: Date) => {
    const dayOrders = getOrdersForDate(date);
    if (dayOrders.length === 0) return "empty";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isPast = date < now && !isToday;

    const urgentOrders = dayOrders.filter((order) => {
      const deadline = new Date(order.deadlineTime);
      const hoursDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 2 && hoursDiff > 0;
    });

    const overdueOrders = dayOrders.filter((order) => {
      const deadline = new Date(order.deadlineTime);
      return (
        deadline < now &&
        ["BOOKED", "CONFIRMED", "PREPARING", "READY"].includes(order.status)
      );
    });

    if (overdueOrders.length > 0) return "overdue";
    if (urgentOrders.length > 0) return "urgent";
    if (dayOrders.length > 0) return "has-orders";
    return "empty";
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getDayStats = (date: Date) => {
    const dayOrders = getOrdersForDate(date);
    const totalRevenue = dayOrders
      .filter((order) => order.status === "COMPLETED")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total: dayOrders.length,
      completed: dayOrders.filter((order) => order.status === "COMPLETED")
        .length,
      pending: dayOrders.filter((order) =>
        ["BOOKED", "CONFIRMED", "PREPARING", "READY"].includes(order.status),
      ).length,
      revenue: totalRevenue,
    };
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDateStatus(date);
          const stats = getDayStats(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected =
            selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"
              } ${isSelected ? "ring-2 ring-blue-500 bg-blue-100" : ""} ${
                status === "overdue"
                  ? "bg-red-50 border-red-300"
                  : status === "urgent"
                    ? "bg-orange-50 border-orange-300"
                    : status === "has-orders"
                      ? "bg-green-50 border-green-300"
                      : "bg-white"
              }`}
            >
              <div className="h-full flex flex-col">
                <div
                  className={`text-sm font-medium ${
                    isToday ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>

                {stats.total > 0 && (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs text-gray-600">
                      {stats.total} order{stats.total !== 1 ? "s" : ""}
                    </div>
                    {stats.revenue > 0 && (
                      <div className="text-xs font-medium text-green-600">
                        ${stats.revenue.toFixed(0)}
                      </div>
                    )}
                    {stats.pending > 0 && (
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border border-red-300 rounded" />
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-50 border border-orange-300 rounded" />
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 border border-green-300 rounded" />
          <span>Has Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-50 border border-blue-500 rounded" />
          <span>Today</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Day Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Day Statistics</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-medium">
                    {getOrdersForDate(selectedDate).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">
                    {
                      getOrdersForDate(selectedDate).filter(
                        (o) => o.status === "COMPLETED",
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {
                      getOrdersForDate(selectedDate).filter((o) =>
                        ["BOOKED", "CONFIRMED", "PREPARING", "READY"].includes(
                          o.status,
                        ),
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-green-600">
                    $
                    {getOrdersForDate(selectedDate)
                      .filter((o) => o.status === "COMPLETED")
                      .reduce((sum, o) => sum + o.totalAmount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Orders</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getOrdersForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No orders for this date
                  </p>
                ) : (
                  getOrdersForDate(selectedDate).map((order) => (
                    <div
                      key={order._id}
                      onClick={() => onOrderClick?.(order)}
                      className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items.length} items • $
                            {order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.deadlineTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : order.status === "MISSED"
                                    ? "bg-red-200 text-red-900"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
