import { NextRequest } from "next/server";
import { readAuthBody, authJson } from "@/lib/auth/http";
import { clearSessionCookies, setSessionCookies, verifyOtpCode } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const body = await readAuthBody(request);
  if (body.error) return body.error;
  const { email, token, password, isSignUp, remember } = (body.data as any) || {};
  if (!email || !token) {
    return authJson({ success: false, error: "Email and verification token are required." }, 400);
  }
  const result = await verifyOtpCode(email, token, {
    password,
    isSignUp: Boolean(isSignUp),
    remember: Boolean(remember),
  });
  if (!result.ok) {
    const response = authJson({ success: false, error: result.error }, result.status);
    if (result.status === 401) clearSessionCookies(response);
    return response;
  }
  const response = authJson({ success: true, user: result.value.user });
  setSessionCookies(response, result.value.session, Boolean(remember));
  return response;
}
