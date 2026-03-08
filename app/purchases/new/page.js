"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPurchase() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ supplierId: "", supplierName: "", invoiceNo: "" });
  const [items, setItems] = useState([{ medicineName: "", batch: "", expiry: "", qty: "", purchasePrice: "", mrp: "", gst: "12", amount: "" }]);

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
  }, []);

  function handleSupplier(e) {
    const s = suppliers.find((s) => s.id === parseInt(e.target.value));
    setForm({ ...form, supplierId: e.target.value, supplierName: s?.name || "" });
  }

  function updateItem(idx, field, value) {
    const updated = [...items];
    updated[idx][field] = value;
    if (field === "qty" || field === "purchasePrice") {
      const qty = parseFloat(updated[idx].qty) || 0;
      const price = parseFloat(updated[idx].purchasePrice) || 0;
      updated[idx].amount = (qty * price).toFixed(2);
    }
    setItems(updated);
  }

  function addRow() {
    setItems([...items, { medicineName: "", batch: "", expiry: "", qty: "", purchasePrice: "", mrp: "", gst: "12", amount: "" }]);
  }

  function removeRow(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items, totalAmount: total }),
    });
    router.push("/purchases");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-lg font-bold">📦 New Purchase</h1>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select value={form.supplierId} onChange={handleSupplier}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
            <input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Supplier invoice number" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Medicine Name", "Batch", "Expiry", "Qty", "Purchase ₹", "MRP ₹", "GST%", "Amount", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">
                    <input value={item.medicineName} onChange={(e) => updateItem(idx, "medicineName", e.target.value)}
                      className="w-36 border border-gray-300 rounded px-2 py-1 text-sm" placeholder="Medicine name" />
                  </td>
                  <td className="px-3 py-2">
                    <input value={item.batch} onChange={(e) => updateItem(idx, "batch", e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" placeholder="Batch" />
                  </td>
                  <td className="px-3 py-2">
                    <input value={item.expiry} onChange={(e) => updateItem(idx, "expiry", e.target.value)}
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-sm" placeholder="MM/YYYY" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.purchasePrice} onChange={(e) => updateItem(idx, "purchasePrice", e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.mrp} onChange={(e) => updateItem(idx, "mrp", e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.gst} onChange={(e) => updateItem(idx, "gst", e.target.value)}
                      className="w-14 border border-gray-300 rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-700">₹{item.amount || "0"}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <button onClick={addRow}
              className="text-blue-600 hover:underline text-sm font-medium">+ Add Row</button>
            <span className="font-bold text-gray-800">Total: ₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition text-lg">
          ✅ Save Purchase
        </button>
      </div>
    </div>
  );
}

