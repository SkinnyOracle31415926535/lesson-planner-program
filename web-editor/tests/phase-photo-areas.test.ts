import assert from "node:assert/strict";
import test from "node:test";
import { canAutoSelectPhotoAreas, suggestedPhotoAreasForPhase } from "../app/phase-photo-areas";
import type { ZonePanel } from "../app/lesson-data";

function area(id: string, alias: string, title = alias): ZonePanel {
  return { id, alias, title, note: "", people: "", cards: [] };
}

const photoAreas = [
  area("f2", "F2", "Floor 2"),
  area("pb", "PB", "Parallel Bars"),
  area("hb", "HB", "High Bar"),
  area("pb-hb", "PB/HB", "Parallel Bars / High Bar"),
  area("f3-f2", "F3/F2", "Floor 3 / Floor 2"),
  area("f4", "F4", "Floor 4"),
  area("ts", "TS", "Tumble Strip"),
  area("beams", "All Beams", "Beam photo"),
];

test("an exact combined area wins over its individual component areas", () => {
  assert.deepEqual(
    suggestedPhotoAreasForPhase("PB / HB", photoAreas).map((area) => area.id),
    ["pb-hb"],
  );
});

test("phase words select the individual matching photo areas when no combined area exists", () => {
  assert.deepEqual(
    suggestedPhotoAreasForPhase("F4 + TS", photoAreas).map((area) => area.id),
    ["f4", "ts"],
  );
  assert.deepEqual(
    suggestedPhotoAreasForPhase("Warmup - F2", photoAreas).map((area) => area.id),
    ["f2"],
  );
});

test("the matcher handles a simple singular/plural equipment label without guessing unrelated areas", () => {
  assert.deepEqual(
    suggestedPhotoAreasForPhase("Beams", photoAreas).map((area) => area.id),
    ["beams"],
  );
  assert.deepEqual(suggestedPhotoAreasForPhase("Open", photoAreas), []);
});

test("automatic selection only fills an untouched phase", () => {
  assert.equal(canAutoSelectPhotoAreas({ zones: [] }), true);
  assert.equal(canAutoSelectPhotoAreas({ zones: [photoAreas[0]] }), false);
  assert.equal(canAutoSelectPhotoAreas({ zones: [], parkedZones: [photoAreas[0]] }), false);
});
