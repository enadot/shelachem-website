"use client";

import { createContext, useContext, useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import { setAnalyticsConfig } from "@/lib/analytics";

/**
 * הגדרות האתר מה-CMS (פרטי קשר, סניפים, תגי שיווק) לרכיבי הלקוח.
 * ה-layout קורא אותן בשרת (`getSiteSettings`) ומעביר לכאן — כך שינוי בלוח הבקרה
 * מגיע גם לרכיבים האינטראקטיביים בלי build.
 */
const Ctx = createContext<SiteSettings | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  // analytics.ts נקרא מתוך event handlers, לא מרכיבים — מקבל את ההגדרות פעם אחת כאן.
  useState(() => {
    if (typeof window !== "undefined") setAnalyticsConfig(settings.marketing);
  });
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

function useSettings() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSite/useMarketing must be used inside <SettingsProvider>");
  return s;
}

/** פרטי קשר, סניפים ורשתות. */
export const useSite = () => useSettings();
/** קונפיגורציית התגים והפיקסלים. */
export const useMarketing = () => useSettings().marketing;
