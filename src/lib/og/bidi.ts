/**
 * Satori (המנוע של next/og) לא מממש את אלגוריתם ה-bidi — עברית יוצאת הפוכה
 * ("שלכם" → "םכלש"), ו-`direction: rtl` לא עוזר. לכן מכינים את הטקסט בסדר
 * חזותי בעצמנו:
 * - כל מילה היא פריט flex נפרד, והשורה בנויה ב-`row-reverse` + `wrap` — כך
 *   המילה הראשונה מימין, והגלישה לשורה הבאה נכונה;
 * - בתוך מילה: רצפי עברית/סימנים מתהפכים, ורצפי ספרות/לטינית נשארים LTR
 *   ("ב-2013" → "2013-ב");
 * - מילים לטיניות צמודות ("Google Ads") נשמרות יחד כפריט אחד. מספרים לא —
 *   בהקשר עברי "2013 · 2026" נקרא מימין לשמאל כמו המילים סביבו.
 */

const LTR_RUN = /[0-9A-Za-z]+(?:[.,:/'’][0-9A-Za-z]+)*%?/g;
const MIRROR: Record<string, string> = { "(": ")", ")": "(", "[": "]", "]": "[", "<": ">", ">": "<" };
const HAS_HEBREW = /[\u0590-\u05FF]/;
const HAS_LATIN = /[A-Za-z]/;

const reverseRtl = (s: string) => [...s].reverse().map((c) => MIRROR[c] ?? c).join("");

/** מילה בודדת → סדר חזותי. */
export function visualWord(word: string): string {
  if (!HAS_HEBREW.test(word)) return word;
  const parts: { text: string; ltr: boolean }[] = [];
  let last = 0;
  for (const m of word.matchAll(LTR_RUN)) {
    if (m.index > last) parts.push({ text: word.slice(last, m.index), ltr: false });
    parts.push({ text: m[0], ltr: true });
    last = m.index + m[0].length;
  }
  if (last < word.length) parts.push({ text: word.slice(last), ltr: false });
  return parts
    .reverse()
    .map((p) => (p.ltr ? p.text : reverseRtl(p.text)))
    .join("");
}

/**
 * טקסט → רשימת "מילים" בסדר לוגי (לרינדור ב-row-reverse), כל אחת כבר בסדר
 * חזותי. רצף של מילים לטיניות מאוחד לפריט אחד כדי לשמור על סדר LTR שלו.
 */
export function visualWords(text: string): string[] {
  const out: string[] = [];
  let ltrBuffer: string[] = [];
  const flush = () => {
    if (ltrBuffer.length) out.push(ltrBuffer.join(" "));
    ltrBuffer = [];
  };
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (!HAS_HEBREW.test(w) && HAS_LATIN.test(w)) {
      ltrBuffer.push(w);
    } else {
      flush();
      out.push(visualWord(w));
    }
  }
  flush();
  return out;
}
