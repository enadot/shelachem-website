import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site, branches } from "@/lib/config";
import { ContactModalProvider } from "@/components/layout/contact-modal-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { LeadModalProvider } from "@/components/shared/lead-modal";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description:
    "מימוש זכויות רפואיות מול ביטוח לאומי, מס הכנסה, קרנות פנסיה וחברות ביטוח — ליווי מקצועי מלא, שכר טרחה רק בהצלחה. בדיקת זכאות חינם.",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.shortName,
    title: site.name,
    description:
      "מגיע לכם לדעת מה מגיע לכם. בדיקת זכאות חינם — שכר טרחה רק בהצלחה.",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0000ff",
  width: "device-width",
  initialScale: 1,
};

// רק פרופילים אמיתיים — קישור לדף הבית של הרשת (placeholder) מזיק ל-schema.
const realSocials = Object.values(site.socials).filter((u) => new URL(u).pathname !== "/");

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  url: site.domain,
  telephone: site.phone,
  email: site.email,
  foundingDate: String(site.foundedYear),
  address: branches.map((b) => ({
    "@type": "PostalAddress",
    addressLocality: b.city,
    streetAddress: b.address,
    addressCountry: "IL",
  })),
  ...(realSocials.length ? { sameAs: realSocials } : {}),
};

/**
 * רשת ביטחון לתוכן מה-CMS: גם אם ה-Flow של הרענון לא מוגדר/נכשל,
 * העמודים מתרעננים לכל היותר אחרי שעה. ה-webhook עושה את זה מיידי.
 */
export const revalidate = 3600;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:font-bold focus:text-white"
        >
          דילוג לתוכן הראשי
        </a>
        <LeadModalProvider>
          <ContactModalProvider>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileCtaBar />
          </ContactModalProvider>
        </LeadModalProvider>
      </body>
    </html>
  );
}
