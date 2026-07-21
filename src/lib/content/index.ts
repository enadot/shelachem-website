import { getDirectusClient } from "../directus";
import { readItems } from "@directus/sdk";
import type {
  Article,
  Doctor,
  FaqItem,
  Institution,
  Service,
  TeamMember,
  Testimonial,
} from "./types";
import { faqs as localFaqs } from "./local/faqs";
import { testimonials as localTestimonials } from "./local/testimonials";
import { articles as localArticles } from "./local/articles";
import { doctors as localDoctors } from "./local/doctors";
import { team as localTeam } from "./local/team";
import { institutions as localInstitutions } from "./local/institutions";
import { services as localServices } from "./local/services";

/**
 * Content access layer.
 * When DIRECTUS_URL is set, content is fetched from Directus collections;
 * otherwise the typed local content (mirroring the approved designs) is used.
 * Any Directus failure falls back to local content so the site never breaks.
 */
async function fromDirectus<T>(
  collection: string,
  fallback: T,
  map?: (rows: Record<string, unknown>[]) => T,
): Promise<T> {
  const client = getDirectusClient();
  if (!client) return fallback;
  try {
    const rows = (await client.request(
      readItems(collection as never, { limit: -1 } as never),
    )) as Record<string, unknown>[];
    if (!rows?.length) return fallback;
    return map ? map(rows) : (rows as unknown as T);
  } catch {
    return fallback;
  }
}

export const getFaqs = () => fromDirectus<FaqItem[]>("faqs", localFaqs);
export const getTestimonials = () =>
  fromDirectus<Testimonial[]>("testimonials", localTestimonials);
export const getArticles = () => fromDirectus<Article[]>("articles", localArticles);
export const getDoctors = () => fromDirectus<Doctor[]>("doctors", localDoctors);
export const getTeam = () => fromDirectus<TeamMember[]>("team_members", localTeam);
export const getInstitutions = () =>
  fromDirectus<Institution[]>("institutions", localInstitutions);
export const getServices = () => fromDirectus<Service[]>("services", localServices);

export async function getArticle(slug: string) {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getInstitution(slug: string) {
  const all = await getInstitutions();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function getService(slug: string) {
  const all = await getServices();
  return all.find((s) => s.slug === slug) ?? null;
}
