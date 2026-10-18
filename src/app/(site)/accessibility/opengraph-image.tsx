import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "הצהרת נגישות — שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: "הצהרת נגישות",
  });
}
