import { requireSession } from "@/lib/admin/session";
import { readGlobals } from "@/lib/admin/globals";
import { ID_FIELDS, VERIFICATION_FIELDS } from "@/lib/admin/marketing-fields";
import { asBool } from "@/lib/marketing";
import { PageTitle } from "@/components/admin/ui";
import { MarketingForm } from "./marketing-form";

export const metadata = { title: "שיווק ופיקסלים" };

export default async function MarketingPage() {
  const { client } = await requireSession();
  const g = await readGlobals(client);
  const text = (k: string) => (typeof g[k] === "string" ? (g[k] as string) : "");

  return (
    <>
      <PageTitle
        title="שיווק"
        strong="ופיקסלים"
        description="מדביקים מזהה ושומרים — התג נטען באתר מיד. שדה ריק = התג כבוי. כל פיקסל מחברים ממקום אחד בלבד: או כאן, או בתוך Google Tag Manager."
      />
      <MarketingForm
        initial={{
          ids: Object.fromEntries(ID_FIELDS.map((f) => [f.field, text(f.field)])),
          verification: Object.fromEntries(VERIFICATION_FIELDS.map((f) => [f.field, text(f.field)])),
          consent_required: asBool(g.consent_required),
          enhanced_conversions: asBool(g.enhanced_conversions),
        }}
      />
    </>
  );
}
