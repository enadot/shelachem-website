import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // תמונות שהועלו מהלוח נשמרות ב-Vercel Blob (public), ו-next/image דורש אישור מפורש ל-host.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // משרד הרישוי הוסר מהאתר — קישורים ישנים לעמוד שלו מגיעים לרשימת המוסדות.
  async redirects() {
    return [
      { source: "/institutions/misrad-harishui", destination: "/institutions", permanent: true },
    ];
  },
};

export default nextConfig;
