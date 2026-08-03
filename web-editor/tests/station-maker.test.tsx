import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { constrainStationViewPan, STATION_VIEW_ZOOMS, StationMakerDialog, StationPreview } from "../app/station-maker";
import { createStationObject, createStationSetup, flipStationObjectFace, setCheeseMatState, setPanelMatState } from "../app/station-setups";

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
  assert.match(markup, /class="station-floor-grid"/);
  assert.match(markup, /class="station-floor-grid-line"/);
  assert.ok(markup.indexOf("station-floor-grid") < markup.indexOf("station-shadow-layer"));
  assert.match(markup, /width:10%/);
  assert.match(markup, /aspect-ratio:960 \/ 640/);
  assert.match(markup, /transform:rotate\(45deg\)/);
  assert.match(markup, /font-size:32px/);
});

test("raised equipment casts a crisp floor shadow behind the equipment layer", () => {
  const support = { ...createStationObject("big-block", 1, "support"), x: 200, y: 160 };
  const raisedMat = { ...createStationObject("panel", 2, "raised-mat"), x: 200, y: 160, elevation: 240 };
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("raised-shadow"), objects: [support, raisedMat] }} label="Raised shadow" />);

  assert.match(markup, /class="station-shadow-layer"/);
  assert.match(markup, /class="station-ground-shadow"/);
  assert.ok(markup.indexOf("station-shadow-layer") < markup.indexOf('class="station-piece big-block"'));
  assert.equal((markup.match(/station-ground-shadow/g) ?? []).length, 1);
});

test("an elevated Small Octagon casts a clipped pixel shadow onto a Blue Resi", () => {
  const blueResi = { ...createStationObject("blue-resi", 1, "blue-resi"), x: 180, y: 220 };
  const smallOctagon = { ...createStationObject("small-octagon", 2, "small-octagon"), x: 220, y: 225, elevation: 576 };
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("support-shadow"), objects: [blueResi, smallOctagon] }} label="Support shadow" />);

  assert.match(markup, /class="station-support-shadow"/);
  assert.match(markup, /clip-path:polygon\(/);
  assert.match(markup, /opacity:0\.25/);
  assert.ok(markup.indexOf('class="station-piece blue-resi"') < markup.indexOf("station-support-shadow"));
  assert.ok(markup.indexOf("station-support-shadow") < markup.indexOf('class="station-piece small-octagon"'));
});

test("station objects paint by projected depth before their creation order", () => {
  const boardBehind = { ...createStationObject("panel", 99, "board-behind"), x: 180, y: 100 };
  const resiInFront = { ...createStationObject("blue-resi", 1, "resi-in-front"), x: 180, y: 220 };
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("depth-order"), objects: [resiInFront, boardBehind] }} label="Projected depth" />);

  assert.ok(markup.indexOf('class="station-piece panel blue"') < markup.indexOf('class="station-piece blue-resi"'));
});

test("station maker disables saving an empty draft", () => {
  const markup = renderToStaticMarkup(<StationMakerDialog setup={createStationSetup("empty")} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(markup, /class="station-floor-grid"/);
  assert.match(markup, /class="station-floor-grid-line"/);
  assert.match(markup, /ADD A PIECE TO ENABLE SAVE/);
  assert.match(markup, /<button[^>]*disabled[^>]*>SAVE STATION<\/button>/);
});

test("station maker keeps movement arrows hidden until the selected piece is double tapped", () => {
  const setup = { ...createStationSetup("nudge"), objects: [createStationObject("panel", 1, "panel")] };
  const markup = renderToStaticMarkup(<StationMakerDialog setup={setup} onSave={() => undefined} onCancel={() => undefined} />);
  assert.doesNotMatch(markup, /class="station-move-gizmo"/);
  assert.doesNotMatch(markup, /Hold to move selected piece toward its local/);
  assert.match(markup, /title="Double tap to show movement arrows"/);
  assert.match(markup, /aria-label="Hold to raise selected mat"/);
  assert.match(markup, /aria-label="Hold to lower selected mat"/);
  assert.match(markup, /aria-label="Move selected piece one pixel in its local directions"/);
  assert.match(markup, /MOVE 1 PX · LOCAL DIRECTION · HOLD TO REPEAT/);
  assert.match(markup, /aria-label="Move selected piece one pixel toward its local north"/);
  assert.match(markup, /aria-label="Move selected piece one pixel toward its local east"/);
  assert.match(markup, /aria-label="Move selected piece one pixel toward its local south"/);
  assert.match(markup, /aria-label="Move selected piece one pixel toward its local west"/);
  assert.match(markup, /title="Hold to raise"/);
  assert.match(markup, /title="Hold to lower"/);
  assert.match(markup, /HEIGHT: 0/);
  assert.match(markup, /ROTATE 30°/);
  assert.match(markup, />4 PANEL MAT</);
  assert.match(markup, />5 PANEL MAT</);
  assert.match(markup, />6 PANEL MAT</);
  assert.match(markup, /4 PANEL MAT: CLOSED/);
  assert.match(markup, /OPEN 4 PANEL MAT/);
  assert.match(markup, /aria-label="Station board zoom"/);
  assert.match(markup, /aria-label="Zoom station board out"/);
  assert.match(markup, /aria-label="Zoom station board in"/);
  assert.match(markup, />100%<\/span>/);
  assert.match(markup, /CROP TO CONTENT/);
  assert.match(markup, /FULL FRAME/);
  assert.match(markup, />BIG BLOCK</);
  assert.match(markup, />BLUE RESI</);
  assert.match(markup, />MINI RESI</);
  assert.match(markup, />PINK BEAM MAT</);
  assert.match(markup, />CARTWHEEL MAT</);
  assert.match(markup, />STAIRS</);
  assert.match(markup, />VELCRO BEAM</);
  assert.match(markup, />STING MAT</);
  assert.match(markup, />GYM NOVA MAT</);
  assert.match(markup, />HAND MAT</);
  assert.match(markup, />RED NORBERT BLOCK</);
  assert.match(markup, />SQUISHY NORBERT BLOCK</);
  assert.match(markup, />SMALL GREEN NORBERT BLOCK</);
  assert.match(markup, />CYLINDER</);
  assert.match(markup, />GREEN MAILBOX</);
  assert.match(markup, />HALF BLOCK</);
  assert.doesNotMatch(markup, />BLUE HALF BLOCK</);
  assert.match(markup, />BIG OCTAGON</);
  assert.match(markup, />MEDIUM OCTAGON</);
  assert.match(markup, />LARGE CHEESE MAT</);
  assert.match(markup, />HUGE CHEESE MAT</);
  assert.match(markup, />SMALL CHEESE MAT</);
  assert.match(markup, />MEDIUM CHEESE MAT</);
  assert.match(markup, />HUGE CHEESE MAT</);
  assert.match(markup, />SQUISHY CHEESE MAT</);
  assert.match(markup, />CLOUD MAT</);
  assert.match(markup, />SPRINGBOARD</);
  assert.match(markup, />T TRAINER</);
  assert.match(markup, />MAIL BOX</);
  assert.match(markup, />PARALLETTE</);
  assert.match(markup, />MINI LOW BAR</);
  assert.match(markup, />TRAPEZE</);
  assert.match(markup, />PVC PIPE</);
  assert.match(markup, />BOSE BALL</);
  assert.match(markup, />FOAM ROLLER</);
  assert.match(markup, />CHALK BUCKET</);
  assert.match(markup, />YOGA BALL</);
  assert.match(markup, />VAULT TRAINER</);
  assert.match(markup, />NEW MAT PLACEHOLDER</);
  assert.match(markup, />MATS TO ADD</);
  assert.match(markup, /ADD A PLACEHOLDER TO TRACK A MAT/);
  assert.match(markup, />BIG BOULDER</);
  assert.match(markup, />MEDIUM BOULDER</);
  assert.match(markup, />SMALL BOULDER</);
  assert.match(markup, />MINI MUSHROOM</);
  assert.match(markup, />FLOOR MUSHROOM</);
  assert.match(markup, />RED TRAPEZOID</);
  assert.match(markup, />YELLOW TRAPEZOID</);
  assert.match(markup, />GREEN TRAPEZOID</);
  assert.doesNotMatch(markup, />FOLDED PANEL</);
  assert.doesNotMatch(markup, />WEDGE</);
  assert.doesNotMatch(markup, />TALL BLOCK</);
  assert.doesNotMatch(markup, />LANDING MAT</);
  assert.doesNotMatch(markup, />LONG STRIP</);
  assert.doesNotMatch(markup, />BARREL</);
  assert.doesNotMatch(markup, />BALANCE BEAM</);
  assert.doesNotMatch(markup, /SIZE|SEND BACK|BRING FRONT/);
});

test("face turns stay in the inspector instead of replacing double-tap movement arrows", () => {
  const resi = createStationObject("blue-resi", 1, "resi");
  const markup = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("face-inspector"), objects: [resi] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(markup, /FLIP FACE/);
  assert.doesNotMatch(markup, /station-face-gizmo/);
  assert.doesNotMatch(markup, /Turn the selected piece onto another physical face/);
});

test("a missing mat placeholder renders its name and shape controls plus a collection to-do", () => {
  const placeholder = { ...createStationObject("mat-placeholder", 1, "missing-mat"), missingMatLabel: "Purple Landing Pad", matPlaceholderShape: "round" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("missing-mat-preview"), objects: [placeholder] }} label="Missing mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("missing-mat-maker"), objects: [placeholder] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="mat-placeholder-sprite round"/);
  assert.match(preview, /class="mat-placeholder-top"/);
  assert.match(preview, /PURPLE LANDING/);
  assert.match(maker, /MAT NAME/);
  assert.match(maker, /SHAPE/);
  assert.match(maker, /<option value="round" selected="">ROUND<\/option>/);
  assert.match(maker, /Purple Landing Pad · ROUND/);
  assert.match(maker, /ON YOUR LOCAL MATS-TO-ADD LIST · PLACEHOLDER ONLY · NO FLIP/);
  assert.match(maker, /✓ ADDED/);
});

