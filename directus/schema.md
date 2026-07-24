# Directus — סכמת התוכן של אתר שלכם

ה-collections משקפים אחד-לאחד את הטיפוסים ב-`src/lib/content/types.ts`.
כשמוגדר `DIRECTUS_URL` (ו-`DIRECTUS_STATIC_TOKEN` לקריאה), שכבת התוכן
(`src/lib/content/index.ts`) קוראת מ-Directus; אחרת — מהתוכן המקומי ב-`src/lib/content/local/`.

## Collections

### faqs
| field | type |
|---|---|
| question | string |
| answer | text |

### testimonials
| field | type |
|---|---|
| quote | text |
| name | string |
| detail | string |
| image | file (optional) |

### articles
| field | type |
|---|---|
| slug | string (unique) |
| title | string |
| excerpt | text |
| category | string (מדריכים / חדשות / סיפורי הצלחה) |
| readingMinutes | integer |
| publishedLabel | string |
| image | file (optional) |
| featured | boolean |
| author | json — `{ name, role, bio? }` |
| body | json — `[{ id, heading?, paragraphs[], bullets?[] }]` |
| related | json — רשימת slugs |

### doctors
| field | type |
|---|---|
| name | string |
| specialty | string (internal / ortho / cardio / neuro / psych / onco) |
| bio | text |
| image | file (optional) |

### team_members
| field | type |
|---|---|
| name | string |
| title | string |
| bio | text |
| linkedin | string (optional) |
| image | file (optional) |

### institutions
| field | type |
|---|---|
| slug | string (unique) |
| name | string |
| tagline | string |
| description | text |
| services | json — `[{ name, href? }]` |
| heroTitle | string |
| heroIntro | text |
| approach | json — `[{ title, description }]` |
| serviceCards | json — `[{ name, tag, description, href }]` |
| stats | json — `[{ value, label, accent? }]` |
| statsNote | string (optional) |
| formOptions | json — רשימת נושאים לטופס |

### services
| field | type |
|---|---|
| slug | string (unique) |
| name | string |
| institutionSlug | string |
| heroIntro | text |
| takeaways | json — רשימת משפטים |
| eligibility | json — `[{ title, description }]` |
| eligibilityTip | text (optional) |
| sections | json — `[{ id, heading, paragraphs[] }]` |
| hasTaxCalculator | boolean |
| testimonials | json |
| faqs | json |
| relatedRights | json — `[{ name, href? }]` |
| resources | json — `[{ title, href, image? }]` |

### leads (כתיבה בלבד מהאתר)
| field | type |
|---|---|
| full_name | string |
| phone | string |
| email | string (optional) |
| topic | string (optional) |
| source_page | string |
| marketing_consent | boolean |
| submitted_at | datetime |

### globals (singleton — הגדרות אתר)
| field | type |
|---|---|
| hero_image | file — תמונת הצוות בהירו של דף הבית |
| hero_image_alt | string |

הרשאות: ל-role הציבורי (או static token של האתר) — קריאה לכל collections התוכן
(כולל globals ו-directus_files, בשביל הגשת תמונות), ו-**create בלבד** ל-leads.

## תמונות (העלאה דרך ה-CMS)

הקמה חד-פעמית (מתוך תיקיית `directus/` על השרת):

```
bash seed/run-media-setup.sh
```

זה יוצר את `globals` (תמונת ההירו), מוסיף שדה העלאת תמונה `image_file`
ל-testimonials / articles / doctors / team_members, ומגדיר הרשאות קריאה לקבצים.

צנרת התמונות: העורך מעלה מקור אחד (רצוי ברוחב ~2000px). האתר מבקש כל תמונה
דרך ה-endpoint של Directus‏ `/assets/<id>?width=…&quality=75&format=auto` —
המנוע המובנה (sharp) מקטין לרוחב שהמסך צריך ומגיש AVIF/WebP לפי הדפדפן,
והתוצאה נשמרת בדיסק כך שהעבודה נעשית פעם אחת. ה-`srcset` נבנה אוטומטית
ע"י `next/image` דרך `CmsImage`‏ (`src/components/shared/cms-image.tsx`).
Caddy מוסיף Cache-Control לשבוע על `/assets/*`.

## Webhook לרענון האתר

Flow ב-Directus: על כל create/update/delete ב-collections התוכן →
`POST https://www.shelachem.net/api/revalidate?secret=<REVALIDATE_SECRET>`.

הקמה אוטומטית (מתוך תיקיית `directus/` על השרת):

```
bash seed/run-revalidate-flow.sh
```

הסקריפט מייצר `REVALIDATE_SECRET` (אם אין ב-.env), יוצר/מעדכן את ה-Flow,
ומדפיס את הסוד — יש להגדיר אותו גם כ-`REVALIDATE_SECRET` בפאנל של Vercel.

## משתני סביבה באתר (Next.js)

```
DIRECTUS_URL=https://cms.shelachem.net
DIRECTUS_STATIC_TOKEN=<token עם הרשאות הקריאה לעיל>
REVALIDATE_SECRET=<אותו secret כמו ב-Flow>
```
