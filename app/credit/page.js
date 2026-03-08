import { db } from "@/lib/db";
import { sales, payments } from "@/lib/schema";
import Link from "next/link";

export default async function Credit() {
  const allSales = await db.select().from(sales);
  const allPayments = await db.select().from(payments);

  const CreditSales = allSales.filter((s) => s.paymentType === "Credit");

  const patientMap = {};
  for (const sale of CreditSales) {
    const key = sale.patientPhone || sale.patientName;
    if (!patientMap[key]) {
      patientMap[key] = { name: sale.patientName, phone: sale.patientPhone, total: 0, paid: 0, bills: [] };
    }
    patientMap[key].total += sale.netAmount;
    patientMap[key].bills.push(sale);
  }

  for (const p of allPayments) {
    const sale = CreditSales.find((s) => s.id === p.saleId);
    if (sale) {
      const key = sale.patientPhone || sale.patientName;
      if (patientMap[key]) patientMap[key].paid += p.amount;
    }
  }

  const patients = Object.values(patientMap).map((p) => ({
    ...p,
    pending: Math.max(0, p.total - p.paid),
  })).filter((p) => p.pending > 0).sort((a, b) => b.pending - a.pending);

  const totalPending = patients.reduce((s, p) => s + p.pending, 0);

  // A/R Aging
  const now = new Date();
  const aging = { d30: 0, d60: 0, d60plus: 0 };
  for (const sale of CreditSales) {
    const diff = (now - new Date(sale.createdAt)) / (1000 * 60 * 60 * 24);
    if (diff <= 30) aging.d30 += sale.netAmount;
    else if (diff <= 60) aging.d60 += sale.netAmount;
    else aging.d60plus += sale.netAmount;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-lg font-bold">📒 Credit Management</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Pending</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₹{totalPending.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400">
            <p className="text-xs text-gray-500 uppercase font-semibold">0–30 Days</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{aging.d30.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400">
            <p className="text-xs text-gray-500 uppercase font-semibold">31–60 Days</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">₹{aging.d60.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-700">
            <p className="text-xs text-gray-500 uppercase font-semibold">60+ Days</p>
            <p className="text-2xl font-bold text-red-800 mt-1">₹{aging.d60plus.toFixed(0)}</p>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Pending Credit by Patient</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Patient", "Phone", "Total Credit", "Paid", "Pending", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No pending Credit</td></tr>
              )}
              {patients.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">₹{p.total.toFixed(0)}</td>
                  <td className="px-4 py-3 text-green-600">₹{p.paid.toFixed(0)}</td>
                  <td className="px-4 py-3 font-bold text-red-600">₹{p.pending.toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <a href={`https://wa.me/91${p.phone}?text=Dear ${p.name}, your pending amount is ₹${p.pending.toFixed(0)}. Please clear at earliest.`}
                      target="_blank"
                      className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">
                      💬 WhatsApp
                    </a>
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

