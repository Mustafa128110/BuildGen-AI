import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture, details } from "../support/fixture.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });

test("registration creates the account without issuing an automatic browser session", async () => {
  const input = details(), jar = {};
  const r = await f.post("/api/auth/register", input, jar);
  assert.equal(r.status, 201); assert.deepEqual(jar, {});
  assert.equal(f.provider.accounts.get(input.email).data.full_name, input.fullName);
  assert.equal((await f.get("/studio", jar)).status, 307);
});

test("invalid credentials and former demo credentials never create a session", async () => {
  const { input } = await f.account({ login: false });
  for (const email of [input.email, "unknown@example.com", "bscs2312208@szabist.pk", "alex.vance@cyan-draft.studio", "sarah.lin@strata-eng.com"]) {
    const jar = {}, r = await f.post("/api/auth/login", { email, password: "admin" }, jar);
    assert.equal(r.status, 401); assert.equal((await r.json()).success, false); assert.deepEqual(jar, {});
  }
});

test("duplicate registration reports failure without authenticating", async () => {
  const { input } = await f.account({ login: false }), jar = {};
  const r = await f.post("/api/auth/register", input, jar);
  assert.equal(r.status, 400); assert.equal((await r.json()).success, false); assert.deepEqual(jar, {});
});
