"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowLeft,
  Store,
  CheckCircle,
  Edit,
  Camera,
  Upload,
  X,
  Save,
} from "lucide-react";

interface RestaurantProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  restaurantName?: string;
  restaurantDescription?: string;
  restaurantImage?: string;

  cuisine?: string;
  openingHours?: string;
  deliveryRadius: number;
  minOrder: number;
  isApproved: boolean;
  createdAt: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<RestaurantProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    if (parsedUser.role !== "OWNER") {
      router.push(parsedUser.role === "ADMIN" ? "/admin" : "/dashboard");
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/owner-profile/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.owner);
        setFormData(data.owner);
        setImagePreview(data.owner.profileImage);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const token = localStorage.getItem("token");
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "restaurant-profiles");

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          setImagePreview(data.url);
          setFormData({ ...formData!, profileImage: data.url });
        } else {
          alert("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading your image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData(data.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile");
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData!, profileImage: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
                  Manage your restaurant information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isEditing ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Restaurant Profile
              </h2>

              <div className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image"
                      />
                      <label
                        htmlFor="profile-image"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </label>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-500 hover:text-red-700 text-sm ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData?.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData!, name: e.target.value })
                      }
                      className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData?.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData!, email: e.target.value })
                      }
                      className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData?.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData!, phone: e.target.value })
                      }
                      className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Restaurant Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Restaurant Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={formData?.restaurantName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            restaurantName: e.target.value,
                          })
                        }
                        className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        value={formData?.cuisine || ""}
                        onChange={(e) =>
                          setFormData({ ...formData!, cuisine: e.target.value })
                        }
                        className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Italian, Chinese, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Hours
                      </label>
                      <input
                        type="text"
                        value={formData?.openingHours || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            openingHours: e.target.value,
                          })
                        }
                        className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9AM-10PM"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Radius (miles)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData?.deliveryRadius || 5}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            deliveryRadius: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData?.minOrder || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            minOrder: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full border text-gray-600 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Description
                    </label>
                    <textarea
                      value={formData?.restaurantDescription || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData!,
                          restaurantDescription: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your restaurant..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                {/* Profile Image */}
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-20 pb-8 px-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile?.name}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Store className="w-4 h-4" />
                        {profile?.restaurantName || "Restaurant Owner"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile?.cuisine || "Various Cuisine"}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            profile?.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {profile?.isApproved
                            ? "✅ Approved"
                            : "⏳ Pending Approval"}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        Member since{" "}
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-700">
                        {profile?.restaurantDescription ||
                          "No description available."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{profile?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Restaurant Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {profile?.openingHours || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          Delivery: {profile?.deliveryRadius || 5} miles
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          Min Order: ${profile?.minOrder?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link
                    href="/menu"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Store className="w-5 h-5" />
                    View Menu
                  </Link>

                  <Link
                    href="/dashboard"
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
