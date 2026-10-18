"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY } from "@/lib/marketing";
import { useMarketing } from "@/components/settings-provider";

/**
 * בחירת העוגיות של הגולש. `null` = עוד לא בחר (הבאנר מוצג אם נדרשת הסכמה).
 * הערך ההתחלתי נקבע כבר בסקריפט ה-inline שב-layout (Consent Mode default),
 * כאן רק קוראים אותו, מעדכנים ומודיעים לרכיבים שמאזינים.
 */
export type ConsentChoice = "granted" | "denied" | null;

const CHANGE_EVENT = "shelachem:consent";
/** פתיחה מחדש של הבאנר (קישור "הגדרות עוגיות" בפוטר). */
export const OPEN_CONSENT_EVENT = "shelachem:open-consent";

function read(): ConsentChoice {
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useConsent(): ConsentChoice {
  return useSyncExternalStore(subscribe, read, () => null);
}

/** האם מותר לטעון תגי שיווק של צד שלישי עכשיו. */
export function useMarketingAllowed() {
  const consent = useConsent();
  const { consentRequired } = useMarketing();
  return consentRequired ? consent === "granted" : consent !== "denied";
}

export function setConsent(choice: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // מצב פרטי/חסום — הבחירה תחול רק על הדף הנוכחי.
  }
  const v = choice;
  window.gtag?.("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
  window.dataLayer?.push({ event: "consent_update", consent_state: v });
  if (choice === "denied") {
    window.fbq?.("consent", "revoke");
    window.ttq?.revokeConsent?.();
  } else {
    window.fbq?.("consent", "grant");
    window.ttq?.grantConsent?.();
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
