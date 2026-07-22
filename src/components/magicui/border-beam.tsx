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
  // The mask longhands must be inline styles: as utility classes the `mask`
  // shorthand can land after `mask-clip`/`mask-composite` in the generated CSS
  // and reset them, painting the full beam square instead of the border ring.
  const ringMask: React.CSSProperties = {
    maskImage: "linear-gradient(transparent,transparent), linear-gradient(white,white)",
    maskClip: "padding-box, border-box",
    maskComposite: "intersect",
    WebkitMaskImage: "linear-gradient(transparent,transparent), linear-gradient(white,white)",
    WebkitMaskClip: "padding-box, border-box",
    WebkitMaskComposite: "source-in",
  };
  return (
    <div
      aria-hidden
      style={
        {
          "--size": size,
          "--duration": duration,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          ...ringMask,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent]",
        // the moving beam
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:0s] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        "motion-reduce:hidden",
        className,
      )}
    />
  );
}
