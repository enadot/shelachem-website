/** Central site configuration — single source of truth for contact details. */
export const site = {
  name: "שלכם — מימוש זכויות רפואיות",
  shortName: "שלכם",
  legalName: "שלכם — מימוש זכויות רפואיות בע״מ",
  domain: "https://www.shelachem.net",
  /** Official site-wide phone (per client decision). */
  phone: "076-8017778",
  phoneHref: "tel:076-8017778",
  whatsappHref: "https://wa.me/972768017778",
  email: "info@shelachem.net",
  foundedYear: 2013,
  /**
   * `priceRange` ב-schema — מודל שכר הטרחה בלשון האתר עצמו.
   * (Google מצפה למחרוזת קצרה; זהו הניסוח שמופיע בכל עמודי האתר.)
   */
  feeModel: "שכר טרחה רק בהצלחה",
  /** מספרים שהאתר מצהיר עליהם — מקור אחד לכל הופעה שלהם. */
  stats: {
    years: "13",
    clients: "10,059",
  },
  // TODO: להחליף בכתובות הפרופילים האמיתיים — עד אז קישורי שורש מסוננים מה-JSON-LD.
  socials: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    tiktok: "https://www.tiktok.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

/**
 * שעות פעילות לסניפים (`openingHoursSpecification` ב-schema).
 *
 * מכוון ל-`null`: אין לנו את השעות האמיתיות, ופרסום שעות שגויות ב-schema גרוע
 * מהיעדרן — גוגל מציג אותן בתוצאות החיפוש ומנועי AI מצטטים אותן.
 * TODO(לקוח): להחליף למשל ב-
 * `[{ days: ["Sunday","Monday","Tuesday","Wednesday","Thursday"], opens: "09:00", closes: "17:00" }]`
 * וה-JSON-LD ייכלל אוטומטית.
 */
export const openingHours: {
  days: string[];
  opens: string;
  closes: string;
}[] | null = null;

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

/**
 * קואורדינטות לכל סניף (`geo` ב-schema). ריק בכוונה — קואורדינטות משוערות שולחות
 * מנועי חיפוש ומשתמשים לכתובת הלא נכונה.
 * TODO(לקוח): למלא מהפין המדויק ב-Google Business Profile, למשל
 * `{ jerusalem: { lat: 31.7889, lng: 35.2050 } }` — וה-JSON-LD ייכלל אוטומטית.
 */
export const branchGeo: Record<string, { lat: number; lng: number }> = {};
