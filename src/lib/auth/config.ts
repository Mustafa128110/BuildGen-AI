export function readAuthConfiguration(environment: Record<string, string | undefined>) {
  const rawUrl = environment.SUPABASE_URL || environment.NEXT_PUBLIC_SUPABASE_URL;
  const key = environment.SUPABASE_ANON_KEY || environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !key || /your-project|placeholder/i.test(rawUrl) || /placeholder|your-anon-key/i.test(key)) return null;
  // This feature must never acquire an administrative database credential.
  if (key.startsWith("sb_secret_")) return null;
  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
      if (payload.role === "service_role") return null;
    } catch { return null; }
  }
  try {
    const url = new URL(rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""));
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || (url.protocol !== "https:" && !(loopback && url.protocol === "http:"))) return null;
    return { url: url.origin, key };
  } catch { return null; }
}
