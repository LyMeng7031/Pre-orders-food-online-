"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ShoppingCart,
  Package,
  User,
  LogOut,
  Search,
  ChevronRight,
  Store,
  MapPin,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function CustomerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pastRestaurants, setPastRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "CUSTOMER") {
      router.push(parsedUser.role === "ADMIN" ? "/admin" : "/dashboard");
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.orders) {
        setRecentOrders(data.orders.slice(0, 3));
        const uniqueRestos: any[] = [];
        const seenIds = new Set();

        data.orders.forEach((order: any) => {
          const resto = order.owner || (order.items && order.items[0]?.owner);
          if (resto && resto._id && !seenIds.has(resto._id)) {
            seenIds.add(resto._id);
            uniqueRestos.push(resto);
          }
        });
        setPastRestaurants(uniqueRestos);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* 1. SIDEBAR */}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={18} className="text-blue-600" />
            <span className="text-sm font-medium">
              Deliver to: <b className="text-slate-900">Home</b>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Customer
              </p>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-blue-600 rounded-[2rem] p-10 mb-10 text-white shadow-xl shadow-blue-200/50">
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-2">
                  Hello, {user?.name}! 👋
                </h2>
                <p className="text-blue-100 text-lg">
                  What are you craving today?
                </p>
              </div>
              {/* Decorative Glows - Adjusted for Blue background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -mr-20 -mt-20" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/30 rounded-full blur-[60px]" />
            </div>

            {/* Quick Actions */}

            {/* ORDER AGAIN (PAST RESTAURANTS) */}
            {pastRestaurants.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Order Again
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {pastRestaurants.map((resto) => (
                    <Link
                      key={resto._id}
                      href={`/owner/${resto._id}`}
                      className="min-w-[160px] bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group text-center"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                        <Store className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {resto.restaurantName || "Store"}
                      </p>
                      <span className="text-[10px] font-black text-blue-600 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                        View Menu
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* RECENT ORDERS TABLE */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Activity
                </h3>
                <Link
                  href="/orders"
                  className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  See all <ChevronRight size={16} />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Package className="text-slate-400" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-black text-slate-900">
                            ${order.totalAmount?.toFixed(2)}
                          </p>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <Link
                          href={`/owner/${order.owner?._id || order.items?.[0]?.owner}`}
                          className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all"
                        >
                          <ShoppingCart size={18} />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    No orders yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, bgColor }: any) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
    >
      <div
        className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
      <p className="text-slate-400 text-sm font-medium">{desc}</p>
    </Link>
  );
}
