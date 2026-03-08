import { db } from "@/lib/db";
import { purchases, purchaseItems, medicines } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(purchases);
  return NextResponse.json(all);
}

export async function POST(req) {
  const body = await req.json();

  const inserted = await db.insert(purchases).values({
    supplierId: body.supplierId ? parseInt(body.supplierId) : null,
    supplierName: body.supplierName || null,
    invoiceNo: body.invoiceNo || null,
    totalAmount: body.totalAmount,
    paidAmount: 0,
  }).returning({ id: purchases.id });

  const purchaseId = inserted[0].id;

  for (const item of body.items) {
    if (!item.medicineName) continue;

    await db.insert(purchaseItems).values({
      purchaseId,
      medicineName: item.medicineName,
      batch: item.batch || null,
      expiry: item.expiry || null,
      qty: parseInt(item.qty) || 0,
      purchasePrice: parseFloat(item.purchasePrice) || 0,
      mrp: parseFloat(item.mrp) || 0,
      gst: parseFloat(item.gst) || 12,
      amount: parseFloat(item.amount) || 0,
    });

    // medicines table में stock update करो
    const existing = await db.select().from(medicines)
      .where(eq(medicines.name, item.medicineName)).limit(1);

    if (existing.length) {
      await db.update(medicines)
        .set({
          stock: existing[0].stock + parseInt(item.qty),
          batch: item.batch || existing[0].batch,
          expiry: item.expiry || existing[0].expiry,
          purchasePrice: parseFloat(item.purchasePrice) || existing[0].purchasePrice,
          mrp: parseFloat(item.mrp) || existing[0].mrp,
        })
        .where(eq(medicines.id, existing[0].id));
    } else {
      await db.insert(medicines).values({
        name: item.medicineName,
        batch: item.batch || null,
        expiry: item.expiry || null,
        mrp: parseFloat(item.mrp) || 0,
        purchasePrice: parseFloat(item.purchasePrice) || 0,
        stock: parseInt(item.qty) || 0,
        gst: parseFloat(item.gst) || 12,
      });
    }
  }

  return NextResponse.json({ success: true });
}

