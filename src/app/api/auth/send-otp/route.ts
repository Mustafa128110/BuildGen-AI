import { NextRequest } from "next/server";
import { readAuthBody, authJson } from "@/lib/auth/http";
import { sendOtp } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const body = await readAuthBody(request);
  if (body.error) return body.error;
  const { email, isSignUp, fullName, organization, password } = (body.data as any) || {};
  if (!email || typeof email !== "string") {
    return authJson({ success: false, error: "Valid email is required." }, 400);
  }
  const result = await sendOtp(email, {
    isSignUp: Boolean(isSignUp),
    fullName,
    organization,
    password,
  });
  if (!result.ok) {
    return authJson({ success: false, error: result.error }, result.status);
  }
  return authJson({ success: true, isRateLimited: result.value.isRateLimited });
}
