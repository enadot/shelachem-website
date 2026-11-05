# שיווק דיגיטלי, מדידה ותמונות שיתוף

מדריך לתשתית השיווק של האתר: איך מחברים GTM, GA4 ופיקסלים, אילו אירועים האתר
שולח, איך עובד ה-attribution של הלידים, ואיך בנויות תמונות ה-OG.

**העיקרון:** הקוד כבר שולח את כל האירועים, והכול נשלט מ**לוח הבקרה** של האתר —
`https://www.shelachem.net/admin`. מדביקים מזהה ושומרים, והתג נטען באתר מיד — בלי
משתני סביבה ובלי פריסה מחדש.

---

## 0. לוח הבקרה (`/admin`)

המדריך המלא — מסכים, משתמשים, מסד הנתונים, תמונות וחיבור ל-BARAM Leads — ב-[`docs/admin.md`](./admin.md).
כאן רק מה שקשור לשיווק: מסך **שיווק ופיקסלים** שומר במסד, והאתר מתעדכן מיד (`revalidatePath`).

---

## 1. חיבור התגים

במסך **שיווק ופיקסלים** — לכל מערכת יש הסבר איפה מוצאים את המזהה, ובדיקת פורמט בזמן
ההקלדה. שדה ריק = התג כבוי.

| שדה | מה הוא טוען | הערות |
|---|---|---|
| Google Tag Manager | קונטיינר GTM (`GTM-XXXXXXX`) | **מומלץ.** כל השאר מנוהל בתוך הקונטיינר |
| Google Analytics 4 | GA4 ישיר (gtag.js) | רק אם GA4 לא מוגדר ב-GTM |
| Google Ads + תווית המרת ליד | Google Ads ישיר + המרת ליד | התווית ב-Ads ▸ Conversions ▸ Tag setup |
| Meta Pixel | Meta (Facebook/Instagram) Pixel | |
| TikTok Pixel | TikTok Pixel | |
| LinkedIn + מזהה המרה | LinkedIn Insight Tag + המרת ליד | |
| Microsoft Clarity | מפות חום והקלטות | |
| אימות Google / Bing / Meta | תגי `meta` לאימות בעלות | אפשר להדביק את התג המלא — הערך נחלץ אוטומטית |

> ⚠️ **כל פיקסל ממקום אחד בלבד.** אם Meta Pixel מוגדר בתוך GTM — לא ממלאים אותו גם
> בלוח, אחרת כל PageView וכל ליד ייספרו פעמיים. הלוח מציג אזהרה כשמוגדרים גם GTM וגם
> פיקסלים ישירים. האתר שולח אירועים ישירות לפיקסל רק כשהוא זה שטען אותו.

**הקוד:** הערכים נשמרים ב-singleton `globals` ונקראים ב-`getSiteSettings()`
(`src/lib/content/index.ts`, `src/lib/site-settings.ts`, `src/lib/marketing.ts`).
הטעינה ב-`src/components/marketing/`, האירועים ב-`src/lib/analytics.ts`.

**רק בפרודקשן.** preview ו-production ב-Vercel קוראים מאותו מסד (Neon), ולכן אותם
מזהים. כדי ש-preview לא ישלח צפיות, קליקים והמרות לנכסי הפרודקשן, `buildMarketingConfig`
מחזיר קונפיגורציה ריקה (בלי GTM/GA4/Ads/פיקסלים/Clarity ובלי תגי אימות; `consentRequired`
נשמר) בכל סביבה שבה `VERCEL_ENV` אינו `production` — preview, development ומקומית.
- **לבדיקה מכוונת ב-preview** (למשל GA4 DebugView): להגדיר ב-Vercel `PREVIEW_TRACKING=1`
  ל-Preview (אפשר לענף מסוים) ולפרוס מחדש. זהירות — זה שולח לנכסי הפרודקשן.
- `dataLayer` ממשיך לקבל את כל האירועים בכל סביבה, כך שאפשר לבדוק ב-DevTools
  (`window.dataLayer`) בלי לטעון אף תג.
- מסך הסקירה בלוח הבקרה מציג את ההגדרות השמורות גם ב-preview (`ignoreEnv`).

---

## 2. מילון האירועים (dataLayer)

כל אירוע נדחף ל-`window.dataLayer` עם `event_id` ייחודי (ל-dedup מול המרות מהשרת).

