import Link from "next/link";
import { db } from "@/lib/db";
import { patients } from "@/lib/schema";

export default async function Patients() {
  const all = await db.select().from(patients);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">👤 Patients</h1>
        </div>
        <Link href="/patients/new"
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition">
          + Add Patient
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {["Name", "Phone", "Age", "Gender", "Address", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No patients added yet</td></tr>
              )}
              {all.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.age || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.gender || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.address || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/patients/${p.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
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

