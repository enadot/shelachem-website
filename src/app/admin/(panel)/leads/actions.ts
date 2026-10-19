"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/admin/session";
import { addLeadNote, updateLead } from "@/lib/baram-api";
import { errorMessage } from "@/lib/admin/globals";
import { retryPending } from "@/lib/lead-backups";

const feedbackSchema = z.object({
  id: z.number().int().positive(),
  feedbackId: z.number().int().positive().nullable(),
  reason: z.string().trim().max(500).optional(),
  /** ISO עם אזור זמן — למשוב מסוג "לחזור מאוחר יותר" (נוצרת משימה ב-BARAM). */
  remindAt: z.iso.datetime({ offset: true }).optional(),
});

/** עדכון משוב של ליד ב-BARAM Leads. */
export async function updateFeedbackAction(input: z.input<typeof feedbackSchema>) {
  await requireSession();
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "נתונים לא תקינים" };
  const { id, feedbackId, reason, remindAt } = parsed.data;
  try {
    await updateLead(id, { feedbackId, ...(reason ? { feedbackReason: reason } : {}), ...(remindAt ? { remindAt } : {}) });
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

const noteSchema = z.object({ id: z.number().int().positive(), text: z.string().trim().min(1).max(5000) });

/** הערה לציר הזמן של הליד ב-BARAM. נרשמת בשם בעל מפתח ה-API, ולכן מוסיפים את שם הכותב. */
export async function addNoteAction(input: z.input<typeof noteSchema>) {
  const { user } = await requireSession();
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "נא לכתוב הערה" };
  try {
    await addLeadNote(parsed.data.id, `${parsed.data.text}\n— ${user.name} (לוח האתר)`);
    revalidatePath(`/admin/leads/${parsed.data.id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** שליחה חוזרת ל-BARAM של לידים מהגיבוי שלא הועברו. */
export async function retryBackupsAction() {
  await requireSession();
  try {
    const res = await retryPending();
    revalidatePath("/admin");
    return { ok: res.failed === 0, ...res, error: res.failed ? `${res.failed} לידים עדיין לא הועברו` : undefined };
  } catch (err) {
    return { ok: false, sent: 0, failed: 0, error: errorMessage(err) };
  }
}
