import type { Testimonial } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** כרטיס עדות לקוח — ציטוט, שם ותחום (עיצוב דף הבית ועמוד השירות). */
export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-80 flex-col gap-3 rounded-xl border border-hairline bg-white px-6 py-6",
        className,
      )}
    >
      <div aria-hidden className="text-[34px] font-black leading-[0.6] text-accent">
        ”
      </div>
      <p className="m-0 flex-1 text-base leading-relaxed text-ink-secondary">
        {testimonial.quote}
      </p>
      <div className="border-t border-hairline-soft pt-3">
        <div className="text-[15.5px] font-bold text-ink">{testimonial.name}</div>
        <div className="text-sm text-ink-faint">{testimonial.detail}</div>
      </div>
    </div>
  );
}
