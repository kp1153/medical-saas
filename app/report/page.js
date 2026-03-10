export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { sales } from "@/lib/schema";
import Link from "next/link";

export default async function Report() {
  const allSales = await db.select().from(sales);

  const today = new Date();
  const todayStr = today.toDateString();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const todaySales = allSales.filter((s) => new Date(s.createdAt).toDateString() === todayStr);
  const monthSales = allSales.filter((s) => {
    const d = new Date(s.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const todayRevenue = todaySales.reduce((s, b) => s + b.netAmount, 0);
  const monthRevenue = monthSales.reduce((s, b) => s + b.netAmount, 0);
  const totalRevenue = allSales.reduce((s, b) => s + b.netAmount, 0);

  const cashTotal = allSales.filter((b) => b.paymentType === "cash").reduce((s, b) => s + b.netAmount, 0);
  const upiTotal = allSales.filter((b) => b.paymentType === "upi").reduce((s, b) => s + b.netAmount, 0);
  const CreditTotal = allSales.filter((b) => b.paymentType === "Credit").reduce((s, b) => s + b.netAmount, 0);

  // Last 7 days
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const daySales = allSales.filter((s) => new Date(s.createdAt).toDateString() === dayStr);
    const dayTotal = daySales.reduce((s, b) => s + b.netAmount, 0);
    last7.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      total: dayTotal,
      count: daySales.length,
    });
  }

  const maxVal = Math.max(...last7.map((d) => d.total), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="text-lg font-bold">📊 Sales Report</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Today's Revenue",  value: `₹${todayRevenue.toFixed(0)}`,  sub: `${todaySales.length} bills`,   border: "border-blue-500",  text: "text-blue-700" },
            { label: "This Month",       value: `₹${monthRevenue.toFixed(0)}`,  sub: `${monthSales.length} bills`,   border: "border-green-500", text: "text-green-700" },
            { label: "Total Revenue",    value: `₹${totalRevenue.toFixed(0)}`,  sub: `${allSales.length} bills`,     border: "border-violet-500",text: "text-violet-700" },
            { label: "Cash Sales",       value: `₹${cashTotal.toFixed(0)}`,     sub: "Cash payments",                border: "border-green-400", text: "text-green-600" },
            { label: "UPI Sales",        value: `₹${upiTotal.toFixed(0)}`,      sub: "UPI payments",                 border: "border-blue-400",  text: "text-blue-600" },
            { label: "Credit Given",     value: `₹${CreditTotal.toFixed(0)}`,   sub: "Credit sales",                 border: "border-red-400",   text: "text-red-600" },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.border}`}>
              <p className="text-xs text-gray-500 uppercase font-semibold">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Last 7 Days Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-4">Last 7 Days Sales</h3>
          <div className="flex items-end gap-3 h-40">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">₹{d.total.toFixed(0)}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all"
                  style={{ height: `${(d.total / maxVal) * 120}px`, minHeight: d.total > 0 ? "4px" : "0" }}>
                </div>
                <span className="text-xs text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


