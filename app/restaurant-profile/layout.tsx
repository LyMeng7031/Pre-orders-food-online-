import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. The Left Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Added the Header here at the top of the content area */}
        <Header />

        {/* 3. The main content scrolls independently */}
        <main className="p-6 overflow-y-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
