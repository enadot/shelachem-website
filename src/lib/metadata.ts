import type { Metadata } from "next";
import { site } from "@/lib/config";

/**
 * Metadata אחיד לעמוד: title, description, canonical ו-Open Graph תואמים.
 *
 * Next ממזג metadata בין layout לעמוד ברמת המפתח העליון בלבד — עמוד שלא מגדיר
 * `openGraph` יורש את הכותרת והתיאור של דף הבית, ועמוד שמגדיר אותו חלקית מאבד
 * את siteName/locale. לכן כל עמוד בונה את ה-openGraph המלא שלו דרך כאן.
 * תמונת השיתוף עצמה מגיעה מ-`opengraph-image.tsx` של העמוד.
 */
export function pageMetadata({
  title,
  description,
  path,
  openGraph,
  ...rest
}: {
  title: string;
  description: string;
  path: string;
  openGraph?: Partial<NonNullable<Metadata["openGraph"]>>;
} & Omit<Metadata, "title" | "description" | "openGraph">): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: site.shortName,
      url: path,
      title: `${title} | ${site.shortName}`,
      description,
      ...openGraph,
    } as Metadata["openGraph"],
    ...rest,
  };
}
