import Link from "next/link";
import type { Testimonial } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { Button } from "@/components/ui/button";

/** עדויות (homepage-live.html §7) — גריד בדסקטופ, גלילת swipe במובייל. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="px-6 pb-16 md:px-[clamp(24px,6.7vw,96px)] md:pb-24">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading strong="על מה ששלהם." className="mb-3 text-[28px] md:text-[38px]">
          הם כבר לא מוותרים
        </SectionHeading>
        <p className="m-0 mb-8 text-lg text-ink-secondary md:text-xl">
          כל אחד מהסיפורים האלה התחיל ב״אין לי כוח לזה״. וכל אחד מהם נגמר בזכות שהגיעה הביתה.
        </p>
        <Reveal className="no-scrollbar -mx-6 mb-7 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              className="w-[85vw] max-w-[340px] shrink-0 snap-start rounded-xl transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_14px_32px_rgba(0,55,112,0.10)] md:w-auto md:max-w-none"
            />
          ))}
        </Reveal>
        <Button asChild variant="outline-accent" className="text-lg">
          <Link href="/#lead-form">עוד סיפורים</Link>
        </Button>
      </div>
    </section>
  );
}
