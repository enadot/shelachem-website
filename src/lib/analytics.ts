/**
 * מדידת המרות — אירוע יחיד ומוגדר היטב ששכבת התיוג (GTM/GA4) יכולה להאזין לו.
 *
 * האתר לא טוען היום שום תג מדידה. הפונקציה כותבת ל-`dataLayer` בלי תלות בספרייה
 * כלשהי, כך שברגע שיותקן GTM/GA4 — ההמרות נמדדות בלי שינוי קוד נוסף:
 * ב-GTM יוצרים טריגר Custom Event בשם `generate_lead` וממפים אותו להמרה.
 */

export const LEAD_CONVERSION_EVENT = "generate_lead";

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

/** דוחף אירוע ל-dataLayer. בטוח לקריאה גם כשאין שכבת תיוג מותקנת. */
export function pushDataLayer(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer ?? []).push(event);
}

/** נקרא רק אחרי שהליד נשמר בהצלחה בשרת — אחרת נספור המרות שלא קרו. */
export function trackLeadConversion({
  source,
  topic,
}: {
  source?: string;
  topic?: string;
}) {
  pushDataLayer({
    event: LEAD_CONVERSION_EVENT,
    lead_source: source,
    lead_topic: topic,
  });
}
