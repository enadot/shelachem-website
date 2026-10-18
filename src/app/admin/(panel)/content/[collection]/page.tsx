import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/session";
import { COLLECTIONS, isCollection, type CollectionConfig } from "@/lib/admin/collections";
import { errorMessage } from "@/lib/admin/globals";
import { listItems, type Row } from "@/lib/admin/content";
import { Badge, EmptyState, PageTitle } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";

/** טיוטה = כתבה בלי פסקאות — אותה לוגיקה כמו isPublished באתר. */
const isDraft = (r: Row) =>
  !Array.isArray(r.body) ||
  !(r.body as { paragraphs?: unknown[]; bullets?: unknown[] }[]).some(
    (s) => s?.paragraphs?.length || s?.bullets?.length,
  );

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  return { title: isCollection(collection) ? COLLECTIONS[collection].label : "תוכן" };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { collection } = await params;
  const { q } = await searchParams;
  if (!isCollection(collection)) notFound();
  const config: CollectionConfig = COLLECTIONS[collection];
  await requireSession();

  let rows: Row[] = [];
  let error: string | null = null;
  try {
    rows = await listItems(collection, q?.trim() || undefined);
  } catch (err) {
    error = errorMessage(err);
  }

  const subtitleLabel = (r: Row) => {
    const v = config.subtitleField ? r[config.subtitleField] : null;
    const field = config.fields.find((f) => f.name === config.subtitleField);
    return field?.options?.find((o) => o.value === v)?.label ?? (typeof v === "string" ? v : "");
  };

  return (
    <>
      <PageTitle
        title={config.label}
        strong={rows.length ? `(${rows.length})` : undefined}
        description={config.description}
        actions={
          <Link href={`/admin/content/${collection}/new`} className={buttonVariants({ size: "sm" })}>
            + {config.singular} חדש/ה
          </Link>
        }
      />

      <form method="get" className="mb-5 max-w-[420px]">
        <label className="sr-only" htmlFor="q">
          חיפוש
        </label>
        <Input id="q" name="q" defaultValue={q} placeholder={`חיפוש ב${config.label}…`} />
      </form>

      {error && (
        <p role="alert" className="mb-6 rounded-[10px] bg-[#fbe6e6] px-4 py-3 text-danger">
          {error}
        </p>
      )}

      {!error && rows.length === 0 ? (
        <EmptyState title={q ? "לא נמצאו תוצאות" : `עדיין אין ${config.label}`}>
          {!q && "התוכן שמוצג כרגע באתר מגיע מברירת המחדל שבקוד. פריט ראשון שתיצרו כאן יחליף את כל הרשימה."}
        </EmptyState>
      ) : (
        <ul className="m-0 list-none overflow-hidden rounded-card border border-hairline bg-white p-0">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-4 border-b border-hairline-soft px-5 py-3.5 last:border-none">
              <Link
                href={`/admin/content/${collection}/${r.id}`}
                className="min-w-0 flex-1 text-ink no-underline hover:text-brand"
              >
                <span className="block truncate text-[16px] font-bold">
                  {String(r[config.titleField] ?? "") || "(ללא כותרת)"}
                </span>
                {subtitleLabel(r) && (
                  <span className="block truncate text-[13.5px] text-ink-muted">{subtitleLabel(r)}</span>
                )}
              </Link>
              {collection === "articles" && isDraft(r) && <Badge tone="gold">טיוטה — לא מוצגת באתר</Badge>}
              <a
                href={config.publicPath(r)}
                target="_blank"
                rel="noopener"
                className="shrink-0 text-[14px] font-bold text-brand no-underline"
              >
                צפייה ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
