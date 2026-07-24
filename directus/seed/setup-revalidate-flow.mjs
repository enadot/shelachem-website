/**
 * מקים ב-Directus את ה-Flow שמרענן את האתר בכל שינוי תוכן:
 * כל create/update/delete באחד מ-collections התוכן ⇒
 * POST אל SITE_ORIGIN/api/revalidate?secret=REVALIDATE_SECRET.
 *
 * אידמפוטנטי: אם ה-Flow כבר קיים — רק מעדכן את כתובת היעד/הסוד.
 * הרצה: bash seed/run-revalidate-flow.sh (מתוך תיקיית directus/ על השרת).
 *
 * דורש משתני סביבה (מגיעים מ-.env):
 *   DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD, REVALIDATE_SECRET
 *   SITE_ORIGIN (ברירת מחדל https://www.shelachem.net)
 *   DIRECTUS_URL (ברירת מחדל http://localhost:8055)
 */

const BASE = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
const SECRET = process.env.REVALIDATE_SECRET;
const SITE = (process.env.SITE_ORIGIN || "https://www.shelachem.net").replace(/\/$/, "");
if (!EMAIL || !PASSWORD) {
  console.error("חסרים DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD");
  process.exit(1);
}
if (!SECRET) {
  console.error("חסר REVALIDATE_SECRET (run-revalidate-flow.sh מייצר אחד אוטומטית)");
  process.exit(1);
}

const FLOW_NAME = "רענון האתר בשינוי תוכן";
// כל collections התוכן שהאתר קורא (leads בכוונה לא כאן — פניות לא משנות את התוכן).
const COLLECTIONS = [
  "faqs",
  "testimonials",
  "articles",
  "doctors",
  "team_members",
  "institutions",
  "services",
  "globals",
];
const TARGET_URL = `${SITE}/api/revalidate?secret=${SECRET}`;

let token = "";
async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.errors?.[0]?.message || `${res.status} ${method} ${path}`);
  return json.data;
}

token = (await api("POST", "/auth/login", { email: EMAIL, password: PASSWORD })).access_token;

const existing = (
  await api("GET", `/flows?filter[name][_eq]=${encodeURIComponent(FLOW_NAME)}&fields=id,operation`)
)[0];

if (existing) {
  await api("PATCH", `/flows/${existing.id}`, {
    status: "active",
    options: {
      type: "action",
      scope: ["items.create", "items.update", "items.delete"],
      collections: COLLECTIONS,
    },
  });
  if (existing.operation) {
    await api("PATCH", `/operations/${existing.operation}`, {
      options: { method: "POST", url: TARGET_URL },
    });
  }
  console.log(`✓ ה-Flow "${FLOW_NAME}" כבר קיים — עודכן (${COLLECTIONS.length} collections).`);
} else {
  const flow = await api("POST", "/flows", {
    name: FLOW_NAME,
    icon: "published_with_changes",
    color: "#0000FF",
    status: "active",
    trigger: "event",
    accountability: "all",
    options: {
      type: "action",
      scope: ["items.create", "items.update", "items.delete"],
      collections: COLLECTIONS,
    },
  });
  const op = await api("POST", "/operations", {
    flow: flow.id,
    name: "רענון האתר",
    key: "revalidate_site",
    type: "request",
    position_x: 19,
    position_y: 1,
    options: { method: "POST", url: TARGET_URL },
  });
  await api("PATCH", `/flows/${flow.id}`, { operation: op.id });
  console.log(`✓ נוצר Flow "${FLOW_NAME}" (${COLLECTIONS.length} collections).`);
}

console.log(`  יעד: ${SITE}/api/revalidate?secret=***`);
console.log("  ⚠ ודא שאותו REVALIDATE_SECRET מוגדר גם במשתני הסביבה של האתר (Vercel).");
