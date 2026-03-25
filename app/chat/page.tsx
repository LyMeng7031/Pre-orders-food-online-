"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Paperclip,
  ArrowLeft,
  User,
  Search,
  CheckCircle,
  Clock,
  Image,
} from "lucide-react";

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  recipient: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  messageType: string;
  imageUrl?: string;
  imageName?: string;
  isRead: boolean;
  createdAt: string;
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
}

interface ConversationPartner {
  _id: string;
  name: string;
  role: string;
  lastMessage: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationPartners, setConversationPartners] = useState<
    ConversationPartner[]
  >([]);
  const [selectedPartner, setSelectedPartner] =
    useState<ConversationPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchConversations();

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversationPartners(data.conversationPartners || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error("Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId?: string) => {
    try {
      const token = localStorage.getItem("token");
      const url = partnerId ? `/api/chat?withUser=${partnerId}` : "/api/chat";
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark messages as read
        const unreadMessages = data.messages.filter(
          (msg: Message) => !msg.isRead && msg.recipient._id === user._id,
        );

        for (const msg of unreadMessages) {
          await markAsRead(msg._id);
        }
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/chat/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAsRead: true }),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() && !selectedPartner) return;

    setSendingMessage(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("recipient", selectedPartner._id);
      formData.append("content", messageInput.trim());

      if (attachedImage) {
        formData.append("image", attachedImage);
        formData.append("messageType", "IMAGE");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessageInput("");
        setAttachedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh messages
        fetchMessages(selectedPartner._id);
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending your message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredPartners = conversationPartners.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={
                  user?.role === "OWNER"
                    ? "/dashboard"
                    : user?.role === "ADMIN"
                      ? "/admin"
                      : "/customer"
                }
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to{" "}
                {user?.role === "OWNER"
                  ? "Dashboard"
                  : user?.role === "ADMIN"
                    ? "Admin"
                    : "Customer"}
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                  {unreadCount === 0 && "All caught up"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Conversation Partners List */}
          <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversations
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredPartners.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-gray-500 text-sm">
                    Start a conversation by contacting a restaurant or customer
                  </p>
                </div>
              ) : (
                filteredPartners.map((partner) => (
                  <div
                    key={partner._id}
                    onClick={() => {
                      setSelectedPartner(partner);
                      fetchMessages(partner._id);
                    }}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPartner?._id === partner._id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {partner.name}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {partner.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {partner.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {partner.unreadCount}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(partner.lastMessage).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedPartner.name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedPartner.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPartner(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender._id === user._id;
                    const showDate =
                      index === 0 ||
                      new Date(message.createdAt).toDateString() !==
                        new Date(messages[index - 1].createdAt).toDateString();

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-4">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                        )}

                        <div
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}
                          >
                            <div
                              className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                            >
                              {!isOwnMessage && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                              )}

                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwnMessage
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                {!isOwnMessage && (
                                  <p className="text-xs font-medium mb-1">
                                    {message.sender.name}
                                  </p>
                                )}

                                {message.messageType === "IMAGE" &&
                                message.imageUrl ? (
                                  <div className="mb-2">
                                    <img
                                      src={message.imageUrl}
                                      alt={message.imageName}
                                      className="max-w-xs rounded-lg"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>
                                )}

                                {message.relatedOrder && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-blue-600 font-medium">
                                      Related Order: {message.relatedOrder}
                                    </p>
                                  </div>
                                )}

                                {message.relatedDeadlineOrder && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-orange-600 font-medium">
                                      Deadline Order:{" "}
                                      {message.relatedDeadlineOrder}
                                    </p>
                                  </div>
                                )}

                                <div
                                  className={`text-xs mt-1 ${
                                    isOwnMessage
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sendingMessage}
                      />

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={sendingMessage}
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingMessage || !messageInput.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send
                        </div>
                      )}
                    </button>
                  </form>

                  {attachedImage && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Image className="w-4 h-4" />
                      <span>Attached: {attachedImage.name}</span>
                      <button
                        onClick={() => setAttachedImage(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p>Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
