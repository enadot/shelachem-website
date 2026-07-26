import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

/** באנר אדום — "כנראה שמגיע לכם הרבה יותר" (homepage-live.html §3). */
export function RedBanner() {
  return (
    <section className="px-6 pt-16 md:px-[clamp(24px,6.7vw,96px)] md:pt-[88px]">
      <Reveal className="mx-auto max-w-[1240px] rounded-xl bg-accent px-6 py-12 text-center md:px-20 md:py-16">
        <h2 className="m-0 mb-5 font-display text-[26px] font-light tracking-tight text-white md:text-[40px]">
          כנראה שמגיע לכם הרבה יותר ממה שאתם חושבים.
        </h2>
        <p className="mx-auto my-0 max-w-[820px] text-lg leading-relaxed text-white md:text-[21px]">
          כמה שאלות קצרות, ואנחנו נגיד לכם בדיוק איפה אתם עומדים.
        </p>
        <Link
          href="/#lead-form"
          className="mt-6 inline-block text-lg font-bold text-white underline decoration-2 underline-offset-4 md:text-xl"
        >
          אשמח לדעת ←
        </Link>
      </Reveal>
    </section>
  );
}

/** פסקת המהות — "מימוש זכויות רפואיות: הופכים את הזכות שלכם למציאות" (§ intro). */
export function Essence() {
  return (
    <section className="px-6 pt-16 md:px-[clamp(24px,6.7vw,96px)] md:pt-[88px]">
      <Reveal className="mx-auto max-w-[880px] text-center">
        <SectionHeading
          strong="הופכים את הזכות שלכם למציאות."
          className="mb-5 text-[28px] leading-tight md:text-[38px]"
        >
          מימוש זכויות רפואיות:
        </SectionHeading>
        <p className="m-0 text-[17px] leading-[1.7] text-ink-secondary md:text-[19px]">
          הדרך לקבלת הקצבאות והפיצויים המגיעים לכם על פי חוק לא חייבת להיות מאבק. למרות שמדובר
          בזכויות בסיסיות, הבירוקרטיה המורכבת וחוסר הידע גורמים לרבים לוותר מראש על כסף שמגיע
          להם. בשלכם, אנחנו מאמינים שאף אדם לא צריך להתמודד לבד מול גופים גדולים כמו ביטוח לאומי
          או חברות הביטוח. אנחנו כאן כדי לגשר על הפער שבין המצב הרפואי לבין המענק הכספי, עם
          ליווי אישי וניסיון שפותח דלתות.
        </p>
      </Reveal>
    </section>
  );
}

const institutionsIcons: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "ביטוח לאומי",
    href: "/institutions/bituach-leumi",
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="12.5" rx="1.8" fill="#ffffff" />
        <rect x="10.8" y="16.5" width="2.4" height="2.6" fill="#ffffff" />
        <rect x="7.5" y="19" width="9" height="2.2" rx="1" fill="#F0514F" />
      </>
    ),
  },
  {
    label: "מס הכנסה",
    href: "/institutions/mas-hachnasa",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" fill="#ffffff" />
        <rect x="3" y="9.5" width="18" height="1.8" fill="#122680" />
        <rect x="6.5" y="2" width="2.2" height="5" rx="1" fill="#F0514F" />
        <rect x="11" y="2" width="2.2" height="5" rx="1" fill="#F0514F" />
        <rect x="15.5" y="2" width="2.2" height="5" rx="1" fill="#F0514F" />
      </>
    ),
  },
  {
    label: "קרנות פנסיה",
    href: "/institutions/karnot-pensia",
    icon: (
      <>
        <path d="M9 7 L9 21 L12.6 17.6 L14.8 22.2 L17.2 21.1 L15 16.6 L19.8 16 Z" fill="#ffffff" />
        <line x1="8" y1="4.5" x2="6.5" y2="3" stroke="#F0514F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="11" y1="3.8" x2="11" y2="1.8" stroke="#F0514F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="6.8" y1="7.5" x2="4.8" y2="7.5" stroke="#F0514F" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "חברות ביטוח",
    href: "/institutions/hevrot-bituach",
    icon: (
      <>
        <path d="M12 3 L17.5 18 L6.5 18 Z" fill="#ffffff" />
        <path d="M10.1 8.2 L13.9 8.2 L14.9 11 L9.1 11 Z" fill="#F0514F" />
        <rect x="3.5" y="18" width="17" height="2.4" rx="1.2" fill="#ffffff" />
      </>
    ),
  },
  {
    label: "משרד הרישוי",
    href: "/institutions/misrad-harishui",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2.4" />
        <line x1="12" y1="4.5" x2="12" y2="19.5" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="4.5" y1="12" x2="19.5" y2="12" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="6.7" y1="6.7" x2="17.3" y2="17.3" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="17.3" y1="6.7" x2="6.7" y2="17.3" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" fill="#F0514F" stroke="#ffffff" strokeWidth="1.5" />
      </>
    ),
  },
];

/** באנר מוסדות נייבי עם 5 אייקונים עגולים (homepage-live.html §6). */
export function InstitutionsBanner() {
  return (
    <section className="px-6 pb-16 md:px-[clamp(24px,6.7vw,96px)] md:pb-24">
      <Reveal className="relative mx-auto flex max-w-[1240px] flex-col items-start gap-8 overflow-hidden rounded-2xl bg-banner px-7 py-10 md:flex-row md:items-center md:justify-between md:gap-12 md:px-[72px] md:py-14">
        <div
          aria-hidden
          className="absolute -left-20 -top-36 h-[575px] w-[1282px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)",
          }}
        />
        <h3 className="relative m-0 shrink-0 font-display text-[26px] font-normal leading-tight text-white md:text-[34px]">
          מוסדות ובירוקרטיה
        </h3>
        <div className="relative flex flex-wrap items-start justify-start gap-6 md:justify-end md:gap-7">
          {institutionsIcons.map((inst) => (
            <Link
              key={inst.label}
              href={inst.href}
              className="flex w-[96px] flex-col items-center gap-3 no-underline md:w-[108px]"
            >
              <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white/[0.14] transition-colors hover:bg-white/[0.26] md:h-[84px] md:w-[84px]">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {inst.icon}
                </svg>
              </span>
              <span className="text-center text-base font-bold text-white md:text-[17px]">
                {inst.label}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
