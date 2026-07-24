import assert from "node:assert/strict";
import test from "node:test";
import {
  STATION_CANVAS,
  constrainStationObjectToCanvas,
  createStationObject,
  createStationSetup,
  isStationSetup,
  isStationSetupSaveable,
  saveStationSetup,
  stationAsset,
  stationAssets,
} from "../app/station-setups";

test("generic station palette has the planned gymnastics building blocks", () => {
  assert.deepEqual(stationAssets.map((asset) => asset.id), ["panel", "folded-panel", "wedge", "block", "landing", "strip", "barrel", "beam"]);
  assert.equal(stationAsset("block").heightCue, "tall");
  assert.equal(stationAsset("panel").heightCue, "flat");
});

test("station setup is versioned and objects use the equipment's default footprint", () => {
  const setup = createStationSetup("station-one");
  const block = createStationObject("block", 2, "block-one");
  assert.equal(setup.version, 1);
  assert.deepEqual(setup.canvas, STATION_CANVAS);
  assert.equal(block.width, stationAsset("block").width);
  assert.equal(block.height, stationAsset("block").height);
  assert.equal(isStationSetup({ ...setup, objects: [block] }), true);
});

test("station validation rejects incomplete or incompatible stored layouts", () => {
  assert.equal(isStationSetup(null), false);
  assert.equal(isStationSetup({ id: "bad", version: 1, objects: [{}] }), false);
  assert.equal(isStationSetup({ ...createStationSetup("old"), version: 2 }), false);
});

test("station objects stay inside the canvas when a resize would push them past an edge", () => {
  const bounded = constrainStationObjectToCanvas({
    ...createStationObject("panel", 1, "edge-panel"),
    x: 880,
    y: 600,
    width: 320,
    height: 160,
  });
  assert.deepEqual(
    { x: bounded.x, y: bounded.y, width: bounded.width, height: bounded.height },
    { x: 640, y: 480, width: 320, height: 160 },
  );
  assert.ok(bounded.x + bounded.width <= STATION_CANVAS.width);
  assert.ok(bounded.y + bounded.height <= STATION_CANVAS.height);
});

test("an empty station draft cannot be saved", async () => {
  const empty = createStationSetup("empty-station");
  assert.equal(isStationSetupSaveable(empty), false);
  assert.equal(isStationSetupSaveable({ ...empty, objects: [createStationObject("panel", 1)] }), true);
  await assert.rejects(saveStationSetup(empty), /Add at least one station object/);
});
