import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture } from "../support/fixture.mjs";
import { rememberCookies } from "../../support/app-server.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });

test("explicit login issues protected persistent cookies and a password-free user contract", async () => {
  const { input } = await f.account({ login: false }), jar = {};
  const r = await f.post("/api/auth/login", { email: input.email, password: input.password, remember: true }, jar);
  assert.equal(r.status, 200);
  const data = await r.json(); assert.equal(data.user.email, input.email); assert.equal(data.user.name, input.fullName);
  assert.equal(data.user.password, undefined); assert.equal(data.access_token, undefined);
  for (const c of r.headers.getSetCookie()) { assert.match(c, /httponly/i); assert.match(c, /secure/i); assert.match(c, /samesite=lax/i); assert.match(c, /max-age=2592000/i); }
  for (const path of ["/studio", "/cad", "/dashboard", "/projects", "/requirements"]) {
    const page = await f.get(path, jar); assert.equal(page.status, 200); assert.match(page.headers.get("cache-control"), /no-store/);
  }
});

test("non-remembered sessions have no persistent-cookie expiration", async () => {
  const { input } = await f.account({ login: false });
  const r = await f.post("/api/auth/login", { email: input.email, password: input.password, remember: false });
  assert.equal(r.status, 200); assert.ok(r.headers.getSetCookie().every((c) => !/max-age|expires=/i.test(c)));
});

test("expired access is refreshed, verified, and propagated through session API and proxy", async () => {
  const { jar } = await f.account(); jar.buildgen_access = "expired";
  const r = await f.get("/api/auth/session", jar); assert.equal(r.status, 200); rememberCookies(r, jar);
  assert.notEqual(jar.buildgen_access, "expired");
  jar.buildgen_access = "expired-again";
  const page = await f.get("/studio", jar); assert.equal(page.status, 200); rememberCookies(page, jar);
  assert.notEqual(jar.buildgen_access, "expired-again");
});

test("invalid refresh credentials are rejected and removed", async () => {
  const jar = { buildgen_access: "expired", buildgen_refresh: "invalid" };
  const r = await f.get("/api/auth/session", jar); assert.equal(r.status, 401); rememberCookies(r, jar); assert.deepEqual(jar, {});
});

test("signout clears browser credentials and member access", async () => {
  const { jar } = await f.account(); const r = await f.post("/api/auth/logout", {}, jar);
  assert.equal(r.status, 200); assert.deepEqual(jar, {}); assert.equal((await f.get("/studio", jar)).status, 307);
});
