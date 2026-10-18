/**
 * מריץ את מיגרציות המסד (תיקיית drizzle/). אידמפוטנטי.
 *   DATABASE_URL=... npm run db:migrate
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("חסר DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url, { max: 1 });
await migrate(drizzle(sql), { migrationsFolder: "drizzle" });
console.log("✓ המסד מעודכן");
await sql.end();
