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
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

// --- TYPES & CONSTANTS ---
interface RestaurantProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  restaurantDescription: string;
  restaurantImage: string;
  cuisine: string;
  openingHours: Record<string, string>;
  deliveryRadius: number;
  minOrder: number;
  isApproved: boolean;
  isActive: boolean;
}

const CUISINE_TYPES = [{ value: "vietnamese", label: "Vietnamese" }, { value: "khmer", label: "Khmer" }];
const DEFAULT_OPENING_HOURS = { monday: "09:00-22:00", tuesday: "09:00-22:00", wednesday: "09:00-22:00", thursday: "09:00-22:00", friday: "09:00-22:00", saturday: "09:00-23:00", sunday: "09:00-23:00" };

// --- SUB-COMPONENT: EDIT FORM (Defined outside to prevent focus loss) ---
const ProfileForm = ({ formData, setFormData, errors, handleImageUpload, imagePreview, removeImage, isCreate, cancelEditing, handleSubmit, submitting }: any) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image</label>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border">
          {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Store className="w-12 h-12 text-gray-400 m-auto mt-14" />}
        </div>
        <div className="flex flex-col gap-2">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="restaurant-image" />
          <label htmlFor="restaurant-image" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer flex items-center gap-2 hover:bg-blue-700"><Camera size={16} /> Upload</label>
          {imagePreview && <button onClick={removeImage} className="text-red-500 text-sm hover:underline">Remove Image</button>}
        </div>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-4 text-gray-600">
      <Input label="Owner Name" value={formData.name} onChange={(val: string) => setFormData((p: any) => ({ ...p, name: val }))} error={errors.name} required />
      <Input label="Email" value={formData.email} onChange={(val: string) => setFormData((p: any) => ({ ...p, email: val }))} error={errors.email} required />
      <Input label="Phone" value={formData.phone} onChange={(val: string) => setFormData((p: any) => ({ ...p, phone: val }))} />
      <Input label="Restaurant Name" value={formData.restaurantName} onChange={(val: string) => setFormData((p: any) => ({ ...p, restaurantName: val }))} error={errors.restaurantName} required />
    </div>
    <Textarea className="text-gray-600" label="Description" value={formData.restaurantDescription} onChange={(val: string) => setFormData((p: any) => ({ ...p, restaurantDescription: val }))} />
    <div className="flex justify-end gap-3 pt-4 border-t">
      {!isCreate && <Button onClick={cancelEditing} variant="secondary">Cancel</Button>}
      <Button onClick={() => handleSubmit(isCreate)} loading={submitting} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function RestaurantProfilePage() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", restaurantName: "", restaurantDescription: "", cuisine: "", openingHours: DEFAULT_OPENING_HOURS, deliveryRadius: "5", minOrder: "10", restaurantImage: "" });

  useEffect(() => { checkProfileStatus(); }, []);

  const checkProfileStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/restaurant-profile", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.restaurant) {
          setProfile(data.restaurant);
          setFormData({ ...data.restaurant, deliveryRadius: data.restaurant.deliveryRadius?.toString(), minOrder: data.restaurant.minOrder?.toString() });
          setImagePreview(data.restaurant.restaurantImage);
        }
      }
    } finally { setLoading(false); }
  };

  const handleSubmit = async (isCreate = false) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(isCreate ? "/api/create-profile" : "/api/restaurant-profile", {
        method: isCreate ? "POST" : "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, deliveryRadius: parseFloat(formData.deliveryRadius), minOrder: parseFloat(formData.minOrder) }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.restaurant);
        setIsEditing(false);
      }
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-10"><Skeleton className="h-96 w-full rounded-xl" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Bar */}
      {/* Removed 'sticky top-0 z-10' to allow the header to scroll with the page */}
<header className="bg-white border-b px-6 py-4">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-6">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium">
        <ChevronLeft size={18} /> Back to Dashboard
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Restaurant Profile</h1>
        <p className="text-xs text-gray-500">Manage your restaurant information</p>
      </div>
    </div>

    {profile && (

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${profile.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {profile.isActive ? "Open" : "Closed"}
          </span>
          <button onClick={() => setShowStatusModal(true)} className="text-blue-600 hover:underline text-xs font-semibold">Toggle</button>
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
          <CheckCircle size={14} /> Approved
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#2563eb] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
          {isEditing ? <X size={16} /> : <Edit3 size={16} />}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    )}
  </div>
</header>

      <main className="max-w-7xl mx-auto p-8">
        {!isEditing && profile ? (
          /* --- VIEW MODE: EXACTLY LIKE SCREENSHOT --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Sidebar Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="aspect-video w-full bg-gray-200">
                  {profile.restaurantImage ? (
                    <img src={profile.restaurantImage} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={48} /></div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.restaurantName}</h2>
                    <p className="text-gray-500 text-sm mt-1">{profile.restaurantDescription}</p>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Mail size={16} className="text-gray-400" /> <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Phone size={16} className="text-gray-400" /> <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Utensils size={16} className="text-gray-400" /> <span className="capitalize">{profile.cuisine}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Operating Details Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-base font-bold text-gray-900 mb-6">Operating Details</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Delivery Information</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin size={16} className="text-gray-400" /> Delivery Radius: {profile.deliveryRadius} km
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign size={16} className="text-gray-400" /> Minimum Order: ${profile.minOrder}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <div className={`w-2.5 h-2.5 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        Restaurant is {profile.isActive ? 'Open' : 'Closed'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        Approved
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={18} className="text-gray-900" />
                  <h3 className="text-base font-bold text-gray-900">Opening Hours</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {Object.entries(profile.openingHours || {}).map(([day, time]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-600 capitalize">{day}</span>
                      <span className="text-sm text-gray-900 font-mono">{time || "Closed"}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* --- EDIT MODE --- */
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-600">Edit Profile</h2>
            <ProfileForm 
              formData={formData} setFormData={setFormData} errors={errors} 
              handleImageUpload={() => {}} imagePreview={imagePreview} 
              isCreate={!profile} cancelEditing={() => setIsEditing(false)} 
              handleSubmit={handleSubmit} submitting={submitting} 
            />
          </div>
        )}
      </main>

      <ConfirmModal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
        onConfirm={async () => { /* status logic */ }} 
        title="Toggle Status" 
        message="Change visibility for customers?" 
      />
    </div>
  );
}