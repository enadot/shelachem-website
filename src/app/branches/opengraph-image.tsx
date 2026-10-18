import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "הסניפים של שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "סניפים ויצירת קשר",
    title: "ירושלים · בני ברק · זום מכל הארץ",
    subtitle: "כתובות, הוראות הגעה ונגישות — או פגישת זום בלי לצאת מהבית.",
  });
}
