import "server-only";
import { createAuthClient, type ProviderUser } from "./provider";
import type { User } from "./types";

export async function userView(user: ProviderUser, accessToken: string): Promise<User> {
  // Authentication is authoritative; optional presentation data must not make a
  // successful login fail. Queries are bounded and always scoped to this user.
  let profile: Record<string, unknown> | null = null;
  try {
    const { data, error } = await createAuthClient(accessToken, 2000).from("profiles")
      .select("display_name, professional_label, organization, avatar_url, sheets_quota")
      .eq("id", user.id).maybeSingle().retry(false);
    if (!error && data) profile = data;
  } catch { /* Use this same verified user's metadata, never a demo identity. */ }
  const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const name = text(profile?.display_name, 80) || text(user.user_metadata?.full_name, 80) || user.email?.split("@")[0] || "Member";
  const quota = profile?.sheets_quota;
  return {
    id: user.id, name, email: user.email || "", role: text(profile?.professional_label, 100) || "Member",
    organization: text(profile?.organization, 120) || text(user.user_metadata?.organization, 120),
    avatar: name.slice(0, 2).toUpperCase(), quotaUsed: 0,
    quotaTotal: typeof quota === "number" && Number.isSafeInteger(quota) && quota >= 0 ? quota : 25,
  };
}
