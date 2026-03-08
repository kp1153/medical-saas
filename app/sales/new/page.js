"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewBill() {
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [items, setItems] = useState([]);
  const [patient, setPatient] = useState({ name: "", phone: "" });
  const [paymentType, setPaymentType] = useState("cash");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetch("/api/medicines").then((r) => r.json()).then(setMedicines);
  }, []);

  function handleSearch(val) {
    setSearch(val);
    if (val.length < 2) { setSuggestions([]); return; }
    setSuggestions(
      medicines.filter((m) =>
        m.name.toLowerCase().includes(val.toLowerCase()) ||
        (m.generic && m.generic.toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 6)
    );
  }

  function addItem(med) {
    const existing = items.find((i) => i.medicineId === med.id);
    if (existing) {
      setItems(items.map((i) =>
        i.medicineId === med.id ? { ...i, qty: i.qty + 1, amount: (i.qty + 1) * i.mrp } : i
      ));
    } else {
      setItems([...items, {
        medicineId: med.id,
        medicineName: med.name,
        batch: med.batch || "",
        expiry: med.expiry || "",
        qty: 1,
        mrp: med.mrp,
        gst: med.gst || 0,
        discount: 0,
        amount: med.mrp,
      }]);
    }
    setSearch("");
    setSuggestions([]);
  }

  function updateQty(idx, qty) {
    const updated = [...items];
    updated[idx].qty = parseInt(qty) || 1;
    updated[idx].amount = updated[idx].qty * updated[idx].mrp;
    setItems(updated);
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const netAmount = Math.max(0, subtotal - parseFloat(discount || 0));

  async function handleSubmit() {
    if (!items.length) return alert("Add at least one medicine");
    if (!patient.name) return alert("Enter patient name");
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient, items, subtotal, discount: parseFloat(discount || 0), netAmount, paymentType }),
    });
    const data = await res.json();
    if (data.success) router.push(`/sales/${data.billId}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <a href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</a>
        <h1 className="text-lg font-bold">🧾 New Bill</h1>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Patient */}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
            <input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10-digit number" />
          </div>
        </div>

        {/* Medicine Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Medicine</label>
          <div className="relative">
            <input value={search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type medicine name or generic..." />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {suggestions.map((m) => (
                  <div key={m.id} onClick={() => addItem(m)}
                    className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0">
                    <span className="font-medium text-gray-800">{m.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">{m.generic}</span>
                    <span className="float-right font-semibold text-blue-700">₹{m.mrp}</span>
                    <span className="float-right mr-4 text-xs text-gray-400">Stock: {m.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Medicine", "Batch", "Expiry", "Qty", "MRP", "Amount", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                    <td className="px-4 py-3 text-gray-500">{item.batch || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{item.expiry || "—"}</td>
                    <td className="px-4 py-3">
                      <input type="number" value={item.qty} min="1"
                        onChange={(e) => updateQty(idx, e.target.value)}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                    </td>
                    <td className="px-4 py-3 text-gray-700">₹{item.mrp}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{item.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary + Payment */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Discount (₹)</span>
              <input type="number" value={discount} min="0"
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Net Amount</span>
              <span className="text-blue-700">₹{netAmount.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <div className="flex gap-3">
                {["cash", "upi", "Credit"].map((t) => (
                  <button key={t} onClick={() => setPaymentType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                      paymentType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {t === "cash" ? "💵 Cash" : t === "upi" ? "📱 UPI" : "📒 Credit"}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-lg">
              ✅ Generate Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

