import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/config";
import { getSiteSettings } from "@/lib/content";
import { faqPageNode } from "@/lib/schema";
import {
  claimMode,
  claimText,
  isProductionDeploy,
  pendingClaims,
  resolveClaim,
  resolveList,
  type ClaimId,
  type ClaimMode,
  type Gated,
  isClaimed,
} from "@/lib/content/local/lp-claims";
import {
  getLandingPage,
  landingPages,
  LP_SECOND_CTA,
  LP_STEPS_HEADING,
  LP_TRUST_LINE,
  LP_WHY_HEADING,
  LP_WHY_ROWS,
  LP_WHY_STATS,
  LP_DISCLOSURE_EXTRA,
  type LandingPage,
  type LpImageSection,
} from "@/lib/content/local/landing-pages";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { NumberedSteps } from "@/components/shared/numbered-steps";
import { LeadForm } from "@/components/shared/lead-form";
import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward } from "@/components/shared/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClaimBadges, Claimed, Rich } from "@/components/lp/claim-text";
import { LpDisclosureFull, LpDisclosureShort } from "@/components/lp/lp-disclosure";
import { LpImage } from "@/components/lp/lp-image-slot";
import { LpViewToggle } from "@/components/lp/lp-view-toggle";

/**
 * עמודי נחיתה לקמפיינים (T-026). noindex, מחוץ ל-sitemap ול-llms.txt.
 *
 * שער טענות: בפרודקשן (`VERCEL_ENV=production`) מוצג רק נוסח ניטרלי או מאושר,
 * והעמוד לא קורא את `searchParams` כלל — כך הוא נשאר סטטי. מחוץ לפרודקשן מוצג
 * הנוסח המלא עם תג "ממתין לאישור", ו-`?view=production` מציג את תצוגת הפרודקשן.
 * עמוד עם טענה פתוחה ברמת העמוד (`pageClaims`) לא קיים בפרודקשן (404).
 */
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** בפרודקשן לא נוגעים ב-searchParams (שהיה הופך את העמוד לדינמי). */
async function modeFor(searchParams: SearchParams): Promise<ClaimMode> {
  if (isProductionDeploy()) return "strict";
  return claimMode((await searchParams).view);
}

/** עמוד שכל תוכנו תלוי בטענה פתוחה — לא מוצג במצב strict. */
const blockedInStrict = (page: LandingPage) => pendingClaims(page.pageClaims).length > 0;

export function generateStaticParams() {
  return landingPages
    .filter((p) => !(isProductionDeploy() && blockedInStrict(p)))
    .map((p) => ({ slug: p.slug }));
}

const stripBrand = (t: string) => t.replace(/\s*\|\s*שלכם\s*$/, "");

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  const mode = await modeFor(searchParams);
  if (mode === "strict" && blockedInStrict(page)) return {};
  return pageMetadata({
    title: stripBrand(claimText(page.metaTitle, mode) ?? `${page.h1.title} ${page.h1.strong}`),
    description: claimText(page.metaDescription, mode) ?? "",
    path: `/lp/${page.slug}`,
    // עמודי קמפיין: לא לאינדוקס, אבל הקישורים מהם כן נסרקים.
    robots: { index: false, follow: true },
  });
}

