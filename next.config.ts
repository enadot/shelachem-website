import type { NextConfig } from "next";

// כשהתוכן מגיע מ-Directus, התמונות מוגשות מ-<DIRECTUS_URL>/assets/<id>,
// ולכן next/image דורש אישור מפורש ל-host הזה.
const cmsUrl = process.env.DIRECTUS_URL;

const nextConfig: NextConfig = {
  ...(cmsUrl ? { images: { remotePatterns: [new URL("/assets/**", cmsUrl)] } } : {}),
  // משרד הרישוי הוסר מהאתר — קישורים ישנים לעמוד שלו מגיעים לרשימת המוסדות.
  async redirects() {
    return [
      { source: "/institutions/misrad-harishui", destination: "/institutions", permanent: true },
    ];
  },
};

export default nextConfig;
