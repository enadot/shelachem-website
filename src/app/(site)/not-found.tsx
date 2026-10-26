import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/not-found-content";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false },
};

/**
 * 404 בתוך עמודי האתר (`notFound()`, למשל `/lp/<slug>` שלא קיים או עמוד C14 בפרודקשן).
 * `(site)/layout.tsx` כבר עוטף ב-`SiteChrome`, ולכן כאן בלי מעטפת — אחרת header ו-footer
 * כפולים (QA N7).
 */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
