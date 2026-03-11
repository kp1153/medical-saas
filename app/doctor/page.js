"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQueue = useCallback(async (q = "") => {
    setLoading(true);
    const url = q ? `/api/patients?search=${encodeURIComponent(q)}` : "/api/patients";
    const data = await fetch(url).then((r) => r.json());
    setQueue(data.slice(0, 30));
    setLoading(false);
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    const t = setTimeout(() => fetchQueue(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchQueue]);

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

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3">
          <span className="text-gray-400 text-lg">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम या मोबाइल नंबर से patient खोजें..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" />
          {search && (
            <button onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">
            {search ? `Search Results (${queue.length})` : "Recent Patients"}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Token", "Name", "Age", "Phone", "Complaint", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              )}
              {!loading && queue.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">
                  {search ? `"${search}" से कोई patient नहीं मिला` : "No patients yet"}
                </td></tr>
              )}
              {!loading && queue.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-700">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.age || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.phone
                      ? <a href={`tel:${p.phone}`} className="text-blue-600 hover:underline">{p.phone}</a>
                      : "—"}
                  </td>
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
