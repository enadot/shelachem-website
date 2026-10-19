"use server";

import { requireSession } from "@/lib/admin/session";
import { errorMessage, saveGlobals } from "@/lib/admin/globals";
import {
  ID_FIELDS,
  TOKEN_PATTERN,
  VERIFICATION_FIELDS,
  extractToken,
  normalizeId,
} from "@/lib/admin/marketing-fields";

export interface MarketingInput {
  ids: Record<string, string>;
  verification: Record<string, string>;
  consent_required: boolean;
  enhanced_conversions: boolean;
}

export async function saveMarketingAction(input: MarketingInput) {
  const { user } = await requireSession();
  const patch: Record<string, unknown> = {
    consent_required: input.consent_required === true,
    enhanced_conversions: input.enhanced_conversions === true,
  };
  const errors: Record<string, string> = {};

  for (const f of ID_FIELDS) {
    const v = normalizeId(f.field, String(input.ids?.[f.field] ?? ""));
    if (v && !f.pattern.test(v)) errors[f.field] = `הפורמט לא נראה נכון. דוגמה: ${f.example}`;
    patch[f.field] = v || null;
  }
  for (const f of VERIFICATION_FIELDS) {
    const v = extractToken(String(input.verification?.[f.field] ?? ""));
    if (v && !TOKEN_PATTERN.test(v)) errors[f.field] = "הערך לא תקין — יש להדביק את ערך ה-content בלבד";
    patch[f.field] = v || null;
  }
  if (Object.keys(errors).length) return { ok: false as const, errors };

  try {
    await saveGlobals(patch, user.email);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, errors: {}, error: errorMessage(err) };
  }
}
