import type { Metadata } from "next";
import { Reveal, Entrance } from "@/components/shared/reveal";
import { PageCta } from "@/components/shared/page-cta";
import { LeadCta } from "@/components/shared/lead-cta";
import { StatValue } from "@/components/magicui/number-ticker";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ChevronForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "הסיפור שלנו",
  alternates: { canonical: "/about" },
  description:
    "חברת שלכם הוקמה ב-2013 מתוך שליחות: לפשט את הבירוקרטיה הרפואית עבור כל אזרח בישראל. הכירו את הדרך, הערכים והצוות.",
};

const milestones = [
  { year: "2013", text: "הקמת החברה — ליווי מימוש זכויות למגזר הדתי.", dot: "bg-accent" },
  { year: "2017", text: "הרחבת הפעילות לכלל אזרחי המדינה והקמת מערך רפואי פנימי.", dot: "bg-brand" },
  { year: "2021", text: "חציית רף 10,000 לקוחות מלווים וצוות של 100+ מומחים.", dot: "bg-brand" },
  { year: "היום", text: "מהחברות המובילות בישראל במימוש זכויות רפואיות.", dot: "bg-banner" },
];

const values = [
  {
    title: "אנושיות לפני הכל",
    desc: "מאחורי כל תיק יש אדם. אנחנו מלווים אתכם בגובה העיניים, בסבלנות וברגישות — גם ברגעים הקשים.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3.5A5 5 0 0 1 21 11c-2 4.5-9 9-9 9Z" stroke="#0000FF" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "שכר טרחה רק בהצלחה",
    desc: "לא גובים שקל מראש. אם לא השגנו לכם תוצאה — לא שילמתם. האינטרס שלנו הוא ההצלחה שלכם.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" stroke="#0000FF" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4.5" stroke="#F0514F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "שקיפות מלאה",
    desc: "אתם יודעים בכל רגע איפה התיק עומד, מה השלב הבא ומה סיכויי ההצלחה — בלי אותיות קטנות.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="#0000FF" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" stroke="#F0514F" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "מקצועיות ללא פשרות",
    desc: "מעל 100 מומחים ורופאים שמכירים את הוועדות מבפנים ובונים כל תיק ברמה הגבוהה ביותר.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.5l-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.5Z" stroke="#0000FF" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const stats = [
  { value: "+13", label: "שנות ניסיון במימוש זכויות", accent: false },
  { value: "+100", label: "מומחים ורופאים בצוות", accent: true },
  { value: "10,000+", label: "לקוחות שליווינו להצלחה", accent: false },
];

const steps = [
  { title: "שיחת היכרות חינם", desc: "מספרים לנו על המצב הרפואי — ואנחנו בודקים זכאות ראשונית, ללא עלות.", style: "bg-brand text-white border-brand" },
  { title: "בדיקה רפואית מקיפה", desc: "רופאי החברה עוברים על התיק הרפואי ומאתרים כל זכות אפשרית.", style: "bg-white text-brand border-brand" },
  { title: "בניית התיק והגשה", desc: "אנחנו אוספים מסמכים, ממלאים טפסים ומגישים לכל הגורמים.", style: "bg-white text-brand border-brand" },
  { title: "ליווי לוועדות", desc: "הכנה אישית לוועדה הרפואית וליווי צמוד עד להחלטה.", style: "bg-white text-brand border-brand" },
  { title: "הכסף אצלכם", desc: "קצבה, מענק או החזר — ורק אז משולם שכר הטרחה.", style: "bg-accent text-white border-accent" },
];

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-banner text-white">
        <div
          aria-hidden
          className="absolute -right-[120px] -top-40 h-[480px] w-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
        />
        <div className="relative mx-auto flex max-w-[1240px] flex-col justify-center gap-4.5 px-6 py-16 md:px-12 md:py-[72px]">
          <Breadcrumb
            tone="inverse"
            items={[{ label: "בית", href: "/" }, { label: "הסיפור שלנו" }]}
          />
          <Entrance>
            <h1 className="m-0 font-display text-[38px] font-light leading-[1.1] tracking-tight md:text-[60px]">
              המשימה שלנו:
              <br />
              <span className="border-b-[6px] border-accent font-black md:border-b-8">הזכויות שלכם.</span>
            </h1>
          </Entrance>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-white/90 md:text-xl">
            מאחורי כל תיק יש אדם שמתמודד עם מצב רפואי — ומולו מערכת בירוקרטית מסובכת. אנחנו כאן
            כדי שהוא לא יעמוד בה לבד.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5">
            <LeadCta sourcePage="about-hero">
              לבדיקת זכאות חינם
              <ChevronForward size={16} />
            </LeadCta>
            <a href="#process" className="px-2 py-3 text-[17px] font-bold text-white no-underline">
              איך אנחנו עובדים
            </a>
          </div>
        </div>
      </section>

      {/* story + timeline */}
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <Reveal className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div className="flex flex-col gap-3.5">
            <div className="text-[15px] font-bold tracking-wide text-accent-text">הסיפור שלנו</div>
            <h2 className="m-0 font-display text-[28px] font-light leading-tight md:text-[42px]">
              מ-2013 ועד היום: <span className="font-black">שליחות אחת.</span>
            </h2>
            <div className="mt-2.5 flex flex-col">
              {milestones.map((ms, i) => (
                <div key={ms.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${ms.dot}`} />
                    {i < milestones.length - 1 && <span className="w-0.5 flex-1 bg-hairline" />}
                  </div>
                  <div className="pb-5">
                    <div className="tnum text-lg font-black text-brand">{ms.year}</div>
                    <div className="text-base leading-normal text-ink-secondary">{ms.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4.5 text-[17px] leading-[1.75] text-ink-secondary md:text-[19px]">
            <p className="m-0">
              חברת שלכם הוקמה בשנת 2013 מתוך שליחות אמיתית:{" "}
              <b className="text-ink">לפשט את הבירוקרטיה הרפואית עבור כל אזרח בישראל.</b> ראינו
              אנשים שמתמודדים עם מחלה או פציעה — ובמקום לנוח ולהחלים, הם רודפים אחרי טפסים,
              ועדות ומכתבי דחייה.
            </p>
            <p className="m-0">
              התחלנו כחברה המשרתת את המגזר הדתי, מתוך היכרות עמוקה עם צרכי הקהילה. עם השנים
              הבנו שהבעיה משותפת לכולם — והיום אנחנו גאים להוביל את תחום מימוש הזכויות עבור כלל
              אזרחי המדינה.
            </p>
            <p className="m-0">
              מאחורי כל תיק עומד צוות של <b className="text-ink">מעל 100 מומחים ורופאים</b>:
              יועצים רפואיים, מומחי ביטוח לאומי ומס הכנסה, ומלווים אישיים שמכירים את הוועדות
              מבפנים. אנחנו לא מתחילים לגבות שקל עד שאתם מקבלים תוצאה.
            </p>
          </div>
        </Reveal>
      </section>

      {/* values */}
      <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)] md:pb-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            מה <span className="keyword-underline">מנחה אותנו</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {values.map((v, i) => (
              <Reveal
                key={v.title}
                delay={i * 0.09}
                className="flex flex-col gap-3.5 rounded-card border border-hairline bg-white px-6 py-7"
              >
                <span className="flex h-[62px] w-[62px] items-center justify-center rounded-card bg-[#eef0ff]">
                  {v.icon}
                </span>
                <div className="text-[21px] font-bold text-ink">{v.title}</div>
                <p className="m-0 text-base leading-relaxed text-ink-secondary">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats banner */}
      <section className="px-6 md:px-[clamp(24px,6.7vw,96px)]">
        <Reveal className="relative mx-auto max-w-[1240px] overflow-hidden rounded-card bg-banner px-8 py-11 text-white md:px-12">
          <div
            aria-hidden
            className="absolute -left-[100px] -top-36 h-[440px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
          />
          <div className="relative grid gap-8 text-center md:grid-cols-3">
            {stats.map((st) => (
              <div key={st.label} className="flex flex-col gap-1.5">
                <div
                  className={`tnum font-display text-[44px] font-black md:text-[58px] ${st.accent ? "text-accent-on-navy" : "text-white"}`}
                >
                  <StatValue value={st.value} />
                </div>
                <div className="text-[17px] text-white/90 md:text-[19px]">{st.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* process */}
      <section id="process" className="scroll-mt-24 px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-[72px]">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-9 max-w-[760px]">
            <h2 className="m-0 mb-3 font-display text-[26px] font-light md:text-4xl">
              איך זה עובד — <span className="keyword-underline">5 שלבים</span>
            </h2>
            <p className="m-0 text-[17px] leading-relaxed text-ink-secondary md:text-lg">
              מהשיחה הראשונה ועד הכסף בחשבון — אתם תמיד יודעים איפה התיק עומד ומה השלב הבא.
            </p>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-5 md:gap-0">
            <div aria-hidden className="absolute right-[10%] top-[29px] left-[10%] hidden h-0.5 bg-hairline md:block" />
            {steps.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.09}
                className="relative flex flex-col items-center gap-3 px-3.5 text-center"
              >
                <span
                  className={`tnum flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 text-[22px] font-black ${step.style}`}
                >
                  {i + 1}
                </span>
                <div className="text-lg font-bold leading-tight text-ink">{step.title}</div>
                <p className="m-0 text-[15px] leading-normal text-ink-muted">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* social responsibility */}
      <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)] md:pb-16">
        <Reveal className="mx-auto grid max-w-[1240px] items-center gap-8 rounded-card border border-[#f6dcdb] bg-[#fdf2f2] px-7 py-9 md:grid-cols-2 md:gap-11 md:px-12 md:py-11">
          <div className="flex flex-col gap-3.5">
            <div className="text-[15px] font-bold tracking-wide text-accent-text">אחריות חברתית</div>
            <h2 className="m-0 font-display text-[24px] font-light leading-tight md:text-[34px]">
              זכויות הן לא מותרות — <span className="font-black">הן שייכות לכולם.</span>
            </h2>
            <p className="m-0 text-[16px] leading-[1.7] text-ink-secondary md:text-lg">
              לצד הפעילות העסקית, אנחנו מלווים מדי שנה עשרות משפחות במצוקה כלכלית — ללא עלות.
              אנחנו מקיימים הרצאות חינמיות על זכויות רפואיות בקהילות, במרכזי חולים ובעמותות,
              ומפרסמים במגזין שלנו מדריכים פתוחים לכולם.
            </p>
            <div className="mt-1 flex flex-wrap gap-2.5">
              {["ליווי פרו-בונו למשפחות", "הרצאות חינם בקהילה", "מדריכים פתוחים במגזין"].map((tag) => (
                <span key={tag} className="pill border border-[#f0c8c7] bg-white px-4 py-2 text-[15px] text-ink-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden h-[320px] items-center justify-center rounded-[14px] bg-white/60 md:flex">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3.5A5 5 0 0 1 21 11c-2 4.5-9 9-9 9Z" stroke="#F0514F" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
        </Reveal>
      </section>

      <PageCta />
    </>
  );
}
