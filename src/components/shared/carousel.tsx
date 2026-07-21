"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * קרוסלת scroll-snap — swipe במובייל, חצי ניווט בדסקטופ.
 * ב-RTL scrollBy עם dx שלילי מגלגל קדימה (לכיוון הפריטים הבאים).
 */
export function Carousel({
  children,
  className,
  itemGap = 18,
  showArrows = true,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  itemGap?: number;
  showArrows?: boolean;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.7));
    // dir=1 = "next" — in RTL the track scrolls toward negative left.
    el.scrollBy({ left: -dir * step, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      {showArrows && (
        <div className="mb-4 hidden justify-end gap-2.5 md:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="הקודם"
            className="pill focus-brand h-11 w-11 cursor-pointer border border-hairline bg-white text-lg text-ink transition-colors hover:border-brand hover:text-brand"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="הבא"
            className="pill focus-brand h-11 w-11 cursor-pointer border border-hairline bg-white text-lg text-ink transition-colors hover:border-brand hover:text-brand"
          >
            ›
          </button>
        </div>
      )}
      <div
        ref={trackRef}
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        style={{ gap: itemGap }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-1.5 [&>*]:shrink-0 [&>*]:snap-start"
      >
        {children}
      </div>
    </div>
  );
}
