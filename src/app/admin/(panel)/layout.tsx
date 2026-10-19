import { getAdminUser } from "@/lib/admin/session";
import { Sidebar } from "@/components/admin/sidebar";

/** מעטפת הלוח למשתמש מחובר: סרגל צד + אזור תוכן. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  return (
    <div className="flex min-h-svh flex-1 flex-col md:flex-row">
      <Sidebar userName={user.name} isAdmin={user.isAdmin} />
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </div>
    </div>
  );
}
