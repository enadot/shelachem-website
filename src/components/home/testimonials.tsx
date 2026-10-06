"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/content/types";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";
import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward, ChevronBack, ChevronForward } from "@/components/shared/icons";

/**
 * עדויות — ציטוט אחד גדול בכל פעם (טיפוגרפיה עריכתית על רויאל), עם מונה
 * "01 / 03" וחיצים. מעבר בין ציטוטים: crossfade קצר, בלי קרוסלה נגררת.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const items = testimonials.slice(0, 5);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const t = items[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + items.length) % items.length);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="surface-navy bg-brand px-[22px] py-16 text-white md:px-[clamp(24px,5vw,72px)] md:py-[120px]">
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="05" tone="dark">
          הם כבר לא מוותרים על מה ששלהם
        </Eyebrow>

        <figure className="m-0 mt-10 min-h-[260px] md:mt-16 md:min-h-[220px]" aria-live="polite">
          <div key={t.id} className="row-in">
            <blockquote className="m-0 max-w-[1040px] font-display text-[26px] font-light leading-[1.3] text-white md:text-[44px] md:leading-[1.2] md:tracking-[-0.01em]">
              ”{t.quote}“
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-base md:mt-10 md:text-lg">
              <span className="font-black">{t.name}</span>
              <span aria-hidden className="h-px w-6 bg-white/40" />
              <span className="text-on-royal-muted">{t.detail}</span>
            </figcaption>
          </div>
        </figure>

        <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-white/20 pt-6 md:mt-14 md:pt-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="הציטוט הקודם"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent text-white transition-colors duration-300 hover:bg-white hover:text-brand"
            >
              <ChevronBack size={18} />
            </button>
            <span className="tnum min-w-[64px] text-center text-sm font-bold text-white/80">
              {pad(index + 1)} / {pad(items.length)}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="הציטוט הבא"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent text-white transition-colors duration-300 hover:bg-white hover:text-brand"
            >
              <ChevronForward size={18} />
            </button>
          </div>
          <LeadCta
            sourcePage="home-testimonials"
            variant="accent"
            className="group"
          >
            רוצים שנבדוק גם לכם?
            <ArrowForward size={18} className="nudge" />
          </LeadCta>
        </Reveal>
      </div>
    </section>
  );
}
