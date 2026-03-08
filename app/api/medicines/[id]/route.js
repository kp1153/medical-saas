import { db } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const result = await db.select().from(medicines).where(eq(medicines.id, parseInt(id))).limit(1);
  return NextResponse.json(result[0] || null);
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  await db.update(medicines).set({
    name: body.name,
    generic: body.generic || null,
    company: body.company || null,
    batch: body.batch || null,
    expiry: body.expiry || null,
    mrp: parseFloat(body.mrp),
    purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
    stock: parseInt(body.stock) || 0,
    unit: body.unit || "strip",
    rack: body.rack || null,
    hsn: body.hsn || null,
    gst: parseFloat(body.gst) || 12,
  }).where(eq(medicines.id, parseInt(id)));
  return NextResponse.json({ success: true });
}