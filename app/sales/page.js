export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { sales } from "@/lib/schema";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AllBills() {
  const allSales = await db.select().from(sales);
  const sorted = allSales.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-blue-300 hover:text-white text-sm"
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold">📋 All Bills</h1>
        </div>
        <Link
          href="/sales/new"
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + New Bill
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {[
                  "Bill No",
                  "Patient",
                  "Phone",
                  "Amount",
                  "Payment",
                  "Date",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No bills yet
                  </td>
                </tr>
              )}
              {sorted.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-700">
                    {b.billNo}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{b.patientName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {b.patientPhone || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ₹{b.netAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        b.paymentType === "Credit"
                          ? "bg-red-100 text-red-700"
                          : b.paymentType === "upi"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {b.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/${b.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View
                    </Link>
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

