"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Store,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface CartItem {
  _id?: string;
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  ownerId: string;
  owner?: string;
  specialInstructions?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [orderForm, setOrderForm] = useState({
    deliveryPhone: "",
    deliveryAddress: "",
    orderNotes: "",
    deadline: "",
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const cartData = localStorage.getItem("foodCart");

    // 1. AUTH & ROLE PROTECTION
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      // AUTO LOGOUT IF NOT CUSTOMER
      if (parsedUser.role !== "CUSTOMER") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("foodCart");
        alert("Access Denied: Only customers can access the checkout.");
        router.push("/login");
        return;
      }

      setUser(parsedUser);

      if (cartData) {
        setCart(JSON.parse(cartData));
      }

      if (parsedUser.phone) {
        setOrderForm((prev) => ({ ...prev, deliveryPhone: parsedUser.phone }));
      }
    } catch (error) {
      console.error("Error parsing local storage data", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formattedItems = cart.map((item) => ({
        product: item._id || item.id || item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price),
        owner: item.ownerId || item.owner,
        specialInstructions: item.specialInstructions || "",
      }));

      if (formattedItems.some((item) => !item.product)) {
        alert(
          "Error: Some items are missing valid IDs. Please clear your cart and try again.",
        );
        setLoading(false);
        return;
      }

      const orderData = {
        items: formattedItems,
        deliveryPhone: orderForm.deliveryPhone,
        deliveryAddress: needsDelivery
          ? orderForm.deliveryAddress
          : "Self-Pickup",
        orderNotes: orderForm.orderNotes,
        estimatedDeliveryTime: orderForm.deadline
          ? new Date(orderForm.deadline).toISOString()
          : null,
        paymentMethod: "CASH",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem("foodCart");
        setCart([]);
        alert("Order sent successfully to the restaurant!");
        router.push("/orders");
      } else {
        console.error("Backend Error Details:", result);

        // 2. SMART ERROR HANDLING FOR UNAVAILABLE PRODUCTS
        if (
          result.error &&
          result.error.toLowerCase().includes("not available")
        ) {
          // Extract ID from error message if possible, or just inform the user
          alert(
            `One or more items in your cart are no longer available. We will refresh your cart.`,
          );

          // Logic: Extract the ID from backend message "Product [ID] not available"
          const match = result.error.match(/[a-f\d]{24}/i);
          const unavailableId = match ? match[0] : null;

          if (unavailableId) {
            const updatedCart = cart.filter(
              (item) => (item._id || item.id) !== unavailableId,
            );
            setCart(updatedCart);
            localStorage.setItem("foodCart", JSON.stringify(updatedCart));
          }
        } else {
          alert(`Failed: ${result.error || "Please check your order details"}`);
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("An error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md w-full">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Looks like you haven't added anything to your order yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 bg-white rounded-2xl shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Complete Your Order
              </h1>
              <p className="text-gray-500 font-medium">
                Review your items and select delivery options
              </p>
            </div>
          </div>
          <div className="bg-blue-600 px-6 py-3 rounded-2xl text-white shadow-lg shadow-blue-100 flex items-center gap-3">
            <Store className="w-5 h-5" />
            <span className="font-bold">Ordering from Local Restaurant</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  Order Summary
                </h2>
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  {cart.length} Items
                </span>
              </div>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-6 p-5 bg-white hover:bg-gray-50 rounded-3xl border border-gray-100 transition-all duration-300"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt={item.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🍲
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-gray-900 mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-blue-600 font-bold text-lg">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-lg w-10 text-center text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-medium text-lg">
                    Subtotal
                  </span>
                  <span className="text-gray-900 font-bold text-lg">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium text-lg">
                    Delivery Fee
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    {needsDelivery ? "$2.00" : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-black text-3xl tracking-tight">
                    Total
                  </span>
                  <span className="text-blue-600 font-black text-3xl tracking-tight">
                    ${(calculateTotal() + (needsDelivery ? 2 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Restaurant Details
              </h2>

              <div className="space-y-6">
                <div
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 ${needsDelivery ? "border-blue-500 bg-blue-50/30" : "border-gray-100 bg-gray-50"}`}
                >
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${needsDelivery ? "bg-blue-600 text-white" : "bg-white text-gray-400 border"}`}
                      >
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900 text-lg">
                          Request Delivery
                        </span>
                        <span className="text-gray-500 text-sm">
                          Delivered to your doorstep
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-6 h-6 accent-blue-600 rounded-lg"
                      checked={needsDelivery}
                      onChange={(e) => setNeedsDelivery(e.target.checked)}
                    />
                  </label>
                  {needsDelivery && (
                    <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-gray-700 ml-1">
                        Full Delivery Address
                      </label>
                      <textarea
                        required
                        rows={3}
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none bg-white font-medium text-black"
                        placeholder="Street, Building, Apartment number..."
                        value={orderForm.deliveryAddress}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            deliveryAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 ml-1 ">
                    <Phone className="w-4 h-4 inline mr-2 text-blue-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-black"
                    placeholder="e.g. 097xxxxxxx"
                    value={orderForm.deliveryPhone}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        deliveryPhone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 ml-1">
                    <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
                    When do you want to receive it?
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                    value={orderForm.deadline}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, deadline: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 ml-1">
                    <MessageSquare className="w-4 h-4 inline mr-2 text-blue-600" />
                    Special Requests / Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium text-black"
                    placeholder="Any special instructions for the chef?"
                    value={orderForm.orderNotes}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, orderNotes: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative overflow-hidden w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-2xl shadow-blue-200 disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loading
                        ? "Processing Order..."
                        : `Sent to Restaurant - $${(calculateTotal() + (needsDelivery ? 2 : 0)).toFixed(2)}`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
