import type { Metadata } from "next";
import { Reveal, Entrance } from "@/components/shared/reveal";
import { PageCta } from "@/components/shared/page-cta";
import { LeadCta } from "@/components/shared/lead-cta";
import { StatStrip } from "@/components/shared/stat-strip";
import { NumberedSteps } from "@/components/shared/numbered-steps";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ChevronForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "הסיפור שלנו",
  alternates: { canonical: "/about" },
  description:
    "חברת שלכם הוקמה ב-2013 מתוך שליחות: לפשט את הבירוקרטיה הרפואית עבור כל אזרח בישראל. הכירו את הדרך, הערכים והצוות.",
};

const milestones = [
  { year: "2013", text: "הקמת החברה — ליווי מימוש זכויות למגזר הדתי." },
  { year: "2017", text: "הרחבת הפעילות לכלל אזרחי המדינה והקמת מערך רפואי פנימי." },
  { year: "2021", text: "חציית רף 10,000 לקוחות מלווים וצוות של 100+ מומחים." },
  { year: "היום", text: "מהחברות המובילות בישראל במימוש זכויות רפואיות." },
];

const values = [
  {
    title: "אנושיות לפני הכל",
    desc: "מאחורי כל תיק יש אדם. אנחנו מלווים אתכם בגובה העיניים, בסבלנות וברגישות — גם ברגעים הקשים.",
  },
  {
    title: "שכר טרחה רק בהצלחה",
    desc: "לא גובים שקל מראש. אם לא השגנו לכם תוצאה — לא שילמתם. האינטרס שלנו הוא ההצלחה שלכם.",
  },
  {
    title: "שקיפות מלאה",
    desc: "אתם יודעים בכל רגע איפה התיק עומד, מה השלב הבא ומה סיכויי ההצלחה — בלי אותיות קטנות.",
  },
  {
    title: "מקצועיות ללא פשרות",
    desc: "מעל 100 מומחים ורופאים שמכירים את הוועדות מבפנים ובונים כל תיק ברמה הגבוהה ביותר.",
  },
];

const stats = [
  { value: "+13", label: "שנות ניסיון במימוש זכויות" },
  { value: "+100", label: "מומחים ורופאים בצוות" },
  { value: "10,000+", label: "לקוחות שליווינו להצלחה" },
];

const steps = [
  { title: "שיחת היכרות חינם", description: "מספרים לנו על המצב הרפואי — ואנחנו בודקים זכאות ראשונית, ללא עלות." },
  { title: "בדיקה רפואית מקיפה", description: "רופאי החברה עוברים על התיק הרפואי ומאתרים כל זכות אפשרית." },
  { title: "בניית התיק והגשה", description: "אנחנו אוספים מסמכים, ממלאים טפסים ומגישים לכל הגורמים." },
  { title: "ליווי לוועדות", description: "הכנה אישית לוועדה הרפואית וליווי צמוד עד להחלטה." },
  { title: "הכסף אצלכם", description: "קצבה, מענק או החזר — ורק אז משולם שכר הטרחה." },
];

