import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700">
      <header className="bg-blue-950 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💊</span>
          <div>
            <h1 className="text-white text-xl font-bold">Medical SaaS</h1>
            <p className="text-blue-300 text-xs">Smart billing for medical stores</p>
          </div>
        </div>
        <Link href="/login"
          className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-lg font-semibold text-sm transition">
          Login
        </Link>
      </header>

      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Fastest Billing Software<br />
          <span className="text-green-400">for Your Medical Store</span>
        </h2>
        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
          GST Bills · Stock Management · Credit Tracking · Doctor Prescription — all in one place.
        </p>
        <Link href="/register"
          className="bg-green-500 hover:bg-green-400 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition">
          Start Free Trial
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🧾", title: "Fast GST Billing", desc: "Generate bills in minutes, send via WhatsApp" },
          { icon: "📦", title: "Stock Management", desc: "Expiry alerts, batch tracking, low stock warnings" },
          { icon: "💰", title: "Credit Tracking", desc: "A/R aging — see who owes how much, since when" },
          { icon: "🏥", title: "Doctor + Pharmacy", desc: "Digital prescription workflow — paperless counter" },
          { icon: "📊", title: "Reports & Profit", desc: "Item-wise profit, daily/monthly sales charts" },
          { icon: "🌐", title: "Your Own Website", desc: "Professional website on your domain — included" },
        ].map((f, i) => (
          <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-white font-bold text-lg mb-1">{f.title}</h3>
            <p className="text-blue-200 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-6 text-blue-300 text-sm border-t border-white/10">
        © 2026 Medical SaaS — Built for India
      </footer>
    </main>
  );
}

