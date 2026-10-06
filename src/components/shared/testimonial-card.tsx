import type { Testimonial } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** עדות לקוח — ציטוט בטיפוגרפיה, קו שיער מעליו ושם מתחתיו. בלי קופסה. */
export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <figure className={cn("m-0 flex w-80 flex-col gap-5 border-t border-ink pt-5", className)}>
      <blockquote className="m-0 flex-1 font-display text-xl font-light leading-snug text-ink">
        ”{testimonial.quote}“
      </blockquote>
      <figcaption className="text-[15px]">
        <span className="font-bold text-ink">{testimonial.name}</span>
        <span className="text-ink-faint"> · {testimonial.detail}</span>
      </figcaption>
    </figure>
  );
}
