"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Settings() {
  const [form, setForm] = useState({
    clinicName: "", ownerName: "", address: "", phone: "",
    email: "", gstin: "", dlNo: "", city: "", state: "", pincode: "", tagline: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.clinicName) setForm({
          clinicName: d.clinicName || "",
          ownerName: d.ownerName || "",
          address: d.address || "",
          phone: d.phone || "",
          email: d.email || "",
          gstin: d.gstin || "",
          dlNo: d.dlNo || "",
          city: d.city || "",
          state: d.state || "",
          pincode: d.pincode || "",
          tagline: d.tagline || "",
        });
        setLoading(false);
      });
  }, []);

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const fields = [
    { name: "clinicName", label: "Clinic / Hospital Name *", type: "text", required: true },
    { name: "ownerName", label: "Owner / Doctor Name", type: "text" },
    { name: "tagline", label: "Tagline (e.g. Trusted Healthcare since 2010)", type: "text" },
    { name: "phone", label: "Clinic Phone", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "pincode", label: "Pincode", type: "text" },
    { name: "gstin", label: "GSTIN", type: "text" },
    { name: "dlNo", label: "Drug License No.", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-10">
        <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-base font-bold">⚙️ Clinic Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Clinic Information
              </p>
              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handle}
                      required={f.required}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-4 rounded-2xl transition text-base shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}