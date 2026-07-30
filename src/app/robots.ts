import type { MetadataRoute } from "next";
import { site } from "@/lib/config";

/**
 * סוכני ה-AI המרכזיים שמכבדים robots.txt — מנועי מענה שמצטטים מקורות (GEO)
 * והזחלנים שמזינים אותם. ברירת המחדל של robots.txt היא "מותר", אבל
 * `Google-Extended` ו-`Applebot-Extended` מבינים **רק** חסימה, ולכן היתר מפורש
 * הוא גם תיעוד וגם הגנה מפני חסימה גורפת עתידית שתנתק את האתר מתשובות AI.
 */
const aiAgents = [
  // OpenAI — אימון, חיפוש ב-ChatGPT, וגלישה לפי בקשת משתמש
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Google — Gemini / AI Overviews (מבין רק חסימה)
  "Google-Extended",
  // Apple Intelligence (Extended מבין רק חסימה)
  "Applebot",
  "Applebot-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Copilot ניזון מ-Bing
  "Bingbot",
  // שאר מנועי המענה
  "DuckAssistBot",
  "MistralAI-User",
  "meta-externalagent",
  "Amazonbot",
  "YouBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/ אינו תוכן. privacy ו-accessibility מסומנים noindex ברמת העמוד —
        // חסימה ב-robots הייתה מונעת מגוגל לראות את ה-noindex עצמו.
        disallow: ["/api/"],
      },
      {
        userAgent: aiAgents,
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${site.domain}/sitemap.xml`,
  };
}
