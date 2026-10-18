import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "הסיפור שלנו — שלכם, מימוש זכויות רפואיות";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "הסיפור שלנו",
    title: "מאז 2013 מנצחים את הבירוקרטיה בשבילכם",
    subtitle: "חברת שלכם הוקמה מתוך שליחות: לפשט את הבירוקרטיה הרפואית עבור כל אזרח בישראל.",
    photo: "/images/photos/consultation.webp",
    photoPosition: "attention",
  });
}
