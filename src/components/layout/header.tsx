"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/config";
import { useLeadModal } from "@/components/shared/lead-modal";
import { PhoneIcon } from "./contact-modal";
import { MobileMenu } from "./mobile-menu";

export const navLinks = [
  { href: "/", label: "בית" },
  { href: "/about", label: "הסיפור שלנו" },
  { href: "/#specialties", label: "תחומי פעילות" },
  { href: "/institutions", label: "מוסדות ובירוקרטיה" },
  { href: "/#how-it-works", label: "איך זה עובד" },
  { href: "/magazine", label: "מגזין" },
] as const;

/**
 * `/services/*` הוא עמוד-בן של `/institutions` בהיררכיה (וכך הוא מוצג בפירורי
 * הלחם), אבל עד כה שום פריט בניווט לא נדלק שם — בדיוק בעמוד עם כוונת הרכישה
 * הגבוהה ביותר המשתמש לא ידע איפה הוא נמצא.
 */
const activeSection = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  if (href === "/institutions")
    return pathname.startsWith("/institutions") || pathname.startsWith("/services");
  return pathname.startsWith(href);
};

export function Header() {
  const pathname = usePathname();
  const { openLeadForm } = useLeadModal();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    /**
     * `sticky` — עמוד הבית הוא ~9,500px, ובדסקטופ לא היה שום CTA זמין בגלילה
     * (במובייל יש בר תחתון). ההדר קומפקטי (לוגו 44px, py-3) כדי שהנוכחות
     * הקבועה לא תגזול גובה, ובלי מאזין scroll ב-JS.
     * v3 (designs/homepage-v3.html): לוגו 2026, ניווט בדיו עם רויאל לפריט הפעיל, CTA רויאל.
     */
    <header className="sticky top-0 z-30 border-b border-hairline-soft bg-white/95 backdrop-blur">
      {/* Desktop nav */}
      <nav
        aria-label="ניווט ראשי"
        className="relative hidden items-center gap-[clamp(20px,3vw,44px)] px-[clamp(20px,5vw,72px)] py-1.5 md:flex"
      >
        <Link href="/" aria-label="שלכם — לעמוד הבית" className="shrink-0">
          <Image
            src="/images/logo-2026.png"
            alt="שלכם — מימוש זכויות רפואיות"
            width={725}
            height={371}
            className="h-[64px] w-auto"
            priority
          />
        </Link>
        <div className="flex flex-1 items-center gap-[clamp(14px,2.2vw,34px)] text-[17px] text-ink-secondary">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={activeSection(pathname, l.href) ? "page" : undefined}
              className={
                activeSection(pathname, l.href)
                  ? "font-black text-brand no-underline"
                  : "text-ink-secondary no-underline transition-colors hover:text-brand"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ms-auto flex items-center gap-4">
          <a
            href={site.phoneHref}
            className="tnum flex items-center gap-2 whitespace-nowrap text-[18px] font-black text-ink no-underline"
            aria-label={`חייגו אלינו: ${site.phone}`}
          >
            <span className="text-brand"><PhoneIcon size={18} /></span>
            {site.phone}
          </a>
          <button
            onClick={() => openLeadForm("header")}
            className="cursor-pointer whitespace-nowrap rounded-[10px] bg-brand px-[26px] py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-hover"
          >
            בדיקת זכאות חינם
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav
        aria-label="ניווט ראשי"
        className="relative flex items-center justify-between gap-3 px-3.5 py-1 md:hidden"
      >
        <button
          aria-label="תפריט"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 cursor-pointer flex-col justify-center gap-[5px] p-2.5"
        >
          <span className="block h-[2.5px] w-[22px] rounded-sm bg-ink" />
          <span className="block h-[2.5px] w-[22px] rounded-sm bg-ink" />
          <span className="block h-[2.5px] w-[14px] rounded-sm bg-brand" />
        </button>
        <Link href="/" aria-label="שלכם — לעמוד הבית">
          <Image
            src="/images/logo-2026.png"
            alt="שלכם — מימוש זכויות רפואיות"
            width={725}
            height={371}
            className="h-[52px] w-auto"
            priority
          />
        </Link>
        {/*
          במובייל העיגול מחייג ישירות. קודם הוא פתח מודאל בחירת ערוץ — צעד מיותר
          בדיוק עבור מי שרוצה רק לדבר עם בן אדם (פרסונת רבקה). בדסקטופ, שבו אין
          חיוג, המודאל נשאר הבחירה הנכונה.
        */}
        <a
          href={site.phoneHref}
          aria-label={`חייגו אלינו: ${site.phone}`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white no-underline"
        >
          <PhoneIcon />
        </a>
      </nav>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
