/**
 * הגדרות הטפסים של הלוח: הגדרות האתר וכל collection תוכן.
 * כל שדה כאן = שדה ב-Directus באותו שם. להוספת שדה לעורך — מוסיפים אותו כאן
 * (ואם הוא חדש גם ב-CMS — ל-SCHEMA ב-migrate.ts).
 */
import { PATTERNS, type FieldConfig } from "@/lib/admin/fields";

const DAYS = [
  { value: "Sunday", label: "ראשון" },
  { value: "Monday", label: "שני" },
  { value: "Tuesday", label: "שלישי" },
  { value: "Wednesday", label: "רביעי" },
  { value: "Thursday", label: "חמישי" },
  { value: "Friday", label: "שישי" },
  { value: "Saturday", label: "שבת" },
];

/** האיורים שיודע לצייר ServiceVisual (src/components/services/service-visual.tsx). */
export const SERVICE_VISUALS = [
  { value: "accessibility", label: "נגישות ותמיכה" },
  { value: "hands", label: "עזרה צמודה" },
  { value: "child", label: "ילדים ומשפחה" },
  { value: "shield", label: "הגנה ושיקום" },
  { value: "hardhat", label: "עבודה ובטיחות" },
  { value: "lungs", label: "מחלה ובריאות" },
  { value: "pregnancy", label: "הריון" },
  { value: "bandage", label: "פציעה ותאונה" },
  { value: "briefcase", label: "תעסוקה והכנסה" },
  { value: "piggybank", label: "פנסיה וחיסכון" },
  { value: "home-heart", label: "סיעוד בבית" },
  { value: "receipt", label: "מס והחזרים" },
] as const;

const image = (hint?: string): FieldConfig[] => [
  { name: "image_file", label: "תמונה", type: "image", legacyField: "image", hint },
  {
    name: "image_alt",
    label: "תיאור התמונה",
    type: "text",
    hint: "מה רואים בתמונה — לקוראי מסך ולגוגל. ריק = תמונה דקורטיבית.",
  },
];

const link = (name = "href", label = "קישור"): FieldConfig => ({
  name,
  label,
  type: "text",
  ltr: true,
  half: true,
  hint: "נתיב באתר (/services/…) או כתובת מלאה",
});

const slug: FieldConfig = {
  name: "slug",
  label: "כתובת העמוד (slug)",
  type: "text",
  required: true,
  ltr: true,
  half: true,
  pattern: PATTERNS.slug,
  hint: "החלק האחרון בכתובת. שינוי שלו שובר קישורים קיימים.",
};

