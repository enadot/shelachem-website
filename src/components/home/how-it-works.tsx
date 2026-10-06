import { Reveal } from "@/components/shared/reveal";
import { LeadCta } from "@/components/shared/lead-cta";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowForward } from "@/components/shared/icons";

const steps = [
  {
    title: "משאירים פרטים.",
    body: "טלפון אחד — ואנחנו חוזרים אליכם.",
  },
  {
    title: "בודקים לעומק.",
    body: "מוצאים כל זכות שמגיעה לכם.",
  },
  {
    title: "אנחנו נכנסים בשבילכם.",
    body: "מול כל הגופים. אתם ממשיכים לחיות.",
  },
];

/**
 * שלושה צעדים — מספרים גדולים, קו שיער שנמתח מעל כל צעד ושורה אחת.
 * בלי עיגולים ובלי ציר גרדיאנט: הטיפוגרפיה עושה את העבודה.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-[22px] py-16 md:px-[clamp(24px,5vw,72px)] md:py-[120px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="02">איך זה עובד</Eyebrow>
        <Reveal
          as="h2"
          variant="mask"
          className="m-0 mb-10 mt-6 max-w-[820px] font-display text-[32px] font-light leading-[1.1] text-ink md:mb-16 md:mt-8 md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
        >
          שלושה צעדים שלכם. <span className="font-black">החלק הקשה שלנו.</span>
        </Reveal>

        <ol className="m-0 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <li key={step.title} className="relative pt-5 md:pt-8">
              <Reveal
                as="span"
                variant="line"
                delay={i * 0.12}
                className="absolute inset-x-0 top-0 block h-px bg-ink"
              >
                {null}
              </Reveal>
              <Reveal delay={0.15 + i * 0.12}>
                <div className="tnum mb-3 font-display text-[44px] font-light leading-none text-brand md:mb-8 md:text-[96px]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mb-1.5 text-xl font-black text-ink md:text-2xl">{step.title}</div>
                <div className="text-base leading-relaxed text-ink-muted md:text-lg">{step.body}</div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-12 md:mt-16">
          <LeadCta sourcePage="home-how-it-works" variant="brand" size="lg" className="group w-full md:w-auto">
            לבדיקה ראשונית חינם
            <ArrowForward size={18} className="nudge" />
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
