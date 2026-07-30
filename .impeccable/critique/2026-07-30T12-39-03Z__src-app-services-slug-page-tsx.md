---
target: the three content templates (services, institutions, magazine article)
total_score: 20
max_score: 36
na_heuristics: 7
p0_count: 2
p1_count: 3
timestamp: 2026-07-30T12-39-03Z
slug: src-app-services-slug-page-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

Targets: `src/app/services/[slug]/page.tsx` · `src/app/institutions/[slug]/page.tsx` · `src/app/magazine/[slug]/page.tsx` — the three templates that carry the organic traffic and had never been critiqued.

# Design Health Score — 20/36 (Acceptable · H7 n/a)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | No nav item active on `/services/*`; stats read 0 until scrolled; no TOC active state (FIXED: nav active section, SSR stat values) |
| 2 | Match system/real world | 3 | `"לפרטים ←"` on 20/23 institution cards jumped to the homepage form (FIXED); `service.name.split(" ")[0]` produced broken Hebrew (FIXED) |
| 3 | User control & freedom | 2 | `FaqAccordion type="single"` closes the previous answer; desktop carousel hid 224px with no arrows (FIXED: arrows enabled); no mobile TOC (FIXED) |
| 4 | Consistency & standards | 2 | Two hero systems; only `NavyHero` emitted BreadcrumbList (FIXED: shared `Breadcrumb`); modal vs cross-page anchor for the same action (FIXED); `SectionHeading`/`icons.tsx` unused on all three (FIXED) |
| 5 | Error prevention | 2 | Topic `Select` had no persistent label (FIXED); consent checkbox unreachable by `shouldFocusError` (FIXED via `field.ref`) |
| 6 | Recognition over recall | 2 | Meaning carried by `✓`, `💡`, `←`, `‹` (FIXED: drawn SVG set); card CTA was a 350×23px text link (FIXED: whole card, `min-h-11`) |
| 7 | Flexibility & efficiency | n/a | Persuade/Read surfaces with a single intended path |
| 8 | Aesthetic & minimalist | 2 | Services page = 8 near-identical rounded panels with no ranking; institutions = two consecutive card grids; one stock photo repeated 4× per article page (FIXED: branded empty state) |
| 9 | Error recovery | 3 | Excellent copy; but `aria-invalid` with no `aria-describedby` and no `role="alert"` — validation silent to screen readers (FIXED) |
| 10 | Help & documentation | 2 | FAQ only on the services template; institution pages had none (FIXED: link to `/faq`); 9 of 10 articles empty (FIXED: publish gate) |

# Cognitive load — 5 of 8 checks failed (high)

Failures: single focus (5 simultaneous contact routes), chunking (6 service cards / 7 topics / 7 year options / 19 footer links), visual hierarchy on services, minimal choices, working memory (the "לפרטים" Memory Bridge — FIXED via preset topic in the modal).

# Specificity verdict

One genuinely authored system — pure `#0000FF` government-form blue, a red marker accent that marks rather than fills, RaananPro 300 against 900 in one heading line, `tnum` on every figure — applied on the homepage and abandoned on the three templates that get the traffic. `institutions/[slug]` was fully category-interchangeable: navy hero → 4 numbered icon+heading+text cards → 3–6 pill+heading+text cards → 4-up big-number band → centered form, with no testimonial, no FAQ, no named human and no face on a trust-category page. `services/[slug]` was authored (the tax calculator is the one component nobody else could ship) but drifting. `magazine/[slug]` was unjudgeable: 9 of 10 instances had no body.

# Deterministic scan

CLI detector: **0 findings** across `src` (77 files) before the changes; sanity-checked against a synthetic violation, so the clean was real. In-page detector: 17 findings on `/services/tax-exemption` @1440 (3× low-contrast, 6× line-length >78ch, 5× cramped-padding, side-tab, thin-border-wide-shadow, em-dash-overuse), 1 on institutions, 2 on the article page. axe-core (wcag2a/2aa/21aa/22aa): 0 violations on services and institutions at both viewports; **1 on `/magazine/[slug]`** — `color-contrast` 4.3:1 on `.text-accent` "הכירו את המומחית". Build: exit 0, zero warnings.

False positives: `body-text-viewport-edge` ×2 (testimonial slides inside a deliberate RTL swipe carousel; document overflow 0), and `em-dash-overuse` (the em-dash is the standard Hebrew parenthetical connector — a language mismatch in the rule).

# Priority issues

