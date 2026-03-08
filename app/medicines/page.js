import Link from "next/link";
import { db } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Medicines() {
  const cookieStore = await cookies();
  if (!cookieStore.get("user_id")) redirect("/login");

  const allMedicines = await db.select().from(medicines);

  function getStatus(m) {
    if (!m.expiry) return { label: "OK", color: "bg-green-100 text-green-700" };
    const parts = m.expiry.split("/");
    if (parts.length < 2) return { label: "OK", color: "bg-green-100 text-green-700" };
    const exp = new Date(`${parts[1]}-${parts[0]}-01`);
    const now = new Date();
    const diff = (exp - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (diff <= 30) return { label: "Near Expiry", color: "bg-yellow-100 text-yellow-700" };
    if (m.stock <= 10) return { label: "Low Stock", color: "bg-orange-100 text-orange-700" };
    return { label: "OK", color: "bg-green-100 text-green-700" };
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">💊 Medicines</h1>
        </div>
        <Link href="/medicines/new"
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition">
          + Add Medicine
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {["Name", "Generic", "Company", "Batch", "Expiry", "MRP", "Stock", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMedicines.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No medicines added yet</td></tr>
              )}
              {allMedicines.map((m) => {
                const status = getStatus(m);
                return (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-500">{m.generic || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{m.company || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{m.batch || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{m.expiry || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{m.mrp}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{m.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/medicines/${m.id}/edit`}
                        className="text-blue-600 hover:underline text-xs">Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