test("station board zoom reaches 400 percent and keeps panning inside the enlarged board", () => {
  assert.equal(STATION_VIEW_ZOOMS.at(-1), 4);
  assert.deepEqual(constrainStationViewPan({ x: 900, y: -900 }, 2, { width: 600, height: 400 }), { x: 300, y: -200 });
  assert.deepEqual(constrainStationViewPan({ x: 80, y: -80 }, 1, { width: 600, height: 400 }), { x: 0, y: 0 });
});

test("Panel Mat renders as a hard-edged 2.5D pixel sprite without a text label over it", () => {
  const zero = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("panel-sprite-0"), objects: [createStationObject("panel", 1, "panel")] }} label="Panel sprite" />);
  const thirty = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("panel-sprite-30"), objects: [{ ...createStationObject("panel", 1, "panel"), rotation: 30 }] }} label="Panel sprite" />);
  assert.match(zero, /class="panel-mat-sprite"/);
  assert.match(zero, /shape-rendering="crispEdges"/);
  assert.match(zero, /class="panel-mat-color-panel red"/);
  assert.match(zero, /viewBox="0 0 96 48"/);
  assert.match(zero, /points="26,7 81,7 70,29 15,29"/);
  assert.doesNotMatch(zero, /transform:rotate/);
  assert.doesNotMatch(zero, />4 PANEL MAT</);
  assert.notEqual(thirty, zero);
});

test("an opened Panel Mat displays its four physical color panels in order", () => {
  const panel = setPanelMatState(createStationObject("panel", 1, "panel"), "open");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("open-panel"), objects: [panel] }} label="Open Panel Mat" />);

  const red = markup.indexOf("panel-mat-color-panel red");
  const green = markup.indexOf("panel-mat-color-panel green");
  const blue = markup.indexOf("panel-mat-color-panel blue");
  const yellow = markup.indexOf("panel-mat-color-panel yellow");
  assert.ok(red >= 0 && red < green && green < blue && blue < yellow);
  assert.match(markup, /class="panel-mat-color-side red"/);
  assert.match(markup, /class="panel-mat-color-side green"/);
  assert.match(markup, /class="panel-mat-color-side blue"/);
  assert.match(markup, /class="panel-mat-color-side yellow"/);
  assert.match(markup, /class="panel-mat-outline"/);
});

test("5 and 6 Panel Mats render their corrected physical panel counts and documented colors", () => {
  const fiveFolded = { ...createStationObject("five-panel", 1, "five-panel"), panelMatColorway: "blue-green" as const };
  const fiveOpened = setPanelMatState(fiveFolded, "open");
  const folded = createStationObject("six-panel", 1, "six-panel");
  const opened = setPanelMatState(folded, "open");
  const fivePreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("five-panel-preview"), objects: [fiveOpened] }} label="5 Panel Mat" />);
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("six-panel-preview"), objects: [opened] }} label="6 Panel Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("six-panel-maker"), objects: [folded] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(fivePreview, /class="panel-mat-sprite five-panel-mat-sprite"/);
  assert.equal((fivePreview.match(/class="panel-mat-color-panel blue"/g) ?? []).length, 3);
  assert.equal((fivePreview.match(/class="panel-mat-color-panel green"/g) ?? []).length, 2);
  assert.match(preview, /class="panel-mat-sprite six-panel-mat-sprite"/);
  assert.equal((preview.match(/class="panel-mat-color-panel light-blue"/g) ?? []).length, 6);
  assert.match(maker, /6 PANEL MAT: CLOSED/);
  assert.match(maker, /OPEN 6 PANEL MAT/);
  assert.match(maker, /6 PANELS · 6 FT × 2 FT EACH · 1.1 IN THICK/);
  assert.match(maker, /<option value="light-blue" selected="">LIGHT BLUE<\/option>/);
});

test("4 and 5 Panel Mats expose purple and blue/green alternatives", () => {
  const purpleFour = { ...setPanelMatState(createStationObject("panel", 1, "purple-four"), "open"), panelMatColorway: "purple" as const };
  const purpleFive = { ...createStationObject("five-panel", 1, "purple-five"), panelMatColorway: "purple" as const };
  const fourPreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("purple-four-preview"), objects: [purpleFour] }} label="4 Panel Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("purple-five-maker"), objects: [purpleFive] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.equal((fourPreview.match(/class="panel-mat-color-panel purple"/g) ?? []).length, 4);
  assert.match(maker, /<option value="purple" selected="">PURPLE<\/option>/);
  assert.match(maker, /<option value="blue-green">BLUE \/ GREEN<\/option>/);
  assert.match(maker, /5 PANELS · 5 FT × 2 FT EACH · 1.1 IN THICK/);
});

test("Big Block keeps its random starting color and exposes a picker plus six-side flips", () => {
  const block = { ...createStationObject("big-block", 1, "big-block"), bigBlockColor: "purple" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("big-block-preview"), objects: [block] }} label="Big Block" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("big-block-maker"), objects: [block] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="big-block-sprite purple"/);
  assert.match(preview, /class="big-block-top"/);
  assert.match(preview, /class="big-block-side"/);
  assert.doesNotMatch(preview, />BIG BLOCK</);
  assert.match(maker, /<label>COLOR<select>/);
  assert.match(maker, /<option value="purple" selected="">PURPLE<\/option>/);
  assert.deepEqual(
    [...maker.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map(([, value, label]) => [value, label]),
    [["orange", "ORANGE"], ["blue", "BLUE"], ["green", "GREEN"], ["purple", "PURPLE"], ["black", "BLACK"]],
  );
  assert.match(maker, /SIDE: 1\/6 · 4 FT × 2 FT TOP · 3 FT TALL/);
  assert.match(maker, /FLIP SIDE/);
});

test("Big Octagon renders red outer faces with a green octagonal end", () => {
  const octagon = createStationObject("big-octagon", 1, "big-octagon");
  const zero = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("big-octagon-zero"), objects: [octagon] }} label="Big Octagon" />);
  const thirty = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("big-octagon-thirty"), objects: [{ ...octagon, rotation: 30 }] }} label="Big Octagon" />);

  assert.match(zero, /class="big-octagon-sprite"/);
  assert.match(zero, /class="big-octagon-outer"/);
  assert.match(zero, /class="big-octagon-end"/);
  assert.doesNotMatch(zero, />BIG OCTAGON</);
  assert.notEqual(thirty, zero);
});

test("Medium Octagon renders green outer faces with yellow octagonal ends", () => {
  const octagon = createStationObject("medium-octagon", 1, "medium-octagon");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("medium-octagon-preview"), objects: [octagon] }} label="Medium Octagon" />);

  assert.match(markup, /class="medium-octagon-sprite"/);
  assert.match(markup, /class="medium-octagon-outer"/);
  assert.equal((markup.match(/class="medium-octagon-end"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, />MEDIUM OCTAGON</);
});

test("Medium Cheese Mat renders as a pixel wedge with its specified face colors", () => {
  const cheese = createStationObject("medium-cheese-mat", 1, "medium-cheese-mat");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("cheese-preview"), objects: [cheese] }} label="Medium Cheese Mat" />);

  assert.match(markup, /class="medium-cheese-mat-sprite"/);
  assert.match(markup, /class="medium-cheese-mat-top"/);
  assert.match(markup, /class="medium-cheese-mat-end"/);
  assert.match(markup, /class="medium-cheese-mat-side blue"/);
  assert.match(markup, /class="medium-cheese-mat-side yellow"/);
  assert.doesNotMatch(markup, />MEDIUM CHEESE MAT</);
});

test("Small Cheese Mat renders its orange-and-purple default plus green and red variants", () => {
  const orangePurple = createStationObject("small-cheese-mat", 1, "orange-purple");
  const green = { ...createStationObject("small-cheese-mat", 2, "green"), smallCheeseMatColor: "green" as const };
  const red = { ...createStationObject("small-cheese-mat", 3, "red"), smallCheeseMatColor: "red" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("small-cheese-preview"), objects: [orangePurple, green, red] }} label="Small Cheese Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("small-cheese-maker"), objects: [orangePurple] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="small-cheese-mat-sprite orange-purple"/);
  assert.match(preview, /class="small-cheese-mat-sprite green"/);
  assert.match(preview, /class="small-cheese-mat-sprite red"/);
  assert.match(preview, /class="small-cheese-mat-top"/);
  assert.match(preview, /class="small-cheese-mat-side purple"/);
  assert.match(preview, /class="small-cheese-mat-side blue"/);
  assert.match(preview, /class="small-cheese-mat-side yellow"/);
  assert.match(maker, /ORANGE \/ PURPLE/);
  assert.match(maker, /GREEN \/ BLUE \/ YELLOW/);
  assert.match(maker, /RED \/ NAVY \/ YELLOW/);
  assert.doesNotMatch(preview, />SMALL CHEESE MAT</);
});

