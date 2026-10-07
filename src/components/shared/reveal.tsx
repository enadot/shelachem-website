"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Tag = "div" | "section" | "li" | "ul" | "ol" | "h2" | "h3" | "span" | "p";

/** וריאנטי התנועה — ראו "Motion system" ב-globals.css. */
export type RevealVariant = "fade" | "mask" | "line" | "image" | "stagger";
const variantClass: Record<RevealVariant, string> = {
  fade: "reveal",
  mask: "reveal-mask",
  line: "reveal-line",
  image: "reveal-image",
  stagger: "reveal-stagger",
};

/**
 * מסמן ש-React חי ומריץ אפקטים. הסקריפט האינליין ב-layout מסיר את `data-js`
 * אם הסימון הזה לא הגיע — כך שכשל הידרציה לא משאיר עמוד ריק.
 */
function markHydrated() {
  document.documentElement.setAttribute("data-reveal-ready", "");
}

/**
 * Scroll-reveal עם וריאנטים (fade / mask / line / image / stagger), threshold ~12%.
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
  id,
  variant = "fade",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: Tag;
  /** יעד עוגן (למשל ניווט בתוך עמוד) — נדרש `scroll-mt-*` ב-className. */
  id?: string;
  variant?: RevealVariant;
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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    // מסכה (clip-path) מסתירה את האלמנט כולו, ו-IntersectionObserver לא "רואה"
    // אלמנט חתוך לאפס — לכן בוריאנטי מסכה צופים בהורה ומסמנים את האלמנט עצמו.
    const target = (variant === "mask" || variant === "image") && el.parentElement ? el.parentElement : el;
    const io2 = target === el ? io : new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.setAttribute("data-reveal", "in");
        io2.disconnect();
      },
      { threshold: 0.05, rootMargin: "0px 0px -6% 0px" },
    );
    io2.observe(target);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, [variant]);

  const Wrapper = as;
  return (
    <Wrapper
      ref={ref as React.Ref<never>}
      id={id}
      className={cn(variantClass[variant], className)}
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
