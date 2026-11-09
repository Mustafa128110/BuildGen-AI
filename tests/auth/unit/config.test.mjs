import test from "node:test";
import assert from "node:assert/strict";
import { readAuthConfiguration } from "../../../src/lib/auth/config.ts";
const env = { SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "sb_publishable_example" };

test("uses server configuration and normalizes an API URL", () => {
  assert.deepEqual(readAuthConfiguration({ ...env, SUPABASE_URL: env.SUPABASE_URL + "/rest/v1/" }), { url: env.SUPABASE_URL, key: env.SUPABASE_ANON_KEY });
});
test("supports legacy variable names without a placeholder fallback", () => {
  assert.equal(readAuthConfiguration({ NEXT_PUBLIC_SUPABASE_URL: env.SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY }).url, env.SUPABASE_URL);
  for (const settings of [{}, { SUPABASE_URL: env.SUPABASE_URL }, { ...env, SUPABASE_URL: "https://your-project.supabase.co" }, { ...env, SUPABASE_ANON_KEY: "placeholder" }]) assert.equal(readAuthConfiguration(settings), null);
});
test("rejects non-HTTPS, credential-bearing, malformed or path-bearing provider origins", () => {
  for (const url of ["http://external.example", "https://name:secret@example.com", "https://example.com?secret=x", "https://example.com#fragment", "https://example.com/other", "not-a-url"]) assert.equal(readAuthConfiguration({ ...env, SUPABASE_URL: url }), null);
});
test("permits loopback for isolated provider integration tests", () => {
  assert.equal(readAuthConfiguration({ ...env, SUPABASE_URL: "http://127.0.0.1:9999" }).url, "http://127.0.0.1:9999");
});
test("rejects secret and service-role credentials instead of bypassing RLS", () => {
  const jwt = (role) => `e30.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.equal(readAuthConfiguration({ ...env, SUPABASE_ANON_KEY: "sb_secret_example" }), null);
  assert.equal(readAuthConfiguration({ ...env, SUPABASE_ANON_KEY: jwt("service_role") }), null);
  assert.ok(readAuthConfiguration({ ...env, SUPABASE_ANON_KEY: jwt("anon") }));
});
