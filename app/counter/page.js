"use client";
import { useState } from "react";
import Link from "next/link";

export default function Counter() {
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", address: "", complaint: "" });
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaved({ ...form, id: data.id });
    setForm({ name: "", phone: "", age: "", gender: "", address: "", complaint: "" });
    setLoading(false);
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">🪟 Counter — Patient Registration</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {saved && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-green-800 text-sm font-medium">
            ✅ {saved.name} registered — Token #{saved.id} — Send to Doctor
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "name",      label: "Patient Name *", type: "text",   required: true },
              { name: "phone",     label: "Phone",          type: "text" },
              { name: "age",       label: "Age",            type: "number" },
              { name: "address",   label: "Address",        type: "text" },
              { name: "complaint", label: "Chief Complaint *", type: "text", required: true },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={handle}
                  required={f.required}
                  className={inputClass} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handle}
                className={inputClass}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? "Saving..." : "✅ Register & Send to Doctor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}