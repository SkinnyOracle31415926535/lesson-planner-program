import assert from "node:assert/strict";
import test from "node:test";
import {
  gymPanelLayout,
  isPointInsideStationBoardFrame,
  stationBoardAnchorPoint,
  stationBoardCallouts,
  type StationBoardCallout,
  type StationBoardReference,
} from "../app/gym-layout";

const referencePanelIds = [
  "f6", "wr", "sr-ph", "rings", "ph", "hb", "pb", "pb-hb",
  "beam-1", "beam-2", "beam-all", "beam", "fx", "fx-ts", "f5", "ts",
  "vault", "pit-pb", "pit-highbar-rings-pb", "ub1-ub2-strap", "pit-strap",
  "trampoline", "tumble-track", "ub3", "preschool",
];

type Rect = { left: number; top: number; width: number; height: number };

function overlaps(first: Rect, second: Rect): boolean {
  return first.left < second.left + second.width
    && first.left + first.width > second.left
    && first.top < second.top + second.height
    && first.top + first.height > second.top;
}

function calloutRect(callout: StationBoardCallout): Rect {
  return {
    left: callout.labelLeft - callout.labelWidth / 2,
    top: callout.labelTop - callout.labelHeight / 2,
    width: callout.labelWidth,
    height: callout.labelHeight,
  };
}

function sourceFrame(referenceBoard: StationBoardReference): Rect {
  const sourceAspect = referenceBoard.width / referenceBoard.height;
  const canvasAspect = 16 / 10;
  if (sourceAspect < canvasAspect) {
    const width = (sourceAspect / canvasAspect) * 100;
    return { left: (100 - width) / 2, top: 0, width, height: 100 };
  }
  const height = (canvasAspect / sourceAspect) * 100;
  return { left: 0, top: (100 - height) / 2, width: 100, height };
}

function points(path: string): Array<{ x: number; y: number }> {
  return path.split(" ").map((point) => {
    const [x, y] = point.split(",").map(Number);
    return { x, y };
  });
}

type Point = { x: number; y: number };

function cross(first: Point, second: Point): number {
  return first.x * second.y - first.y * second.x;
}

function subtract(first: Point, second: Point): Point {
  return { x: first.x - second.x, y: first.y - second.y };
}

function segmentsConflict(firstStart: Point, firstEnd: Point, secondStart: Point, secondEnd: Point): boolean {
  const firstVector = subtract(firstEnd, firstStart);
  const secondVector = subtract(secondEnd, secondStart);
  const betweenStarts = subtract(secondStart, firstStart);
  const denominator = cross(firstVector, secondVector);
  const epsilon = 0.001;

  if (Math.abs(denominator) < epsilon) {
    if (Math.abs(cross(betweenStarts, firstVector)) >= epsilon) return false;
    const axis = Math.abs(firstVector.x) >= Math.abs(firstVector.y) ? "x" : "y";
    const firstMinimum = Math.min(firstStart[axis], firstEnd[axis]);
    const firstMaximum = Math.max(firstStart[axis], firstEnd[axis]);
    const secondMinimum = Math.min(secondStart[axis], secondEnd[axis]);
    const secondMaximum = Math.max(secondStart[axis], secondEnd[axis]);
    return Math.min(firstMaximum, secondMaximum) - Math.max(firstMinimum, secondMinimum) > epsilon;
  }

  const firstRatio = cross(betweenStarts, secondVector) / denominator;
  const secondRatio = cross(betweenStarts, firstVector) / denominator;
  if (firstRatio < -epsilon || firstRatio > 1 + epsilon || secondRatio < -epsilon || secondRatio > 1 + epsilon) return false;
  const firstIsEndpoint = firstRatio < epsilon || firstRatio > 1 - epsilon;
  const secondIsEndpoint = secondRatio < epsilon || secondRatio > 1 - epsilon;
  return !(firstIsEndpoint && secondIsEndpoint);
}

function pathsConflict(first: string, second: string): boolean {
  const firstPoints = points(first);
  const secondPoints = points(second);
  return firstPoints.slice(0, -1).some((start, index) => (
    secondPoints.slice(0, -1).some((otherStart, otherIndex) => (
      segmentsConflict(start, firstPoints[index + 1], otherStart, secondPoints[otherIndex + 1])
    ))
  ));
}

function assertNoCollisions(callouts: Record<string, StationBoardCallout>) {
  const entries = Object.entries(callouts);
  entries.forEach(([id, callout], index) => {
    entries.slice(index + 1).forEach(([otherId, other]) => {
      assert.equal(
        overlaps(calloutRect(callout), calloutRect(other)),
        false,
        `${id} overlaps ${otherId}`,
      );
    });
  });
}

function assertNoConnectorConflicts(callouts: Record<string, StationBoardCallout>) {
  const entries = Object.entries(callouts);
  entries.forEach(([id, callout], index) => {
    entries.slice(index + 1).forEach(([otherId, other]) => {
      assert.equal(
        pathsConflict(callout.path, other.path),
        false,
        id + " connector conflicts with " + otherId,
      );
    });
  });
}

