import { getAdminUser, requireSession } from "@/lib/admin/session";
import { directusUrl } from "@/lib/admin/auth-shared";
import { readGlobals } from "@/lib/admin/globals";
import { SETTINGS_FIELDS } from "@/lib/admin/collections";
import { normalizeEntity } from "@/lib/admin/fields";
import { buildSiteSettings } from "@/lib/site-settings";
import { PageTitle, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { saveSettingsAction } from "./actions";
import { CreateUserForm } from "./create-user-form";

export const metadata = { title: "הגדרות אתר" };

export default async function SettingsPage() {
  const { client } = await requireSession();
  const user = await getAdminUser();
  const g = await readGlobals(client);

  // שדה שעוד לא מולא ב-CMS מוצג עם הערך שבאמת מופיע באתר (ברירת המחדל מהקוד),
  // כדי שהלקוח יערוך את מה שהוא רואה — לא טופס ריק.
  const live = buildSiteSettings(g);
  const initial = normalizeEntity(SETTINGS_FIELDS, {
    ...g,
    phone: g.phone ?? live.contact.phone,
    whatsapp_number: g.whatsapp_number ?? live.contact.whatsappNumber.replace(/^972/, "0"),
    email: g.email ?? live.contact.email,
    socials: g.socials ?? live.socials,
    branches: g.branches ?? live.branches,
    opening_hours: g.opening_hours ?? live.openingHours ?? [],
  });

  return (
    <>
      <PageTitle
        title="הגדרות"
        strong="אתר"
        description="פרטי הקשר, הסניפים ותמונת ההירו. השמירה מתעדכנת בכל עמודי האתר מיד."
      />
      <EntityForm form="settings" initial={initial} action={saveSettingsAction} assetBase={directusUrl()} />
      {user.isAdmin && (
        <Panel
          title="משתמשי לוח הבקרה"
          description="יצירת משתמש לצוות המשרד, בהרשאת “עורך אתר”: תוכן, לידים והגדרות — בלי גישה לניהול המערכת."
          className="mb-10"
        >
          <CreateUserForm />
        </Panel>
      )}
    </>
  );
}
