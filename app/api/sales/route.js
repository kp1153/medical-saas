import { db } from "@/lib/db";
import { sales, saleItems, medicines } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(sales);
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();
  const billNo = "BILL-" + Date.now();

  const inserted = await db.insert(sales).values({
    billNo,
    patientName: body.patient.name,
    patientPhone: body.patient.phone || null,
    subtotal: body.subtotal,
    discount: body.discount,
    gstAmount: 0,
    netAmount: body.netAmount,
    paymentType: body.paymentType,
    paidAmount: body.paymentType === "Credit" ? 0 : body.netAmount,
  }).returning({ id: sales.id });

  const billId = inserted[0].id;

  for (const item of body.items) {
    await db.insert(saleItems).values({
      saleId: billId,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      batch: item.batch,
      expiry: item.expiry,
      qty: item.qty,
      mrp: item.mrp,
      discount: item.discount || 0,
      gst: item.gst || 0,
      amount: item.amount,
    });

    // stock घटाओ
    await db.update(medicines)
      .set({ stock: sql`stock - ${item.qty}` })
      .where(eq(medicines.id, item.medicineId));
  }

  return NextResponse.json({ success: true, billId });
}

