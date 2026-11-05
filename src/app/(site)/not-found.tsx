import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/not-found-content";
import { site } from "@/lib/config";

/** נוסח מאושר (QA N11): "ללא עלות" ולא "בדיקת זכאות חינם" שעובר בירושה מה-layout. */
const description =
  "העמוד שחיפשתם לא נמצא. שלכם – מימוש זכויות רפואיות: בדיקה ללא עלות. תשלום רק על בסיס הצלחה.";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  description,
  robots: { index: false },
  // openGraph/twitter מחליפים את של ה-layout (לא מתמזגים), ולכן השדות הבסיסיים חוזרים כאן.
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.shortName,
    title: "העמוד לא נמצא",
    description,
  },
  twitter: { card: "summary_large_image", title: "העמוד לא נמצא", description },
};

/**
 * 404 בתוך עמודי האתר (`notFound()`, למשל `/lp/<slug>` שלא קיים או עמוד C14 בפרודקשן).
 * `(site)/layout.tsx` כבר עוטף ב-`SiteChrome`, ולכן כאן בלי מעטפת — אחרת header ו-footer
 * כפולים (QA N7).
 */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
