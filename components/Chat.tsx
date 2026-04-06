"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  User,
  Store,
  ArrowLeft,
  Circle,
} from "lucide-react";
import Button, { Input } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";

interface ChatMessage {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "ORDER_UPDATE" | "SYSTEM";
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
  imageUrl?: string;
  imageName?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  senderDetails: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    restaurantName?: string;
  };
  recipientDetails?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    restaurantName?: string;
  };
}

interface Conversation {
  _id: string;
  participant: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    restaurantName?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
}

interface ChatProps {
  initialConversationId?: string;
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
  recipientId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function Chat({
  initialConversationId,
  relatedOrder,
  relatedDeadlineOrder,
  recipientId,
  isModal = false,
  onClose,
}: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);

        // Select initial conversation if provided
        if (initialConversationId) {
          const initialConv = data.conversations.find(
            (conv: Conversation) => conv._id === initialConversationId,
          );
          if (initialConv) {
            setSelectedConversation(initialConv);
          }
        } else if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [initialConversationId, selectedConversation]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/chats/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
          scrollToBottom();
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [scrollToBottom],
  );

  // Initialize chat
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, fetchConversations]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && currentUser) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, currentUser, fetchMessages]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (selectedConversation && currentUser) {
      // Poll for new messages every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedConversation._id);
        fetchConversations();
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedConversation, currentUser, fetchMessages, fetchConversations]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("token");

      const messageData = {
        recipientId: selectedConversation.participant._id,
        content: newMessage.trim(),
        messageType: "TEXT",
        relatedOrder,
        relatedDeadlineOrder,
      };

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        scrollToBottom();

        // Update conversations list
        fetchConversations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  // Mark messages as read
  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/chats/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Mark unread messages as read
    const unreadMessages = messages.filter(
      (msg) => !msg.isRead && msg.sender !== currentUser?._id,
    );
    unreadMessages.forEach((msg) => markAsRead(msg._id));
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participant.restaurantName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.sender !== currentUser?._id) return null;

    if (message.isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const chatContent = (
    <div className={`flex h-full ${isModal ? "" : "bg-white"}`}>
      {/* Conversations Sidebar */}
      <div
        className={`${isModal ? "w-80" : "w-96"} border-r border-gray-200 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleConversationSelect(conversation)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  selectedConversation?._id === conversation._id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {conversation.participant.profileImage ? (
                    <img
                      src={conversation.participant.profileImage}
                      alt={conversation.participant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {conversation.participant.role === "OWNER" ? (
                        <Store className="w-6 h-6 text-gray-500" />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      onlineUsers.has(conversation.participant._id)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.participant.role === "OWNER"
                        ? conversation.participant.restaurantName ||
                          conversation.participant.name
                        : conversation.participant.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isModal && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Participant Avatar */}
                {selectedConversation.participant.profileImage ? (
                  <img
                    src={selectedConversation.participant.profileImage}
                    alt={selectedConversation.participant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedConversation.participant.role === "OWNER" ? (
                      <Store className="w-5 h-5 text-gray-500" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.participant.role === "OWNER"
                      ? selectedConversation.participant.restaurantName ||
                        selectedConversation.participant.name
                      : selectedConversation.participant.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        onlineUsers.has(selectedConversation.participant._id)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span>
                      {onlineUsers.has(selectedConversation.participant._id)
                        ? "Online"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-3/4" />
                  ))}
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender === currentUser._id;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}
                      >
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.messageType === "IMAGE" &&
                          message.imageUrl ? (
                            <img
                              src={message.imageUrl}
                              alt={message.imageName}
                              className="rounded-lg max-w-full"
                            />
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {getMessageStatusIcon(message)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Smile className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={setNewMessage}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh]">
          {chatContent}
        </div>
      </div>
    );
  }

  return <div className="h-screen bg-gray-50">{chatContent}</div>;
}
