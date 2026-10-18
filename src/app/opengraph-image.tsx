import { ogContentType, ogSize, renderHomeOgImage } from "@/lib/og/render";

export const alt = "שלכם — המקצוענים שמנצחים את הבירוקרטיה בדרך לזכויות שלכם";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderHomeOgImage();
}
