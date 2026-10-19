/**
 * רץ לפני `next build`. ב-production של Vercel בלבד (שם יש DATABASE_URL):
 * מריץ מיגרציות ו-seed. שניהם אידמפוטנטיים — בבנייה הבאה לא קורה כלום חדש.
 * ב-CI, ב-preview ומקומית — לא עושה כלום.
 *
 * המנהל הראשון נוצר לפי ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_NAME (משתני סביבה
 * ב-Vercel). הסיסמה הזמנית מודפסת פעם אחת ביומן הבנייה, ומוחלפת בכניסה הראשונה.
 */
import { execFileSync } from "node:child_process";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (process.env.VERCEL_ENV !== "production" || !url) process.exit(0);

const run = (script, args = []) =>
  execFileSync("npx", ["tsx", script, ...args], {
    stdio: "inherit",
    // מיגרציות דרך חיבור ישיר (לא דרך ה-pooler).
    env: { ...process.env, DATABASE_URL: url },
  });

run("scripts/db-migrate.mts");
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
run("scripts/db-seed.mts", email ? ["--admin-email", email, "--admin-name", process.env.ADMIN_BOOTSTRAP_NAME?.trim() || email] : []);
