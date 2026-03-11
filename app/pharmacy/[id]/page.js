"use client";
import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PharmacyBill({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [rx, setRx] = useState(null);
  const [patient, setPatient] = useState(null);
  const [items, setItems] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const rx = await fetch(`/api/prescriptions/${id}`).then((r) => r.json());
      const patient = await fetch(`/api/patients/${rx.patientId}`).then((r) => r.json());
      const medicines = JSON.parse(rx.medicines);

      const enriched = await Promise.all(
        medicines.map(async (m) => {
          const med = await fetch(`/api/medicines/${m.medicineId}`).then((r) => r.json());
          return {
            ...m,
            mrp:    med?.mrp    || 0,
            batch:  med?.batch  || "",
            expiry: med?.expiry || "",
            qty:    1,
            amount: med?.mrp    || 0,
          };
        })
      );

      setRx(rx);
      setPatient(patient);
      setItems(enriched);
    }
    load();
  }, [id]);

  function updateQty(idx, qty) {
    const updated = [...items];
    updated[idx].qty    = parseInt(qty) || 1;
    updated[idx].amount = updated[idx].qty * updated[idx].mrp;
    setItems(updated);
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal  = items.reduce((s, i) => s + i.amount, 0);
  const netAmount = Math.max(0, subtotal - parseFloat(discount || 0));

  async function handleSubmit() {
    if (!items.length) return alert("Add at least one medicine");
    setLoading(true);
    const res = await fetch("/api/sales", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient:     { name: patient.name, phone: patient.phone || "" },
        items,
        subtotal,
        discount:    parseFloat(discount || 0),
        netAmount,
        paymentType,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) router.push(`/sales/${data.billId}`);
  }

  if (!rx || !patient) return <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/pharmacy" className="text-purple-300 hover:text-white text-sm">← Pharmacy</Link>
        <h1 className="text-lg font-bold">💊 Bill — {patient.name}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{patient.name}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{patient.phone || "—"}</span></div>
          <div><span className="text-gray-500">Age:</span> <span className="font-medium">{patient.age || "—"}</span></div>
          <div><span className="text-gray-500">Diagnosis:</span> <span className="font-medium text-red-600">{rx.diagnosis || "—"}</span></div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Medicines</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Medicine", "Dose", "Qty", "MRP", "Amount", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-800">{item.medicineName}</p>
                    <p className="text-xs text-gray-400">{item.instruction}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{item.dose || "—"}</td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.qty} min="1"
                      onChange={(e) => updateQty(idx, e.target.value)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                  </td>
                  <td className="px-3 py-2 text-gray-700">₹{item.mrp}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">₹{item.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            <span className="text-purple-700">₹{netAmount.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <div className="flex gap-3">
              {[["cash", "💵 Cash"], ["upi", "📱 UPI"], ["Credit", "🔒 Credit"]].map(([val, label]) => (
                <button key={val} onClick={() => setPaymentType(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                    paymentType === val ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-lg disabled:opacity-50">
            {loading ? "Saving..." : "✅ Generate Bill"}
          </button>
        </div>

      </div>
    </div>
  );
}