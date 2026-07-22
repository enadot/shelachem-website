"use client";

import { cn } from "@/lib/utils";

/**
 * Magic UI BorderBeam — קרן אור עדינה שמקיפה את מסגרת האלמנט.
 * ההורה חייב להיות position:relative עם overflow:hidden ו-border.
 */
export function BorderBeam({
  size = 220,
  duration = 12,
  colorFrom = "#0000ff",
  colorTo = "#7a7aff",
  className,
}: {
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      style={
        {
          "--size": size,
          "--duration": duration,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent]",
        // mask so only the border ring is painted
        "[mask-clip:padding-box,border-box] [mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        // the moving beam
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:0s] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        "motion-reduce:hidden",
        className,
      )}
    />
  );
}
