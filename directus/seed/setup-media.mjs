/**
 * מקים את שכבת המדיה ב-Directus — העלאת תמונות דרך ה-CMS:
 *  - collection יחיד (singleton) בשם globals עם תמונת ההירו (hero_image + alt)
 *  - שדה העלאת קובץ image_file בכל collection תוכן עם תמונות
 *    (השדה הישן image נשאר לתאימות אך מוסתר מהעורכים)
 *  - הרשאות ציבוריות: קריאת globals וקריאת קבצים (בשביל /assets)
 *
 * אידמפוטנטי — אפשר להריץ שוב בבטחה.
 * הרצה: bash seed/run-media-setup.sh (מתוך תיקיית directus/ על השרת).
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

// collections תוכן שמקבלים שדה העלאת תמונה
const IMAGE_COLLECTIONS = ["testimonials", "articles", "doctors", "team_members"];

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

async function exists(path) {
  try {
    await api("GET", path);
    return true;
  } catch (e) {
    if (e.status === 403 || e.status === 404) return false;
    throw e;
  }
}

/** שדה קובץ (uuid + relation ל-directus_files) — כמו שהאפליקציה של Directus יוצרת. */
async function ensureFileField(collection, field, note) {
  if (await exists(`/fields/${collection}/${field}`)) {
    console.log(`  = ${collection}.${field} כבר קיים`);
    return;
  }
  await api("POST", `/fields/${collection}`, {
    field,
    type: "uuid",
    meta: { interface: "file-image", special: ["file"], note },
    schema: {},
  });
  try {
    await api("POST", "/relations", {
      collection,
      field,
      related_collection: "directus_files",
      schema: { on_delete: "SET NULL" },
    });
  } catch (e) {
    if (e.status !== 400) throw e; // 400 = ה-relation כבר קיים
  }
  console.log(`  + נוסף שדה תמונה ${collection}.${field}`);
}

console.log(`מתחבר ל-Directus (${BASE})…`);
token = (await api("POST", "/auth/login", { email: EMAIL, password: PASSWORD })).access_token;
console.log("מחובר.\n");

// --- globals (singleton) ---------------------------------------------------
console.log("globals (הגדרות אתר):");
if (await exists("/collections/globals")) {
  console.log("  = collection 'globals' כבר קיים");
} else {
  await api("POST", "/collections", {
    collection: "globals",
    meta: { singleton: true, note: "הגדרות אתר — תמונת הירו ועוד", icon: "settings" },
    schema: {},
    fields: [
      {
        field: "id",
        type: "integer",
        meta: { hidden: true },
        schema: { is_primary_key: true, has_auto_increment: true },
      },
    ],
  });
  console.log("  + נוצר collection 'globals'");
}
await ensureFileField("globals", "hero_image", "תמונת הצוות בהירו של דף הבית");
if (!(await exists("/fields/globals/hero_image_alt"))) {
  await api("POST", "/fields/globals", {
    field: "hero_image_alt",
    type: "string",
    meta: { interface: "input", note: "תיאור התמונה לקוראי מסך" },
    schema: {},
  });
  console.log("  + נוסף שדה globals.hero_image_alt");
} else {
  console.log("  = globals.hero_image_alt כבר קיים");
}

// --- שדות תמונה ל-collections התוכן ---------------------------------------
console.log("\nשדות העלאת תמונה:");
for (const collection of IMAGE_COLLECTIONS) {
  await ensureFileField(collection, "image_file", "העלאת תמונה — עדיף על שדה הטקסט הישן");
  // מסתירים מהעורכים את שדה הטקסט הישן (נשאר לתאימות לאחור לתוכן שנטען ב-seed)
  try {
    await api("PATCH", `/fields/${collection}/image`, {
      meta: { hidden: true, note: "ישן — נתיב סטטי. השתמשו ב-image_file" },
    });
  } catch (e) {
    if (e.status !== 403 && e.status !== 404) throw e;
  }
}

// --- הרשאות ציבוריות -------------------------------------------------------
console.log("\nהרשאות ציבוריות (globals + קבצים):");
const policies = await api("GET", "/policies?fields=id,name,admin_access&limit=-1");
const pub =
  policies.find((p) => /public/i.test(p.name) && !p.admin_access) ||
  policies.find((p) => !p.admin_access);
if (!pub) {
  console.log("  ! לא נמצא policy ציבורי — הגדר ידנית קריאה ל-globals ול-directus_files.");
} else {
  for (const collection of ["globals", "directus_files"]) {
    try {
      await api("POST", "/permissions", { policy: pub.id, collection, action: "read", fields: ["*"] });
      console.log(`  + קריאה ציבורית ל-${collection}`);
    } catch (e) {
      if (e.status !== 400) throw e;
      console.log(`  = קריאה ציבורית ל-${collection} כבר קיימת`);
    }
  }
}

console.log("\n✓ שכבת המדיה מוכנה. העלאת תמונת ההירו: Directus ▸ globals ▸ hero_image.");
