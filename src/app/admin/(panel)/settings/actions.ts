"use server";

import { requireSession } from "@/lib/admin/session";
import { errorMessage, saveGlobals } from "@/lib/admin/globals";
import { SETTINGS_FIELDS } from "@/lib/admin/collections";
import { serializeEntity, validate, type Values } from "@/lib/admin/fields";
import type { SaveResult } from "@/components/admin/entity-form";

export async function saveSettingsAction(values: Values): Promise<SaveResult> {
  const { user } = await requireSession();
  const errors = validate(SETTINGS_FIELDS, values);
  if (Object.keys(errors).length) return { ok: false, errors, error: "יש שדות לתקן" };
  try {
    await saveGlobals(serializeEntity(SETTINGS_FIELDS, values), user.email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

