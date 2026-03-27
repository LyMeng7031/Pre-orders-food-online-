"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Edit3,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Store,
  Utensils,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import Button from "@/components/ui/FormField";
import { Input, Textarea, Select } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

interface RestaurantProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  restaurantDescription: string;
  restaurantImage: string;
  cuisine: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  deliveryRadius: number;
  minOrder: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

const CUISINE_TYPES = [
  { value: "khmer", label: "Khmer" },
  { value: "chinese", label: "Chinese" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "thai", label: "Thai" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "korean", label: "Korean" },
  { value: "american", label: "American" },
  { value: "fast-food", label: "Fast Food" },
  { value: "cafe", label: "Cafe" },
  { value: "bakery", label: "Bakery" },
  { value: "seafood", label: "Seafood" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "international", label: "International" },
];

const DEFAULT_OPENING_HOURS = {
  monday: "09:00-22:00",
  tuesday: "09:00-22:00",
  wednesday: "09:00-22:00",
  thursday: "09:00-22:00",
  friday: "09:00-22:00",
  saturday: "09:00-23:00",
  sunday: "09:00-23:00",
};

export default function RestaurantProfilePage() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    restaurantName: "",
    restaurantDescription: "",
    cuisine: "",
    openingHours: DEFAULT_OPENING_HOURS,
    deliveryRadius: "5",
    minOrder: "10",
    restaurantImage: "",
  });

  const router = useRouter();

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/restaurant-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.restaurant && data.restaurant.restaurantName) {
          // Profile exists
          setProfile(data.restaurant);
          setFormData({
            name: data.restaurant.name || "",
            email: data.restaurant.email || "",
            phone: data.restaurant.phone || "",
            restaurantName: data.restaurant.restaurantName || "",
            restaurantDescription: data.restaurant.restaurantDescription || "",
            cuisine: data.restaurant.cuisine || "",
            openingHours: data.restaurant.openingHours || DEFAULT_OPENING_HOURS,
            deliveryRadius: data.restaurant.deliveryRadius?.toString() || "5",
            minOrder: data.restaurant.minOrder?.toString() || "10",
            restaurantImage: data.restaurant.restaurantImage || "",
          });
          setImagePreview(data.restaurant.restaurantImage || null);
        } else {
          // Profile doesn't exist
          setProfile(null);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to check profile status");
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const token = localStorage.getItem("token");
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "restaurants");

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
          setFormData({ ...formData, restaurantImage: data.url });
        } else {
          alert("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading your image");
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Owner name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = "Restaurant name is required";
    }
    if (!formData.cuisine) {
      newErrors.cuisine = "Cuisine type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isCreate = false) => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = isCreate ? "/api/create-profile" : "/api/restaurant-profile";
      const method = isCreate ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          deliveryRadius: parseFloat(formData.deliveryRadius),
          minOrder: parseFloat(formData.minOrder),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          isCreate
            ? "Profile created successfully!"
            : "Profile updated successfully!",
        );

        if (isCreate) {
          // After creation, fetch new profile
          await checkProfileStatus();
          setIsEditing(false);
        } else {
          // After update, update local state
          setProfile(data.restaurant);
          setIsEditing(false);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred while saving your profile");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    if (!profile) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/restaurant-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          isActive: !profile.isActive,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.restaurant);
        setShowStatusModal(false);
        alert(`Restaurant is now ${!profile.isActive ? "Open" : "Closed"}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status");
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, restaurantImage: "" });
  };

  const startEditing = () => {
    setIsEditing(true);
    setErrors({});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (profile) {
      // Reset form to original data
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        restaurantName: profile.restaurantName || "",
        restaurantDescription: profile.restaurantDescription || "",
        cuisine: profile.cuisine || "",
        openingHours: profile.openingHours || DEFAULT_OPENING_HOURS,
        deliveryRadius: profile.deliveryRadius?.toString() || "5",
        minOrder: profile.minOrder?.toString() || "10",
        restaurantImage: profile.restaurantImage || "",
      });
      setImagePreview(profile.restaurantImage || null);
    }
    setErrors({});
  };

  const ProfileForm = ({ isCreate = false }: { isCreate?: boolean }) => (
    <div className="space-y-6">
      {/* Restaurant Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Image
        </label>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="restaurant-image"
            />
            <label
              htmlFor="restaurant-image"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
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

      {/* Owner Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Owner Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
        />
      </div>

      {/* Restaurant Information */}
      <div className="space-y-4">
        <Input
          label="Restaurant Name"
          value={formData.restaurantName}
          onChange={(value) =>
            setFormData({ ...formData, restaurantName: value })
          }
          error={errors.restaurantName}
          required
        />

        <Textarea
          label="Restaurant Description"
          value={formData.restaurantDescription}
          onChange={(value) =>
            setFormData({ ...formData, restaurantDescription: value })
          }
          rows={4}
          placeholder="Describe your restaurant, ambiance, specialties..."
        />

        <Select
          label="Cuisine Type"
          value={formData.cuisine}
          onChange={(value) => setFormData({ ...formData, cuisine: value })}
          error={errors.cuisine}
          options={CUISINE_TYPES}
          placeholder="Select cuisine type"
        />
      </div>

      {/* Operating Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Delivery Radius (km)"
          type="number"
          min="1"
          step="0.5"
          value={formData.deliveryRadius}
          onChange={(value) =>
            setFormData({ ...formData, deliveryRadius: value })
          }
        />

        <Input
          label="Minimum Order ($)"
          type="number"
          min="0"
          step="1"
          value={formData.minOrder}
          onChange={(value) => setFormData({ ...formData, minOrder: value })}
        />
      </div>

      {/* Opening Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Opening Hours
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(formData.openingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-2">
              <label className="text-sm text-gray-600 capitalize w-20">
                {day}:
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingHours: {
                      ...formData.openingHours,
                      [day]: e.target.value,
                    },
                  })
                }
                placeholder="09:00-22:00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {!isCreate && (
          <Button onClick={cancelEditing} variant="secondary">
            Cancel
          </Button>
        )}
        <Button onClick={() => handleSubmit(isCreate)} loading={submitting}>
          <Save className="w-4 h-4" />
          {isCreate ? "Create Profile" : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={checkProfileStatus}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // CONDITIONAL RENDERING LOGIC:
  // If profile doesn't exist OR restaurantName is empty → Show Create Profile Form
  // If profile exists → Show Profile Page (View/Edit Mode)
  if (!profile || !profile.restaurantName) {
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
                  <ChevronLeft className="w-5 h-5" />
                  Back to Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create Restaurant Profile
                  </h1>
                  <p className="text-gray-600">
                    Set up your restaurant information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Profile Form */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Restaurant Information
                </h2>
                <p className="text-gray-600">
                  Please provide your restaurant details to get started with the
                  ordering system.
                </p>
              </div>
              <ProfileForm isCreate />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile exists - Show Profile Page with View/Edit modes
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
                <ChevronLeft className="w-5 h-5" />
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

            <div className="flex items-center gap-3">
              {/* Status Toggle */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profile.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {profile.isActive ? "Open" : "Closed"}
                </span>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Toggle
                </button>
              </div>

              {/* Approval Status */}
              {profile.isApproved ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Approved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Pending Approval
                </span>
              )}

              {/* Edit/Save Buttons */}
              {!isEditing ? (
                <Button onClick={startEditing}>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={cancelEditing} variant="secondary">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={() => handleSubmit()} loading={submitting}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!isEditing ? (
            /* VIEW MODE - Display Profile Information */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Restaurant Image and Basic Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Restaurant Image */}
                  <div className="h-48 bg-gray-100">
                    {profile.restaurantImage ? (
                      <img
                        src={profile.restaurantImage}
                        alt={profile.restaurantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {profile.restaurantName}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {profile.restaurantDescription}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">
                          {profile.phone || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Utensils className="w-4 h-4" />
                        <span className="text-sm capitalize">
                          {profile.cuisine || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Operating Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Operating Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Delivery Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            Delivery Radius: {profile.deliveryRadius || 5} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">
                            Minimum Order: ${profile.minOrder || 10}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              profile.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            Restaurant is {profile.isActive ? "Open" : "Closed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              profile.isApproved
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            {profile.isApproved
                              ? "Approved"
                              : "Pending Approval"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <Clock className="w-5 h-5 inline mr-2" />
                    Opening Hours
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.openingHours &&
                      Object.entries(profile.openingHours).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {day}
                            </span>
                            <span className="text-sm text-gray-600">
                              {hours || "Closed"}
                            </span>
                          </div>
                        ),
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE - Show Edit Form */
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Edit Restaurant Profile
                </h2>
                <p className="text-gray-600">
                  Update your restaurant information. All changes will be
                  reflected immediately.
                </p>
              </div>
              <ProfileForm />
            </div>
          )}
        </div>
      </div>

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={toggleRestaurantStatus}
        title={`${profile.isActive ? "Close" : "Open"} Restaurant`}
        message={`Are you sure you want to ${profile.isActive ? "close" : "open"} your restaurant? This will affect customer ordering.`}
        confirmText={profile.isActive ? "Close Restaurant" : "Open Restaurant"}
        loading={submitting}
      />
    </div>
  );
}
