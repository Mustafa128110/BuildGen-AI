import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startFixture, details } from "../support/fixture.mjs";
import { rememberCookies, startApp, httpClient } from "../../support/app-server.mjs";
let f; before(async () => { f = await startFixture(); }); after(async () => { await f?.stop(); });

test("provider outages deny access without converting a live session into invalid credentials", async () => {
  const { jar, input } = await f.account(); const before = { ...jar };
  f.provider.state.outage = true;
  try {
    assert.equal((await f.post("/api/auth/login", input)).status, 503);
    const r = await f.get("/api/auth/session", jar); assert.equal(r.status, 503); rememberCookies(r, jar); assert.deepEqual(jar, before);
    assert.equal((await f.get("/studio", jar)).status, 307);
  } finally { f.provider.state.outage = false; }
});

test("rotated refresh tokens survive a temporary post-refresh verification failure", async () => {
  const { jar } = await f.account(); const oldRefresh = jar.buildgen_refresh; jar.buildgen_access = "expired";
  f.provider.state.failAfterRefresh = true;
  try {
    const r = await f.get("/api/auth/session", jar); assert.equal(r.status, 503); rememberCookies(r, jar);
    assert.notEqual(jar.buildgen_refresh, oldRefresh);
  } finally { f.provider.state.failAfterRefresh = false; }
  assert.equal((await f.get("/api/auth/session", jar)).status, 200);
});

test("proxy denies access but also preserves rotated tokens during an outage", async () => {
  const { jar } = await f.account(); jar.buildgen_access = "expired"; const oldRefresh = jar.buildgen_refresh;
  f.provider.state.failAfterRefresh = true;
  try {
    const r = await f.get("/studio", jar); assert.equal(r.status, 307); rememberCookies(r, jar); assert.notEqual(jar.buildgen_refresh, oldRefresh);
  } finally { f.provider.state.failAfterRefresh = false; }
  assert.equal((await f.get("/studio", jar)).status, 200);
});

test("provider rate limits do not clear existing session cookies", async () => {
  const { jar } = await f.account(), before = { ...jar };
  f.provider.state.userStatus = 429;
  try {
    const r = await f.get("/api/auth/session", jar); assert.equal(r.status, 503); rememberCookies(r, jar); assert.deepEqual(jar, before);
  } finally { f.provider.state.userStatus = 0; }
});

test("unavailable profile display data does not prevent a valid login", async () => {
  const { input } = await f.account({ login: false }); f.provider.state.profileStatus = 503;
  const before = f.provider.state.requests.filter((r) => r.path === "/rest/v1/profiles").length;
  try {
    const r = await f.post("/api/auth/login", input); assert.equal(r.status, 200);
    const result = await r.json(); assert.equal(result.user.name, input.fullName); assert.equal(result.user.email, input.email);
    assert.equal(f.provider.state.requests.filter((r) => r.path === "/rest/v1/profiles").length, before + 1);
  } finally { f.provider.state.profileStatus = 0; }
});

test("registration retirement and logout failures never create a fake login or strand local credentials", async () => {
  const { jar } = await f.account(); f.provider.state.logoutStatus = 503;
  try {
    assert.equal((await f.post("/api/auth/register", details())).status, 201);
    assert.equal((await f.post("/api/auth/logout", {}, jar)).status, 200); assert.deepEqual(jar, {});
  } finally { f.provider.state.logoutStatus = 0; }
});

test("missing configuration still starts public pages while authentication fails closed", async () => {
  const app = await startApp({ SUPABASE_URL: "", SUPABASE_ANON_KEY: "", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" });
  try {
    const http = httpClient(app.base);
    assert.equal((await http.post("/api/auth/login", details())).status, 503);
    assert.equal((await http.get("/studio")).status, 307);
  } finally { await app.stop(); }
});
