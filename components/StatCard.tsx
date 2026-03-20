type Props = {
  title: string;
  value: string;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-2">{value}</h2>
    </div>
  );
}
