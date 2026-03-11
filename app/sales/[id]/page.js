export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { sales, saleItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import PrintButton from "./PrintButton";

export default async function BillDetail({ params }) {
  const { id } = await params;
  const bill = await db.select().from(sales).where(eq(sales.id, parseInt(id))).limit(1);
  const items = await db.select().from(saleItems).where(eq(saleItems.saleId, parseInt(id)));

  if (!bill.length) return <div style={{padding:"32px",textAlign:"center",color:"#6b7280"}}>Bill not found</div>;

  const b = bill[0];

  const gst5  = items.filter(i => (i.gst || 0) === 5).reduce((s, i)  => s + i.amount, 0);
  const gst12 = items.filter(i => (i.gst || 0) === 12).reduce((s, i) => s + i.amount, 0);
  const gst18 = items.filter(i => (i.gst || 0) === 18).reduce((s, i) => s + i.amount, 0);
  const cgst5  = +(gst5  * 2.5 / 105).toFixed(2);
  const cgst12 = +(gst12 * 6   / 112).toFixed(2);
  const cgst18 = +(gst18 * 9   / 118).toFixed(2);
  const totalGST = +((cgst5 + cgst5) + (cgst12 + cgst12) + (cgst18 + cgst18)).toFixed(2);

  const billDate = new Date(b.createdAt);
  const formattedDate = billDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formattedTime = billDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eef2f7; font-family: 'DM Sans', sans-serif; }

        .screen-nav {
          background: linear-gradient(135deg, #0c3b5e 0%, #155e8a 60%, #0c6b6f 100%);
          padding: 13px 24px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 3px 14px rgba(0,0,0,0.25);
        }
        .screen-nav a { color: #93c5fd; font-size: 13px; text-decoration: none; font-weight: 500; }
        .screen-nav a:hover { color: #fff; }
        .screen-nav h1 { color: #fff; font-size: 15px; font-weight: 600; margin-left: 14px; }
        .nav-left { display: flex; align-items: center; gap: 4px; }

        .page-wrap { max-width: 800px; margin: 32px auto; padding: 0 16px 56px; }

        .bill-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 48px rgba(12,59,94,0.13), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .rainbow-bar {
          height: 5px;
          background: linear-gradient(90deg, #0c3b5e 0%, #1d6fa8 25%, #0c6b6f 50%, #14b8a6 75%, #3b82f6 100%);
        }

        .clinic-header {
          padding: 26px 36px 22px;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
          border-bottom: 1px solid #e8edf4;
        }
        .logo-row { display: flex; align-items: center; gap: 14px; }
        .logo-box {
          width: 54px; height: 54px;
          background: linear-gradient(135deg, #0c3b5e, #0c6b6f);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(12,59,94,0.3);
        }
        .clinic-name {
          font-family: 'DM Serif Display', serif;
          font-size: 23px; color: #0c2d47; line-height: 1.15;
        }
        .clinic-sub {
          font-size: 10.5px; color: #0c6b6f; font-weight: 700;
          letter-spacing: 1.8px; text-transform: uppercase; margin-top: 3px;
        }
        .clinic-right { text-align: right; font-size: 11.5px; color: #64748b; line-height: 1.85; }
        .clinic-right strong { color: #334155; }

        .info-strip {
          background: linear-gradient(135deg, #0c3b5e 0%, #155e8a 100%);
          padding: 15px 36px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;
        }
        .info-lbl { font-size: 9.5px; color: #7dd3fc; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 700; }
        .info-val { font-size: 15px; color: #fff; font-weight: 700; margin-top: 2px; }
        .pay-badge { padding: 4px 13px; border-radius: 20px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px; }
        .pay-cash   { background: #d1fae5; color: #064e3b; }
        .pay-upi    { background: #dbeafe; color: #1e3a8a; }
        .pay-credit { background: #fee2e2; color: #7f1d1d; }

        .patient-band {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 36px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 7px 36px;
        }
        .p-row { display: flex; gap: 8px; font-size: 13px; align-items: baseline; }
        .p-lbl { color: #94a3b8; font-size: 11.5px; min-width: 66px; font-weight: 500; }
        .p-val { color: #1e293b; font-weight: 600; }
        .rx-band {
          grid-column: 1/-1;
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 8px; padding: 8px 14px;
          font-size: 12.5px; color: #1e40af; margin-top: 4px;
          display: flex; align-items: center; gap: 6px;
        }

        .med-section { padding: 0 36px 4px; }
        .sec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: #94a3b8; padding: 18px 0 10px;
        }
        table.med-tbl { width: 100%; border-collapse: collapse; }
        .med-tbl thead tr { background: #f1f5f9; }
        .med-tbl thead th {
          padding: 10px 12px; font-size: 10.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.8px; color: #475569;
          text-align: left;
        }
        .med-tbl thead th.r { text-align: right; }
        .med-tbl tbody tr { border-bottom: 1px solid #f1f5f9; }
        .med-tbl tbody tr:last-child { border-bottom: none; }
        .med-tbl tbody td { padding: 11px 12px; font-size: 13px; color: #334155; vertical-align: top; }
        .med-tbl tbody td.r { text-align: right; }
        .med-nm  { font-weight: 700; color: #0c2d47; font-size: 13.5px; }
        .med-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .chip { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 10.5px; margin-right: 4px; font-weight: 600; }
        .chip-b { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
        .chip-e { background: #fff7ed; border: 1px solid #fdba74; color: #c2410c; }

        .bottom-grid {
          padding: 20px 36px 28px;
          display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start;
        }

        table.gst-tbl { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; font-size: 12px; }
        .gst-tbl th { background: #f1f5f9; padding: 9px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.9px; color: #64748b; font-weight: 700; text-align: right; }
        .gst-tbl th:first-child { text-align: left; }
        .gst-tbl td { padding: 8px 12px; color: #334155; border-bottom: 1px solid #f1f5f9; text-align: right; }
        .gst-tbl td:first-child { text-align: left; font-weight: 600; }
        .gst-tbl tr:last-child td { border-bottom: none; }

        .totals-box { width: 300px; }
        .t-row {
          display: flex; justify-content: space-between;
          padding: 8px 16px; font-size: 13px; color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }
        .t-row.disc { color: #059669; font-weight: 600; }
        .t-row.gst  { color: #4f46e5; font-size: 12px; }
        .t-grand {
          display: flex; justify-content: space-between;
          padding: 15px 16px;
          background: linear-gradient(135deg, #0c3b5e, #0c6b6f);
          color: #fff; font-weight: 800; font-size: 18px;
          border-radius: 0 0 10px 10px;
        }
        .totals-outer {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
        }

        .bill-footer {
          padding: 18px 36px 26px;
          border-top: 1.5px dashed #e2e8f0;
          display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;
        }
        .terms { font-size: 10.5px; color: #94a3b8; line-height: 1.9; max-width: 360px; }
        .terms strong { color: #64748b; font-size: 11px; display: block; margin-bottom: 2px; }
        .sig-area { text-align: center; }
        .sig-line2 { border-top: 1.5px solid #334155; width: 130px; margin: 0 auto 5px; }
        .sig-lbl { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.4px; }
        .sig-sub  { font-size: 10px; color: #94a3b8; margin-top: 2px; }

        .wellness {
          text-align: center;
          background: linear-gradient(135deg, #ecfdf5 0%, #eff6ff 50%, #f0fdf4 100%);
          padding: 16px 24px;
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: 16px;
          color: #0c3b5e;
          border-top: 1px solid #e2e8f0;
          letter-spacing: 0.3px;
        }

        @media print {
          .screen-nav, .no-print { display: none !important; }
          body { background: #fff !important; }
          .page-wrap { margin: 0; padding: 0; max-width: 100%; }
          .bill-card { box-shadow: none !important; border-radius: 0 !important; }
          .rainbow-bar, .info-strip, .t-grand, .logo-box {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <header className="screen-nav no-print">
        <div className="nav-left">
          <Link href="/sales">← सभी बिल</Link>
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
              <div>📞 <strong>+91 98765 43210</strong> &nbsp;|&nbsp; 📧 arogya@clinic.in</div>
              <div>GSTIN: <strong>09ABCDE1234F1Z5</strong></div>
              <div>Drug Lic: <strong>UP/GKP/2010/0042</strong></div>
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
              <div className="info-val" style={{fontSize:"13px"}}>
                <span className={`pay-badge ${
                  b.paymentType === "Credit" ? "pay-credit" :
                  b.paymentType === "upi"    ? "pay-upi" : "pay-cash"
                }`}>
                  {b.paymentType === "cash" ? "💵 CASH" : b.paymentType === "upi" ? "📱 UPI" : "🔒 CREDIT"}
                </span>
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="patient-band">
            <div className="p-row">
              <span className="p-lbl">M/s (Patient)</span>
              <span className="p-val">{b.patientName || "Walk-in Customer"}</span>
            </div>
            <div className="p-row">
              <span className="p-lbl">Mobile</span>
              <span className="p-val">{b.patientPhone || "—"}</span>
            </div>
            <div className="rx-band">
              👨‍⚕️ &nbsp;<strong>Dr. Kanta Prasad</strong>&nbsp; — MBBS, MD (Medicine) &nbsp;|&nbsp; Reg. No. UP-MCI-12345
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
                      {(item.gst || 0) > 0 && <div className="med-sub">GST @{item.gst}%</div>}
                    </td>
                    <td>
                      {item.batch
                        ? <span className="chip chip-b">{item.batch}</span>
                        : <span style={{color:"#cbd5e1"}}>—</span>
                      }
                    </td>
                    <td>
                      {item.expiry
                        ? <span className="chip chip-e">{item.expiry}</span>
                        : <span style={{color:"#cbd5e1"}}>—</span>
                      }
                    </td>
                    <td style={{fontSize:"11.5px",color:"#64748b"}}>{item.hsn || "—"}</td>
                    <td className="r" style={{fontWeight:700,color:"#0c3b5e"}}>{item.qty}</td>
                    <td className="r">₹{Number(item.mrp).toFixed(2)}</td>
                    <td className="r" style={{color:"#059669"}}>
                      {(item.discount || 0) > 0 ? `${item.discount}%` : "—"}
                    </td>
                    <td className="r" style={{fontWeight:700,color:"#0c2d47"}}>₹{Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom: GST + Totals */}
          <div className="bottom-grid">
            {/* GST Breakdown */}
            <div>
              <div className="sec-title" style={{paddingTop:"4px"}}>GST Summary</div>
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
                  {gst5 > 0 && <tr>
                    <td>5%</td>
                    <td>₹{gst5.toFixed(2)}</td>
                    <td>₹{cgst5.toFixed(2)}</td>
                    <td>₹{cgst5.toFixed(2)}</td>
                    <td>₹{(cgst5*2).toFixed(2)}</td>
                  </tr>}
                  {gst12 > 0 && <tr>
                    <td>12%</td>
                    <td>₹{gst12.toFixed(2)}</td>
                    <td>₹{cgst12.toFixed(2)}</td>
                    <td>₹{cgst12.toFixed(2)}</td>
                    <td>₹{(cgst12*2).toFixed(2)}</td>
                  </tr>}
                  {gst18 > 0 && <tr>
                    <td>18%</td>
                    <td>₹{gst18.toFixed(2)}</td>
                    <td>₹{cgst18.toFixed(2)}</td>
                    <td>₹{cgst18.toFixed(2)}</td>
                    <td>₹{(cgst18*2).toFixed(2)}</td>
                  </tr>}
                  {totalGST === 0 && <tr>
                    <td colSpan={5} style={{textAlign:"center",color:"#94a3b8",fontStyle:"italic"}}>No GST applicable</td>
                  </tr>}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div>
              <div className="sec-title" style={{paddingTop:"4px"}}>Amount</div>
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
              • Goods once sold will not be taken back or exchanged.<br />
              • Please verify medicines &amp; quantity before leaving.<br />
              • Credit dues unpaid by due date attract 24% p.a. interest.<br />
              • This is a system-generated bill, valid without signature.
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