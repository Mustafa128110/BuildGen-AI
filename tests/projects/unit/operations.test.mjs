import test from "node:test";
import assert from "node:assert/strict";
import { createProject, selectProjects } from "../../../src/features/projects/model/operations.ts";

const sample = (overrides = {}) => ({ id: "p", title: "Villa", plotCode: "VS-049", subtitle: "Courtyard", zoning: "R-1", category: "Residential", areaNum: 100, lodNum: 200, revisionOrder: 2, ...overrides });
const input = { newTitle: "A New Plot!", newArea: "1,480", newCategory: "Residential", newZoning: "R-2", newLevels: "3 Levels", newPrompt: "A courtyard", createPreset: "ai" };

test("project search and category filtering compose without mutating the input", () => {
  const first = sample(), second = sample({ id: "q", category: "Commercial", title: "Office" });
  const projects = Object.freeze([Object.freeze(first), Object.freeze(second)]);
  assert.deepEqual(selectProjects(projects, { selectedCategory: "residential", searchQuery: "  COURTYARD ", sortBy: "recent" }), [first]);
  assert.deepEqual(selectProjects(projects, { selectedCategory: "All", searchQuery: "office", sortBy: "recent" }), [second]);
  assert.deepEqual(selectProjects(projects, { selectedCategory: "Urban", searchQuery: "", sortBy: "recent" }), []);
  assert.equal(projects[0], first);
});
test("each project sort works on a fresh array without changing the catalogue", () => {
  const a = sample(), b = sample({ id: "b", areaNum: 500, lodNum: 400, revisionOrder: 1 }), projects = [a, b];
  for (const sortBy of ["area-desc", "lod", "recent"]) assert.deepEqual(selectProjects(projects, { selectedCategory: "All", searchQuery: "", sortBy }), [b, a]);
  assert.deepEqual(selectProjects(projects, { selectedCategory: "All", searchQuery: "", sortBy: "area-asc" }), [a, b]);
  assert.deepEqual(projects, [a, b]);
});
test("creating a project preserves existing IDs, presets and area semantics", () => {
  const image = Object.freeze({ image: "/plan.webp", renderImage: "/render.webp" });
  const created = createProject(input, 5, image, 1234567);
  assert.match(created.id, /^a-new-plot-06-/);
  assert.equal(created.areaNum, 1480); assert.equal(created.statusLabel, "AI SYNTHESIS");
  assert.equal(created.subtitle, input.newPrompt); assert.equal(created.plotCode, "PLOT // SP-106");
  const blank = createProject({ ...input, createPreset: "blank", newArea: "", newTitle: "!?" }, 0, image, 1234567);
  assert.match(blank.id, /^plot-01-/); assert.equal(blank.areaNum, 1200); assert.equal(blank.statusLabel, "DRAFTING");
  assert.equal(blank.statusPulse, false);
});