test("Tiny Cheese Mats render as solid-red 4-foot wedges with physical face flips", () => {
  const cheese = createStationObject("tiny-cheese-mat", 1, "tiny-cheese-mat");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("tiny-cheese-preview"), objects: [cheese] }} label="Tiny Cheese Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("tiny-cheese-maker"), objects: [cheese] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="tiny-cheese-mat-sprite"/);
  assert.match(preview, /class="tiny-cheese-mat-top"/);
  assert.match(preview, /class="tiny-cheese-mat-side red"/);
  assert.doesNotMatch(preview, />TINY CHEESE MAT</);
  assert.match(maker, /FACE: 1\/5 · BOTTOM/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Large and Huge Cheese Mats render as separate green, blue, and yellow pixel wedges", () => {
  const large = createStationObject("large-cheese-mat", 1, "large-cheese-mat");
  const cheese = createStationObject("big-cheese-mat", 1, "big-cheese-mat");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("large-huge-cheese-preview"), objects: [large, cheese] }} label="Large and Huge Cheese Mats" />);

  assert.match(markup, /class="large-cheese-mat-sprite"/);
  assert.match(markup, /class="large-cheese-mat-top"/);
  assert.match(markup, /class="large-cheese-mat-end"/);
  assert.match(markup, /class="large-cheese-mat-side blue"/);
  assert.match(markup, /class="large-cheese-mat-side yellow"/);
  assert.match(markup, /class="big-cheese-mat-sprite"/);
  assert.match(markup, /class="big-cheese-mat-top"/);
  assert.match(markup, /class="big-cheese-mat-end"/);
  assert.match(markup, /class="big-cheese-mat-side blue"/);
  assert.match(markup, /class="big-cheese-mat-side yellow"/);
  assert.doesNotMatch(markup, />LARGE CHEESE MAT</);
  assert.doesNotMatch(markup, />HUGE CHEESE MAT</);
});

test("Tiny, Small, Medium, Large, and Squishy Cheese Mats fold into compact colored storage blocks while the Huge Cheese stays open", () => {
  const tiny = setCheeseMatState(createStationObject("tiny-cheese-mat", 1, "tiny"), "closed");
  const small = setCheeseMatState(createStationObject("small-cheese-mat", 2, "small"), "closed");
  const medium = setCheeseMatState(createStationObject("medium-cheese-mat", 3, "medium"), "closed");
  const large = setCheeseMatState(createStationObject("large-cheese-mat", 4, "large"), "closed");
  const squishy = setCheeseMatState(createStationObject("squishy-cheese-mat", 5, "squishy"), "closed");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("folded-cheese-preview"), objects: [tiny, small, medium, large, squishy] }} label="Folded Cheese Mats" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("folded-cheese-maker"), objects: [medium] }} onSave={() => undefined} onCancel={() => undefined} />);
  const bigMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("big-cheese-maker"), objects: [createStationObject("big-cheese-mat", 1, "big")] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.equal((preview.match(/class="folded-cheese-mat-sprite/g) ?? []).length, 5);
  assert.match(preview, /class="folded-cheese-mat-top green"/);
  assert.match(preview, /class="folded-cheese-mat-top red"/);
  assert.match(preview, /class="folded-cheese-mat-top orange"/);
  assert.match(preview, /class="folded-cheese-mat-side blue"/);
  assert.match(preview, /class="folded-cheese-mat-side yellow"/);
  assert.match(maker, /MEDIUM CHEESE MAT: CLOSED · FOLDS IN HALF LENGTHWISE/);
  assert.match(maker, /OPEN MEDIUM CHEESE MAT/);
  assert.match(maker, /FACE: 1\/5 · FOLDED BLOCK/);
  assert.doesNotMatch(bigMaker, /CLOSE HUGE CHEESE MAT/);
});

test("Squishy Cheese Mat renders a red slope with a blue sharp third and yellow remainder", () => {
  const squishy = createStationObject("squishy-cheese-mat", 1, "squishy-cheese-mat");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("squishy-cheese-preview"), objects: [squishy] }} label="Squishy Cheese Mat" />);

  assert.match(markup, /class="squishy-cheese-mat-sprite"/);
  assert.match(markup, /class="squishy-cheese-mat-top"/);
  assert.match(markup, /class="squishy-cheese-mat-side yellow"/);
  assert.match(markup, /class="squishy-cheese-mat-side blue"/);
  assert.doesNotMatch(markup, />SQUISHY CHEESE MAT</);
});

test("Cloud Mat renders as a grey 2.5D mat with black trim and an inset Velcro outline", () => {
  const cloud = createStationObject("cloud-mat", 1, "cloud-mat");
  const markup = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("cloud-preview"), objects: [cloud] }} label="Cloud Mat" />);

  assert.match(markup, /class="cloud-mat-sprite"/);
  assert.match(markup, /class="cloud-mat-top"/);
  assert.match(markup, /class="cloud-mat-side"/);
  assert.match(markup, /class="cloud-mat-velcro"/);
  assert.doesNotMatch(markup, />CLOUD MAT</);
});

test("Springboards render as a 2.5D wedge with their selectable color variants", () => {
  const springboard = createStationObject("springboard", 1, "springboard");
  const orange = { ...createStationObject("springboard", 2, "orange-springboard"), color: "orange" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("springboard-preview"), objects: [springboard, orange] }} label="Springboard" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("springboard-maker"), objects: [springboard] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="springboard-sprite white-grey"/);
  assert.match(preview, /class="springboard-sprite orange"/);
  assert.match(preview, /class="springboard-top"/);
  assert.match(preview, /class="springboard-end"/);
  assert.equal((preview.match(/class="springboard-spring"/g) ?? []).length, 12);
  assert.doesNotMatch(preview, />SPRINGBOARD</);
  assert.match(maker, /WHITISH GREY/);
  assert.match(maker, /BURGUNDY/);
  assert.match(maker, /ORANGE/);
  assert.match(maker, /BLUEISH GREY/);
});

test("Preschool Springboards render as red wedges with visible red springs and purple footprints", () => {
  const springboard = { ...createStationObject("preschool-springboard", 1, "preschool-springboard"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("preschool-springboard-preview"), objects: [springboard] }} label="Preschool Springboard" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("preschool-springboard-maker"), objects: [springboard] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece preschool-springboard"/);
  assert.match(preview, /class="preschool-springboard-sprite"/);
  assert.match(preview, /class="preschool-springboard-top"/);
  assert.match(preview, /class="preschool-springboard-end"/);
  assert.equal((preview.match(/class="preschool-springboard-spring"/g) ?? []).length, 4);
  assert.equal((preview.match(/class="preschool-springboard-footprint"/g) ?? []).length, 2);
  assert.doesNotMatch(preview, />PRESCHOOL SPRINGBOARD</);
  assert.match(maker, />PRESCHOOL SPRINGBOARD</);
  assert.match(maker, /RED BOARD · 30 IN × 20 IN · 0–6.5 IN RISE · 4 RED SPRINGS · NO FLIP/);
});

test("T Trainers render as a blue runway between raised red rails with white markings and frame", () => {
  const trainer = createStationObject("t-trainer", 1, "t-trainer");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("t-trainer-preview"), objects: [trainer] }} label="T Trainer" />);

  assert.match(preview, /class="t-trainer-sprite"/);
  assert.match(preview, /class="t-trainer-frame-bar"/);
  assert.match(preview, /class="t-trainer-rail"/);
  assert.match(preview, /class="t-trainer-runway-side"/);
  assert.match(preview, /class="t-trainer-trampoline"/);
  assert.equal((preview.match(/class="t-trainer-dash"/g) ?? []).length, 3);
  assert.match(preview, /class="t-trainer-cross-line"/);
  assert.doesNotMatch(preview, />T TRAINER</);
});

test("Mail Boxes render as a pixelated red mailbox with yellow arched end caps", () => {
  const mailBox = createStationObject("mail-box", 1, "mail-box");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("mail-box-preview"), objects: [mailBox] }} label="Mail Box" />);

  assert.match(preview, /class="mail-box-sprite"/);
  assert.match(preview, /class="mail-box-red-face"/);
  assert.match(preview, /class="mail-box-yellow-end"/);
  assert.match(preview, /class="mail-box-end-strap"/);
  assert.equal((preview.match(/class="mail-box-end-label"/g) ?? []).length, 2);
  assert.doesNotMatch(preview, />MAIL BOX</);
});

test("Green Mailboxes render with green curved surfaces and yellow flat ends", () => {
  const mailBox = createStationObject("green-mail-box", 1, "green-mail-box");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("green-mail-box-preview"), objects: [mailBox] }} label="Green Mailbox" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("green-mail-box-maker"), objects: [mailBox] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece green-mail-box"/);
  assert.match(preview, /class="green-mail-box-sprite"/);
  assert.match(preview, /class="green-mail-box-curve"/);
  assert.match(preview, /class="green-mail-box-yellow-end"/);
  assert.match(preview, /class="green-mail-box-end-handle"/);
  assert.doesNotMatch(preview, />GREEN MAILBOX</);
  assert.match(maker, />GREEN MAILBOX</);
  assert.match(maker, /GREEN CURVED SIDES · YELLOW FLAT ENDS · 24 IN × 17.5 IN × 33 IN · NO FLIP/);
});

