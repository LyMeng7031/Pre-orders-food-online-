"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Check,
  X,
  Eye,
  Search,
  Filter,
  LogOut,
  Settings,
  BarChart3,
} from "lucide-react";

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  restaurantName?: string;
  restaurantDescription?: string;
  cuisine?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check authentication and admin role
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "ADMIN") {
      router.push("/customer");
      return;
    }

    setUser(parsedUser);
    fetchOwners();
  }, [router]);

  const fetchOwners = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/owners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOwners(data.owners);
      } else {
        console.error("Failed to fetch owners:", data.error);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ownerId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owners/${ownerId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOwners(
          owners.map((owner) =>
            owner._id === ownerId
              ? {
                  ...owner,
                  isApproved: true,
                  approvalDate: new Date().toISOString(),
                }
              : owner,
          ),
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve owner");
      }
    } catch (error) {
      console.error("Error approving owner:", error);
      alert("An error occurred while approving the owner");
    }
  };

  const handleReject = async (ownerId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owners/${ownerId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        setOwners(
          owners.map((owner) =>
            owner._id === ownerId
              ? { ...owner, isApproved: false, rejectionReason }
              : owner,
          ),
        );
        setRejectionReason("");
        setShowDetails(false);
        setSelectedOwner(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject owner");
      }
    } catch (error) {
      console.error("Error rejecting owner:", error);
      alert("An error occurred while rejecting the owner");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (owner.restaurantName &&
        owner.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && !owner.isApproved) ||
      (filterStatus === "APPROVED" && owner.isApproved) ||
      (filterStatus === "REJECTED" &&
        !owner.isApproved &&
        owner.rejectionReason);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage restaurant owner approvals</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Owners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {owners.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-900">
                  {
                    owners.filter((o) => !o.isApproved && !o.rejectionReason)
                      .length
                  }
                </p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {owners.filter((o) => o.isApproved).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {
                    owners.filter((o) => !o.isApproved && o.rejectionReason)
                      .length
                  }
                </p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {owner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {owner.email}
                        </div>
                        {owner.phone && (
                          <div className="text-sm text-gray-500">
                            {owner.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {owner.restaurantName || "Not specified"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {owner.cuisine || "Not specified"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          owner.isApproved
                            ? "bg-green-100 text-green-800"
                            : owner.rejectionReason
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {owner.isApproved
                          ? "Approved"
                          : owner.rejectionReason
                            ? "Rejected"
                            : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(owner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOwner(owner);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!owner.isApproved && !owner.rejectionReason && (
                          <>
                            <button
                              onClick={() => handleApprove(owner._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOwner(owner);
                                setShowDetails(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOwners.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No owners found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "No restaurant owners have registered yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Details Modal */}
      {showDetails && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Owner Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedOwner(null);
                    setRejectionReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Personal Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-gray-600">
                      <strong>Name:</strong> {selectedOwner.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong> {selectedOwner.email}
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong>{" "}
                      {selectedOwner.phone || "Not provided"}
                    </p>
                    <p className="text-gray-600">
                      <strong>Address:</strong>{" "}
                      {selectedOwner.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Restaurant Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-gray-600">
                      <strong>Restaurant Name:</strong>{" "}
                      {selectedOwner.restaurantName || "Not provided"}
                    </p>
                    <p className="text-gray-600">
                      <strong>Cuisine:</strong>{" "}
                      {selectedOwner.cuisine || "Not provided"}
                    </p>
                    <p className="text-gray-600">
                      <strong>Description:</strong>{" "}
                      {selectedOwner.restaurantDescription || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Application Status
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <strong className="text-gray-600">Status:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedOwner.isApproved
                            ? "bg-green-100 text-green-800"
                            : selectedOwner.rejectionReason
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedOwner.isApproved
                          ? "Approved"
                          : selectedOwner.rejectionReason
                            ? "Rejected"
                            : "Pending"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <strong>Applied Date:</strong>{" "}
                      {new Date(selectedOwner.createdAt).toLocaleDateString()}
                    </p>
                    {selectedOwner.rejectionReason && (
                      <p className="text-gray-600">
                        <strong>Rejection Reason:</strong>{" "}
                        {selectedOwner.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {!selectedOwner.isApproved &&
                  !selectedOwner.rejectionReason && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Actions
                      </h3>
                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={() => handleApprove(selectedOwner._id)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4 inline mr-2" />
                          Approve Application
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to reject this application? You'll need to provide a reason.",
                              )
                            ) {
                              const reason = prompt(
                                "Please provide a reason for rejection:",
                              );
                              if (reason) {
                                setRejectionReason(reason);
                                handleReject(selectedOwner._id);
                              }
                            }
                          }}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4 inline mr-2" />
                          Reject Application
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
