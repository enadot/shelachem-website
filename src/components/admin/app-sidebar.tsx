"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  ExternalLink,
  FileText,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/admin/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { CONTENT_NAV } from "@/lib/admin/nav";
import { logoutAction } from "@/app/admin/actions";
import { initials } from "@/components/admin/ui";

const MAIN = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "לידים", icon: Inbox },
];
const SITE = [
  { href: "/admin/marketing", label: "שיווק ופיקסלים", icon: Megaphone },
  { href: "/admin/settings", label: "הגדרות אתר", icon: Settings },
];

/** סרגל הצד של הלוח (shadcn Sidebar): בדסקטופ מתקפל לאייקונים, במובייל מגירה. */
export function AppSidebar({ user }: { user: { name: string; email: string; isAdmin: boolean } }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setOpenMobile(false);

  const item = ({ href, label, icon: Icon, exact }: { href: string; label: string; icon: typeof Inbox; exact?: boolean }) => (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton asChild isActive={isActive(href, exact)} tooltip={label} className="h-10 text-[14.5px]">
        <Link href={href} onClick={close}>
          <Icon aria-hidden />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar side="right" variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent">
              <Link href="/admin" onClick={close} aria-label="שלכם — לוח בקרה">
                <span className="hidden aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-[17px] font-black text-white group-data-[collapsible=icon]:flex">
                  ש
                </span>
                <Image
                  src="/images/logo-2026.png"
                  alt=""
                  width={78}
                  height={40}
                  className="h-10 w-auto group-data-[collapsible=icon]:hidden"
                />
                <span className="ms-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-primary group-data-[collapsible=icon]:hidden">
                  לוח בקרה
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{MAIN.map(item)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>האתר</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{SITE.map(item)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>תוכן האתר</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONTENT_NAV.map(({ slug, label }) => item({ href: `/admin/content/${slug}`, label, icon: FileText }))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>ניהול</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{item({ href: "/admin/users", label: "משתמשים", icon: Users })}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-[13px] font-bold text-white">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start leading-tight">
                    <span className="truncate text-[14px] font-bold">{user.name}</span>
                    <span className="truncate text-[12px] text-muted-foreground" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ms-auto size-4" aria-hidden />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-[14px] font-bold">{user.name}</div>
                  <div className="text-[12px] text-muted-foreground">{user.isAdmin ? "מנהל" : "עורך אתר"}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/" target="_blank" rel="noopener">
                    <ExternalLink aria-hidden />
                    צפייה באתר
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/change-password" onClick={close}>
                    <KeyRound aria-hidden />
                    החלפת סיסמה
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <DropdownMenuItem asChild variant="destructive">
                    <button type="submit" className="w-full">
                      <LogOut aria-hidden />
                      יציאה
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
