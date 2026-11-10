import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { FEATURE_REGISTRY, MEMBER_PATHS, isMemberPath } from "../../src/lib/feature-registry.ts";

test("each member feature registers its route and compatibility alias exactly once", () => {
  assert.equal(new Set(MEMBER_PATHS).size, MEMBER_PATHS.length);
  assert.deepEqual(FEATURE_REGISTRY.projects.memberRoutes, ["/dashboard", "/projects"]);
  for (const path of MEMBER_PATHS) { assert.ok(isMemberPath(path)); assert.ok(isMemberPath(`${path}/nested`)); }
});
test("public routes and similar-looking prefixes are not accidentally classified as members", () => {
  for (const path of ["/", "/sign-in", "/api/auth/login", "/studioevil", "/projects-archive"]) assert.equal(isMemberPath(path), false);
});

test("every feature has routing ownership metadata and every member route has the shared layout", () => {
  const features = readdirSync("src/features", { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(Object.keys(FEATURE_REGISTRY).sort(), features);
  for (const route of MEMBER_PATHS) assert.match(readFileSync(`src/app${route}/layout.tsx`, "utf8"), /MemberLayout/);
});
