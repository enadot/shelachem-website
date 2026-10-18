/**
 * שדות מסך השיווק: תווית, הסבר איפה מוצאים את הערך, ופורמט לבדיקה.
 * משותף לטופס (בדיקה מיידית) ול-Server Action (בדיקה מחייבת).
 */
export interface IdField {
  field: string;
  label: string;
  hint: string;
  placeholder: string;
  pattern: RegExp;
  example: string;
  group: "google" | "social" | "other";
}

export const ID_FIELDS: IdField[] = [
  {
    field: "gtm_id",
    label: "Google Tag Manager",
    hint: "tagmanager.google.com ▸ מזהה הקונטיינר בפינה העליונה. מומלץ לנהל דרכו את כל שאר התגים.",
    placeholder: "GTM-XXXXXXX",
    pattern: /^GTM-[A-Z0-9]{4,12}$/,
    example: "GTM-ABC1234",
    group: "google",
  },
  {
    field: "ga4_id",
    label: "Google Analytics 4 (טעינה ישירה)",
    hint: "Admin ▸ Data streams ▸ Measurement ID. למלא רק אם GA4 לא מוגדר בתוך GTM.",
    placeholder: "G-XXXXXXXXXX",
    pattern: /^G-[A-Z0-9]{4,14}$/,
    example: "G-AB12CD34EF",
    group: "google",
  },
  {
    field: "google_ads_id",
    label: "Google Ads (טעינה ישירה)",
    hint: "Tools ▸ Conversions ▸ Tag setup. למלא רק אם Ads לא מוגדר בתוך GTM.",
    placeholder: "AW-XXXXXXXXX",
    pattern: /^AW-\d{6,12}$/,
    example: "AW-123456789",
    group: "google",
  },
  {
    field: "google_ads_lead_label",
    label: "תווית המרת ליד ב-Google Ads",
    hint: "החלק שאחרי הלוכסן ב-send_to של המרת הליד (AW-…/התווית).",
    placeholder: "AbCdEfGhIjk",
    pattern: /^[\w-]{4,40}$/,
    example: "AbC1dEfGh2",
    group: "google",
  },
  {
    field: "meta_pixel_id",
    label: "Meta Pixel (פייסבוק / אינסטגרם)",
    hint: "Events Manager ▸ Data sources ▸ Pixel ID (מספר).",
    placeholder: "123456789012345",
    pattern: /^\d{8,20}$/,
    example: "123456789012345",
    group: "social",
  },
  {
    field: "tiktok_pixel_id",
    label: "TikTok Pixel",
    hint: "TikTok Ads Manager ▸ Assets ▸ Events ▸ Pixel ID.",
    placeholder: "CXXXXXXXXXXXXXXXXXXX",
    pattern: /^[A-Z0-9]{10,30}$/,
    example: "C4ABCDEFGHIJKLMNO123",
    group: "social",
  },
  {
    field: "linkedin_partner_id",
    label: "LinkedIn Insight Tag",
    hint: "Campaign Manager ▸ Analyze ▸ Insight Tag ▸ Partner ID (מספר).",
    placeholder: "1234567",
    pattern: /^\d{4,12}$/,
    example: "1234567",
    group: "social",
  },
  {
    field: "linkedin_lead_conversion_id",
    label: "LinkedIn — מזהה המרת ליד",
    hint: "Campaign Manager ▸ Conversions ▸ המרה מסוג ליד ▸ ID.",
    placeholder: "12345678",
    pattern: /^\d{4,14}$/,
    example: "12345678",
    group: "social",
  },
  {
    field: "clarity_id",
    label: "Microsoft Clarity",
    hint: "clarity.microsoft.com ▸ Settings ▸ Project ID. מפות חום והקלטות גלישה.",
    placeholder: "abcd1234ef",
    pattern: /^[a-z0-9]{6,20}$/,
    example: "abcd1234ef",
    group: "other",
  },
];

export const VERIFICATION_FIELDS = [
  {
    field: "google_site_verification",
    label: "Google Search Console",
    hint: "Settings ▸ Ownership verification ▸ HTML tag. אפשר להדביק את כל התג — נחלץ את הערך.",
  },
  {
    field: "bing_site_verification",
    label: "Bing Webmaster Tools",
    hint: "Settings ▸ Verify ownership ▸ Meta tag (msvalidate.01). מזין גם את Copilot.",
  },
  {
    field: "facebook_domain_verification",
    label: "אימות דומיין ב-Meta",
    hint: "Business settings ▸ Brand safety ▸ Domains ▸ Meta-tag.",
  },
] as const;

/** תג meta מלא שהודבק → רק ערך ה-content. */
export const extractToken = (v: string) => {
  const m = v.match(/content=["']([^"']+)["']/i);
  return (m ? m[1] : v).trim();
};

export const TOKEN_PATTERN = /^[\w.+=/-]{4,200}$/;

/** נרמול לפני בדיקה: רווחים, ואותיות גדולות במזהים שגוגל/טיקטוק כותבים כך. */
export function normalizeId(field: string, v: string) {
  const s = v.trim();
  if (["gtm_id", "ga4_id", "google_ads_id", "tiktok_pixel_id"].includes(field)) return s.toUpperCase();
  if (field === "clarity_id") return s.toLowerCase();
  return s;
}
