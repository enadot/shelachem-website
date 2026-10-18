import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "המגזין של שלכם";
export const size = ogSize;
export const contentType = ogContentType;
/** כמו העמודים: תוכן מה-CMS מתרענן לכל היותר אחרי שעה (ה-webhook עושה את זה מיידית). */
export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  return renderOgImage({
    eyebrow: article.category,
    title: article.title,
    subtitle: article.excerpt,
    photo: article.image,
  });
}
