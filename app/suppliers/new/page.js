"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSupplier() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", address: "", gstNo: "" });

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/suppliers");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/suppliers" className="text-blue-300 hover:text-white text-sm">← Back</Link>
        <h1 className="text-lg font-bold">🏭 Add Supplier</h1>
      </header>
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "name",    label: "Supplier Name *", required: true },
              { name: "phone",   label: "Phone" },
              { name: "gstNo",   label: "GST Number" },
              { name: "address", label: "Address" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="text" name={f.name} value={form[f.name]} onChange={handle}
                  required={f.required}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
              Save Supplier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

