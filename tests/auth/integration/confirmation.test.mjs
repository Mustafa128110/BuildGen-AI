import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture, details } from "../support/fixture.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });
const link = (token = "a".repeat(64), type = "email") => `/auth/confirm?token_hash=${token}&type=${type}`;

test("email OTP confirmation is single-use and requires a separate password sign-in", async () => {
  f.provider.state.confirmationRequired = true;
  try {
    const input = details(), jar = {};
    assert.equal((await f.post("/api/auth/register", input, jar)).status, 201); assert.deepEqual(jar, {});
    assert.equal((await f.post("/api/auth/login", input, jar)).status, 401);
    const r = await f.get(link()); assert.equal(r.status, 303);
    assert.equal(new URL(r.headers.get("location"), f.base).searchParams.get("confirmed"), "1");
    assert.equal(f.provider.state.lastVerification, "email"); assert.deepEqual(r.headers.getSetCookie(), []);
    assert.equal((await f.get("/studio")).status, 307);
    assert.equal((await f.post("/api/auth/login", input, jar)).status, 200);
    const replay = await f.get(link()); assert.equal(new URL(replay.headers.get("location"), f.base).searchParams.get("error"), "confirmation");
  } finally { f.provider.state.confirmationRequired = false; }
});

test("invalid confirmation links cannot log out an existing user", async () => {
  const { jar } = await f.account();
  for (const path of [link("bad"), link("b".repeat(64)), link("a".repeat(64), "recovery"), "/auth/confirm"]) {
    const r = await f.get(path, jar); assert.equal(r.status, 303); assert.deepEqual(r.headers.getSetCookie(), []);
    assert.equal((await f.get("/api/auth/session", jar)).status, 200);
  }
});

test("legacy signup links use the supported email OTP verification contract", async () => {
  f.provider.state.confirmationRequired = true;
  try {
    assert.equal((await f.post("/api/auth/register", details())).status, 201);
    const r = await f.get(link("a".repeat(64), "signup"));
    assert.equal(new URL(r.headers.get("location"), f.base).searchParams.get("confirmed"), "1");
    assert.equal(f.provider.state.lastVerification, "email");
  } finally { f.provider.state.confirmationRequired = false; }
});
