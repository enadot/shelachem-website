import { getGlobals, getTestimonials } from "@/lib/content";
import { directusEnabled } from "@/lib/directus";

export const dynamic = "force-dynamic";

/**
 * אבחון חיבור ה-CMS — פותחים בדפדפן: /api/cms-status
 * מראה מאיזה host האתר קורא, אם globals נקרא (הרשאת קריאה ציבורית),
 * ואם תמונת ההירו הגיעה. לא חושף סודות.
 */
export async function GET() {
  const cmsUrl = process.env.DIRECTUS_URL || null;
  const [globals, testimonials] = await Promise.all([getGlobals(), getTestimonials()]);
  const heroImage = globals?.hero_image ?? null;

  let heroImageReachable: boolean | null = null;
  if (heroImage) {
    try {
      const res = await fetch(heroImage, { method: "HEAD", cache: "no-store" });
      heroImageReachable = res.ok;
    } catch {
      heroImageReachable = false;
    }
  }

  return Response.json(
    {
      directus_url: cmsUrl,
      directus_enabled: directusEnabled(),
      globals_readable: globals !== null,
      hero_image: heroImage,
      hero_image_reachable: heroImageReachable,
      hero_image_alt: globals?.hero_image_alt ?? null,
      testimonials_count: testimonials.length,
      revalidate_secret_configured: Boolean(process.env.REVALIDATE_SECRET),
      checked_at: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
