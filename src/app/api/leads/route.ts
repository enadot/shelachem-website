import { z } from "zod";
import { createItem } from "@directus/sdk";
import { getDirectusClient } from "@/lib/directus";

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
   * נשמר כ-JSON בשדה `attribution`; מוגבל בגודל כדי שלא ישמש לדחיסת זבל.
   */
  attribution: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length <= 4000, "attribution too large")
    .optional(),
  /** Honeypot — humans never fill this hidden field. */
  company: z.string().max(0).optional(),
});

export async function POST(request: Request) {
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

  const client = getDirectusClient();
  if (client) {
    const item = { ...lead, email: email || null, submitted_at: new Date().toISOString() };
    const create = (data: Record<string, unknown>) =>
      client.request(createItem("leads" as never, data as never));
    try {
      await create(attribution ? { ...item, attribution } : item);
    } catch (err) {
      try {
        // התקנה שעוד לא הוסיפה את שדה attribution (או את ההרשאה אליו) — הליד חשוב יותר.
        if (!attribution) throw err;
        await create(item);
        console.warn("[leads] saved without attribution — add the field in Directus:", err);
      } catch (err2) {
        // Never lose a lead silently — keep it in the server log for manual recovery.
        console.error("[leads] Directus write failed:", err2, lead, attribution);
      }
    }
  } else {
    console.info("[leads] Directus not configured; lead received:", { ...lead, email, attribution });
  }

  return Response.json({ ok: true });
}
