import { z } from "zod";
import { createItem } from "@directus/sdk";
import { getDirectusClient } from "@/lib/directus";

const leadSchema = z.object({
  full_name: z.string().trim().min(2, "נא להזין שם מלא"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{1,2}-?\d{7}$/, "נא להזין מספר טלפון ישראלי תקין"),
  email: z.union([z.string().trim().email("כתובת דוא״ל לא תקינה"), z.literal("")]).optional(),
  topic: z.string().trim().max(200).optional(),
  source_page: z.string().trim().max(200).optional(),
  marketing_consent: z.boolean().optional(),
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

  const { company: _honeypot, email, ...lead } = parsed.data;

  const client = getDirectusClient();
  if (client) {
    try {
      await client.request(
        createItem("leads" as never, {
          ...lead,
          email: email || null,
          submitted_at: new Date().toISOString(),
        } as never),
      );
    } catch (err) {
      // Never lose a lead silently — keep it in the server log for manual recovery.
      console.error("[leads] Directus write failed:", err, lead);
    }
  } else {
    console.info("[leads] Directus not configured; lead received:", { ...lead, email });
  }

  return Response.json({ ok: true });
}
