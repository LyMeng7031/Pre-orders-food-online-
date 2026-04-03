"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  Clock,
  Utensils, // Added for Table Number icon
} from "lucide-react";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  ownerId: string;
  description?: string;
  specialInstructions?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState(""); // Added Table Number state
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: "",
    deliveryPhone: "",
    orderNotes: "",
    paymentMethod: "CASH",
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const cartData = localStorage.getItem("foodCart"); // Using foodCart to match your previous code

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCart([]);
      }
    }

    if (parsedUser.phone) {
      setOrderForm((prev) => ({ ...prev, deliveryPhone: parsedUser.phone }));
    }
  }, [router]);

  const updateQuantity = (index: number, change: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + change);
    setCart(newCart);
    localStorage.setItem("foodCart", JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("foodCart", JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Integrated your placeOrder logic into the submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const orderData = {
        customerId: user._id,
        ownerId: cart[0]?.ownerId,
        items: cart,
        tableNumber, // Added Table Number to payload
        total: calculateTotal(),
        deliveryAddress: orderForm.deliveryAddress,
        deliveryPhone: orderForm.deliveryPhone,
        orderNotes: orderForm.orderNotes,
        paymentMethod: orderForm.paymentMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("foodCart");
        setCart([]);
        alert("Order placed! The kitchen is preparing your food.");
        router.push("/orders");
      } else {
        alert(data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred while creating your order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Complete Your Order
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-8 h-8 rounded-full border hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="w-8 h-8 rounded-full border hover:bg-gray-100 flex items-center justify-center"
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
              ))}
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Table & Delivery Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Service Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TABLE NUMBER SECTION - Integrated from your code */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  <Utensils className="w-4 h-4 inline mr-1 text-blue-600" />
                  Table Number (on your QR stand)
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Table 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.deliveryPhone}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      deliveryPhone: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="For order updates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (optional)
                </label>
                <textarea
                  value={orderForm.orderNotes}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, orderNotes: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Allergies or special requests?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Payment Method
                </label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="CASH">Pay at Counter / Cash</option>
                  <option value="CARD">Credit/Debit Card</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {loading
                  ? "Sending to Kitchen..."
                  : `Send to Kitchen - $${calculateTotal().toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
