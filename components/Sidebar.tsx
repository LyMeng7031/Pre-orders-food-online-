"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  Utensils,
  ChartBar,
  QrCode,
  Inbox,
  Star,
  FileText,
  Trash2,
  AlertCircle,
  Tag,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingCart, label: "Manage Orders", href: "/dashboard/orders" },
    { icon: Utensils, label: "Manage Products", href: "/manage-products" },
    {
      icon: ChartBar,
      label: "Restaurant Profile",
      href: "/restaurant-profile",
    },
    { icon: QrCode, label: "QR Code", href: "/owner/qrcode" },
  ];

  return (
    <div className="w-64 bg-white shadow h-screen flex flex-col border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-4 pb-8 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Utensils size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">FoodAdmin</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <ul className="space-y-2 mb-6">
          {menuItems.map((item) => {
            // Check if the current URL matches the link to set active state
            const isActive = pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isActive
                      ? "text-blue-500 bg-blue-50"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={isActive ? "text-blue-500" : "text-gray-500"}
                  />
                  <span className={isActive ? "font-semibold" : ""}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Optional: Inbox Section or Divider */}
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">
            System
          </p>
          {/* Add more links here if needed */}
        </div>
      </div>
    </div>
  );
}
