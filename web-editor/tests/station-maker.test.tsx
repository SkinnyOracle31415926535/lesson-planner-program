import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StationMakerDialog, StationPreview } from "../app/station-maker";
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
  assert.match(markup, /NORBERT/);
  assert.match(markup, /transform:translate\([^)]*\) rotate\(45deg\)/);
});

test("station maker exposes every known item but disables ones that need measurement", () => {
  const markup = renderToStaticMarkup(<StationMakerDialog setup={createStationSetup("empty")} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(markup, /VERIFIED SCALE · 3/);
  assert.match(markup, /KNOWN ITEMS WAITING FOR DIMENSIONS/);
  assert.match(markup, /AAI BLUE RECTANGULAR LANDING MAT/);
  assert.match(markup, /NEEDS MEASUREMENT/);
  assert.match(markup, /SCALED 2.5D SCENE · 1 UNIT = 1 METER/);
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
