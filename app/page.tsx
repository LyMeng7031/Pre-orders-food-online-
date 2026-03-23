import Link from "next/link";
import { Clock, Users, ChefHat, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Pre-Order Food Online System
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Skip the waiting time! Order your favorite meals in advance and
              pick them up when ready. Convenient, fast, and designed for your
              busy lifestyle.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/menu"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Order Now
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Browse Menu
              </h3>
              <p className="text-gray-600">
                Explore our delicious food offerings and select your favorites
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Place Order
              </h3>
              <p className="text-gray-600">
                Add items to cart and specify your pickup time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Track Status
              </h3>
              <p className="text-gray-600">
                Monitor your order preparation in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Quick Pickup
              </h3>
              <p className="text-gray-600">
                Skip the line and collect your food when ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Our System?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">
                Save Time
              </h3>
              <p className="text-gray-700">
                No more waiting in lines. Your order is ready when you arrive.
              </p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">
                Easy Ordering
              </h3>
              <p className="text-gray-700">
                Simple and intuitive interface for hassle-free ordering.
              </p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">
                Fresh Food
              </h3>
              <p className="text-gray-700">
                Orders are prepared fresh at your scheduled pickup time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Popular Categories
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "Meals",
                icon: "🍽️",
                color: "bg-orange-100 text-orange-600",
              },
              {
                name: "Drinks",
                icon: "🥤",
                color: "bg-blue-100 text-blue-600",
              },
              {
                name: "Snacks",
                icon: "🍿",
                color: "bg-green-100 text-green-600",
              },
              {
                name: "Desserts",
                icon: "🍰",
                color: "bg-pink-100 text-pink-600",
              },
            ].map((category) => (
              <div
                key={category.name}
                className="text-center bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div
                  className={`${category.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl`}
                >
                  {category.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Deadline Warning */}
      {/* <section className="bg-yellow-50 border-t-4 border-yellow-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">
            Order Deadline Reminder
          </h3>
          <p className="text-yellow-700 text-lg">
            Place your orders at least 30 minutes before pickup time to ensure
            availability
          </p>
        </div>
      </section> */}

      {/* Call to Action
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers who save time with our
            pre-order system
          </p>
          <Link
            href="/menu"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block text-lg"
          >
            View Menu
          </Link>
        </div>
      </section> */}
    </div>
  );
}
