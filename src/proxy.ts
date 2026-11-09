import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, clearSessionCookies, resolveSession, setSessionCookies } from "@/lib/auth/server";
import { isMemberPath } from "@/lib/feature-registry";

export async function proxy(request: NextRequest) {
  if (!isMemberPath(request.nextUrl.pathname)) return NextResponse.next();
  const result = await resolveSession(request.cookies);
  if (!result.user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    if (!result.unavailable) clearSessionCookies(response);
    else if (result.session) setSessionCookies(response, result.session, request.cookies.get(AUTH_COOKIES.remember)?.value === "1");
    return response;
  }
  // Forward refreshed credentials to the server layout in this same request.
  if (result.session) {
    request.cookies.set(AUTH_COOKIES.access, result.session.access_token);
    request.cookies.set(AUTH_COOKIES.refresh, result.session.refresh_token);
  }
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.headers.set("Cache-Control", "private, no-store");
  if (result.session) setSessionCookies(response, result.session, request.cookies.get(AUTH_COOKIES.remember)?.value === "1");
  return response;
}

// Next requires a literal matcher. The registry above is the single authority
// for which feature routes are protected; assets/public routes pass through.
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
