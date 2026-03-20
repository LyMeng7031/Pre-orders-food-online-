export default function DealsTable() {
  const data = [
    {
      name: "Burger",
      location: "Phnom Penh",
      date: "2026-03-17",
      price: "$10",
      status: "Delivered",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
      <h2 className="font-bold text-gray-900 mb-4 text-lg">Deals Details</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="pb-3 text-sm font-semibold text-gray-700">
                Location
              </th>
              <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
              <th className="pb-3 text-sm font-semibold text-gray-700">
                Price
              </th>
              <th className="pb-3 text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 text-gray-900 font-medium">{item.name}</td>
                <td className="py-4 text-gray-600">{item.location}</td>
                <td className="py-4 text-gray-600">{item.date}</td>
                <td className="py-4 text-gray-900 font-semibold">
                  {item.price}
                </td>
                <td className="py-4">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
