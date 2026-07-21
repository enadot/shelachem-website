import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
import { getArticles, getInstitutions, getServices } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, institutions, services] = await Promise.all([
    getArticles(),
    getInstitutions(),
    getServices(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.domain, priority: 1 },
    { url: `${site.domain}/about`, priority: 0.8 },
    { url: `${site.domain}/team`, priority: 0.6 },
    { url: `${site.domain}/doctors`, priority: 0.7 },
    { url: `${site.domain}/branches`, priority: 0.7 },
    { url: `${site.domain}/institutions`, priority: 0.8 },
    { url: `${site.domain}/magazine`, priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...institutions.map((i) => ({ url: `${site.domain}/institutions/${i.slug}`, priority: 0.7 })),
    ...services.map((s) => ({ url: `${site.domain}/services/${s.slug}`, priority: 0.8 })),
    ...articles.map((a) => ({ url: `${site.domain}/magazine/${a.slug}`, priority: 0.6 })),
  ];
}
