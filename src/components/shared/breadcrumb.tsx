import Link from "next/link";
import { site } from "@/lib/config";
import { BreadcrumbSeparator } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * פירורי לחם — קומפוננטה אחת לכל האתר, ותמיד עם `BreadcrumbList` JSON-LD.
 *
 * למה: עד כה `NavyHero` פלט את הסכמה, אבל עמודי השירות, המגזין והכתבה בנו את
 * הפירורים ידנית — כלומר שלושת סוגי העמודים שנושאים את התנועה האורגנית הציגו
 * פירורים למשתמש בלי לספר לגוגל על ההיררכיה. בנוסף, המפריד היה `‹` (גליף מרכאות
 * זוויתיות) שהתנהגותו תלויה בהיפוך דו-כיווני; כאן הוא אייקון מצויר.
 */
export function Breadcrumb({
  items,
  tone = "light",
  className,
}: {
  items: Crumb[];
  /** `inverse` — על משטח נייבי. */
  tone?: "light" | "inverse";
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, site.domain).toString() } : {}),
    })),
  };

  const link =
    tone === "inverse"
      ? "text-white/75 no-underline hover:text-white"
      : "text-ink-faint no-underline hover:text-brand";
  const current = tone === "inverse" ? "font-bold text-white" : "font-bold text-ink";
  const sep = tone === "inverse" ? "text-white/45" : "text-ink-faint/60";

  return (
    <nav
      aria-label="פירורי לחם"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm",
        tone === "inverse" ? "text-white/75" : "text-ink-faint",
        className,
      )}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
          {c.href ? (
            <Link href={c.href} className={link}>
              {c.label}
            </Link>
          ) : (
            <span className={current} aria-current="page">
              {c.label}
            </span>
          )}
          {i < items.length - 1 && <BreadcrumbSeparator className={sep} />}
        </span>
      ))}
    </nav>
  );
}
