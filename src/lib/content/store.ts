import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * קריאת תוכן מהמסד עבור האתר הציבורי. כל כשל (אין DATABASE_URL, המסד לא עונה,
 * timeout) מחזיר null — והאתר נופל לתוכן המקומי. אחרי כשל לא פונים למסד דקה,
 * כדי שעמוד עם כמה שאילתות לא יחכה לכל אחת (אותו עיקרון כמו מול ה-CMS הקודם).
 */
const TIMEOUT_MS = 8000;
const COOLDOWN_MS = 60_000;
let downUntil = 0;

async function guarded<T>(run: () => Promise<T>): Promise<T | null> {
  const client = db();
  if (!client || Date.now() < downUntil) return null;
  try {
    return await Promise.race([
      run(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), TIMEOUT_MS)),
    ]);
  } catch (err) {
    downUntil = Date.now() + COOLDOWN_MS;
    console.error("[content] DB unavailable, using local content:", err);
    return null;
  }
}

/** כל הפריטים של collection לפי הסדר. null = להשתמש בתוכן המקומי. */
export const readCollection = cache(async (collection: string) => {
  const rows = await guarded(() =>
    db()!
      .select({ id: schema.contentItems.id, data: schema.contentItems.data })
      .from(schema.contentItems)
      .where(eq(schema.contentItems.collection, collection))
      .orderBy(asc(schema.contentItems.position), asc(schema.contentItems.createdAt)),
  );
  if (!rows?.length) return null;
  return rows.map((r) => ({ ...r.data, id: r.id }));
});

/** שורת הגדרות האתר. null = ברירות המחדל שב-config.ts. */
export const readSettingsRow = cache(async () => {
  const rows = await guarded(() => db()!.select().from(schema.siteSettings).limit(1));
  return rows?.[0]?.data ?? null;
});
