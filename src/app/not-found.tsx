import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { NotFoundContent } from "@/components/shared/not-found-content";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false },
};

/**
 * 404 ממותג — מפנה חזרה למסלולים המרכזיים במקום עמוד שגיאה חשוף.
 * יושב בשורש (לכתובות שלא קיימות בכלל), ולכן עוטף את עצמו במעטפת האתר.
 * `notFound()` מתוך עמודי `(site)` מגיע ל-`(site)/not-found.tsx`, שכבר בתוך המעטפת.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
