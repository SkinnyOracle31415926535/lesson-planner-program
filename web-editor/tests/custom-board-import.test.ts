import assert from "node:assert/strict";
import test from "node:test";

import {
  CUSTOM_BOARD_IMPORT_FORMAT,
  CUSTOM_BOARD_IMPORT_VERSION,
  createCustomBoardImportFromPhotoNames,
  customBoardImportBoardId,
  parseCustomBoardImportJson,
  planCustomBoardImport,
} from "../app/custom-board-import";

function bundle() {
  return {
    format: CUSTOM_BOARD_IMPORT_FORMAT,
    version: CUSTOM_BOARD_IMPORT_VERSION,
    areas: [{
      sourceId: "north-bars",
      title: "North low bars",
      eventName: "Bars",
      photo: "bars-north.jpg",
      photoScale: 1.2,
      spots: [{ id: "low-bar", name: "Low bar", x: 0.25, y: 0.5 }],
    }],
  };
}

test("photo-area import accepts a portable manifest and detaches its records", () => {
  const source = bundle();
  const parsed = parseCustomBoardImportJson(JSON.stringify(source));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(parsed.value.areas[0], source.areas[0]);
  assert.notEqual(parsed.value.areas[0], source.areas[0]);
  assert.notEqual(parsed.value.areas[0].spots[0], source.areas[0].spots[0]);
});

test("photo-area import rejects malformed, duplicate, and unsafe manifest data", () => {
  assert.equal(parseCustomBoardImportJson("{").ok, false);
  assert.equal(parseCustomBoardImportJson(JSON.stringify({ ...bundle(), extra: true })).ok, false);
  assert.equal(parseCustomBoardImportJson(JSON.stringify({ ...bundle(), version: 2 })).ok, false);

  const duplicateSource = bundle();
  duplicateSource.areas.push({ ...duplicateSource.areas[0], photo: "bars-south.jpg" });
  assert.equal(parseCustomBoardImportJson(JSON.stringify(duplicateSource)).ok, false);

  const duplicatePhoto = bundle();
  duplicatePhoto.areas.push({ ...duplicatePhoto.areas[0], sourceId: "south-bars" });
  assert.equal(parseCustomBoardImportJson(JSON.stringify(duplicatePhoto)).ok, false);

  const unsafeSpot = bundle();
  unsafeSpot.areas[0].spots[0].x = 1.01;
  assert.equal(parseCustomBoardImportJson(JSON.stringify(unsafeSpot)).ok, false);

  const unsafePath = bundle();
  unsafePath.areas[0].photo = "photos/bars-north.jpg";
  assert.equal(parseCustomBoardImportJson(JSON.stringify(unsafePath)).ok, false);
});

test("photo-only imports derive stable names and may safely skip prior imports", () => {
  const generated = createCustomBoardImportFromPhotoNames([
    "Bars - North Low Bars.jpg",
    "Floor_Corner.png",
  ]);
  assert.deepEqual(generated.areas.map((area) => ({
    sourceId: area.sourceId,
    title: area.title,
    eventName: area.eventName,
  })), [
    { sourceId: "bars-north-low-bars", title: "North Low Bars", eventName: "Bars" },
    { sourceId: "floor-corner", title: "Floor Corner", eventName: undefined },
  ]);

  const plan = planCustomBoardImport(
    generated.areas,
    ["Bars - North Low Bars.jpg", "Floor_Corner.png"],
    [customBoardImportBoardId("bars-north-low-bars")],
  );
  assert.deepEqual(plan.readyAreas.map((area) => area.sourceId), ["floor-corner"]);
  assert.deepEqual(plan.duplicateAreas.map((area) => area.sourceId), ["bars-north-low-bars"]);
  assert.deepEqual(plan.missingPhotoAreas, []);
});

test("photo-area import plans block missing or ambiguous selected photo files", () => {
  const parsed = parseCustomBoardImportJson(JSON.stringify(bundle()));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const missing = planCustomBoardImport(parsed.value.areas, ["another-photo.jpg"], []);
  assert.deepEqual(missing.missingPhotoAreas.map((area) => area.sourceId), ["north-bars"]);

  const ambiguous = planCustomBoardImport(parsed.value.areas, ["bars-north.jpg", "BARS-NORTH.JPG"], []);
  assert.deepEqual(ambiguous.ambiguousPhotoNames, ["bars-north.jpg"]);
  assert.deepEqual(ambiguous.missingPhotoAreas.map((area) => area.sourceId), ["north-bars"]);

  const unmatched = planCustomBoardImport(parsed.value.areas, ["bars-north.jpg", "extra.jpg"], []);
  assert.deepEqual(unmatched.unmatchedPhotoNames, ["extra.jpg"]);
});
