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
} from "lucide-react";

interface CartItem {
  product: string;
  quantity: number;
  price: number;
  specialInstructions: string;
  productDetails: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    preparationTime: number;
    owner: string;
  };
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: "",
    deliveryPhone: "",
    orderNotes: "",
    paymentMethod: "CASH",
  });
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const cartData = localStorage.getItem("cart");

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

    // Load cart
    if (cartData) {
      try {
        const parsedCart = JSON.parse(cartData);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCart([]);
      }
    }

    // Set default phone from user profile
    if (parsedUser.phone) {
      setOrderForm((prev) => ({ ...prev, deliveryPhone: parsedUser.phone }));
    }
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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          deliveryAddress: orderForm.deliveryAddress,
          deliveryPhone: orderForm.deliveryPhone,
          orderNotes: orderForm.orderNotes,
          paymentMethod: orderForm.paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart
        localStorage.removeItem("cart");
        setCart([]);

        // Redirect to order confirmation
        router.push(`/orders/${data.order._id}?success=true`);
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
          <p className="text-gray-600 mb-6">
            Add some delicious items to your cart first!
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

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
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
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
                    <input
                      type="text"
                      placeholder="Special instructions (optional)"
                      value={item.specialInstructions}
                      onChange={(e) => {
                        const newCart = [...cart];
                        newCart[index].specialInstructions = e.target.value;
                        setCart(newCart);
                        localStorage.setItem("cart", JSON.stringify(newCart));
                      }}
                      className="mt-2 w-full text-sm border rounded px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-8 h-8 rounded-full border hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
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
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Address
                </label>
                <textarea
                  required
                  value={orderForm.deliveryAddress}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      deliveryAddress: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter your delivery address"
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
                  placeholder="Enter your phone number"
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
                  placeholder="Any special requests?"
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
                  <option value="CASH">Cash on Delivery</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online Payment</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    Estimated Delivery: 45 minutes
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order - $${calculateTotal().toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
