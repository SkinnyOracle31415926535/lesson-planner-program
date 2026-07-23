import assert from "node:assert/strict";
import test from "node:test";
import {
  areaCatalogPreferences,
  areaZoneWithOverride,
  emptyAreaCatalogPreferences,
  isAreaCatalogPreferences,
  isBuiltInAreaHidden,
  isCustomBoardHidden,
  setBuiltInAreaHidden,
  setCustomBoardHidden,
  updateBuiltInAreaOverride,
} from "../app/area-catalog";
import type { ZonePanel } from "../app/lesson-data";

const knownBuiltInIds = ["f2", "pb-hb"];

const floorTwo: ZonePanel = {
  id: "f2",
  title: "FLOOR 2",
  alias: "F2",
  note: "Original note",
  people: "Assign a group",
  cards: [],
  mapGroup: "FLOOR",
  mapRole: "floor-slice",
};

test("area catalog storage accepts only known supplied IDs and safe local values", () => {
  const preferences = areaCatalogPreferences({
    version: 1,
    builtInOverridesById: { f2: { title: "North floor", alias: "N FLOOR", note: "Use panel mats" } },
    hiddenBuiltInZoneIds: ["pb-hb"],
    hiddenCustomBoardIds: ["custom-board-bars"],
  });
  assert.equal(isAreaCatalogPreferences(preferences, knownBuiltInIds), true);

  const unknown = structuredClone(preferences);
  unknown.hiddenBuiltInZoneIds = ["not-a-supplied-area"];
  assert.equal(isAreaCatalogPreferences(unknown, knownBuiltInIds), false);

  const unsafe = structuredClone(preferences) as { hiddenCustomBoardIds: string[] };
  unsafe.hiddenCustomBoardIds = ["../custom-board-bars"];
  assert.equal(isAreaCatalogPreferences(unsafe, knownBuiltInIds), false);
});

test("a built-in area receives local text edits without changing its identity or geometry fields", () => {
  const updated = updateBuiltInAreaOverride(emptyAreaCatalogPreferences(), "f2", {
    title: "North floor",
    alias: "N FLOOR",
    note: "Use the blue panel mat.",
  }, knownBuiltInIds);
  const localZone = areaZoneWithOverride(floorTwo, updated);

  assert.equal(localZone.title, "North floor");
  assert.equal(localZone.alias, "N FLOOR");
  assert.equal(localZone.note, "Use the blue panel mat.");
  assert.equal(localZone.id, "f2");
  assert.equal(localZone.mapGroup, "FLOOR");
  assert.equal(localZone.mapRole, "floor-slice");
  assert.equal(floorTwo.title, "FLOOR 2");
});

test("soft remove and restore retain built-in and custom area records", () => {
  const hiddenBuiltIn = setBuiltInAreaHidden(emptyAreaCatalogPreferences(), "f2", true, knownBuiltInIds);
  const hiddenBoth = setCustomBoardHidden(hiddenBuiltIn, "custom-board-bars", true);
  assert.equal(isBuiltInAreaHidden(hiddenBoth, "f2"), true);
  assert.equal(isCustomBoardHidden(hiddenBoth, "custom-board-bars"), true);

  const restoredBuiltIn = setBuiltInAreaHidden(hiddenBoth, "f2", false, knownBuiltInIds);
  const restored = setCustomBoardHidden(restoredBuiltIn, "custom-board-bars", false);
  assert.equal(isBuiltInAreaHidden(restored, "f2"), false);
  assert.equal(isCustomBoardHidden(restored, "custom-board-bars"), false);
  assert.deepEqual(restored.builtInOverridesById, {});
});
