"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowForward } from "@/components/shared/icons";
import { useLeadModal } from "@/components/shared/lead-modal";
import { quietTab } from "@/lib/quiet-tab";

type Cat = "A" | "B" | "C" | "D";

const categories: { key: Cat | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "A", label: "קצבאות ביטוח לאומי" },
  { key: "B", label: "עבודה ותאונות" },
  { key: "C", label: "ביטוח ופנסיה" },
  { key: "D", label: "הטבות ופטורים" },
];
/** כמה תחומים מוצגים לפני "הצגת כל התחומים" (בתצוגת "הכל" בלבד). */
const INITIAL = 6;

const BL = "/institutions/bituach-leumi";

/** 13 תחומי הפעילות (designs/homepage-v3.html) — כל אחד מוביל לעמוד שבאמת מטפל בזכות. */
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
];

/**
 * תחומי פעילות — רשימה טיפוגרפית בשתי עמודות עם קווי שיער (במקום כרטיסים
 * צבועים עם אייקונים), סינון כטאבים שקטים, 6 ראשונים ואז "הצגת הכל".
 */
export function Specialties() {
  const [cat, setCat] = useState<Cat | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const { openLeadForm } = useLeadModal();
  const filtered = cat === "all" ? specialties : specialties.filter((s) => s.cat === cat);
  const collapsed = cat === "all" && !expanded;
  const view = collapsed ? filtered.slice(0, INITIAL) : filtered;

  return (
    <section
      id="specialties"
      className="scroll-mt-24 px-[22px] pb-4 pt-16 md:px-[clamp(24px,5vw,72px)] md:pb-24 md:pt-[120px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="01">תחומי פעילות</Eyebrow>
        <div className="mb-7 mt-6 flex flex-col gap-6 md:mb-10 md:mt-8 md:gap-8">
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 max-w-[900px] font-display text-[32px] font-light leading-[1.1] text-ink md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
          >
            המומחים שלכם <b className="font-black">במימוש זכויות רפואיות</b>
          </Reveal>

          <div
            role="group"
            aria-label="סינון לפי קטגוריה"
            className="no-scrollbar -mx-[22px] flex gap-1 overflow-x-auto px-[22px] md:mx-0 md:flex-wrap md:px-0"
          >
            {categories.map((c) => {
              const active = c.key === cat;
              const count =
                c.key === "all" ? specialties.length : specialties.filter((s) => s.cat === c.key).length;
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCat(c.key);
                    setExpanded(false);
                  }}
                  className={quietTab(active)}
                >
                  {c.label}
                  {/* המונה יושב באמצע הגובה של הטאב (לא `sup` על baseline, שדחף את
                      הטקסט של הטאב הפעיל לראש הגלולה). */}
                  <span className="tnum text-xs font-bold leading-none opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ul
          key={cat}
          id="specialties-list"
          aria-live="polite"
          className="m-0 grid list-none p-0 md:grid-cols-2 md:gap-x-14"
        >
          {view.map((s, i) => (
            <li
              key={s.name}
              className="row-in border-t border-hairline"
              style={{ "--i": i } as React.CSSProperties}
            >
              <Link
                href={s.href}
                className="group grid grid-cols-[28px_1fr_auto] items-center gap-3 py-5 text-ink no-underline md:grid-cols-[40px_1fr_auto] md:gap-4 md:py-6"
              >
                <span className="tnum self-start pt-1 text-[13px] font-bold text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-[21px] font-black leading-tight transition-colors duration-300 group-hover:text-brand md:text-[26px]">
                    {s.name}
                  </span>
                  <span className="text-[15px] leading-snug text-ink-muted">{s.who}</span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white md:h-12 md:w-12">
                  <ArrowForward size={18} className="nudge" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-stretch gap-4 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between md:pt-8">
          {collapsed && filtered.length > INITIAL ? (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="specialties-list"
              onClick={() => setExpanded(true)}
              className="group inline-flex min-h-11 cursor-pointer items-center gap-2 self-start border-none bg-transparent p-0 text-base font-bold text-brand"
            >
              <span className="link-draw">הצגת כל {filtered.length} התחומים</span>
              <span aria-hidden className="text-xl leading-none transition-transform duration-300 group-hover:rotate-90">
                +
              </span>
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => openLeadForm("home-specialties-unsure")}
            className="group flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-full border-none bg-ink py-2 pe-2 ps-6 text-start text-white md:ps-7"
          >
            <span className="text-base font-bold md:text-[17px]">
              לא בטוחים מה מגיע לכם? <span className="text-gold">זו העבודה שלנו.</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
              <ArrowForward size={18} className="nudge" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
