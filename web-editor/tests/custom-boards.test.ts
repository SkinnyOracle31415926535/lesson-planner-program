import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOM_BOARD_PHOTO_SCALE,
  CUSTOM_BOARD_WIDE_ASPECT_RATIO,
  addCustomStationSpot,
  boxesOverlap,
  clampCustomBoardPhotoScale,
  clampVisualLabelPosition,
  customBoardPhotoScale,
  customBoardPhotoPanelLayout,
  customBoardLeaderPath,
  customBoardLeaderPathsConflict,
  customBoardSegmentsConflict,
  customBoardStorage,
  decrementCustomBoardPhotoScale,
  incrementCustomBoardPhotoScale,
  customLabelGeometry,
  isCustomBoardStorage,
  isVisualLabelLayout,
  labelBoxAt,
  leaderIntersectsLabelBox,
  normalizeLeaderPath,
  renameCustomBoardEvent,
  replaceCustomBoardPhotoMetadata,
  removeCustomStationSpot,
  setCustomBoardPhotoScale,
  updateCustomStationSpot,
  validateCustomLabelLayout,
  visualLabelLeaderPath,
  type CustomBoard,
  type NormalizedPoint,
  type VisualLabelLayout,
} from "../app/custom-boards";

function board(): CustomBoard {
  return {
    id: "area-bars",
    title: "Practice bars",
    photoId: "photo-bars",
    filename: "bars.jpg",
    width: 1600,
    height: 1200,
    spots: [{ id: "spot-low-bar", name: "Low bar", x: 0.25, y: 0.5 }],
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
  };
}

test("custom board metadata is small, serializable, and rejects unsafe coordinates", () => {
  const stored = customBoardStorage([board()]);
  assert.equal(isCustomBoardStorage(stored), true);
  assert.notEqual(stored.boards[0], board());

  const invalid = structuredClone(stored) as { boards: Array<{ spots: Array<{ x: number }> }> };
  invalid.boards[0].spots[0].x = 1.01;
  assert.equal(isCustomBoardStorage(invalid), false);
});

test("photo areas keep a coach-written event name without breaking older saved boards", () => {
  const olderBoard = board();
  assert.equal(olderBoard.eventName, undefined);

  const named = renameCustomBoardEvent(olderBoard, "  Bars  ", "2026-07-20T01:00:00.000Z");
  assert.equal(named.eventName, "Bars");
  assert.equal(named.updatedAt, "2026-07-20T01:00:00.000Z");
  assert.equal(olderBoard.eventName, undefined);
  assert.equal(isCustomBoardStorage(customBoardStorage([named])), true);

  const cleared = renameCustomBoardEvent(named, "");
  assert.equal(cleared.eventName, undefined);
});

test("photo areas use a safe, persisted scale while legacy boards stay at normal size", () => {
  const legacyBoard = board();
  assert.equal(customBoardPhotoScale(legacyBoard), CUSTOM_BOARD_PHOTO_SCALE.default);
  assert.equal(isCustomBoardStorage(customBoardStorage([legacyBoard])), true);

  assert.equal(clampCustomBoardPhotoScale(-2), CUSTOM_BOARD_PHOTO_SCALE.minimum);
  assert.equal(clampCustomBoardPhotoScale(8), CUSTOM_BOARD_PHOTO_SCALE.maximum);
  assert.equal(clampCustomBoardPhotoScale(Number.NaN), CUSTOM_BOARD_PHOTO_SCALE.default);
  assert.equal(incrementCustomBoardPhotoScale(1.1), 1.2);
  assert.equal(decrementCustomBoardPhotoScale(1.1), 1);
  assert.equal(incrementCustomBoardPhotoScale(CUSTOM_BOARD_PHOTO_SCALE.maximum), CUSTOM_BOARD_PHOTO_SCALE.maximum);
  assert.equal(decrementCustomBoardPhotoScale(CUSTOM_BOARD_PHOTO_SCALE.minimum), CUSTOM_BOARD_PHOTO_SCALE.minimum);

  const scaled = setCustomBoardPhotoScale(legacyBoard, 1.4, "2026-07-20T01:00:00.000Z");
  assert.equal(scaled.photoScale, 1.4);
  assert.equal(scaled.updatedAt, "2026-07-20T01:00:00.000Z");
  assert.equal(legacyBoard.photoScale, undefined);
  assert.equal(customBoardStorage([scaled]).boards[0].photoScale, 1.4);

  const unsafe = structuredClone(customBoardStorage([scaled])) as { boards: Array<{ photoScale: number }> };
  unsafe.boards[0].photoScale = CUSTOM_BOARD_PHOTO_SCALE.maximum + 0.01;
  assert.equal(isCustomBoardStorage(unsafe), false);
});

