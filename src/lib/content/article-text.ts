import type { ArticleSection } from "./types";

/**
 * סימון מינימלי בגוף כתבה, בלי HTML ובלי markdown מלא (נשאר טקסט פשוט בלוח):
 * - פסקה שמתחילה ב-"### " מוצגת ככותרת משנה (h3).
 * - כתובת https://… בתוך פסקה או תבליט הופכת לקישור.
 * - בפרק שהעוגן שלו "faq": כל "### שאלה" והפסקאות שאחריה הן שאלה ותשובה,
 *   ומהן נבנה FAQPage JSON-LD.
 */
export const H3_PREFIX = "### ";

export function isSubheading(p: string): boolean {
  return p.startsWith(H3_PREFIX);
}

export function subheadingText(p: string): string {
  return p.slice(H3_PREFIX.length).trim();
}

/** הטקסט בלי סימון — לספירת מילים ולסכמה. */
export function plainText(p: string): string {
  return isSubheading(p) ? subheadingText(p) : p;
}

const URL_RE = /(https?:\/\/[^\s<>"״]+[^\s<>"״.,;:!?)\]])/g;

export type TextPart = { type: "text"; value: string } | { type: "link"; href: string };

export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ type: "text", value: text.slice(last, i) });
    parts.push({ type: "link", href: m[0] });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

export const FAQ_SECTION_ID = "faq";

export function articleFaqs(body: ArticleSection[] | undefined) {
  const out: { question: string; answer: string }[] = [];
  for (const sec of body ?? []) {
    if (sec.id !== FAQ_SECTION_ID) continue;
    let cur: { question: string; answer: string[] } | null = null;
    const flush = () => {
      if (cur && cur.answer.length) out.push({ question: cur.question, answer: cur.answer.join(" ") });
    };
    for (const p of sec.paragraphs) {
      if (isSubheading(p)) {
        flush();
        cur = { question: subheadingText(p), answer: [] };
      } else if (cur) {
        cur.answer.push(p);
      }
    }
    flush();
  }
  return out;
}
