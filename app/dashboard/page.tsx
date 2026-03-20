import StatCard from "@/components/StatCard";
import SalesChart from "@/components/SalesChart";
import DealsTable from "@/components/DealsTable";

export default function DashboardPage() {
  return (
    <div>
      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value="40,689" />
        <StatCard title="Total Orders" value="10,293" />
        <StatCard title="Total Sales" value="$89,000" />
        <StatCard title="Pending Orders" value="2040" />
      </div>

      {/* Chart */}
      <SalesChart />

      {/* Table */}
      <DealsTable />
    </div>
  );
}
