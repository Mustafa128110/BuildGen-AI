import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readAuthConfiguration } from "./config";
export type { Session, User as ProviderUser } from "@supabase/supabase-js";

export function authConfiguration() {
  return readAuthConfiguration(process.env);
}

export function createAuthClient(accessToken?: string, timeoutMs = 8000) {
  const config = authConfiguration();
  if (!config) throw new Error("AUTH_NOT_CONFIGURED");
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs) }),
    },
  });
}

export function isTemporaryAuthFailure(error: { status?: number } | null | undefined): boolean {
  return Boolean(error && (!error.status || error.status === 429 || error.status >= 500));
}
