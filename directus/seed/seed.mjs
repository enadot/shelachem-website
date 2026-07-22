/**
 * טוען את סכמת התוכן ואת התוכן הראשוני אל Directus.
 * רץ מול http://localhost:8055 בתוך רשת הדוקר של השרת (ראה run-seed.sh).
 * אידמפוטנטי: collection/שדה/פריט שכבר קיימים — מדולגים.
 *
 * דורש משתני סביבה (מגיעים מ-.env):
 *   DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD
 *   DIRECTUS_URL (ברירת מחדל http://localhost:8055)
 */
import { readFileSync } from "node:fs";

const BASE = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("חסרים DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD");
  process.exit(1);
}

const data = JSON.parse(readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

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
  if (!res.ok) {
    const err = new Error(json?.errors?.[0]?.message || `${res.status} ${path}`);
    err.status = res.status;
    err.code = json?.errors?.[0]?.extensions?.code;
    throw err;
  }
  return json.data;
}

// --- field helpers ---------------------------------------------------------
const pk = () => ({
  field: "id",
  type: "string",
  meta: { interface: "input", hidden: false },
  schema: { is_primary_key: true, length: 255 },
});
const f = (field, type, extra = {}) => ({ field, type, meta: {}, schema: {}, ...extra });

const SCHEMA = {
  faqs: [pk(), f("question", "string"), f("answer", "text")],
  testimonials: [pk(), f("quote", "text"), f("name", "string"), f("detail", "string"), f("image", "string")],
  articles: [
    pk(), f("slug", "string"), f("title", "string"), f("excerpt", "text"), f("category", "string"),
    f("readingMinutes", "integer"), f("publishedLabel", "string"), f("image", "string"),
    f("featured", "boolean"), f("author", "json"), f("body", "json"), f("related", "json"),
  ],
  doctors: [pk(), f("name", "string"), f("specialty", "string"), f("bio", "text"), f("image", "string")],
  team_members: [pk(), f("name", "string"), f("title", "string"), f("bio", "text"), f("linkedin", "string"), f("image", "string")],
  institutions: [
    pk(), f("slug", "string"), f("name", "string"), f("tagline", "string"), f("description", "text"),
    f("services", "json"), f("heroTitle", "string"), f("heroIntro", "text"), f("approach", "json"),
    f("serviceCards", "json"), f("stats", "json"), f("statsNote", "text"), f("formOptions", "json"),
  ],
  services: [
    pk(), f("slug", "string"), f("name", "string"), f("institutionSlug", "string"), f("heroIntro", "text"),
    f("takeaways", "json"), f("eligibility", "json"), f("eligibilityTip", "text"), f("sections", "json"),
    f("hasTaxCalculator", "boolean"), f("testimonials", "json"), f("faqs", "json"),
    f("relatedRights", "json"), f("resources", "json"),
  ],
  leads: [
    { field: "id", type: "uuid", meta: { interface: "input", hidden: true, readonly: true, special: ["uuid"] }, schema: { is_primary_key: true } },
    f("full_name", "string"), f("phone", "string"), f("email", "string"), f("topic", "string"),
    f("source_page", "string"), f("marketing_consent", "boolean"), f("submitted_at", "timestamp"),
  ],
};

// מיפוי שם collection → מפתח ב-seed-data (team_members ⇢ team)
const DATA_KEY = { team_members: "team" };

async function ensureCollection(name, fields) {
  try {
    await api("GET", `/collections/${name}`);
    console.log(`  = collection '${name}' כבר קיים`);
    return;
  } catch (e) {
    if (e.status !== 403 && e.status !== 404) throw e;
  }
  await api("POST", "/collections", {
    collection: name,
    meta: { singleton: false, note: `Seeded for shelachem site` },
    schema: {},
    fields,
  });
  console.log(`  + נוצר collection '${name}'`);
}

async function seedItems(name) {
  const key = DATA_KEY[name] || name;
  const rows = data[key];
  if (!rows?.length) return;
  const existing = await api("GET", `/items/${name}?limit=1&fields=id`);
  if (existing?.length) {
    console.log(`  = ל-'${name}' כבר יש פריטים — מדלג`);
    return;
  }
  await api("POST", `/items/${name}`, rows);
  console.log(`  + נטענו ${rows.length} פריטים ל-'${name}'`);
}

// הרשאות קריאה ל-policy הציבורי (create בלבד ל-leads)
async function grantPublicRead() {
  let policies;
  try {
    policies = await api("GET", "/policies?fields=id,name,admin_access&limit=-1");
  } catch {
    return false;
  }
  const pub = policies.find((p) => /public/i.test(p.name) && !p.admin_access) || policies.find((p) => !p.admin_access);
  if (!pub) return false;

  const readCollections = ["faqs", "testimonials", "articles", "doctors", "team_members", "institutions", "services"];
  for (const collection of readCollections) {
    try {
      await api("POST", "/permissions", { policy: pub.id, collection, action: "read", fields: ["*"] });
    } catch (e) {
      if (e.status !== 400) throw e; // 400 = כבר קיים
    }
  }
  try {
    await api("POST", "/permissions", {
      policy: pub.id, collection: "leads", action: "create",
      fields: ["full_name", "phone", "email", "topic", "source_page", "marketing_consent", "submitted_at"],
    });
  } catch (e) {
    if (e.status !== 400) throw e;
  }
  return true;
}

// --- run -------------------------------------------------------------------
console.log(`מתחבר ל-Directus (${BASE})…`);
const auth = await api("POST", "/auth/login", { email: EMAIL, password: PASSWORD });
token = auth.access_token;
console.log("מחובר.\n");

console.log("יוצר collections:");
for (const [name, fields] of Object.entries(SCHEMA)) await ensureCollection(name, fields);

console.log("\nטוען תוכן:");
for (const name of Object.keys(SCHEMA)) if (name !== "leads") await seedItems(name);

console.log("\nמגדיר הרשאות ציבוריות (קריאה + יצירת לידים):");
const ok = await grantPublicRead();
console.log(ok ? "  + הרשאות הוגדרו." : "  ! לא נמצא policy ציבורי — הגדר הרשאות קריאה ידנית בממשק (Settings ▸ Access Policies ▸ Public).");

console.log("\n✓ ה-seeding הושלם.");
