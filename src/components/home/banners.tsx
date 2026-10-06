"use client";

import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { ArrowForward } from "@/components/shared/icons";
import { useLeadModal } from "@/components/shared/lead-modal";

/** פס שחור/זהב — "כנראה שמגיע לכם הרבה יותר" (designs/homepage-v3.html). */
export function GoldBand() {
  const { openLeadForm } = useLeadModal();
  return (
    <section className="surface-navy mt-12 bg-night md:mt-0">
      <Reveal className="mx-auto flex max-w-[1440px] flex-col items-start gap-5 px-6 py-11 md:flex-row md:items-center md:justify-between md:gap-12 md:px-[clamp(24px,5vw,72px)] md:py-[76px]">
        <div className="max-w-[860px]">
          <h2 className="m-0 mb-3 font-display text-[30px] font-light leading-[1.2] text-white md:mb-3.5 md:text-[52px] md:leading-[1.08] md:tracking-[-0.5px]">
            כנראה שמגיע לכם <span className="font-black text-gold">הרבה יותר</span> ממה שאתם
            חושבים.
          </h2>
          <p className="m-0 text-[17px] leading-relaxed text-night-text md:text-[21px]">
            כמה שאלות קצרות, ואנחנו נגיד לכם בדיוק איפה אתם עומדים.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openLeadForm("home-gold-band")}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-gold px-[26px] py-3.5 text-[17px] font-bold text-ink transition-colors hover:bg-gold-hover md:px-[38px] md:py-[19px] md:text-[19px]"
        >
          אשמח לדעת
          <ArrowForward size={18} />
        </button>
      </Reveal>
    </section>
  );
}

const institutions = [
  { label: "ביטוח לאומי", href: "/institutions/bituach-leumi" },
  { label: "מס הכנסה", href: "/institutions/mas-hachnasa" },
  { label: "קרנות פנסיה", href: "/institutions/karnot-pensia" },
  { label: "חברות ביטוח", href: "/institutions/hevrot-bituach" },
  { label: "משרד הרישוי", href: "/institutions/misrad-harishui" },
];

/** מוסדות ובירוקרטיה — 5 אריחים ממוספרים על רקע בהיר (designs/homepage-v3.html). */
export function InstitutionsBanner() {
  return (
    <section className="bg-surface px-[18px] py-11 md:px-[clamp(24px,5vw,72px)] md:py-20">
      <Reveal className="mx-auto grid max-w-[1296px] items-center gap-[18px] md:grid-cols-[300px_1fr] md:gap-12">
        <div>
          <h2 className="m-0 font-display text-[26px] font-black leading-[1.05] text-ink md:mb-3 md:text-[40px]">
            מוסדות <br className="hidden md:block" />
            ובירוקרטיה
          </h2>
          <Link
            href="/institutions"
            className="hidden items-center gap-1.5 text-[17px] font-bold text-brand no-underline hover:underline md:inline-flex"
          >
            לכל המוסדות
            <ArrowForward size={16} />
          </Link>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 md:grid md:grid-cols-5 md:gap-3.5">
          {institutions.map((inst, i) => (
            <li key={inst.href}>
              <Link
                href={inst.href}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-[18px] py-4 text-ink no-underline transition-[transform,box-shadow] duration-200 md:h-full md:min-h-[150px] md:flex-col md:items-stretch md:gap-3.5 md:rounded-[14px] md:px-[22px] md:py-[26px] md:hover:-translate-y-1 md:hover:shadow-[rgba(18,40,168,0.14)_0_16px_32px]"
              >
                <span className="tnum hidden text-sm font-black text-brand md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-2 md:mt-auto md:gap-3.5">
                  <span className="text-lg font-black md:text-[21px]">{inst.label}</span>
                  <span aria-hidden className="brush-royal h-1.5 w-[90px] md:h-2 md:w-4/5" />
                </span>
                <span className="text-brand md:hidden">
                  <ArrowForward size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
