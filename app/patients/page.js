import Link from "next/link";
import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Patients() {
  const all = await db.select().from(patients).orderBy(desc(patients.createdAt));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">👤 Patients</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {["Token", "Name", "Age", "Phone", "Complaint", "Date", "History"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No patients yet</td></tr>
              )}
              {all.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-700">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.age || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.complaint || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/patients/${p.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                      View →
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