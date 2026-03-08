import Link from "next/link";
import { db } from "@/lib/db";
import { patients } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DoctorQueue() {
  const queue = await db.select().from(patients).orderBy(desc(patients.createdAt)).limit(20);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-green-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">🩺 Doctor — Patient Queue</h1>
        </div>
        <Link href="/doctor/reports"
          className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          🧪 Lab Reports
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Today's Queue</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Token", "Name", "Age", "Complaint", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No patients yet</td></tr>
              )}
              {queue.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-700">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.age || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.complaint || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/doctor/${p.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                      Examine →
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