"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Check,
  X,
  Eye,
  Search,
  Filter,
  LogOut,
  Settings,
  BarChart3,
  Utensils,
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
  isApproved: boolean;
  rejectionReason?: string;
  createdAt: string;
}

const menuItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "Owners", icon: Users, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setOwners(data.owners);
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setOwners((prev) =>
          prev.map((owner) =>
            owner._id === ownerId ? { ...owner, isApproved: true, rejectionReason: undefined } : owner
          )
        );
        setShowDetails(false);
      }
    } catch (error) {
      alert("An error occurred during approval.");
    }
  };

  const handleReject = async (ownerId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owners/${ownerId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: reason }),
      });

      if (response.ok) {
        setOwners((prev) =>
          prev.map((owner) =>
            owner._id === ownerId ? { ...owner, isApproved: false, rejectionReason: reason } : owner
          )
        );
        setShowDetails(false);
        setSelectedOwner(null);
      }
    } catch (error) {
      alert("An error occurred during rejection.");
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
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && !owner.isApproved && !owner.rejectionReason) ||
      (filterStatus === "APPROVED" && owner.isApproved) ||
      (filterStatus === "REJECTED" && !!owner.rejectionReason);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm h-screen sticky top-0 flex flex-col border-r border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Utensils size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">FoodAdmin</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  item.active ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white border-b sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owners Management</h1>
            <p className="text-sm text-gray-400">Review and verify restaurant applications</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors py-2 px-4 rounded-lg hover:bg-red-50">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </header>

        <div className="p-8">
          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total" value={owners.length} color="blue" />
            <StatCard title="Pending" value={owners.filter(o => !o.isApproved && !o.rejectionReason).length} color="orange" />
            <StatCard title="Approved" value={owners.filter(o => o.isApproved).length} color="green" />
            <StatCard title="Rejected" value={owners.filter(o => !!o.rejectionReason).length} color="red" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/30 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 border text-gray-600 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 text-gray-600 rounded-lg px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-8 py-4">Owner Info</th>
                  <th className="px-8 py-4">Restaurant</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-semibold text-gray-900 text-sm">{owner.name}</div>
                      <div className="text-xs text-gray-400">{owner.email}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{owner.phone}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-gray-600">{owner.restaurantName || "Not specified"}</div>
                      <div className="text-xs text-gray-400 italic">{owner.cuisine || "Not specified"}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        owner.isApproved ? "bg-green-100 text-green-700" :
                        owner.rejectionReason ? "bg-red-50 text-red-600 border border-red-100" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {owner.isApproved ? "Approved" : owner.rejectionReason ? "Rejected" : "Pending"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">
                       {new Date(owner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedOwner(owner); setShowDetails(true); }} 
                          className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-all shadow-sm border border-transparent hover:border-blue-200"
                        >
                          <Eye size={16} />
                        </button>
                        {!owner.isApproved && !owner.rejectionReason && (
                          <>
                            <button 
                              onClick={() => handleApprove(owner._id)} 
                              className="p-1.5 text-green-500 hover:bg-green-100 rounded-md transition-all shadow-sm border border-transparent hover:border-green-200"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleReject(owner._id)} 
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-all shadow-sm border border-transparent hover:border-red-200"
                            >
                              <X size={16} />
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
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && selectedOwner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setShowDetails(false)} 
              className="absolute top-5 right-5 text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4">Owner Details</h2>

            <div className="space-y-8">
              <Section title="Personal Information">
                <div className="grid gap-2">
                  <DetailItem label="Name" value={selectedOwner.name} />
                  <DetailItem label="Email" value={selectedOwner.email} />
                  <DetailItem label="Phone" value={selectedOwner.phone || "Not provided"} />
                  <DetailItem label="Address" value={selectedOwner.address || "Phnom Penh, Cambodia"} />
                </div>
              </Section>

              <Section title="Restaurant Information">
                <div className="grid gap-2">
                  <DetailItem label="Restaurant Name" value={selectedOwner.restaurantName || "Not provided"} />
                  <DetailItem label="Cuisine" value={selectedOwner.cuisine || "Not provided"} />
                  <DetailItem label="Description" value={selectedOwner.restaurantDescription || "Not provided"} />
                </div>
              </Section>

              <Section title="Application Status">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-gray-700">Status:</span>
                    {selectedOwner.isApproved ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                        Approved
                      </span>
                    ) : selectedOwner.rejectionReason ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 uppercase">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                  <DetailItem label="Applied Date" value={new Date(selectedOwner.createdAt).toLocaleDateString()} />
                  {selectedOwner.rejectionReason && (
                    <DetailItem label="Rejection Reason" value={selectedOwner.rejectionReason} />
                  )}
                </div>
              </Section>

              {!selectedOwner.isApproved && !selectedOwner.rejectionReason && (
                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => handleApprove(selectedOwner._id)} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
                  >
                    Approve Application
                  </button>
                  <button 
                    onClick={() => handleReject(selectedOwner._id)} 
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-bold text-sm transition-all border border-red-100 active:scale-95"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UI Components
function StatCard({ title, value, color }: { title: string; value: number; color: "blue" | "green" | "red" | "orange" }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    orange: "text-orange-600 bg-orange-50"
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</span>
      <span className={`text-2xl font-black px-3 py-1 rounded-lg ${colors[color]}`}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-gray-300 text-[10px] mb-3 uppercase tracking-[0.2em] font-black border-l-2 border-blue-500 pl-3">
        {title}
      </h3>
      <div className="pl-4">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[13px]">
      <span className="font-bold text-gray-700">{label}: </span>
      <span className="text-gray-500">{value}</span>
    </div>
  );
}