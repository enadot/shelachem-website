"use client";

import { Phone } from "lucide-react";
import { useLeadModal } from "@/components/shared/lead-modal";
import { cn } from "@/lib/utils";
import { useLpZone } from "./use-lp-zone";

/**
 * סרגל CTA דביק בתחתית המסך — מובייל בלבד (`md:hidden`). טלפון, וואטסאפ ובדיקת זכאות (מודאל).
 *
 * - מוצג רק בין טופס ה-hero ל-CTA הסופי (`useLpZone`), ולכן לא מכסה שדות טופס ולא את הפוטר.
 * - `data-track-location="lp-mobile-cta-bar"` — ה-tracker הכללי שולח `click_to_call` /
 *   `click_whatsapp` עם `cta_position=bar`; הטופס נפתח עם `lead_source=lp-<slug>-bar`.
 * - safe-area בתחתית (iPhone), יעדי מגע של 48px, וכשמוסתר — `inert` (לא בפוקוס ולא לקורא מסך).
 */
export function LpMobileCtaBar({
  slug,
  topic,
  phone,
  phoneHref,
  whatsappHref,
  formLabel,
  footnote,
}: {
  slug: string;
  topic: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  formLabel: string;
  footnote?: React.ReactNode;
}) {
  const zone = useLpZone();
  const { openLeadForm } = useLeadModal();
  const shown = zone === "middle";
  const item =
    "flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2 text-[15px] font-bold no-underline outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand";
  return (
    <nav
      aria-label="יצירת קשר מהירה"
      data-track-location="lp-mobile-cta-bar"
      data-lp-mobile-bar={shown ? "shown" : "hidden"}
      aria-hidden={!shown}
      inert={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 px-3 pt-2 shadow-[0_-8px_24px_rgba(4,8,40,0.10)] backdrop-blur transition-transform duration-200 motion-reduce:transition-none md:hidden",
        "pb-[max(8px,env(safe-area-inset-bottom))]",
        shown ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-[520px] items-stretch gap-2" dir="rtl">
        <a href={phoneHref} className={cn(item, "border border-hairline text-ink")} aria-label={`התקשרו: ${phone}`}>
          <Phone aria-hidden size={17} strokeWidth={2.4} className="text-brand" />
          <span>התקשרו</span>
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener"
          className={cn(item, "border border-hairline text-[#17853f]")}
        >
          וואטסאפ
        </a>
        <button
          type="button"
          onClick={() => openLeadForm(`lp-${slug}-bar`, topic, footnote ? { footnote } : undefined)}
          className={cn(item, "cursor-pointer border-none bg-brand text-white")}
        >
          {formLabel}
        </button>
      </div>
    </nav>
  );
}
