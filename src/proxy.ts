import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/auth-shared";

/**
 * שומר הסף של לוח הבקרה: בלי עוגיית session → מסך ההתחברות. זו בדיקה
 * אופטימית בלבד — התוקף נבדק מול המסד ב-`requireSession` בכל עמוד ו-Server
 * Action, כי לפי התיעוד אסור לסמוך על proxy לבדו.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
