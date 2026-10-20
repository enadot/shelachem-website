import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "הרופאים והמומחים של שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "הרופאים והמומחים",
    title: "רופאים מומחים שמכירים את הוועדות מבפנים",
    subtitle: "חוות דעת מקצועיות, הכוונה אישית לקראת הוועדות הרפואיות ומעקב צמוד עד להחלטה.",
    photo: "/images/photos/physiotherapy.webp",
  });
}
