"use server";

import { createItem, deleteItem, updateItem } from "@directus/sdk";
import { requireSession } from "@/lib/admin/session";
import { errorMessage, revalidateSite } from "@/lib/admin/globals";
import { COLLECTIONS, isCollection } from "@/lib/admin/collections";
import { serializeEntity, validate, type Values } from "@/lib/admin/fields";
import type { SaveResult } from "@/components/admin/entity-form";

/** שמירת פריט תוכן — יצירה (id = null) או עדכון. ההגדרה והבדיקה מ-collections.ts. */
export async function saveItemAction(collection: string, id: string | null, values: Values): Promise<SaveResult> {
  const { client } = await requireSession();
  if (!isCollection(collection)) return { ok: false, error: "סוג תוכן לא מוכר" };
  const { fields } = COLLECTIONS[collection];
  const errors = validate(fields, values);
  if (Object.keys(errors).length) return { ok: false, errors, error: "יש שדות לתקן" };

  const data: Values = serializeEntity(fields, values);
  if (collection === "articles") data.updatedAt = new Date().toISOString();
  try {
    if (id) {
      await client.request(updateItem(collection as never, id, data as never));
      revalidateSite();
      return { ok: true };
    }
    // מפתח ה-collections האלה הוא מחרוזת שלא נוצרת אוטומטית ב-CMS.
    const newId = crypto.randomUUID();
    await client.request(createItem(collection as never, { id: newId, ...data } as never));
    revalidateSite();
    return { ok: true, redirectTo: `/admin/content/${collection}/${newId}` };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function deleteItemAction(collection: string, id: string) {
  const { client } = await requireSession();
  if (!isCollection(collection)) return { ok: false, error: "סוג תוכן לא מוכר" };
  try {
    await client.request(deleteItem(collection as never, id));
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
