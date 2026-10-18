import "server-only";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db, schema } from "@/db";

/** שורת ההגדרות העדכנית (ישר מהמסד, בלי המטמון של האתר). */
export async function readGlobals() {
  const rows = await db()!.select().from(schema.siteSettings).limit(1);
  return (rows[0]?.data ?? {}) as Record<string, unknown>;
}

/** שמירה (מיזוג עם הקיים) + רענון האתר כולו — השינוי מופיע מיד, בלי build. */
export async function saveGlobals(patch: Record<string, unknown>, by: string) {
  await db()!
    .insert(schema.siteSettings)
    .values({ id: 1, data: patch, updatedBy: by })
    .onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: { data: sql`${schema.siteSettings.data} || ${JSON.stringify(patch)}::jsonb`, updatedAt: new Date(), updatedBy: by },
    });
  revalidateSite();
}

export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** הודעת שגיאה קריאה. */
export function errorMessage(err: unknown) {
  const e = err as { message?: string; code?: string };
  if (e?.code === "23505") return "כבר קיים פריט עם אותו ערך";
  return e?.message && !/[\u0000-\u001f]/.test(e.message) ? e.message : "הפעולה נכשלה";
}
