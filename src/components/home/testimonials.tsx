import Image from "next/image";
import type { Testimonial } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
import { LeadCta } from "@/components/shared/lead-cta";

/** עדויות על רויאל (designs/homepage-v3.html) — גריד בדסקטופ, גלילת swipe במובייל. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="brand-gradient surface-navy relative overflow-hidden py-12 text-white [--royal-shape:ellipse_110%_80%_at_50%_30%] md:px-[clamp(24px,5vw,72px)] md:py-24 md:[--royal-shape:ellipse_80%_90%_at_50%_30%]">
      <Image
        src="/images/swirl-white.png"
        alt=""
        aria-hidden
        width={480}
        height={480}
        className="pointer-events-none absolute -left-[120px] -top-[140px] hidden w-[480px] opacity-10 md:block"
      />
      <div className="relative mx-auto max-w-[1296px]">
        <div className="px-[22px] md:px-0">
          <h2 className="m-0 mb-2 font-display text-[28px] font-light text-white md:mb-3 md:text-[48px] md:tracking-[-0.5px]">
            הם כבר לא מוותרים <span className="font-black">על מה ששלהם.</span>
          </h2>
          <p className="m-0 mb-[22px] text-base text-on-royal-muted md:mb-10 md:text-xl">
            כל אחד מהסיפורים האלה התחיל ב״אין לי כוח לזה״. וכל אחד מהם נגמר בזכות שהגיעה הביתה.
          </p>
        </div>
        <Reveal>
          {/* אזור גליל (במובייל) — חייב שם ומיקוד מקלדת כדי שאפשר יהיה לגלול בחיצים. */}
          <div
            role="region"
            aria-label="סיפורי לקוחות"
            tabIndex={0}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[22px] pb-1.5 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
          >
            {testimonials.slice(0, 3).map((t) => (
              <figure
                key={t.id}
                className="m-0 flex w-[280px] shrink-0 snap-start flex-col rounded-[14px] bg-white text-ink md:w-auto md:rounded-2xl"
              >
                <blockquote className="m-0 flex-1 px-[18px] pb-3.5 pt-[18px] text-[15px] leading-relaxed text-ink-secondary md:px-7 md:pb-5 md:pt-[26px] md:text-lg md:leading-[1.65]">
                  ”{t.quote}“
                </blockquote>
                <figcaption className="px-[18px] pb-[18px] md:px-7 md:pb-[26px]">
                  <div className="text-[15px] font-black md:text-[17px]">{t.name}</div>
                  <div className="text-[13px] font-bold text-brand md:text-[15px]">{t.detail}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
        <div className="mt-6 px-[22px] md:mt-8 md:px-0">
          <LeadCta
            sourcePage="home-testimonials"
            variant="outline-accent"
            className="border-white text-white hover:bg-white/10"
          >
            רוצים שנבדוק גם לכם?
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
