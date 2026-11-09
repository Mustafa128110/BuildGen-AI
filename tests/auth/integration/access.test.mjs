import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture } from "../support/fixture.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });

test("every member route, alias and descendant rejects absent or forged credentials", async () => {
  for (const path of ["/studio", "/cad", "/dashboard", "/projects", "/requirements", "/studio/nested", "/studio?project=secret"]) {
    for (const jar of [{}, { buildgen_access: "forged", buildgen_refresh: "forged", buildgen_auth_user: "Mustafa" }]) {
      const r = await f.get(path, jar);
      assert.equal(r.status, 307); assert.equal(new URL(r.headers.get("location"), f.base).pathname, "/sign-in");
      assert.doesNotMatch(await r.text(), /GROUND FLOOR PLAN/);
    }
  }
});

test("RSC, prefetch and middleware header spoofing do not bypass the guard", async () => {
  for (const headers of [{ RSC: "1", "Next-Router-Prefetch": "1" }, { "x-middleware-subrequest": "src/proxy:".repeat(5) }, { RSC: "1", Cookie: "buildgen_access=forged" }]) {
    const r = await f.get("/studio", {}, headers);
    assert.ok([307, 400, 401, 403].includes(r.status)); assert.doesNotMatch(await r.text(), /GROUND FLOOR PLAN/);
  }
});

test("provider-issued anonymous and unconfirmed identities are not confirmed members", async () => {
  for (const record of [{ id: "anon", email: "", anonymous: true, confirmed: false }, { id: "pending", email: "pending@example.com", confirmed: false }]) {
    const session = f.provider.session(record);
    const r = await f.get("/studio", { buildgen_access: session.access_token, buildgen_refresh: session.refresh_token });
    assert.equal(r.status, 307);
  }
});

test("public pages and assets remain public with no provider lookup in the proxy", async () => {
  const before = f.provider.state.requests.length;
  for (const path of ["/", "/sign-in", "/login", "/favicon.svg"]) assert.equal((await f.get(path)).status, 200);
  assert.equal(f.provider.state.requests.length, before);
});
