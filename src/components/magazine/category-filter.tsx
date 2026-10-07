"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Article } from "@/lib/content/types";
import { ArticleCard } from "@/components/shared/article-card";
import { quietTab } from "@/lib/quiet-tab";

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
      <div className="flex flex-wrap items-center gap-1 border-b border-hairline pb-4">
        {magazineCategories.map((c) => (
          <Link
            key={c}
            href={c === "הכל" ? "/magazine" : `/magazine?cat=${encodeURIComponent(c)}`}
            scroll={false}
            aria-current={active === c ? "true" : undefined}
            className={quietTab(active === c)}
          >
            {c}
          </Link>
        ))}
        <span className="tnum ms-auto text-[14.5px] text-ink-faint" aria-live="polite">
          {visible.length} מאמרים
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
          {visible.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="m-0 border-b border-hairline py-10 text-[16.5px] text-ink-secondary">
          עוד לא פרסמנו כתבות בקטגוריה הזאת.{" "}
          <Link href="/magazine" className="font-bold text-brand no-underline hover:underline">
            לכל הכתבות
          </Link>
        </p>
      )}
    </>
  );
}
