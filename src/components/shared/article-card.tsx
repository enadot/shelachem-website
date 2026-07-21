import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** כרטיס כתבה — משמש בקרוסלת המגזין בדף הבית ובגריד המגזין. */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <Link
      href={`/magazine/${article.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-white text-ink no-underline transition-shadow hover:shadow-[0_12px_32px_rgba(13,37,61,0.12)]",
        className,
      )}
    >
      <div className="relative h-[150px] overflow-hidden bg-surface-blue">
        {article.image && (
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width: 768px) 80vw, 320px"
            className="object-cover"
          />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12.5px] font-bold text-brand">
          {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-4">
        <div className="flex-1 text-[16.5px] font-bold leading-snug">{article.title}</div>
        <p className="m-0 line-clamp-2 text-sm leading-normal text-ink-muted">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-brand">המשך קריאה ←</span>
          <span className="tnum text-[13px] text-ink-faint">
            {article.readingMinutes} דק׳ · {article.publishedLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