test("Colts render as portable caramel-and-gray mini pommel horses with two handles", () => {
  const colt = createStationObject("colt", 1, "colt");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("colt-preview"), objects: [colt] }} label="Colt" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("colt-maker"), objects: [colt] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="colt-sprite"/);
  assert.match(preview, /class="colt-gray-base"/);
  assert.match(preview, /class="colt-caramel-roof"/);
  assert.match(preview, /class="colt-gray-end"/);
  assert.match(preview, /class="colt-caramel-end"/);
  assert.equal((preview.match(/class="colt-handle-base"/g) ?? []).length, 4);
  assert.equal((preview.match(/class="colt-handle-bar"/g) ?? []).length, 2);
  assert.doesNotMatch(preview, />COLT</);
  assert.match(maker, />COLT</);
  assert.match(maker, /CARAMEL TOP · GRAY BASE · 31 IN × 15 IN × 16 IN · NO FLIP/);
});

test("Parallettes render as hard-edged wooden bars with two angled supports", () => {
  const parallette = createStationObject("parallette", 1, "parallette");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("parallette-preview"), objects: [parallette] }} label="Parallette" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("parallette-maker"), objects: [parallette] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="parallette-sprite"/);
  assert.match(preview, /class="parallette-bar"/);
  assert.equal((preview.match(/class="parallette-support"/g) ?? []).length, 2);
  assert.match(preview, /class="parallette-bar-end"/);
  assert.doesNotMatch(preview, />PARALLETTE</);
  assert.match(maker, />PARALLETTE</);
  assert.match(maker, /WOOD · 12 IN LONG · 8 IN BASE · 5 IN HIGH · NO FLIP/);
});

test("Mini Low Bars render a brown rail on selectable colored T feet at either documented height", () => {
  const grayBar = createStationObject("mini-low-bar", 1, "mini-low-bar-gray");
  const tallBlueBar = { ...grayBar, miniLowBarBaseColor: "blue" as const, miniLowBarHeightInches: 13 as const, rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("mini-low-bar-preview"), objects: [grayBar] }} label="Mini Low Bar" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("mini-low-bar-maker"), objects: [tallBlueBar] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece mini-low-bar"/);
  assert.match(preview, /class="mini-low-bar-sprite gray"/);
  assert.match(preview, /class="mini-low-bar-base"/);
  assert.match(preview, /class="mini-low-bar-support"/);
  assert.match(preview, /class="mini-low-bar-rail"/);
  assert.match(preview, /class="mini-low-bar-rail-end"/);
  assert.doesNotMatch(preview, />MINI LOW BAR</);
  assert.match(maker, />MINI LOW BAR</);
  assert.match(maker, /BROWN RAIL · 51 IN LONG · 18 IN BASE · 13 IN HIGH · NO FLIP/);
  assert.match(maker, />GRAY<\/option><option value="red">RED<\/option><option value="blue" selected="">BLUE<\/option>/);
  assert.match(maker, />7 IN<\/option><option value="13" selected="">13 IN<\/option>/);
});

test("Rec Mini Bars render as a tan rail on blue bases without the tied green decoration", () => {
  const recBar = { ...createStationObject("rec-mini-bar", 1, "rec-mini-bar"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("rec-mini-bar-preview"), objects: [recBar] }} label="Rec Mini Bar" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("rec-mini-bar-maker"), objects: [recBar] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece rec-mini-bar"/);
  assert.match(preview, /class="rec-mini-bar-sprite"/);
  assert.match(preview, /class="rec-mini-bar-base"/);
  assert.match(preview, /class="rec-mini-bar-post"/);
  assert.match(preview, /class="rec-mini-bar-upper"/);
  assert.match(preview, /class="rec-mini-bar-elbow"/);
  assert.match(preview, /class="rec-mini-bar-knob"/);
  assert.match(preview, /class="rec-mini-bar-rail"/);
  assert.match(preview, /class="rec-mini-bar-rail-end"/);
  assert.doesNotMatch(preview, /green-tie|rec-mini-bar-tie/);
  assert.doesNotMatch(preview, />REC MINI BAR</);
  assert.match(maker, />REC MINI BAR</);
  assert.match(maker, /TAN RAIL · 51 IN LONG · 39 IN HIGH · BLUE BASES · NO GREEN TIE · NO FLIP/);
});

test("Advanced Mini Bars render as tall tan rails on orange adjustable bases", () => {
  const advancedBar = { ...createStationObject("advanced-mini-bar", 1, "advanced-mini-bar"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("advanced-mini-bar-preview"), objects: [advancedBar] }} label="Advanced Mini Bar" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("advanced-mini-bar-maker"), objects: [advancedBar] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece advanced-mini-bar"/);
  assert.match(preview, /class="advanced-mini-bar-sprite"/);
  assert.match(preview, /class="advanced-mini-bar-base"/);
  assert.match(preview, /class="advanced-mini-bar-post"/);
  assert.match(preview, /class="advanced-mini-bar-support"/);
  assert.match(preview, /class="advanced-mini-bar-mount"/);
  assert.match(preview, /class="advanced-mini-bar-knob"/);
  assert.match(preview, /class="advanced-mini-bar-rail"/);
  assert.match(preview, /class="advanced-mini-bar-rail-end"/);
  assert.doesNotMatch(preview, />ADVANCED MINI BAR</);
  assert.match(maker, />ADVANCED MINI BAR</);
  assert.match(maker, /TAN RAIL · 69 IN LONG · 44 IN HIGH · ORANGE BASES · GREEN MOUNTS · NO FLIP/);
});

test("Traffic cones render as hard-edged orange traffic cones with their square bases", () => {
  const cone = { ...createStationObject("traffic-cone", 1, "traffic-cone"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("traffic-cone-preview"), objects: [cone] }} label="Traffic Cone" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("traffic-cone-maker"), objects: [cone] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece traffic-cone"/);
  assert.match(preview, /class="traffic-cone-sprite"/);
  assert.match(preview, /class="traffic-cone-base"/);
  assert.match(preview, /class="traffic-cone-body"/);
  assert.match(preview, /class="traffic-cone-tip"/);
  assert.doesNotMatch(preview, />TRAFFIC CONE</);
  assert.match(maker, />TRAFFIC CONE</);
  assert.match(maker, /ORANGE TRAFFIC CONE · 7 IN TALL · NO FLIP/);
});

test("Target markers render as thin yellow circles with centered red targets", () => {
  const marker = { ...createStationObject("target-marker", 1, "target-marker"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("target-marker-preview"), objects: [marker] }} label="Target Marker" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("target-marker-maker"), objects: [marker] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece target-marker"/);
  assert.match(preview, /class="target-marker-sprite"/);
  assert.match(preview, /class="target-marker-side"/);
  assert.match(preview, /class="target-marker-yellow"/);
  assert.match(preview, /class="target-marker-red"/);
  assert.doesNotMatch(preview, />TARGET MARKER</);
  assert.match(maker, />TARGET MARKER</);
  assert.match(maker, /YELLOW TARGET · 9 IN DIAMETER · RED CENTER · NO FLIP/);
});

test("Beanbags render as square tapered pads with the standard color selector", () => {
  const beanbag = { ...createStationObject("beanbag", 1, "beanbag"), color: "purple" as const, rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("beanbag-preview"), objects: [beanbag] }} label="Beanbag" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("beanbag-maker"), objects: [beanbag] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece beanbag"/);
  assert.match(preview, /class="beanbag-sprite purple"/);
  assert.equal((preview.match(/class="beanbag-slope"/g) ?? []).length, 4);
  assert.match(preview, /class="beanbag-center"/);
  assert.doesNotMatch(preview, />BEANBAG</);
  assert.match(maker, />BEANBAG</);
  assert.match(maker, /5.5 IN SQUARE · 0.5 IN CENTER · TAPERS TO EDGE · NO FLIP/);
  assert.match(maker, /<option value="purple" selected="">PURPLE<\/option>/);
});

test("Rainbow Mats render as blue semicircular arches with opposite cyan/yellow ends and red tunnels", () => {
  const rainbowMat = { ...createStationObject("rainbow-mat", 1, "rainbow-mat"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("rainbow-mat-preview"), objects: [rainbowMat] }} label="Rainbow Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("rainbow-mat-maker"), objects: [rainbowMat] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece rainbow-mat"/);
  assert.match(preview, /class="rainbow-mat-sprite"/);
  assert.match(preview, /class="rainbow-mat-outer"/);
  assert.match(preview, /class="rainbow-mat-cyan-end"/);
  assert.match(preview, /class="rainbow-mat-inner"/);
  assert.doesNotMatch(preview, />RAINBOW MAT</);
  assert.match(maker, />RAINBOW MAT</);
  assert.match(maker, /BLUE ARCH · CYAN \/ YELLOW ENDS · RED TUNNEL · 49 IN DIAMETER · 15.5 IN DEEP · 24 IN OPENING · NO FLIP/);
});

