"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * מספר שנספר כלפי מעלה כשהוא נכנס למסך.
 *
 * שלושה תיקונים מול הגרסה הקודמת — כולם נמדדו בדפדפן, וכולם נגעו במספרי האמון
 * שהם כל הטיעון של האתר:
 *
 * 1. **הערך האמיתי מרונדר בשרת.** קודם רונדר `"0"`, כך שבלי JS (או לפני
 *    הידרציה) רצועת המדדים הכריזה "0+ תיקים · 0% מהתביעות אושרו" — בדיוק ההפך
 *    מהמטרה. עכשיו ה-HTML מכיל את המספר, והאנימציה מתחילה ממנו רק כש-JS חי.
 * 2. **הנחיתה מדויקת.** `useSpring` נעצר אסימפטוטית: נמדד `10,057` במקום
 *    `10,059` ו-`4,295+` במקום `4,300+`. `animate` עם משך קבוע נוחת על היעד.
 * 3. **`prefers-reduced-motion` באמת עוצר.** קודם הוא רק דילג על ההשהיה.
 *
 * הסיומת/קידומת (`+`, `%`, `₪`) נשארות מחוץ לקומפוננטה — ראו `StatValue`.
 */
export function NumberTicker({
  value,
  delay = 0,
  className,
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: "0px" });
  /**
   * `true` = המספר היה כבר על המסך בטעינה, ולכן **אין** לספור אותו: זה היה
   * מייצר הבהוב 10,059 → 0 → 10,059 מול העיניים. סופרים רק מספרים שנכנסים
   * למסך בגלילה — האפקט שהעיצוב התכוון אליו.
   *
   * ה-effect הזה מוצהר ראשון, ולכן הוא רץ לפני זה שמריץ את האנימציה.
   */
  const visibleOnLoad = useRef(false);

  useEffect(() => {
    const el = ref.current;
    visibleOnLoad.current = Boolean(el && el.getBoundingClientRect().top < window.innerHeight);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isInView || reduce || visibleOnLoad.current) return;

    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        el.textContent = Math.round(latest).toLocaleString("he-IL");
      },
      // נחיתה מדויקת על הערך שהתוכן מצהיר עליו, בלי לסמוך על עיגול.
      onComplete: () => {
        el.textContent = value.toLocaleString("he-IL");
      },
    });
    return () => controls.stop();
  }, [isInView, delay, value, reduce]);

  return (
    <span ref={ref} className={cn("tnum tabular-nums", className)}>
      {value.toLocaleString("he-IL")}
    </span>
  );
}

/**
 * ממיר מחרוזת סטטיסטיקה מהתוכן ("+13", "10,000+", "87%", "0 ₪") ל-NumberTicker
 * עם הקידומת/סיומת סביבו. אם אין בה מספר — מוצגת כמו שהיא.
 *
 * `<bdi dir="ltr">` — קריטי: המספר וסימנו הם יחידה אחת שנקראת משמאל לימין. בלי
 * זה הסדר הדו-כיווני של העמוד פיצל אותם והציג `+4,295`, `%87` ו-`₪ 0`, בשונה
 * מאותן מחרוזות בטקסט רגיל באתר.
 */
export function StatValue({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return <span className={className}>{value}</span>;
  const [, prefix, num, suffix] = match;
  return (
    <bdi dir="ltr" className={className}>
      {prefix}
      <NumberTicker value={parseInt(num.replace(/,/g, ""), 10)} />
      {suffix}
    </bdi>
  );
}
