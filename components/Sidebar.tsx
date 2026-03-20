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
    { icon: ShoppingCart, label: "Orders" },
    { icon: Utensils, label: "Foods" },
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Inbox size={18} className="text-gray-600" />
              Email
            </h2>
            <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
              <Plus size={16} />
            </button>
          </div>

          <ul className="space-y-2 mb-6">
            {inboxItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                  item.label === "Inbox"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => item.label === "Inbox" && router.push("/inbox")}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={16}
                    className={
                      item.label === "Inbox"
                        ? "text-blue-600"
                        : item.label === "Starred"
                          ? "text-yellow-500"
                          : item.label === "Important"
                            ? "text-red-500"
                            : "text-gray-500"
                    }
                  />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Labels Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
              <Tag size={16} className="text-gray-600" />
              Labels
            </h3>
            <ul className="space-y-2">
              {labels.map((label) => (
                <li
                  key={label.label}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 text-gray-700"
                >
                  <div className={`w-3 h-3 rounded-full ${label.color}`}></div>
                  <span>{label.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
