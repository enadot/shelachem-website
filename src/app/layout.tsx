import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site, branches } from "@/lib/config";
import { ContactModalProvider } from "@/components/layout/contact-modal-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
  },
};

export const viewport: Viewport = {
  themeColor: "#0000ff",
  width: "device-width",
  initialScale: 1,
};

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
  sameAs: Object.values(site.socials),
};

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
        <ContactModalProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ContactModalProvider>
      </body>
    </html>
  );
}
