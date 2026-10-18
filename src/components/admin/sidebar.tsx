"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  KeyRound,
  Users,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_NAV } from "@/lib/admin/nav";
import { logoutAction } from "@/app/admin/actions";

const MAIN = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "לידים", icon: Inbox },
  { href: "/admin/marketing", label: "שיווק ופיקסלים", icon: Megaphone },
  { href: "/admin/settings", label: "הגדרות אתר", icon: Settings },
];

/** סרגל צד ברויאל (במובייל — מגירה). */
export function Sidebar({ userName, isAdmin }: { userName: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const link = (active: boolean) =>
    cn(
      "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15.5px] no-underline transition-colors",
      active ? "bg-white font-bold text-brand" : "text-white/90 hover:bg-white/10",
    );

  const main = isAdmin ? [...MAIN, { href: "/admin/users", label: "משתמשים", icon: Users }] : MAIN;
  const nav = (
    <nav aria-label="ניווט לוח הבקרה" className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {main.map(({ href, label, icon: Icon, exact }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)} className={link(isActive(href, exact))}>
          <Icon size={18} aria-hidden />
          {label}
        </Link>
      ))}
      <p className="m-0 mb-1 mt-5 flex items-center gap-2 px-3 text-[12.5px] font-bold tracking-[0.06em] text-on-royal-muted">
        <FileText size={14} aria-hidden />
        תוכן האתר
      </p>
      {CONTENT_NAV.map(({ slug, label }) => {
        const href = `/admin/content/${slug}`;
        return (
          <Link key={slug} href={href} onClick={() => setOpen(false)} className={cn(link(isActive(href)), "ps-9")}>
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-4 flex flex-col gap-1 border-t border-white/15 pt-4">
      <a href="/" target="_blank" rel="noopener" className={link(false)}>
        <ExternalLink size={18} aria-hidden />
        צפייה באתר
      </a>
      <Link href="/admin/change-password" onClick={() => setOpen(false)} className={link(isActive("/admin/change-password"))}>
        <KeyRound size={18} aria-hidden />
        החלפת סיסמה
      </Link>
      <form action={logoutAction}>
        <button type="submit" className={cn(link(false), "w-full cursor-pointer border-none bg-transparent")}>
          <LogOut size={18} aria-hidden />
          יציאה
        </button>
      </form>
      <p className="m-0 truncate px-3 pt-2 text-[13px] text-on-royal-muted">{userName}</p>
    </div>
  );

  return (
    <>
      {/* מובייל — פס עליון */}
      <div className="brand-gradient sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden">
        <Image src="/images/logo-white.svg" alt="שלכם — לוח בקרה" width={92} height={38} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת התפריט"
          aria-expanded={open}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-none bg-white/10 text-white"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/50 md:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <aside
        className={cn(
          "brand-gradient fixed inset-y-0 start-0 z-50 flex w-[272px] flex-col px-4 py-6 text-white transition-transform duration-300 md:sticky md:top-0 md:h-svh md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/admin" className="no-underline">
            <Image src="/images/logo-white.svg" alt="שלכם — לוח בקרה" width={118} height={49} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירת התפריט"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-white/10 text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
