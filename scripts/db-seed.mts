/**
 * טוען למסד את התוכן ההתחלתי מהריפו (src/lib/content/local) ואת הגדרות ברירת
 * המחדל, ויוצר מנהל ראשון. אידמפוטנטי: collection ריק נטען במלואו; ב-collection
 * שכבר יש בו פריטים רק מסנכרנים פריטים שלא נערכו בלוח (ראו "סנכרון" למטה);
 * ומשתמש שכבר קיים לא נוצר שוב.
 *
 *   DATABASE_URL=... npm run db:seed -- --admin-email you@example.com --admin-name "שם"
 */
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, count, eq, inArray, sql } from "drizzle-orm";
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

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

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

/** collections שכבר היו בהם פריטים — רק בהם מריצים סנכרון (ראו למטה). */
const existing: string[] = [];

for (const [collection, items] of Object.entries(COLLECTIONS)) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.contentItems)
    .where(eq(schema.contentItems.collection, collection));
  if (n > 0) {
    existing.push(collection);
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

/**
 * סנכרון: תיקוני תוכן בריפו מגיעים גם ל-collection שכבר נטען. מעדכנים רק שורה
 * שקיימת ושאף אחד לא ערך בלוח (`updated_by = 'seed'`), ורק אם התוכן שונה. לפני
 * כל עדכון נשמרת גרסה קודמת. שורות שנערכו בלוח לא נוגעים בהן; פריט שנמחק בלוח
 * לא חוזר (מחיקה בלוח שומרת גרסה — כך מזהים אותה). פריט חדש בריפו שמעולם לא
 * היה במסד נוסף רק ב-collections שב-ADD_NEW (עמודי תחומי הפעילות ב-services);
 * בשאר — רק מדווח, כמו קודם.
 * אידמפוטנטי: בהרצה השנייה אין מה לעדכן.
 */
const SEED = "seed";
/** כמו בלוח (`src/lib/admin/content.ts`): כמה גרסאות קודמות שומרים לכל פריט. */
const KEEP_REVISIONS = 20;

/** JSON עם מפתחות ממוינים — השוואה יציבה מול jsonb (שלא שומר על סדר המפתחות). */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v,
  );
}

const contentItems = schema.contentItems;
/** collections שבהם פריט חדש בריפו נוסף למסד אוטומטית (ראו למעלה). */
const ADD_NEW = new Set(["services"]);
const revisions = schema.contentRevisions;

for (const collection of existing) {
  const local = COLLECTIONS[collection].map((raw, position) => {
    const item = raw as Record<string, unknown>;
    // אותו מיפוי כמו בהכנסה; הלוך-חזור ב-JSON מסיר undefined, כמו שקורה בשמירה ל-jsonb.
    const data = JSON.parse(JSON.stringify(toRow(item))) as Record<string, unknown>;
    return { id: item.id == null ? null : String(item.id), data, position };
  });

  const summary = await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: contentItems.id, data: contentItems.data, position: contentItems.position, updatedBy: contentItems.updatedBy })
      .from(contentItems)
      .where(eq(contentItems.collection, collection))
      .for("update");
    const byId = new Map(rows.map((r) => [r.id, r]));
    const updated: string[] = [];
    const reordered: string[] = [];
    const editedInAdmin: string[] = [];
    const notInDb: string[] = [];
    let noId = 0;

    for (const item of local) {
      // בלי id אי אפשר להתאים לשורה (בהכנסה הוא מקבל UUID אקראי).
      if (!item.id) {
        noId++;
        continue;
      }
      const row = byId.get(item.id);
      if (!row) {
        notInDb.push(item.id);
        continue;
      }
      const same = canonical(row.data) === canonical(item.data);
      if (row.updatedBy !== SEED) {
        if (!same) editedInAdmin.push(item.id);
        continue;
      }
      const where = and(eq(contentItems.collection, collection), eq(contentItems.id, item.id), eq(contentItems.updatedBy, SEED));
      if (!same) {
        await tx.insert(revisions).values({ collection, itemId: item.id, data: row.data, savedBy: SEED });
        await tx.execute(sql`
          delete from ${revisions} where ${revisions.collection} = ${collection} and ${revisions.itemId} = ${item.id}
          and ${revisions.id} not in (
            select ${revisions.id} from ${revisions}
            where ${revisions.collection} = ${collection} and ${revisions.itemId} = ${item.id}
            order by ${revisions.savedAt} desc, ${revisions.id} desc limit ${KEEP_REVISIONS}
          )`);
        await tx
          .update(contentItems)
          .set({ data: item.data, position: item.position, updatedAt: new Date(), updatedBy: SEED })
          .where(where);
        updated.push(item.id);
      } else if (row.position !== item.position) {
        // רק הסדר השתנה בריפו — אין צורך בגרסה קודמת.
        await tx.update(contentItems).set({ position: item.position }).where(where);
        reordered.push(item.id);
      }
    }

    const localIds = new Set(local.map((i) => i.id));
    const notInRepo = rows.filter((r) => r.updatedBy === SEED && !localIds.has(r.id)).map((r) => r.id);
    return { total: rows.length, updated, reordered, editedInAdmin, notInDb, notInRepo, noId };
  });

  const { total, updated, reordered, editedInAdmin, notInDb, notInRepo, noId } = summary;
  // פריט שחסר במסד ויש לו גרסאות קודמות — כנראה נמחק בלוח (מחיקה שומרת גרסה).
  const deletedInAdmin = new Set(
    notInDb.length
      ? (
          await db
            .selectDistinct({ id: revisions.itemId })
            .from(revisions)
            .where(and(eq(revisions.collection, collection), inArray(revisions.itemId, notInDb)))
        ).map((r) => r.id)
      : [],
  );
  const newInRepo = notInDb.filter((id) => !deletedInAdmin.has(id));
  const autoAdd = ADD_NEW.has(collection);
  if (autoAdd && newInRepo.length) {
    const add = new Set(newInRepo);
    await db
      .insert(contentItems)
      .values(
        local
          .filter((i) => i.id && add.has(i.id))
          .map((i) => ({ collection, id: i.id!, data: i.data, position: i.position, updatedBy: SEED })),
      )
      .onConflictDoNothing();
  }
  const notes = [
    editedInAdmin.length ? `${editedInAdmin.length} נערכו בלוח — לא נגע` : "",
    reordered.length ? `${reordered.length} סודרו מחדש` : "",
  ].filter(Boolean);
  const head = updated.length
    ? `  ~ ${collection}: עודכנו ${updated.length} פריטים מהריפו`
    : `  = ${collection}: ${total} פריטים, אין שינויים מהריפו`;
  console.log(head + (notes.length ? ` (${notes.join(", ")})` : ""));
  if (updated.length) console.log(`      עודכנו: ${updated.join(", ")}`);
  if (editedInAdmin.length) console.log(`      נערכו בלוח (שונים מהריפו): ${editedInAdmin.join(", ")}`);
  if (newInRepo.length)
    console.log(
      autoAdd
        ? `      + נוספו מהריפו: ${newInRepo.join(", ")}`
        : `      חדש בריפו — לא נוסף אוטומטית (להוסיף בלוח): ${newInRepo.join(", ")}`,
    );
  if (deletedInAdmin.size) console.log(`      נמחק בלוח — לא נוסף מחדש: ${[...deletedInAdmin].join(", ")}`);
  if (notInRepo.length) console.log(`      קיים במסד ולא בריפו (לא נמחק): ${notInRepo.join(", ")}`);
  if (noId) console.log(`      ${noId} פריטים בריפו בלי id — אי אפשר לסנכרן`);
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
await client.end();
