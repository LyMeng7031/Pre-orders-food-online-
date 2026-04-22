// 1. Removed curly braces from SidebarCustomer
import SidebarCustomer from "@/components/SidebarCustomer";
import Topbar from "@/components/Topbar";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Fixed width */}
      <SidebarCustomer />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
