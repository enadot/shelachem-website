/** אחרי זמן זה מוותרים ומציגים טלפון / וואטסאפ, במקום להישאר על "שולחים…". */
export const SUBMIT_TIMEOUT_MS = 15_000;

/** הצלחה אמיתית: 2xx ו-JSON עם ok:true. דף חסימה HTML בסטטוס 200 אינו ליד שנשמר. */
export function leadResponseAccepted(status: number, contentType: string | null, data: unknown): boolean {
  if (status < 200 || status >= 300) return false;
  if (!contentType?.toLowerCase().includes("application/json")) return false;
  return !!data && typeof data === "object" && (data as { ok?: unknown }).ok === true;
}

/** מדידה אחרי שמירה. כשל בפיקסל חסום לא משנה את תוצאת השליחה. */
export async function runLeadTracking(track: () => unknown): Promise<void> {
  try {
    await Promise.resolve(track());
  } catch {
    /* גוגל/מטא חסומים לא מבטלים ליד שכבר נשמר */
  }
}
