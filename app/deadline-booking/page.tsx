"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Store,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  preparationTime: number;
  owner: string;
}

interface CartItem {
  product: string;
  quantity: number;
  price: number;
  specialInstructions: string;
  productDetails: Product;
}

export default function DeadlineBookingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    deadlineTime: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
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
    if (parsedUser.role !== "CUSTOMER") {
      router.push(parsedUser.role === "ADMIN" ? "/admin" : "/dashboard");
      return;
    }

    setUser(parsedUser);

    // Load cart from localStorage
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      try {
        const parsedCart = JSON.parse(cartData);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCart([]);
      }
    }

    // Set default customer info
    setOrderForm((prev) => ({
      ...prev,
      customerName: parsedUser.name || "",
      customerPhone: parsedUser.phone || "",
      customerEmail: parsedUser.email || "",
    }));
  }, [router]);

  const updateQuantity = (index: number, change: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + change);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculatePreparationTime = () => {
    return Math.max(
      ...cart.map((item) => item.productDetails.preparationTime || 15),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare order items
      const orderItems = cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        owner: item.productDetails.owner,
      }));

      const response = await fetch("/api/deadline-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          deadlineTime: orderForm.deadlineTime,
          customerName: orderForm.customerName,
          customerPhone: orderForm.customerPhone,
          customerEmail: orderForm.customerEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart
        localStorage.removeItem("cart");
        setCart([]);

        // Redirect to confirmation
        router.push(`/deadline-orders/${data.order._id}?success=true`);
      } else {
        alert(data.error || "Failed to create deadline order");
      }
    } catch (error) {
      console.error("Error creating deadline order:", error);
      alert("An error occurred while creating your deadline order");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum deadline time (current time + preparation time)
  const getMinDeadlineTime = () => {
    const prepTime = calculatePreparationTime();
    const now = new Date();
    const minDeadline = new Date(now.getTime() + (prepTime + 30) * 60000); // Add 30 min buffer
    return minDeadline.toISOString().slice(0, 16);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some delicious items to book your order with a deadline
          </p>
          <Link
            href="/menu"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Menu
          </Link>
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
                href="/menu"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Menu
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Deadline Booking
                </h1>
                <p className="text-gray-600">
                  Schedule your order for a specific time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                    {item.productDetails.image ? (
                      <img
                        src={item.productDetails.image}
                        alt={item.productDetails.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {item.productDetails.name}
                    </h3>
                    <p className="text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                    <textarea
                      placeholder="Special instructions (optional)"
                      value={item.specialInstructions}
                      onChange={(e) => {
                        const newCart = [...cart];
                        newCart[index].specialInstructions = e.target.value;
                        setCart(newCart);
                        localStorage.setItem("cart", JSON.stringify(newCart));
                      }}
                      className="mt-2 w-full text-sm border rounded px-2 py-1"
                      rows={2}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-8 h-8 rounded-full border hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-8 h-8 rounded-full border hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Preparation Time: ~{calculatePreparationTime()} min
                  </p>
                  <p className="text-sm text-gray-600">
                    Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    Total: ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Your Order</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Pick-up Deadline Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={getMinDeadlineTime()}
                  value={orderForm.deadlineTime}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, deadlineTime: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: {getMinDeadlineTime().replace("T", " ")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerName: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.customerPhone}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      customerPhone: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={orderForm.customerEmail}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      customerEmail: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Order Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Items:</strong>{" "}
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                  <p>
                    <strong>Total Amount:</strong> $
                    {calculateTotal().toFixed(2)}
                  </p>
                  <p>
                    <strong>Preparation Time:</strong> ~
                    {calculatePreparationTime()} minutes
                  </p>
                  <p>
                    <strong>Pick-up Deadline:</strong>{" "}
                    {orderForm.deadlineTime
                      ? new Date(orderForm.deadlineTime).toLocaleString()
                      : "Not set"}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !orderForm.deadlineTime}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Booking..." : "Create Deadline Booking"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
