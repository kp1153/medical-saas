export const dynamic = 'force-dynamic';
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LabResults() {
  const [reports, setReports] = useState([]);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetch("/api/lab-reports").then((r) => r.json()).then(setReports);
  }, []);

  const pending = reports.filter((r) => !r.result);
  const done = reports.filter((r) => r.result);

  async function saveResult(id) {
    setSaving({ ...saving, [id]: true });
    await fetch(`/api/lab-reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        result: editing[id],
        reportDate: new Date().toISOString().split("T")[0],
      }),
    });
    setReports(reports.map((r) => r.id === id ? { ...r, result: editing[id] } : r));
    setSaving({ ...saving, [id]: false });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/doctor" className="text-green-300 hover:text-white text-sm">← Queue</Link>
        <h1 className="text-lg font-bold">🧪 Lab Reports</h1>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        <div className="bg-white rounded-xl shadow">
          <div className="px-4 py-3 border-b font-semibold text-gray-700 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">{pending.length}</span>
            Pending Results
          </div>
          {pending.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No pending reports</p>
          ) : (
            <div className="divide-y">
              {pending.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{r.testName}</p>
                    <p className="text-xs text-gray-400">{r.category} · Patient #{r.patientId} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <input
                    value={editing[r.id] || ""}
                    onChange={(e) => setEditing({ ...editing, [r.id]: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter result..." />
                  <button onClick={() => saveResult(r.id)} disabled={!editing[r.id] || saving[r.id]}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                    {saving[r.id] ? "..." : "Save"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {done.length > 0 && (
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 py-3 border-b font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">{done.length}</span>
              Completed Reports
            </div>
            <div className="divide-y">
              {done.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{r.testName}</p>
                    <p className="text-xs text-gray-400">{r.category} · Patient #{r.patientId} · {r.reportDate || new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-medium">{r.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