const headingClass =
  "m-0 font-display text-[30px] font-light leading-[1.1] text-ink md:text-[52px] md:leading-[1.04] md:tracking-[-0.02em]";

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="brand-gradient surface-navy relative overflow-hidden text-white [--royal-shape:ellipse_80%_120%_at_70%_40%]">
        <div className="relative mx-auto flex max-w-[1240px] flex-col justify-center gap-4.5 px-6 py-16 md:px-12 md:py-[72px]">
          <Breadcrumb
            tone="inverse"
            items={[{ label: "בית", href: "/" }, { label: "הסיפור שלנו" }]}
          />
          <Entrance>
            <h1 className="m-0 font-display text-[38px] font-light leading-[1.1] tracking-tight text-white md:text-[60px]">
              המשימה שלנו:
              <br />
              <span className="font-black text-gold">הזכויות שלכם.</span>
            </h1>
          </Entrance>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-white/90 md:text-xl">
            מאחורי כל תיק יש אדם שמתמודד עם מצב רפואי — ומולו מערכת בירוקרטית מסובכת. אנחנו כאן
            כדי שהוא לא יעמוד בה לבד.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5">
            <LeadCta sourcePage="about-hero" variant="accent" className="group">
              לבדיקת זכאות חינם
              <ChevronForward size={16} className="nudge" />
            </LeadCta>
            <a href="#process" className="px-2 py-3 text-[17px] font-bold text-white no-underline">
              <span className="link-draw">איך אנחנו עובדים</span>
            </a>
          </div>
        </div>
      </section>

      {/* story + timeline */}
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="01">הסיפור שלנו</Eyebrow>
          <div className="mt-6 grid gap-10 md:mt-8 md:grid-cols-[1fr_1.1fr] md:gap-20">
            <div>
              <Reveal as="h2" variant="mask" className={headingClass}>
                מ-2013 ועד היום: <span className="font-black">שליחות אחת.</span>
              </Reveal>
              <Reveal as="ol" variant="stagger" className="m-0 mt-8 list-none border-t border-hairline p-0 md:mt-12">
                {milestones.map((ms) => (
                  <li
                    key={ms.year}
                    className="grid grid-cols-[88px_1fr] items-baseline gap-4 border-b border-hairline py-5 md:grid-cols-[120px_1fr]"
                  >
                    <span className="tnum font-display text-[28px] font-light leading-none text-brand md:text-[36px]">
                      {ms.year}
                    </span>
                    <span className="text-base leading-relaxed text-ink-secondary">{ms.text}</span>
                  </li>
                ))}
              </Reveal>
            </div>
            <Reveal className="flex flex-col gap-5 text-[17px] leading-[1.75] text-ink-secondary md:pt-2 md:text-[19px]">
              <p className="m-0">
                חברת שלכם הוקמה בשנת 2013 מתוך שליחות אמיתית:{" "}
                <b className="text-ink">לפשט את הבירוקרטיה הרפואית עבור כל אזרח בישראל.</b> ראינו
                אנשים שמתמודדים עם מחלה או פציעה — ובמקום לנוח ולהחלים, הם רודפים אחרי טפסים,
                ועדות ומכתבי דחייה.
              </p>
              <p className="m-0">
                התחלנו כחברה המשרתת את המגזר הדתי, מתוך היכרות עמוקה עם צרכי הקהילה. עם השנים
                הבנו שהבעיה משותפת לכולם — והיום אנחנו גאים להוביל את תחום מימוש הזכויות עבור
                כלל אזרחי המדינה.
              </p>
              <p className="m-0">
                מאחורי כל תיק עומד צוות של <b className="text-ink">מעל 100 מומחים ורופאים</b>:
                יועצים רפואיים, מומחי ביטוח לאומי ומס הכנסה, ומלווים אישיים שמכירים את הוועדות
                מבפנים. אנחנו לא מתחילים לגבות שקל עד שאתם מקבלים תוצאה.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="surface-navy bg-night px-6 py-14 text-white md:px-[clamp(24px,6.7vw,96px)] md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="02" tone="dark">במספרים</Eyebrow>
          <StatStrip stats={stats} tone="dark" className="mt-8 md:mt-10" />
        </div>
      </section>

      {/* values — ארבע שורות ממוספרות, בלי אייקונים */}
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="03">הערכים</Eyebrow>
          <Reveal as="h2" variant="mask" className={`${headingClass} mb-10 mt-6 md:mb-14 md:mt-8`}>
            מה <span className="font-black">מנחה אותנו</span>
          </Reveal>
          <Reveal as="ul" variant="stagger" className="m-0 grid list-none border-t border-hairline p-0 md:grid-cols-2 md:gap-x-16">
            {values.map((v, i) => (
              <li key={v.title} className="grid grid-cols-[40px_1fr] gap-x-4 border-b border-hairline py-7 md:py-9">
                <span className="tnum pt-1.5 text-sm font-bold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 mb-2 font-display text-[24px] font-black leading-tight text-ink md:text-[28px]">
                    {v.title}
                  </h3>
                  <p className="m-0 max-w-[48ch] text-base leading-relaxed text-ink-secondary">{v.desc}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* process */}
      <section id="process" className="scroll-mt-24 bg-surface px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="04">התהליך</Eyebrow>
          <Reveal as="h2" variant="mask" className={`${headingClass} mt-6 md:mt-8`}>
            איך זה עובד — <span className="font-black">5 שלבים</span>
          </Reveal>
          <p className="m-0 mb-10 mt-4 max-w-[620px] text-[17px] leading-relaxed text-ink-secondary md:mb-14 md:text-lg">
            מהשיחה הראשונה ועד הכסף בחשבון — אתם תמיד יודעים איפה התיק עומד ומה השלב הבא.
          </p>
          <NumberedSteps steps={steps} />
        </div>
      </section>

      {/* social responsibility */}
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="05">אחריות חברתית</Eyebrow>
          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-[1fr_1fr] md:items-end md:gap-20">
            <Reveal as="h2" variant="mask" className={headingClass}>
              זכויות הן לא מותרות — <span className="font-black">הן שייכות לכולם.</span>
            </Reveal>
            <Reveal>
              <p className="m-0 text-[16px] leading-[1.7] text-ink-secondary md:text-lg">
                לצד הפעילות העסקית, אנחנו מלווים מדי שנה עשרות משפחות במצוקה כלכלית — ללא עלות.
                אנחנו מקיימים הרצאות חינמיות על זכויות רפואיות בקהילות, במרכזי חולים ובעמותות,
                ומפרסמים במגזין שלנו מדריכים פתוחים לכולם.
              </p>
              <p className="m-0 mt-4 text-sm font-bold text-ink-muted">
                ליווי פרו-בונו למשפחות · הרצאות חינם בקהילה · מדריכים פתוחים במגזין
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}
