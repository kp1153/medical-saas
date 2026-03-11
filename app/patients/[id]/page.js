import Link from "next/link";
import { db } from "@/lib/db";
import { patients, prescriptions, sales, saleItems, labReports } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import PatientActions from "./PatientActions";

export const dynamic = "force-dynamic";

export default async function PatientHistory({ params }) {
  const { id } = await params;
  const pid = parseInt(id);

  const [patientArr, allPrescriptions, allSales, allLabReports] = await Promise.all([
    db.select().from(patients).where(eq(patients.id, pid)).limit(1),
    db.select().from(prescriptions).where(eq(prescriptions.patientId, pid)).orderBy(desc(prescriptions.createdAt)),
    db.select().from(sales).where(eq(sales.patientId, pid)).orderBy(desc(sales.createdAt)),
    db.select().from(labReports).where(eq(labReports.patientId, pid)).orderBy(desc(labReports.createdAt)),
  ]);

  const patient = patientArr[0];
  if (!patient) redirect("/patients");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/patients" className="text-blue-300 hover:text-white text-sm">← Patients</Link>
          <h1 className="text-lg font-bold">👤 {patient.name} — Token #{patient.id}</h1>
        </div>
        <PatientActions patient={patient} />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">Age:</span> <span className="font-medium">{patient.age || "—"}</span></div>
          <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{patient.gender || "—"}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{patient.phone || "—"}</span></div>
          <div><span className="text-gray-500">Address:</span> <span className="font-medium">{patient.address || "—"}</span></div>
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">🩺 Prescriptions & Tests</div>
          {allPrescriptions.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No prescriptions yet</p>
          ) : (
            <div className="divide-y">
              {allPrescriptions.map((rx) => {
                const meds = JSON.parse(rx.medicines || "[]");
                const tests = JSON.parse(rx.tests || "[]");
                const rxReports = allLabReports.filter((r) => r.prescriptionId === rx.id);
                return (
                  <div key={rx.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{rx.diagnosis || "—"}</p>
                      <span className="text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    {rx.notes && <p className="text-xs text-gray-500 italic">{rx.notes}</p>}

                    {meds.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Medicines</p>
                        <div className="flex flex-wrap gap-2">
                          {meds.map((m, i) => (
                            <span key={i} className="bg-blue-50 text-blue-800 px-2 py-1 rounded-lg text-xs">
                              {m.medicineName} {m.dose && `— ${m.dose}`} {m.duration && `× ${m.duration}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tests Ordered</p>
                        <div className="flex flex-wrap gap-2">
                          {tests.map((t, i) => {
                            const report = rxReports.find((r) => r.testName === t.name);
                            return (
                              <span key={i} className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                report?.result
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {t.name}
                                {report?.result && `: ${report.result}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lab Reports */}
        {allLabReports.length > 0 && (
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 py-3 border-b font-semibold text-gray-700">🧪 Lab Reports</div>
            <div className="divide-y">
              {allLabReports.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{r.testName}</p>
                    <p className="text-xs text-gray-400">{r.category} · {r.reportDate || new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    {r.result
                      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">{r.result}</span>
                      : <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs">Pending</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bills */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">🧾 Bills</div>
          {allSales.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No bills yet</p>
          ) : (
            <div className="divide-y">
              {allSales.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{s.billNo}</p>
                    <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      s.paymentType === "Credit" ? "bg-red-100 text-red-700" :
                      s.paymentType === "upi" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>{s.paymentType}</span>
                    <span className="font-bold text-gray-800">₹{s.netAmount.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}