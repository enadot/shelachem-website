import "server-only";
import { and, count, desc, eq, isNull, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getLeadWebhooks } from "@/lib/content";
import { forwardLead, type ForwardableLead, type ForwardResult } from "@/lib/lead-forwarding";

/**
 * גיבוי לידים: כל ליד נשמר ב-`lead_backups` לפני ההעברה ל-BARAM Leads, והתוצאה
 * נרשמת על השורה. ליד שלא הועבר מופיע בסקירה בלוח עם "שלח שוב".
 */

/** שומר את הליד ומחזיר את מזהה השורה; בלי מסד (או כשהוא לא זמין) — null, והליד ממשיך ל-BARAM. */
export async function backupLead(lead: ForwardableLead) {
  const client = db();
  if (!client) return null;
  try {
    // מסד איטי לא מעכב את הגולש: אחרי 5 שניות ממשיכים בלי גיבוי.
    const insert = client
      .insert(schema.leadBackups)
      .values({ payload: lead as unknown as Record<string, unknown> })
      .returning({ id: schema.leadBackups.id });
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("backup timeout")), 5000));
    const [row] = await Promise.race([insert, timeout]);
    return row.id;
  } catch (err) {
    console.error("[leads] backup failed (forwarding anyway):", err);
    return null;
  }
}

export async function recordForward(id: number, res: ForwardResult) {
  await db()!
    .update(schema.leadBackups)
    .set(
      res.ok
        ? { forwardedAt: new Date(), baramLeadId: res.leadId ?? null, forwardError: null }
        : { forwardError: res.error },
    )
    .where(eq(schema.leadBackups.id, id));
}

/** שליחה + רישום התוצאה. לא זורק. */
export async function forwardBackedUp(id: number | null, lead: ForwardableLead) {
  const res = await forwardLead(lead, await getLeadWebhooks());
  if (id !== null) await recordForward(id, res).catch((err) => console.error("[leads] backup update failed:", err));
  return res;
}

/** ליד שעדיין לא הועבר אחרי דקה — לא נספר בזמן שההעברה הראשונה עוד רצה. */
const pendingWhere = () =>
  and(isNull(schema.leadBackups.forwardedAt), lt(schema.leadBackups.receivedAt, new Date(Date.now() - 60_000)));

export async function pendingBackups(limit = 50) {
  const client = db();
  if (!client) return { total: 0, rows: [] };
  const [[{ total }], rows] = await Promise.all([
    client.select({ total: count() }).from(schema.leadBackups).where(pendingWhere()),
    client.select().from(schema.leadBackups).where(pendingWhere()).orderBy(desc(schema.leadBackups.receivedAt)).limit(limit),
  ]);
  return { total, rows };
}

/** שליחה חוזרת של כל הלידים שלא הועברו (עד 50 בפעם). */
export async function retryPending() {
  const { rows } = await pendingBackups();
  let sent = 0;
  for (const row of rows) {
    const res = await forwardBackedUp(row.id, row.payload as unknown as ForwardableLead);
    if (res.ok) sent++;
  }
  return { sent, failed: rows.length - sent };
}
