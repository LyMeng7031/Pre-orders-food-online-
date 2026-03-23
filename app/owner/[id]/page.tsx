"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Clock,
  Star,
  Search,
  ArrowLeft,
  Store,
  Phone,
  Mail,
  MapPin,
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

  const addToCart = (product: Product) => {
    const newCart = [...cart, { ...product, quantity: 1, ownerId: params.id }];
    setCart(newCart);
    localStorage.setItem("foodCart", JSON.stringify(newCart));
  };

  const categories = [
    "ALL",
    "MEALS",
    "DRINKS",
    "SNACKS",
    "DESSERTS",
    "APPETIZERS",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isAvailable;
  });

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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Owner Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Restaurant Cover Image */}
          {owner.restaurantImage && (
            <div className="mb-6 -mx-4 -mt-4">
              <img
                src={owner.restaurantImage}
                alt={owner.restaurantName || owner.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              {owner.profileImage ? (
                <img
                  src={owner.profileImage}
                  alt={owner.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {(owner.restaurantName || owner.name)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {owner.restaurantName || owner.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {owner.cuisine && `${owner.cuisine} Cuisine`}
                </p>
              </div>
            </div>

            <div className="flex-1 md:text-right">
              <Link
                href="/cart"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </Link>
            </div>
          </div>

          {/* Restaurant Description */}
          {owner.restaurantDescription && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {owner.restaurantDescription}
              </p>
            </div>
          )}

          {/* Restaurant Info */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{owner.phone || "Not available"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{owner.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {owner.address || "Address not provided"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {owner.openingHours || "Hours not specified"}
              </span>
            </div>
          </div>

          {/* Delivery Info */}
          {(owner.deliveryRadius || owner.minOrder) && (
            <div className="mt-4 flex gap-4">
              {owner.deliveryRadius && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  🚚 Delivery within {owner.deliveryRadius} miles
                </div>
              )}
              {owner.minOrder && owner.minOrder > 0 && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  💰 Min order: ${owner.minOrder}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-6xl">🍽️</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Available
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{product.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {product.preparationTime} min
                    </div>
                    {product.spicyLevel > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🌶️</span>
                        {product.spicyLevel}/5
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
