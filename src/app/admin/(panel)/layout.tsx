import { cookies } from "next/headers";
import { getAdminUser } from "@/lib/admin/session";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AppHeader } from "@/components/admin/app-header";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";

/** מעטפת הלוח למשתמש מחובר: סרגל צד (shadcn Sidebar) + אזור תוכן. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  // מצב הסרגל (פתוח/מכווץ) נשמר בעוגייה של רכיב ה-Sidebar.
  const open = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={open}>
      <AppSidebar user={{ name: user.name, email: user.email, isAdmin: user.isAdmin }} />
      <SidebarInset className="min-w-0 bg-white">
        <AppHeader />
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1180px]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