/** כל הטענות הפתוחות שמוצגות בעמוד (למונה במתג התצוגה). */
function collectPending(page: LandingPage): ClaimId[] {
  const all: Gated<unknown>[] = [
    page.metaTitle, page.metaDescription, page.intro, page.formTitle,
    page.pain.heading, ...page.pain.items, page.pain.close, ...page.steps,
    page.eligibility.heading, page.eligibility.intro, ...page.eligibility.items, page.eligibility.tip,
    page.midCta.text, ...page.faq, page.finalCta.heading, page.finalCta.subtitle,
    ...LP_TRUST_LINE, ...LP_WHY_STATS, ...LP_WHY_ROWS, ...LP_DISCLOSURE_EXTRA,
  ];
  const codes = new Set<ClaimId>(pendingClaims(page.pageClaims));
  for (const g of all) if (isClaimed(g)) pendingClaims(g.claims).forEach((c) => codes.add(c));
  return [...codes].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

/** שורה של טקסט מנוהל-טענות. `null` כשאין נוסח במצב הנוכחי. */
function GatedText({ v, mode }: { v: Gated<string>; mode: ClaimMode }) {
  const r = resolveClaim(v, mode);
  if (!r) return null;
  return (
    <Claimed pending={r.pending}>
      <Rich text={r.value} />
    </Claimed>
  );
}

const container = "mx-auto max-w-[1240px]";
const sectionPad = "px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-20";
const h2Class = "mb-8 text-[28px] md:mb-10 md:text-[44px]";

/** כותרת סקשן מתוך מחרוזת עם `**הדגשה**`. */
function GatedHeading({ v, mode, id }: { v: Gated<string>; mode: ClaimMode; id?: string }) {
  const r = resolveClaim(v, mode);
  if (!r) return null;
  return (
    <SectionHeading className={h2Class}>
      <span id={id}>
        <Claimed pending={r.pending}>
          <Rich text={r.value} />
        </Claimed>
      </span>
    </SectionHeading>
  );
}

export default async function LandingPageRoute({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();
  const mode = await modeFor(searchParams);
  if (mode === "strict" && blockedInStrict(page)) notFound();

  const { contact } = await getSiteSettings();
  const review = mode === "review";
  const src = (pos: string) => `lp-${page.slug}-${pos}`;
  const imageFor = (section: LpImageSection) => page.images.find((i) => i.section === section);

  const trust = resolveList(LP_TRUST_LINE, mode);
  const painItems = resolveList(page.pain.items, mode);
  const steps = resolveList(page.steps, mode);
  const elig = resolveList(page.eligibility.items, mode);
  const stats = resolveList(LP_WHY_STATS, mode);
  const whyRows = resolveList(LP_WHY_ROWS, mode);
  const faq = resolveList(page.faq, mode);
  const formTitle = resolveClaim(page.formTitle, mode);
  const pagePending = pendingClaims(page.pageClaims);
  const pending = review ? collectPending(page) : [];

  const jsonLd = faq.length
    ? faqPageNode(
        faq.map((f) => f.value),
        { url: `${site.domain}/lp/${page.slug}` },
      )
    : null;

  const shortDisclosure = <LpDisclosureShort className="mt-1 text-[13.5px]" />;

  /** בלוק CTA באמצע העמוד — פותח את מודאל הטופס הקיים, עם הגילוי הנאות. */
  const ctaBlock = (text: React.ReactNode, button: string, position: string) => (
    <section
      data-lp-section={`cta-${position}`}
      data-track-location={src(position)}
      className="px-6 md:px-[clamp(24px,6.7vw,96px)]"
    >
      <div className={`${container} flex flex-col items-start gap-4 rounded-2xl bg-surface-blue p-6 md:flex-row md:items-center md:justify-between md:p-8`}>
        <p className="m-0 text-[17px] font-bold text-ink md:text-xl">{text}</p>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <a href={contact.phoneHref} className="tnum text-[17px] font-bold text-ink no-underline hover:text-brand">
            {contact.phone}
          </a>
          <LeadCta
            sourcePage={src(position)}
            topic={page.topic}
            variant="brand"
            className="group"
            footnote={<LpDisclosureShort className="mt-3 text-center text-[13px]" />}
          >
            {button}
            <ArrowForward size={16} className="nudge" />
          </LeadCta>
        </div>
      </div>
    </section>
  );

  const heroImage = imageFor("hero");
  const sectionImage = (section: LpImageSection) => {
    const slot = imageFor(section);
    return slot ? <LpImage slot={slot} className="mx-auto mt-10 max-w-[880px]" /> : null;
  };

  return (
    <div data-lp-slug={page.slug} data-lp-topic={page.topic} data-lp-mode={mode}>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      {review && pagePending.length > 0 && (
        <div role="note" className="border-b border-amber-400 bg-amber-50 px-6 py-3 text-center text-[14px] font-bold text-amber-900">
          <ClaimBadges pending={pagePending} className="ms-0 me-2" />
          העמוד כולו מבוסס על טענה שעוד לא אושרה, ולא יוצג בפרודקשן (404) עד האישור.
        </div>
      )}

      {/* 1 — hero: כותרת, פתיח והטופס עצמו (לא כפתור) */}
      <PageHeader
        breadcrumb={[{ label: "בית", href: "/" }, { label: `${page.h1.title} ${page.h1.strong}` }]}
        title={page.h1.title}
        strong={page.h1.strong}
        intro={<GatedText v={page.intro} mode={mode} />}
        markClassName="max-w-none md:max-w-[460px]"
        mark={
          <div
            id="lead-form"
            data-lp-section="hero-form"
            data-track-location={src("hero")}
            className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-hairline bg-white p-6 shadow-[0_18px_50px_rgba(4,8,40,0.08)] md:p-7"
          >
            {formTitle && (
              <div className="font-display text-2xl font-light text-ink md:text-[28px]">
                <Claimed pending={formTitle.pending}>
                  <Rich text={formTitle.value} />
                </Claimed>
              </div>
            )}
            <LeadForm
              sourcePage={src("hero")}
              presetTopic={page.topic}
              submitLabel={page.submitLabel}
              withEmail={false}
              footnote={shortDisclosure}
            />
            <div className="border-t border-hairline-soft pt-3.5 text-center text-[13.5px] text-ink-muted">
              מעדיפים לדבר?{" "}
              <a href={contact.phoneHref} className="tnum font-bold text-brand no-underline">
                {contact.phone}
              </a>{" "}
              <span aria-hidden>·</span>{" "}
              <a href={contact.whatsappHref} target="_blank" rel="noopener" className="font-bold text-[#17853f] no-underline">
                וואטסאפ
              </a>
            </div>
          </div>
        }
      >
        {trust.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[15px] text-ink-secondary">
            {trust.map((t) => (
              <li key={t.value} className="flex items-center gap-1.5">
                <Check aria-hidden size={16} strokeWidth={2.5} className="text-brand" />
                <Claimed pending={t.pending}>{t.value}</Claimed>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>

      {heroImage && (
        <div className="px-6 pt-10 md:px-[clamp(24px,6.7vw,96px)] md:pt-14">
          <LpImage slot={heroImage} className={container} />
        </div>
      )}

      {/* 2 — כאב */}
      <section data-lp-section="pain" className={sectionPad}>
        <div className={container}>
          <GatedHeading v={page.pain.heading} mode={mode} />
          <ul className="m-0 grid list-none border-t border-hairline p-0 md:grid-cols-2 md:gap-x-10">
            {painItems.map((it) => (
              <li key={it.value.title} className="border-b border-hairline py-5">
                <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">
                  {it.value.title}
                  <ClaimBadges pending={it.pending} />
                </h3>
                <p className="m-0 max-w-[60ch] text-[16.5px] leading-relaxed text-ink-secondary">{it.value.description}</p>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-8 max-w-[60ch] font-display text-[22px] font-light leading-snug text-ink md:text-[28px]">
            <GatedText v={page.pain.close} mode={mode} />
          </p>
          {sectionImage("pain")}
        </div>
      </section>

      {/* 3 — איך זה עובד */}
      <section data-lp-section="steps" className={`${sectionPad} pt-0 md:pt-0`}>
        <div className={container}>
          <SectionHeading className={h2Class}>
            <Rich text={LP_STEPS_HEADING} />
          </SectionHeading>
          <NumberedSteps
            steps={steps.map((s) => ({
              title: s.value.title,
              description: s.value.description,
            }))}
          />
          {steps.some((s) => s.pending.length > 0) && (
            <ul className="m-0 mt-4 flex list-none flex-wrap gap-3 p-0 text-[13px] text-ink-muted">
              {steps.map((s, i) =>
                s.pending.length ? (
                  <li key={s.value.title}>
                    צעד {String(i + 1).padStart(2, "0")}: <ClaimBadges pending={s.pending} />
                  </li>
                ) : null,
              )}
            </ul>
          )}
          {sectionImage("steps")}
        </div>
      </section>

      {/* CTA אחרי שני סקשנים */}
      {ctaBlock(<GatedText v={page.midCta.text} mode={mode} />, page.midCta.button, "mid")}

      {/* 4 — זכאות */}
      <section data-lp-section="eligibility" className={sectionPad}>
        <div className={container}>
          <GatedHeading v={page.eligibility.heading} mode={mode} />
          <p className="m-0 mb-6 max-w-[68ch] text-[17px] leading-relaxed text-ink-secondary">
            <GatedText v={page.eligibility.intro} mode={mode} />
          </p>
          <ol className="m-0 list-none border-t border-hairline p-0">
            {elig.map((e, i) => (
              <li
                key={e.value.title}
                className="grid grid-cols-[40px_1fr] gap-x-4 border-b border-hairline py-5 md:grid-cols-[64px_1fr]"
              >
                <span aria-hidden className="tnum pt-0.5 text-sm font-bold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="max-w-[68ch]">
                  <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">
                    {e.value.title}
                    <ClaimBadges pending={e.pending} />
                  </h3>
                  <p className="m-0 text-[16.5px] leading-relaxed text-ink-secondary">{e.value.description}</p>
                  {e.value.href && (
                    <Link href={e.value.href} className="group mt-2 inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-brand no-underline">
                      <span className="link-draw">לפרטים</span>
                      <ArrowForward size={14} className="nudge" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {page.eligibility.note && (
            <p className="m-0 mt-5 max-w-[68ch] text-[15.5px] leading-relaxed text-ink-muted">{page.eligibility.note}</p>
          )}
          {resolveClaim(page.eligibility.tip, mode) && (
            <p className="m-0 mt-6 max-w-[68ch] border-s-[5px] border-brand ps-4 text-[16px] leading-relaxed text-ink">
              <GatedText v={page.eligibility.tip} mode={mode} />
            </p>
          )}
          {sectionImage("eligibility")}
        </div>
      </section>

      {/* 5 — למה שלכם (כולו טענות; בפרודקשן נשארים רק נוסחים ניטרליים) */}
      {(stats.length > 0 || whyRows.length > 0) && (
        <section data-lp-section="why" className={`${sectionPad} pt-0 md:pt-0`}>
          <div className={container}>
            <SectionHeading className={h2Class}>
              <Rich text={LP_WHY_HEADING} />
            </SectionHeading>
            {stats.length > 0 && (
              <dl className="m-0 mb-8 grid border-t border-hairline md:grid-cols-3">
                {stats.map((st) => (
                  <div key={st.value.label} className="flex flex-col gap-1 border-b border-hairline py-4 md:border-b-0 md:py-6">
                    <dd className="m-0">
                      <bdi dir="auto" className="tnum whitespace-nowrap font-display text-[32px] font-light text-ink md:text-[40px]">
                        {st.value.value}
                      </bdi>
                    </dd>
                    <dt className="text-[15px] text-ink-secondary">
                      {st.value.label}
                      <ClaimBadges pending={st.pending} />
                    </dt>
                  </div>
                ))}
              </dl>
            )}
            <ul className="m-0 grid list-none border-t border-hairline p-0 md:grid-cols-2 md:gap-x-10">
              {whyRows.map((r) => (
                <li key={r.value.title} className="border-b border-hairline py-5">
                  <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">
                    {r.value.title}
                    <ClaimBadges pending={r.pending} />
                  </h3>
                  <p className="m-0 max-w-[60ch] text-[16.5px] leading-relaxed text-ink-secondary">{r.value.description}</p>
                </li>
              ))}
            </ul>
            {sectionImage("why")}
          </div>
        </section>
      )}

      {/* CTA שני */}
      {ctaBlock(LP_SECOND_CTA.text, LP_SECOND_CTA.button, "mid2")}

      {/* 6 — שאלות נפוצות */}
      {faq.length > 0 && (
        <section data-lp-section="faq" className={sectionPad}>
          <div className={container}>
            <SectionHeading strong="נפוצות" className={h2Class}>
              שאלות
            </SectionHeading>
            <Accordion type="single" collapsible className="border-t border-hairline">
              {faq.map((f, i) => (
                <AccordionItem key={f.value.question} value={`faq-${i}`}>
                  <AccordionTrigger>
                    <span>
                      {f.value.question}
                      <ClaimBadges pending={f.pending} />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>{f.value.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Link
              href={page.relatedHref}
              className="group mt-6 inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand no-underline"
            >
              <span className="link-draw">למידע נוסף באתר</span>
              <ArrowForward size={16} className="nudge" />
            </Link>
          </div>
        </section>
      )}

      {/* 7 — גילוי נאות מלא (חובה, תמיד) */}
      <LpDisclosureFull mode={mode} btlUrl={page.btlUrl} benefitName={`${page.h1.title} ${page.h1.strong}`} />

      {/* 8 — CTA סופי: טופס כהה */}
      <section
        data-lp-section="final"
        data-track-location={src("final")}
        className="surface-navy bg-brand px-[22px] py-16 text-white md:px-[clamp(24px,5vw,72px)] md:py-24"
      >
        <div className="mx-auto grid max-w-[1296px] items-end gap-10 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div>
            <h2 className="m-0 mb-4 font-display text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-white md:mb-6 md:text-[64px]">
              <GatedText v={page.finalCta.heading} mode={mode} />
            </h2>
            <p className="m-0 text-base text-on-royal-muted md:text-xl">
              <GatedText v={page.finalCta.subtitle} mode={mode} />
            </p>
          </div>
          <LeadForm
            variant="dark"
            layout="hero"
            sourcePage={src("final")}
            presetTopic={page.topic}
            submitLabel="חזרו אליי"
            withMarketingConsent={false}
            withEmail={false}
            footnote={<LpDisclosureShort tone="dark" className="text-center text-[13.5px]" />}
          />
        </div>
      </section>

      {!isProductionDeploy() && <LpViewToggle strict={!review} pendingCount={pending.length} />}
    </div>
  );
}
