/**
 * מייצא את כל התוכן המקומי לקובץ seed-data.json יחיד.
 * הרצה (מתוך שורש הריפו):  node --experimental-strip-types directus/seed/export-content.mts
 * הקובץ המיוצר נטען אל Directus על ידי directus/seed/seed.mjs.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { faqs } from "../../src/lib/content/local/faqs.ts";
import { testimonials } from "../../src/lib/content/local/testimonials.ts";
import { articles } from "../../src/lib/content/local/articles.ts";
import { doctors } from "../../src/lib/content/local/doctors.ts";
import { team } from "../../src/lib/content/local/team.ts";
import { institutions } from "../../src/lib/content/local/institutions.ts";
import { services } from "../../src/lib/content/local/services.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "seed-data.json");

const data = { faqs, testimonials, articles, doctors, team, institutions, services };
writeFileSync(out, JSON.stringify(data, null, 2), "utf8");

const counts = Object.entries(data)
  .map(([k, v]) => `${k}: ${(v as unknown[]).length}`)
  .join(", ");
console.log(`נכתב ${out}\n${counts}`);
