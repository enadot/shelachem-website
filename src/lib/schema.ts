/**
 * JSON-LD מרוכז לכל האתר.
 *
 * למה מודול אחד: עד כה כל עמוד בנה ישות `Organization` משלו, כך שגוגל ומנועי AI
 * ראו כמה ישויות נפרדות עם אותו שם במקום ישות אחת עם עמודים שמצביעים אליה.
 * כאן יש גרף אחד עם `@id` יציבים — וכל עמוד מצביע אליהם ב-reference בלבד.
 *
 * מבנה הגרף (מוזרק פעם אחת ב-layout):
 *   ProfessionalService `#organization` — הישות הראשית
 *   WebSite            `#website`      — האתר עצמו, `publisher` → הארגון
 *   LocalBusiness      `/branches#<id>` — ישות נפרדת לכל סניף, `parentOrganization` → הארגון
 */

import { branchGeo, branches, openingHours, site } from "./config";

export const ORG_ID = `${site.domain}/#organization`;
export const WEBSITE_ID = `${site.domain}/#website`;
export const branchId = (id: string) => `${site.domain}/branches#${id}`;

/** הפניה לישות קיימת בגרף — לא שכפול שלה. */
export const ref = (id: string) => ({ "@id": id });

/** רק פרופילים אמיתיים — קישור לדף הבית של רשת חברתית ב-`sameAs` מזיק. */
const realSocials = Object.values(site.socials).filter((u) => new URL(u).pathname !== "/");

const areaServed = { "@type": "Country", name: "IL" } as const;

function openingHoursSpecification() {
  if (!openingHours?.length) return {};
  return {
    openingHoursSpecification: openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

function branchNode(branch: (typeof branches)[number]) {
  const geo = branchGeo[branch.id];
  return {
    "@type": "LocalBusiness",
    "@id": branchId(branch.id),
    name: `${site.shortName} — סניף ${branch.city}`,
    parentOrganization: ref(ORG_ID),
    url: `${site.domain}/branches`,
    telephone: branch.phone,
    email: site.email,
    priceRange: site.feeModel,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.city,
      addressCountry: "IL",
    },
    hasMap: branch.googleMapsUrl,
    areaServed,
    ...(geo ? { geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng } } : {}),
    ...openingHoursSpecification(),
  };
}

/** הגרף הראשי — מוזרק פעם אחת ב-layout, ולא נשנה מעמוד לעמוד. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: site.name,
        legalName: site.legalName,
        alternateName: site.shortName,
        url: site.domain,
        description:
          "חברה למימוש זכויות רפואיות: ליווי מלא מול ביטוח לאומי, רשות המסים, קרנות פנסיה, " +
          "חברות ביטוח ומשרד הרישוי — כולל חוות דעת רפואיות והכנה לוועדות. שכר טרחה רק בהצלחה.",
        logo: {
          "@type": "ImageObject",
          url: `${site.domain}/images/logo.svg`,
        },
        image: `${site.domain}/images/og-default.png`,
        telephone: site.phone,
        email: site.email,
        foundingDate: String(site.foundedYear),
        priceRange: site.feeModel,
        knowsLanguage: ["he", "en"],
        areaServed,
        address: branches.map((b) => ({
          "@type": "PostalAddress",
          streetAddress: b.address,
          addressLocality: b.city,
          addressCountry: "IL",
        })),
        department: branches.map((b) => ref(branchId(b.id))),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: site.phone,
            email: site.email,
            availableLanguage: ["he"],
            areaServed: "IL",
          },
        ],
        ...(realSocials.length ? { sameAs: realSocials } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.domain,
        name: site.name,
        inLanguage: "he-IL",
        publisher: ref(ORG_ID),
      },
      ...branches.map(branchNode),
    ],
  };
}

/**
 * `Service` לעמוד שירות — היה חסר לגמרי (היה שם רק `FAQPage`).
 * `provider` מצביע לארגון בגרף במקום לשכפל אותו.
 */
export function serviceNode({
  name,
  description,
  slug,
  institutionName,
}: {
  name: string;
  description: string;
  slug: string;
  institutionName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.domain}/services/${slug}#service`,
    name,
    description,
    url: `${site.domain}/services/${slug}`,
    serviceType: name,
    provider: ref(ORG_ID),
    areaServed,
    availableLanguage: "he",
    audience: { "@type": "Audience", audienceType: "אנשים עם מצב רפואי ומשפחותיהם" },
    ...(institutionName ? { serviceOutput: `זכאות מול ${institutionName}` } : {}),
    offers: {
      "@type": "Offer",
      description: `בדיקת זכאות ראשונית ללא עלות · ${site.feeModel}`,
      priceCurrency: "ILS",
      availability: "https://schema.org/InStock",
      seller: ref(ORG_ID),
    },
  };
}

/** `FAQPage` — אותו בונה לדף הבית, לעמודי שירות ולעמוד ה-FAQ הייעודי. */
export function faqPageNode(
  items: { question: string; answer: string }[],
  { url, name }: { url?: string; name?: string } = {},
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq`, url } : {}),
    ...(name ? { name } : {}),
    inLanguage: "he-IL",
    isPartOf: ref(WEBSITE_ID),
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
