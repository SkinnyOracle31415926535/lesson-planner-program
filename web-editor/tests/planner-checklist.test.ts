import assert from "node:assert/strict";
import test from "node:test";
import {
  addPlannerChecklistItem,
  parsePlannerChecklist,
  removePlannerChecklistItem,
  starterPlannerChecklist,
  updatePlannerChecklistItem,
} from "../app/planner-checklist";

test("a fresh checklist seeds the former starter tasks as editable examples", () => {
  const checklist = starterPlannerChecklist();
  assert.equal(checklist.version, 1);
  assert.deepEqual(checklist.items.map((item) => item.id), ["set-bar-station-mats", "summer-skill-card-reminder"]);
  assert.ok(updatePlannerChecklistItem(checklist, "set-bar-station-mats", "Set mats", "Use the blue panel mats."));
});

test("checklist items add, update, and remove without mutating the source list", () => {
  const original = starterPlannerChecklist();
  const added = addPlannerChecklistItem(original, { id: "checklist-water", title: "Fill water bottle", detail: "Before warmup." });
  assert.ok(added);
  assert.equal(original.items.length, 2);
  const updated = updatePlannerChecklistItem(added, "checklist-water", "Fill water bottles", "Before every lesson.");
  assert.ok(updated);
  assert.equal(updated.items.at(-1)?.title, "Fill water bottles");
  const removed = removePlannerChecklistItem(updated, "checklist-water");
  assert.ok(removed);
  assert.equal(removed.items.length, 2);
});

test("checklist storage rejects duplicate, unsafe, and malformed records", () => {
  const checklist = starterPlannerChecklist();
  assert.equal(parsePlannerChecklist({ ...checklist, unexpected: true }), null);
  assert.equal(parsePlannerChecklist({ ...checklist, items: [...checklist.items, checklist.items[0]] }), null);
  assert.equal(addPlannerChecklistItem(checklist, { id: "bad id", title: "Task", detail: "Detail" }), null);
  assert.equal(updatePlannerChecklistItem(checklist, "set-bar-station-mats", "", "Detail"), null);
});
