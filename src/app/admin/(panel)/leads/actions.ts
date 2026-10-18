"use server";

import { updateItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/admin/session";
import { errorMessage } from "@/lib/admin/globals";
import { LEAD_STATUSES } from "@/lib/admin/migrate";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES.map((s) => s.value) as [string, ...string[]]).optional(),
  notes: z.string().max(5000).optional(),
});

/** עדכון סטטוס/הערות של ליד — שאר השדות קבועים (מה שהגולש שלח). */
export async function updateLeadAction(input: z.input<typeof schema>) {
  const { client } = await requireSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "נתונים לא תקינים" };
  const { id, ...patch } = parsed.data;
  try {
    await client.request(updateItem("leads" as never, id, patch as never));
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
