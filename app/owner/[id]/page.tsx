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
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== "CUSTOMER") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    fetchOwnerProfile();
    fetchProducts();
    loadCart();
  }, [params.id, router]);

  const loadCart = () => {
    const savedCart = localStorage.getItem("foodCart");
    if (savedCart) setCart(JSON.parse(savedCart));
  };

  const fetchOwnerProfile = async () => {
    try {
      const response = await fetch(`/api/owners/${params.id}`);
      const data = await response.json();
      if (response.ok) setOwner(data.owner);
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/owners/${params.id}/products`);
      const data = await response.json();
      if (response.ok) setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingCart = [...cart];
    const itemIndex = existingCart.findIndex(
      (item) => item._id === product._id,
    );
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1, ownerId: params.id });
    }
    setCart(existingCart);
    localStorage.setItem("foodCart", JSON.stringify(existingCart));
  };

  const categories = ["ALL", "DESSERTS", "APPETIZERS"];

  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" ||
        product.category?.toUpperCase() === selectedCategory;
      return matchesSearch && matchesCategory && product.isAvailable;
    }) || [];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!owner) return <div className="p-20 text-center">Store Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            <h2 className="hidden md:block font-bold text-gray-800 text-lg">
              Restaurant Profile
            </h2>
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
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: Profile Card */}
          <aside className="lg:col-span-4 sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              {owner.restaurantImage && (
                <img
                  src={owner.restaurantImage}
                  alt="Restaurant"
                  className="w-full h-64 object-cover object-top"
                />
              )}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {owner.restaurantName || owner.name}
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                  {owner.restaurantDescription || "Welcome to my restaurant"}
                </p>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-500" />
                    </div>
                    {owner.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-500" />
                    </div>
                    {owner.phone || "N/A"}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Store className="w-4 h-4 text-blue-500" />
                    </div>
                    {owner.cuisine || "Vietnamese"}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Menu Content */}
          <div className="lg:col-span-8">
            {/* Search and Category Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for your favorite dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                >
                  <div className="relative h-44">
                    {product.image ? (
                      <img
                        src={product.image}
                        className="w-full h-full object-cover"
                        alt={product.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />{" "}
                      {product.preparationTime} min
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-1 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-black text-blue-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No dishes found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:hidden z-50">
          <Link
            href="/cart"
            className="bg-blue-600 text-white flex items-center justify-between px-6 py-4 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} Items
              </span>
            </div>
            <span className="font-bold">View Cart</span>
          </Link>
        </div>
      )}
    </div>
  );
}
