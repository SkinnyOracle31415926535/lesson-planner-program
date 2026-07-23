import assert from "node:assert/strict";
import test from "node:test";
import {
  LESSON_BOARD_SNAPSHOT_VERSION,
  copyLessonBoardSnapshot,
  createLessonBoardSnapshot,
  emptyLessonBoardSnapshot,
  isLessonBoardSnapshot,
  type LessonBoardSnapshotPhase,
} from "../app/lesson-board-snapshot";
import type { CustomBoard } from "../app/custom-boards";
import { stationBoardOverrideStorage } from "../app/station-board-overrides";

function customBoard(id: string, spotId: string): CustomBoard {
  return {
    id,
    title: `${id} title`,
    eventName: "Bars",
    photoId: `${id}-photo`,
    filename: `${id}.jpg`,
    width: 1600,
    height: 1200,
    spots: [{ id: spotId, name: `${id} spot`, x: 0.25, y: 0.5 }],
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T01:00:00.000Z",
  };
}

const allOverrides = () => stationBoardOverrideStorage({
  "sr-ph": {
    sourceSpotOverridesById: { "anchor-low-bar": { name: "Low rail", x: 0.3 } },
    addedSpots: [{ id: "spot-block", name: "Spotting block", x: 0.45, y: 0.7 }],
  },
  "vt-ph": {
    sourceSpotOverridesById: { "anchor-table": { y: 0.42 } },
    addedSpots: [],
  },
  "photo-zone": {
    sourceSpotOverridesById: { "anchor-unused": { x: 0.1 } },
    addedSpots: [],
  },
  "unused-board": {
    sourceSpotOverridesById: {},
    addedSpots: [{ id: "spot-unused", name: "Unused", x: 0.5, y: 0.5 }],
  },
});

test("snapshot filters board state to visible and parked lesson zones", () => {
  const boards = [
    customBoard("area-bars", "spot-bars"),
    customBoard("area-floor", "spot-floor"),
    customBoard("area-unused", "spot-unused"),
  ];
  const phases: LessonBoardSnapshotPhase[] = [{
    zones: [
      { id: "sr-ph" },
      { id: "photo-zone", customBoardId: "area-bars" },
    ],
    parkedZones: [
      { id: "vt-ph" },
      { id: "parked-photo", customBoardId: "area-floor" },
    ],
  }];

  const snapshot = createLessonBoardSnapshot(phases, boards, allOverrides());

  assert.deepEqual(snapshot.customBoards.map((board) => board.id), ["area-bars", "area-floor"]);
  assert.deepEqual(Object.keys(snapshot.stationBoardOverrides.boardsById), ["sr-ph", "vt-ph"]);
  assert.equal(snapshot.stationBoardOverrides.boardsById["photo-zone"], undefined,
    "a custom-photo zone must not capture a built-in override with the same zone ID");
  assert.equal(isLessonBoardSnapshot(snapshot), true);
});

test("snapshot deeply detaches custom metadata and built-in overrides", () => {
  const boards = [customBoard("area-bars", "spot-bars")];
  const overrides = allOverrides();
  const phases: LessonBoardSnapshotPhase[] = [{
    zones: [{ id: "sr-ph" }, { id: "photo-zone", customBoardId: "area-bars" }],
  }];

  const snapshot = createLessonBoardSnapshot(phases, boards, overrides);
  boards[0].spots[0].name = "Changed after capture";
  overrides.boardsById["sr-ph"].sourceSpotOverridesById["anchor-low-bar"].x = 0.9;
  overrides.boardsById["sr-ph"].addedSpots[0].name = "Changed source spot";

  assert.equal(snapshot.customBoards[0].spots[0].name, "area-bars spot");
  assert.equal(snapshot.stationBoardOverrides.boardsById["sr-ph"]
    .sourceSpotOverridesById["anchor-low-bar"].x, 0.3);
  assert.equal(snapshot.stationBoardOverrides.boardsById["sr-ph"].addedSpots[0].name, "Spotting block");

  snapshot.customBoards[0].spots[0].name = "Changed snapshot";
  snapshot.stationBoardOverrides.boardsById["sr-ph"].addedSpots[0].name = "Changed snapshot spot";
  assert.equal(boards[0].spots[0].name, "Changed after capture");
  assert.equal(overrides.boardsById["sr-ph"].addedSpots[0].name, "Changed source spot");
});

test("persisted snapshots are strictly validated and copied before use", () => {
  const persisted = createLessonBoardSnapshot(
    [{ zones: [{ id: "sr-ph" }, { id: "photo-zone", customBoardId: "area-bars" }] }],
    [customBoard("area-bars", "spot-bars")],
    allOverrides(),
  );
  assert.equal(isLessonBoardSnapshot(persisted), true);

  const copied = copyLessonBoardSnapshot(persisted);
  assert.deepEqual(copied, persisted);
  assert.notEqual(copied, persisted);
  assert.notEqual(copied.customBoards[0], persisted.customBoards[0]);
  assert.notEqual(copied.customBoards[0].spots[0], persisted.customBoards[0].spots[0]);
  assert.notEqual(copied.stationBoardOverrides, persisted.stationBoardOverrides);
  assert.notEqual(
    copied.stationBoardOverrides.boardsById["sr-ph"].sourceSpotOverridesById["anchor-low-bar"],
    persisted.stationBoardOverrides.boardsById["sr-ph"].sourceSpotOverridesById["anchor-low-bar"],
  );

  const wrongVersion = { ...persisted, version: LESSON_BOARD_SNAPSHOT_VERSION + 1 };
  assert.equal(isLessonBoardSnapshot(wrongVersion), false);

  const unsafeCustomSpot = structuredClone(persisted) as unknown as {
    customBoards: Array<{ spots: Array<{ x: number }> }>;
  };
  unsafeCustomSpot.customBoards[0].spots[0].x = 1.01;
  assert.equal(isLessonBoardSnapshot(unsafeCustomSpot), false);

  const unsafeOverride = structuredClone(persisted) as unknown as {
    stationBoardOverrides: { boardsById: { "sr-ph": { addedSpots: Array<{ name: string }> } } };
  };
  unsafeOverride.stationBoardOverrides.boardsById["sr-ph"].addedSpots[0].name = "  Unsafe spacing";
  assert.equal(isLessonBoardSnapshot(unsafeOverride), false);
  assert.deepEqual(copyLessonBoardSnapshot(unsafeOverride), emptyLessonBoardSnapshot());

  assert.equal(isLessonBoardSnapshot({ ...persisted, unexpected: true }), false);
});

test("empty and unreferenced inputs produce a valid safe empty snapshot", () => {
  const empty = emptyLessonBoardSnapshot();
  assert.deepEqual(empty, {
    version: LESSON_BOARD_SNAPSHOT_VERSION,
    customBoards: [],
    stationBoardOverrides: { version: 1, boardsById: {} },
  });
  assert.equal(isLessonBoardSnapshot(empty), true);

  const filtered = createLessonBoardSnapshot([], [customBoard("area-unused", "spot-unused")], allOverrides());
  assert.deepEqual(filtered, empty);
  assert.notEqual(filtered, empty);
  assert.notEqual(filtered.stationBoardOverrides, empty.stationBoardOverrides);
});
