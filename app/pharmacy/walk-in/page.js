"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WalkInBill() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/medicines?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function addItem(med) {
    const exists = items.find(i => i.medicineId === med.id);
    if (exists) {
      setItems(items.map(i =>
        i.medicineId === med.id
          ? { ...i, qty: i.qty + 1, amount: (i.qty + 1) * i.mrp }
          : i
      ));
    } else {
      setItems([...items, {
        medicineId:   med.id,
        medicineName: med.name,
        batch:        med.batch || "",
        expiry:       med.expiry || "",
        mrp:          med.mrp,
        qty:          1,
        amount:       med.mrp,
        gst:          med.gst || 0,
        hsn:          med.hsn || "",
      }]);
    }
    setSearch("");
    setResults([]);
  }

  function updateQty(idx, qty) {
    const q = parseInt(qty) || 1;
    setItems(items.map((i, n) => n === idx ? { ...i, qty: q, amount: q * i.mrp } : i));
  }

  function removeItem(idx) {
    setItems(items.filter((_, n) => n !== idx));
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
        patient: {
          name:  patientName.trim() || "Walk-in Customer",
          phone: patientPhone.trim(),
        },
        items,
        subtotal,
        discount:   parseFloat(discount || 0),
        netAmount,
        paymentType,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) router.push(`/sales/${data.billId}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <header style={{
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        padding: "13px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link href="/pharmacy" style={{ color: "#c4b5fd", fontSize: "13px", textDecoration: "none" }}>
            ← Pharmacy
          </Link>
          <h1 style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>
            🛒 Walk-in / OTC Bill
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* Patient Info */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "14px" }}>
            Patient Info (Optional)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>Name</label>
              <input
                type="text" placeholder="Walk-in Customer"
                value={patientName} onChange={e => setPatientName(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>Phone</label>
              <input
                type="tel" placeholder="Optional"
                value={patientPhone} onChange={e => setPatientPhone(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </div>

        {/* Medicine Search */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "14px" }}>
            Add Medicines
          </p>

          {/* Search Box */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type="text" placeholder="🔍 Search medicine by name..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px",
                border: "2px solid #e2e8f0", borderRadius: "10px",
                fontSize: "14px", fontFamily: "inherit", outline: "none"
              }}
            />
            {results.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 50, marginTop: "4px", maxHeight: "240px", overflowY: "auto"
              }}>
                {results.map(med => (
                  <div key={med.id}
                    onClick={() => addItem(med)}
                    style={{
                      padding: "11px 16px", cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "13.5px" }}>{med.name}</p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        {med.company || ""} {med.batch ? `· Batch: ${med.batch}` : ""} {med.stock !== undefined ? `· Stock: ${med.stock}` : ""}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, color: "#4f46e5", fontSize: "14px" }}>₹{med.mrp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Medicine", "Batch", "Qty", "MRP", "Amount", ""].map(h => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: h === "Qty" || h === "MRP" || h === "Amount" ? "right" : "left", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 10px" }}>
                      <p style={{ fontWeight: 600, color: "#0f172a" }}>{item.medicineName}</p>
                      {item.expiry && <p style={{ fontSize: "11px", color: "#94a3b8" }}>Exp: {item.expiry}</p>}
                    </td>
                    <td style={{ padding: "10px 10px", color: "#64748b", fontSize: "12px" }}>{item.batch || "—"}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <input
                        type="number" min="1" value={item.qty}
                        onChange={e => updateQty(idx, e.target.value)}
                        style={{ width: "56px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center", fontSize: "13px", fontFamily: "inherit" }}
                      />
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", color: "#475569" }}>₹{item.mrp}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>₹{item.amount.toFixed(2)}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#f87171", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {items.length === 0 && (
            <p style={{ textAlign: "center", color: "#cbd5e1", padding: "24px 0", fontSize: "13px" }}>
              Search and add medicines above
            </p>
          )}
        </div>

        {/* Payment & Total */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
            <span style={{ color: "#64748b" }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "14px" }}>
            <span style={{ color: "#64748b" }}>Discount (₹)</span>
            <input
              type="number" min="0" value={discount}
              onChange={e => setDiscount(e.target.value)}
              style={{ width: "100px", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", textAlign: "right", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "18px", borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginBottom: "20px" }}>
            <span>Net Amount</span>
            <span style={{ color: "#4f46e5" }}>₹{netAmount.toFixed(2)}</span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "10px" }}>Payment Type</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { val: "cash",   label: "💵 Cash"   },
                { val: "upi",    label: "📱 UPI"    },
                { val: "Credit", label: "🔒 Credit" },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setPaymentType(val)} style={{
                  padding: "9px 20px", borderRadius: "8px", border: "none",
                  fontWeight: 600, fontSize: "13px", cursor: "pointer",
                  background: paymentType === val ? "#4f46e5" : "#f1f5f9",
                  color:      paymentType === val ? "#fff"    : "#475569",
                  transition: "all 0.15s"
                }}>{label}</button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "14px",
            background: loading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Generating..." : "✅ Generate Bill"}
          </button>
        </div>

      </div>
    </div>
  );
}