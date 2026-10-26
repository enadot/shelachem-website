/**
 * שער הטענות של עמודי הנחיתה (T-026).
 *
 * כל טענה שיווקית בעמודי `/lp` מסומנת בקוד (C1..C18, ההגדרות ב-brief.md סעיף 8).
 * כל עוד טענה לא אושרה בכתב על ידי הלקוח, היא `false` כאן, ומשפט שמכיל אותה
 * מוצג בפרודקשן בגרסה הניטרלית בלבד (או לא מוצג, כשאין גרסה ניטרלית).
 *
 * לאישור טענה: לשנות את הערך שלה ל-`true`, אחרי אישור כתוב בלבד, ולתעד מי אישר ומתי.
 *
 * יומן אישורים:
 * - C1, C3 — אושרו על ידי אביב אברהם, 26.10.2026 10:33 (שעון ישראל):
 *   "מאז 2013 זה מאושר, תשלום מבוסס הצלחה בלבד אפשר לרשום גם".
 * - C4 — אושרה על ידי אביב אברהם, 26.10.2026 10:55 (שעון ישראל), בנוסח:
 *   "בדיקה ללא עלות. תשלום רק על בסיס הצלחה". בעמודי /lp: "ללא עלות" (לא "חינם"),
 *   ובלי "בלי התחייבות" / "אינה מחייבת", שלא נכללו בנוסח המאושר.
 */
export type ClaimId =
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9"
  | "C10" | "C11" | "C12" | "C13" | "C14" | "C15" | "C16" | "C17" | "C18";

export const CLAIM_APPROVALS: Record<ClaimId, boolean> = {
  C1: true, // מאז 2013 — אושר: אביב אברהם, 26.10.2026 10:33
  C2: false, // עשרות אלפי תיקים
  C3: true, // שכר טרחה בהצלחה בלבד / 0 ₪ מראש — אושר: אביב אברהם, 26.10.2026 10:33
  C4: true, // "בדיקה ללא עלות. תשלום רק על בסיס הצלחה" — אושר: אביב אברהם, 26.10.2026 10:55
  C5: false, // צוות רופאים / רופא מכווין לפני הוועדה
  C6: false, // חוות דעת רפואית של מומחה
  C7: false, // מנהלת תיק אישית
  C8: false, // דיסקרטיות מלאה
  C9: false, // זמן חזרה ("תוך יום עסקים")
  C10: false, // סניפים, כתובות, טלפון
  C11: false, // החברה אינה נותנת שירותים משפטיים
  C12: false, // ליווי אחרי ההחלטה: ערר / בדיקה מחדש
  C13: false, // עובדות חוק: אחוזים, מועדים, תקופות
  C14: false, // החברה מטפלת בפועל בטרשת נפוצה / קרוהן / קוליטיס / פיברומיאלגיה
  C15: false, // בדיקה מול כל הגופים (ביטוח לאומי, מס הכנסה, פנסיה, ביטוח)
  C16: false, // בן משפחה יכול לפנות ראשון
  C17: false, // תאונת עבודה: בלי חתימת מעסיק / עצמאים / ביטוחים פרטיים
  C18: false, // כבר חתמתם עם חברה אחרת
};

/** טקסט שמכיל טענות: הנוסח המלא, והנוסח הניטרלי שמוצג עד האישור (`null` = לא מוצג). */
export interface Claimed<T> {
  claims: ClaimId[];
  withClaim: T;
  neutral: T | null;
}

export type Gated<T> = T | Claimed<T>;

export function gated<T>(claims: ClaimId[], withClaim: T, neutral: T | null): Claimed<T> {
  return { claims, withClaim, neutral };
}

export function isClaimed<T>(v: Gated<T>): v is Claimed<T> {
  return typeof v === "object" && v !== null && "withClaim" in v && "claims" in v;
}

export function pendingClaims(claims: readonly ClaimId[]): ClaimId[] {
  return claims.filter((c) => !CLAIM_APPROVALS[c]);
}

/**
 * מצב התצוגה:
 * - `strict` — פרודקשן: רק נוסח ניטרלי או מאושר. תמיד ב-`VERCEL_ENV=production`.
 * - `review` — preview/פיתוח: הנוסח המלא, עם תג "ממתין לאישור" על כל טענה פתוחה.
 */
export type ClaimMode = "strict" | "review";

export const isProductionDeploy = () => process.env.VERCEL_ENV === "production";

/** `?view=production` מחוץ לפרודקשן מציג בדיוק את מה שפרודקשן יציג. */
export function claimMode(view?: string | string[]): ClaimMode {
  if (isProductionDeploy()) return "strict";
  return view === "production" ? "strict" : "review";
}

export interface Resolved<T> {
  value: T;
  /** טענות שעוד לא אושרו ומוצגות (רק במצב review). */
  pending: ClaimId[];
}

/** בוחר את הנוסח לפי המצב. `null` — הפריט לא מוצג. */
export function resolveClaim<T>(v: Gated<T>, mode: ClaimMode): Resolved<T> | null {
  if (!isClaimed(v)) return { value: v, pending: [] };
  const pending = pendingClaims(v.claims);
  if (pending.length === 0) return { value: v.withClaim, pending: [] };
  if (mode === "review") return { value: v.withClaim, pending };
  return v.neutral === null ? null : { value: v.neutral, pending: [] };
}

/** כמו `resolveClaim` למחרוזות, בלי תגים (למטא-דאטה ול-JSON-LD). */
export function claimText(v: Gated<string>, mode: ClaimMode): string | null {
  return resolveClaim(v, mode)?.value ?? null;
}

/** רשימה: מסנן פריטים שאין להם נוסח במצב הנוכחי. */
export function resolveList<T>(items: readonly Gated<T>[], mode: ClaimMode): Resolved<T>[] {
  return items.map((i) => resolveClaim(i, mode)).filter((r): r is Resolved<T> => r !== null);
}