test("Pac-Man Blocks render as faceted red three-quarter cylinders with a yellow top and an open mouth", () => {
  const pacMan = { ...createStationObject("pac-man", 1, "pac-man"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("pac-man-preview"), objects: [pacMan] }} label="Pac-Man" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("pac-man-maker"), objects: [pacMan] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece pac-man"/);
  assert.match(preview, /class="pac-man-sprite"/);
  assert.match(preview, /class="pac-man-curved-side"/);
  assert.match(preview, /class="pac-man-cutout-side"/);
  assert.match(preview, /class="pac-man-top"/);
  assert.doesNotMatch(preview, />PAC-MAN</);
  assert.match(maker, />PAC-MAN</);
  assert.match(maker, /YELLOW TOP · RED CURVED \/ CUTOUT SIDES · 32 IN DIAMETER · 27 IN TALL · QUARTER OPENING · NO FLIP/);
});

test("Trapezes render as a suspended brown faceted bar on two black straps", () => {
  const trapeze = { ...createStationObject("trapeze", 1, "trapeze"), rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("trapeze-preview"), objects: [trapeze] }} label="Trapeze" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("trapeze-maker"), objects: [trapeze] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece trapeze"/);
  assert.match(preview, /class="trapeze-sprite"/);
  assert.equal((preview.match(/class="trapeze-strap"/g) ?? []).length, 2);
  assert.match(preview, /class="trapeze-bar"/);
  assert.match(preview, /class="trapeze-bar-end"/);
  assert.doesNotMatch(preview, />TRAPEZE</);
  assert.match(maker, />TRAPEZE</);
  assert.match(maker, /BROWN BAR · 21 IN LONG · 1.5 IN THICK · BLACK STRAPS · 24 IN LONG · NO FLIP/);
});

test("Teddy Mats render as dark brown thin mats with physical face controls", () => {
  const teddyMat = createStationObject("teddy-mat", 1, "teddy-mat");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("teddy-mat-preview"), objects: [teddyMat] }} label="Teddy Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("teddy-mat-maker"), objects: [teddyMat] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece teddy-mat"/);
  assert.match(preview, /class="station-cuboid-sprite teddy-mat-sprite"/);
  assert.doesNotMatch(preview, />TEDDY MAT</);
  assert.match(maker, />TEDDY MAT</);
  assert.match(maker, /DARK BROWN · 43 IN × 35 IN TOP · 2 IN TALL/);
  assert.match(maker, /FACE: 3\/6 · PHYSICAL FACE/);
});

test("Hand Mats render as burgundy 2.5D mats with a faint white four-section cross", () => {
  const handMat = createStationObject("hand-mat", 1, "hand-mat");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("hand-mat-preview"), objects: [handMat] }} label="Hand Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("hand-mat-maker"), objects: [handMat] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece hand-mat"/);
  assert.match(preview, /class="hand-mat-sprite"/);
  assert.equal((preview.match(/class="hand-mat-divider"/g) ?? []).length, 2);
  assert.doesNotMatch(preview, />HAND MAT</);
  assert.match(maker, />HAND MAT</);
  assert.match(maker, /BURGUNDY · FAINT WHITE FOUR-SECTION CROSS · 52 IN × 49 IN TOP · 1 IN TALL/);
  assert.match(maker, /FLIP FACE/);
});

test("PVC Pipes render as narrow white faceted cylinders at their real physical scale", () => {
  const pipe = createStationObject("pvc-pipe", 1, "pvc-pipe");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("pvc-pipe-preview"), objects: [pipe] }} label="PVC Pipe" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("pvc-pipe-maker"), objects: [pipe] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="pvc-pipe-sprite"/);
  assert.equal((preview.match(/class="pvc-pipe-lateral"/g) ?? []).length, 3);
  assert.match(preview, /class="pvc-pipe-end"/);
  assert.doesNotMatch(preview, />PVC PIPE</);
  assert.match(maker, />PVC PIPE</);
  assert.match(maker, /WHITE PVC · 36 IN LONG · 1 IN DIAMETER · NO FLIP/);
});

test("Small Bar Pads render as short red faceted cylinders", () => {
  const pad = createStationObject("small-bar-pad", 1, "small-bar-pad");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("small-bar-pad-preview"), objects: [pad] }} label="Small Bar Pad" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("small-bar-pad-maker"), objects: [pad] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece small-bar-pad"/);
  assert.match(preview, /class="small-bar-pad-sprite"/);
  assert.match(preview, /class="small-bar-pad-lateral"/);
  assert.match(preview, /class="small-bar-pad-end"/);
  assert.doesNotMatch(preview, />SMALL BAR PAD</);
  assert.match(maker, />SMALL BAR PAD</);
  assert.match(maker, /RED · 9 IN LONG · 2 IN THICK · NO FLIP/);
});

test("Rolling Bars render a red axle between blue octagonal wheels", () => {
  const rollingBar = createStationObject("rolling-bar", 1, "rolling-bar");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("rolling-bar-preview"), objects: [rollingBar] }} label="Rolling Bar" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("rolling-bar-maker"), objects: [rollingBar] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece rolling-bar"/);
  assert.match(preview, /class="rolling-bar-sprite"/);
  assert.match(preview, /class="rolling-bar-axle"/);
  assert.match(preview, /class="rolling-bar-wheel"/);
  assert.match(preview, /class="rolling-bar-wheel-end"/);
  assert.doesNotMatch(preview, />ROLLING BAR</);
  assert.match(maker, />ROLLING BAR</);
  assert.match(maker, /RED BAR · 17 IN LONG · 1.5 IN THICK · BLUE OCTAGONS · 5 IN · NO FLIP/);
});

test("Wooden Climbing Ladders render as open light-wood rails with separate rungs", () => {
  const ladder = createStationObject("wooden-climbing-ladder", 1, "wooden-climbing-ladder");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("wooden-climbing-ladder-preview"), objects: [ladder] }} label="Wooden Climbing Ladder" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("wooden-climbing-ladder-maker"), objects: [ladder] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece wooden-climbing-ladder"/);
  assert.match(preview, /class="wooden-climbing-ladder-sprite"/);
  assert.match(preview, /class="wooden-climbing-ladder-rail"/);
  assert.match(preview, /class="wooden-climbing-ladder-rung"/);
  assert.match(preview, /class="wooden-climbing-ladder-rail-side"/);
  assert.match(preview, /class="wooden-climbing-ladder-rung-side"/);
  assert.doesNotMatch(preview, />WOODEN CLIMBING LADDER</);
  assert.match(maker, />WOODEN CLIMBING LADDER</);
  assert.match(maker, /LIGHT WOOD · 72 IN LONG · 19 IN WIDE · 3.5 IN THICK · 8 RUNGS · NO FLIP/);
});

test("Bose Balls render as dark-gray faceted half-spheres with a floor rim and grip ribs", () => {
  const boseBall = createStationObject("bose-ball", 1, "bose-ball");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("bose-ball-preview"), objects: [boseBall] }} label="Bose Ball" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("bose-ball-maker"), objects: [boseBall] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="bose-ball-sprite"/);
  assert.equal((preview.match(/class="bose-ball-rim-top"/g) ?? []).length, 12);
  assert.match(preview, /class="bose-ball-rim-side"/);
  assert.match(preview, /class="bose-ball-dome"/);
  assert.equal((preview.match(/class="bose-ball-grip"/g) ?? []).length, 4);
  assert.doesNotMatch(preview, />BOSE BALL</);
  assert.match(maker, />BOSE BALL</);
  assert.match(maker, /DARK GRAY · 21 IN DIAMETER · 10.5 IN HIGH · NO FLIP/);
});

test("Foam Rollers render as gray cylinders with selectable green, orange, blue, and gray ends", () => {
  const orangeRoller = { ...createStationObject("foam-roller", 1, "foam-roller"), foamRollerEndColor: "orange" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("foam-roller-preview"), objects: [orangeRoller] }} label="Foam Roller" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("foam-roller-maker"), objects: [orangeRoller] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="foam-roller-sprite orange"/);
  assert.match(preview, /class="foam-roller-side"/);
  assert.match(preview, /class="foam-roller-end"/);
  assert.doesNotMatch(preview, />FOAM ROLLER</);
  assert.match(maker, />FOAM ROLLER</);
  assert.match(maker, /GRAY SIDES · 18 IN LONG · 5.5 IN DIAMETER · NO FLIP/);
  assert.match(maker, />GREEN<\/option><option value="orange" selected="">ORANGE<\/option><option value="blue">BLUE<\/option><option value="gray">GRAY<\/option>/);
});

test("Yoga Balls render as full faceted spheres with selectable documented colors", () => {
  const blackBall = { ...createStationObject("yoga-ball", 1, "yoga-ball"), yogaBallColor: "black" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("yoga-ball-preview"), objects: [blackBall] }} label="Yoga Ball" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("yoga-ball-maker"), objects: [blackBall] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="yoga-ball-sprite black"/);
  assert.match(preview, /class="yoga-ball-facet shade-0"/);
  assert.match(preview, /class="yoga-ball-facet shade-1"/);
  assert.match(preview, /class="yoga-ball-facet shade-2"/);
  assert.doesNotMatch(preview, />YOGA BALL</);
  assert.match(maker, />YOGA BALL</);
  assert.match(maker, /20 IN DIAMETER · FULL SPHERE · NO FLIP/);
  assert.match(maker, />BLUE<\/option><option value="yellow">YELLOW<\/option><option value="green">GREEN<\/option><option value="red">RED<\/option><option value="purple">PURPLE<\/option><option value="black" selected="">BLACK<\/option>/);
});

