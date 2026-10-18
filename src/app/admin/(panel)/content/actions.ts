"use server";

import { randomUUID } from "node:crypto";
import { requireSession } from "@/lib/admin/session";
import { errorMessage, revalidateSite } from "@/lib/admin/globals";
import { createItem, deleteItem, restoreRevision, updateItem } from "@/lib/admin/content";
import { COLLECTIONS, isCollection } from "@/lib/admin/collections";
import { serializeEntity, validate, type Values } from "@/lib/admin/fields";
import type { SaveResult } from "@/components/admin/entity-form";

/** שמירת פריט תוכן — יצירה (id = null) או עדכון. ההגדרה והבדיקה מ-collections.ts. */
export async function saveItemAction(collection: string, id: string | null, values: Values): Promise<SaveResult> {
  const { user } = await requireSession();
  if (!isCollection(collection)) return { ok: false, error: "סוג תוכן לא מוכר" };
  const { fields } = COLLECTIONS[collection];
  const errors = validate(fields, values);
  if (Object.keys(errors).length) return { ok: false, errors, error: "יש שדות לתקן" };

  const data: Values = serializeEntity(fields, values);
  if (collection === "articles") data.updatedAt = new Date().toISOString();
  try {
    if (id) {
      await updateItem(collection, id, data, user.email);
      revalidateSite();
      return { ok: true };
    }
    const newId = randomUUID();
    await createItem(collection, newId, data, user.email);
    revalidateSite();
    return { ok: true, redirectTo: `/admin/content/${collection}/${newId}` };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function deleteItemAction(collection: string, id: string) {
  const { user } = await requireSession();
  if (!isCollection(collection)) return { ok: false, error: "סוג תוכן לא מוכר" };
  try {
    await deleteItem(collection, id, user.email);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function restoreRevisionAction(collection: string, id: string, revisionId: number) {
  const { user } = await requireSession();
  if (!isCollection(collection)) return { ok: false, error: "סוג תוכן לא מוכר" };
  try {
    await restoreRevision(collection, id, revisionId, user.email);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
