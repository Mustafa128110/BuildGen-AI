import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

// Test infrastructure ONLY. Faults are real upstream responses to the compiled
// application; there are no mock flags or bypasses in the production feature.
export async function startProvider() {
  const accounts = new Map(), tokens = new Map(), refreshTokens = new Map(), confirmations = new Map();
  const state = { confirmationRequired: false, outage: false, userStatus: 0, profileStatus: 0, logoutStatus: 0,
    tokenStatus: 0, failAfterRefresh: false, failNextUser: false, lastVerification: null, requests: [] };
  function user(record) {
    return { id: record.id, aud: "authenticated", role: "authenticated", email: record.email, is_anonymous: record.anonymous === true,
      email_confirmed_at: record.confirmed ? "2026-11-09T00:00:00Z" : null, app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: record.data || {}, identities: [{ identity_id: record.id, provider: "email" }], created_at: "2026-11-09T00:00:00Z" };
  }
  function session(record) {
    const encoded = (data) => Buffer.from(JSON.stringify(data)).toString("base64url");
    const access = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ sub: record.id, exp: Math.floor(Date.now() / 1000) + 3600, jti: randomUUID() })}.dGVzdC1zaWduYXR1cmU`;
    const refresh = randomUUID(); tokens.set(access, record); refreshTokens.set(refresh, record);
    return { access_token: access, refresh_token: refresh, token_type: "bearer", expires_in: 3600, user: user(record) };
  }
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const reply = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    const url = new URL(req.url, "http://mock.invalid"), token = req.headers.authorization?.replace(/^Bearer /, "");
    state.requests.push({ path: url.pathname, method: req.method });
    if (state.outage) return reply(503, { message: "Unavailable" });
    let text = ""; for await (const chunk of req) text += chunk;
    const body = text ? JSON.parse(text) : {};
    if (url.pathname === "/auth/v1/signup") {
      if (accounts.has(body.email)) return reply(422, { msg: "User already registered", code: "user_already_exists" });
      const record = { id: randomUUID(), email: body.email, password: body.password, data: body.data, confirmed: !state.confirmationRequired };
      accounts.set(body.email, record);
      if (!record.confirmed) { confirmations.set("a".repeat(64), record); return reply(200, user(record)); }
      return reply(200, session(record));
    }
    if (url.pathname === "/auth/v1/token") {
      if (state.tokenStatus) return reply(state.tokenStatus, { msg: "Token temporarily unavailable" });
      if (url.searchParams.get("grant_type") === "refresh_token") {
        const record = refreshTokens.get(body.refresh_token);
        if (!record) return reply(400, { msg: "Invalid refresh token", code: "refresh_token_not_found" });
        refreshTokens.delete(body.refresh_token);
        if (state.failAfterRefresh) state.failNextUser = true;
        return reply(200, session(record));
      }
      const record = accounts.get(body.email);
      if (!record || record.password !== body.password) return reply(400, { msg: "Invalid login credentials", code: "invalid_credentials" });
      if (!record.confirmed) return reply(400, { msg: "Email not confirmed", code: "email_not_confirmed" });
      return reply(200, session(record));
    }
    if (url.pathname === "/auth/v1/user") {
      if (state.failNextUser) { state.failNextUser = false; return reply(503, { msg: "Verification temporarily unavailable" }); }
      if (state.userStatus) return reply(state.userStatus, { msg: "Verification temporarily unavailable" });
      const record = tokens.get(token);
      return record ? reply(200, user(record)) : reply(401, { msg: "Invalid token", code: "bad_jwt" });
    }
    if (url.pathname === "/auth/v1/logout") {
      if (state.logoutStatus) return reply(state.logoutStatus, { msg: "Logout temporarily unavailable" });
      tokens.delete(token); res.statusCode = 204; return res.end();
    }
    if (url.pathname === "/auth/v1/verify") {
      state.lastVerification = body.type;
      const record = confirmations.get(body.token_hash);
      if (!record) return reply(403, { msg: "Expired link", code: "otp_expired" });
      confirmations.delete(body.token_hash); record.confirmed = true; return reply(200, session(record));
    }
    if (url.pathname === "/rest/v1/profiles") return reply(state.profileStatus || 200, state.profileStatus ? { message: "Profile unavailable" } : []);
    return reply(404, { message: "Unknown test endpoint" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, state, accounts, session,
    async stop() { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); } };
}
