import "server-only";
import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/** פעולות התוכן של הלוח: רשימה, פריט, שמירה עם גרסה קודמת, מחיקה ושחזור. */

export type Row = Record<string, unknown> & { id: string };

const items = schema.contentItems;
const revisions = schema.contentRevisions;
/** כמה גרסאות קודמות שומרים לכל פריט. */
const KEEP_REVISIONS = 20;

export async function listItems(collection: string, q?: string): Promise<Row[]> {
  const where = q
    ? and(eq(items.collection, collection), sql`${items.data}::text ilike ${`%${q}%`}`)
    : eq(items.collection, collection);
  const rows = await db()!
    .select({ id: items.id, data: items.data, updatedAt: items.updatedAt })
    .from(items)
    .where(where)
    .orderBy(asc(items.position), asc(items.createdAt));
  return rows.map((r) => ({ ...r.data, id: r.id, _updatedAt: r.updatedAt }));
}

export async function getItem(collection: string, id: string): Promise<Row | null> {
  const [r] = await db()!
    .select()
    .from(items)
    .where(and(eq(items.collection, collection), eq(items.id, id)));
  return r ? { ...r.data, id: r.id } : null;
}

async function snapshot(collection: string, id: string, by: string) {
  const current = await getItem(collection, id);
  if (!current) return;
  const { id: _id, ...data } = current;
  await db()!.insert(revisions).values({ collection, itemId: id, data, savedBy: by });
  // שומרים רק את הגרסאות האחרונות.
  await db()!.execute(sql`
    delete from ${revisions} where ${revisions.collection} = ${collection} and ${revisions.itemId} = ${id}
    and ${revisions.id} not in (
      select ${revisions.id} from ${revisions}
      where ${revisions.collection} = ${collection} and ${revisions.itemId} = ${id}
      order by ${revisions.savedAt} desc limit ${KEEP_REVISIONS}
    )`);
}

/** עדכון פריט קיים (מיזוג שדות) — שומר קודם את הגרסה הנוכחית. */
export async function updateItem(collection: string, id: string, data: Record<string, unknown>, by: string) {
  await snapshot(collection, id, by);
  await db()!
    .update(items)
    .set({ data: sql`${items.data} || ${JSON.stringify(data)}::jsonb`, updatedAt: new Date(), updatedBy: by })
    .where(and(eq(items.collection, collection), eq(items.id, id)));
}

/** פריט חדש — בסוף הרשימה. */
export async function createItem(collection: string, id: string, data: Record<string, unknown>, by: string) {
  const [{ last }] = await db()!
    .select({ last: max(items.position) })
    .from(items)
    .where(eq(items.collection, collection));
  await db()!.insert(items).values({ collection, id, data, position: (last ?? -1) + 1, updatedBy: by });
}

/** מחיקה — הגרסה האחרונה נשמרת, כך שאפשר לשחזר גם פריט שנמחק. */
export async function deleteItem(collection: string, id: string, by: string) {
  await snapshot(collection, id, by);
  await db()!.delete(items).where(and(eq(items.collection, collection), eq(items.id, id)));
}

export async function listRevisions(collection: string, id: string) {
  return db()!
    .select({ id: revisions.id, savedAt: revisions.savedAt, savedBy: revisions.savedBy })
    .from(revisions)
    .where(and(eq(revisions.collection, collection), eq(revisions.itemId, id)))
    .orderBy(desc(revisions.savedAt))
    .limit(KEEP_REVISIONS);
}

/** מחזיר פריט לגרסה קודמת (והגרסה הנוכחית נשמרת בעצמה כגרסה). */
export async function restoreRevision(collection: string, id: string, revisionId: number, by: string) {
  const [rev] = await db()!
    .select()
    .from(revisions)
    .where(and(eq(revisions.id, revisionId), eq(revisions.collection, collection), eq(revisions.itemId, id)));
  if (!rev) throw new Error("הגרסה לא נמצאה");
  const exists = await getItem(collection, id);
  if (exists) {
    await snapshot(collection, id, by);
    await db()!
      .update(items)
      .set({ data: rev.data, updatedAt: new Date(), updatedBy: by })
      .where(and(eq(items.collection, collection), eq(items.id, id)));
  } else {
    await createItem(collection, id, rev.data, by);
  }
}
