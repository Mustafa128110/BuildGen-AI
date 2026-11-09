import test from "node:test";
import assert from "node:assert/strict";
import { snapToGrid, pxToMeters, calculateAreaM2 } from "../../../src/features/drafting/model/geometry.ts";

test("drafting snapping respects enabled state, custom grids and negative coordinates", () => {
  assert.equal(snapToGrid(24, true), 20); assert.equal(snapToGrid(24, false), 24);
  assert.equal(snapToGrid(27, true, 5), 25); assert.equal(snapToGrid(-27, true, 5), -25);
});
test("drafting area and distance retain the existing 50px-per-meter scale", () => {
  assert.equal(pxToMeters(125), "2.50"); assert.equal(calculateAreaM2(100, 150), "6.0");
});
