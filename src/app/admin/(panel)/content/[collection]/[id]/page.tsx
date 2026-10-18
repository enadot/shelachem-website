import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/session";
import { getItem, listRevisions } from "@/lib/admin/content";
import { COLLECTIONS, isCollection, type CollectionConfig } from "@/lib/admin/collections";
import { emptyEntity, normalizeEntity } from "@/lib/admin/fields";
import { PageTitle } from "@/components/admin/ui";
import { ItemEditor } from "./item-editor";
import { Revisions } from "./revisions";

export const metadata = { title: "עריכה" };

export default async function ItemPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isCollection(collection)) notFound();
  const config: CollectionConfig = COLLECTIONS[collection];
  await requireSession();
  const isNew = id === "new";

  let row: Record<string, unknown> | null = null;
  if (!isNew) {
    row = await getItem(collection, id);
    if (!row) notFound();
  }
  const revisions = isNew ? [] : await listRevisions(collection, id);
  // שדה תמונה ישן (נתיב סטטי) נשמר ב-initial רק לתצוגה המקדימה — לא בהגדרת הטופס.
  const initial = isNew
    ? emptyEntity(config.fields)
    : { ...normalizeEntity(config.fields, row), image: row?.image ?? null };
  const title = isNew ? `${config.singular} חדש/ה` : String(row?.[config.titleField] ?? "");

  return (
    <>
      <Link href={`/admin/content/${collection}`} className="mb-4 inline-block text-[14.5px] font-bold text-brand no-underline">
        → {config.label}
      </Link>
      <PageTitle
        title={isNew ? "יצירת" : "עריכה:"}
        strong={title}
        actions={
          !isNew && (
            <a href={config.publicPath(row ?? {})} target="_blank" rel="noopener" className="font-bold text-brand no-underline">
              צפייה באתר ↗
            </a>
          )
        }
      />
      <ItemEditor
        collection={collection}
        id={isNew ? null : id}
        initial={initial}
        singular={config.singular}
      />
      {revisions.length > 0 && <Revisions collection={collection} id={id} revisions={revisions} />}
    </>
  );
}
