---
target: the homepage
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-07-26T12-35-25Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

# Design Health Score — 26/40 (Acceptable→Good)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Good feedback on form; silent anchor jumps |
| 2 | Match system/real world | 2 | "כמה שאלות קצרות" promises a checker, delivers a callback form |
| 3 | User control & freedom | 2 | "עוד סיפורים" hijacked to lead form; no edit after submit |
| 4 | Consistency & standards | 3 | Hover states on non-links; mixed chevrons ›/‹/← |
| 5 | Error prevention | 2 | Phone regex rejected spaces/+972 (FIXED) |
| 6 | Recognition over recall | 2 | Placeholder-only labels vanish (FIXED) |
| 7 | Flexibility & efficiency | 3 | Click-to-call, WhatsApp; no sticky CTA (FIXED) |
| 8 | Aesthetic & minimalist | 3 | Empty hero blue half (~45% of viewport); 14-chip wall |
| 9 | Error recovery | 3 | Inline Hebrew errors; fallback lacked tappable phone (FIXED) |
| 10 | Help & documentation | 3 | 15-item FAQ + JSON-LD; no grouping |

# Specificity verdict
Genuinely authored: sustained שלכם/שלהם/שלנו wordplay, custom RTL icon set, split hero. Collapses only at imagery: missing hero team photo, watermark placeholder in Story, identical stock photo on all magazine cards.

# Detector (in-page, 26 findings)
- 3× low-contrast: white on #f0514f = 3.5:1 (CTA button, red band) — FIXED: accent → #d93a38 (4.55:1)
- 3× line-length >80ch (Essence, testimonials intro, magazine intro) — FIXED: max-w caps
- 16× cramped-padding on rounded-xl border cards — false positive (inset lives on the trigger, not the wrapper)
- 1× thin-border-wide-shadow on lead form card — intentional design
- 1× em-dash overuse (19), 2× heading-rhythm — accepted style
- Mechanical: 0 horizontal overflow, 0 missing alt, 15+ sub-40px tap targets (checkboxes 18px — label extends effective area; footer inline links), console clean except logo.svg aspect warning

# Priority issues
- [P0] Empty hero blue half; mobile: 340px void pushed form below fold — FIXED (mobile collapses when no image; real fix = upload hero image via CMS)
- [P1] CTA scent: "אשמח לדעת"/"עוד סיפורים" promise content, deliver the form — FIXED (honest copy)
- [P1] Phone validation rejects real-world formats — FIXED (normalize spaces/+972, example in error, client+server)
- [P1] Contrast white-on-#f0514f 3.5:1 — FIXED (#d93a38)
- [P2] Placeholder-only labels — FIXED (persistent labels + ids)
- [P2] No sticky CTA on ~9,500px mobile page — FIXED (MobileCtaBar, hides when form visible)

# Remaining (not fixed this round)
- Hero team image must be uploaded (CMS globals ▸ hero_image)
- 14 specialty chips: hover implies clickability, cursor-default; consider linking to services or removing hover
- Magazine cards share one stock photo; testimonials initials-only, no amounts
- Reveal animations SSR opacity:0 — slow devices see blank sections until hydration (רבקה persona risk)
- Header phone button opens modal instead of dialing (extra step for low-digital-literacy users)
- Footer link scent: קרנות פנסיה/חברות ביטוח → generic /institutions; סניפים filed under מגזין column
- FAQ h3 accessible text ends with "+" glyph
- No focus move to first error on submit (RHF default should handle; verify)

# Personas (top red flags)
- Jordan: h1 names tenure not service; submit label object unclear ("לבדוק" what?)
- Casey: (was) empty fold + phone format rejection + no sticky CTA — all fixed
- Riley: name accepted 500 chars (FIXED max 100); no skip link (FIXED); retry without backoff
- רבקה (58, low digital literacy, old Android): SSR-hidden sections until JS; modal instead of direct dial; legalese consent (privacy now linked)

# Questions
1. Would an honest 3-question wizard convert better than the callback form while delivering the "בדיקה" promise?
2. Why is the design's centerpiece (hero photo) allowed to fail silently into a blank wall?
3. When every road leads to the same form, when does funneling start reading as the bureaucracy the brand fights?
