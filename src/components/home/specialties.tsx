import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArrowForward } from "@/components/shared/icons";

/** 14 תחומי ההתמחות — צ'יפים לבנים pill עם אייקון קו (homepage-live.html §2). */
const specialties: { label: string; icon: React.ReactNode }[] = [
  {
    label: "פטור ממס הכנסה",
    icon: (
      <Chip>
        <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="7.5" cy="7.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.5" cy="16.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </Chip>
    ),
  },
  {
    label: "קצבת נכות כללית",
    icon: (
      <Chip>
        <ellipse cx="12" cy="6.5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 6.5V12c0 1.7 3.1 3 7 3s7-1.3 7-3V6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 12v5.5c0 1.7 3.1 3 7 3s7-1.3 7-3V12" stroke="currentColor" strokeWidth="1.8" />
      </Chip>
    ),
  },
  {
    label: "אובדן כושר עבודה",
    icon: (
      <Chip>
        <rect x="3.5" y="8" width="17" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.8" />
        <line x1="3.5" y1="13" x2="20.5" y2="13" stroke="currentColor" strokeWidth="1.8" />
      </Chip>
    ),
  },
  {
    label: "פנסיית נכות",
    icon: (
      <Chip>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5V12l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </Chip>
    ),
  },
  {
    label: "ביטוח סיעודי (ביטוח לאומי וחברות ביטוח)",
    icon: (
      <Chip>
        <path
          d="M12 20C6 15.5 3.5 12.5 3.5 9.4 3.5 7 5.4 5 7.9 5c1.7 0 3.2.9 4.1 2.3C12.9 5.9 14.4 5 16.1 5c2.5 0 4.4 2 4.4 4.4 0 3.1-2.5 6.1-8.5 10.6Z"
          fill="currentColor"
        />
      </Chip>
    ),
  },
  {
    label: "מחלת מקצוע",
    icon: (
      <Chip>
        <path
          d="M10 3.5h4M11 3.5V9l-5 8.3a2 2 0 0 0 1.7 3.2h8.6a2 2 0 0 0 1.7-3.2L13 9V3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Chip>
    ),
  },
  {
    label: "תאונת עבודה",
    icon: (
      <Chip>
        <path d="M12 4 21 19.5H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="12" y1="10" x2="12" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      </Chip>
    ),
  },
  {
    label: "שמירת הריון",
    icon: (
      <Chip>
        <circle cx="11.5" cy="5.2" r="2.2" fill="currentColor" />
        <path d="M9.8 8.8V21h2.4v-3.4h.6a4.3 4.3 0 0 0 0-8.6Z" fill="currentColor" />
      </Chip>
    ),
  },
  {
    label: "ילד נכה",
    icon: (
      <Chip>
        <circle cx="12" cy="6" r="2.5" fill="currentColor" />
        <rect x="8.8" y="10" width="6.4" height="8.5" rx="3.2" fill="currentColor" />
      </Chip>
    ),
  },
  {
    label: "שירותים מיוחדים",
    icon: (
      <Chip>
        <polygon
          points="12 3.5 14.6 9 20.5 9.7 16.2 13.8 17.3 19.7 12 16.8 6.7 19.7 7.8 13.8 3.5 9.7 9.4 9"
          fill="currentColor"
        />
      </Chip>
    ),
  },
  {
    label: "נפגעי פעולות איבה",
    icon: (
      <Chip>
        <path
          d="M12 3 19.5 6v5.2c0 4.8-3.3 8.1-7.5 9.8-4.2-1.7-7.5-5-7.5-9.8V6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </Chip>
    ),
  },
  {
    label: "זכויות אלמנים ויתומים",
    icon: (
      <Chip>
        <path
          d="M4.5 11.5 12 4.5l7.5 7V20h-5v-5h-5v5h-5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </Chip>
    ),
  },
  {
    label: "תאונות אישיות",
    icon: (
      <Chip>
        <rect
          x="2.8"
          y="9"
          width="18.4"
          height="6"
          rx="3"
          transform="rotate(-35 12 12)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="11" cy="12.6" r="0.9" fill="currentColor" />
        <circle cx="13" cy="11.4" r="0.9" fill="currentColor" />
      </Chip>
    ),
  },
  {
    label: "תג חניה לנכה",
    icon: (
      <Chip>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 17V7.5h3.7a3 3 0 0 1 0 6H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </Chip>
    ),
  },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="-mb-[3.5px] me-2 inline-block"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * 14 התחומים מקובצים ל-5 מוסדות — בחירה ברמה הראשונה מוגבלת ל-5 אפשרויות
 * (במקום 14), וכל אפשרות היא קישור אמיתי לעמוד המוסד. הצ'יפים עצמם הם פירוט
 * בתוך הכרטיס ולא יעדי לחיצה, כך שאין hover על מה שאינו אינטראקטיבי.
 */
const groups: { title: string; href: string; blurb: string; labels: string[] }[] = [
  {
    title: "ביטוח לאומי",
    href: "/institutions/bituach-leumi",
    blurb: "קצבאות, ועדות רפואיות ועררים — רוב הזכויות מתחילות כאן.",
    labels: [
      "קצבת נכות כללית",
      "שירותים מיוחדים",
      "ילד נכה",
      "תאונת עבודה",
      "מחלת מקצוע",
      "שמירת הריון",
      "נפגעי פעולות איבה",
      "זכויות אלמנים ויתומים",
    ],
  },
  {
    title: "מס הכנסה",
    href: "/institutions/mas-hachnasa",
    blurb: "פטור ממס מטעמי בריאות, כולל החזרים עד 6 שנים אחורה.",
    labels: ["פטור ממס הכנסה"],
  },
  {
    title: "קרנות פנסיה",
    href: "/institutions/karnot-pensia",
    blurb: "מי שאינו יכול להמשיך לעבוד זכאי לקצבה מהקרן — במקביל לקצבאות אחרות.",
    labels: ["אובדן כושר עבודה", "פנסיית נכות"],
  },
  {
    title: "חברות ביטוח",
    href: "/institutions/hevrot-bituach",
    blurb: "פוליסות פרטיות שרבים לא יודעים שהם מחזיקים — ולא תובעים.",
    labels: ["ביטוח סיעודי (ביטוח לאומי וחברות ביטוח)", "תאונות אישיות"],
  },
  {
    title: "משרד הרישוי",
    href: "/institutions/misrad-harishui",
    blurb: "ניידות: תג חניה, אגרות וכשירות רפואית לנהיגה.",
    labels: ["תג חניה לנכה"],
  },
];

const iconByLabel = new Map(specialties.map((s) => [s.label, s.icon] as const));

export function Specialties() {
  return (
    <section className="bg-surface px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-[72px]">
      <Reveal className="mx-auto max-w-[1240px]">
        <SectionHeading className="mb-4 text-[28px] md:text-[38px]">
          המומחים שלכם במימוש זכויות רפואיות
        </SectionHeading>
        <p className="m-0 mb-8 max-w-[820px] text-lg leading-relaxed text-ink-secondary md:text-xl">
          פטור ממס, קצבת נכות, אובדן כושר עבודה, סיעוד, מחלת מקצוע, שמירת הריון — מאחורי כל אחד
          מאלה עומדת זכות שמגיעה לכם. בחרו את המוסד שמולו אתם עומדים:
        </p>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {groups.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex flex-col gap-3 rounded-card border border-hairline bg-white p-6 no-underline transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-[0_14px_32px_rgba(0,55,112,0.10)] md:p-7"
            >
              <span className="font-display text-[22px] font-bold text-ink md:text-[24px]">
                {g.title}
              </span>
              <span className="text-[15px] leading-relaxed text-ink-secondary md:text-base">
                {g.blurb}
              </span>
              <span className="flex flex-wrap gap-2">
                {g.labels.map((label) => (
                  <span
                    key={label}
                    className="pill border border-hairline bg-surface px-3.5 py-1.5 text-sm text-ink-secondary md:text-[15px]"
                  >
                    {iconByLabel.get(label)}
                    {label}
                  </span>
                ))}
              </span>
              <span className="mt-auto flex items-center gap-1.5 pt-1 text-[15px] font-bold text-brand">
                לזכויות מול {g.title}
                <ArrowForward size={16} />
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
