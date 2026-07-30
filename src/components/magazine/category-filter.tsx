"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Article } from "@/lib/content/types";
import { ArticleCard } from "@/components/shared/article-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const magazineCategories = ["הכל", "מדריכים", "חדשות", "סיפורי הצלחה"] as const;

/**
 * סינון קטגוריות בצד הלקוח.
 *
 * למה: עד כה העמוד קרא `searchParams` בשרת, מה שהפך את `/magazine` לעמוד דינמי —
 * רינדור מחדש בכל בקשה, בלי CDN, בשביל סינון של רשימה שממילא נשלחת במלואה.
 * כאן ה-URL נשאר ניתן לשיתוף (`?cat=`), אבל העמוד עצמו סטטי.
 *
 * הקישורים הם `<Link>` אמיתיים, כדי שהסינון יעבוד גם בלי JS ויהיה נגיש למקלדת.
 */
export function CategoryFilter({ articles }: { articles: Article[] }) {
  const activeCat = useSearchParams().get("cat") ?? "הכל";
  const active = (magazineCategories as readonly string[]).includes(activeCat)
    ? activeCat
    : "הכל";
  const visible = articles.filter((a) => active === "הכל" || a.category === active);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {magazineCategories.map((c) => (
          <Button
            key={c}
            asChild
            variant="outline"
            size="sm"
            className={cn(
              active === c &&
                "border-brand bg-brand font-bold text-white hover:bg-brand hover:text-white",
            )}
          >
            <Link
              href={c === "הכל" ? "/magazine" : `/magazine?cat=${encodeURIComponent(c)}`}
              scroll={false}
              aria-current={active === c ? "true" : undefined}
            >
              {c}
            </Link>
          </Button>
        ))}
        <span className="tnum ms-auto text-[14.5px] text-ink-faint" aria-live="polite">
          {visible.length} מאמרים
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-[18px]">
          {visible.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-[14px] border border-hairline bg-surface px-6 py-8 text-center text-[16.5px] text-ink-secondary">
          עוד לא פרסמנו כתבות בקטגוריה הזאת.{" "}
          <Link href="/magazine" className="font-bold text-brand no-underline hover:underline">
            לכל הכתבות
          </Link>
        </p>
      )}
    </>
  );
}
