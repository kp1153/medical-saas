import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";

let _db = null;

export function getDb() {
  if (!_db) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client);
  }
  return _db;
}

export const db = new Proxy({}, {
  get(_, prop) {
    return getDb()[prop];
  }
});