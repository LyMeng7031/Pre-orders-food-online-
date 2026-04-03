'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Clock, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';

interface DeadlineOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deadlineTime: string;
  totalAmount: number;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  todayRevenue: number;
  upcomingDeadlines: number;
}

interface RestaurantDashboardProps {
  userId: string;
  token: string;
  restaurantId: string;
}

export default function RestaurantDashboard({ 
  userId, 
  token, 
  restaurantId 
}: RestaurantDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    upcomingDeadlines: 0,
  });
  const [upcomingOrders, setUpcomingOrders] = useState<DeadlineOrder[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to dashboard server');
      fetchDashboardData();
    });

    // Listen for real-time updates
    newSocket.on('deadline-order-created', (order: DeadlineOrder) => {
      setUpcomingOrders(prev => [order, ...prev].slice(0, 10)); // Keep only latest 10
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: prev.pendingOrders + 1,
      }));
    });

    newSocket.on('order-status-updated', (data: { orderId: string; status: string }) => {
      setUpcomingOrders(prev => 
        prev.map(order => 
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
      updateStatsOnStatusChange(data.status);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const dashboardStats = await statsResponse.json();
        setStats(dashboardStats);
      }

      // Fetch upcoming deadline orders
      const ordersResponse = await fetch('/api/deadline-orders/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        setUpcomingOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatsOnStatusChange = (status: string) => {
    setStats(prev => {
      switch (status) {
        case 'COMPLETED':
          return {
            ...prev,
            pendingOrders: prev.pendingOrders - 1,
            completedOrders: prev.completedOrders + 1,
          };
        case 'CANCELLED':
          return {
            ...prev,
            pendingOrders: prev.pendingOrders - 1,
          };
        default:
          return prev;
      }
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getTimeUntilDeadline = (deadlineTime: string) => {
    const now = new Date();
    const deadline = new Date(deadlineTime);
    const diffInMinutes = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffInMinutes < 30) return { text: `${diffInMinutes} min`, color: 'text-orange-600' };
    if (diffInMinutes < 60) return { text: `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`, color: 'text-yellow-600' };
    return { text: `${Math.floor(diffInMinutes / 60)}h`, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <div className="flex items-center space-x-4">
              <NotificationPanel userId={userId} token={token} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadline Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Deadline Orders</h2>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {upcomingOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming orders</h3>
                <p className="mt-1 text-sm text-gray-500">New deadline orders will appear here</p>
              </div>
            ) : (
              upcomingOrders.map((order) => {
                const timeUntil = getTimeUntilDeadline(order.deadlineTime);
                return (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{order.customerName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 mr-1" />
                                {order.customerPhone}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-4 w-4 mr-1" />
                                {order.customerEmail}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex items-center space-x-6">
                            <div>
                              <span className="text-sm text-gray-500">Pickup Time:</span>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {formatDate(order.deadlineTime)} at {formatTime(order.deadlineTime)}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Time Until:</span>
                              <span className={`ml-2 text-sm font-medium ${timeUntil.color}`}>
                                {timeUntil.text}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Total:</span>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                ${order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'READY' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-3">
                          <div className="text-sm text-gray-600">
                            {order.items.map((item, index) => (
                              <span key={index}>
                                {item.quantity}x {item.name}
                                {index < order.items.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                          Mark Ready
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
