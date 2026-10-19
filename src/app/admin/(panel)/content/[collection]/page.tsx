import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/session";
import { COLLECTIONS, isCollection, type CollectionConfig } from "@/lib/admin/collections";
import { errorMessage } from "@/lib/admin/globals";
import { listItems, type Row } from "@/lib/admin/content";
import { Badge, EmptyState, PageTitle } from "@/components/admin/ui";
import { ExternalLink, FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";

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
        strong={rows.length ? String(rows.length) : undefined}
        description={config.description}
        actions={
          <Button asChild>
            <Link href={`/admin/content/${collection}/new`}>
              <Plus aria-hidden />
              {config.singular} חדש/ה
            </Link>
          </Button>
        }
      />

      <form method="get" className="relative mb-4 max-w-[420px]">
        <label className="sr-only" htmlFor="q">
          חיפוש
        </label>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="q"
          name="q"
          defaultValue={q}
          placeholder={`חיפוש ב${config.label}…`}
          className="h-10 bg-white ps-9"
        />
      </form>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && rows.length === 0 ? (
        <EmptyState title={q ? "לא נמצאו תוצאות" : `עדיין אין ${config.label}`} icon={<FileText className="size-5" />}>
          {!q && "התוכן שמוצג כרגע באתר מגיע מברירת המחדל שבקוד. פריט ראשון שתיצרו כאן יחליף את כל הרשימה."}
        </EmptyState>
      ) : (
        <Card className="gap-0 overflow-hidden py-0 shadow-none">
          <ul className="m-0 list-none divide-y p-0">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 md:px-5">
                <Link
                  href={`/admin/content/${collection}/${r.id}`}
                  className="min-w-0 flex-1 text-foreground no-underline hover:text-primary"
                >
                  <span className="block truncate text-[15px] font-bold">
                    {String(r[config.titleField] ?? "") || "(ללא כותרת)"}
                  </span>
                  {subtitleLabel(r) && (
                    <span className="block truncate text-[13px] text-muted-foreground">{subtitleLabel(r)}</span>
                  )}
                </Link>
                {collection === "articles" && isDraft(r) && <Badge tone="gold">טיוטה</Badge>}
                <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground">
                  <a href={config.publicPath(r)} target="_blank" rel="noopener" aria-label="צפייה באתר">
                    <ExternalLink aria-hidden />
                    <span className="hidden sm:inline">צפייה</span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
