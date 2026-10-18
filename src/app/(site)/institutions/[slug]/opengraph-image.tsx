import { notFound } from "next/navigation";
import { getInstitution, getInstitutions } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "שלכם — מימוש זכויות רפואיות";
export const size = ogSize;
export const contentType = ogContentType;
/** כמו העמודים: תוכן מה-CMS מתרענן לכל היותר אחרי שעה (ה-webhook עושה את זה מיידית). */
export const revalidate = 3600;

export async function generateStaticParams() {
  const institutions = await getInstitutions();
  return institutions.map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) notFound();
  return renderOgImage({
    eyebrow: "מוסדות ובירוקרטיה",
    title: inst.name,
    subtitle: inst.description,
    photo: inst.image,
  });
}
