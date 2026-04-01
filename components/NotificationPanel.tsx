'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, X, Check, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { NotificationPriority, NotificationDeliveryMethod } from '@prisma/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  userId: string;
  token: string;
}

export default function NotificationPanel({ userId, token }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      newSocket.emit('fetch-notifications', { limit: 20, unreadOnly: false });
    });

    newSocket.on('notifications-fetched', (data: { notifications: Notification[]; total: number }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => !n.isRead).length);
    });

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('unread-count-updated', (count: number) => {
      setUnreadCount(count);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const markAsRead = async (notificationId: string) => {
    if (!socket) return;

    socket.emit('mark-notification-read', notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!socket) return;

    socket.emit('mark-all-notifications-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'LOW':
        return <Info className="w-4 h-4 text-gray-400" />;
      case 'MEDIUM':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'LOW':
        return 'border-gray-200 bg-gray-50';
      case 'MEDIUM':
        return 'border-blue-200 bg-blue-50';
      case 'HIGH':
        return 'border-orange-200 bg-orange-50';
      case 'URGENT':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'border-l-4' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        {/* Additional metadata for deadline warnings */}
                        {notification.type === 'DEADLINE_WARNING' && notification.metadata && (
                          <div className="mt-2 text-xs text-gray-500 bg-white rounded p-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>Customer: {notification.metadata.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Pickup time: {new Date(notification.metadata.deadlineTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span>Order total: ${notification.metadata.orderTotal?.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        
                        {notification.actionUrl && (
                          <button
                            onClick={() => {
                              // Handle navigation to action URL
                              window.location.href = notification.actionUrl!;
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
