"use server";

import { requireSession } from "@/lib/admin/session";
import { errorMessage, saveGlobals } from "@/lib/admin/globals";
import { SETTINGS_FIELDS } from "@/lib/admin/collections";
import { serializeEntity, validate, type Values } from "@/lib/admin/fields";
import { createEditorUser } from "@/lib/admin/migrate";
import type { SaveResult } from "@/components/admin/entity-form";

export async function saveSettingsAction(values: Values): Promise<SaveResult> {
  const { client } = await requireSession();
  const errors = validate(SETTINGS_FIELDS, values);
  if (Object.keys(errors).length) return { ok: false, errors, error: "יש שדות לתקן" };
  try {
    await saveGlobals(client, serializeEntity(SETTINGS_FIELDS, values));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function createUserAction(input: { name: string; email: string; password: string }) {
  const { token } = await requireSession();
  const email = input.email?.trim() ?? "";
  if (!input.name?.trim()) return { ok: false, error: "נא להזין שם" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "דוא״ל לא תקין" };
  if ((input.password ?? "").length < 10) return { ok: false, error: "סיסמה של 10 תווים לפחות" };
  try {
    await createEditorUser(token, { email, password: input.password, first_name: input.name.trim() });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
