import type { Metadata } from "next";
import Link from "next/link";
import { ChevronForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false },
};

/** 404 ממותג — מפנה חזרה למסלולים המרכזיים במקום עמוד שגיאה חשוף. */
export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="font-display text-[96px] font-light leading-none text-brand md:text-[128px]">
        404
      </div>
      <h1 className="m-0 mt-4 font-display text-3xl font-bold text-ink">
        העמוד שחיפשתם לא נמצא
      </h1>
      <p className="m-0 mt-3 max-w-[440px] text-base leading-relaxed text-ink-muted">
        יכול להיות שהקישור השתנה או שהעמוד הוסר. מה שבטוח — הזכויות שלכם עדיין כאן.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white no-underline transition-transform hover:scale-[1.03]"
        >
          לדף הבית
        </Link>
        <Link
          href="/#lead-form"
          className="inline-flex items-center gap-2 rounded-full border border-brand px-7 py-3.5 text-base font-bold text-brand no-underline transition-colors hover:bg-brand hover:text-white"
        >
          בדיקת זכאות חינם
          <ChevronForward size={16} />
        </Link>
      </div>
      <div className="mt-10 text-sm text-ink-faint">
        אפשר גם לעיין ב
        <Link href="/magazine" className="text-brand underline-offset-2">
          מגזין
        </Link>{" "}
        או ב
        <Link href="/institutions" className="text-brand underline-offset-2">
          מדריך המוסדות
        </Link>
      </div>
    </section>
  );
}
