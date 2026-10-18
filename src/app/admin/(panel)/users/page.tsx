import { requireAdmin } from "@/lib/admin/session";
import { listUsers } from "@/lib/admin/users";
import { formatDate } from "@/lib/admin/format";
import { Badge, PageTitle, Panel } from "@/components/admin/ui";
import { CreateUserForm, UserRowActions } from "./users-client";

export const metadata = { title: "משתמשים" };

export default async function UsersPage() {
  const { user: me } = await requireAdmin();
  const users = await listUsers();

  return (
    <>
      <PageTitle
        title="משתמשי"
        strong="לוח הבקרה"
        description="מנהל רואה הכול, כולל המסך הזה. עורך אתר — תוכן, לידים, שיווק והגדרות, בלי ניהול משתמשים. משתמש חדש מקבל סיסמה זמנית ומחליף אותה בכניסה הראשונה."
      />

      <Panel title="משתמש חדש" className="mb-6">
        <CreateUserForm />
      </Panel>

      <div className="overflow-x-auto rounded-card border border-hairline bg-white">
        <table className="w-full min-w-[760px] border-collapse text-start text-[15px]">
          <thead>
            <tr className="border-b border-hairline bg-surface text-[13px] text-ink-muted">
              {["שם", "דוא״ל", "כניסה אחרונה", "מצב", "הרשאה ופעולות"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-hairline-soft last:border-none">
                <td className="whitespace-nowrap px-4 py-3 font-bold">
                  {u.name}
                  {u.id === me.id && <span className="ms-2 text-[13px] font-normal text-ink-muted">(את/ה)</span>}
                </td>
                <td className="px-4 py-3" dir="ltr">
                  {u.email}
                </td>
                <td className="tnum whitespace-nowrap px-4 py-3 text-ink-muted">
                  {formatDate(u.lastLoginAt?.toISOString())}
                </td>
                <td className="px-4 py-3">
                  {!u.active ? (
                    <Badge tone="danger">מושבת</Badge>
                  ) : u.mustChangePassword ? (
                    <Badge tone="gold">ממתין לכניסה ראשונה</Badge>
                  ) : (
                    <Badge tone="ok">פעיל</Badge>
                  )}
                </td>
                <td className="px-4 py-2">
                  <UserRowActions id={u.id} name={u.name} role={u.role} active={u.active} self={u.id === me.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
