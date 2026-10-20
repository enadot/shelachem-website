import { ogContentType, ogSize, renderOgImage } from "@/lib/og/render";

export const alt = "שאלות ותשובות על מימוש זכויות רפואיות";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "שאלות ותשובות",
    title: "כל מה שרציתם לשאול על מימוש זכויות רפואיות",
    subtitle: "איך יודעים אם אתם זכאים, כמה זמן זה לוקח, ואיך עובד שכר טרחה רק בהצלחה.",
  });
}
