"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatModal from "./ChatModal";

interface ChatButtonProps {
  recipientId: string;
  recipientName?: string;
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
  initialConversationId?: string;
  variant?: "button" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ChatButton({
  recipientId,
  recipientName,
  relatedOrder,
  relatedDeadlineOrder,
  initialConversationId,
  variant = "button",
  size = "md",
  className = "",
}: ChatButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const sizeClasses = {
    sm: variant === "button" ? "px-3 py-1.5 text-sm" : "p-1.5",
    md: variant === "button" ? "px-4 py-2 text-sm" : "p-2",
    lg: variant === "button" ? "px-5 py-2.5 text-base" : "p-2.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={openModal}
          className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ${sizeClasses[size]} ${className}`}
          title="Contact Seller"
        >
          <MessageCircle className={iconSizes[size]} />
        </button>

        {isModalOpen && (
          <ChatModal
            recipientId={recipientId}
            recipientName={recipientName}
            relatedOrder={relatedOrder}
            relatedDeadlineOrder={relatedDeadlineOrder}
            initialConversationId={initialConversationId}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className={`flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${sizeClasses[size]} ${className}`}
      >
        <MessageCircle className={iconSizes[size]} />
        Contact Seller
      </button>

      {isModalOpen && (
        <ChatModal
          recipientId={recipientId}
          recipientName={recipientName}
          relatedOrder={relatedOrder}
          relatedDeadlineOrder={relatedDeadlineOrder}
          initialConversationId={initialConversationId}
          onClose={closeModal}
        />
      )}
    </>
  );
}
