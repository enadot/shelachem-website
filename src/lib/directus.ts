import { createDirectus, rest, staticToken } from "@directus/sdk";

/**
 * Directus client — active only when DIRECTUS_URL is configured.
 * The content layer (src/lib/content) falls back to local content otherwise.
 */
export function getDirectusClient() {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  const client = createDirectus(url).with(rest());
  return token ? client.with(staticToken(token)) : client;
}

export const directusEnabled = () => Boolean(process.env.DIRECTUS_URL);
