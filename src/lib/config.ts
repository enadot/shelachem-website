/** Central site configuration — single source of truth for contact details. */
export const site = {
  name: "שלכם — מימוש זכויות רפואיות",
  shortName: "שלכם",
  domain: "https://www.shelachem.net",
  /** Official site-wide phone (per client decision). */
  phone: "076-8017778",
  phoneHref: "tel:076-8017778",
  whatsappHref: "https://wa.me/972768017778",
  email: "info@shelachem.net",
  foundedYear: 2013,
  // TODO: להחליף בכתובות הפרופילים האמיתיים — עד אז קישורי שורש מסוננים מה-JSON-LD.
  socials: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    tiktok: "https://www.tiktok.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export const branches = [
  {
    id: "jerusalem",
    city: "ירושלים",
    address: "בניין שערי העיר, רח׳ יפו פינת שרי ישראל, קומה 9",
    phone: "03-5430302",
    phoneHref: "tel:03-5430302",
    googleMapsUrl: "https://maps.google.com/?q=שערי+העיר+יפו+216+ירושלים",
    wazeUrl: "https://waze.com/ul?q=שערי+העיר+ירושלים&navigate=yes",
    arrival: [
      "תחנת הרכבת הקלה ״שרי ישראל״ צמודה לבניין",
      "קווי אוטובוס רבים לאורך רחוב יפו",
      "חניון בתשלום בבניין",
    ],
    accessibility: [
      "כניסה נגישה ללא מדרגות",
      "מעליות עד קומה 9",
      "שירותים נגישים וחניית נכים",
    ],
    /** Marker position on the Israel map illustration (percentages). */
    marker: { top: "54%", right: "38%" },
  },
  {
    id: "bnei-brak",
    city: "בני ברק",
    address: "רח׳ ז׳בוטינסקי 168, בני ברק",
    phone: "03-5430302",
    phoneHref: "tel:03-5430302",
    googleMapsUrl: "https://maps.google.com/?q=ז׳בוטינסקי+168+בני+ברק",
    wazeUrl: "https://waze.com/ul?q=ז׳בוטינסקי+168+בני+ברק&navigate=yes",
    arrival: [
      "קווי אוטובוס רבים לאורך ז׳בוטינסקי",
      "תחנת רכבת בני ברק במרחק 10 דקות הליכה",
      "חניון בתשלום בבניין",
    ],
    accessibility: ["כניסה נגישה ללא מדרגות", "מעלית", "שירותים נגישים וחניית נכים"],
    marker: { top: "44%", right: "44%" },
  },
] as const;

export type Branch = (typeof branches)[number];
