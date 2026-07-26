/** Content models — mirror the Directus collections (see directus/schema). */

/** הגדרות אתר — singleton `globals` ב-Directus. */
export interface Globals {
  hero_image?: string | null; // resolved /assets URL
  hero_image_alt?: string | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  detail: string; // e.g. the rights track: "קצבת נכות כללית"
  image?: string | null;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string; // מדריכים | חדשות | סיפורי הצלחה
  readingMinutes: number;
  publishedLabel: string; // e.g. "יוני 2026"
  publishedAt?: string | null; // ISO date — datePublished ב-schema וב-sitemap
  image?: string | null;
  featured?: boolean;
  author?: Author;
  body?: ArticleSection[];
  related?: string[]; // slugs
}

export interface Author {
  name: string;
  role: string;
  bio?: string;
}

export interface ArticleSection {
  id: string; // anchor id for the TOC
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  bio: string;
  image?: string | null;
}

export type DoctorSpecialty =
  | "internal"
  | "ortho"
  | "cardio"
  | "neuro"
  | "psych"
  | "onco";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  linkedin?: string | null;
  image?: string | null;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  services: { name: string; href?: string }[];
  heroTitle: string;
  heroIntro: string;
  approach: { title: string; description: string }[];
  serviceCards: { name: string; tag: string; description: string; href: string }[];
  stats: { value: string; label: string; accent?: boolean }[];
  statsNote?: string;
  formOptions: string[];
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  institutionSlug: string;
  heroIntro: string;
  takeaways: string[];
  eligibility: { title: string; description: string }[];
  eligibilityTip?: string;
  sections: { id: string; heading: string; paragraphs: string[] }[];
  hasTaxCalculator?: boolean;
  testimonials: Testimonial[];
  faqs: FaqItem[];
  relatedRights: { name: string; href?: string }[];
  resources: { title: string; href: string; image?: string | null }[];
}

export interface Lead {
  full_name: string;
  phone: string;
  email?: string;
  topic?: string;
  source_page?: string;
  marketing_consent?: boolean;
}
