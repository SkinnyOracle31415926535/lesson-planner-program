import assert from "node:assert/strict";
import test from "node:test";
import {
  isVerifiedStationEquipmentId,
  stationEquipmentCatalog,
  stationEquipmentFootprint,
  stationEquipmentNeedingMeasurement,
  verifiedStationEquipment,
} from "../app/station-equipment-catalog";
import {
  LEGACY_STATION_CANVAS,
  STATION_CANVAS,
  constrainStationObjectToCanvas,
  createLegacyStationObject,
  createStationObject,
  createStationSetup,
  isLegacyStationSetup,
  isStationSetup,
  isStationSetupSaveable,
  migrateStationSetup,
  saveStationSetup,
} from "../app/station-setups";

test("the meter catalog contains every known reference item but only the three verified footprints are placeable", () => {
  assert.equal(stationEquipmentCatalog.length, 35);
  assert.deepEqual(verifiedStationEquipment.map((item) => item.id), [
    "norberts-power-incline-2",
    "spieth-ergojet-rio-vaulting-table",
    "tumbl-trak-t-trainer",
  ]);
  assert.equal(stationEquipmentNeedingMeasurement.length, 32);
  assert.equal(isVerifiedStationEquipmentId("aai-blue-landing-mat"), false);
  assert.deepEqual(stationEquipmentFootprint("norberts-power-incline-2"), { length: 1.2192, width: 1.016 });
});

test("new station scenes are versioned meter layouts with fixed catalog footprints", () => {
  const setup = createStationSetup("station-one");
  const incline = createStationObject("norberts-power-incline-2", 2, "incline-one");
  assert.equal(setup.version, 2);
  assert.deepEqual(setup.canvas, STATION_CANVAS);
  assert.equal(incline.equipmentId, "norberts-power-incline-2");
  assert.equal(incline.width, undefined, "equipment cannot be resized away from its verified footprint");
  assert.equal(incline.elevation, 0);
  assert.equal(isStationSetup({ ...setup, objects: [incline] }), true);
});

test("station validation refuses an unmeasured item in a meter scene", () => {
  const setup = createStationSetup("unsafe-catalog-item");
  const unmeasured = {
    ...createStationObject("norberts-power-incline-2", 1, "bad-object"),
    equipmentId: "aai-blue-landing-mat",
  };
  assert.equal(isStationSetup({ ...setup, objects: [unmeasured] }), false);
});

test("v1 pixel layouts migrate as visibly legacy data without inventing a meter conversion", () => {
  const legacy = {
    id: "legacy-station",
    version: 1 as const,
    canvas: LEGACY_STATION_CANVAS,
    objects: [{ ...createLegacyStationObject("panel", 1, "legacy-panel"), x: 384, y: 128 }],
    createdAt: "2026-07-25T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z",
  };
  const migrated = migrateStationSetup(legacy);
  assert.ok(migrated);
  assert.equal(isLegacyStationSetup(migrated), true);
  assert.equal(migrated?.version, 1);
  assert.deepEqual(migrated?.canvas, LEGACY_STATION_CANVAS);
  assert.equal(migrated?.objects[0]?.x, 384);
  assert.equal(migrated?.objects[0]?.y, 128);
});

test("meter objects snap inside the physical scene rather than scaling or clipping", () => {
  const bounded = constrainStationObjectToCanvas({
    ...createStationObject("norberts-power-incline-2", 1, "edge-incline"),
    x: 11.8,
    y: 7.9,
  });
  const footprint = stationEquipmentFootprint("norberts-power-incline-2");
  assert.deepEqual({ x: bounded.x, y: bounded.y }, { x: 10.75, y: 6.75 });
  assert.ok(bounded.x + footprint.length <= STATION_CANVAS.width);
  assert.ok(bounded.y + footprint.width <= STATION_CANVAS.height);
});

test("rotated meter footprints are constrained and validated by their rendered bounds", () => {
  const setup = createStationSetup("rotated-edge");
  const rotatedAtOldEdge = {
    ...createStationObject("norberts-power-incline-2", 1, "rotated-incline"),
    x: 10.75,
    y: 6.75,
    rotation: 45,
  };
  assert.equal(isStationSetup({ ...setup, objects: [rotatedAtOldEdge] }), false);
  const bounded = constrainStationObjectToCanvas(rotatedAtOldEdge);
  assert.ok(bounded.x < rotatedAtOldEdge.x);
  assert.ok(bounded.y < rotatedAtOldEdge.y);
  assert.equal(isStationSetup({ ...setup, objects: [bounded] }), true);
});

test("an empty station draft cannot be saved", async () => {
  const empty = createStationSetup("empty-station");
  assert.equal(isStationSetupSaveable(empty), false);
  assert.equal(isStationSetupSaveable({ ...empty, objects: [createStationObject("tumbl-trak-t-trainer", 1)] }), true);
  await assert.rejects(saveStationSetup(empty), /Add at least one station object/);
});
