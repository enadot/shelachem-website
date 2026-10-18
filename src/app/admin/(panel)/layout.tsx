import { getAdminUser, requireSession } from "@/lib/admin/session";
import { missingFields } from "@/lib/admin/migrate";
import { Sidebar } from "@/components/admin/sidebar";
import { MigrationBanner } from "@/components/admin/migration-banner";

/** מעטפת הלוח למשתמש מחובר: סרגל צד + אזור תוכן, ובאנר אם מבנה ה-CMS לא מעודכן. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  const { token } = await requireSession();
  const missing = await missingFields(token);

  return (
    <div className="flex min-h-svh flex-1 flex-col md:flex-row">
      <Sidebar userName={user.name} />
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1180px]">
          {missing.length > 0 && <MigrationBanner isAdmin={user.isAdmin} missing={missing.length} />}
          {children}
        </div>
      </div>
    </div>
  );
}
