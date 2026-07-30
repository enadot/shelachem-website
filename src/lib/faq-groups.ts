import type { FaqGroup, FaqItem } from "./content/types";

/**
 * הקיבוץ הנושאי של עמוד ה-FAQ. חמש קבוצות + "שאלות נוספות" — כדי ששום נקודת
 * החלטה לא תציג יותר מ-6 בחירות ברמה הראשונה (מגבלת זיכרון עבודה).
 */
export const faqGroups: { id: FaqGroup; label: string; intro: string }[] = [
  {
    id: "start",
    label: "לפני שמתחילים",
    intro: "מה זה בכלל מימוש זכויות, איך יודעים אם זה רלוונטי לכם, ומאיפה מתחילים.",
  },
  {
    id: "process",
    label: "התהליך והזמנים",
    intro: "מה בפועל קורה מהרגע שפניתם ועד ההחלטה, וכמה זמן כל שלב לוקח.",
  },
  {
    id: "cost",
    label: "עלות ושכר טרחה",
    intro: "למה לא עושים את זה לבד, ועל מה בדיוק משלמים.",
  },
  {
    id: "rights",
    label: "זכויות וקצבאות",
    intro: "אילו זכויות קיימות, מה ההבדל ביניהן, ומה עושים אחרי דחייה.",
  },
  {
    id: "tax",
    label: "מס ואחוזי נכות",
    intro: "החזרים רטרואקטיביים, וחישוב אחוזי הנכות המשוקלל.",
  },
];

export const OTHER_GROUP = { id: "other", label: "שאלות נוספות" } as const;

/**
 * מקבץ שאלות לפי `group`, בסדר של `faqGroups`. שאלות בלי סיווג (למשל תוכן שנוסף
 * ב-CMS) נאספות לקבוצת "שאלות נוספות" במקום להיעלם.
 */
export function groupFaqs(items: FaqItem[]) {
  const known = faqGroups
    .map((g) => ({ ...g, items: items.filter((f) => f.group === g.id) }))
    .filter((g) => g.items.length > 0);

  const knownIds = new Set(faqGroups.map((g) => g.id as string));
  const rest = items.filter((f) => !f.group || !knownIds.has(f.group));

  return rest.length
    ? [...known, { ...OTHER_GROUP, intro: "", items: rest }]
    : known;
}

/** השאלות שנשארות בדף הבית — הקבוצה הראשונה בלבד, והשאר בעמוד הייעודי. */
export function homepageFaqs(items: FaqItem[]) {
  const primary = items.filter((f) => f.group === "start" || f.group === "cost");
  return primary.length ? primary : items.slice(0, 6);
}
