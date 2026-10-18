/**
 * קבועי ההתחברות ללוח — משותפים ל-proxy.ts ול-session.ts.
 * ההתחברות היא מול טבלת המשתמשים של האתר (admin_users), לא מול מערכת חיצונית.
 */

export const SESSION_COOKIE = "sh_admin_session";

/** העוגייה נשלחת רק לנתיבי הלוח, לא לאתר הציבורי. */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
};

/** כמה זמן נשארים מחוברים (שניות). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;
