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

הרשאות: ל-role הציבורי (או static token של האתר) — קריאה לכל collections התוכן,
ו-**create בלבד** ל-leads.

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
