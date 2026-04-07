"use client";

import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <img
          src="https://i.pravatar.cc/40"
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-gray-200"
        />
      </div> */}
    </div>
  );
}