test("photo panel layout preserves the source proportion and only spans rows for wide or enlarged photos", () => {
  const legacyStandard = customBoardPhotoPanelLayout(board());
  assert.deepEqual(legacyStandard, {
    sourceAspectRatio: 1600 / 1200,
    scale: CUSTOM_BOARD_PHOTO_SCALE.default,
    isWide: false,
    shouldSpanRow: false,
  });

  const exactWideThreshold = customBoardPhotoPanelLayout({
    width: 2160,
    height: 1600,
    photoScale: 1,
  });
  assert.equal(exactWideThreshold.sourceAspectRatio, CUSTOM_BOARD_WIDE_ASPECT_RATIO);
  assert.equal(exactWideThreshold.isWide, true, "the configured ratio is included in the wide layout");
  assert.equal(exactWideThreshold.shouldSpanRow, true);

  const enlargedPortrait = customBoardPhotoPanelLayout({
    width: 900,
    height: 1200,
    photoScale: 1.4,
  });
  assert.equal(enlargedPortrait.isWide, false, "source ratio, not +/- scale, decides the wide treatment");
  assert.equal(enlargedPortrait.scale, 1.4);
  assert.equal(enlargedPortrait.shouldSpanRow, true, "an enlarged panel gets row space even for a portrait source");

  const safelyClampedLegacyScale = customBoardPhotoPanelLayout({
    width: 900,
    height: 1200,
    photoScale: Number.NaN,
  });
  assert.equal(safelyClampedLegacyScale.scale, CUSTOM_BOARD_PHOTO_SCALE.default);
  assert.equal(safelyClampedLegacyScale.shouldSpanRow, false);
});

test("replacing a photo preserves its local area, spots, and event label", () => {
  const original = renameCustomBoardEvent(board(), "Bars");
  const replaced = replaceCustomBoardPhotoMetadata(original, {
    photoId: "photo-bars-revision-2",
    filename: "bars-after-reset.png",
    width: 2048,
    height: 1536,
  }, "2026-07-20T02:00:00.000Z");

  assert.equal(replaced.id, original.id);
  assert.equal(replaced.photoId, "photo-bars-revision-2");
  assert.notEqual(replaced.photoId, original.photoId);
  assert.equal(replaced.eventName, "Bars");
  assert.deepEqual(replaced.spots, original.spots);
  assert.equal(replaced.filename, "bars-after-reset.png");
  assert.equal(replaced.width, 2048);
  assert.equal(replaced.height, 1536);
  assert.equal(replaced.updatedAt, "2026-07-20T02:00:00.000Z");
  assert.equal(original.filename, "bars.jpg");
});

test("a coach can add, rename, move, and remove a station spot without mutating the prior board", () => {
  const original = board();
  const added = addCustomStationSpot(original, {
    id: "spot-high-bar",
    name: "  High   bar  ",
    x: 2,
    y: -1,
  }, "2026-07-20T01:00:00.000Z");

  assert.equal(original.spots.length, 1);
  assert.deepEqual(added.spots.at(-1), { id: "spot-high-bar", name: "High bar", x: 1, y: 0 });
  assert.equal(added.updatedAt, "2026-07-20T01:00:00.000Z");

  const moved = updateCustomStationSpot(added, "spot-high-bar", {
    name: "High bar dismount",
    x: 0.74,
    y: 0.31,
  }, "2026-07-20T02:00:00.000Z");
  assert.deepEqual(moved.spots.at(-1), {
    id: "spot-high-bar",
    name: "High bar dismount",
    x: 0.74,
    y: 0.31,
  });

  const removed = removeCustomStationSpot(moved, "spot-high-bar", "2026-07-20T03:00:00.000Z");
  assert.deepEqual(removed.spots.map((spot) => spot.id), ["spot-low-bar"]);
  assert.equal(removed.updatedAt, "2026-07-20T03:00:00.000Z");
});

test("callout labels can sit around an uncropped photo while spot labels stay on it", () => {
  assert.deepEqual(clampVisualLabelPosition("spot", { x: -0.2, y: 1.2 }), { x: 0, y: 1 });
  assert.deepEqual(clampVisualLabelPosition("callout", { x: -0.2, y: 1.2 }), { x: -0.2, y: 1.2 });
  assert.equal(isVisualLabelLayout({ placement: "callout", x: -0.2, y: 1.2, route: "one-turn" }), true);
  assert.equal(isVisualLabelLayout({ placement: "spot", x: -0.2, y: 1.2, route: "one-turn" }), false);
});

test("leader helpers retain the direct route and flag crossing routes before a label drag is saved", () => {
  const first = customBoardLeaderPath(
    { x: 0.2, y: 0.2 },
    { placement: "callout", x: 1.1, y: 0.8, route: "straight" },
    { left: 1.0, top: 0.74, width: 0.2, height: 0.12 },
  );
  const crossing = customBoardLeaderPath(
    { x: 0.8, y: 0.2 },
    { placement: "callout", x: -0.1, y: 0.8, route: "straight" },
    { left: -0.2, top: 0.74, width: 0.2, height: 0.12 },
  );
  const separate = customBoardLeaderPath(
    { x: 0.8, y: 0.8 },
    { placement: "callout", x: 1.1, y: 0.8, route: "one-turn" },
    { left: 1.0, top: 0.74, width: 0.2, height: 0.12 },
  );

  assert.equal(first.length, 2);
  assert.equal(customBoardLeaderPathsConflict(first, crossing), true);
  assert.equal(customBoardLeaderPathsConflict(first, separate), false);
});

