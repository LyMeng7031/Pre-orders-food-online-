"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    restaurantName: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    await fetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify(form),
    });

    alert("Profile updated!");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Owner Profile</h1>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <input
        name="restaurantName"
        placeholder="Restaurant Name"
        value={form.restaurantName}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <textarea
        name="bio"
        placeholder="Description"
        value={form.bio}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Profile
      </button>
    </div>
  );
}
