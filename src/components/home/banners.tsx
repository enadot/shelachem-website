import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowForward } from "@/components/shared/icons";

/** פס שחור/זהב — "כנראה שמגיע לכם הרבה יותר" (designs/homepage-v3.html). */
export function GoldBand() {
  return (
    <section className="surface-navy bg-night">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-[22px] py-14 md:flex-row md:items-end md:justify-between md:gap-12 md:px-[clamp(24px,5vw,72px)] md:py-24">
        <div className="max-w-[860px]">
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 mb-3 font-display text-[32px] font-light leading-[1.12] text-white md:mb-4 md:text-[56px] md:leading-[1.04] md:tracking-[-0.02em]"
          >
            כנראה שמגיע לכם <span className="font-black text-gold">הרבה יותר</span> ממה שאתם
            חושבים.
          </Reveal>
          <p className="m-0 text-[17px] leading-relaxed text-night-text md:text-xl">
            כמה שאלות קצרות, ואנחנו נגיד לכם בדיוק איפה אתם עומדים.
          </p>
        </div>
        {/* "כמה שאלות קצרות" — מוביל לבדיקת הזכאות בשלבים שבכרטיס ההירו */}
        <a
          href="#lead-form"
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-[10px] bg-gold px-7 py-4 text-[17px] font-bold text-ink no-underline transition-colors duration-300 hover:bg-gold-hover hover:text-ink md:px-9 md:py-5 md:text-lg"
        >
          אשמח לדעת
          <ArrowForward size={18} className="nudge" />
        </a>
      </div>
    </section>
  );
}

const institutions = [
  { label: "ביטוח לאומי", href: "/institutions/bituach-leumi" },
  { label: "מס הכנסה", href: "/institutions/mas-hachnasa" },
  { label: "קרנות פנסיה", href: "/institutions/karnot-pensia" },
  { label: "חברות ביטוח", href: "/institutions/hevrot-bituach" },
];

/**
 * מוסדות ובירוקרטיה — ארבע עמודות טיפוגרפיות מופרדות בקווי שיער (בדסקטופ),
 * שורות במובייל. ריחוף: הרקע מתמלא בלבן והחץ זז — בלי הרמת כרטיסים.
 */
export function InstitutionsBanner() {
  return (
    <section className="bg-surface px-[22px] py-16 md:px-[clamp(24px,5vw,72px)] md:py-[120px]">
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="03">מוסדות ובירוקרטיה</Eyebrow>
        <div className="mb-8 mt-6 flex flex-col gap-4 md:mb-12 md:mt-8 md:flex-row md:items-end md:justify-between">
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 font-display text-[32px] font-light leading-[1.1] text-ink md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
          >
            מול מי <b className="font-black">אנחנו עומדים בשבילכם</b>
          </Reveal>
          <Link
            href="/institutions"
            className="group inline-flex items-center gap-2 self-start text-base font-bold text-brand no-underline md:self-auto md:text-[17px]"
          >
            <span className="link-draw">לכל המוסדות</span>
            <ArrowForward size={16} className="nudge" />
          </Link>
        </div>
        <Reveal
          as="ul"
          variant="stagger"
          className="m-0 grid list-none border-y border-hairline p-0 md:grid-cols-4"
        >
          {institutions.map((inst, i) => (
            <li
              key={inst.href}
              className="border-hairline [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-r md:[&:not(:first-child)]:border-t-0"
            >
              <Link
                href={inst.href}
                className="group flex items-center justify-between gap-3 py-5 text-ink no-underline transition-colors duration-500 hover:bg-white md:h-full md:min-h-[200px] md:flex-col md:items-stretch md:px-6 md:py-7"
              >
                <span className="tnum hidden text-[13px] font-bold text-ink-faint md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[22px] font-black leading-tight md:mt-auto md:text-[26px]">
                  {inst.label}
                </span>
                <span className="text-brand">
                  <ArrowForward size={20} className="nudge" />
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
