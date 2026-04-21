"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "CUSTOMER" as "CUSTOMER" | "OWNER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Real-time error trackers (without changing the input CSS)
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // --- Phone Logic ---
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      
      if (numericValue.length > 0 && numericValue[0] !== "0") {
        setPhoneError("Phone number must start with 0");
      } else if (numericValue.length > 10) {
        setPhoneError("Excess: Maximum 10 digits");
      } else if (numericValue.length > 0 && numericValue.length < 9) {
        setPhoneError("Lack: 9-10 digits required");
      } else {
        setPhoneError("");
      }
      setFormData({ ...formData, [name]: numericValue });
    } 

    // --- Email Logic ---
    else if (name === "email") {
      if (value.length > 0) {
        if (!value.includes("@") || !value.includes(".")) {
          setEmailError("Email must have @ and .");
        } else if (!value.endsWith(".com")) {
          setEmailError("Email must end with .com");
        } else {
          setEmailError("");
        }
      } else {
        setEmailError("");
      }
      setFormData({ ...formData, [name]: value });
    }

    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any errors exist before allowing submit
    if (phoneError) { setError(phoneError); return; }
    if (emailError) { setError(emailError); return; }
    if (formData.phone.length < 9) { setError("Phone number is too short"); return; }

    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login?message=Registration successful!");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Main Error Box (Shows phone/email errors here to avoid changing UI) */}
          {(error || phoneError || emailError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error || phoneError || emailError}
            </div>
          )}

          <div className="space-y-4">
            {/* Account Type */}
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-gray-900">Account Type</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Restaurant Owner</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900">Full Name</label>
              <div className="mt-1 relative">
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border text-gray-700 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your full name" />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email (Original UI) */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900">Email address</label>
              <div className="mt-1 relative">
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border text-gray-700 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Phone (Original UI) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-900">Phone Number</label>
              <div className="mt-1 relative">
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border text-gray-700 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your phone number" />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-gray-700">Address</label>
              <div className="mt-1 relative">
                <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your address" />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" title="password" className="block text-sm font-bold text-gray-900">Password</label>
              <div className="mt-1 relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border text-gray-700 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your password" />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900">Confirm Password</label>
              <div className="mt-1 relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border text-gray-600 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Confirm your password" />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
