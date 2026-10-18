/**
 * הגדרות שיווק דיגיטלי — מזהי תגים, פיקסלים ואימותי בעלות.
 *
 * הערכים נשמרים ב-CMS (singleton `globals`) ונערכים בלוח הבקרה (`/admin/marketing`).
 * האתר קורא אותם בזמן ריצה — שמירה בלוח מופיעה באתר מיד, בלי משתני סביבה ובלי
 * פריסה מחדש. מזהה ריק = התג לא נטען בכלל. פירוט ב-`docs/marketing.md`.
 *
 * ⚠️ אותו פיקסל צריך להיטען ממקום אחד בלבד: או כאן (טעינה ישירה) או מתוך
 * GTM — אחרת כל אירוע ייספר פעמיים.
 */

export interface MarketingConfig {
  /** Google Tag Manager — הדרך המומלצת: כל שאר התגים מנוהלים מתוך הקונטיינר. */
  gtmId?: string;
  /** GA4 בטעינה ישירה (gtag.js) — רק אם לא מנהלים את GA4 דרך GTM. */
  ga4Id?: string;
  /** Google Ads (AW-XXXXXXX) בטעינה ישירה, ותווית ההמרה של "ליד". */
  googleAdsId?: string;
  googleAdsLeadLabel?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  linkedinPartnerId?: string;
  linkedinLeadConversionId?: string;
  clarityId?: string;
  /**
   * `true` → Consent Mode במצב "denied" עד שהגולש מאשר בבאנר העוגיות, ופיקסלים
   * של צד שלישי (Meta/TikTok/LinkedIn/Clarity) נטענים רק אחרי אישור.
   */
  consentRequired: boolean;
  /** Enhanced Conversions / Advanced Matching: טלפון ומייל מגובבים באירוע הליד. */
  enhancedConversions: boolean;
  /** תגי אימות בעלות (Search Console / Bing / Meta Business). */
  verification: { google?: string; bing?: string; facebook?: string };
}

/** שדה ב-globals ↔ מפתח בקונפיגורציה. משמש גם את לוח הבקרה. */
export const MARKETING_ID_FIELDS = {
  gtm_id: "gtmId",
  ga4_id: "ga4Id",
  google_ads_id: "googleAdsId",
  google_ads_lead_label: "googleAdsLeadLabel",
  meta_pixel_id: "metaPixelId",
  tiktok_pixel_id: "tiktokPixelId",
  linkedin_partner_id: "linkedinPartnerId",
  linkedin_lead_conversion_id: "linkedinLeadConversionId",
  clarity_id: "clarityId",
} as const;

/** מזהה ריק/רווחים → undefined, ומזהה עם תווים חשודים נדחה (הוא נכתב לתוך סקריפט). */
export const cleanId = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s && /^[\w-]+$/.test(s) ? s : undefined;
};

/** תוכן תג אימות — נכתב ל-attribute, אז רק תווים בטוחים. */
const cleanToken = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s && /^[\w.+=/-]+$/.test(s) ? s : undefined;
};

/** בוליאני מה-CMS: Directus על SQLite מחזיר 1/0 ולא true/false. */
export const asBool = (v: unknown) => v === true || v === 1 || v === "1" || v === "true";

export const EMPTY_MARKETING: MarketingConfig = {
  consentRequired: false,
  enhancedConversions: false,
  verification: {},
};

/** שורת globals גולמית מה-CMS → קונפיגורציה נקייה. */
export function buildMarketingConfig(g: Record<string, unknown> | null | undefined): MarketingConfig {
  if (!g) return EMPTY_MARKETING;
  const ids = Object.fromEntries(
    Object.entries(MARKETING_ID_FIELDS).map(([field, key]) => [key, cleanId(g[field])]),
  );
  return {
    ...ids,
    consentRequired: asBool(g.consent_required),
    enhancedConversions: asBool(g.enhanced_conversions),
    verification: {
      google: cleanToken(g.google_site_verification),
      bing: cleanToken(g.bing_site_verification),
      facebook: cleanToken(g.facebook_domain_verification),
    },
  };
}

/** גוגל בטעינה ישירה — ה-ID שטוען את gtag.js (GA4 קודם, אחרת Ads). */
export const directGoogleTagId = (m: MarketingConfig) => m.ga4Id ?? m.googleAdsId;

/** מפתח ה-localStorage של בחירת העוגיות — משותף לסקריפט ה-inline ולבאנר. */
export const CONSENT_STORAGE_KEY = "shelachem-consent";

const q = (v: string) => JSON.stringify(v);

/**
 * סקריפט ה-inline שרץ לפני כל תג: מאתחל את dataLayer ו-gtag, וקובע את מצב
 * ה-Consent Mode ההתחלתי לפי בחירה שמורה (או לפי ברירת המחדל של האתר).
 * חייב לרוץ לפני GTM — לכן הוא inline ב-layout ולא next/script.
 */
export function consentInitScript(m: MarketingConfig) {
  const fallback = m.consentRequired ? "denied" : "granted";
  return (
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;" +
    `var c=null;try{c=localStorage.getItem(${q(CONSENT_STORAGE_KEY)})}catch(e){}` +
    `var g=c==='granted'||c==='denied'?c:${q(fallback)};` +
    "gtag('consent','default',{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g," +
    "functionality_storage:'granted',security_storage:'granted',wait_for_update:500});" +
    "if(g==='denied'){gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true)}"
  );
}
