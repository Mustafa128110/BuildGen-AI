import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture, details } from "../support/fixture.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });

test("server validation rejects malformed identity data and injection-like syntax", async () => {
  for (const body of [{ ...details(), fullName: "<script>alert(1)</script>" }, { ...details(), confirmPassword: "different" }, { ...details(), organization: {} }]) {
    assert.equal((await f.post("/api/auth/register", body)).status, 400);
  }
  assert.equal((await f.post("/api/auth/login", { email: "' OR 1=1 --", password: "anything" })).status, 400);
});

test("cross-origin, missing-origin and forged-forwarded-host writes are denied", async () => {
  for (const headers of [{ Origin: "https://evil.example" }, { Origin: "" }, { Origin: "https://evil.example", "x-forwarded-host": "evil.example" }, { "sec-fetch-site": "cross-site" }]) {
    assert.equal((await f.post("/api/auth/register", details(), {}, headers)).status, 403);
  }
});

test("request size, content-type and JSON syntax are bounded", async () => {
  assert.equal((await f.post("/api/auth/login", { email: "a@example.com", password: "a".repeat(9000) })).status, 413);
  assert.equal((await f.post("/api/auth/login", {}, {}, { "Content-Type": "text/plain" })).status, 415);
  const r = await fetch(f.base + "/api/auth/login", { method: "POST", headers: { Origin: f.base, "Content-Type": "application/json" }, body: "{bad" });
  assert.equal(r.status, 400);
});
