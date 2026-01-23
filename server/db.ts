import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Get database URL from environment or use in-memory fallback
const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set, using in-memory storage");
    return null;
  }

  if (!db) {
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }

  return db;
}

export { schema };
