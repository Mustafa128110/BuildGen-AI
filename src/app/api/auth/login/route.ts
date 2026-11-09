import { NextRequest } from "next/server";
import { readAuthBody, authJson } from "@/lib/auth/http";
import { clearSessionCookies, setSessionCookies, signIn } from "@/lib/auth/server";
import { validateCredentials } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  const body = await readAuthBody(request);
  if (body.error) return body.error;
  const input = validateCredentials(body.data);
  if (!input.ok) return authJson({ success: false, error: input.error }, 400);
  const result = await signIn(input.value);
  if (!result.ok) {
    const response = authJson({ success: false, error: result.error }, result.status);
    if (result.status === 401) clearSessionCookies(response);
    return response;
  }
  const response = authJson({ success: true, user: result.value.user });
  setSessionCookies(response, result.value.session, input.value.remember);
  return response;
}
