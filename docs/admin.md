# לוח הבקרה (`/admin`) — מדריך תפעול

`https://www.shelachem.net/admin`. מחליף את Directus. אין שרת לתחזק: הכול רץ על Vercel.

| רכיב | איפה | משתנה סביבה |
|---|---|---|
| תוכן (7 סוגים), הגדרות אתר, משתמשי הלוח, גיבוי לידים | Neon Postgres (Vercel ▸ Storage) | `DATABASE_URL` |
| תמונות שמועלות מהלוח | Vercel Blob (public) | `BLOB_READ_WRITE_TOKEN` |
| לידים (המערכת הראשית) | BARAM Leads, לקוח "שלכם" (4800) | `BARAM_LEADS_API_KEY` |

אם המסד לא זמין, האתר הציבורי ממשיך לעבוד מהתוכן המקומי (`src/lib/content/local/`).
כשל נרשם בלוג, ואחריו האתר לא פונה למסד דקה (`src/lib/content/store.ts`).

## מסכים

| מסך | מה עושים בו |
|---|---|
| **סקירה** | לידים היום, ב-7 ימים וב-30 ימים, ממתינים למשוב, לידים אחרונים (מ-BARAM) ותגי המדידה המחוברים. התראה על לידים שלא הועברו, עם "שלח שוב" |
| **לידים** | חיפוש וסינון (משוב, ערוץ, utm_source, תאריכים), שינוי משוב, ייצוא CSV (עד 5,000 שורות). בעמוד ליד: פרטים, מקור הגעה, משוב עם סיבה או מועד חזרה, הוספת הערה, ציר זמן וקישור לליד ב-BARAM |
| **שיווק ופיקסלים** | GTM, GA4, Google Ads, Meta, TikTok, LinkedIn, Clarity, באנר עוגיות, Enhanced Conversions, אימותי בעלות. ראו [marketing.md](./marketing.md) |
| **הגדרות אתר** | טלפון, וואטסאפ, מייל, רשתות חברתיות, סניפים, שעות פעילות, תמונת ההירו, כתובות ה-webhook של BARAM |
| **תוכן האתר** | כתבות, שאלות נפוצות, המלצות, רופאים, צוות, מוסדות ושירותים. כולל העלאת תמונות ו"גרסאות קודמות" (20 אחרונות לכל פריט) עם שחזור |
| **משתמשים** (מנהל בלבד) | יצירה עם סיסמה זמנית, שינוי הרשאה, איפוס סיסמה, השבתה |

**שמירה = האתר מתעדכן מיד** (`revalidatePath`), בלי build.

## משתמשים והתחברות
- שני תפקידים: **מנהל** (הכול) ו**עורך אתר** (הכול חוץ ממסך המשתמשים).
- סיסמאות מגובבות ב-scrypt (`src/lib/admin/password.ts`). ה-session נשמר במסד (`admin_sessions`), בעוגייה `sh_admin_session` (httpOnly, `SameSite=Strict`, path `/admin`), ל-14 יום.
- 5 ניסיונות כושלים לאימייל ב-15 דקות → חסימה זמנית (`login_attempts`).
- משתמש חדש או איפוס → סיסמה זמנית שמוצגת פעם אחת, וחובה להחליף אותה בכניסה.
- השבתה או איפוס מנתקים את המשתמש מכל המכשירים מיד. תמיד נשאר לפחות מנהל פעיל אחד.
- שכחתם סיסמה? מנהל אחר מאפס. אם אין אף מנהל פעיל: `npm run db:seed -- --admin-email <email חדש> --admin-name <שם>` יוצר מנהל חדש עם סיסמה זמנית (משתמש קיים לא משתנה).

## הקמה (פעם אחת)
1. Vercel ▸ Storage: לחבר **Neon** ו-**Blob** לפרויקט. המשתנים `DATABASE_URL` ו-`BLOB_READ_WRITE_TOKEN` נוספים לבד.
2. BARAM Leads ▸ הגדרות ▸ "API ו-MCP" ▸ מפתח חדש, ללקוח "שלכם", קריאה וכתיבה. לשמור ב-Vercel בשם `BARAM_LEADS_API_KEY`.
3. מיגרציות ו-seed רצים **אוטומטית בבניית production** (`scripts/vercel-db.mjs`, לפני `next build`). שניהם אידמפוטנטיים: התוכן המקומי נטען במלואו רק ל-collection ריק.
   **עדכוני תוכן מהריפו (סנכרון):** שינוי ב-`src/lib/content/local/` מגיע ל-production בבנייה הבאה, אבל רק לפריטים שלא נערכו בלוח אף פעם (`updated_by = 'seed'`). לפני כל עדכון כזה נשמרת גרסה קודמת (`content_revisions`, `saved_by = 'seed'`), כך שאפשר לשחזר מ"גרסאות קודמות".
   - פריט שנערך בלוח לא נדרס לעולם. כדי להחיל עליו את נוסח הריפו, עורכים אותו בלוח.
   - פריט חדש בריפו לא נוסף אוטומטית ל-collection שכבר יש בו תוכן, ופריט שנמחק בלוח לא חוזר. מוסיפים אותו בלוח.
   - פריט שנמחק מהריפו לא נמחק מהמסד. מוחקים אותו בלוח.
   יומן הבנייה מסכם כל collection ("עודכנו N פריטים מהריפו", "חדש בריפו — לא נוסף אוטומטית", "נמחק בלוח", "קיים במסד ולא בריפו").
   המנהל הראשון נוצר לפי משתני הסביבה `ADMIN_BOOTSTRAP_EMAIL` ו-`ADMIN_BOOTSTRAP_NAME`. הסיסמה הזמנית שלו מודפסת **פעם אחת** ביומן הבנייה (Vercel ▸ Deployments ▸ Build Logs, לחפש "סיסמה זמנית"), ומוחלפת בכניסה הראשונה.
   מקומית, מול מסד אחר: `DATABASE_URL=... npm run db:migrate && npm run db:seed -- --admin-email you@example.com --admin-name "שם"`.
