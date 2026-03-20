"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Clock, Star, Filter } from "lucide-react";

interface MenuItem {
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

export default function MenuPage() {
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<any[]>([]);

  const categories = [
    "ALL",
    "MEALS",
    "DRINKS",
    "SNACKS",
    "DESSERTS",
    "APPETIZERS",
  ];

  useEffect(() => {
    // Sample data for now - will be replaced with API call
    const sampleMenu: MenuItem[] = [
      {
        _id: "1",
        name: "Classic Burger",
        description:
          "Juicy beef patty with lettuce, tomato, and our special sauce",
        price: 12.99,
        category: "MEALS",
        preparationTime: 15,
        isAvailable: true,
        spicyLevel: 0,
        ingredients: ["Beef", "Lettuce", "Tomato", "Bun", "Special Sauce"],
        allergens: ["Gluten", "Soy"],
      },
      {
        _id: "2",
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        price: 8.99,
        category: "APPETIZERS",
        preparationTime: 10,
        isAvailable: true,
        spicyLevel: 0,
        ingredients: [
          "Romaine Lettuce",
          "Parmesan",
          "Croutons",
          "Caesar Dressing",
        ],
        allergens: ["Dairy", "Gluten"],
      },
      {
        _id: "3",
        name: "Spicy Chicken Wings",
        description: "Crispy chicken wings with our signature spicy sauce",
        price: 10.99,
        category: "APPETIZERS",
        preparationTime: 20,
        isAvailable: true,
        spicyLevel: 3,
        ingredients: ["Chicken", "Spicy Sauce", "Seasoning"],
        allergens: [],
      },
      {
        _id: "4",
        name: "Fresh Lemonade",
        description: "Refreshing homemade lemonade with natural ingredients",
        price: 3.99,
        category: "DRINKS",
        preparationTime: 5,
        isAvailable: true,
        spicyLevel: 0,
        ingredients: ["Lemon", "Sugar", "Water", "Ice"],
        allergens: [],
      },
      {
        _id: "5",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with layers of chocolate frosting",
        price: 6.99,
        category: "DESSERTS",
        preparationTime: 5,
        isAvailable: true,
        spicyLevel: 0,
        ingredients: ["Chocolate", "Flour", "Sugar", "Eggs", "Butter"],
        allergens: ["Gluten", "Dairy", "Eggs"],
      },
      {
        _id: "6",
        name: "French Fries",
        description: "Crispy golden french fries with sea salt",
        price: 4.99,
        category: "SNACKS",
        preparationTime: 10,
        isAvailable: true,
        spicyLevel: 0,
        ingredients: ["Potatoes", "Sea Salt", "Oil"],
        allergens: [],
      },
    ];

    setFoods(sampleMenu);
    setLoading(false);
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || food.category === selectedCategory;
    return matchesSearch && matchesCategory && food.isAvailable;
  });

  const addToCart = (food: MenuItem) => {
    setCart([...cart, { ...food, quantity: 1 }]);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
              <p className="text-gray-600 mt-1">
                Browse our delicious food items
              </p>
            </div>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
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

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">🍽️</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {food.name}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Available
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{food.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {food.preparationTime} min
                  </div>
                  {food.spicyLevel > 0 && (
                    <div className="flex items-center gap-1">
                      <span>🌶️</span>
                      {food.spicyLevel}/5
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${food.price}
                  </span>
                  <button
                    onClick={() => addToCart(food)}
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

        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
