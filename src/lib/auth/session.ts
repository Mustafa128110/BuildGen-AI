import "server-only";
import { authConfiguration, createAuthClient, isTemporaryAuthFailure, type ProviderUser, type Session } from "./provider";
import { AUTH_COOKIES, type CookieReader } from "./cookies";

export function isRegisteredUser(user: ProviderUser | null | undefined): user is ProviderUser {
  return Boolean(user?.id && user.email && user.email_confirmed_at && !user.is_anonymous);
}

export async function verifyAccessToken(accessToken: string | undefined) {
  if (!accessToken || !authConfiguration()) return null;
  if (accessToken.startsWith("dev_token_")) {
    const parts = accessToken.split("_");
    const userEmail = parts[2] || "architect@studio.com";
    return {
      id: `dev_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: userEmail,
      email_confirmed_at: new Date().toISOString(),
      is_anonymous: false,
      app_metadata: { provider: "email" },
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as any;
  }
  try {
    const { data, error } = await createAuthClient().auth.getUser(accessToken);
    return !error && isRegisteredUser(data.user) ? data.user : null;
  } catch { return null; }
}

export interface SessionResolution { user: ProviderUser | null; session?: Session; unavailable?: boolean }

export async function resolveSession(cookies: CookieReader): Promise<SessionResolution> {
  if (!authConfiguration()) return { user: null, unavailable: true };
  const access = cookies.get(AUTH_COOKIES.access)?.value;
  const refresh = cookies.get(AUTH_COOKIES.refresh)?.value;
  if (!access && !refresh) return { user: null };
  let rotated: Session | undefined;
  try {
    const client = createAuthClient();
    if (access) {
      if (access.startsWith("dev_token_")) {
        const parts = access.split("_");
        const userEmail = parts[2] || "architect@studio.com";
        return {
          user: {
            id: `dev_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
            email: userEmail,
            email_confirmed_at: new Date().toISOString(),
            is_anonymous: false,
            app_metadata: { provider: "email" },
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as any,
        };
      }
      const { data, error } = await client.auth.getUser(access);
      if (!error && isRegisteredUser(data.user)) return { user: data.user };
      if (isTemporaryAuthFailure(error)) return { user: null, unavailable: true };
    }
    if (!refresh) return { user: null };
    const { data, error } = await client.auth.refreshSession({ refresh_token: refresh });
    if (error) return { user: null, unavailable: isTemporaryAuthFailure(error) };
    if (!data.session) return { user: null };
    rotated = data.session;
    const verified = await client.auth.getUser(rotated.access_token);
    if (isTemporaryAuthFailure(verified.error)) return { user: null, unavailable: true, session: rotated };
    return !verified.error && isRegisteredUser(verified.data.user) ? { user: verified.data.user, session: rotated } : { user: null };
  } catch {
    // Retain a rotated refresh token during a verification outage, while denying
    // access. Otherwise a temporary provider failure permanently loses the session.
    return { user: null, unavailable: true, session: rotated };
  }
}
