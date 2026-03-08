import { db } from "@/lib/db";
import { saleItems, purchaseItems } from "@/lib/schema";
import Link from "next/link";

export default async function Profit() {
  const sold = await db.select().from(saleItems);
  const purchased = await db.select().from(purchaseItems);

  const medicineMap = {};

  for (const item of sold) {
    const name = item.medicineName;
    if (!medicineMap[name]) medicineMap[name] = { name, revenue: 0, cost: 0, qty: 0 };
    medicineMap[name].revenue += item.amount;
    medicineMap[name].qty += item.qty;
  }

  for (const item of purchased) {
    const name = item.medicineName;
    if (!medicineMap[name]) medicineMap[name] = { name, revenue: 0, cost: 0, qty: 0 };
    medicineMap[name].cost += item.amount;
  }

  const medicines = Object.values(medicineMap).map((m) => ({
    ...m,
    profit: m.revenue - m.cost,
    margin: m.revenue > 0 ? (((m.revenue - m.cost) / m.revenue) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.profit - a.profit);

  const totalRevenue = medicines.reduce((s, m) => s + m.revenue, 0);
  const totalCost = medicines.reduce((s, m) => s + m.cost, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-lg font-bold">💰 Profit / Loss</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700 mt-1">₹{totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-400">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Cost</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₹{totalCost.toFixed(0)}</p>
          </div>
          <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${totalProfit >= 0 ? "border-blue-500" : "border-red-600"}`}>
            <p className="text-xs text-gray-500 uppercase font-semibold">Net Profit</p>
            <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>
              ₹{totalProfit.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Medicine-wise Profit</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Medicine", "Qty Sold", "Revenue", "Cost", "Profit", "Margin"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No data yet</td></tr>
              )}
              {medicines.map((m, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.qty}</td>
                  <td className="px-4 py-3 text-green-700 font-semibold">₹{m.revenue.toFixed(0)}</td>
                  <td className="px-4 py-3 text-red-500">₹{m.cost.toFixed(0)}</td>
                  <td className={`px-4 py-3 font-bold ${m.profit >= 0 ? "text-blue-700" : "text-red-700"}`}>
                    ₹{m.profit.toFixed(0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      m.margin >= 20 ? "bg-green-100 text-green-700" :
                      m.margin >= 10 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{m.margin}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}