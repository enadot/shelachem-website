import { revalidatePath } from "next/cache";

/**
 * Directus webhook target: POST /api/revalidate?secret=...
 * Revalidates the whole site — content volume is small enough that
 * per-collection granularity isn't worth the coupling.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, revalidated: true });
}
