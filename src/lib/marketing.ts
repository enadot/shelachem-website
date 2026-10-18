/**
 * הגדרות שיווק דיגיטלי — מזהי תגים, פיקסלים ואימותי בעלות.
 *
 * הכול נקרא ממשתני סביבה `NEXT_PUBLIC_*` (נצרבים בזמן ה-build), כך שמחברים
 * מערכת חדשה בפאנל הפריסה — בלי שינוי קוד. משתנה ריק = התג לא נטען בכלל.
 * פירוט מלא, כולל הגדרת GTM, ב-`docs/marketing.md`.
 *
 * ⚠️ אותו פיקסל צריך להיטען ממקום אחד בלבד: או כאן (טעינה ישירה) או מתוך
 * GTM — אחרת כל אירוע ייספר פעמיים.
 */

/** מזהה ריק/רווחים → undefined, ומזהה עם תווים חשודים נדחה (הוא נכתב לתוך סקריפט). */
const id = (v: string | undefined) => {
  const s = v?.trim();
  return s && /^[\w-]+$/.test(s) ? s : undefined;
};

export const marketing = {
  /** Google Tag Manager — הדרך המומלצת: כל שאר התגים מנוהלים מתוך הקונטיינר. */
  gtmId: id(process.env.NEXT_PUBLIC_GTM_ID),

  /** GA4 בטעינה ישירה (gtag.js) — רק אם לא מנהלים את GA4 דרך GTM. */
  ga4Id: id(process.env.NEXT_PUBLIC_GA4_ID),
  /** Google Ads (AW-XXXXXXX) בטעינה ישירה, ותווית ההמרה של "ליד". */
  googleAdsId: id(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
  googleAdsLeadLabel: id(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL),

  metaPixelId: id(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  tiktokPixelId: id(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
  linkedinPartnerId: id(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID),
  linkedinLeadConversionId: id(process.env.NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID),
  clarityId: id(process.env.NEXT_PUBLIC_CLARITY_ID),

  /**
   * `true` → Consent Mode במצב "denied" עד שהגולש מאשר בבאנר העוגיות, ופיקסלים
   * של צד שלישי (Meta/TikTok/LinkedIn/Clarity) נטענים רק אחרי אישור.
   * `false` (ברירת מחדל) → אין באנר והמדידה פועלת מיד.
   */
  consentRequired: process.env.NEXT_PUBLIC_CONSENT_REQUIRED === "true",

  /**
   * Enhanced Conversions / Advanced Matching: מצרף ל-dataLayer באירוע הליד
   * טלפון ומייל מגובבים (SHA-256) תחת `user_data`. כבוי כברירת מחדל.
   */
  enhancedConversions: process.env.NEXT_PUBLIC_ENHANCED_CONVERSIONS === "true",

  /** תגי אימות בעלות (Search Console / Bing / Meta Business). */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION?.trim() || undefined,
  },
} as const;

/** גוגל בטעינה ישירה — ה-ID שטוען את gtag.js (GA4 קודם, אחרת Ads). */
export const directGoogleTagId = marketing.ga4Id ?? marketing.googleAdsId;

/** מפתח ה-localStorage של בחירת העוגיות — משותף לסקריפט ה-inline ולבאנר. */
export const CONSENT_STORAGE_KEY = "shelachem-consent";

const q = (v: string) => JSON.stringify(v);

/**
 * סקריפט ה-inline שרץ לפני כל תג: מאתחל את dataLayer ו-gtag, וקובע את מצב
 * ה-Consent Mode ההתחלתי לפי בחירה שמורה (או לפי ברירת המחדל של האתר).
 * חייב לרוץ לפני GTM — לכן הוא inline ב-layout ולא next/script.
 */
export function consentInitScript() {
  const fallback = marketing.consentRequired ? "denied" : "granted";
  return (
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;" +
    `var c=null;try{c=localStorage.getItem(${q(CONSENT_STORAGE_KEY)})}catch(e){}` +
    `var g=c==='granted'||c==='denied'?c:${q(fallback)};` +
    "gtag('consent','default',{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g," +
    "functionality_storage:'granted',security_storage:'granted',wait_for_update:500});" +
    "if(g==='denied'){gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true)}"
  );
}
