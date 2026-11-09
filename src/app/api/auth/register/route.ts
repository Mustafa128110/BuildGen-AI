import { NextRequest } from "next/server";
import { readAuthBody, authJson, requestOrigin } from "@/lib/auth/http";
import { clearSessionCookies, registerAccount } from "@/lib/auth/server";
import { validateRegistration } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  const body = await readAuthBody(request);
  if (body.error) return body.error;
  const input = validateRegistration(body.data);
  if (!input.ok) return authJson({ success: false, error: input.error }, 400);
  const result = await registerAccount(input.value, requestOrigin(request));
  if (!result.ok) return authJson({ success: false, error: result.error }, result.status);
  const response = authJson({ success: true, message: "Registration received. If email confirmation is required, confirm your email first. Then sign in with your password." }, 201);
  clearSessionCookies(response);
  return response;
}