test("station-board solver keeps every contract anchor separately tappable across readable text sizes", () => {
  referencePanelIds.forEach((panelId) => {
    const layout = gymPanelLayout(panelId);
    assert.ok(layout?.referenceBoard, `${panelId} should retain its supplied reference board`);
    if (!layout || !layout.referenceBoard || !layout.anchors.length) return;

    const labels = [
      "Hold shape",
      "Shoulders over hands",
      "Long visual label with whole word wrapping only",
      "HandstandBalanceProgressionCue",
    ];
    const callouts = stationBoardCallouts(
      layout.anchors.map((anchor, index) => ({
        id: anchor.id,
        anchor,
        label: labels[index % labels.length],
        fontSize: [7, 9, 11, 13][index % 4],
      })),
      layout.viewport,
      layout.referenceBoard,
    );

    assert.equal(Object.keys(callouts).length, layout.anchors.length, `${panelId} lost a placement anchor`);
    assertNoCollisions(callouts);

    const frame = sourceFrame(layout.referenceBoard);
    Object.values(callouts).forEach((callout) => {
      const label = calloutRect(callout);
      if (!callout.usesInsideSafeRegion) {
        assert.equal(overlaps(label, frame), false, `${panelId} put an outside-first label over source art`);
        const route = points(callout.path);
        const edge = route.at(-2);
        const target = route.at(-1);
        assert.ok(edge && target && route.length >= 4, `${panelId} lost its edge-routed connector`);
        assert.ok(
          Math.abs(edge.x - frame.left) < 0.001
            || Math.abs(edge.x - (frame.left + frame.width)) < 0.001
            || Math.abs(edge.y - frame.top) < 0.001
            || Math.abs(edge.y - (frame.top + frame.height)) < 0.001,
          `${panelId} connector does not enter the art at its border`,
        );
        assert.equal(target.x, callout.targetLeft);
        assert.equal(target.y, callout.targetTop);
      }
    });
  });
});

test("tomorrow's board callouts keep every connector on its own track at all supported text sizes", () => {
  ["pb-hb", "sr-ph", "ts"].forEach((panelId) => {
    const layout = gymPanelLayout(panelId);
    assert.ok(layout?.referenceBoard, `${panelId} should retain its supplied reference board`);
    if (!layout?.referenceBoard) return;

    [7, 9, 11, 13].forEach((fontSize) => {
      const callouts = stationBoardCallouts(
        layout.anchors.map((anchor, index) => ({
          id: anchor.id,
          anchor,
          label: `Station ${index + 1} readable label`,
          fontSize,
        })),
        layout.viewport,
        layout.referenceBoard,
      );
      assertNoCollisions(callouts);
      assertNoConnectorConflicts(callouts);
    });
  });
});

test("browser-local spot overlays land on the exact supplied-board anchor", () => {
  ["pb-hb", "sr-ph", "ts"].forEach((panelId) => {
    const layout = gymPanelLayout(panelId);
    assert.ok(layout?.referenceBoard, `${panelId} should retain its supplied reference board`);
    if (!layout?.referenceBoard) return;

    layout.anchors.forEach((anchor) => {
      const point = stationBoardAnchorPoint(anchor, layout.viewport, layout.referenceBoard);
      const callout = stationBoardCallouts(
        [{ id: anchor.id, anchor, label: "Spot" }],
        layout.viewport,
        layout.referenceBoard,
      )[anchor.id];
      assert.ok(callout, `${panelId} should project ${anchor.id}`);
      if (!callout) return;
      assert.equal(isPointInsideStationBoardFrame(point, layout.referenceBoard), true, `${panelId} moved ${anchor.id} outside its source image`);
      assert.ok(Math.abs(point.x * 100 - callout.targetLeft) < 0.001, `${panelId} x projection drifted for ${anchor.id}`);
      assert.ok(Math.abs(point.y * 100 - callout.targetTop) < 0.001, `${panelId} y projection drifted for ${anchor.id}`);
    });
  });
});

test("dense labels continue into an exterior lane instead of overlapping", () => {
  const layout = gymPanelLayout("pb-hb");
  assert.ok(layout?.referenceBoard && layout.anchors[0]);
  if (!layout?.referenceBoard || !layout.anchors[0]) return;

  const callouts = stationBoardCallouts(
    Array.from({ length: 26 }, (_, index) => ({
      id: `stress-${index}`,
      anchor: layout.anchors[0],
      label: `Station ${index + 1} long readable coaching label`,
      fontSize: [7, 9, 11, 13][index % 4],
    })),
    layout.viewport,
    layout.referenceBoard,
  );

  assert.equal(Object.keys(callouts).length, 26);
  assertNoCollisions(callouts);
  assert.ok(Object.values(callouts).some((callout) => callout.usesExternalLane));
});
