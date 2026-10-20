import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { LeadCta } from "@/components/shared/lead-cta";
import { StatStrip } from "@/components/shared/stat-strip";
import { ArrowForward } from "@/components/shared/icons";

/**
 * השיטה — שלושת השלבים שלנו. משותפת לכל עמודי התחומים (זה התהליך שלנו, לא של
 * הגוף), ולכן בקוד ולא ב-CMS. הניסוח מאושר משפטית: "מכינים/מלווים", לא "מגישים";
 * בלי מספרים מדויקים על החברה.
 */
const steps = [
  {
    title: "אפיון מדויק של המצב הרפואי",
    body: "המנהל הרפואי שלנו עובר על התיעוד, מזהה כל ליקוי רלוונטי ומאתר את הזכויות שמתאימות למצב.",
  },
  {
    title: "בניית תיק מקיף",
    body: "צוות רופאים ומומחי זכויות בונה איתכם תיק רפואי ומשפטי מלא — כולל חוות דעת והכנה לוועדות.",
  },
  {
    title: "ליווי אישי לאורך כל הדרך",
    body: "מנהלת תיק אישית מלווה אתכם עד סיום התהליך — וגם אחרי החלטה, ממשיכים איתכם עד למיצוי האמת.",
  },
];

const stats = [
  { value: "מאז 2013", label: "מממשים זכויות רפואיות" },
  { value: "עשרות אלפי", label: "תיקים שצלחו איתנו" },
  { value: "בפיקוח רפואי", label: "רופאים ומומחי זכויות בהובלת מנהל רפואי" },
];

export function ServiceMethod({ sourcePage, topic }: { sourcePage: string; topic?: string }) {
  return (
    <section className="surface-navy bg-brand px-6 py-16 text-white md:px-[clamp(24px,6.7vw,96px)] md:py-24">
      <div className="mx-auto max-w-[1240px]">
        <Eyebrow tone="dark">הדרך שלנו</Eyebrow>
        <Reveal
          as="h2"
          variant="mask"
          className="m-0 mb-10 mt-6 max-w-[860px] font-display text-[30px] font-light leading-[1.1] text-white md:mb-14 md:mt-8 md:text-[52px] md:leading-[1.04] md:tracking-[-0.02em]"
        >
          שלושה שלבים. <b className="font-black">ומישהו שמחזיק את התיק בשבילכם.</b>
        </Reveal>

        <ol className="m-0 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <li key={step.title} className="relative pt-5 md:pt-7">
              <Reveal
                as="span"
                variant="line"
                delay={i * 0.1}
                className="absolute inset-x-0 top-0 block h-px bg-white/40"
              >
                {null}
              </Reveal>
              <div className="tnum mb-3 font-display text-[40px] font-light leading-none text-gold md:mb-6 md:text-[64px]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="m-0 mb-1.5 font-body text-lg font-black leading-snug text-white md:text-xl">
                {step.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-relaxed text-on-royal-muted md:text-base">{step.body}</p>
            </li>
          ))}
        </ol>

        <StatStrip stats={stats} tone="dark" className="mt-12 md:mt-16" />

        <div className="mt-10 flex flex-col items-stretch gap-6 md:mt-12 md:flex-row md:items-center md:justify-between">
          <p className="m-0 font-display text-[22px] font-light leading-snug text-white md:text-[26px]">
            שכר טרחה בהצלחה בלבד. <b className="font-black">בדיסקרטיות מלאה.</b>
          </p>
          <LeadCta sourcePage={sourcePage} topic={topic} variant="accent" size="lg" className="group w-full shrink-0 md:w-auto">
            בדיקת זכאות חינם
            <ArrowForward size={18} className="nudge" />
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
