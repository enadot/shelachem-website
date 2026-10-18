"use server";

import { uploadFiles } from "@directus/sdk";
import { requireSession } from "@/lib/admin/session";
import { errorMessage } from "@/lib/admin/globals";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX = 10 * 1024 * 1024;

/** העלאת תמונה ל-Directus בהרשאות המשתמש המחובר. מחזיר את מזהה הקובץ. */
export async function uploadImageAction(formData: FormData) {
  const { client } = await requireSession();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "לא נבחר קובץ" };
  if (!TYPES.includes(file.type)) return { ok: false as const, error: "רק JPG, PNG, WebP או AVIF" };
  if (file.size > MAX) return { ok: false as const, error: "הקובץ גדול מ-10MB" };
  try {
    const body = new FormData();
    body.append("title", file.name.replace(/\.[^.]+$/, ""));
    body.append("file", file, file.name);
    const res = (await client.request(uploadFiles(body))) as { id: string };
    return { ok: true as const, id: res.id };
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) };
  }
}
