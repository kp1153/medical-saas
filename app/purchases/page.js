import Link from "next/link";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";

export default async function PurchaseHistory() {
  const all = await db.select().from(purchases);
  const sorted = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">📜 Purchase History</h1>
        </div>
        <Link href="/purchases/new"
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition">
          + New Purchase
        </Link>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {["Supplier", "Invoice No", "Total Amount", "Paid", "Pending", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No purchases yet</td></tr>
              )}
              {sorted.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.supplierName || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.invoiceNo || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{p.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-700 font-semibold">₹{p.paidAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">₹{(p.totalAmount - p.paidAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

