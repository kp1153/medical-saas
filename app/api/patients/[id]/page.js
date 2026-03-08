"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";

export default function PatientDetail({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d));
  }, [id]);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
              <p className="text-gray-600 mt-1">📞 {data.phone}</p>
              {data.address && <p className="text-gray-600">🏠 {data.address}</p>}
              {data.age && <p className="text-gray-600">Age: {data.age} years</p>}
            </div>
            <Link
              href={`/sales/new?patientId=${data.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              + New Bill
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
          {(data.sales ?? []).length === 0 ? (
            <p className="text-gray-500">No records found</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-right">Payment</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-2 text-right">₹{s.netAmount}</td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.paymentType === "cash"
                            ? "bg-green-100 text-green-700"
                            : s.paymentType === "upi"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.paymentType}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <Link
                        href={`/sales/${s.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View Bill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}