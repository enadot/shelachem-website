import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "משאירים פרטים.",
    body: "אתם משאירים טלפון, אנחנו חוזרים. בלי טפסים אינסופיים, בלי לרוץ בין משרדים.",
  },
  {
    title: "בודקים לעומק.",
    body: "אנחנו מוצאים בדיוק מה מגיע לכם — כולל זכויות שבחיים לא שמעתם עליהן.",
  },
  {
    title: "אנחנו נכנסים בשבילכם.",
    body: "מנהלים את כל המאבק מול ביטוח לאומי, מס הכנסה, הקרנות והביטוח. אתם ממשיכים לחיות.",
  },
];

/** שלושה צעדים (homepage-live.html §4), עוגן #how-it-works מהניווט. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-6 py-16 md:px-[clamp(24px,6.7vw,96px)] md:py-[88px]"
    >
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading strong="החלק הקשה שלנו." className="mb-10 text-[28px] md:text-[38px]">
          שלושה צעדים שלכם.
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal
              key={step.title}
              delay={i * 0.09}
              className="rounded-xl border border-hairline bg-white p-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_14px_32px_rgba(0,55,112,0.10)]"
            >
              <div className="tnum mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint text-xl font-bold text-accent-text">
                {i + 1}
              </div>
              <div className="mb-2.5 text-[22px] font-bold text-ink">{step.title}</div>
              <div className="text-[17px] leading-relaxed text-ink-secondary md:text-[19px]">
                {step.body}
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-9 flex justify-center">
          <Button asChild size="lg">
            <Link href="/#lead-form">לבדיקה ראשונית חינם</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
