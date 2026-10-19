import { requireAdmin } from "@/lib/admin/session";
import { listUsers } from "@/lib/admin/users";
import { formatDate } from "@/lib/admin/format";
import { Badge, PageTitle, initials } from "@/components/admin/ui";
import { Card } from "@/components/admin/ui/card";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { CreateUserDialog, UserRowActions } from "./users-client";

export const metadata = { title: "משתמשים" };

const roleLabel = (r: "admin" | "editor") => (r === "admin" ? "מנהל" : "עורך אתר");

function Status({ active, mustChangePassword }: { active: boolean; mustChangePassword: boolean }) {
  if (!active) return <Badge tone="danger">מושבת</Badge>;
  if (mustChangePassword) return <Badge tone="gold">ממתין לכניסה ראשונה</Badge>;
  return <Badge tone="ok">פעיל</Badge>;
}

export default async function UsersPage() {
  const { user: me } = await requireAdmin();
  const users = await listUsers();

  return (
    <>
      <PageTitle
        title="משתמשי"
        strong="לוח הבקרה"
        description="מנהל רואה הכול, כולל המסך הזה. עורך אתר — תוכן, לידים, שיווק והגדרות, בלי ניהול משתמשים."
        actions={<CreateUserDialog />}
      />

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="ps-5">משתמש</TableHead>
              <TableHead className="hidden md:table-cell">הרשאה</TableHead>
              <TableHead className="hidden md:table-cell">כניסה אחרונה</TableHead>
              <TableHead>מצב</TableHead>
              <TableHead className="w-12 pe-5">
                <span className="sr-only">פעולות</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className={u.active ? undefined : "opacity-60"}>
                <TableCell className="ps-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-[12.5px] font-bold text-primary">
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-bold">
                        {u.name}
                        {u.id === me.id && (
                          <span className="ms-1.5 text-[12.5px] font-normal text-muted-foreground">(את/ה)</span>
                        )}
                      </div>
                      <div className="truncate text-[12.5px] text-muted-foreground" dir="ltr">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{roleLabel(u.role)}</TableCell>
                <TableCell className="tnum hidden text-muted-foreground md:table-cell">
                  {formatDate(u.lastLoginAt?.toISOString())}
                </TableCell>
                <TableCell>
                  <Status active={u.active} mustChangePassword={u.mustChangePassword} />
                </TableCell>
                <TableCell className="pe-5">
                  <UserRowActions id={u.id} name={u.name} role={u.role} active={u.active} self={u.id === me.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
