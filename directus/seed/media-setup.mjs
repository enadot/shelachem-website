/**
 * מעלה את קבצי המדיה של האתר (public/images) אל ספריית הקבצים של Directus,
 * מאפשר קריאה ציבורית לקבצים, ומעדכן את שדות ה-image בתוכן שנטען
 * מ-"/images/xxx" ל-URL של ה-asset ב-Directus.
 *
 * הרצה: bash seed/run-media-setup.sh  (מתוך תיקיית directus/)
 * אידמפוטנטי: קובץ שכבר הועלה — מדולג; שדה image שכבר מצביע ל-Directus — לא נוגעים.
 *
 * משתני סביבה (מגיעים מ-.env):
 *   DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD
 *   DIRECTUS_URL         (ברירת מחדל http://localhost:8055) — לשימוש ה-API
 *   DIRECTUS_PUBLIC_URL  (אופציונלי) — הכתובת שתיכתב ל-URLים של התמונות
 *   MEDIA_DIR            (ברירת מחדל /media) — התיקייה שממנה מעלים
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const BASE = process.env.DIRECTUS_URL || "http://localhost:8055";
const PUBLIC_BASE = (process.env.DIRECTUS_PUBLIC_URL || BASE).replace(/\/$/, "");
const MEDIA_DIR = process.env.MEDIA_DIR || "/media";
const FOLDER_NAME = "shelachem";
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("חסרים DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD");
  process.exit(1);
}

const MIME = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

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
    throw err;
  }
  return json.data;
}

async function ensureFolder() {
  const found = await api(
    "GET",
    `/folders?filter[name][_eq]=${encodeURIComponent(FOLDER_NAME)}&fields=id&limit=1`,
  );
  if (found?.length) return found[0].id;
  const created = await api("POST", "/folders", { name: FOLDER_NAME });
  return created.id;
}

async function uploadFile(folder, dir, name) {
  const ext = extname(name).toLowerCase();
  const form = new FormData();
  form.append("folder", folder);
  form.append("title", name.replace(ext, ""));
  form.append(
    "file",
    new Blob([readFileSync(join(dir, name))], { type: MIME[ext] || "application/octet-stream" }),
    name,
  );
  const res = await fetch(`${BASE}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.errors?.[0]?.message || `העלאת ${name} נכשלה (${res.status})`);
  return json.data.id;
}

/** מעלה את כל התמונות ומחזיר מפה: "/images/<name>" → URL של ה-asset */
async function uploadMedia(folder) {
  let names;
  try {
    names = readdirSync(MEDIA_DIR).filter(
      (n) => MIME[extname(n).toLowerCase()] && statSync(join(MEDIA_DIR, n)).isFile(),
    );
  } catch {
    console.log(`  ! לא נמצאה תיקיית מדיה ב-${MEDIA_DIR} — מדלג על העלאה`);
    return {};
  }

  const existing = await api(
    "GET",
    `/files?filter[folder][_eq]=${folder}&fields=id,filename_download&limit=-1`,
  );
  const byName = new Map(existing.map((file) => [file.filename_download, file.id]));

  const map = {};
  for (const name of names.sort()) {
    let id = byName.get(name);
    if (id) {
      console.log(`  = '${name}' כבר קיים`);
    } else {
      id = await uploadFile(folder, MEDIA_DIR, name);
      console.log(`  + הועלה '${name}'`);
    }
    map[`/images/${name}`] = `${PUBLIC_BASE}/assets/${id}`;
  }
  return map;
}

async function grantPublicFileRead() {
  let policies;
  try {
    policies = await api("GET", "/policies?fields=id,name,admin_access&limit=-1");
  } catch {
    return false;
  }
  const pub =
    policies.find((p) => /public/i.test(p.name) && !p.admin_access) ||
    policies.find((p) => !p.admin_access);
  if (!pub) return false;
  for (const collection of ["directus_files", "directus_folders"]) {
    try {
      await api("POST", "/permissions", { policy: pub.id, collection, action: "read", fields: ["*"] });
    } catch (e) {
      if (e.status !== 400) throw e; // 400 = ההרשאה כבר קיימת
    }
  }
  return true;
}

/** מחליף נתיבים מקומיים ב-URLים של Directus בשדות ה-image של התוכן */
async function relinkContent(map) {
  if (!Object.keys(map).length) return;
  const collections = ["articles", "testimonials", "doctors", "team_members"];
  for (const collection of collections) {
    let rows;
    try {
      rows = await api("GET", `/items/${collection}?fields=id,image&limit=-1`);
    } catch (e) {
      if (e.status === 403 || e.status === 404) continue; // ה-collection לא נטען
      throw e;
    }
    let updated = 0;
    for (const row of rows ?? []) {
      const next = map[row.image];
      if (!next || next === row.image) continue;
      await api("PATCH", `/items/${collection}/${encodeURIComponent(row.id)}`, { image: next });
      updated += 1;
    }
    console.log(
      updated ? `  + עודכנו ${updated} תמונות ב-'${collection}'` : `  = אין מה לעדכן ב-'${collection}'`,
    );
  }
}

// --- run -------------------------------------------------------------------
console.log(`מתחבר ל-Directus (${BASE})…`);
const auth = await api("POST", "/auth/login", { email: EMAIL, password: PASSWORD });
token = auth.access_token;
console.log("מחובר.\n");

console.log(`מעלה מדיה מ-${MEDIA_DIR}:`);
const folder = await ensureFolder();
const map = await uploadMedia(folder);

console.log("\nמגדיר קריאה ציבורית לקבצים:");
const ok = await grantPublicFileRead();
console.log(
  ok
    ? "  + הרשאות הוגדרו."
    : "  ! לא נמצא policy ציבורי — הגדר קריאה ל-directus_files ידנית (Settings ▸ Access Policies ▸ Public).",
);

console.log("\nמקשר תמונות לתוכן:");
await relinkContent(map);

console.log(`\n✓ הגדרת המדיה הושלמה. תמונות מוגשות מ-${PUBLIC_BASE}/assets/<id>`);
console.log("  שים לב: כדי ש-next/image יציג אותן, הגדר DIRECTUS_URL באתר (ראה next.config.ts).");