export const SETTINGS_FIELDS: FieldConfig[] = [
  {
    name: "phone",
    label: "טלפון ראשי",
    type: "text",
    ltr: true,
    half: true,
    pattern: PATTERNS.phone,
    hint: "מופיע ב-header, בפוטר, בבר המובייל ובכל כפתורי החיוג.",
  },
  {
    name: "whatsapp_number",
    label: "וואטסאפ",
    type: "text",
    ltr: true,
    half: true,
    pattern: PATTERNS.phone,
    hint: "מספר שמחובר לוואטסאפ, למשל 03-8002000.",
  },
  {
    name: "email",
    label: "דוא״ל ליצירת קשר",
    type: "text",
    ltr: true,
    half: true,
    pattern: PATTERNS.email,
  },
  {
    name: "socials",
    label: "רשתות חברתיות",
    type: "group",
    hint: "כתובת מלאה לעמוד של החברה. ריק = לא מוצג.",
    fields: ["facebook", "instagram", "youtube", "tiktok", "linkedin"].map((k) => ({
      name: k,
      label: k === "youtube" ? "YouTube" : k === "tiktok" ? "TikTok" : k === "linkedin" ? "LinkedIn" : k === "facebook" ? "Facebook" : "Instagram",
      type: "text" as const,
      ltr: true,
      half: true,
      pattern: PATTERNS.url,
    })),
  },
  {
    name: "branches",
    label: "סניפים",
    type: "repeater",
    itemLabel: "סניף",
    itemTitle: "city",
    hint: "מוצגים בעמוד הסניפים, בפוטר ובנתונים המובנים לגוגל.",
    fields: [
      { name: "city", label: "עיר", type: "text", required: true, half: true },
      { name: "address", label: "כתובת", type: "text", required: true, half: true },
      { name: "phone", label: "טלפון הסניף", type: "text", ltr: true, half: true, pattern: PATTERNS.phone },
      {
        name: "id",
        label: "מזהה באנגלית",
        type: "text",
        ltr: true,
        half: true,
        pattern: PATTERNS.slug,
        hint: "למשל jerusalem. משמש לעוגן בעמוד.",
      },
      { name: "googleMapsUrl", label: "קישור Google Maps", type: "text", ltr: true, half: true, pattern: PATTERNS.url, hint: "ריק = ייווצר מהכתובת" },
      { name: "wazeUrl", label: "קישור Waze", type: "text", ltr: true, half: true, pattern: PATTERNS.url, hint: "ריק = ייווצר מהכתובת" },
      { name: "arrival", label: "איך מגיעים", type: "string-list", itemLabel: "שורה" },
      { name: "accessibility", label: "נגישות", type: "string-list", itemLabel: "שורה" },
      { name: "lat", label: "קו רוחב (lat)", type: "number", ltr: true, half: true, hint: "מהפין ב-Google Business Profile" },
      { name: "lng", label: "קו אורך (lng)", type: "number", ltr: true, half: true },
    ],
  },
  {
    name: "opening_hours",
    label: "שעות פעילות",
    type: "repeater",
    itemLabel: "טווח שעות",
    itemTitle: "opens",
    hint: "מוצגות לגוגל (תוצאות חיפוש ומפות). להשאיר ריק אם השעות לא ידועות — שעות שגויות גרועות מהיעדרן.",
    fields: [
      { name: "days", label: "ימים", type: "checkboxes", options: DAYS, required: true },
      { name: "opens", label: "פתיחה", type: "text", ltr: true, half: true, required: true, placeholder: "09:00", pattern: PATTERNS.time },
      { name: "closes", label: "סגירה", type: "text", ltr: true, half: true, required: true, placeholder: "17:00", pattern: PATTERNS.time },
    ],
  },
  ...(["leads_webhook_url", "leads_quiz_webhook_url"] as const).map(
    (name): FieldConfig => ({
      name,
      label:
        name === "leads_webhook_url"
          ? "BARAM Leads — ערוץ “לידים מהאתר”"
          : "BARAM Leads — ערוץ “שאלון” (בדיקת הזכאות בדף הבית)",
      type: "text",
      ltr: true,
      pattern: {
        re: /^https:\/\/leads\.baram\.digital\/api\/ingest\/[A-Za-z0-9_-]{16,64}$/,
        message: "כתובת webhook של BARAM Leads, למשל https://leads.baram.digital/api/ingest/…",
      },
      hint:
        name === "leads_webhook_url"
          ? "כל ליד מהאתר נשלח לכאן (בנוסף לשמירה במערכת התוכן). BARAM Leads ▸ הערוץ ▸ כתובת webhook."
          : "לידים משאלון הזכאות. אם הערוץ כבוי, הליד נשלח לערוץ האתר במקום — כך שלא הולך לאיבוד.",
    }),
  ),
  { name: "hero_image", label: "תמונת ההירו בדף הבית", type: "image", hint: "תמונת הצוות. רצוי PNG עם רקע שקוף, לפחות 1500px רוחב." },
  { name: "hero_image_alt", label: "תיאור תמונת ההירו", type: "text" },
];

export interface CollectionConfig {
  label: string;
  singular: string;
  /** השדה שמשמש ככותרת ברשימה. */
  titleField: string;
  subtitleField?: string;
  /** עמוד באתר שבו הפריט מופיע. */
  publicPath: (item: Record<string, unknown>) => string;
  description?: string;
  fields: FieldConfig[];
}

