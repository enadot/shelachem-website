"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { createUser, resetPassword, updateUser } from "@/lib/admin/users";
import { errorMessage } from "@/lib/admin/globals";

const role = z.enum(["admin", "editor"]);

const createSchema = z.object({
  name: z.string().trim().min(1, "נא להזין שם").max(100),
  email: z.email("דוא״ל לא תקין").trim().max(200),
  role,
});

export type UserActionResult = { ok: boolean; error?: string; password?: string };

export async function createUserAction(input: z.input<typeof createSchema>): Promise<UserActionResult> {
  await requireAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  try {
    const password = await createUser(parsed.data);
    revalidatePath("/admin/users");
    return { ok: true, password };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function resetPasswordAction(id: string): Promise<UserActionResult> {
  await requireAdmin();
  try {
    const password = await resetPassword(z.string().min(1).parse(id));
    revalidatePath("/admin/users");
    return { ok: true, password };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

const updateSchema = z.object({ id: z.string().min(1), role: role.optional(), active: z.boolean().optional() });

export async function updateUserAction(input: z.input<typeof updateSchema>): Promise<UserActionResult> {
  const { user } = await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "נתונים לא תקינים" };
  const { id, ...patch } = parsed.data;
  if (id === user.id && (patch.active === false || patch.role === "editor")) {
    return { ok: false, error: "אי אפשר להשבית או להוריד הרשאה לעצמך" };
  }
  try {
    await updateUser(id, patch);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
