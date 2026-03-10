export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMedicine() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", generic: "", company: "", batch: "", expiry: "",
    mrp: "", purchasePrice: "", stock: "", unit: "strip",
    rack: "", hsn: "", gst: "12",
  });

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/medicines");
  }

  const fields = [
    { name: "name",          label: "Medicine Name *",   type: "text",   required: true },
    { name: "generic",       label: "Generic Name",      type: "text" },
    { name: "company",       label: "Company",           type: "text" },
    { name: "batch",         label: "Batch No",          type: "text" },
    { name: "expiry",        label: "Expiry (MM/YYYY)",  type: "text",   placeholder: "03/2026" },
    { name: "mrp",           label: "MRP (₹) *",         type: "number", required: true },
    { name: "purchasePrice", label: "Purchase Price (₹)", type: "number" },
    { name: "stock",         label: "Opening Stock *",   type: "number", required: true },
    { name: "rack",          label: "Rack Location",     type: "text" },
    { name: "hsn",           label: "HSN Code",          type: "text" },
    { name: "gst",           label: "GST %",             type: "number" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <a href="/medicines" className="text-blue-300 hover:text-white text-sm">← Back</a>
        <h1 className="text-lg font-bold">💊 Add New Medicine</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handle}
                  required={f.required}
                  placeholder={f.placeholder || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["strip", "bottle", "tube", "vial", "sachet", "tablet", "capsule", "injection", "syrup", "other"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


