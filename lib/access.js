import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

export async function requireAccess() {
  const session = await getSession();
  if (!session) redirect("/login");

  const email = session.email;

  if (email === DEVELOPER_EMAIL) return session;

  const userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const u = userRow[0];

  if (!u) redirect("/expired");

  const now = new Date();
  const expiry = u.expiryDate ? new Date(u.expiryDate) : null;

  const isActive = u.status === "active" && expiry && expiry > now;
  const isTrial = u.status === "trial" && expiry && expiry > now;

  if (!isActive && !isTrial) redirect("/expired");

  return session;
}