4. Redeploy ב-Vercel, כדי שהמשתנים ייכנסו לתוקף.

## שינוי מבנה המסד
`src/db/schema.ts` → `npm run db:generate` (נוצר קובץ ב-`drizzle/`) → `npm run db:migrate`.

## לידים
- `/api/leads` שומר את הליד ב-`lead_backups`, עונה לגולש, ואז שולח ל-BARAM (`after()`). התוצאה נרשמת בשורת הגיבוי (`baram_lead_id` או `forward_error`).
- **ב-preview לידים חסומים.** כש-`VERCEL_ENV=preview` (כל deployment של ענף/PR), `/api/leads` מריץ
  ולידציה ועונה `403` עם `{ ok: false, preview: true }` וכותרת `X-Lead-Blocked: preview` — בלי
  לשמור ב-`lead_backups`, בלי BARAM ובלי המרות (הטופס מציג "סביבת בדיקה" ולא יורה `generate_lead`).
  הסיבה: preview ופרודקשן חולקים את אותו מסד Neon ואת מפתח BARAM. בפרודקשן ובפיתוח מקומי — ללא שינוי.
  כדי לבדוק שליחה מקצה לקצה צריך אישור, ו-DB/מפתח נפרדים ל-preview.
- ליד שלא הועבר תוך דקה מופיע בסקירה. "שלח שוב" שולח עד 50 בכל לחיצה.
- הערות שנוספות מהלוח נרשמות ב-BARAM בשם בעל מפתח ה-API, ולכן שם הכותב מצורף לטקסט.
- **החלפת מפתח BARAM:** יוצרים מפתח חדש, מעדכנים את `BARAM_LEADS_API_KEY` ב-Vercel, עושים redeploy, ורק אז מבטלים את הישן.

## גיבוי ושחזור
- **תוכן:** כל שמירה ומחיקה שומרות קודם עותק ב-`content_revisions`. שחזור דרך "גרסאות קודמות" בעורך.
- **המסד כולו:** ל-Neon יש שחזור לנקודת זמן (point-in-time restore) מתוך הקונסולה. בחבילה החינמית אפשר לחזור עד 6 שעות אחורה, וביותר זמן בחבילות בתשלום.
- **תמונות:** Blob לא מוחק קבצים כשמחליפים תמונה בלוח, כך שקובץ ישן נשאר זמין בכתובת שלו.

## ממשק (shadcn/ui)
- רכיבי הלוח: `src/components/admin/ui/` (shadcn/ui, סגנון new-york, `components.json`). מוסיפים רכיב עם `npx shadcn@latest add <name>` — הוא נכתב לתיקייה הזו ולא נוגע ברכיבי האתר הציבורי (`src/components/ui/`).
- הצבעים ממופים למותג ב-`src/app/globals.css` (בלוק "לוח הבקרה"). ה-accent של shadcn נקרא `ui-accent`, כי `accent` של האתר הוא הזהב. אחרי `shadcn add` מחליפים `bg-accent`/`text-accent-foreground` ל-`bg-ui-accent`/`text-ui-accent-foreground`.
- RTL: הלוח עטוף ב-`Direction.Provider dir="rtl"` של Radix (`src/app/admin/layout.tsx`), הסרגל בצד ימין (`side="right"`), ובקומפוננטות משתמשים ב-`ms/me/ps/pe/start/end` ולא ב-left/right.
- אבני בניין משותפות: `src/components/admin/ui.tsx` (PageTitle, Panel, Field, Switch, Badge, EmptyState), `confirm-button.tsx` (אישור לפני מחיקה/שחזור), `save-bar.tsx`, `toast.tsx` (sonner).

## קוד
`src/app/admin/`, `src/components/admin/`, `src/lib/admin/` · מסד: `src/db/` · BARAM: `src/lib/baram-api.ts`, `src/lib/lead-forwarding.ts`, `src/lib/lead-backups.ts` · העלאה: `src/app/admin/upload/route.ts` · הגנה: `src/proxy.ts` בודק רק שהעוגייה קיימת, ו-`requireSession()` מאמת בכל עמוד ופעולה.
