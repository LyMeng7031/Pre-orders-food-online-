"use client";

import { Star } from "lucide-react";

interface Email {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
  read: boolean;
  label: string;
}

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}

const labelColors: { [key: string]: string } = {
  Work: "bg-blue-500",
  Personal: "bg-red-500",
  Social: "bg-green-500",
};

export default function EmailRow({
  email,
  isSelected,
  onSelect,
  onToggleStar,
}: EmailRowProps) {
  return (
    <div
      className={`border-b hover:bg-gray-50 ${!email.read ? "bg-blue-50" : ""}`}
    >
      <div className="flex items-center p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mr-4 rounded"
        />

        <button
          onClick={onToggleStar}
          className="mr-4 hover:scale-110 transition-transform"
        >
          <Star
            size={18}
            className={
              email.starred
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            }
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${!email.read ? "font-bold" : ""}`}>
                {email.sender}
              </span>
              {email.label && (
                <span
                  className={`px-2 py-1 text-xs text-white rounded-full ${labelColors[email.label] || "bg-gray-500"}`}
                >
                  {email.label}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
              {email.time}
            </span>
          </div>

          <div className={`text-sm ${!email.read ? "font-semibold" : ""} mb-1`}>
            {email.subject}
          </div>

          <div className="text-sm text-gray-600 truncate">{email.preview}</div>
        </div>
      </div>
    </div>
  );
}
