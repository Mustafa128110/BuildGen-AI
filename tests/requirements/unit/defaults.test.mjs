import test from "node:test";
import assert from "node:assert/strict";
import { createRequirementsDraft } from "../../../src/features/requirements/model/defaults.ts";

test("requirements drafts preserve the five-room academic brief and connectivity", () => {
  const draft = createRequirementsDraft();
  assert.equal(draft.plotWidth, 14450); assert.equal(draft.plotDepth, 9800); assert.equal(draft.rooms.length, 5);
  assert.equal(draft.adjacencies.filter(edge => edge.strength === "hard").length, 3);
  assert.ok(draft.adjacencies.every(edge => draft.rooms.some(r => r.id === edge.room_a) && draft.rooms.some(r => r.id === edge.room_b)));
});
test("requirements drafts do not share rooms, adjacency objects or plot state", () => {
  const first = createRequirementsDraft();
  first.rooms[0].type = "changed"; first.rooms.push({ id: "fake" }); first.adjacencies[0].room_a = "fake"; first.plotWidth = 0;
  const second = createRequirementsDraft();
  assert.equal(second.rooms[0].type, "living"); assert.equal(second.rooms.length, 5);
  assert.equal(second.adjacencies[0].room_a, "need_living"); assert.equal(second.plotWidth, 14450);
});
