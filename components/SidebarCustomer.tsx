"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Settings,
  Store,
  Clock,
} from "lucide-react";

export default function SidebarCustomer() {
  const pathname = usePathname();

  // Navigation links for the Customer
  const menuItems = [
    {
      icon: ShoppingBag,
      label: "My Orders",
      href: "/orders",
    },
  ];

  return (
    <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-100 sticky top-0">
      {/* Header / Logo */}
      <div className="flex items-center gap-3 p-6">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">
            Foodie
          </h1>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Customer
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-4">
        {/* Main Navigation */}
        <nav>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">
            Menu
          </p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "hover:bg-gray-50 text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={isActive ? "text-blue-600" : "text-gray-400"}
                    />
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation (Profile/Settings) */}
        <div className="mb-4">
          <div className="pt-4 border-t border-gray-50 mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">
              Account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
