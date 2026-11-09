import "server-only";
import type { NextResponse } from "next/server";
import type { Session } from "./provider";

export const AUTH_COOKIES = { access: "buildgen_access", refresh: "buildgen_refresh", remember: "buildgen_remember" };
export type CookieReader = { get(name: string): { value: string } | undefined };

function options(remember: boolean) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}) };
}

export function setSessionCookies(response: NextResponse, session: Session, remember: boolean) {
  const settings = options(remember);
  response.cookies.set(AUTH_COOKIES.access, session.access_token, settings);
  response.cookies.set(AUTH_COOKIES.refresh, session.refresh_token, settings);
  response.cookies.set(AUTH_COOKIES.remember, remember ? "1" : "0", settings);
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of Object.values(AUTH_COOKIES)) response.cookies.set(name, "", { ...options(false), maxAge: 0 });
}
