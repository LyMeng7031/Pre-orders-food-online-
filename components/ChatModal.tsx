"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import Chat from "./Chat";

interface ChatModalProps {
  recipientId: string;
  recipientName?: string;
  relatedOrder?: string;
  relatedDeadlineOrder?: string;
  initialConversationId?: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function ChatModal({
  recipientId,
  recipientName,
  relatedOrder,
  relatedDeadlineOrder,
  initialConversationId,
  trigger,
  onClose,
}: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  // Default trigger button
  const defaultTrigger = (
    <button
      onClick={openChat}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      Contact Seller
    </button>
  );

  return (
    <>
      {trigger || defaultTrigger}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-5xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {recipientName ? `Chat with ${recipientName}` : "Messages"}
              </h2>
              <button
                onClick={closeChat}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Component */}
            <div className="flex-1 overflow-hidden">
              <Chat
                initialConversationId={initialConversationId}
                relatedOrder={relatedOrder}
                relatedDeadlineOrder={relatedDeadlineOrder}
                recipientId={recipientId}
                isModal={true}
                onClose={onClose || closeChat}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
