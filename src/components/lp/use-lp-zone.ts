"use client";

import { useEffect, useState } from "react";

/**
 * איפה הגולש נמצא ביחס לטפסים של עמוד הנחיתה:
 * - `hero` — טופס ה-hero עדיין על המסך (או מתחתיו, לפני שגללו אליו);
 * - `middle` — גללו מעבר לטופס ה-hero, ו-CTA הסופי עוד לא נכנס למסך;
 * - `final` — ה-CTA הסופי (עם הטופס) נכנס למסך, וכל מה שאחריו.
 * רכיבים צפים (סרגל ה-CTA במובייל, מתג התצוגה) מוצגים רק ב-`middle`, כדי שלא יכסו שדות טופס.
 */
export type LpZone = "hero" | "middle" | "final";

export function useLpZone(): LpZone {
  const [zone, setZone] = useState<LpZone>("hero");
  useEffect(() => {
    const hero = document.querySelector('[data-lp-section="hero-form"]');
    const final = document.querySelector('[data-lp-section="final"]');
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (final && final.getBoundingClientRect().top < vh) return setZone("final");
      if (hero && hero.getBoundingClientRect().bottom > 0) return setZone("hero");
      setZone("middle");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return zone;
}
