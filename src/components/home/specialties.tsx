"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/shared/reveal";
import { ArrowForward } from "@/components/shared/icons";
import { useLeadModal } from "@/components/shared/lead-modal";
import { cn } from "@/lib/utils";

type Cat = "A" | "B" | "C" | "D";

const categories: { key: Cat | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "A", label: "קצבאות ביטוח לאומי" },
  { key: "B", label: "עבודה ותאונות" },
  { key: "C", label: "ביטוח ופנסיה" },
  { key: "D", label: "הטבות ופטורים" },
];
const catLabel = Object.fromEntries(categories.map((c) => [c.key, c.label])) as Record<Cat, string>;

const BL = "/institutions/bituach-leumi";

/** 14 תחומי הפעילות (designs/homepage-v3.html) — כל אחד מוביל לעמוד שבאמת מטפל בזכות. */
const specialties: { name: string; cat: Cat; who: string; href: string }[] = [
  { name: "קצבת נכות כללית", cat: "A", who: "מחלה או פגיעה שמגבילה את היכולת לעבוד", href: BL },
  { name: "שירותים מיוחדים", cat: "A", who: "מי שזקוק לעזרה צמודה בפעולות היומיום", href: BL },
  { name: "ילד נכה", cat: "A", who: "הורים לילד עם מצב רפואי מורכב", href: BL },
  { name: "נפגעי פעולות איבה", cat: "A", who: "מי שנפגע בפיגוע או במעשה איבה", href: BL },
  { name: "זכויות אלמנים ויתומים", cat: "A", who: "בני משפחה של מי שנפטר", href: BL },
  { name: "תאונת עבודה", cat: "B", who: "פגיעה בזמן העבודה או בדרך אליה", href: BL },
  { name: "מחלת מקצוע", cat: "B", who: "מחלה שנגרמה מתנאי העבודה", href: BL },
  { name: "שמירת הריון", cat: "B", who: "הריון בסיכון שמונע עבודה", href: BL },
  { name: "תאונות אישיות", cat: "B", who: "מבוטחים שנפגעו בתאונה", href: "/institutions/hevrot-bituach" },
  { name: "אובדן כושר עבודה", cat: "C", who: "לא יכולים לחזור לעבודה ויש פוליסה", href: "/institutions/karnot-pensia" },
  { name: "פנסיית נכות", cat: "C", who: "חברי קרן פנסיה שכושר העבודה נפגע", href: "/institutions/karnot-pensia" },
  { name: "ביטוח סיעודי", cat: "C", who: "זקוקים לעזרה ביומיום — ביטוח לאומי או פרטי", href: "/institutions/hevrot-bituach" },
  { name: "פטור ממס הכנסה", cat: "D", who: "נכות רפואית גבוהה (90% ומעלה)", href: "/services/tax-exemption" },
  { name: "תג חניה לנכה", cat: "D", who: "מוגבלות בניידות", href: "/institutions/misrad-harishui" },
];

