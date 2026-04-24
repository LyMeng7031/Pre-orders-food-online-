"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Package,
  Users,
  Settings,
  LogOut,
  Store,
  TrendingUp,
  QrCode,
  Calendar,
  DollarSign,
  ShoppingCart,
  Clock,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Button, { Input } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import ChatButton from "@/components/ChatButton";
import BookingCalendar from "@/components/BookingCalendar";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  restaurantName?: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  todayOrders: number;
  thisMonthRevenue: number;
  activeProducts: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and approval
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
    fetchDashboardStats(token);
  }, [router]);

  const fetchDashboardStats = async (token: string) => {
    try {
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error("Failed to fetch stats");
        // Set default values if API fails
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          pendingOrders: 0,
          todayOrders: 0,
          thisMonthRevenue: 0,
          activeProducts: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Failed to load dashboard data");
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        todayOrders: 0,
        thisMonthRevenue: 0,
        activeProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() =>
              fetchDashboardStats(localStorage.getItem("token") || "")
            }
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalCustomers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Calendar */}
          <BookingCalendar />

          {/* Today's Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Today's Orders</span>
                <span className="font-semibold text-gray-900">
                  {stats?.todayOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Orders</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.pendingOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month Revenue</span>
                <span className="font-semibold text-green-600">
                  $
                  {stats?.thisMonthRevenue
                    ? stats.thisMonthRevenue.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
        </div>
      </div>
    </div>
  );
}
