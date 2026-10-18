"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type MarketingEvent } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

/** סיווג קישור לפי היעד שלו — כך כל קישור טלפון/וואטסאפ באתר נמדד בלי לגעת ברכיב. */
function classify(href: string): MarketingEvent | null {
  if (href.startsWith("tel:")) return "click_to_call";
  if (href.startsWith("mailto:")) return "click_email";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//.test(href)) return "click_whatsapp";
  if (/^https?:\/\/(waze\.com|maps\.google\.|www\.google\.[^/]+\/maps)/.test(href)) return "click_directions";
  return null;
}

/** איפה בעמוד נלחץ הקישור — `data-track-location` מפורש, אחרת האזור הסמנטי. */
function locationOf(el: Element) {
  const explicit = el.closest("[data-track-location]")?.getAttribute("data-track-location");
  if (explicit) return explicit;
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("nav")) return el.closest("nav")?.getAttribute("aria-label") ?? "nav";
  if (el.closest("[role=dialog]")) return "dialog";
  return "content";
}

/**
 * מאזין גלובלי: לוכד attribution בכניסה, שולח page view וירטואלי במעברי עמוד
 * (האתר הוא SPA — פיקסלים לא רואים ניווט פנימי בעצמם), ומודד קליקים על
 * טלפון/וואטסאפ/מייל/ניווט בכל האתר דרך delegation אחד.
 */
export function MarketingTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    // את הטעינה הראשונה סופרים התגים עצמם; כאן רק מעברים פנימיים.
    const prev = prevPath.current;
    prevPath.current = pathname;
    if (prev === null || prev === pathname) return;
    trackEvent("virtual_page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const name = classify(href);
      if (!name) return;
      trackEvent(name, {
        link_url: href,
        link_text: a.textContent?.trim().slice(0, 100) || undefined,
        link_location: locationOf(a),
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
