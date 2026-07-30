"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronBack, ChevronForward } from "@/components/shared/icons";

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
            className="pill flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline bg-white text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronBack size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="הבא"
            className="pill flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline bg-white text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronForward size={18} />
          </button>
        </div>
      )}
      {/*
        אזור גליל חייב להיות נגיש למקלדת — בלי tabIndex אי אפשר לגלול אותו
        בחיצים בלי עכבר (WCAG 2.1.1). role=region + aria-label נותנים לו שם.
      */}
      <div
        ref={trackRef}
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        tabIndex={0}
        style={{ gap: itemGap }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-1.5 [&>*]:shrink-0 [&>*]:snap-start"
      >
        {children}
      </div>
    </div>
  );
}
