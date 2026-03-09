"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditMedicineClient({ medicine }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: medicine.name || "",
    generic: medicine.generic || "",
    company: medicine.company || "",
    batch: medicine.batch || "",
    expiry: medicine.expiry || "",
    mrp: medicine.mrp || "",
    purchasePrice: medicine.purchasePrice || "",
    stock: medicine.stock || 0,
    unit: medicine.unit || "strip",
    rack: medicine.rack || "",
    hsn: medicine.hsn || "",
    gst: medicine.gst || 12,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.mrp) {
      setError("Name और MRP जरूरी हैं।");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/medicines/${medicine.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/medicines");
      router.refresh();
    } else {
      setError("Save नहीं हुआ। दोबारा try करो।");
    }
  };

  const fields = [
    { label: "Medicine Name *", name: "name", type: "text" },
    { label: "Generic Name", name: "generic", type: "text" },
    { label: "Company", name: "company", type: "text" },
    { label: "Batch No.", name: "batch", type: "text" },
    { label: "Expiry (MM/YYYY)", name: "expiry", type: "text", placeholder: "06/2026" },
    { label: "MRP (₹) *", name: "mrp", type: "number" },
    { label: "Purchase Price (₹)", name: "purchasePrice", type: "number" },
    { label: "Stock", name: "stock", type: "number" },
    { label: "HSN Code", name: "hsn", type: "text" },
    { label: "GST (%)", name: "gst", type: "number" },
    { label: "Rack", name: "rack", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-3 shadow-md">
        <Link href="/medicines" className="text-blue-300 hover:text-white text-sm">
          ← Medicines
        </Link>
        <h1 className="text-lg font-bold">✏️ Edit Medicine</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder || ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["strip", "bottle", "tube", "vial", "sachet", "injection", "drops", "other"].map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/medicines"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-semibold transition"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}