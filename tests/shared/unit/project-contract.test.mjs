import test from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_PROJECT_REFERENCES, resolveProjectReference } from "../../../src/shared/contracts/project.ts";

test("project handoff uses the shared sample identity and returns copies", () => {
  assert.equal(resolveProjectReference("villa-sognate").code, "VS-049");
  const first = resolveProjectReference("villa-sognate"); first.name = "changed";
  assert.equal(resolveProjectReference("villa-sognate").name, "Villa Sognate");
});
test("new project IDs retain readable titles without prototype-property confusion", () => {
  assert.deepEqual(resolveProjectReference("my-courtyard-06-abcd"), { name: "My Courtyard", code: "SP-106" });
  assert.deepEqual(resolveProjectReference("constructor"), { name: "Constructor", code: "SP-106" });
});
test("the shared sample catalogue cannot be mutated by a feature", () => {
  assert.throws(() => { SAMPLE_PROJECT_REFERENCES.newEntry = {}; }, TypeError);
  assert.throws(() => { SAMPLE_PROJECT_REFERENCES["villa-sognate"].name = "changed"; }, TypeError);
});
