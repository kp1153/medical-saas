import { db, initDB } from "@/lib/db";
import { medicines } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditMedicineClient from "./EditMedicineClient";


export default async function EditMedicinePage({ params }) {
     await initDB();
  const cookieStore = await cookies();
  if (!cookieStore.get("auth")) redirect("/login");

  const { id } = await params;
  const result = await db
    .select()
    .from(medicines)
    .where(eq(medicines.id, parseInt(id)))
    .limit(1);

  if (!result[0]) redirect("/medicines");

  return <EditMedicineClient medicine={result[0]} />;
}