import { NextRequest, NextResponse } from "next/server";
import { confirmEmail } from "@/lib/auth/server";
import { requestOrigin } from "@/lib/auth/http";

export async function GET(request: NextRequest) {
  const url = new URL("/sign-in", requestOrigin(request));
  const confirmed = await confirmEmail(request.nextUrl.searchParams.get("token_hash"), request.nextUrl.searchParams.get("type"));
  url.searchParams.set(confirmed ? "confirmed" : "error", confirmed ? "1" : "confirmation");
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  // GET links must neither issue a login session nor sign an existing user out.
  return response;
}
