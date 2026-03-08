import { db } from "@/lib/db";
import { prescriptions, patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PrintPrescription({ params }) {
  const { id } = await params;
  const pid = parseInt(id);

  const [rx] = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.id, pid))
    .limit(1);
  if (!rx) redirect("/doctor");

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, rx.patientId))
    .limit(1);

  const medicines = JSON.parse(rx.medicines || "[]");
  const tests = JSON.parse(rx.tests || "[]");

  return (
    <>
      {/* Print Button — print में नहीं आएगा */}
      <div className="no-print bg-gray-100 px-6 py-3 flex items-center gap-4 shadow">
        <Link href="/doctor" className="text-blue-600 hover:underline text-sm">
          ← Back
        </Link>
        <a
          href="javascript:window.print()"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
        >
          🖨️ Print
        </a>
      </div>

      {/* Prescription — यही print होगा */}
      <div className="print-area max-w-2xl mx-auto bg-white p-8 mt-4 shadow-md rounded-xl">
        {/* Header */}
        <div className="border-b-2 border-blue-900 pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Sample Clinic</h1>
            <p className="text-gray-500 text-sm">
              123 Main Road, City — 000000
            </p>
            <p className="text-gray-500 text-sm">📞 98765-43210</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">Dr. Sample Doctor</p>
            <p className="text-gray-500 text-sm">MBBS, MD</p>
            <p className="text-gray-500 text-sm">Reg. No: 12345</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-3 gap-3 text-sm mb-4 bg-gray-50 rounded-lg p-3">
          <div>
            <span className="text-gray-500">Name:</span>{" "}
            <span className="font-semibold">{patient?.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Age:</span>{" "}
            <span className="font-semibold">{patient?.age || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>{" "}
            <span className="font-semibold capitalize">
              {patient?.gender || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>{" "}
            <span className="font-semibold">{patient?.phone || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Date:</span>{" "}
            <span className="font-semibold">
              {new Date(rx.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Rx No:</span>{" "}
            <span className="font-semibold">#{rx.id}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
            Diagnosis
          </p>
          <p className="text-gray-800 font-medium">{rx.diagnosis || "—"}</p>
          {rx.notes && (
            <p className="text-gray-500 text-sm mt-1 italic">{rx.notes}</p>
          )}
        </div>

        {/* Medicines */}
        {medicines.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
              ℞ Medicines
            </p>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-900 text-white">
                <tr>
                  {["#", "Medicine", "Dose", "Duration", "Instruction"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-semibold"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {m.medicineName}
                      {m.generic && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({m.generic})
                        </span>
                      )}
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
          </div>
        )}

        {/* Tests */}
        {tests.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
              🧪 Investigations
            </p>
            <div className="flex flex-wrap gap-2">
              {tests.map((t, i) => (
                <span
                  key={i}
                  className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-lg text-sm"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 mt-6 flex justify-between items-end text-sm">
          <p className="text-gray-400 text-xs">
            This is a computer generated prescription.
          </p>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-1 mt-8 w-40">
              <p className="text-gray-600 text-xs text-center">
                Dr. Sample Doctor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { 
            box-shadow: none !important; 
            margin: 0 !important;
            max-width: 100% !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
