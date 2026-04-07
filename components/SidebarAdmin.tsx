"use client";

import { useRouter } from "next/navigation";
import {
  Inbox,
  Star,
  FileText,
  Trash2,
  AlertCircle,
  Tag,
  Plus,
  Home,
  ShoppingCart,
  Utensils,
  ChartBar,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: ChartBar, label: "Reports" },
  ];

  const inboxItems = [
    { icon: Inbox, label: "Inbox", count: 24 },
    { icon: Star, label: "Starred" },
    { icon: FileText, label: "Draft" },
    { icon: AlertCircle, label: "Spam" },
    { icon: Tag, label: "Important" },
    { icon: Trash2, label: "Bin" },
  ];

  const labels = [
    { color: "bg-red-500", label: "Personal" },
    { color: "bg-blue-500", label: "Work" },
    { color: "bg-green-500", label: "Social" },
  ];

  return (
    <div className="w-64 bg-white shadow h-screen flex flex-col">
      <div className="flex items-center gap-3 p-4 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Utensils size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">FoodAdmin</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <ul className="space-y-2 mb-6">
          {menuItems.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                item.active
                  ? "text-blue-500 bg-blue-50"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon
                size={18}
                className={item.active ? "text-blue-500" : "text-gray-500"}
              />
              <span className={item.active ? "font-semibold" : ""}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Inbox Section */}
        <div className="border-t pt-4">
        </div>
      </div>
    </div>
  );
}
