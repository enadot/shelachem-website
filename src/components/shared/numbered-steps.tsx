import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

/**
 * צעדים ממוספרים — קו שנמתח מעל כל צעד (התנועה היחידה), מספר גדול ושורת הסבר. אותה שפה כמו
 * "איך זה עובד" בדף הבית, בלי עיגולים ובלי ציר מחבר.
 */
export function NumberedSteps({
  steps,
  className,
}: {
  steps: readonly { title: string; description: string }[];
  className?: string;
}) {
  const cols =
    steps.length >= 5 ? "md:grid-cols-5" : steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <ol className={cn("m-0 grid list-none gap-8 p-0 sm:grid-cols-2 md:gap-10", cols, className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="relative pt-5 md:pt-7">
          <Reveal
            as="span"
            variant="line"
            delay={i * 0.1}
            className="absolute inset-x-0 top-0 block h-px bg-ink"
          >
            {null}
          </Reveal>
          <div>
            <div className="tnum mb-3 font-display text-[40px] font-light leading-none text-brand md:mb-6 md:text-[64px]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="m-0 mb-1.5 font-body text-lg font-black leading-snug text-ink md:text-xl">
              {step.title}
            </h3>
            <p className="m-0 text-[15.5px] leading-relaxed text-ink-muted md:text-base">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
