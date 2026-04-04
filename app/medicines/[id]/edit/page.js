export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import EditMedicineClient from "./EditMedicineClient";
import { requireAccess } from "@/lib/access";

export default async function EditMedicinePage({ params }) {
  await requireAccess();

  const { id } = await params;
  const result = await db
    .select()
    .from(medicines)
    .where(eq(medicines.id, parseInt(id)))
    .limit(1);
  if (!result[0]) redirect("/medicines");
  return <EditMedicineClient medicine={result[0]} />;
}
