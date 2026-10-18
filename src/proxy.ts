import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
  directusRefresh,
  needsRefresh,
} from "@/lib/admin/auth-shared";

/**
 * שומר הסף של לוח הבקרה: בלי session → מסך ההתחברות; access token שעומד
 * לפוג → מרעננים מול Directus לפני הרינדור, ומעבירים את הטוקן החדש גם לבקשה
 * הנוכחית וגם לדפדפן. זו בדיקה אופטימית בלבד — כל Server Action בודק בעצמו
 * (`requireSession`), כי לפי התיעוד אסור לסמוך על proxy לבדו.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const refresh = request.cookies.get(COOKIE.refresh)?.value;

  if (!refresh) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const expiresAt = Number(request.cookies.get(COOKIE.expires)?.value ?? 0);
  const hasAccess = request.cookies.has(COOKIE.access);
  if (hasAccess && !needsRefresh(expiresAt)) {
    return isLogin ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  const tokens = await directusRefresh(refresh);
  if (!tokens) {
    const res = isLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
    for (const name of Object.values(COOKIE)) res.cookies.delete({ name, path: cookieOptions.path });
    return res;
  }

  const exp = String(Date.now() + tokens.expires);
  // הבקשה הנוכחית תרונדר כבר עם הטוקן החדש (cookies() בשרת קורא את הבקשה).
  request.cookies.set(COOKIE.access, tokens.access_token);
  request.cookies.set(COOKIE.refresh, tokens.refresh_token);
  request.cookies.set(COOKIE.expires, exp);
  const res = isLogin
    ? NextResponse.redirect(new URL("/admin", request.url))
    : NextResponse.next({ request: { headers: request.headers } });
  const opts = { ...cookieOptions, maxAge: REFRESH_MAX_AGE };
  res.cookies.set(COOKIE.access, tokens.access_token, opts);
  res.cookies.set(COOKIE.refresh, tokens.refresh_token, opts);
  res.cookies.set(COOKIE.expires, exp, opts);
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
