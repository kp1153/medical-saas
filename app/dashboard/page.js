import Link from "next/link";
import { db } from "@/lib/db";
import { sales, medicines, payments } from "@/lib/schema";

export default async function Dashboard() {
  const allSales = await db.select().from(sales);
  const allMedicines = await db.select().from(medicines);
  const allPayments = await db.select().from(payments);

  const today = new Date().toDateString();
  const todaySales = allSales.filter(
    (s) => new Date(s.createdAt).toDateString() === today,
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.netAmount, 0);
  const totalRevenue = allSales.reduce((sum, s) => sum + s.netAmount, 0);

  const totalUdhar = allSales
    .filter((s) => s.paymentType === "Credit")
    .reduce((sum, s) => sum + s.netAmount, 0);
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = Math.max(0, totalUdhar - totalPaid);

  const lowStockCount = allMedicines.filter((m) => m.stock <= 10).length;

  const expiredCount = allMedicines.filter((m) => {
    if (!m.expiry) return false;
    const parts = m.expiry.split("/");
    if (parts.length < 2) return false;
    return new Date(`${parts[1]}-${parts[0]}-01`) < new Date();
  }).length;

  const nearExpiry = allMedicines.filter((m) => {
    if (!m.expiry) return false;
    const parts = m.expiry.split("/");
    if (parts.length < 2) return false;
    const exp = new Date(`${parts[1]}-${parts[0]}-01`);
    const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  }).length;

  const navLinks = [
    {
      href: "/sales",
      icon: "📋",
      label: "All Bills",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      href: "/patients",
      icon: "👤",
      label: "Patients",
      color: "bg-cyan-600 hover:bg-cyan-700",
    },
    {
      href: "/medicines",
      icon: "💊",
      label: "Medicines",
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      href: "/suppliers",
      icon: "🏭",
      label: "Suppliers",
      color: "bg-violet-600 hover:bg-violet-700",
    },
    {
      href: "/purchases/new",
      icon: "📦",
      label: "New Purchase",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      href: "/purchases",
      icon: "📜",
      label: "Purchase History",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      href: "/report",
      icon: "📊",
      label: "Sales Report",
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      href: "/profit",
      icon: "💰",
      label: "Profit / Loss",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      href: "/credit",
      icon: "🔒",
      label: "Credit",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      href: "/counter",
      icon: "🪟",
      label: "Counter",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      href: "/doctor",
      icon: "🩺",
      label: "Doctor",
      color: "bg-green-700 hover:bg-green-800",
    },
    {
      href: "/pharmacy",
      icon: "💊",
      label: "Pharmacy",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💊</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Medical SaaS</h1>
            <p className="text-blue-300 text-xs">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-200 hidden md:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <Link
            href="/api/logout"
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            🚪 Logout
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 text-sm">Today's overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: "Today's Sales",
              value: `₹${todayRevenue.toFixed(0)}`,
              sub: `${todaySales.length} bills`,
              border: "border-blue-500",
              text: "text-blue-700",
            },
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toFixed(0)}`,
              sub: `${allSales.length} total bills`,
              border: "border-green-500",
              text: "text-green-700",
            },
            {
              label: "Credit Pending",
              value: `₹${totalPending.toFixed(0)}`,
              sub: "Outstanding",
              border: "border-red-500",
              text: "text-red-600",
            },
            {
              label: "Low Stock",
              value: lowStockCount,
              sub: "Items ≤ 10 qty",
              border: "border-orange-400",
              text: "text-orange-500",
            },
            {
              label: "Expiring Soon",
              value: nearExpiry,
              sub: "Within 30 days",
              border: "border-rose-500",
              text: "text-rose-600",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.border}`}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                {s.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <Link href="/sales/new">
          <div className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-lg font-bold">🧾 Create New Bill</p>
              <p className="text-blue-200 text-sm mt-0.5">
                Fast GST billing for walk-in customers
              </p>
            </div>
            <span className="text-4xl opacity-60">→</span>
          </div>
        </Link>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            All Modules
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`${link.color} text-white rounded-xl shadow p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition min-h-[100px]`}
                >
                  <span className="text-3xl">{link.icon}</span>
                  <p className="text-sm font-semibold text-center leading-tight">
                    {link.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {(lowStockCount > 0 || expiredCount > 0 || nearExpiry > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-orange-700">
                    {lowStockCount} medicines low on stock
                  </p>
                  <Link
                    href="/medicines"
                    className="text-orange-600 text-sm underline"
                  >
                    View & reorder →
                  </Link>
                </div>
              </div>
            )}
            {expiredCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-semibold text-red-700">
                    {expiredCount} medicines expired
                  </p>
                  <Link
                    href="/medicines"
                    className="text-red-600 text-sm underline"
                  >
                    Review now →
                  </Link>
                </div>
              </div>
            )}
            {nearExpiry > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-semibold text-yellow-700">
                    {nearExpiry} expiring within 30 days
                  </p>
                  <Link
                    href="/medicines"
                    className="text-yellow-600 text-sm underline"
                  >
                    Return to supplier →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}