import { ChartPie, FileX, Hourglass, TriangleAlert, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward } from "@/components/shared/icons";

const pitfalls: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "סיכון לדחיית התביעה",
    body: "מסמכים חסרים, חוסר היכרות עם תנאי הזכאות או הגעה לא מוכנה לוועדה הרפואית — כל אלה עלולים להוביל לדחייה.",
    Icon: TriangleAlert,
  },
  {
    title: "זכאות חלקית בלבד",
    body: "בלי ליווי מקצועי, עלולים לקבל קצבה חלקית או לפספס זכויות נוספות שרלוונטיות למצבכם.",
    Icon: ChartPie,
  },
  {
    title: "אובדן זמן וכסף",
    body: "תהליכים מול ביטוח לאומי, מס הכנסה וחברות הביטוח עלולים להימשך זמן רב, וטיפול לא מקצועי מוסיף עיכובים.",
    Icon: Hourglass,
  },
  {
    title: "הפסד זכויות רטרואקטיביות",
    body: "מימוש זכויות באיחור עלול לעלות בחודשי זכאות רטרואקטיביים שלא יחזרו.",
    Icon: FileX,
  },
];

/**
 * למה ליווי מקצועי — ארבעה סיכונים של מימוש זכויות לבד, על רויאל.
 * רשת 2×2 מופרדת בקווי שיער לבנים (לא כרטיסים צבועים), אייקון דק בעיגול שקוף.
 * בלי מספור בכותרת-העל, כדי לא להזיז את מספור הסקשנים שאחריו.
 */
export function Pitfalls() {
  return (
    <section
      id="pitfalls"
      className="surface-navy scroll-mt-24 bg-brand px-[22px] py-16 text-white md:px-[clamp(24px,5vw,72px)] md:py-[120px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow tone="dark">למה ליווי מקצועי</Eyebrow>
        <div className="mb-10 mt-6 grid gap-5 md:mb-16 md:mt-8 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-16">
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 font-display text-[32px] font-light leading-[1.1] text-white md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
          >
            הגופים המוסדיים לא תמיד יספרו לכם{" "}
            <b className="font-black">
              אילו זכויות פתוחות בפניכם. <span className="text-gold">אנחנו כן.</span>
            </b>
          </Reveal>
          <p className="m-0 text-[17px] leading-relaxed text-on-royal-muted md:text-xl">
            הבירוקרטיה בישראל מורכבת, וטעויות קטנות עלולות לעלות לכם בכסף, בזמן ובשקט הנפשי.
          </p>
        </div>

        <Reveal
          as="ul"
          variant="stagger"
          className="m-0 grid list-none border-t border-white/15 p-0 md:grid-cols-2"
        >
          {pitfalls.map(({ title, body, Icon }) => (
            <li
              key={title}
              className="flex items-start gap-5 border-b border-white/15 py-7 md:gap-6 md:py-10 md:odd:border-e md:odd:pe-12 md:even:ps-12"
            >
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold ring-1 ring-white/20 md:size-14"
              >
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="m-0 font-display text-[21px] font-black leading-tight text-white md:text-[26px]">
                  {title}
                </h3>
                <p className="m-0 text-base leading-relaxed text-white/75 md:text-[17px]">{body}</p>
              </div>
            </li>
          ))}
        </Reveal>

        <div className="mt-10 flex flex-col items-stretch gap-6 md:mt-14 md:flex-row md:items-center md:justify-between md:gap-12">
          <p className="m-0 font-display text-[22px] font-light leading-snug text-white md:text-[28px]">
            אל תתנו לבירוקרטיה לעמוד <b className="font-black">בין לבין הזכויות שלכם.</b>
          </p>
          <LeadCta sourcePage="home-pitfalls" variant="accent" size="lg" className="group w-full shrink-0 md:w-auto">
            בדיקת זכאות חינם
            <ArrowForward size={18} className="nudge" />
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
