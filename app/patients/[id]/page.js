import { db } from "@/lib/db";
import { patients, sales } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function PatientDetail({ params }) {
  const { id } = await params;
  const patient = await db.select().from(patients).where(eq(patients.id, parseInt(id))).limit(1);
  const patientSales = await db.select().from(sales).where(eq(sales.patientPhone, patient[0]?.phone || ""));

  if (!patient.length) return <div className="p-8 text-center text-gray-500">Patient not found</div>;
  const p = patient[0];
  const totalSpent = patientSales.reduce((s, b) => s + b.netAmount, 0);
  const totalPending = patientSales
    .filter((b) => b.paymentType === "Credit")
    .reduce((s, b) => s + (b.netAmount - b.paidAmount), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/patients" className="text-blue-300 hover:text-white text-sm">← Patients</Link>
        <h1 className="text-lg font-bold">👤 {p.name}</h1>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{p.phone || "—"}</span></div>
          <div><span className="text-gray-500">Age:</span> <span className="font-medium">{p.age || "—"}</span></div>
          <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{p.gender || "—"}</span></div>
          <div><span className="text-gray-500">Address:</span> <span className="font-medium">{p.address || "—"}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Spent</p>
            <p className="text-2xl font-bold text-green-700">₹{totalSpent.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-semibold">Pending Credit</p>
            <p className="text-2xl font-bold text-red-600">₹{totalPending.toFixed(0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Purchase History</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Bill No", "Amount", "Payment", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patientSales.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">No bills found</td></tr>
              )}
              {patientSales.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-blue-600">
                    <Link href={`/sales/${b.id}`}>{b.billNo}</Link>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{b.netAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      b.paymentType === "Credit" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>{b.paymentType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}