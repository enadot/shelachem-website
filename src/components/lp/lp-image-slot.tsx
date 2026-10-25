import Image from "next/image";
import type { CSSProperties } from "react";
import type { LpImageSlot } from "@/lib/content/local/landing-pages";
import { cn } from "@/lib/utils";

/**
 * צילום של דף נחיתה (T-026). התמונות הופקו ב-Higgsfield ונשמרו תחת
 * public/images/photos/lp-*.webp. תמונת ה-hero נחתכת ל-4:3 במובייל
 * ול-21:9 בדסקטופ; `slot.focus` מזיז את נקודת החיתוך במובייל כשהנושא לא במרכז.
 */
export function LpImage({ slot, className }: { slot: LpImageSlot; className?: string }) {
  const hero = slot.section === "hero";
  return (
    <figure
      data-image-slot={slot.id}
      className={cn(
        "relative m-0 overflow-hidden rounded-2xl bg-surface-blue",
        hero ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]",
        className,
      )}
    >
      <Image
        src={slot.src}
        alt={slot.alt}
        fill
        priority={hero}
        sizes={hero ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 960px) 880px, 100vw"}
        className="object-cover object-[var(--lp-focus,50%_50%)] md:object-center"
        style={slot.focus ? ({ "--lp-focus": slot.focus } as CSSProperties) : undefined}
      />
    </figure>
  );
}
