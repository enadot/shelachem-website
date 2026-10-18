import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { SiteChrome } from "@/components/layout/site-chrome";

/**
 * רשת ביטחון לתוכן מה-CMS: גם אם ה-Flow של הרענון לא מוגדר/נכשל,
 * העמודים מתרעננים לכל היותר אחרי שעה. שמירה בלוח הבקרה ו-webhook של Directus
 * מרעננים מיידית.
 */
export const revalidate = 3600;

/** תגי אימות בעלות — מוגדרים בלוח הבקרה (`/admin/marketing`). */
export async function generateMetadata(): Promise<Metadata> {
  const { verification } = (await getSiteSettings()).marketing;
  return {
    verification: {
      google: verification.google,
      other: {
        ...(verification.bing ? { "msvalidate.01": verification.bing } : {}),
        ...(verification.facebook ? { "facebook-domain-verification": verification.facebook } : {}),
      },
    },
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
