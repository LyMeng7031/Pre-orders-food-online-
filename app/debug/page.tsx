"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setDebugInfo({
        token: token.substring(0, 20) + "...",
        user: parsedUser,
        isApproved: parsedUser.isApproved,
        role: parsedUser.role,
        localStorage: {
          token: !!token,
          user: !!userData,
          parsedUser: parsedUser,
        },
      });
    }
  }, []);

  const testApproval = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/owners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Admin API Response:", data);
      setDebugInfo((prev) => ({ ...prev, adminApiResponse: data }));
    } catch (error) {
      console.error("Admin API Error:", error);
      setDebugInfo((prev) => ({ ...prev, adminApiError: error }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Approval System</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <button
          onClick={testApproval}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Test Admin API
        </button>

        <div className="mt-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if admin account exists in database</li>
              <li>Verify admin role is set to "ADMIN"</li>
              <li>Ensure admin.isApproved is true</li>
              <li>Check JWT token includes correct user data</li>
              <li>Verify login API returns isApproved field</li>
              <li>Test approval API endpoint directly</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h3 className="font-semibold mb-2">Expected Behavior:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Owner registers → isApproved: false</li>
              <li>Admin approves → isApproved: true</li>
              <li>Owner logs in → should work if isApproved: true</li>
              <li>Owner logs in → should fail if isApproved: false</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
