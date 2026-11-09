import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDependencies, readSources } from "./support/dependencies.mjs";

test("entire source graph obeys feature ownership, domain direction and has no cycles", () => {
  assert.deepEqual(analyzeDependencies(readSources()), []);
});

test("boundary checks catch alias, relative and dynamic imports into another feature", () => {
  for (const statement of ['import { x } from "@/features/b/model/private";', 'export { x } from "../../b/model/private";', 'const x = import("../../b/model/private");', 'import "@/features/a/../b/model/private";', 'import "../../b/model/private.js";', 'type X = import("../../b/model/private").X;']) {
    const errors = analyzeDependencies({ "src/features/a/model/example.ts": statement, "src/features/b/model/private.ts": "export const x = 1;" });
    assert.ok(errors.some(error => error.includes("cross-feature")), statement);
  }
});

test("feature contracts cannot smuggle implementation exports across boundaries", () => {
  assert.ok(analyzeDependencies({ "src/features/example/contracts.ts": 'export { privateImplementation } from "./service";' }).some(error => error.includes("type-only")));
});

test("application adapters cannot bypass a feature's public surface", () => {
  const sources = { "src/lib/consumer.ts": 'import "@/features/example/model/private";', "src/features/example/model/private.ts": "export const value = 1;" };
  assert.ok(analyzeDependencies(sources).some(error => error.includes("public feature entry point")));
  assert.ok(analyzeDependencies({ "src/features/example/client.ts": "gsap.ticker.lagSmoothing(0);" }).some(error => error.includes("global animation infrastructure")));
});

test("boundary checks reject dependency cycles and shared-to-feature coupling", () => {
  const errors = analyzeDependencies({ "src/shared/a.ts": 'import "../features/a/private";', "src/features/a/private.ts": 'import "../../shared/a";' });
  assert.ok(errors.some(error => error.includes("shared infrastructure")));
  assert.ok(errors.some(error => error.includes("dependency cycle")));
});

test("boundary checks reject route, vendor, test and UI dependencies in domain modules", () => {
  const errors = analyzeDependencies({ "src/features/example/model/rules.ts": 'import "react"; import "@supabase/supabase-js"; import "@/app/page"; import "../../../tests/fake";' });
  for (const rule of ["UI or controller", "vendor SDK", "application routes", "runtime must not import tests"]) assert.ok(errors.some(error => error.includes(rule)), rule);
});

test("explicit auth client and typed contracts are permitted across features", () => {
  assert.deepEqual(analyzeDependencies({ "src/features/example/client.ts": 'import "@/features/auth/client"; import type { X } from "@/features/other/contracts";', "src/features/auth/client.ts": "", "src/features/other/contracts.ts": "export type X = string;" }), []);
});
