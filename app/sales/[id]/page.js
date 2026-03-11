export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { sales, saleItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import PrintButton from "./PrintButton";

export default async function BillDetail({ params }) {
  const { id } = await params;
  const bill = await db
    .select()
    .from(sales)
    .where(eq(sales.id, parseInt(id)))
    .limit(1);
  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, parseInt(id)));

  if (!bill.length)
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
        Bill not found
      </div>
    );

  const b = bill[0];

  const gst5 = items
    .filter((i) => (i.gst || 0) === 5)
    .reduce((s, i) => s + i.amount, 0);
  const gst12 = items
    .filter((i) => (i.gst || 0) === 12)
    .reduce((s, i) => s + i.amount, 0);
  const gst18 = items
    .filter((i) => (i.gst || 0) === 18)
    .reduce((s, i) => s + i.amount, 0);
  const cgst5 = +((gst5 * 2.5) / 105).toFixed(2);
  const cgst12 = +((gst12 * 6) / 112).toFixed(2);
  const cgst18 = +((gst18 * 9) / 118).toFixed(2);
  const totalGST = +(
    cgst5 +
    cgst5 +
    (cgst12 + cgst12) +
    (cgst18 + cgst18)
  ).toFixed(2);

  const billDate = new Date(b.createdAt);
  const formattedDate = billDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = billDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <header className="screen-nav no-print">
        <div className="nav-left">
          <Link href="/sales">← All Bills</Link>
          <h1>🧾 {b.billNo}</h1>
        </div>
        <PrintButton />
      </header>

      <div className="page-wrap">
        <div className="bill-card">
          <div className="rainbow-bar" />

          {/* Clinic Header */}
          <div className="clinic-header">
            <div className="logo-row">
              <div className="logo-box">⚕️</div>
              <div>
                <div className="clinic-name">Arogya Medical &amp; Clinic</div>
                <div className="clinic-sub">Trusted Healthcare · Est. 2010</div>
              </div>
            </div>
            <div className="clinic-right">
              <div>📍 Station Road, Gorakhpur, U.P. — 273001</div>
              <div>
                📞 <strong>+91 98765 43210</strong> &nbsp;|&nbsp; 📧
                arogya@clinic.in
              </div>
              <div>
                GSTIN: <strong>09ABCDE1234F1Z5</strong>
              </div>
              <div>
                Drug Lic: <strong>UP/GKP/2010/0042</strong>
              </div>
            </div>
          </div>

          {/* Bill Info Strip */}
          <div className="info-strip">
            <div>
              <div className="info-lbl">Bill No.</div>
              <div className="info-val">{b.billNo}</div>
            </div>
            <div>
              <div className="info-lbl">Date</div>
              <div className="info-val">{formattedDate}</div>
            </div>
            <div>
              <div className="info-lbl">Time</div>
              <div className="info-val">{formattedTime}</div>
            </div>
            <div>
              <div className="info-lbl">Cash Memo / GST Invoice</div>
              <div className="info-val" style={{ fontSize: "13px" }}>
                <span
                  className={`pay-badge ${
                    b.paymentType === "Credit"
                      ? "pay-credit"
                      : b.paymentType === "upi"
                        ? "pay-upi"
                        : "pay-cash"
                  }`}
                >
                  {b.paymentType === "cash"
                    ? "💵 CASH"
                    : b.paymentType === "upi"
                      ? "📱 UPI"
                      : "🔒 CREDIT"}
                </span>
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="patient-band">
            <div className="p-row">
              <span className="p-lbl">M/s (Patient)</span>
              <span className="p-val">
                {b.patientName || "Walk-in Customer"}
              </span>
            </div>
            <div className="p-row">
              <span className="p-lbl">Mobile</span>
              <span className="p-val">{b.patientPhone || "—"}</span>
            </div>
            <div className="rx-band">
              👨‍⚕️ &nbsp;<strong>Dr. Kanta Prasad</strong>&nbsp; — MBBS, MD
              (Medicine) &nbsp;|&nbsp; Reg. No. UP-MCI-12345
            </div>
          </div>

          {/* Medicines */}
          <div className="med-section">
            <div className="sec-title">Medicine Details</div>
            <table className="med-tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Exp.</th>
                  <th>HSN</th>
                  <th className="r">Qty</th>
                  <th className="r">MRP</th>
                  <th className="r">Disc.</th>
                  <th className="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="med-nm">{item.medicineName}</div>
                      {(item.gst || 0) > 0 && (
                        <div className="med-sub">GST @{item.gst}%</div>
                      )}
                    </td>
                    <td>
                      {item.batch ? (
                        <span className="chip chip-b">{item.batch}</span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>
                    <td>
                      {item.expiry ? (
                        <span className="chip chip-e">{item.expiry}</span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "11.5px", color: "#64748b" }}>
                      {item.hsn || "—"}
                    </td>
                    <td
                      className="r"
                      style={{ fontWeight: 700, color: "#0c3b5e" }}
                    >
                      {item.qty}
                    </td>
                    <td className="r">₹{Number(item.mrp).toFixed(2)}</td>
                    <td className="r" style={{ color: "#059669" }}>
                      {(item.discount || 0) > 0 ? `${item.discount}%` : "—"}
                    </td>
                    <td
                      className="r"
                      style={{ fontWeight: 700, color: "#0c2d47" }}
                    >
                      ₹{Number(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom: GST + Totals */}
          <div className="bottom-grid">
            {/* GST Breakdown */}
            <div>
              <div className="sec-title" style={{ paddingTop: "4px" }}>
                GST Summary
              </div>
              <table className="gst-tbl">
                <thead>
                  <tr>
                    <th>Slab</th>
                    <th>Taxable</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>Total GST</th>
                  </tr>
                </thead>
                <tbody>
                  {gst5 > 0 && (
                    <tr>
                      <td>5%</td>
                      <td>₹{gst5.toFixed(2)}</td>
                      <td>₹{cgst5.toFixed(2)}</td>
                      <td>₹{cgst5.toFixed(2)}</td>
                      <td>₹{(cgst5 * 2).toFixed(2)}</td>
                    </tr>
                  )}
                  {gst12 > 0 && (
                    <tr>
                      <td>12%</td>
                      <td>₹{gst12.toFixed(2)}</td>
                      <td>₹{cgst12.toFixed(2)}</td>
                      <td>₹{cgst12.toFixed(2)}</td>
                      <td>₹{(cgst12 * 2).toFixed(2)}</td>
                    </tr>
                  )}
                  {gst18 > 0 && (
                    <tr>
                      <td>18%</td>
                      <td>₹{gst18.toFixed(2)}</td>
                      <td>₹{cgst18.toFixed(2)}</td>
                      <td>₹{cgst18.toFixed(2)}</td>
                      <td>₹{(cgst18 * 2).toFixed(2)}</td>
                    </tr>
                  )}
                  {totalGST === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        No GST applicable
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div>
              <div className="sec-title" style={{ paddingTop: "4px" }}>
                Amount
              </div>
              <div className="totals-outer">
                <div className="t-row">
                  <span>Sub Total</span>
                  <span>₹{Number(b.subtotal).toFixed(2)}</span>
                </div>
                {b.discount > 0 && (
                  <div className="t-row disc">
                    <span>Discount (−)</span>
                    <span>₹{Number(b.discount).toFixed(2)}</span>
                  </div>
                )}
                {totalGST > 0 && (
                  <div className="t-row gst">
                    <span>GST (CGST+SGST)</span>
                    <span>₹{totalGST.toFixed(2)}</span>
                  </div>
                )}
                <div className="t-grand">
                  <span>GRAND TOTAL</span>
                  <span>₹{Number(b.netAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bill-footer">
            <div className="terms">
              <strong>Terms &amp; Conditions</strong>
              • Goods once sold will not be taken back or exchanged.
              <br />
              • Please verify medicines &amp; quantity before leaving.
              <br />
              • Credit dues unpaid by due date attract 24% p.a. interest.
              <br />• This is a system-generated bill, valid without signature.
            </div>
            <div className="sig-area">
              <div className="sig-line2" />
              <div className="sig-lbl">Authorised Signatory</div>
              <div className="sig-sub">Arogya Medical &amp; Clinic</div>
            </div>
          </div>

          {/* Wellness */}
          <div className="wellness">
            ✦ &nbsp; Get Well Soon — Wishing You a Speedy Recovery &nbsp; ✦
          </div>
        </div>
      </div>
    </>
  );
}
