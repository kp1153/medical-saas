import { db } from "@/lib/db";
import { patients, sales } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request, { params }) {
  const { id } = await params;
  const patient = await db
    .select()
    .from(patients)
    .where(eq(patients.id, Number(id)))
    .get();
  if (!patient) return Response.json({ error: "Not found" }, { status: 404 });

  const patientSales = await db
    .select()
    .from(sales)
    .where(eq(sales.patientId, Number(id)))
    .all();

  return Response.json({ ...patient, sales: patientSales });
}