test("Vault Trainers render as tall blue trainers with one faceted tan rounded edge", () => {
  const vaultTrainer = createStationObject("vault-trainer", 1, "vault-trainer");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("vault-trainer-preview"), objects: [vaultTrainer] }} label="Vault Trainer" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("vault-trainer-maker"), objects: [vaultTrainer] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="vault-trainer-sprite"/);
  assert.match(preview, /class="vault-trainer-blue"/);
  assert.match(preview, /class="vault-trainer-tan-top"/);
  assert.match(preview, /class="vault-trainer-handle"/);
  assert.doesNotMatch(preview, />VAULT TRAINER</);
  assert.match(maker, />VAULT TRAINER</);
  assert.match(maker, /BLUE BODY · WORN TAN TOP · 47 IN × 38 IN BASE · 49 IN TALL · 15 IN ROUND EDGE · NO FLIP/);
});

test("Big Boulders render as pixelated red curved trainers with yellow flat faces", () => {
  const boulder = createStationObject("big-boulder", 1, "big-boulder");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("big-boulder-preview"), objects: [boulder] }} label="Big Boulder" />);

  assert.match(preview, /class="big-boulder-sprite"/);
  assert.match(preview, /class="big-boulder-red-curve"/);
  assert.match(preview, /class="big-boulder-yellow-flat"/);
  assert.doesNotMatch(preview, />BIG BOULDER</);
});

test("Medium Boulders render as pixelated blue curved trainers with yellow flat faces", () => {
  const boulder = createStationObject("medium-boulder", 1, "medium-boulder");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("medium-boulder-preview"), objects: [boulder] }} label="Medium Boulder" />);

  assert.match(preview, /class="medium-boulder-sprite"/);
  assert.match(preview, /class="medium-boulder-blue-curve"/);
  assert.match(preview, /class="medium-boulder-yellow-flat"/);
  assert.doesNotMatch(preview, />MEDIUM BOULDER</);
});

test("Small Boulders render as pixelated purple curved trainers with yellow flat faces", () => {
  const boulder = createStationObject("small-boulder", 1, "small-boulder");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("small-boulder-preview"), objects: [boulder] }} label="Small Boulder" />);

  assert.match(preview, /class="small-boulder-sprite"/);
  assert.match(preview, /class="small-boulder-purple-curve"/);
  assert.match(preview, /class="small-boulder-yellow-flat"/);
  assert.doesNotMatch(preview, />SMALL BOULDER</);
});

test("Small Semicircles render as pixelated blue half-cylinders with yellow flat ends", () => {
  const semicircle = createStationObject("small-semicircle", 1, "small-semicircle");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("small-semicircle-preview"), objects: [semicircle] }} label="Small Semicircle" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("small-semicircle-maker"), objects: [semicircle] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="small-semicircle-sprite"/);
  assert.match(preview, /class="small-semicircle-blue-curve"/);
  assert.match(preview, /class="small-semicircle-yellow-flat"/);
  assert.doesNotMatch(preview, />SMALL SEMICIRCLE</);
  assert.match(maker, />SMALL SEMICIRCLE</);
  assert.match(maker, /BLUE CURVED SURFACE · YELLOW FLAT ENDS · 25.5 IN DIAMETER · 15 IN DEEP · 12.75 IN HIGH · NO FLIP/);
});

test("Mini Mushrooms render as a short pixelated blue cylinder with a worn padded top", () => {
  const mushroom = createStationObject("mini-mushroom", 1, "mini-mushroom");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("mini-mushroom-preview"), objects: [mushroom] }} label="Mini Mushroom" />);

  assert.match(preview, /class="mini-mushroom-sprite"/);
  assert.match(preview, /class="mini-mushroom-blue-side"/);
  assert.match(preview, /class="mini-mushroom-top"/);
  assert.doesNotMatch(preview, />MINI MUSHROOM</);
});

test("Floor Mushrooms render as a low pixelated brown disk with gray sides", () => {
  const mushroom = createStationObject("floor-mushroom", 1, "floor-mushroom");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("floor-mushroom-preview"), objects: [mushroom] }} label="Floor Mushroom" />);

  assert.match(preview, /class="floor-mushroom-sprite"/);
  assert.match(preview, /class="floor-mushroom-brown-top"/);
  assert.match(preview, /class="floor-mushroom-gray-side"/);
  assert.doesNotMatch(preview, />FLOOR MUSHROOM</);
});

test("Mushroom Mats render as tall pixel cylinders with both photographed colorways", () => {
  const blueBrown = createStationObject("mushroom-mat", 1, "blue-brown");
  const grayRedCross = { ...createStationObject("mushroom-mat", 2, "gray-red-cross"), mushroomMatColor: "gray-red-cross" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("mushroom-mat-preview"), objects: [blueBrown, grayRedCross] }} label="Mushroom Mats" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("mushroom-mat-maker"), objects: [grayRedCross] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.equal((preview.match(/class="mushroom-mat-sprite/g) ?? []).length, 2);
  assert.match(preview, /class="mushroom-mat-sprite blue-brown"/);
  assert.match(preview, /class="mushroom-mat-sprite gray-red-cross"/);
  assert.match(preview, /class="mushroom-mat-flange"/);
  assert.match(preview, /class="mushroom-mat-side"/);
  assert.match(preview, /class="mushroom-mat-top"/);
  assert.equal((preview.match(/class="mushroom-mat-cross"/g) ?? []).length, 2);
  assert.doesNotMatch(preview, />MUSHROOM MAT</);
  assert.match(maker, />MUSHROOM MAT</);
  assert.match(maker, /GRAY \/ RED \+ YELLOW CROSS/);
  assert.match(maker, /22 IN DIAMETER · 16 IN TALL · NO FLIP/);
});

test("Cylinders render as blue curved pixel cylinders with yellow ends in both physical placements", () => {
  const upright = createStationObject("cylinder", 1, "cylinder-upright");
  const sideways = { ...upright, id: "cylinder-sideways", face: 1, width: 96, height: 48 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("cylinder-preview"), objects: [upright, sideways] }} label="Cylinders" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("cylinder-maker"), objects: [sideways] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.equal((preview.match(/class="station-piece cylinder/g) ?? []).length, 2);
  assert.equal((preview.match(/class="cylinder-sprite"/g) ?? []).length, 2);
  assert.match(preview, /class="cylinder-blue-curve"/);
  assert.match(preview, /class="cylinder-yellow-flat"/);
  assert.doesNotMatch(preview, />CYLINDER</);
  assert.match(maker, />CYLINDER</);
  assert.match(maker, /BLUE CURVE · YELLOW ENDS · 24 IN DIAMETER · 48 IN TALL · FACE: 2\/2 · BLUE CURVE DOWN · ON ITS SIDE · 48 IN × 24 IN FLOOR · 24 IN CLEARANCE/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Trapezoid mats render as separate red, yellow, and green tapered slices", () => {
  const red = createStationObject("red-trapezoid", 1, "red-trapezoid");
  const yellow = createStationObject("yellow-trapezoid", 2, "yellow-trapezoid");
  const green = createStationObject("green-trapezoid", 3, "green-trapezoid");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("trapezoid-preview"), objects: [red, yellow, green] }} label="Trapezoid mats" />);

  assert.match(preview, /class="red-trapezoid-sprite"/);
  assert.match(preview, /class="yellow-trapezoid-sprite"/);
  assert.match(preview, /class="green-trapezoid-sprite"/);
  assert.match(preview, /class="red-trapezoid-top"/);
  assert.match(preview, /class="yellow-trapezoid-top"/);
  assert.match(preview, /class="green-trapezoid-top"/);
  assert.doesNotMatch(preview, />RED TRAPEZOID</);
  assert.doesNotMatch(preview, />YELLOW TRAPEZOID</);
  assert.doesNotMatch(preview, />GREEN TRAPEZOID</);
});

test("PBar Blocks, Half Blocks, Octagons, and Cheese Mats expose a physical face flip", () => {
  const objects = [
    createStationObject("pbar-block", 1, "pbar"),
    createStationObject("half-block", 2, "half"),
    { ...createStationObject("half-block", 3, "blue-half"), halfBlockColor: "blue" as const },
    createStationObject("big-octagon", 4, "big-octagon"),
    createStationObject("medium-octagon", 5, "medium-octagon"),
    createStationObject("small-octagon", 6, "small-octagon"),
    createStationObject("small-cheese-mat", 7, "small-cheese"),
    createStationObject("medium-cheese-mat", 8, "cheese"),
    createStationObject("large-cheese-mat", 9, "large-cheese"),
    createStationObject("big-cheese-mat", 10, "big-cheese"),
    createStationObject("squishy-cheese-mat", 11, "squishy-cheese"),
  ];
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("face-preview"), objects }} label="Physical faces" />);
  const halfPreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("half-preview"), objects: [objects[1]] }} label="Half Block" />);
  const blueHalfPreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("blue-half-preview"), objects: [objects[2]] }} label="Blue Half Block" />);
  const makers = objects.map((object) => renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup(`face-maker-${object.id}`), objects: [object] }} onSave={() => undefined} onCancel={() => undefined} />));

  assert.match(preview, /class="station-cuboid-sprite pbar-block-sprite"/);
  assert.match(preview, /class="station-cuboid-top (blue|green|yellow)"/);
  assert.match(preview, /class="station-cuboid-sprite half-block-sprite"/);
  assert.match(halfPreview, /class="station-cuboid-top blue"/);
  assert.match(halfPreview, /class="station-cuboid-side yellow"/);
  assert.match(halfPreview, /class="station-cuboid-side green"/);
  assert.match(blueHalfPreview, /class="station-cuboid-sprite half-block-sprite"/);
  assert.match(blueHalfPreview, /class="station-cuboid-top blue"/);
  assert.doesNotMatch(blueHalfPreview, /class="station-cuboid-top (green|yellow)"/);
  assert.match(preview, /class="small-octagon-sprite"/);
  assert.match(preview, /class="small-octagon-outer"/);
  assert.match(preview, /class="small-octagon-end"/);
  assert.ok(makers.every((maker) => (maker.match(/FLIP FACE/g) ?? []).length === 2));
  assert.match(makers[0], /FACE: 1\/6/);
  assert.match(makers[1], /<option value="green-yellow" selected="">GREEN\/YELLOW<\/option>/);
  assert.match(makers[2], /<option value="blue" selected="">BLUE<\/option>/);
  assert.match(makers[3], /FACE: 3\/10/);
  assert.match(makers[6], /FACE: 1\/5 · BOTTOM/);
  assert.match(makers[7], /FACE: 1\/5 · BOTTOM/);
  assert.match(makers[8], /FACE: 1\/5 · BOTTOM/);
});