export const COLLECTIONS = {
  articles: {
    label: "כתבות מגזין",
    singular: "כתבה",
    titleField: "title",
    subtitleField: "category",
    publicPath: (i) => `/magazine/${i.slug}`,
    description: "כתבה בלי גוף (פסקאות) לא מוצגת באתר — כך אפשר לשמור טיוטות.",
    fields: [
      { name: "title", label: "כותרת", type: "text", required: true, maxLength: 140 },
      slug,
      {
        name: "category",
        label: "קטגוריה",
        type: "select",
        half: true,
        required: true,
        options: [
          { value: "מדריכים", label: "מדריכים" },
          { value: "חדשות", label: "חדשות" },
          { value: "סיפורי הצלחה", label: "סיפורי הצלחה" },
        ],
      },
      { name: "excerpt", label: "תקציר", type: "textarea", required: true, rows: 3, hint: "מופיע בכרטיס, בגוגל ובשיתוף ברשתות." },
      { name: "readingMinutes", label: "דקות קריאה", type: "number", half: true },
      { name: "publishedAt", label: "תאריך פרסום", type: "date", half: true },
      { name: "publishedLabel", label: "תאריך לתצוגה", type: "text", half: true, placeholder: "יוני 2026" },
      { name: "featured", label: "כתבה מובלטת", type: "boolean", hint: "מוצגת ראשונה במגזין." },
      ...image("צילום רחב, לפחות 1600px."),
      {
        name: "keyPoints",
        label: "בשורה התחתונה",
        type: "string-list",
        itemLabel: "נקודה",
        rows: 2,
        hint: "2–4 עובדות שעונות ישירות על שאלת הקורא — בראש הכתבה. זה מה שגוגל ומנועי AI מצטטים.",
      },
      {
        name: "body",
        label: "גוף הכתבה",
        type: "repeater",
        itemLabel: "פרק",
        itemTitle: "heading",
        hint: "כל פרק מקבל כותרת ופסקאות. הכותרות בונות את תוכן העניינים.",
        fields: [
          { name: "heading", label: "כותרת הפרק", type: "text", half: true },
          { name: "id", label: "עוגן (באנגלית)", type: "text", ltr: true, half: true, pattern: PATTERNS.slug, hint: "לקישור ישיר לפרק" },
          { name: "paragraphs", label: "פסקאות", type: "string-list", itemLabel: "פסקה", rows: 4, hint: "פסקה שמתחילה ב-\"### \" מוצגת ככותרת משנה. כתובת https://… הופכת לקישור. בפרק עם העוגן faq: \"### שאלה\" ואחריה פסקת התשובה." },
          { name: "bullets", label: "רשימת תבליטים", type: "string-list", itemLabel: "תבליט", rows: 1 },
        ],
      },
      {
        name: "author",
        label: "כותב/ת",
        type: "group",
        fields: [
          { name: "name", label: "שם", type: "text", half: true },
          { name: "role", label: "תפקיד", type: "text", half: true },
          { name: "bio", label: "כמה מילים", type: "textarea", rows: 2 },
        ],
      },
      {
        name: "related",
        label: "כתבות קשורות",
        type: "string-list",
        itemLabel: "כתבה",
        hint: "ה-slug של כתבות אחרות. ריק = שלוש הכתבות האחרונות.",
      },
    ],
  },
  faqs: {
    label: "שאלות נפוצות",
    singular: "שאלה",
    titleField: "question",
    subtitleField: "group",
    publicPath: () => "/faq",
    fields: [
      { name: "question", label: "שאלה", type: "text", required: true },
      { name: "answer", label: "תשובה", type: "textarea", required: true, rows: 6 },
      {
        name: "group",
        label: "קבוצה בעמוד השאלות",
        type: "select",
        half: true,
        options: [
          { value: "start", label: "לפני שמתחילים" },
          { value: "process", label: "התהליך והזמנים" },
          { value: "cost", label: "עלות ושכר טרחה" },
          { value: "rights", label: "זכויות וקצבאות" },
          { value: "tax", label: "מס ואחוזי נכות" },
        ],
      },
    ],
  },
  testimonials: {
    label: "המלצות",
    singular: "המלצה",
    titleField: "name",
    subtitleField: "detail",
    publicPath: () => "/",
    fields: [
      { name: "quote", label: "ההמלצה", type: "textarea", required: true, rows: 4 },
      { name: "name", label: "שם", type: "text", required: true, half: true },
      { name: "detail", label: "הזכות שהושגה", type: "text", half: true, placeholder: "קצבת נכות כללית" },
      ...image(),
    ],
  },
  doctors: {
    label: "רופאים",
    singular: "רופא/ה",
    titleField: "name",
    subtitleField: "specialty",
    publicPath: () => "/doctors",
    fields: [
      { name: "name", label: "שם", type: "text", required: true, half: true },
      {
        name: "specialty",
        label: "התמחות",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "internal", label: "רפואה פנימית" },
          { value: "ortho", label: "אורתופדיה" },
          { value: "cardio", label: "קרדיולוגיה" },
          { value: "neuro", label: "נוירולוגיה" },
          { value: "psych", label: "פסיכיאטריה" },
          { value: "onco", label: "אונקולוגיה" },
        ],
      },
      { name: "bio", label: "קצת עליו/ה", type: "textarea", rows: 4 },
      ...image("תמונת פנים, ריבועית."),
    ],
  },
  team_members: {
    label: "צוות",
    singular: "איש/אשת צוות",
    titleField: "name",
    subtitleField: "title",
    publicPath: () => "/team",
    fields: [
      { name: "name", label: "שם", type: "text", required: true, half: true },
      { name: "title", label: "תפקיד", type: "text", required: true, half: true },
      { name: "bio", label: "קצת עליו/ה", type: "textarea", rows: 4 },
      { name: "linkedin", label: "LinkedIn", type: "text", ltr: true, pattern: PATTERNS.url },
      ...image("תמונת פנים, ריבועית."),
    ],
  },
  institutions: {
    label: "מוסדות",
    singular: "מוסד",
    titleField: "name",
    subtitleField: "tagline",
    publicPath: (i) => `/institutions/${i.slug}`,
    fields: [
      { name: "name", label: "שם המוסד", type: "text", required: true, half: true },
      slug,
      { name: "tagline", label: "שורת תיאור קצרה", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", rows: 3, hint: "מופיע ברשימת המוסדות ובגוגל." },
      { name: "heroTitle", label: "כותרת העמוד", type: "text", hint: "החלק שאחרי “ — ” מודגש. למשל: ביטוח לאומי — בלי לוותר על שקל" },
      { name: "heroIntro", label: "פתיח", type: "textarea", rows: 3 },
      ...image("צילום רחב לכותרת העמוד."),
      {
        name: "services",
        label: "זכויות מול המוסד",
        type: "repeater",
        itemLabel: "זכות",
        itemTitle: "name",
        fields: [{ name: "name", label: "שם", type: "text", required: true, half: true }, link()],
      },
      {
        name: "approach",
        label: "איך אנחנו עובדים",
        type: "repeater",
        itemLabel: "שלב",
        itemTitle: "title",
        fields: [
          { name: "title", label: "כותרת", type: "text", required: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 3 },
        ],
      },
      {
        name: "serviceCards",
        label: "כרטיסי שירות",
        type: "repeater",
        itemLabel: "כרטיס",
        itemTitle: "name",
        fields: [
          { name: "name", label: "שם", type: "text", required: true, half: true },
          { name: "tag", label: "תגית", type: "text", half: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 3 },
          link(),
        ],
      },
      {
        name: "stats",
        label: "מספרים",
        type: "repeater",
        itemLabel: "מספר",
        itemTitle: "value",
        fields: [
          { name: "value", label: "ערך", type: "text", required: true, half: true, placeholder: "87%" },
          { name: "label", label: "הסבר", type: "text", required: true, half: true },
          { name: "accent", label: "הדגשה", type: "boolean" },
        ],
      },
      { name: "statsNote", label: "הערה מתחת למספרים", type: "textarea", rows: 2 },
      {
        name: "formOptions",
        label: "נושאים בטופס הפנייה",
        type: "string-list",
        itemLabel: "נושא",
        hint: "האפשרויות ברשימה הנפתחת בטופס של עמוד המוסד.",
      },
    ],
  },
  services: {
    label: "שירותים",
    singular: "שירות",
    titleField: "name",
    subtitleField: "institutionSlug",
    publicPath: (i) => `/services/${i.slug}`,
    fields: [
      { name: "name", label: "שם השירות", type: "text", required: true, half: true },
      slug,
      {
        name: "institutionSlug",
        label: "המוסד (slug)",
        type: "text",
        ltr: true,
        half: true,
        required: true,
        pattern: PATTERNS.slug,
        hint: "למשל mas-hachnasa — ה-slug של המוסד שהשירות שייך אליו.",
      },
      { name: "hasTaxCalculator", label: "להציג מחשבון החזר מס", type: "boolean" },
      { name: "heroIntro", label: "פתיח", type: "textarea", rows: 3, required: true },
      ...image("צילום רחב לכותרת העמוד. בלי צילום — מוצג האיור שנבחר למטה."),
      {
        name: "visual",
        label: "איור (כשאין צילום)",
        type: "select",
        half: true,
        options: SERVICE_VISUALS,
        hint: "מוצג בכותרת העמוד רק כשלא הועלתה תמונה.",
      },
      { name: "overview", label: "מה זה בעצם", type: "string-list", itemLabel: "פסקה", rows: 3 },
      { name: "takeaways", label: "עיקרי הדברים", type: "string-list", itemLabel: "נקודה", rows: 2 },
      {
        name: "eligibility",
        label: "מי זכאי",
        type: "repeater",
        itemLabel: "תנאי",
        itemTitle: "title",
        fields: [
          { name: "title", label: "כותרת", type: "text", required: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 2 },
        ],
      },
      { name: "eligibilityTip", label: "טיפ זכאות", type: "textarea", rows: 2 },
      {
        name: "rights",
        label: "מה כוללת הזכאות",
        type: "repeater",
        itemLabel: "רכיב",
        itemTitle: "title",
        hint: "במונחים כלליים — בלי סכומים מדויקים שמתעדכנים מדי שנה.",
        fields: [
          { name: "title", label: "כותרת", type: "text", required: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 2 },
        ],
      },
      { name: "rightsNote", label: "הערה מתחת לזכאות", type: "textarea", rows: 2 },
      {
        name: "process",
        label: "שלבי התהליך מול הגוף",
        type: "repeater",
        itemLabel: "שלב",
        itemTitle: "title",
        fields: [
          { name: "title", label: "כותרת", type: "text", required: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 2 },
        ],
      },
      {
        name: "mistakes",
        label: "טעויות נפוצות",
        type: "repeater",
        itemLabel: "טעות",
        itemTitle: "title",
        fields: [
          { name: "title", label: "כותרת", type: "text", required: true },
          { name: "description", label: "תיאור", type: "textarea", rows: 2 },
        ],
      },
      {
        name: "sections",
        label: "פרקי התוכן",
        type: "repeater",
        itemLabel: "פרק",
        itemTitle: "heading",
        fields: [
          { name: "heading", label: "כותרת", type: "text", required: true, half: true },
          { name: "id", label: "עוגן (באנגלית)", type: "text", ltr: true, half: true, pattern: PATTERNS.slug },
          { name: "paragraphs", label: "פסקאות", type: "string-list", itemLabel: "פסקה", rows: 4, hint: "פסקה שמתחילה ב-\"### \" מוצגת ככותרת משנה. כתובת https://… הופכת לקישור. בפרק עם העוגן faq: \"### שאלה\" ואחריה פסקת התשובה." },
        ],
      },
      {
        name: "testimonials",
        label: "המלצות בעמוד",
        type: "repeater",
        itemLabel: "המלצה",
        itemTitle: "name",
        fields: [
          { name: "quote", label: "ההמלצה", type: "textarea", required: true, rows: 3 },
          { name: "name", label: "שם", type: "text", required: true, half: true },
          { name: "detail", label: "פרט", type: "text", half: true },
        ],
      },
      {
        name: "faqs",
        label: "שאלות נפוצות בעמוד",
        type: "repeater",
        itemLabel: "שאלה",
        itemTitle: "question",
        fields: [
          { name: "question", label: "שאלה", type: "text", required: true },
          { name: "answer", label: "תשובה", type: "textarea", required: true, rows: 4 },
        ],
      },
      {
        name: "relatedRights",
        label: "זכויות קשורות",
        type: "repeater",
        itemLabel: "זכות",
        itemTitle: "name",
        fields: [{ name: "name", label: "שם", type: "text", required: true, half: true }, link()],
      },
      {
        name: "resources",
        label: "חומרי קריאה",
        type: "repeater",
        itemLabel: "קישור",
        itemTitle: "title",
        fields: [{ name: "title", label: "כותרת", type: "text", required: true, half: true }, link()],
      },
    ],
  },
} satisfies Record<string, CollectionConfig>;

export type CollectionSlug = keyof typeof COLLECTIONS;
export const isCollection = (s: string): s is CollectionSlug => s in COLLECTIONS;

/** כל הטפסים שהרכיב הגנרי יודע לרנדר. */
export const FORMS: Record<"settings" | CollectionSlug, { fields: FieldConfig[] }> = {
  settings: { fields: SETTINGS_FIELDS },
  ...COLLECTIONS,
};
