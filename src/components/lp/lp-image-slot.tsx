import type { ClaimMode } from "@/lib/content/local/lp-claims";
import type { LpImageSlot } from "@/lib/content/local/landing-pages";
import { cn } from "@/lib/utils";

/**
 * מקום שמור לצילום שעוד לא הופק (T-026). כשהקובץ יהיה ב-`slot.src` — להחליף
 * ב-`CmsImage`/`next/image` עם אותו `alt`. מחוץ לפרודקשן מוצג גם מזהה ה-TODO.
 */
export function LpImagePlaceholder({
  slot,
  mode,
  className,
}: {
  slot: LpImageSlot;
  mode: ClaimMode;
  className?: string;
}) {
  const wide = slot.section === "hero";
  return (
    <figure
      role="img"
      aria-label={slot.alt}
      data-image-slot={slot.id}
      data-image-src={slot.src}
      className={cn(
        "relative m-0 flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-hairline bg-surface-blue",
        wide ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]",
        className,
      )}
    >
      {mode === "review" && (
        <figcaption className="max-w-[46ch] p-6 text-center text-[13.5px] leading-relaxed text-ink-muted">
          <span className="block font-bold text-ink-secondary">{slot.id}</span>
          {slot.alt}
          <span className="mt-1 block tnum" dir="ltr">
            {slot.src} · {slot.ratio}
            {slot.reuse ? ` · reuse? ${slot.reuse}` : ""}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
