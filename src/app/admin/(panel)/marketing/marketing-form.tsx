"use client";

import { useState, useTransition } from "react";
import { saveMarketingAction, type MarketingInput } from "./actions";
import {
  ID_FIELDS,
  TOKEN_PATTERN,
  VERIFICATION_FIELDS,
  extractToken,
  normalizeId,
  type IdField,
} from "@/lib/admin/marketing-fields";
import { Field, Panel, Switch } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/save-bar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/admin/toast";

const GROUPS: { key: IdField["group"]; title: string; description: string }[] = [
  { key: "google", title: "גוגל", description: "Tag Manager, Analytics ו-Ads." },
  { key: "social", title: "רשתות חברתיות", description: "פיקסלים של פלטפורמות הפרסום." },
  { key: "other", title: "כלים נוספים", description: "ניתוח התנהגות גולשים." },
];

function idError(f: IdField, v: string) {
  const n = normalizeId(f.field, v);
  return n && !f.pattern.test(n) ? `הפורמט לא נראה נכון. דוגמה: ${f.example}` : undefined;
}

export function MarketingForm({ initial }: { initial: MarketingInput }) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const toast = useToast();
  const dirty = JSON.stringify(data) !== saved;

  const setId = (field: string, v: string) => setData((d) => ({ ...d, ids: { ...d.ids, [field]: v } }));
  const setVer = (field: string, v: string) =>
    setData((d) => ({ ...d, verification: { ...d.verification, [field]: v } }));

  const directPixels = ["ga4_id", "google_ads_id", "meta_pixel_id", "tiktok_pixel_id", "linkedin_partner_id"]
    .filter((k) => data.ids[k]?.trim())
    .map((k) => ID_FIELDS.find((f) => f.field === k)?.label);
  const gtmAndDirect = Boolean(data.ids.gtm_id?.trim()) && directPixels.length > 0;

  const save = () =>
    start(async () => {
      const res = await saveMarketingAction(data);
      if (res.ok) {
        setServerErrors({});
        setSaved(JSON.stringify(data));
        toast("נשמר — התגים מעודכנים באתר");
      } else {
        setServerErrors(res.errors ?? {});
        toast(res.error ?? "יש שדות לתקן", "error");
      }
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-6 pb-24"
    >
      {gtmAndDirect && (
        <p role="note" className="m-0 rounded-card border border-gold-deep/40 bg-accent-tint px-5 py-4 text-[15px]">
          <b>שימו לב:</b> מוגדרים גם GTM וגם {directPixels.join(", ")} בטעינה ישירה. ודאו שאותם תגים
          לא מוגדרים <b>גם</b> בתוך הקונטיינר — אחרת כל ליד ייספר פעמיים.
        </p>
      )}

      {GROUPS.map((g) => (
        <Panel key={g.key} title={g.title} description={g.description}>
          <div className="grid gap-6 md:grid-cols-2">
            {ID_FIELDS.filter((f) => f.group === g.key).map((f) => {
              const v = data.ids[f.field] ?? "";
              const error = idError(f, v) ?? serverErrors[f.field];
              return (
                <Field key={f.field} label={f.label} hint={f.hint} error={error} htmlFor={f.field}>
                  <Input
                    id={f.field}
                    value={v}
                    onChange={(e) => setId(f.field, e.target.value)}
                    onBlur={(e) => setId(f.field, normalizeId(f.field, e.target.value))}
                    placeholder={f.placeholder}
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={Boolean(error)}
                    className="font-mono text-[15px]"
                  />
                </Field>
              );
            })}
          </div>
        </Panel>
      ))}

      <Panel title="פרטיות ומדידה מתקדמת">
        <div className="flex flex-col gap-6">
          <Switch
            id="consent_required"
            checked={data.consent_required}
            onChange={(v) => setData((d) => ({ ...d, consent_required: v }))}
            label="באנר עוגיות — מדידה רק אחרי אישור הגולש"
            description="כשפעיל: גוגל מודד בלי עוגיות עד האישור, ופיקסלים של Meta / TikTok / LinkedIn / Clarity נטענים רק אחרי לחיצה על “אישור”. החלטה משפטית — כדאי להתייעץ."
          />
          <div className="border-t border-hairline-soft" />
          <Switch
            id="enhanced_conversions"
            checked={data.enhanced_conversions}
            onChange={(v) => setData((d) => ({ ...d, enhanced_conversions: v }))}
            label="Enhanced Conversions / Advanced Matching"
            description="מצרף לאירוע הליד טלפון ומייל מגובבים (SHA-256, לא קריאים) — משפר משמעותית את התאמת ההמרות בגוגל ובמטא."
          />
        </div>
      </Panel>

      <Panel title="אימות בעלות על האתר" description="ערך תג ה-meta שכל מערכת נותנת. אפשר להדביק את התג המלא.">
        <div className="grid gap-6 md:grid-cols-3">
          {VERIFICATION_FIELDS.map((f) => {
            const v = data.verification[f.field] ?? "";
            const token = extractToken(v);
            const error =
              (token && !TOKEN_PATTERN.test(token) ? "הערך לא תקין" : undefined) ?? serverErrors[f.field];
            return (
              <Field key={f.field} label={f.label} hint={f.hint} error={error} htmlFor={f.field}>
                <Input
                  id={f.field}
                  value={v}
                  onChange={(e) => setVer(f.field, e.target.value)}
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                  className="font-mono text-[14px]"
                />
              </Field>
            );
          })}
        </div>
      </Panel>

      <SaveBar dirty={dirty} pending={pending} />
    </form>
  );
}
