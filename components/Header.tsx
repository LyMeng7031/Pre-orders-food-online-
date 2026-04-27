"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Users, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface User {
  name: string;
  restaurantName?: string;
  profileImage?: string;
}

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // 🔹 Mock fetch user (replace with your API)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Example notification count
    setUnreadNotifications(3);
  }, []);

  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Store className="w-8 h-8 text-blue-600" />

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.restaurantName ?? "Restaurant"} Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name ?? "User"}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* 👤 Profile */}
            {/* <Link
              href="/restaurant-profile"
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              )}

              <span className="text-gray-700 font-medium">
                {user?.name ?? "User"}
              </span>
            </Link> */}

            {/* 🚪 Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
