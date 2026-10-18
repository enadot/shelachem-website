import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "צוות ההנהלה של שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "צוות ההנהלה",
    title: "האנשים שמחויבים אישית לכל לקוח",
    subtitle: "מומחים בעלי עשרות שנות ניסיון במערכות הבריאות, השיווק והכספים.",
  });
}
