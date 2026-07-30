import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
import { getArticles, getInstitutions, getServices } from "@/lib/content";

/**
 * מפת האתר. `changeFrequency` נגזר מהתנהגות אמיתית של כל סוג עמוד ולא מהעתקה:
 * המגזין מתעדכן, עמודי שירות/מוסד יציבים, ועמודי המשנה כמעט לא נוגעים.
 * `/privacy` ו-`/accessibility` מסומנים `noindex` ולכן אינם כאן.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, institutions, services] = await Promise.all([
    getArticles(),
    getInstitutions(),
    getServices(),
  ]);

  const newestArticle = articles
    .map((a) => a.publishedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.domain, priority: 1, changeFrequency: "weekly" },
    { url: `${site.domain}/institutions`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${site.domain}/faq`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${site.domain}/about`, priority: 0.8, changeFrequency: "yearly" },
    {
      url: `${site.domain}/magazine`,
      priority: 0.8,
      changeFrequency: "weekly",
      ...(newestArticle ? { lastModified: new Date(newestArticle) } : {}),
    },
    { url: `${site.domain}/doctors`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${site.domain}/branches`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${site.domain}/team`, priority: 0.6, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes,
    ...institutions.map((i) => ({
      url: `${site.domain}/institutions/${i.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...services.map((s) => ({
      url: `${site.domain}/services/${s.slug}`,
      priority: 0.9,
      changeFrequency: "monthly" as const,
    })),
    ...articles.map((a) => ({
      url: `${site.domain}/magazine/${a.slug}`,
      priority: 0.6,
      changeFrequency: "yearly" as const,
      ...(a.publishedAt ? { lastModified: new Date(a.publishedAt) } : {}),
    })),
  ];
}
