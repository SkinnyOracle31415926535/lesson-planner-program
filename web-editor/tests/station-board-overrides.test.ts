import assert from "node:assert/strict";
import test from "node:test";
import {
  addLocalStationBoardSpot,
  effectiveStationBoardSpots,
  emptyStationBoardSpotOverrides,
  isStationBoardOverrideStorage,
  removeLocalStationBoardSpot,
  replaceStationBoardSpotOverrides,
  resetSourceStationBoardSpot,
  resetStationBoardSpotOverrides,
  stationBoardOverrideStorage,
  stationBoardSpotOverridesFor,
  updateLocalStationBoardSpot,
  updateSourceStationBoardSpot,
  type StationBoardSourceSpot,
} from "../app/station-board-overrides";

const sourceSpots: readonly StationBoardSourceSpot[] = Object.freeze([
  Object.freeze({ id: "anchor-low-bar", name: "Low bar", x: 0.2, y: 0.68 }),
  Object.freeze({ id: "anchor-high-bar", name: "High bar", x: 0.76, y: 0.31 }),
]);

test("override storage only accepts bounded coordinates and safe browser-local IDs", () => {
  const valid = stationBoardOverrideStorage({
    "sr-ph": {
      sourceSpotOverridesById: { "anchor-low-bar": { name: "Low bar rail", x: 0.24 } },
      addedSpots: [{ id: "spot-local-spotter", name: "Spotter block", x: 0.5, y: 0.5 }],
    },
  });
  assert.equal(isStationBoardOverrideStorage(valid), true);

  const unsafeCoordinate = structuredClone(valid) as unknown as {
    boardsById: { "sr-ph": { addedSpots: Array<{ x: number }> } };
  };
  unsafeCoordinate.boardsById["sr-ph"].addedSpots[0].x = 1.01;
  assert.equal(isStationBoardOverrideStorage(unsafeCoordinate), false);

  const unsafeId = structuredClone(valid) as {
    boardsById: Record<string, unknown>;
  };
  unsafeId.boardsById["../sr-ph"] = unsafeId.boardsById["sr-ph"];
  delete unsafeId.boardsById["sr-ph"];
  assert.equal(isStationBoardOverrideStorage(unsafeId), false);

  const collidingIds = structuredClone(valid) as unknown as {
    boardsById: { "sr-ph": { sourceSpotOverridesById: Record<string, unknown>; addedSpots: Array<{ id: string }> } };
  };
  collidingIds.boardsById["sr-ph"].addedSpots[0].id = "anchor-low-bar";
  assert.equal(isStationBoardOverrideStorage(collidingIds), false);
});

test("effective spots merge a sparse source override and local spots without changing source inputs", () => {
  const originalSource = structuredClone(sourceSpots);
  const overrides = {
    sourceSpotOverridesById: { "anchor-low-bar": { name: "Low bar", x: 0.34 } },
    addedSpots: [{ id: "spot-local-mat", name: "Panel mat", x: 0.47, y: 0.82 }],
  };

  const effective = effectiveStationBoardSpots(sourceSpots, overrides);
  assert.deepEqual(effective, [
    { id: "anchor-low-bar", name: "Low bar", x: 0.34, y: 0.68, origin: "source" },
    { id: "anchor-high-bar", name: "High bar", x: 0.76, y: 0.31, origin: "source" },
    { id: "spot-local-mat", name: "Panel mat", x: 0.47, y: 0.82, origin: "local" },
  ]);
  assert.deepEqual(sourceSpots, originalSource);
  assert.notEqual(effective[0], sourceSpots[0]);
});

test("spot helpers keep source anchors resettable while local spots can be added, revised, and removed", () => {
  const initial = emptyStationBoardSpotOverrides();
  const movedSource = updateSourceStationBoardSpot(initial, "anchor-low-bar", {
    name: "  Low  bar  rail ",
    x: 0.38,
    y: -1,
  });
  assert.deepEqual(movedSource.sourceSpotOverridesById, {
    "anchor-low-bar": { name: "Low bar rail", x: 0.38, y: 0 },
  });

  const added = addLocalStationBoardSpot(movedSource, {
    id: "spot-local-landing",
    name: "  Landing   mat ",
    x: 1.3,
    y: 0.4,
  }, sourceSpots);
  assert.deepEqual(added.addedSpots, [{ id: "spot-local-landing", name: "Landing mat", x: 1, y: 0.4 }]);
  assert.equal(addLocalStationBoardSpot(added, {
    id: "anchor-low-bar",
    name: "Bad replacement",
    x: 0.5,
    y: 0.5,
  }, sourceSpots), added, "a local spot may not reuse a source ID");

  const revised = updateLocalStationBoardSpot(added, "spot-local-landing", { x: 0.63, name: "Landing zone" });
  assert.deepEqual(revised.addedSpots, [{ id: "spot-local-landing", name: "Landing zone", x: 0.63, y: 0.4 }]);

  const resetSource = resetSourceStationBoardSpot(revised, "anchor-low-bar");
  assert.deepEqual(effectiveStationBoardSpots(sourceSpots, resetSource)[0], {
    id: "anchor-low-bar", name: "Low bar", x: 0.2, y: 0.68, origin: "source",
  });
  assert.deepEqual(removeLocalStationBoardSpot(resetSource, "spot-local-landing"), emptyStationBoardSpotOverrides());
  assert.deepEqual(resetStationBoardSpotOverrides(), emptyStationBoardSpotOverrides());
});

test("storage helpers isolate one board's overrides and never mutate the prior storage object", () => {
  const firstStorage = stationBoardOverrideStorage();
  const boardOverrides = updateSourceStationBoardSpot(emptyStationBoardSpotOverrides(), "anchor-high-bar", { y: 0.42 });
  const secondStorage = replaceStationBoardSpotOverrides(firstStorage, "sr-ph", boardOverrides);

  assert.deepEqual(firstStorage.boardsById, {});
  assert.deepEqual(stationBoardSpotOverridesFor(secondStorage, "sr-ph"), boardOverrides);
  const detached = stationBoardSpotOverridesFor(secondStorage, "sr-ph");
  detached.sourceSpotOverridesById["anchor-high-bar"].y = 0.1;
  assert.equal(secondStorage.boardsById["sr-ph"].sourceSpotOverridesById["anchor-high-bar"].y, 0.42);
});
