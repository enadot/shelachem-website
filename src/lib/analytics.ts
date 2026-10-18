/**
 * שכבת המדידה של האתר — נקודת כניסה אחת לכל אירוע שיווקי.
 *
 * כל אירוע נדחף ל-`dataLayer` (ש-GTM מאזין לו), ובנוסף — רק לפיקסלים שנטענים
 * ישירות מהאתר (ראו `src/lib/marketing.ts`) — מתורגם לאירוע הסטנדרטי של כל
 * פלטפורמה. פיקסל שמנוהל דרך GTM לא מקבל קריאה ישירה, כדי שלא ייספר פעמיים.
 *
 * מילון האירועים המלא ב-`docs/marketing.md`.
 */
import { marketing } from "@/lib/marketing";

export const LEAD_CONVERSION_EVENT = "generate_lead";

/** האירועים שהאתר שולח. שמות GA4 סטנדרטיים איפה שיש כאלה. */
export type MarketingEvent =
  | typeof LEAD_CONVERSION_EVENT
  | "form_start"
  | "click_to_call"
  | "click_whatsapp"
  | "click_email"
  | "click_directions"
  | "quiz_step"
  | "virtual_page_view";

type DataLayerEvent = Record<string, unknown> & { event: string };
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
      grantConsent?: () => void;
      revokeConsent?: () => void;
    };
    lintrk?: (...args: unknown[]) => void;
  }
}

/** דוחף אירוע ל-dataLayer. בטוח לקריאה גם כשאין שכבת תיוג מותקנת. */
export function pushDataLayer(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer ?? []).push(event);
}

/** מזהה ייחודי לאירוע — משמש ל-dedup בין הפיקסל בדפדפן ל-Conversions API בשרת. */
export function newEventId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** האירועים שנחשבים "יצירת קשר" בפלטפורמות הפרסום. */
const CONTACT_EVENTS = new Set<MarketingEvent>(["click_to_call", "click_whatsapp", "click_email"]);

/** שולח אירוע ל-dataLayer ולפיקסלים שנטענו ישירות. מחזיר את ה-event_id. */
export function trackEvent(
  name: MarketingEvent,
  params: Params = {},
  extra: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return undefined;
  const eventId = (extra.event_id as string | undefined) ?? newEventId();
  pushDataLayer({ event: name, ...params, ...extra, event_id: eventId });

  const w = window;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));

  // GA4 ישיר — כל האירועים חוץ מ-page view וירטואלי (GA4 סופר מעברי עמוד בעצמו).
  if (marketing.ga4Id && name !== "virtual_page_view") w.gtag?.("event", name, clean);

  if (name === "virtual_page_view") {
    if (marketing.metaPixelId) w.fbq?.("track", "PageView");
    if (marketing.tiktokPixelId) w.ttq?.page();
    return eventId;
  }

  if (name === LEAD_CONVERSION_EVENT) {
    if (marketing.googleAdsId && marketing.googleAdsLeadLabel) {
      w.gtag?.("event", "conversion", {
        send_to: `${marketing.googleAdsId}/${marketing.googleAdsLeadLabel}`,
        transaction_id: eventId,
      });
    }
    if (marketing.metaPixelId) {
      w.fbq?.("track", "Lead", { content_name: params.lead_topic }, { eventID: eventId });
    }
    if (marketing.tiktokPixelId) {
      w.ttq?.track("SubmitForm", { content_name: params.lead_topic }, { event_id: eventId });
    }
    if (marketing.linkedinPartnerId && marketing.linkedinLeadConversionId) {
      w.lintrk?.("track", { conversion_id: Number(marketing.linkedinLeadConversionId) });
    }
  } else if (CONTACT_EVENTS.has(name)) {
    if (marketing.metaPixelId) w.fbq?.("track", "Contact", {}, { eventID: eventId });
    if (marketing.tiktokPixelId) w.ttq?.track("Contact", {}, { event_id: eventId });
  }
  return eventId;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** 054-1234567 → ‎+972541234567 (הפורמט ש-Google/Meta מצפים לו לפני גיבוב). */
const toE164 = (phone: string) => `+972${phone.replace(/\D/g, "").replace(/^0/, "")}`;

/**
 * נקרא רק אחרי שהליד נשמר בהצלחה בשרת — אחרת נספור המרות שלא קרו.
 * `eventId` זהה לזה שנשמר על הליד, כדי שאפשר יהיה לשלוח את אותה המרה גם מהשרת.
 */
export async function trackLeadConversion({
  source,
  topic,
  eventId,
  phone,
  email,
}: {
  source?: string;
  topic?: string;
  eventId?: string;
  phone?: string;
  email?: string;
}) {
  let userData: Record<string, string> | undefined;
  if (marketing.enhancedConversions && phone && crypto?.subtle) {
    try {
      userData = { sha256_phone_number: await sha256(toE164(phone)) };
      if (email) userData.sha256_email_address = await sha256(email.trim().toLowerCase());
    } catch {
      userData = undefined;
    }
  }
  trackEvent(
    LEAD_CONVERSION_EVENT,
    { lead_source: source, lead_topic: topic },
    { event_id: eventId, ...(userData ? { user_data: userData } : {}) },
  );
}
