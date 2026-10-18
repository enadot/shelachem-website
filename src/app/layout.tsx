import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/config";

/**
 * ה-layout המשותף לאתר ולוח הבקרה — רק html/body ו-metadata בסיסי.
 * המעטפת של האתר (header/footer/תגי מדידה) ב-`(site)/layout.tsx`, ושל הלוח ב-`admin/layout.tsx`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description:
    "מימוש זכויות רפואיות מול ביטוח לאומי, מס הכנסה, קרנות פנסיה וחברות ביטוח — ליווי מקצועי מלא, שכר טרחה רק בהצלחה. בדיקת זכאות חינם.",
  // תמונת השיתוף מגיעה מ-opengraph-image.tsx (קבצים לפי עמוד) — לא מוגדרת כאן.
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.shortName,
    url: "/",
    title: site.name,
    description:
      "מגיע לכם לדעת מה מגיע לכם. בדיקת זכאות חינם — שכר טרחה רק בהצלחה.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1228a8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