function labelLayout(
  x: number,
  y: number,
  placement: VisualLabelLayout["placement"] = "callout",
  route: VisualLabelLayout["route"] = "straight",
): VisualLabelLayout {
  return { placement, route, x, y };
}

function labelGeometry(
  id: string,
  spot: NormalizedPoint,
  layout: VisualLabelLayout,
  width = 0.16,
  height = 0.08,
) {
  return customLabelGeometry(id, spot, layout, width, height);
}

test("label geometry keeps short labels separate and leaders meet the text edge", () => {
  const first = labelBoxAt(0.25, 0.5, 0.2, 0.1);
  const second = labelBoxAt(0.456, 0.5, 0.2, 0.1);
  assert.equal(boxesOverlap(first, second), true, "a small breathing gap prevents near-touching labels");
  assert.equal(boxesOverlap(first, second, 0), false, "the visible boxes do not overlap");

  const onSpot = labelGeometry("on-spot", { x: 0.5, y: 0.5 }, labelLayout(0.5, 0.5, "spot"));
  assert.deepEqual(visualLabelLeaderPath(onSpot), []);

  const insideText = customBoardLeaderPath(
    { x: 0.5, y: 0.5 },
    labelLayout(0.5, 0.5),
    labelBoxAt(0.5, 0.5, 0.24, 0.12),
  );
  assert.equal(insideText.length, 2);
  assert.notDeepEqual(insideText[0], insideText[1], "a callout never stops inside its text box");
});

test("leader geometry rejects crossings, shared segments, and labels in a route", () => {
  assert.equal(
    customBoardSegmentsConflict(
      { x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 },
      { x: 0.1, y: 0.9 }, { x: 0.9, y: 0.1 },
    ),
    true,
  );
  assert.equal(
    customBoardSegmentsConflict(
      { x: 0.1, y: 0.5 }, { x: 0.8, y: 0.5 },
      { x: 0.4, y: 0.5 }, { x: 0.95, y: 0.5 },
    ),
    true,
  );
  assert.equal(
    customBoardSegmentsConflict(
      { x: 0.1, y: 0.1 }, { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.2 },
    ),
    false,
  );
  assert.deepEqual(
    normalizeLeaderPath([{ x: 0.1, y: 0.1 }, { x: 0.1, y: 0.1 }, { x: 0.5, y: 0.5 }]),
    [{ x: 0.1, y: 0.1 }, { x: 0.5, y: 0.5 }],
  );
  assert.equal(
    leaderIntersectsLabelBox(
      [{ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }],
      labelBoxAt(0.5, 0.5, 0.16, 0.08),
    ),
    true,
  );
});

test("drag validation explains blocked label positions and accepts an isolated one", () => {
  const overlap = validateCustomLabelLayout(
    labelGeometry("candidate", { x: 0.12, y: 0.5 }, labelLayout(0.5, 0.5)),
    [labelGeometry("other", { x: 0.8, y: 0.5 }, labelLayout(0.54, 0.5))],
  );
  assert.equal(overlap.isValid, false);
  assert.deepEqual(overlap.conflicts, [{ kind: "label-overlap", withId: "other" }]);

  const throughText = validateCustomLabelLayout(
    labelGeometry("candidate", { x: 0.1, y: 0.5 }, labelLayout(0.9, 0.5)),
    [labelGeometry("other", { x: 0.5, y: 0.2 }, labelLayout(0.5, 0.5, "spot"))],
  );
  assert.equal(throughText.isValid, false);
  assert.ok(throughText.conflicts.some((conflict) => conflict.kind === "leader-crosses-label"));

  const crossedLeaders = validateCustomLabelLayout(
    labelGeometry("candidate", { x: 0.1, y: 0.5 }, labelLayout(0.9, 0.5)),
    [labelGeometry("other", { x: 0.5, y: 0.1 }, labelLayout(0.5, 0.9))],
  );
  assert.equal(crossedLeaders.isValid, false);
  assert.ok(crossedLeaders.conflicts.some((conflict) => conflict.kind === "leader-crosses-leader"));

  const clear = validateCustomLabelLayout(
    labelGeometry("candidate", { x: 0.1, y: 0.2 }, labelLayout(0.3, 0.2)),
    [labelGeometry("other", { x: 0.9, y: 0.8 }, labelLayout(0.7, 0.8))],
  );
  assert.equal(clear.isValid, true);
  assert.deepEqual(clear.conflicts, []);
});
