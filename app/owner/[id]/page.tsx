"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Clock,
  Search,
  Store,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  preparationTime: number;
  isAvailable: boolean;
  spicyLevel: number;
  ingredients: string[];
  allergens: string[];
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  restaurantName?: string;
  restaurantDescription?: string;
  restaurantImage?: string;
  cuisine?: string;
  openingHours?: string;
  deliveryRadius?: number;
  minOrder?: number;
}

export default function OwnerProfilePage() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<any[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchOwnerProfile();
    fetchProducts();
    loadCart();
  }, [params.id]);

  const loadCart = () => {
    const savedCart = localStorage.getItem("foodCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const fetchOwnerProfile = async () => {
    try {
      const response = await fetch(`/api/owners/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setOwner(data.owner);
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/owners/${params.id}/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Optimized Add to Cart with Quantity Handling
  const addToCart = (product: Product) => {
    const existingCart = [...cart];
    const itemIndex = existingCart.findIndex(
      (item) => item._id === product._id,
    );

    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({
        ...product,
        quantity: 1,
        ownerId: params.id,
      });
    }

    setCart(existingCart);
    localStorage.setItem("foodCart", JSON.stringify(existingCart));
  };

  const categories = [
    "ALL",
    "MEALS",
    "DRINKS",
    "SNACKS",
    "DESSERTS",
    "APPETIZERS",
  ];

  const filteredProducts =
    products?.filter((product) => {
      const productName = product?.name || "";
      const productDescription = product?.description || "";
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch =
        productName.toLowerCase().includes(searchTermLower) ||
        productDescription.toLowerCase().includes(searchTermLower);

      const matchesCategory =
        selectedCategory === "ALL" ||
        product.category?.toUpperCase() === selectedCategory;

      return matchesSearch && matchesCategory && product.isAvailable;
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Store Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This store doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <Link
            href="/cart"
            className="relative p-2 bg-blue-50 text-blue-600 rounded-full"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Restaurant Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {owner.restaurantImage && (
            <img
              src={owner.restaurantImage}
              alt="Banner"
              className="w-full h-48 md:h-64 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
              <div className="relative">
                {owner.profileImage ? (
                  <img
                    src={owner.profileImage}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                    alt={owner.name}
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-4xl font-bold">
                    {(owner.restaurantName || owner.name).charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {owner.restaurantName || owner.name}
                </h1>
                <p className="text-blue-600 font-medium">
                  {owner.cuisine || "International"} Cuisine
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 border-t pt-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4 text-blue-500" />{" "}
                {owner.phone || "No phone"}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4 text-blue-500" /> {owner.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-blue-500" />{" "}
                {owner.address || "Main Street"}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />{" "}
                {owner.openingHours || "08:00 AM - 10:00 PM"}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="sticky top-[73px] bg-gray-50 py-4 z-20 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-black border-none rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="relative h-48 w-full">
                {product.image ? (
                  <img
                    src={product.image}
                    className="w-full h-full object-cover rounded-t-2xl"
                    alt={product.name}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-t-2xl text-4xl">
                    🍽️
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {product.preparationTime}m
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-xl font-black text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors flex items-center gap-2 px-4"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-bold">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No dishes found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Floating Mobile Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:hidden z-50">
          <Link
            href="/cart"
            className="bg-blue-600 text-white flex items-center justify-between px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="font-bold">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} Items Added
              </span>
            </div>
            <span className="font-black text-lg">View Cart</span>
          </Link>
        </div>
      )}
    </div>
  );
}
