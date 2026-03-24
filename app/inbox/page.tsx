"use client";

import { useState } from "react";
import {
  Search,
  Edit,
  Star,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EmailRow from "@/components/EmailRow";
import ComposeModal from "@/components/ComposeModal";

const mockEmails = [
  {
    id: 1,
    sender: "John Doe",
    senderEmail: "john@example.com",
    subject: "Meeting Tomorrow at 3 PM",
    preview:
      "Hi, just wanted to confirm our meeting tomorrow at 3 PM. We'll be discussing the new project requirements...",
    time: "10:30 AM",
    starred: true,
    read: false,
    label: "Work",
  },
  {
    id: 2,
    sender: "Sarah Smith",
    senderEmail: "sarah@example.com",
    subject: "Order Confirmation #12345",
    preview:
      "Your order has been confirmed and will be delivered within 2-3 business days. Track your package...",
    time: "9:15 AM",
    starred: false,
    read: true,
    label: "Personal",
  },
  {
    id: 3,
    sender: "Marketing Team",
    senderEmail: "marketing@company.com",
    subject: "New Product Launch - 50% Off",
    preview:
      "Exciting news! We're launching our new product line with an exclusive 50% discount for early birds...",
    time: "Yesterday",
    starred: false,
    read: true,
    label: "Social",
  },
  {
    id: 4,
    sender: "Alex Johnson",
    senderEmail: "alex@example.com",
    subject: "Project Update - Phase 2 Complete",
    preview:
      "Great news! Phase 2 of the project is now complete. We've successfully implemented all the core features...",
    time: "Yesterday",
    starred: true,
    read: false,
    label: "Work",
  },
  {
    id: 5,
    sender: "Customer Support",
    senderEmail: "support@service.com",
    subject: "Your ticket has been resolved",
    preview:
      "We're happy to inform you that your support ticket #67890 has been successfully resolved...",
    time: "2 days ago",
    starred: false,
    read: true,
    label: "Personal",
  },
];

export default function InboxPage() {
  const [emails, setEmails] = useState(mockEmails);
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map((email) => email.id));
    }
  };

  const handleSelectEmail = (emailId: number) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId],
    );
  };

  const toggleStar = (emailId: number) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, starred: !email.starred } : email,
      ),
    );
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl text-gray-700 font-bold">Inbox</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
            onClick={() => setIsComposeOpen(true)}
          >
            <Edit size={18} />
            Compose
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder=" emails..."
            className="text-gray-700 w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b p-4 flex items-center gap-4">
        <input
          type="checkbox"
          checked={
            selectedEmails.length === filteredEmails.length &&
            filteredEmails.length > 0
          }
          onChange={handleSelectAll}
          className="rounded"
        />
        <button className="flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">
          <Archive size={16} />
          Archive
        </button>
        <button className="flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">
          <Trash2 size={16} />
          Delete
        </button>
        <button className="flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">
          <Star size={16} />
          Mark as starred
        </button>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.map((email) => (
          <EmailRow
            key={email.id}
            email={email}
            isSelected={selectedEmails.includes(email.id)}
            onSelect={() => handleSelectEmail(email.id)}
            onToggleStar={() => toggleStar(email.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="border-b p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          1-5 of {filteredEmails.length}
        </span>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft size={18} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
