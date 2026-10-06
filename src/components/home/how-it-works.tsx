import { Reveal } from "@/components/shared/reveal";
import { LeadCta } from "@/components/shared/lead-cta";

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
 * שלושה צעדים על ציר (designs/homepage-v3.html) — כותרת ושורה אחת לכל צעד.
 * ציר אנכי במובייל, אופקי בדסקטופ. עוגן #how-it-works מהניווט.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-[22px] pb-[52px] pt-[52px] md:px-[clamp(24px,5vw,72px)] md:py-[100px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Reveal className="mb-8 md:mb-14 md:text-center">
          <h2 className="m-0 font-display text-[28px] font-light leading-[1.2] text-ink md:text-[48px] md:leading-[1.08] md:tracking-[-0.5px]">
            שלושה צעדים שלכם. <span className="font-black">החלק הקשה שלנו.</span>
          </h2>
          <p className="m-0 mt-2.5 text-base text-ink-secondary md:mt-3.5 md:text-[19px]">
            בלי טפסים אינסופיים ובלי לרוץ בין משרדים.
          </p>
        </Reveal>

        <ol className="relative m-0 flex list-none flex-col gap-[26px] p-0 md:grid md:grid-cols-3 md:gap-10">
          {/* הציר — אנכי במובייל, אופקי בדסקטופ */}
          <span
            aria-hidden
            className="absolute bottom-6 right-[23px] top-6 w-[3px] bg-gradient-to-b from-brand to-sky md:bottom-auto md:left-[16.6%] md:right-[16.6%] md:top-[35px] md:h-1 md:w-auto md:bg-gradient-to-l md:[clip-path:polygon(0_20%,100%_0,100%_100%,0_80%)]"
          />
          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.08}
              className="relative grid grid-cols-[50px_1fr] items-start gap-4 md:flex md:flex-col md:items-center md:gap-3 md:text-center"
            >
              <span className="tnum flex h-[50px] w-[50px] items-center justify-center rounded-full bg-brand font-display text-2xl font-black text-white shadow-[0_0_0_6px_#fff] md:h-[72px] md:w-[72px] md:text-[34px] md:shadow-[0_0_0_10px_#fff,rgba(18,40,168,0.25)_0_14px_30px]">
                {i + 1}
              </span>
              <div className="pt-1 md:pt-0">
                <div className="mb-1 text-[19px] font-black text-ink md:mb-2 md:mt-3 md:text-2xl">
                  {step.title}
                </div>
                <div className="text-base leading-[1.55] text-ink-secondary md:mx-auto md:max-w-[340px] md:text-lg md:leading-relaxed">
                  {step.body}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-7 md:mt-12 md:flex md:justify-center">
          <LeadCta sourcePage="home-how-it-works" variant="brand" size="lg" className="w-full md:w-auto">
            לבדיקה ראשונית חינם
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
