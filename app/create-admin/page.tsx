"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const createAdmin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ ${data.message}\n\n📧 Email: ${data.email}\n🔑 Password: ${data.password}\n\nYou can now login with these credentials.`,
        );
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Create Admin Account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            This will create the system administrator account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Admin..." : "Create Admin Account"}
          </button>

          {message && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {message}
              </pre>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
