"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/admin/ui/sidebar";
import { Separator } from "@/components/admin/ui/separator";
import { Button } from "@/components/admin/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/admin/ui/breadcrumb";
import { CONTENT_NAV } from "@/lib/admin/nav";

const LABELS: Record<string, string> = {
  leads: "לידים",
  marketing: "שיווק ופיקסלים",
  settings: "הגדרות אתר",
  users: "משתמשים",
  content: "תוכן האתר",
  "change-password": "החלפת סיסמה",
};
const CONTENT = Object.fromEntries(CONTENT_NAV.map((c) => [c.slug, c.label]));

/** פירורי לחם מתוך הנתיב: /admin/content/faqs/12 → סקירה › שאלות נפוצות › עריכה. */
function crumbs(pathname: string) {
  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const out: { href: string; label: string }[] = [{ href: "/admin", label: "סקירה" }];
  if (parts[0] === "content" && parts[1]) {
    out.push({ href: `/admin/content/${parts[1]}`, label: CONTENT[parts[1]] ?? parts[1] });
    if (parts[2]) out.push({ href: pathname, label: parts[2] === "new" ? "פריט חדש" : "עריכה" });
    return out;
  }
  if (parts[0]) out.push({ href: `/admin/${parts[0]}`, label: LABELS[parts[0]] ?? parts[0] });
  if (parts[0] === "leads" && parts[1]) out.push({ href: pathname, label: `ליד #${parts[1]}` });
  return out;
}

export function AppHeader() {
  const pathname = usePathname();
  const items = crumbs(pathname);
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/90 px-3 backdrop-blur md:rounded-t-xl md:px-5">
      <SidebarTrigger className="-ms-1 size-9" aria-label="תפריט" />
      <Separator orientation="vertical" className="me-1 data-[orientation=vertical]:h-5" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap text-[14px]">
          {items.map((c, i) => (
            <Fragment key={c.href + i}>
              {i > 0 && (
                <BreadcrumbSeparator className="hidden md:block">
                  <ChevronLeft />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem className={i < items.length - 1 ? "hidden md:inline-flex" : "min-w-0"}>
                {i === items.length - 1 ? (
                  <BreadcrumbPage className="truncate font-bold">{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
        <a href="/" target="_blank" rel="noopener">
          <ExternalLink aria-hidden />
          צפייה באתר
        </a>
      </Button>
    </header>
  );
}
