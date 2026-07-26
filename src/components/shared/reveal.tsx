"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Tag = "div" | "section" | "li";

/**
 * מסמן ש-React חי ומריץ אפקטים. הסקריפט האינליין ב-layout מסיר את `data-js`
 * אם הסימון הזה לא הגיע — כך שכשל הידרציה לא משאיר עמוד ריק.
 */
function markHydrated() {
  document.documentElement.setAttribute("data-reveal-ready", "");
}

/**
 * Scroll-reveal: fade + translateY(30px), threshold ~12%.
 *
 * Progressive enhancement — התוכן מרונדר **גלוי**. ההסתרה מתבצעת ב-CSS ורק
 * כשה-JS חי (`:root[data-js]`), כך שבלי JS או אחרי כשל הידרציה העמוד נראה
 * במלואו. האנימציה עצמה היא transition טהור, בלי framer-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: Tag;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    markHydrated();
    const el = ref.current;
    if (!el) return;

    // דפדפן בלי IntersectionObserver — פשוט מציגים.
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal", "in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Wrapper = as;
  return (
    <Wrapper
      ref={ref as React.Ref<HTMLDivElement & HTMLElement & HTMLLIElement>}
      className={cn("reveal", className)}
      style={delayStyle(delay)}
    >
      {children}
    </Wrapper>
  );
}

/** משתנה CSS ל-stagger בין אחים; בלי delay לא מייצרים style מיותר. */
function delayStyle(delay: number): React.CSSProperties | undefined {
  if (!delay) return undefined;
  return { "--reveal-delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties;
}

/** Entrance animation (hero) — נכנס מיד בטעינה, לא בגלילה. */
export function Entrance({
  children,
  delay = 0,
  fade = false,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  fade?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markHydrated();
    const el = ref.current;
    if (!el) return;
    // פריים אחד של המצב ההתחלתי, אחרת אין ממה לעשות transition.
    const raf = requestAnimationFrame(() => el.setAttribute("data-reveal", "in"));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className={cn("entrance", fade && "entrance-fade", className)}
      style={delayStyle(delay)}
    >
      {children}
    </div>
  );
}
