/**
 * מוסיף ל-leads את שדה attribution (JSON) — מקור הליד שהאתר שולח:
 * first/last touch (UTM, gclid/fbclid…), עוגיות פיקסלים ו-event_id (docs/marketing.md).
 * ומרחיב את הרשאת ה-create הציבורית של leads לשדה החדש.
 *
 * אידמפוטנטי — אפשר להריץ שוב בבטחה. עד שרץ, האתר שומר לידים בלי השדה.
 * הרצה: bash seed/run-lead-attribution.sh (מתוך תיקיית directus/ על השרת).
 *
 * דורש משתני סביבה (מגיעים מ-.env):
 *   DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD
 *   DIRECTUS_URL (ברירת מחדל http://localhost:8055)
 */

const BASE = process.env.DIRECTUS_URL || "http://localhost:8055";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("חסרים DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD");
  process.exit(1);
}

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
    const err = new Error(json?.errors?.[0]?.message || `${res.status} ${method} ${path}`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

console.log(`מתחבר ל-Directus (${BASE})…`);
token = (await api("POST", "/auth/login", { email: EMAIL, password: PASSWORD })).access_token;

try {
  await api("GET", "/fields/leads/attribution");
  console.log("  = leads.attribution כבר קיים");
} catch (e) {
  if (e.status !== 403 && e.status !== 404) throw e;
  await api("POST", "/fields/leads", {
    field: "attribution",
    type: "json",
    meta: { interface: "input-code", options: { language: "JSON" }, readonly: true, note: "מקור הליד — נכתב אוטומטית מהאתר" },
    schema: {},
  });
  console.log("  + נוצר leads.attribution");
}

const perms = await api(
  "GET",
  "/permissions?filter[collection][_eq]=leads&filter[action][_eq]=create&fields=id,fields,policy&limit=-1",
);
if (!perms.length) {
  console.log("  ! לא נמצאה הרשאת create ל-leads — הוסיפו את attribution ידנית בהרשאה הציבורית.");
}
for (const p of perms) {
  const fields = p.fields ?? [];
  if (fields.includes("*") || fields.includes("attribution")) {
    console.log(`  = הרשאה ${p.id} כבר כוללת את attribution`);
    continue;
  }
  await api("PATCH", `/permissions/${p.id}`, { fields: [...fields, "attribution"] });
  console.log(`  + attribution נוסף להרשאה ${p.id}`);
}

console.log("\n✓ הושלם.");
