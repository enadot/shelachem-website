import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentUser } from "@/lib/admin/session";

/** סוגי התמונות שמותר להעלות מהלוח, ועד איזה גודל. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * העלאת תמונות מהלוח ל-Vercel Blob. הדפדפן מעלה ישירות ל-Blob (בלי מגבלת 4.5MB
 * של גוף בקשה לפונקציה); כאן רק מנפיקים לו טוקן קצר-מועד — למשתמש מחובר בלבד.
 * הנתיב תחת /admin כדי שעוגיית ה-session תישלח.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await currentUser();
        if (!user || user.mustChangePassword) throw new Error("נדרשת התחברות");
        if (!pathname.startsWith("uploads/")) throw new Error("נתיב לא חוקי");
        return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ההעלאה נכשלה";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
