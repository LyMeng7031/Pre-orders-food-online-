"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Utensils,
  ChartBar,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Define your Admin Navigation links here
  const menuItems = [
    {
      icon: ShieldCheck,
      label: "Owner Requests",
      href: "/admin", // Assuming your main admin page is the request table
    },
  ];

  return (
    <div className="w-64 bg-white shadow h-screen flex flex-col border-r border-gray-200">
      {/* Header / Logo */}
      <div className="flex items-center gap-3 p-4 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
          <Utensils size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-none">
            Food Admin
          </h1>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            Control Panel
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Navigation Links */}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Check if current URL matches the link
            const isActive = pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-600 bg-blue-50 font-bold"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />
                  <span className="text-sm">{item.label}</span>

                  {/* Subtle active indicator */}
                  {isActive && (
                    <div className="ml-auto w-1 h-4 bg-blue-600 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* System Divider */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">
            System
          </p>
        </div>
      </div>
    </div>
  );
}