| `event` | מתי | פרמטרים | מיפוי ישיר לפיקסלים |
|---|---|---|---|
| `generate_lead` | ליד **נשמר בהצלחה** בשרת | `lead_source`, `lead_topic`, `event_id`, `user_data`* | Meta `Lead` · TikTok `SubmitForm` · Ads conversion · LinkedIn conversion |
| `form_start` | פוקוס ראשון בטופס ליד | `lead_source`, `lead_topic` | — |
| `quiz_step` | תשובה בבדיקת הזכאות בהירו | `quiz_step`, `quiz_question`, `quiz_answer` | — |
| `click_to_call` | קליק על קישור `tel:` (בכל האתר) | `link_url`, `link_text`, `link_location`, `page_path` | Meta/TikTok `Contact` |
| `click_whatsapp` | קליק על `wa.me` | כנ״ל | Meta/TikTok `Contact` |
| `click_email` | קליק על `mailto:` | כנ״ל | Meta/TikTok `Contact` |
| `click_directions` | קליק על Waze / Google Maps | כנ״ל | — |
| `virtual_page_view` | מעבר עמוד פנימי (לא בטעינה הראשונה) | `page_path`, `page_location`, `page_title` | Meta `PageView` · TikTok `page()` |
| `consent_update` | הגולש בחר בבאנר העוגיות | `consent_state` | — |

\* `user_data` = `sha256_phone_number` / `sha256_email_address`, רק כשהמתג Enhanced Conversions דלוק בלוח.

`link_location` הוא האזור שבו נלחץ הקישור: `header`, `footer`,
`dialog`, `content` — או ערך מפורש מ-`data-track-location="..."` על אלמנט עוטף.
קישורי טלפון/וואטסאפ חדשים נמדדים אוטומטית, בלי לגעת בקוד.

**דפי נחיתה (`/lp/<slug>`, T-026):** ארבעת האירועים `form_start`, `generate_lead`,
`click_to_call` ו-`click_whatsapp` מקבלים שם גם `lp_slug` (למשל `depression`),
`cta_position` (`hero` / `mid` / `final` / `bar`, לפי `lead_source` או `link_location`
בפורמט `lp-<slug>-<pos>`; `lp-mobile-cta-bar` → `bar`; קליק מחוץ לבלוק CTA, למשל בהדר, בלי
`cta_position`) ו-`lead_topic` (הנושא של העמוד). `lead_source` לא משתנה — ב-`generate_lead`
הוא ממשיך לכלול את סיומת `|utm` ש-BARAM Leads נשען עליה. מחוץ ל-`/lp` אין שינוי.

### הקמה מומלצת ב-GTM

1. **Variables** ▸ Data Layer Variable לכל פרמטר: `lead_source`, `lead_topic`,
   `event_id`, `link_location`, `quiz_step`, `quiz_answer`, `page_path`.
2. **Triggers** ▸ Custom Event: `generate_lead`, `form_start`, `quiz_step`,
   `click_to_call`, `click_whatsapp`, `virtual_page_view`.
3. **GA4:** Google Tag על All Pages (מעברי עמוד נמדדים ע״י enhanced measurement —
   **לא** לחבר את `virtual_page_view` ל-GA4, זה יכפיל). GA4 Event לכל טריגר, ולסמן
   את `generate_lead` כ-Key event ב-GA4.
4. **Google Ads:** Conversion Linker על All Pages; Ads Conversion על `generate_lead`
   עם Transaction ID = `{{event_id}}`. ל-Enhanced Conversions: User-Provided Data
   מ-`user_data`.
5. **Meta Pixel:** Base + PageView על All Pages **וגם** על `virtual_page_view`;
   `Lead` על `generate_lead` עם `eventID` = `{{event_id}}`; `Contact` על
   `click_to_call` / `click_whatsapp`.
6. **TikTok / LinkedIn / Taboola / Outbrain** — באותה תבנית: base על All Pages,
   המרה על `generate_lead`.
7. **Consent:** ב-Admin ▸ Container Settings להפעיל Consent Overview, ולתגים שאינם
   של גוגל להגדיר Additional consent ▸ `ad_storage`.

> 💡 תחום רפואי: Meta עלולה לסווג את הדומיין כ"בריאות" ולחסום אירועים מותאמים
> ופרמטרים ב-URL. משתמשים באירועים סטנדרטיים (`Lead`, `Contact`) — כך האתר בנוי.

---

## 3. הסכמה לעוגיות (Consent Mode v2)

- **ברירת מחדל** (המתג "באנר עוגיות" כבוי בלוח): Consent Mode במצב
  `granted`, אין באנר, המדידה פועלת מיד.
- **המתג דלוק:** Consent Mode במצב `denied` (גוגל ממשיך
  במדידה ללא עוגיות — cookieless pings), באנר בתחתית המסך, ופיקסלים של צד שלישי
  (Meta/TikTok/LinkedIn/Clarity) נטענים **רק אחרי אישור**. בפוטר מופיע קישור
  "הגדרות עוגיות" לשינוי הבחירה. הבחירה נשמרת ב-localStorage (`shelachem-consent`).

