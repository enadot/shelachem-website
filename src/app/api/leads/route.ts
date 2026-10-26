import { z } from "zod";
import { after } from "next/server";
import { backupLead, forwardBackedUp } from "@/lib/lead-backups";

const leadSchema = z.object({
  full_name: z.string().trim().min(2, "נא להזין שם מלא").max(100),
  // אותה נורמליזציה כמו בטופס: רווחים/מקפים/+972 → ספרות עם 0 מוביל.
  phone: z
    .string()
    .transform((v) => v.trim().replace(/[\s-]/g, "").replace(/^(\+972|972)/, "0"))
    .refine((v) => /^0\d{8,9}$/.test(v), "נא להזין מספר טלפון ישראלי תקין"),
  email: z.union([z.string().trim().email("כתובת דוא״ל לא תקינה"), z.literal("")]).optional(),
  topic: z.string().trim().max(200).optional(),
  source_page: z.string().trim().max(200).optional(),
  marketing_consent: z.boolean().optional(),
  /**
   * מקור הליד (src/lib/attribution.ts): first/last touch, מזהי קליק ועוגיות פיקסלים.
   * נשמר בגיבוי ונשלח ל-BARAM; מוגבל בגודל כדי שלא ישמש לדחיסת זבל.
   */
  attribution: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length <= 4000, "attribution too large")
    .optional(),
  /** Honeypot — humans never fill this hidden field. */
  company: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  // Preview ב-Vercel קורא מאותו מסד של פרודקשן ומחזיק את מפתח BARAM: ליד מבדיקת QA היה
  // נכתב לגיבוי של הלקוח ומועבר ל-BARAM. לכן ב-preview לא שומרים ולא מעבירים כלום —
  // עונים 403 עם `preview: true` (הטופס מציג הודעת "סביבת בדיקה"), עוד לפני קריאת הגוף
  // והוולידציה — כך שגם בקשה ריקה מאמתת את החסימה בלי לשלוח פרטים. ראו docs/admin.md.
  if (process.env.VERCEL_ENV === "preview") {
    return Response.json(
      { ok: false, preview: true, error: "סביבת בדיקה (preview): הפרטים לא נשמרו ולא הועברו." },
      { status: 403, headers: { "X-Lead-Blocked": "preview" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "בקשה לא תקינה" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "נא לבדוק את הפרטים" },
      { status: 400 },
    );
  }

  const { company: _honeypot, email, attribution, ...lead } = parsed.data;

  const item = { ...lead, email: email || null, ...(attribution ? { attribution } : {}) };
  // קודם גיבוי במסד שלנו (מהיר), ואז ההעברה ל-BARAM Leads אחרי שהתשובה כבר יצאה
  // לגולש — המתנה למערכת חיצונית לא מעכבת את הודעת ה"תודה", וכשל בה לא מאבד את
  // הליד: הוא שמור בגיבוי ואפשר לשלוח אותו שוב מהלוח.
  const backupId = await backupLead(item);
  after(() => forwardBackedUp(backupId, item));

  return Response.json({ ok: true });
}
