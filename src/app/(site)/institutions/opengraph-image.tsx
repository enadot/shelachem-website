import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "מוסדות ובירוקרטיה — שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "מוסדות ובירוקרטיה",
    title: "כל המוסדות. צוות אחד שמכיר את כולם.",
    subtitle: "ביטוח לאומי, מס הכנסה, קרנות פנסיה וחברות ביטוח — מימוש הזכויות שלכם במקום אחד.",
    photo: "/images/photos/documents-table.webp",
  });
}
