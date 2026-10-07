import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const legalPages = [
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
] as const;

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/**
 * תבנית לעמודים משפטיים — ניווט צד דביק בין המסמכים (השראה: Customer.io, Mistral),
 * וגוף קריא ברוחב ~68 תווים עם סעיפים ממוספרים.
 */
export function LegalPage({
  current,
  title,
  strong,
  intro,
  sections,
  note,
}: {
  current: (typeof legalPages)[number]["href"];
  title: string;
  strong: string;
  intro: string;
  sections: LegalSection[];
  note?: React.ReactNode;
}) {
  const label = legalPages.find((p) => p.href === current)?.label ?? title;
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "בית", href: "/" }, { label }]}
        title={title}
        strong={strong}
        intro={intro}
      />
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-20">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 md:grid-cols-[220px_1fr] md:gap-20">
          <nav aria-label="מסמכים משפטיים" className="md:sticky md:top-28">
            <div className="mb-3 text-sm font-bold tracking-[0.04em] text-ink-muted">מסמכים</div>
            <ul className="m-0 list-none border-t border-hairline p-0">
              {legalPages.map((p) => (
                <li key={p.href} className="border-b border-hairline">
                  <Link
                    href={p.href}
                    aria-current={p.href === current ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center py-2 text-[15px] no-underline transition-colors duration-300",
                      p.href === current ? "font-bold text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-[680px]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-hairline py-8 first:border-t-0 first:pt-0">
                <h2 className="m-0 mb-3 flex items-baseline gap-4 font-display text-[24px] font-black leading-tight text-ink md:text-[28px]">
                  <span className="tnum text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="text-[17px] leading-[1.75] text-ink-secondary [&_p]:m-0 [&_p+p]:mt-4">
                  {s.body}
                </div>
              </section>
            ))}
            {note && (
              <p className="m-0 mt-4 border-t border-hairline pt-6 text-[15px] text-ink-faint">{note}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
