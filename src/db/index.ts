import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * חיבור למסד (Neon ב-production, Postgres מקומי בפיתוח). `DATABASE_URL` נוצר
 * אוטומטית כשמחברים את Neon לפרויקט ב-Vercel. בלעדיו — `db()` מחזיר null
 * והאתר עובד מהתוכן המקומי (כמו ב-CI).
 */
let client: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= drizzle(
    postgres(url, {
      // פונקציות serverless: מעט חיבורים, וסגירה מהירה של חיבור לא פעיל.
      max: 3,
      idle_timeout: 20,
      connect_timeout: 8,
      prepare: false,
    }),
    { schema },
  );
  return client;
}

export const dbEnabled = () => Boolean(process.env.DATABASE_URL);
export { schema };
