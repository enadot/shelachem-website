/**
 * טוען למסד את התוכן ההתחלתי מהריפו (src/lib/content/local) ואת הגדרות ברירת
 * המחדל, ויוצר מנהל ראשון. אידמפוטנטי: collection שכבר יש בו פריטים לא נדרס,
 * ומשתמש שכבר קיים לא נוצר שוב.
 *
 *   DATABASE_URL=... npm run db:seed -- --admin-email you@example.com --admin-name "שם"
 */
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { count, eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword, temporaryPassword } from "../src/lib/admin/password";
import { faqs } from "../src/lib/content/local/faqs";
import { testimonials } from "../src/lib/content/local/testimonials";
import { articles } from "../src/lib/content/local/articles";
import { doctors } from "../src/lib/content/local/doctors";
import { team } from "../src/lib/content/local/team";
import { institutions } from "../src/lib/content/local/institutions";
import { services } from "../src/lib/content/local/services";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("חסר DATABASE_URL");
  process.exit(1);
}
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const sql = postgres(url, { max: 1 });
const db = drizzle(sql, { schema });

/**
 * בתוכן המקומי השדה `image` הוא נתיב סטטי (/images/...). בעורך הוא נשמר ב-`image_file`
 * (שדה ההעלאה), ו-`imageAlt` נשמר כ-`image_alt` — אותם שמות כמו ב-CMS הקודם.
 */
function toRow(item: Record<string, unknown>) {
  const { image, imageAlt, ...rest } = item;
  return {
    ...rest,
    ...(image ? { image_file: image } : {}),
    ...(imageAlt ? { image_alt: imageAlt } : {}),
  };
}

const COLLECTIONS: Record<string, readonly unknown[]> = {
  faqs,
  testimonials,
  articles,
  doctors,
  team_members: team,
  institutions,
  services,
};

for (const [collection, items] of Object.entries(COLLECTIONS)) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.contentItems)
    .where(eq(schema.contentItems.collection, collection));
  if (n > 0) {
    console.log(`  = ${collection}: כבר יש ${n} פריטים — מדלג`);
    continue;
  }
  await db.insert(schema.contentItems).values(
    items.map((raw, position) => {
      const item = raw as Record<string, unknown>;
      return {
        collection,
        id: String(item.id ?? randomUUID()),
        data: toRow(item),
        position,
        updatedBy: "seed",
      };
    }),
  );
  console.log(`  + ${collection}: ${items.length} פריטים`);
}

const settings = await db.select().from(schema.siteSettings).limit(1);
if (!settings.length) {
  // ריק = האתר משתמש בברירות המחדל שב-src/lib/config.ts עד שעורכים בלוח.
  await db.insert(schema.siteSettings).values({ id: 1, data: {}, updatedBy: "seed" });
  console.log("  + site_settings");
}

const email = arg("admin-email")?.trim().toLowerCase();
if (email) {
  const existing = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (existing.length) {
    console.log(`  = המשתמש ${email} כבר קיים`);
  } else {
    const password = temporaryPassword();
    await db.insert(schema.adminUsers).values({
      id: randomUUID(),
      email,
      name: arg("admin-name") ?? email,
      passwordHash: await hashPassword(password),
      role: "admin",
      mustChangePassword: true,
    });
    console.log(`  + מנהל: ${email}\n    סיסמה זמנית (תוחלף בכניסה הראשונה): ${password}`);
  }
}

console.log("✓ ה-seed הושלם");
await sql.end();
