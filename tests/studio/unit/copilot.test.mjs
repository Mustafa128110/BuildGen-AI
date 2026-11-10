import test from "node:test";
import assert from "node:assert/strict";
import { proposeStudioChange } from "../../../src/features/studio/services/copilot.ts";

test("studio proposal returns only the requested control changes", () => {
  assert.deepEqual(proposeStudioChange("Add LOUVERS").patch, { louverDensity: 10, diffStatus: "proposed" });
  assert.deepEqual(proposeStudioChange("Summer solstice").patch, { viewportMode: "3d", sunShadows: true, shadowAngle: 165 });
  assert.deepEqual(proposeStudioChange("extrude facade").patch, { viewportMode: "3d", extrusionHeight: 3600 });
  assert.deepEqual(proposeStudioChange("a garden").patch, {});
});
test("proposal priority and metrics retain the original simulation behavior", () => {
  const result = proposeStudioChange("louver facade sun");
  assert.deepEqual(result.patch, { louverDensity: 10, diffStatus: "proposed" });
  assert.match(result.metrics.solar, /-47%/);
  assert.match(result.text, /10 blades/);
});
test("independent studio proposals never share mutable state", () => {
  const first = proposeStudioChange("sun"); first.patch.shadowAngle = 0; first.metrics.span = "changed";
  const second = proposeStudioChange("sun");
  assert.equal(second.patch.shadowAngle, 165); assert.notEqual(second.metrics.span, "changed");
});
