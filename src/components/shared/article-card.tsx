import Link from "next/link";
import { ArticleImage } from "@/components/shared/article-image";
import { ArrowForward } from "@/components/shared/icons";
import type { Article } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * כרטיס כתבה — תמונה 4:3 עם זום עדין בריחוף, קטגוריה, כותרת ושורת מטא. בלי
 * מסגרת ובלי צל: הרשת והטיפוגרפיה מחזיקות את הגריד.
 */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <Link
      href={`/magazine/${article.slug}`}
      className={cn("group flex flex-col gap-4 text-ink no-underline", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-blue [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[var(--ease-out)] group-hover:[&_img]:scale-[1.04]">
        <ArticleImage
          src={article.image}
          alt={article.imageAlt}
          sizes="(max-width: 768px) 80vw, 360px"
          markSize={96}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-muted">
          <span className="text-brand">{article.category}</span>
          <span aria-hidden className="h-px w-4 bg-hairline" />
          <span className="tnum font-normal text-ink-faint">
            {article.readingMinutes} דק׳ · {article.publishedLabel}
          </span>
        </div>
        <div className="flex-1 font-display text-xl font-black leading-snug transition-colors duration-300 group-hover:text-brand">
          {article.title}
        </div>
        <p className="m-0 line-clamp-2 text-[15px] leading-normal text-ink-muted">{article.excerpt}</p>
        <span className="mt-1 flex items-center gap-2 text-sm font-bold text-brand">
          <span className="link-draw">המשך קריאה</span>
          <ArrowForward size={15} className="nudge" />
        </span>
      </div>
    </Link>
  );
}
