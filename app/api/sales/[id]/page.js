"use client";
import { useEffect, useState } from "react";
import { use } from "react";

export default function SaleDetail({ params }) {
  const { id } = use(params);
  const [sale, setSale] = useState(null);

  useEffect(() => {
    fetch(`/api/sales/${id}`)
      .then((r) => r.json())
      .then((d) => setSale(d));
  }, [id]);

  if (!sale) return <p className="p-6">लोड हो रहा है...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 print:shadow-none">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Akhil Medical</h1>
            <p className="text-gray-500 text-sm">Bill No: #{sale.id}</p>
            <p className="text-gray-500 text-sm">
              Date: {new Date(sale.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg print:hidden"
          >
            🖨️ Print
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">Patient: {sale.patientName ?? "Walk-in Customer"}</p>
          <p className="text-sm text-gray-600">Payment: {sale.paymentType}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-blue-50 text-left">
              <th className="p-2">Medicine</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale.items ?? []).map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{item.medicineName}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">₹{item.salePrice}</td>
                <td className="p-2 text-right">₹{item.quantity * item.salePrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right space-y-1">
          <p className="text-lg font-bold text-gray-800">Total: ₹{sale.totalAmount}</p>
          {sale.discount > 0 && (
            <p className="text-red-500">Discount: -₹{sale.discount}</p>
          )}
          <p className="text-xl font-bold text-blue-700">Net: ₹{sale.netAmount}</p>
        </div>
      </div>
    </div>
  );
}