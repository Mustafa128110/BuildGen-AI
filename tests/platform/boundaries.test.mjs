import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { markupFingerprints } from "./support/ui-markup.mjs";
const read = (file) => readFileSync(file, "utf8");
const files = (path) => readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(`${path}/${entry.name}`) : [`${path}/${entry.name}`]);

test("all existing styles, HTML and public assets are byte-identical to the pre-refactor baseline", () => {
  const baseline = JSON.parse(read("tests/platform/fixtures/ui-baseline.json"));
  for (const [path, hash] of Object.entries(baseline)) {
    if (path.endsWith(".tsx")) continue;
    assert.ok(existsSync(path), `UI file was moved: ${path}`);
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), hash, `UI changed: ${path}`);
  }
});

test("all original JSX markup is preserved across relocated views and extracted components", () => {
  const baseline = JSON.parse(read("tests/platform/fixtures/ui-markup-baseline.json"));
  for (const [original, { destinations, fingerprints }] of Object.entries(baseline)) {
    assert.deepEqual(destinations.flatMap(path => markupFingerprints(read(path))).sort(), fingerprints, `Rendered markup changed: ${original}`);
  }
});

test("auth transport uses the public server facade and never invokes the vendor SDK directly", () => {
  for (const path of files("src/app/api/auth").concat(["src/app/auth/confirm/route.ts"])) {
    const source = read(path);
    assert.doesNotMatch(source, /@supabase\/|\.auth\.(signIn|signUp|verifyOtp|signOut|setSession)/, path);
    assert.match(source, /@\/lib\/auth\/server/, path);
  }
  assert.match(read("src/lib/auth/server.ts"), /import "server-only"/);
  assert.match(read("src/proxy.ts"), /isMemberPath\(request.nextUrl.pathname\)/);
});

test("runtime modules cannot import tests or other features' pages", () => {
  for (const path of files("src/lib").filter((p) => /\.ts$/.test(p))) {
    assert.doesNotMatch(read(path), /(?:from|import)\s*[('"].*(?:tests\/|@\/app\/)/, path);
  }
  for (const path of ["dashboard", "projects", "studio", "cad", "requirements"]) assert.match(read(`src/app/${path}/layout.tsx`), /MemberLayout/);
});