ההחלטה אם להפעיל היא משפטית (תיקון 13 לחוק הגנת הפרטיות / קהל מאירופה). בכל
מקרה — לעדכן את מדיניות הפרטיות שכתוב בה אילו כלי מדידה פועלים באתר.

---

## 4. Attribution — מאיפה הגיע כל ליד

פרמטרים של קמפיין קיימים רק בעמוד הנחיתה. `src/lib/attribution.ts` לוכד אותם בכניסה
ושומר ב-localStorage, כך שגם ליד שנשלח שלושה עמודים אחר כך משויך לקמפיין:

- **first touch** — המקור הראשון של הגולש (נשמר ל-90 יום);
- **last touch** — הקמפיין / האתר המפנה האחרון;
- נלכדים: `utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`, `msclkid`, `li_fat_id`
  + עמוד נחיתה ו-referrer חיצוני;
- עוגיות פיקסלים: `_fbp`, `_fbc`, `_ga`, `_gcl_aw`, `_ttp`.

הכול נשלח עם הליד ל-BARAM Leads (UTM, מזהי קליק, עמוד נחיתה, referrer) ונשמר גם בגיבוי
`lead_backups` (כל ה-`attribution` כ-JSON), יחד עם `event_id` — אותו
מזהה שנשלח באירוע ההמרה. זה הבסיס לשליחת המרות מהשרת בעתיד (Meta Conversions API,
Google Ads Offline Conversions) ולהחזרת "ליד שהפך ללקוח" לפלטפורמות.
את המקור רואים בלוח הבקרה בעמוד של כל ליד ("מאיפה הגיע הליד"), ובייצוא ה-CSV.

---

## 4א. BARAM Leads — מערכת הלידים

השרת שומר כל ליד בגיבוי (`lead_backups` ב-Postgres) ושולח אותו ל-BARAM Leads (לקוח "שלכם"):

| מקור הליד | ערוץ ב-BARAM Leads |
|---|---|
| שאלון הזכאות בדף הבית (`home-quiz`) | **שאלון** |
| כל שאר הטפסים | **לידים מהאתר** |

- נשלחים: שם, טלפון, מייל, נושא + הטופס (בהערות), הסכמה לדיוור, UTM, gclid/fbclid,
  עמוד נחיתה ו-referrer, ו-`event_id` (זהה לאירוע ההמרה בדפדפן).
- ערוץ השאלון כבוי או נכשל → הליד נשלח לערוץ האתר. כשל מלא נרשם על שורת הגיבוי,
  ובסקירה בלוח מופיעה התראה עם כפתור "שלח שוב ל-BARAM".
- השליחה קורית אחרי שהגולש כבר קיבל "תודה" (`after()`), כך שהיא לא מאטה את הטופס.
- בפיתוח וב-preview הלידים מסומנים `test` ב-BARAM (בלי מייל התראה ובלי חיוב).
- הכתובות נערכות בלוח הבקרה ▸ הגדרות אתר ▸ "BARAM Leads". ברירת המחדל בקוד:
  `src/lib/lead-forwarding.ts`.

---

## 5. תמונות שיתוף (Open Graph)

כל עמוד מקבל תמונת שיתוף משלו (1200×630), שנוצרת בקוד ב-build — מה שמופיע כשהקישור
נשלח בוואטסאפ, פייסבוק, לינקדאין, X וכו'.

| עמוד | תבנית |
|---|---|
| דף הבית | `src/app/opengraph-image.tsx` — גרסה של ההירו: "שלכם" ענק, המוסדות, תמונת הצוות |
| עמודים פנימיים | `src/app/<route>/opengraph-image.tsx` — תווית זהב, כותרת, תקציר, וצילום העמוד אם יש |
| כתבה / שירות / מוסד | נוצרות לפי התוכן מהלוח (כותרת, תקציר, קטגוריה, תמונה) ומתרעננות עם התוכן |

- התבניות ב-`src/lib/og/render.tsx`, בפונטי המותג (המרות TTF ב-`src/assets/og-fonts/`
  של קבצי ה-woff2 — מנוע ה-OG לא קורא woff2).
- המנוע (Satori) לא תומך ב-RTL — `src/lib/og/bidi.ts` מסדר את העברית בסדר חזותי
  (כולל מספרים ולטינית באמצע משפט). טקסט חדש בתבנית — רק דרך `RtlText`.
- ה-title/description של העמודים נבנים דרך `pageMetadata()` (`src/lib/metadata.ts`),
  כך שגם `og:title` ו-`og:description` של כל עמוד הם שלו (קודם כל העמודים ירשו את
  הכותרת של דף הבית).
- לבדיקה: `npm run dev` ואז `http://localhost:3000/<route>/opengraph-image`.
  אחרי פריסה: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  (גם מרענן את המטמון של פייסבוק/וואטסאפ) ו-[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
