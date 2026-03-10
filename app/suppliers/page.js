export const dynamic = 'force-dynamic';
import Link from "next/link";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/schema";

export default async function Suppliers() {
  const all = await db.select().from(suppliers);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">🏭 Suppliers</h1>
        </div>
        <Link href="/suppliers/new"
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition">
          + Add Supplier
        </Link>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {["Name", "Phone", "GST No", "Address", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No suppliers added yet</td></tr>
              )}
              {all.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.gstNo || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.address || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/suppliers/${s.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
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


