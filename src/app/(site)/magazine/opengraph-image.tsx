import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "המגזין של שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "המגזין",
    title: "מדריכים, עדכוני חוק וסיפורי הצלחה",
    subtitle: "מימוש זכויות רפואיות בשפה של בני אדם, לא של פקידים.",
    photo: "/images/photos/kitchen-table-laptop.webp",
  });
}
