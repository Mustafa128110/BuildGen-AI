import { NextRequest } from "next/server";
import { authJson, readAuthBody } from "@/lib/auth/http";
import { AUTH_COOKIES, clearSessionCookies, signOut } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const body = await readAuthBody(request);
  if (body.error) return body.error;
  await signOut(request.cookies.get(AUTH_COOKIES.access)?.value, request.cookies.get(AUTH_COOKIES.refresh)?.value);
  const response = authJson({ success: true });
  clearSessionCookies(response);
  return response;
}
