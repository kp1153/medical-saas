"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function Patients() {
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPatients = useCallback(async (q = "") => {
    setLoading(true);
    const url = q ? `/api/patients?search=${encodeURIComponent(q)}` : "/api/patients";
    const data = await fetch(url).then((r) => r.json());
    setAll(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchPatients]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">👤 Patients</h1>
        </div>
        <Link href="/patients/new"
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          + New Patient
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3">
          <span className="text-gray-400 text-lg">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम या मोबाइल नंबर से खोजें..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" />
          {search && (
            <button onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          )}
        </div>

        {search && (
          <p className="text-sm text-gray-500 px-1">
            {loading ? "खोज रहे हैं..." : `${all.length} patient मिले`}
          </p>
        )}

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
              {loading && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              )}
              {!loading && all.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                  {search ? `"${search}" से कोई patient नहीं मिला` : "No patients yet"}
                </td></tr>
              )}
              {!loading && all.map((p) => (
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
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </td>
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