test("Blue Resi renders as a solid-blue, flippable 2.5D block", () => {
  const resi = createStationObject("blue-resi", 1, "blue-resi");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("blue-resi-preview"), objects: [resi] }} label="Blue Resi" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("blue-resi-maker"), objects: [resi] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-cuboid-sprite blue-resi-sprite"/);
  assert.match(preview, /class="station-cuboid-top blue"/);
  assert.match(preview, /class="station-cuboid-side blue"/);
  assert.doesNotMatch(preview, />BLUE RESI</);
  assert.match(maker, /BLUE · FACE: 3\/6 · 94 IN × 59 IN TOP · 32 IN TALL/);
});

test("4/8/16 Resis use the observed yellow cross-stripe while the Big 4 exposes its gray top and blue underside", () => {
  const four = createStationObject("four-inch-resi", 1, "four-inch-resi");
  const greenFour = { ...four, fourInchResiColor: "green" as const };
  const purpleFour = { ...four, fourInchResiColor: "purple" as const };
  const sixteen = createStationObject("sixteen-inch-resi", 2, "sixteen-inch-resi");
  const bigFour = createStationObject("big-four-inch-resi", 3, "big-four-inch-resi");
  const bigFourUnder = flipStationObjectFace(bigFour, "next");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("resi-family-preview"), objects: [four, sixteen, bigFour] }} label="Resi family" />);
  const underside = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("big-four-underside"), objects: [bigFourUnder] }} label="Big Four underside" />);
  const greenPreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("green-four-inch-resi"), objects: [greenFour] }} label="Green Four" />);
  const purplePreview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("purple-four-inch-resi"), objects: [purpleFour] }} label="Purple Four" />);
  const fourMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("four-inch-resi-maker"), objects: [greenFour] }} onSave={() => undefined} onCancel={() => undefined} />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("resi-family-maker"), objects: [sixteen] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="striped-resi-sprite"/);
  assert.match(preview, /class="station-cuboid-top yellow"/);
  assert.match(preview, /class="station-cuboid-top gray"/);
  assert.doesNotMatch(underside, /class="station-cuboid-top gray"/);
  assert.match(greenPreview, /class="station-cuboid-top green"/);
  assert.match(greenPreview, /class="station-cuboid-side green"/);
  assert.match(greenPreview, /class="station-cuboid-top yellow"/);
  assert.match(purplePreview, /class="station-cuboid-top purple"/);
  assert.match(purplePreview, /class="station-cuboid-side purple"/);
  assert.match(fourMaker, /<option value="green" selected="">GREEN<\/option>/);
  assert.match(fourMaker, /<option value="purple">PURPLE<\/option>/);
  assert.match(fourMaker, /GREEN · YELLOW CROSS-STRIPE 20 IN FROM ONE END/);
  assert.match(maker, /BLUE · YELLOW CROSS-STRIPE 20 IN FROM ONE END · FACE: 3\/6 · 120 IN × 60 IN TOP · 16 IN TALL/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Gym Nova Mats render as gray-topped, cream-sided flippable 2.5D mats", () => {
  const gymNovaMat = createStationObject("gym-nova-mat", 1, "gym-nova-mat");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("gym-nova-preview"), objects: [gymNovaMat] }} label="Gym Nova Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("gym-nova-maker"), objects: [gymNovaMat] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-cuboid-sprite gym-nova-mat-sprite"/);
  assert.match(preview, /class="station-cuboid-top gray"/);
  assert.match(preview, /class="station-cuboid-side cream"/);
  assert.doesNotMatch(preview, />GYM NOVA MAT</);
  assert.match(maker, /GRAY TOP · CREAM SIDES · 59 IN × 35 IN TOP · 8 IN TALL/);
  assert.match(maker, /FACE: 3\/6 · PHYSICAL FACE/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Bungee Loop renders as a faceted continuous exercise loop with its requested colors", () => {
  const bungee = { ...createStationObject("bungee", 1, "bungee"), bungeeColor: "orange" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("bungee-preview"), objects: [bungee] }} label="Bungee Loop" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("bungee-maker"), objects: [bungee] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece bungee"/);
  assert.match(preview, /class="bungee-loop-sprite orange"/);
  assert.match(preview, /class="bungee-loop-band"/);
  assert.doesNotMatch(preview, />BUNGEE LOOP</);
  assert.match(maker, />BUNGEE LOOP</);
  assert.match(maker, /CONTINUOUS LOOP · 41 IN LAY-FLAT · 82 IN CIRCUMFERENCE · 3\/16 IN THICK/);
  assert.match(maker, />GREEN<\/option><option value="purple">PURPLE<\/option><option value="black">BLACK<\/option><option value="orange" selected="">ORANGE<\/option><option value="blue">BLUE<\/option>/);
});

test("Chalk Buckets render as open orange or pink Home Depot-style pixel pails", () => {
  const orangeBucket = createStationObject("chalk-bucket", 1, "chalk-orange");
  const pinkBucket = { ...orangeBucket, chalkBucketColor: "pink" as const, rotation: 30 };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("chalk-bucket-preview"), objects: [orangeBucket] }} label="Chalk Bucket" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("chalk-bucket-maker"), objects: [pinkBucket] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece chalk-bucket"/);
  assert.match(preview, /class="chalk-bucket-sprite orange"/);
  assert.match(preview, /class="chalk-bucket-body"/);
  assert.match(preview, /class="chalk-bucket-rim"/);
  assert.match(preview, /class="chalk-bucket-chalk"/);
  assert.match(preview, /class="chalk-bucket-handle"/);
  assert.doesNotMatch(preview, />CHALK BUCKET</);
  assert.match(maker, />CHALK BUCKET</);
  assert.match(maker, /HOME DEPOT-STYLE PAIL · 12 IN DIAMETER · 15 IN TALL · NO FLIP/);
  assert.match(maker, />ORANGE<\/option><option value="pink" selected="">PINK<\/option>/);
});

test("standard mats expose inspector flips unless explicitly tagged no flip", () => {
  const flippable = ["pink-beam-mat", "cartwheel-mat", "sting-mat", "gym-nova-mat", "cloud-mat", "red-trapezoid"] as const;
  for (const assetId of flippable) {
    const object = createStationObject(assetId, 1, `${assetId}-flip`);
    const markup = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup(`${assetId}-maker`), objects: [object] }} onSave={() => undefined} onCancel={() => undefined} />);
    assert.match(markup, /FACE: [1-6]\/6 · PHYSICAL FACE/);
    assert.equal((markup.match(/FLIP FACE/g) ?? []).length, 2);
  }
  const panel = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("panel-no-flip"), objects: [createStationObject("panel", 1, "panel")] }} onSave={() => undefined} onCancel={() => undefined} />);
  assert.match(panel, /NO FLIP · FOLDING MAT/);
  assert.doesNotMatch(panel, /FACE: [1-6]\/6 · PHYSICAL FACE/);
});

