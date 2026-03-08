import { db } from "@/lib/db";
import { sales, saleItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function BillDetail({ params }) {
  const { id } = await params;
  const bill = await db.select().from(sales).where(eq(sales.id, parseInt(id))).limit(1);
  const items = await db.select().from(saleItems).where(eq(saleItems.saleId, parseInt(id)));

  if (!bill.length) return <div className="p-8 text-center text-gray-500">Bill not found</div>;

  const b = bill[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/sales" className="text-blue-300 hover:text-white text-sm">← All Bills</Link>
          <h1 className="text-lg font-bold">🧾 {b.billNo}</h1>
        </div>
        <button onClick={() => window.print()}
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition">
          🖨️ Print
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6" id="print-area">
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold text-blue-900">Medical SaaS</h2>
            <p className="text-gray-500 text-sm">GST Bill</p>
            <p className="text-gray-400 text-xs mt-1">{b.billNo} | {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Patient:</span> <span className="font-medium">{b.patientName}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{b.patientPhone || "—"}</span></div>
            <div><span className="text-gray-500">Payment:</span>
              <span className={`ml-1 font-semibold capitalize ${b.paymentType === "Credit" ? "text-red-600" : "text-green-600"}`}>
                {b.paymentType}
              </span>
            </div>
          </div>

          <table className="w-full text-sm border-t pt-2">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2">Medicine</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">MRP</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.medicineName}</td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">₹{item.mrp}</td>
                  <td className="py-2 text-right font-medium">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>₹{b.subtotal.toFixed(2)}</span>
            </div>
            {b.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>- ₹{b.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Net Amount</span>
              <span className="text-blue-700">₹{b.netAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}