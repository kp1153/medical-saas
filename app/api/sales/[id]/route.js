import { db } from "@/lib/db";
import { sales, saleItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request, { params }) {
  const { id } = await params;
  const saleResult = await db
    .select()
    .from(sales)
    .where(eq(sales.id, Number(id)))
    .limit(1);
  const sale = saleResult[0];
  if (!sale) return Response.json({ error: "Not found" }, { status: 404 });

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, Number(id)));

  return Response.json({ ...sale, items });
}