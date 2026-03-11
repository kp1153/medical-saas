import { db } from "@/lib/db";
import { prescriptions, patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Pharmacy() {
  const all = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.sentToPharmacy, 1));

  const queue = await Promise.all(
    all.map(async (rx) => {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, rx.patientId))
        .limit(1);
      return { ...rx, patient: patient[0] || null };
    }),
  );

  const sorted = queue.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">💊 Pharmacy — Prescriptions</h1>
          <Link
            href="/pharmacy/walk-in"
            style={{
              background: "#4f46e5",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            🛒 Walk-in Bill
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="text-purple-300 hover:text-white text-sm"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {sorted.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            No prescriptions yet
          </div>
        )}
        {sorted.map((rx) => (
          <div key={rx.id} className="bg-white rounded-xl shadow p-5 space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  {rx.patient?.name || "—"}
                </p>
                <p className="text-sm text-gray-500">
                  Token #{rx.patientId} &nbsp;·&nbsp;
                  {rx.patient?.age ? `${rx.patient.age} yrs` : ""} &nbsp;·&nbsp;
                  {rx.patient?.phone || ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {new Date(rx.createdAt).toLocaleString("en-IN")}
                </p>
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Rx #{rx.id}
                </span>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-500 font-medium">Diagnosis: </span>
              <span className="text-red-600 font-semibold">
                {rx.diagnosis || "—"}
              </span>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Medicine", "Dose", "Duration", "Instruction"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JSON.parse(rx.medicines).map((m, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {m.medicineName}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{m.dose || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {m.duration || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {m.instruction || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rx.notes && (
              <p className="text-sm text-gray-500 italic border-t pt-2">
                📝 {rx.notes}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Link
                href={`/pharmacy/${rx.id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                💊 Create Bill
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}