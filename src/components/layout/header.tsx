"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/config";
import { useContactModal } from "./contact-modal-context";
import { PhoneIcon } from "./contact-modal";
import { MobileMenu } from "./mobile-menu";

export const navLinks = [
  { href: "/", label: "בית" },
  { href: "/about", label: "הסיפור שלנו" },
  { href: "/institutions", label: "תחומי פעילות" },
  { href: "/#how-it-works", label: "איך זה עובד" },
  { href: "/magazine", label: "מגזין" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { openContact } = useContactModal();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && href !== "/#how-it-works";

  return (
    <>
      {/* Desktop nav */}
      <nav className="relative z-20 hidden items-center gap-8 border-b border-hairline-soft bg-white px-[clamp(20px,3.3vw,48px)] py-4 md:flex">
        <Link href="/" aria-label="שלכם — לעמוד הבית" className="ml-8 shrink-0">
          <Image src="/images/logo.svg" alt="שלכם" width={126} height={52} className="h-[52px] w-auto" priority />
        </Link>
        <div className="flex flex-1 items-center gap-[clamp(16px,2.6vw,38px)] text-[17px] text-ink-secondary">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                isActive(l.href)
                  ? "border-b-2 border-accent pb-0.5 font-bold text-ink no-underline"
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
            className="tnum flex items-center gap-2 text-[16px] font-bold text-ink no-underline"
            aria-label={`חייגו אלינו: ${site.phone}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
              <PhoneIcon size={17} />
            </span>
            {site.phone}
          </a>
          <button
            onClick={openContact}
            className="cursor-pointer rounded-full bg-brand px-[26px] py-3 text-[17px] font-bold text-white shadow-[rgba(0,0,255,0.22)_0_8px_20px] transition-colors hover:bg-brand-hover"
          >
            דברו איתנו
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="relative z-20 flex items-center justify-between gap-3 border-b border-hairline-soft bg-white px-5 py-3.5 md:hidden">
        <button
          aria-label="תפריט"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 cursor-pointer flex-col justify-center gap-[5px] p-2.5"
        >
          <span className="block h-[2.5px] w-[22px] rounded-sm bg-ink" />
          <span className="block h-[2.5px] w-[22px] rounded-sm bg-ink" />
          <span className="block h-[2.5px] w-[14px] rounded-sm bg-ink" />
        </button>
        <Link href="/" aria-label="שלכם — לעמוד הבית">
          <Image src="/images/logo.svg" alt="שלכם" width={97} height={40} className="h-10 w-auto" priority />
        </Link>
        <button
          onClick={openContact}
          aria-label="דברו איתנו"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-brand text-white"
        >
          <PhoneIcon />
        </button>
      </nav>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
