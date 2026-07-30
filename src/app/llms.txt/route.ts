import { branches, site } from "@/lib/config";
import { getArticles, getInstitutions, getServices } from "@/lib/content";

/**
 * `/llms.txt` — אינדקס קריא-למודל של האתר (llmstxt.org).
 *
 * למה: מנוע מענה שמגיע לאתר בזמן שאלה צריך למצוא במהירות מה החברה עושה, מול איזה
 * מוסדות, ואיפה התוכן המהימן. HTML מלא של עמוד בית בן 9,500px הוא מקור גרוע
 * לצורך הזה; קובץ טקסט מרוכז הוא מקור טוב.
 *
 * מיוצר מהתוכן האמיתי (Directus או תוכן מקומי), כדי שלא יתיישן כשמוסיפים שירות
 * או כתבה. ISR של שעה, כמו שאר האתר.
 */
export const revalidate = 3600;

export async function GET() {
  const [institutions, services, articles] = await Promise.all([
    getInstitutions(),
    getServices(),
    getArticles(),
  ]);

  const url = (path: string) => `${site.domain}${path}`;
  const list = (rows: { label: string; href: string; note?: string }[]) =>
    rows.map((r) => `- [${r.label}](${url(r.href)})${r.note ? `: ${r.note}` : ""}`).join("\n");

  const body = `# ${site.name}

> חברה ישראלית למימוש זכויות רפואיות: ליווי מלא של אנשים עם מצב רפואי ומשפחותיהם מול
> ביטוח לאומי, רשות המסים, קרנות פנסיה, חברות ביטוח ומשרד הרישוי — כולל חוות דעת
> רפואיות והכנה לוועדות רפואיות. בדיקת זכאות ראשונית ללא עלות, ${site.feeModel}.

עובדות על החברה:

- שם משפטי: ${site.legalName}
- שנת ייסוד: ${site.foundedYear}
- שנות פעילות שהחברה מצהירה עליהן: ${site.stats.years}
- לקוחות שליוותה עד לקבלת הזכות (נתון שהחברה מצהירה עליו): ${site.stats.clients}
- מודל תשלום: ${site.feeModel} — אין תשלום מראש
- שפת השירות: עברית
- אזור שירות: כל ישראל (פגישות פיזיות בשני סניפים, ליווי טלפוני ובזום בכל הארץ)
- טלפון: ${site.phone}
- דוא״ל: ${site.email}
- סניפים:
${branches.map((b) => `  - ${b.city}: ${b.address} · ${b.phone}`).join("\n")}

## מוסדות ובירוקרטיה

התחומים שבהם החברה מלווה, לפי הגוף שמולו מתנהל התיק:

${list(
  institutions.map((i) => ({
    label: i.name,
    href: `/institutions/${i.slug}`,
    note: i.tagline || i.description,
  })),
)}

## שירותים

${list(
  services.map((s) => ({
    label: s.name,
    href: `/services/${s.slug}`,
    note: s.heroIntro,
  })),
)}

## שאלות ותשובות

${list([
  {
    label: "שאלות ותשובות — מימוש זכויות רפואיות",
    href: "/faq",
    note: "השאלות הנפוצות על זכאות, אחוזי נכות, החזרי מס, ועדות רפואיות ומודל שכר הטרחה",
  },
])}

## מגזין

מדריכים, עדכוני חוק וסיפורי הצלחה:

${list(
  articles.map((a) => ({
    label: a.title,
    href: `/magazine/${a.slug}`,
    note: a.excerpt,
  })),
)}

## על החברה

${list([
  { label: "הסיפור שלנו", href: "/about", note: "רקע, ערכים ודרך העבודה" },
  { label: "צוות ההנהלה", href: "/team" },
  { label: "הרופאים והמומחים", href: "/doctors", note: "הצוות הרפואי שכותב חוות דעת ומכין לוועדות" },
  { label: "סניפים ויצירת קשר", href: "/branches", note: "כתובות, הוראות הגעה ונגישות" },
])}

## Optional

${list([
  { label: "מדיניות פרטיות", href: "/privacy" },
  { label: "הצהרת נגישות", href: "/accessibility" },
])}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
