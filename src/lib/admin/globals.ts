import "server-only";
import { readSingleton, updateSingleton } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import type { AdminClient } from "@/lib/admin/session";

/** שורת globals עדכנית (ישר מה-CMS, בלי המטמון של האתר). */
export async function readGlobals(client: AdminClient) {
  try {
    return (await client.request(readSingleton("globals" as never))) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** שמירה + רענון האתר כולו — השינוי מופיע מיד, בלי build. */
export async function saveGlobals(client: AdminClient, patch: Record<string, unknown>) {
  await client.request(updateSingleton("globals" as never, patch as never));
  revalidateSite();
}

export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** הודעת שגיאה קריאה משגיאת Directus SDK. */
export function errorMessage(err: unknown) {
  const e = err as { errors?: { message?: string; extensions?: { code?: string } }[]; message?: string };
  const first = e?.errors?.[0];
  if (first?.extensions?.code === "FORBIDDEN") return "אין לך הרשאה לפעולה הזו.";
  return first?.message ?? e?.message ?? "הפעולה נכשלה";
}
