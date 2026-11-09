import { NextRequest } from "next/server";
import { authJson, authUnavailable } from "@/lib/auth/http";
import { AUTH_COOKIES, clearSessionCookies, resolveSession, setSessionCookies, userView } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const result = await resolveSession(request.cookies);
  if (result.unavailable) {
    const response = authUnavailable();
    if (result.session) setSessionCookies(response, result.session, request.cookies.get(AUTH_COOKIES.remember)?.value === "1");
    return response;
  }
  if (!result.user) {
    const response = authJson({ success: false, user: null }, 401);
    clearSessionCookies(response); return response;
  }
  try {
    const access = result.session?.access_token || request.cookies.get(AUTH_COOKIES.access)?.value || "";
    const response = authJson({ success: true, user: await userView(result.user, access) });
    if (result.session) setSessionCookies(response, result.session, request.cookies.get(AUTH_COOKIES.remember)?.value === "1");
    return response;
  } catch { return authUnavailable(); }
}