test("the first missed mat batch renders literal pixel 2.5D mats with their real dimensions", () => {
  const miniResi = createStationObject("mini-resi", 1, "mini-resi");
  const pinkBeamMat = createStationObject("pink-beam-mat", 2, "pink-beam-mat");
  const stingMat = createStationObject("sting-mat", 3, "sting-mat");
  const norbert = createStationObject("red-norbert-block", 4, "red-norbert-block");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("missed-mats-preview"), objects: [miniResi, pinkBeamMat, stingMat, norbert] }} label="Missed mats" />);
  const miniMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("mini-resi-maker"), objects: [miniResi] }} onSave={() => undefined} onCancel={() => undefined} />);
  const pinkMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("pink-beam-maker"), objects: [pinkBeamMat] }} onSave={() => undefined} onCancel={() => undefined} />);
  const stingMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("sting-maker"), objects: [stingMat] }} onSave={() => undefined} onCancel={() => undefined} />);
  const norbertMaker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("norbert-maker"), objects: [norbert] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="mini-resi-sprite"/);
  assert.match(preview, /class="mini-resi-top blue"/);
  assert.match(preview, /class="mini-resi-top light-blue"/);
  assert.match(preview, /class="mini-resi-top gray"/);
  assert.match(preview, /class="mini-resi-top red"/);
  assert.match(preview, /class="mini-resi-side blue"/);
  assert.match(preview, /class="mini-resi-side red"/);
  assert.match(preview, /class="station-cuboid-sprite pink-beam-mat-sprite"/);
  assert.match(preview, /class="station-cuboid-top pink"/);
  assert.match(preview, /class="station-cuboid-sprite sting-mat-sprite"/);
  assert.match(preview, /class="station-cuboid-top brown"/);
  assert.match(preview, /class="station-cuboid-sprite red-norbert-block-sprite"/);
  assert.match(preview, /class="station-cuboid-top red"/);
  assert.doesNotMatch(preview, />MINI RESI</);
  assert.doesNotMatch(preview, />PINK BEAM MAT</);
  assert.doesNotMatch(preview, />STING MAT</);
  assert.doesNotMatch(preview, />RED NORBERT BLOCK</);
  assert.match(miniMaker, /BLUE \/ RED · FACE: 3\/6 · 96 IN × 48 IN TOP · 16 IN TALL/);
  assert.equal((miniMaker.match(/FLIP FACE/g) ?? []).length, 2);
  assert.match(pinkMaker, /PINK · 54 IN × 36 IN · 0.35 IN THICK/);
  assert.match(stingMaker, /LIGHT BROWN · 76 IN × 55 IN · 1.5 IN THICK/);
  assert.match(norbertMaker, /RED · FACE: 3\/6 · 36 IN × 24 IN TOP · 12 IN TALL/);
  assert.equal((norbertMaker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Squishy Norbert Blocks render as blue or green flippable pixel cuboids", () => {
  const blue = createStationObject("squishy-norbert-block", 1, "squishy-norbert-blue");
  const green = { ...blue, squishyNorbertBlockColor: "green" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("squishy-norbert-preview"), objects: [green] }} label="Squishy Norbert" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("squishy-norbert-maker"), objects: [green] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece squishy-norbert-block"/);
  assert.match(preview, /class="station-cuboid-sprite squishy-norbert-block-sprite green"/);
  assert.match(preview, /class="station-cuboid-top green"/);
  assert.doesNotMatch(preview, />SQUISHY NORBERT BLOCK</);
  assert.match(maker, />SQUISHY NORBERT BLOCK</);
  assert.match(maker, /<option value="blue">BLUE<\/option><option value="green" selected="">GREEN<\/option>/);
  assert.match(maker, /GREEN · FACE: 3\/6 · 36 IN × 24 IN TOP · 21 IN TALL/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Small Green Norbert Blocks render as fixed-green flippable pixel cuboids", () => {
  const block = createStationObject("small-green-norbert-block", 1, "small-green-norbert");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("small-green-norbert-preview"), objects: [block] }} label="Small Green Norbert" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("small-green-norbert-maker"), objects: [block] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece small-green-norbert-block"/);
  assert.match(preview, /class="station-cuboid-sprite small-green-norbert-block-sprite"/);
  assert.match(preview, /class="station-cuboid-top green"/);
  assert.doesNotMatch(preview, />SMALL GREEN NORBERT BLOCK</);
  assert.match(maker, />SMALL GREEN NORBERT BLOCK</);
  assert.match(maker, /GREEN · FACE: 3\/6 · 24 IN × 21 IN TOP · 8.5 IN TALL/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Blue, Green, and Mini Red Norbert Blocks render as distinct fixed-color flippable cuboids", () => {
  const blue = createStationObject("blue-norbert-block", 1, "blue-norbert-block");
  const green = createStationObject("green-norbert-block", 2, "green-norbert-block");
  const miniRed = createStationObject("mini-red-norbert-block", 3, "mini-red-norbert-block");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("new-norbert-preview"), objects: [blue, green, miniRed] }} label="New Norbert Blocks" />);
  const makers = [blue, green, miniRed].map((block) => renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup(`${block.id}-maker`), objects: [block] }} onSave={() => undefined} onCancel={() => undefined} />));

  assert.match(preview, /class="station-cuboid-sprite blue-norbert-block-sprite"/);
  assert.match(preview, /class="station-cuboid-sprite green-norbert-block-sprite"/);
  assert.match(preview, /class="station-cuboid-sprite mini-red-norbert-block-sprite"/);
  assert.match(preview, /class="station-cuboid-top blue"/);
  assert.match(preview, /class="station-cuboid-top green"/);
  assert.match(preview, /class="station-cuboid-top red"/);
  assert.match(makers[0], /BLUE · FACE: 3\/6 · 42 IN × 24 IN TOP · 8 IN TALL/);
  assert.match(makers[1], /GREEN · FACE: 3\/6 · 36 IN × 24 IN TOP · 17 IN TALL/);
  assert.match(makers[2], /RED · FACE: 3\/6 · 24 IN × 14 IN TOP · 8 IN TALL/);
  assert.ok(makers.every((maker) => (maker.match(/FLIP FACE/g) ?? []).length === 2));
});

test("Cartwheel Mats render their pale-yellow lengthwise center stripe and every documented color", () => {
  const blue = createStationObject("cartwheel-mat", 1, "cartwheel-blue");
  const lightBlue = { ...blue, cartwheelMatColor: "light-blue" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("cartwheel-preview"), objects: [lightBlue] }} label="Cartwheel Mat" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("cartwheel-maker"), objects: [lightBlue] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece cartwheel-mat"/);
  assert.match(preview, /class="cartwheel-mat-sprite light-blue"/);
  assert.match(preview, /class="station-cuboid-top light-blue"/);
  assert.match(preview, /class="cartwheel-mat-center-line"/);
  assert.doesNotMatch(preview, />CARTWHEEL MAT</);
  assert.match(maker, />CARTWHEEL MAT</);
  assert.match(maker, /<option value="blue">BLUE<\/option><option value="pink">PINK<\/option><option value="light-blue" selected="">LIGHT BLUE<\/option><option value="dark-blue">DARK BLUE<\/option><option value="purple">PURPLE<\/option>/);
  assert.match(maker, /LIGHT BLUE · PALE YELLOW CENTER STRIPE · FACE: 3\/6 · PHYSICAL FACE · 72 IN × 24 IN TOP · 0.5 IN TALL/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("Stairs render as a literal red, blue, and yellow two-step trainer", () => {
  const stairs = createStationObject("stairs", 1, "stairs");
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("stairs-preview"), objects: [stairs] }} label="Stairs" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("stairs-maker"), objects: [stairs] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece stairs"/);
  assert.match(preview, /class="stairs-sprite"/);
  assert.match(preview, /class="stairs-red-top"/);
  assert.match(preview, /class="stairs-blue"/);
  assert.match(preview, /class="stairs-yellow"/);
  assert.doesNotMatch(preview, />STAIRS</);
  assert.match(maker, />STAIRS</);
  assert.match(maker, /RED TREADS · BLUE TALL STEP · YELLOW LOWER STEP · 24 IN × 24 IN BASE · 18 IN TALL · NO FLIP/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 0);
});

test("Velcro Beams render as thin physical cuboids with all five requested cover colors", () => {
  const beam = { ...createStationObject("velcro-beam", 1, "velcro-beam"), velcroBeamColor: "orange" as const };
  const preview = renderToStaticMarkup(<StationPreview setup={{ ...createStationSetup("velcro-beam-preview"), objects: [beam] }} label="Velcro Beam" />);
  const maker = renderToStaticMarkup(<StationMakerDialog setup={{ ...createStationSetup("velcro-beam-maker"), objects: [beam] }} onSave={() => undefined} onCancel={() => undefined} />);

  assert.match(preview, /class="station-piece velcro-beam"/);
  assert.match(preview, /class="station-cuboid-sprite velcro-beam-sprite orange"/);
  assert.match(preview, /class="station-cuboid-top orange"/);
  assert.doesNotMatch(preview, />VELCRO BEAM</);
  assert.match(maker, />VELCRO BEAM</);
  assert.match(maker, /<option value="red">RED<\/option><option value="orange" selected="">ORANGE<\/option><option value="yellow">YELLOW<\/option><option value="green">GREEN<\/option><option value="blue">BLUE<\/option>/);
  assert.match(maker, /ORANGE · 8 FT × 4 IN · 0.5 IN THICK \(PROVISIONAL\) · FACE: 3\/6 · 96 IN × 4 IN TOP · 0.5 IN TALL/);
  assert.equal((maker.match(/FLIP FACE/g) ?? []).length, 2);
});

test("cropped station previews render a repositioned inner board", () => {
  const setup = { ...createStationSetup("cropped-preview"), crop: { x: 240, y: 160, width: 480, height: 320 }, objects: [createStationObject("panel", 1, "panel")] };
  const markup = renderToStaticMarkup(<StationPreview setup={setup} label="Cropped station" />);
  assert.match(markup, /class="station-preview-board"/);
  assert.match(markup, /left:-50%;top:-50%;width:200%;height:200%/);
});