function CatIcon({ cat }: { cat: Cat }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {cat === "A" && (
        <>
          <ellipse cx="12" cy="6.5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.9" />
          <path d="M5 6.5V12c0 1.7 3.1 3 7 3s7-1.3 7-3V6.5M5 12v5.5c0 1.7 3.1 3 7 3s7-1.3 7-3V12" stroke="currentColor" strokeWidth="1.9" />
        </>
      )}
      {cat === "B" && (
        <>
          <rect x="3.5" y="8" width="17" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.9" />
          <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M3.5 13h17" stroke="currentColor" strokeWidth="1.9" />
        </>
      )}
      {cat === "C" && (
        <>
          <path d="M12 3 19.5 6v5.2c0 4.8-3.3 8.1-7.5 9.8-4.2-1.7-7.5-5-7.5-9.8V6Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="m8.8 12 2.2 2.2 4.2-4.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {cat === "D" && (
        <>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
          <path d="M9 15l6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="9.3" cy="9.3" r="1.3" fill="currentColor" />
          <circle cx="14.7" cy="14.7" r="1.3" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/**
 * תחומי פעילות (designs/homepage-v3.html) — סינון לפי קטגוריה,
 * אריחים 4 בשורה בדסקטופ / שורות במובייל, ואריח שחור "לא בטוחים?".
 */
export function Specialties() {
  const [cat, setCat] = useState<Cat | "all">("all");
  const { openLeadForm } = useLeadModal();
  const view = cat === "all" ? specialties : specialties.filter((s) => s.cat === cat);

  return (
    <section
      id="specialties"
      className="scroll-mt-24 pb-2 pt-14 md:px-[clamp(24px,5vw,72px)] md:pb-24 md:pt-[104px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Reveal className="mb-4 flex flex-col gap-4 px-[18px] md:mb-7 md:flex-row md:items-end md:justify-between md:gap-12 md:px-0">
          <div className="max-w-[720px]">
            <div className="mb-2 text-sm font-black tracking-[1px] text-brand md:mb-3 md:text-[15px]">
              תחומי פעילות
            </div>
            <h2 className="m-0 mb-2.5 font-display text-[30px] font-light leading-[1.15] text-ink md:mb-4 md:text-[48px] md:leading-[1.06] md:tracking-[-0.5px]">
              המומחים שלכם <b className="font-black">במימוש זכויות רפואיות</b>
            </h2>
            <p className="m-0 text-base leading-relaxed text-ink-secondary md:text-[19px]">
              בחרו נושא — ותראו מיד למי כל זכות מתאימה.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLeadForm("home-specialties")}
            className="hidden shrink-0 cursor-pointer rounded-[10px] border-none bg-brand px-[30px] py-4 text-[17px] font-bold text-white transition-colors hover:bg-brand-hover md:block"
          >
            לבדיקה ראשונית חינם
          </button>
        </Reveal>

        <div
          role="group"
          aria-label="סינון לפי קטגוריה"
          className="no-scrollbar flex gap-2 overflow-x-auto px-[18px] pb-3.5 md:mb-6 md:flex-wrap md:gap-2.5 md:overflow-visible md:px-0 md:pb-0"
        >
          {categories.map((c) => {
            const active = c.key === cat;
            const count = c.key === "all" ? specialties.length : specialties.filter((s) => s.cat === c.key).length;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCat(c.key)}
                className={cn(
                  "flex min-h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2.5 text-[15px] font-bold transition-colors md:px-5 md:text-base",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-hairline bg-white text-ink hover:border-brand",
                )}
              >
                {c.label}
                <span className="tnum text-[13px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <ul
          aria-live="polite"
          className="m-0 flex list-none flex-col gap-2 px-[18px] md:grid md:grid-cols-2 md:gap-3.5 md:px-0 lg:grid-cols-4"
        >
          {view.map((s) => (
            <li key={s.name}>
              <Link
                href={s.href}
                className="group grid min-h-[72px] grid-cols-[46px_1fr_18px] items-center gap-3.5 rounded-[14px] border-[1.5px] border-surface bg-surface p-3.5 text-ink no-underline transition-[border-color,background-color,transform] duration-200 hover:border-brand hover:bg-white md:flex md:h-full md:min-h-[168px] md:flex-col md:items-stretch md:gap-3 md:rounded-2xl md:p-5 md:hover:-translate-y-[3px]"
              >
                <span className="flex items-start justify-between">
                  <span className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-white text-brand md:h-12 md:w-12">
                    <CatIcon cat={s.cat} />
                  </span>
                  <span className="hidden rounded-full bg-surface-tag px-2.5 py-1 text-xs font-bold text-brand md:inline">
                    {catLabel[s.cat]}
                  </span>
                </span>
                <span className="flex flex-col gap-[3px] md:contents">
                  <span className="text-[17px] font-black leading-tight md:mt-auto md:text-[21px]">{s.name}</span>
                  <span className="text-sm leading-snug text-ink-muted md:hidden">{s.who}</span>
                </span>
                <span className="text-brand md:hidden">
                  <ArrowForward size={18} />
                </span>
                <span className="hidden items-end justify-between gap-2.5 md:flex">
                  <span className="text-[15px] leading-snug text-ink-muted">{s.who}</span>
                  <span className="shrink-0 text-brand">
                    <ArrowForward size={20} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-[18px] md:px-0">
          <button
            type="button"
            onClick={() => openLeadForm("home-specialties-unsure")}
            className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] border-none bg-ink p-[18px] text-start text-white md:mt-3.5 md:gap-5 md:rounded-2xl md:px-7 md:py-[22px]"
          >
            <span className="text-[17px] font-bold md:font-display md:text-[26px] md:font-light">
              לא בטוחים מה מגיע לכם?{" "}
              <b className="font-bold text-gold md:font-black">זו העבודה שלנו.</b>
            </span>
            <span className="flex shrink-0 items-center justify-center text-gold md:h-[52px] md:w-[52px] md:rounded-full md:bg-gold md:text-ink">
              <ArrowForward size={20} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
