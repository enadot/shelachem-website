import type { Metadata } from "next";
import { getArticles, getFaqs, getTestimonials } from "@/lib/content";
import { Hero } from "@/components/home/hero";
import { Specialties } from "@/components/home/specialties";
import { RedBanner, Essence, InstitutionsBanner } from "@/components/home/banners";
import { HowItWorks } from "@/components/home/how-it-works";
import { Story } from "@/components/home/story";
import { Testimonials } from "@/components/home/testimonials";
import { Magazine } from "@/components/home/magazine";
import { Community } from "@/components/home/community";
import { FinalCta } from "@/components/home/final-cta";
import { FaqSection } from "@/components/home/faq-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [faqs, testimonials, articles] = await Promise.all([
    getFaqs(),
    getTestimonials(),
    getArticles(),
  ]);

  return (
    <>
      <Hero />
      <Specialties />
      <RedBanner />
      <Essence />
      <HowItWorks />
      <Story />
      <InstitutionsBanner />
      <Testimonials testimonials={testimonials} />
      <Magazine articles={articles} />
      <Community />
      <FinalCta />
      <FaqSection faqs={faqs} />
    </>
  );
}
