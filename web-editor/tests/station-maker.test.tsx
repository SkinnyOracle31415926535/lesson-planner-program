import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StationMakerDialog, StationPreview } from "../app/station-maker";
import { stationEquipment } from "../app/station-equipment-catalog";
import { StationPixelSprite } from "../app/station-pixel-sprite";
import {
  LEGACY_STATION_CANVAS,
  createLegacyStationObject,
  createStationAnnotation,
  createStationObject,
  createStationSetup,
} from "../app/station-setups";

test("meter station preview uses non-submit visual elements and declares its real scale", () => {
  const setup = {
    ...createStationSetup("preview-station"),
    objects: [
      { ...createStationObject("norberts-power-incline-2", 1, "piece"), rotation: 15 },
      { ...createStationAnnotation("label", 2, "label"), text: "START", rotation: 45 },
      { ...createStationAnnotation("arrow", 3, "arrow"), rotation: 90 },
    ],
  };
  const markup = renderToStaticMarkup(<form><StationPreview setup={setup} label="Preview station" /></form>);
  assert.doesNotMatch(markup, /<button\b/);
  assert.match(markup, /1 UNIT = 1 M/);
  assert.match(markup, /data-equipment-profile="incline"/);
  assert.match(markup, /station-pixel-sprite/);
  assert.match(markup, /station-pixel-shadow/);
  assert.match(markup, /data-station-projection="dimetric"/);
  assert.match(markup, /data-station-light="upper-left"/);
  assert.match(markup, /transform:translate\([^)]*\) rotate\(45deg\)/);
});

test("verified equipment height changes the inline pixel projection instead of a generic CSS shadow", () => {
  const trainer = stationEquipment("tumbl-trak-t-trainer");
  const shorterTrainer = { ...trainer, dimensions: { ...trainer.dimensions!, heightMax: 0.25 } };
  const tallerTrainer = { ...trainer, dimensions: { ...trainer.dimensions!, heightMax: 1 } };
  const shortMarkup = renderToStaticMarkup(<StationPixelSprite equipment={shorterTrainer} />);
  const tallMarkup = renderToStaticMarkup(<StationPixelSprite equipment={tallerTrainer} />);

  assert.match(shortMarkup, /data-station-height-max="0\.25"/);
  assert.match(tallMarkup, /data-station-height-max="1"/);
  assert.match(shortMarkup, /data-station-projected-rise="6"/);
  assert.match(tallMarkup, /data-station-projected-rise="24"/);
  assert.notEqual(
    shortMarkup.match(/class="station-pixel-trainer-side" points="([^"]+)"/)?.[1],
    tallMarkup.match(/class="station-pixel-trainer-side" points="([^"]+)"/)?.[1],
  );
  assert.notEqual(
    shortMarkup.match(/class="station-pixel-shadow" points="([^"]+)"/)?.[1],
    tallMarkup.match(/class="station-pixel-shadow" points="([^"]+)"/)?.[1],
  );
});

test("every verified catalog piece exposes its measured height in the pixel scene", () => {
  const verifiedIds = [
    "norberts-power-incline-2",
    "spieth-ergojet-rio-vaulting-table",
    "tumbl-trak-t-trainer",
  ] as const;

  verifiedIds.forEach((id) => {
    const equipment = stationEquipment(id);
    const markup = renderToStaticMarkup(<StationPixelSprite equipment={equipment} />);
    const height = equipment.dimensions!.heightMax;
    assert.ok(markup.includes(`data-equipment-profile="${equipment.profile}"`));
    assert.ok(markup.includes(`data-station-height-max="${height}"`));
    assert.ok(markup.includes(`data-station-projected-rise="${Math.round(height * 24)}"`));
  });
});

test("station maker exposes every known item but disables ones that need measurement", () => {
  const markup = renderToStaticMarkup(<StationMakerDialog setup={createStationSetup("empty")} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(markup, /VERIFIED SCALE · 3/);
  assert.match(markup, /KNOWN ITEMS WAITING FOR DIMENSIONS/);
  assert.match(markup, /AAI BLUE RECTANGULAR LANDING MAT/);
  assert.match(markup, /NEEDS MEASUREMENT/);
  assert.match(markup, /SCALED 2.5D SCENE · 1 UNIT = 1 METER/);
  assert.match(markup, /data-station-projection="dimetric"/);
  assert.match(markup, /ADD A VERIFIED ITEM OR ANNOTATION TO ENABLE SAVE/);
  assert.match(markup, /<button[^>]*disabled[^>]*>SAVE STATION<\/button>/);
});

test("legacy pixel previews stay visibly legacy rather than asserting a meter scale", () => {
  const legacy = {
    id: "legacy-preview",
    version: 1 as const,
    canvas: LEGACY_STATION_CANVAS,
    objects: [createLegacyStationObject("panel", 1, "legacy-panel")],
    createdAt: "2026-07-25T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z",
  };
  const preview = renderToStaticMarkup(<StationPreview setup={legacy} label="Old station" />);
  const dialog = renderToStaticMarkup(<StationMakerDialog setup={legacy} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(preview, /LEGACY · NOT TO SCALE/);
  assert.doesNotMatch(preview, /1 UNIT = 1 M/);
  assert.match(dialog, /This saved v1 layout uses pixel coordinates/);
});
