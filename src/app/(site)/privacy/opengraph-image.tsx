import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "מדיניות פרטיות — שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: "מדיניות פרטיות",
  });
}
