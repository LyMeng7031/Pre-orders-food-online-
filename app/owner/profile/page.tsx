"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  restaurantName: string;
  restaurantDescription: string;
  cuisine: string;
  openingHours: string;
  deliveryRadius: string;
  minOrder: string;
  profileImage: string;
  restaurantImage: string;
}

export default function OwnerProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    restaurantName: "",
    restaurantDescription: "",
    cuisine: "",
    openingHours: "",
    deliveryRadius: "",
    minOrder: "",
    profileImage: "",
    restaurantImage: "",
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [restaurantImagePreview, setRestaurantImagePreview] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load existing profile
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "OWNER") {
      router.push("/customer");
      return;
    }

    // Load existing user data
    setFormData({
      ...formData,
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      address: parsedUser.address || "",
      profileImage: parsedUser.profileImage || "",
    });

    if (parsedUser.profileImage) {
      setProfileImagePreview(parsedUser.profileImage);
    }

    // Load additional profile data
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/owner/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setFormData({
            ...formData,
            ...data.profile,
          });
          if (data.profile.profileImage) {
            setProfileImagePreview(data.profile.profileImage);
          }
          if (data.profile.restaurantImage) {
            setRestaurantImagePreview(data.profile.restaurantImage);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const cuisines = [
    "American",
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "Thai",
    "French",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        setFormData({
          ...formData,
          profileImage: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestaurantImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setRestaurantImagePreview(result);
        setFormData({
          ...formData,
          restaurantImage: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImagePreview("");
    setFormData({
      ...formData,
      profileImage: "",
    });
  };

  const removeRestaurantImage = () => {
    setRestaurantImagePreview("");
    setFormData({
      ...formData,
      restaurantImage: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        restaurantName: formData.restaurantName,
        restaurantDescription: formData.restaurantDescription,
        cuisine: formData.cuisine,
        openingHours: formData.openingHours,
        deliveryRadius: parseFloat(formData.deliveryRadius),
        minOrder: parseFloat(formData.minOrder),
        profileImage: formData.profileImage,
        restaurantImage: formData.restaurantImage,
      };

      const response = await fetch("/api/owner/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");

        // Update localStorage with new user data
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          profileImage: formData.profileImage,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant Profile
              </h1>
              <p className="text-gray-600">
                Create and manage your restaurant information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            {/* Profile Images */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Restaurant Images
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {profileImagePreview ? (
                      <div className="relative">
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Upload a professional photo of yourself or your
                        restaurant logo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Restaurant Image */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Restaurant Cover Image
                  </label>
                  <div className="flex items-center gap-4">
                    {restaurantImagePreview ? (
                      <div className="relative">
                        <img
                          src={restaurantImagePreview}
                          alt="Restaurant"
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeRestaurantImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRestaurantImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Show off your restaurant with a beautiful cover photo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amazing Restaurant"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Restaurant Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Restaurant Description *
                </label>
                <textarea
                  name="restaurantDescription"
                  value={formData.restaurantDescription}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell customers about your restaurant, your story, and what makes your food special..."
                />
              </div>
            </div>

            {/* Restaurant Details */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Restaurant Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Cuisine Type *
                  </label>
                  <select
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select cuisine type</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mon-Sun: 9:00 AM - 10:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Delivery Radius (miles)
                  </label>
                  <input
                    type="number"
                    name="deliveryRadius"
                    value={formData.deliveryRadius}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Minimum Order ($)
                  </label>
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10.00"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving Profile..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