- **[P0] Every trust number was zero without JS, wrong with JS, and typeset backwards.** `number-ticker.tsx:48` rendered the literal `"0"` server-side, so `/institutions/bituach-leumi` read *"0+ תיקים · 0% מהתביעות אושרו · 0% מהעררים"* with JS off. `useSpring` settled asymptotically: measured `10,057` where the content says `10,059`, `4,295+` where it says `4,300+`. `inline-block` broke the bidi run, rendering `+4,295`, `%87`, `₪ 0`. `prefers-reduced-motion` only skipped the delay. — **FIXED**: real value in the HTML, fixed-duration `animate` landing exactly on target, `<bdi dir="ltr">`, reduced-motion honoured, and no count-up for numbers already on screen at load. Verified: `4,300+ · 87% · 62% · 0 ₪`, `10,059`.
- **[P0] Nine of ten magazine articles were empty pages advertising complete guides.** Only `same-condition-different-percentages` had a `body`; the rest rendered h1 + 2-line excerpt + CTA while stating "12 דק׳ קריאה" and "המדריך המלא, שלב אחר שלב". The `readNext` grid fed them to each other and the highest-intent link on the site (`services.ts` resources) pointed into one. — **FIXED**: `isPublished()` gates the content layer, so an article without a body has no URL, no sitemap entry and no card; service resources are derived from real articles (title included, ending the drift between the hand-typed label and the actual headline).
- **[P1] `"לפרטים ←"` was a 350×23px promise of detail that delivered a different page's form.** 20 of 23 institution service cards had `href: "/#lead-form"`. — **FIXED**: whole card is the target, honest label, and the lead modal opens with the topic pre-filled so the user never has to remember which benefit they were reading.
- **[P1] On the target device the page arrived and then showed nothing for 3.7 seconds.** At 6× CPU / 400 kbps the HTML painted at 2.28s with 4,045 characters of text, and every `.entrance`/`.reveal` stayed at `opacity: 0` until the 4-second failsafe fired at 5.95s. The h1 — the LCP element — was inside `<Entrance>` on all three templates. — **FIXED**: no h1 on any template is gated on hydration.
- **[P1] The mobile sticky bar never retracted and the real form sat at 76% scroll depth.** `MobileCtaBar` hides when `#lead-form` is visible, but no template except the homepage hero had that id. — **FIXED**: id added to the services sidebar card and the institutions form section; verified retracting at 390×844.

# Accessibility

Three confirmed contrast failures, all fixed with measured replacements: `#d93a38` on `#f6f9fc` 4.31:1 → `#c93330` **4.97:1**; `#c93330` on `#fde3e2` 4.32:1 → `#b32926` **5.29:1**; `#d93a38` on navy `#122680` 2.86:1 → `#e75f5d` **3.84:1** (missed by both axe and the detector). Focus ring was `#0000ff` on navy = **1.51:1** against SC 1.4.11's 3:1 → `.surface-navy` now inherits a white ring at 13:1. Form errors gained `aria-describedby` + `role="alert"`; the consent checkbox forwards the RHF ref so `shouldFocusError` reaches it. Result: **0 axe violations across 5 routes × 2 viewports**.

Not defects, verified: the consent checkbox's 18×18 box carries a 44×44 `::before` target, and the inline privacy link is exempt from SC 2.5.8 as text in a sentence.

# Craft-floor violations

Fixed: unicode glyphs as an icon system (10× `‹`, 15× `›`, 10× `←`, `✓`, `💡` → drawn SVG set, RTL-explicit); `SectionHeading` bypassed by six hand-rolled headings on the services page; three near-identical hand-written brand gradients → one `.brand-gradient`; dead `.focus-brand` class applied in 9 components and defined nowhere; identical entrance animation on every section (removed from the reference page, where a fast scroll measurably left four topic groups blank).

Left alone deliberately: the `card.tag` pill above `card.name` and the `"הסיפור שלנו"` / `"אחריות חברתית"` labels read as eyebrows, but they are part of the approved incumbent designs — a client call, not a unilateral deletion. The 5px `border-s` on the takeaways box is argued for in DESIGN.md as a margin-mark.

# Persona red flags

**רבקה (58, low digital literacy, old Android, deciding whether to trust the company with her disability claim)** — was told the company had handled 0 cases and won 0% of claims whenever JS was slow or blocked; waited ~4s in front of a blank page with the content already in the DOM; found no face, name, quote or story anywhere on the institution page she is most likely to land on; clicked "לפרטים" about her benefit and was thrown to the homepage. All four are now fixed except the missing human proof on institution pages.

**Sam (accessibility-dependent)** — all validation silent; consent checkbox a keyboard dead end; focus ring invisible on every navy surface; card names and approach titles were `<div>`s so heading navigation was useless; takeaways/eligibility/cards were div stacks with no item counts. All fixed except the remaining heading-level nuances.

**Casey (distracted mobile)** — primary form at 76% depth; sticky bar clipping 61px of content permanently; four copies of one upscaled stock photo per article page; no in-page navigation on a 9-minute read. Fixed except form depth.

# Remaining (not fixed this round)

- Institution pages still have no human proof — no testimonial, no face, no named person. `local/testimonials.ts`, `local/team.ts` and `local/doctors.ts` all exist and none appear there. This is the single largest remaining trust gap.
- Nine article bodies still need writing (the gate hides them; it does not write them). `retroactive-tax-refund` is the one the money page wants most.
- 4 of 5 institution pages publish three identical stats (`13` / `10,059` / `0 ₪`) with one variable, and only `bituach-leumi` carries a `statsNote`.
- The type ramp is far wider than the system documents: 22 distinct literal font sizes against 6 documented roles (112 advisory detector findings). Consolidation is a design decision.
- `FaqAccordion` is `type="single"` — a user cannot compare two answers side by side.
- Services page is still 8 near-identical panels with no ranking; only the navy calculator breaks the noise floor.
- Sticky sidebar on the services page is taller than the sticky viewport, so the phone pill never becomes visible while stuck.
- Hero team image still not uploaded (CMS ▸ globals ▸ hero_image).
- Manual screen-reader pass in Hebrew (NVDA/VoiceOver) — axe does not cover accessible names in context.

# Questions

1. The brief calls the navy stats band the format that holds every numeric claim on the site. Now that the numbers are correct, would a named human being who won a case convince רבקה more than four integers?
2. Nine magazine URLs are hidden rather than fixed. Is publishing ten thin pages ever better than publishing one real one?
3. `icons.tsx` and `SectionHeading` existed, were correct, and had zero importers on exactly the templates nobody had critiqued. What stops that from recurring the next time a template is added?
