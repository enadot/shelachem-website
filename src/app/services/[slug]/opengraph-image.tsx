import { notFound } from "next/navigation";
import { getInstitution, getService, getServices } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "שלכם — מימוש זכויות רפואיות";
export const size = ogSize;
export const contentType = ogContentType;
/** כמו העמודים: תוכן מה-CMS מתרענן לכל היותר אחרי שעה (ה-webhook עושה את זה מיידית). */
export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();
  const institution = await getInstitution(service.institutionSlug);
  return renderOgImage({
    eyebrow: institution?.name,
    title: service.name,
    subtitle: service.heroIntro,
    photo: service.image,
  });
}
