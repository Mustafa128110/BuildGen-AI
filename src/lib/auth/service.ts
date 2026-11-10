import "server-only";
import { authConfiguration, createAuthClient, isTemporaryAuthFailure, type Session } from "./provider";
import { isRegisteredUser } from "./session";
import { userView } from "./profile";
import type { Credentials, Registration } from "./validation";
import type { User } from "./types";

type Failure = { ok: false; status: 400 | 401 | 429 | 503; error: string };
type Result<T> = { ok: true; value: T } | Failure;
const unavailable = (): Failure => ({ ok: false, status: 503, error: "Authentication is unavailable. Please try again later." });

export async function signIn(input: Credentials): Promise<Result<{ user: User; session: Session }>> {
  if (!authConfiguration()) return unavailable();
  try {
    const { data, error } = await createAuthClient().auth.signInWithPassword({ email: input.email, password: input.password });
    if (error?.status === 429) return { ok: false, status: 429, error: "Too many attempts. Please try again later." };
    if (isTemporaryAuthFailure(error)) return unavailable();
    if (error || !data.session || !isRegisteredUser(data.user)) return { ok: false, status: 401, error: "Unable to sign in. Check your email and password, and confirm your email if required." };
    return { ok: true, value: { user: await userView(data.user, data.session.access_token), session: data.session } };
  } catch { return unavailable(); }
}

export async function registerAccount(input: Registration, origin: string): Promise<Result<null>> {
  if (!authConfiguration()) return unavailable();
  try {
    const client = createAuthClient();
    const { data, error } = await client.auth.signUp({ email: input.email, password: input.password, options: {
      data: { full_name: input.fullName, organization: input.organization }, emailRedirectTo: `${origin}/sign-in`,
    } });
    if (error?.status === 429) return { ok: false, status: 429, error: "Too many attempts. Please try again later." };
    if (isTemporaryAuthFailure(error)) return unavailable();
    if (error || !data.user) return { ok: false, status: 400, error: "Registration could not be completed. Check your details or try signing in if you already registered." };
    // The account is already created. A retirement failure must not falsely say
    // signup failed. No tokens from registration ever reach the browser.
    if (data.session) { try { await client.auth.signOut({ scope: "local" }); } catch { /* Best-effort retirement only. */ } }
    return { ok: true, value: null };
  } catch { return unavailable(); }
}

export async function confirmEmail(token: string | null, type: string | null): Promise<boolean> {
  if (!authConfiguration() || !token || !/^[a-f0-9]{32,128}$/i.test(token) || !["email", "signup"].includes(type || "")) return false;
  try {
    const client = createAuthClient();
    const { data, error } = await client.auth.verifyOtp({ token_hash: token, type: "email" });
    if (error || !isRegisteredUser(data.user)) return false;
    if (data.session) { try { await client.auth.signOut({ scope: "local" }); } catch { /* Never issue confirmation cookies. */ } }
    return true;
  } catch { return false; }
}

export async function signOut(access?: string, refresh?: string): Promise<void> {
  try {
    if (!authConfiguration() || !access || !refresh) return;
    const client = createAuthClient();
    const { error } = await client.auth.setSession({ access_token: access, refresh_token: refresh });
    if (!error) await client.auth.signOut({ scope: "local" });
  } catch { /* The HTTP adapter always removes local cookies, including outages. */ }
}
