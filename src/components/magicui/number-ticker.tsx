"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magic UI NumberTicker — המספר "נספר" כלפי מעלה כשהוא נכנס למסך.
 * שומר קידומות/סיומות (כמו + או ₪) מחוץ לקומפוננטה; מקבל רק את המספר.
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
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const t = setTimeout(() => motionValue.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [motionValue, isInView, delay, value, reduce]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toLocaleString("he-IL");
        }
      }),
    [springValue],
  );

  return (
    <span ref={ref} className={cn("tnum inline-block tabular-nums", className)}>
      {reduce ? value.toLocaleString("he-IL") : "0"}
    </span>
  );
}

/**
 * ממיר מחרוזת סטטיסטיקה מהתוכן ("+13", "10,000+", "87%", "0 ₪")
 * ל-NumberTicker עם הקידומת/סיומת סביבו. אם אין בה מספר — מוצגת כמו שהיא.
 */
export function StatValue({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return <span className={className}>{value}</span>;
  const [, prefix, num, suffix] = match;
  return (
    <span className={className}>
      {prefix}
      <NumberTicker value={parseInt(num.replace(/,/g, ""), 10)} />
      {suffix}
    </span>
  );
}
