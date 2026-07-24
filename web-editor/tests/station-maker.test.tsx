import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StationMakerDialog, StationPreview } from "../app/station-maker";
import { createStationObject, createStationSetup } from "../app/station-setups";

test("station preview uses non-submit visual elements inside a surrounding form", () => {
  const setup = {
    ...createStationSetup("preview-station"),
    objects: [
      { ...createStationObject("panel", 1, "piece"), rotation: 15 },
      { id: "label", kind: "label" as const, text: "START", x: 128, y: 96, width: 160, height: 32, rotation: 45, zIndex: 2 },
      { id: "arrow", kind: "arrow" as const, x: 288, y: 128, width: 64, height: 32, rotation: 90, zIndex: 3 },
    ],
  };
  const markup = renderToStaticMarkup(<form><StationPreview setup={setup} label="Preview station" /></form>);
  assert.doesNotMatch(markup, /<button\b/);
  assert.match(markup, /width:16\.666666666666664%/);
  assert.match(markup, /transform:rotate\(45deg\)/);
  assert.match(markup, /font-size:32px/);
});

test("station maker disables saving an empty draft", () => {
  const markup = renderToStaticMarkup(<StationMakerDialog setup={createStationSetup("empty")} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(markup, /ADD A PIECE TO ENABLE SAVE/);
  assert.match(markup, /<button[^>]*disabled[^>]*>SAVE STATION<\/button>/);
});
