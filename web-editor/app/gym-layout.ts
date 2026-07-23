import placementAnchorRegistry from "../../contracts/gym-layout-placement-anchors.json";
import freeformGeometryDraft from "../../contracts/gym-layout-geometry-draft.json";
import type { CSSProperties } from "react";

/**
 * Browser adapter for the owner-supplied gym layout contracts.
 *
 * The physical art itself is `public/gym-layout-skeleton.png`, while this
 * module only describes which clean crop and which one-item label anchors
 * belong to each browser-local station selector. Keeping those concerns
 * separate is what lets normal lesson view stay uncluttered.
 */

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GymPlacementAnchor = {
  id: string;
  zoneIds: string[];
  rect: NormalizedRect;
};

export type GymPanelLayout = {
  /** The semantic gym zones represented by one browser-local panel. */
  semanticZoneIds: string[];
  /** True only when every selected semantic zone has Skeleton Freeform bounds. */
  usesFreeformGeometry: boolean;
  /** A source-derived crop may still be explicitly marked for owner review. */
  requiresGeometryReview: boolean;
  geometryReviewNote?: string;
  /** An owner-supplied, already-cropped station board. This takes precedence
   * over dynamically cropping the larger Skeleton image for presentation. */
  referenceBoard?: StationBoardReference;
  /** A readable, aspect-preserving crop of the clean Skeleton gym image. */
  viewport: NormalizedRect;
  /** The one-item label slots that are eligible in this panel. */
  anchors: GymPlacementAnchor[];
};

export type StationBoardReference = {
  src: string;
  width: number;
  height: number;
  description: string;
};

export type StationBoardCallout = {
  /** The actual source-derived anchor position inside the compact canvas. */
  targetLeft: number;
  targetTop: number;
  /** The readable label position, kept in a blue gutter when possible. */
  labelLeft: number;
  labelTop: number;
  labelWidth: number;
  labelHeight: number;
  /** A rare near-full-frame board uses the reserved lower blue callout lane. */
  usesExternalLane: boolean;
  /** True only when a verified low-detail interior safe region was chosen. */
  usesInsideSafeRegion: boolean;
  path: string;
  style: CSSProperties;
};

export type StationBoardCalloutInput = {
  id: string;
  anchor: GymPlacementAnchor;
  label: string;
  /** Supported by the solver test harness and iPad readability scaling. */
  fontSize?: number;
};

type RegistryViewport = {
  zoneId: string;
  anchorLayerViewport: {
    kind: "rect" | "multi_rect";
    rect?: NormalizedRect;
    rects?: NormalizedRect[];
  };
};

const SOURCE_ASPECT_RATIO = 2200 / 1900;
/**
 * Every direct station picture fits inside the same compact planning canvas.
 * The canvas is deliberately independent of the source image ratio: a
 * Tumble Strip should not make a lesson plan several screens tall, and a
 * panoramic PB/HB board should not force a full-width row. The inner picture
 * still keeps its exact ratio and is never cropped.
 */
const STATION_BOARD_CANVAS_ASPECT = 16 / 10;
const STATION_BOARD_CANVAS_MAX_WIDTH = 600;

const anchors = placementAnchorRegistry.anchors as GymPlacementAnchor[];
const viewports = placementAnchorRegistry.zoneViewports as RegistryViewport[];

type FreeformGeometry = {
  kind: "container" | "rect" | "multi-rect";
  rect?: NormalizedRect;
  rects?: NormalizedRect[];
  confidence?: "high" | "medium" | "low";
  reviewRequired?: string;
};

const freeformGeometry = freeformGeometryDraft.geometry as Record<string, FreeformGeometry>;
const NEUTRAL_ANCHOR_VIEWPORT: NormalizedRect = { x: 0, y: 0, width: 1000, height: 1000 };

/**
 * The current browser demo used short station IDs before the semantic gym
 * registry was introduced. This intentional bridge keeps saved local lessons
 * working while giving each selector the right physical source area.
 */
const semanticZoneIdsByPanelId: Record<string, string[]> = {
  // `f6` is the owner-facing station name for the existing local Ninja-area
  // anchor set. Keep that semantic bridge narrow until schedule aliases are
  // separately reviewed.
  f6: ["zone-ninja-room"],
  wr: ["zone-wr"],
  "pb-hb": ["zone-parallel-bars", "zone-high-bar-boys-bar"],
  "sr-ph": ["zone-still-rings", "zone-pommel-horse"],
  hb: ["zone-high-bar-boys-bar"],
  pb: ["zone-parallel-bars"],
  ph: ["zone-pommel-horse"],
  ts: ["zone-tumble-strip"],
  "fx-ts": ["zone-floor-f4", "zone-floor-f3", "zone-floor-f2", "zone-floor-f1", "zone-tumble-strip"],
  fx: ["zone-floor-f4", "zone-floor-f3", "zone-floor-f2", "zone-floor-f1"],
  f1: ["zone-floor-f1"],
  f2: ["zone-floor-f2"],
  f3: ["zone-floor-f3"],
  f4: ["zone-floor-f4"],
  f5: ["zone-floor-f5"],
  "strap-bar": ["zone-strap-bar"],
  rings: ["zone-still-rings"],
  vault: ["zone-vault"],
  "beam-1": ["zone-beam-1"],
  "beam-2": ["zone-beam-2-a", "zone-beam-2-b"],
  "beam-all": ["zone-beam-1", "zone-beam-2-a", "zone-beam-2-b"],
  "pit-pb": ["zone-pit-pb"],
  "pit-highbar-rings-pb": ["zone-pit-rings-high-bar", "zone-pit-pb"],
  "ub1-ub2-strap": ["zone-ub-1", "zone-ub-2", "zone-strap-bar"],
  "pit-strap": ["zone-pit-pb", "zone-pit-rings-high-bar", "zone-strap-bar"],
  trampoline: ["zone-trampoline"],
  "tumble-track": ["zone-tumble-track"],
  ub3: ["zone-ub-3"],
  preschool: ["zone-preschool"],
  // The browser prototype still has one "Beam" selector. Show every known
  // beam location rather than silently treating the provisional A/B records
  // as one physical location.
  beam: ["zone-beam-1", "zone-beam-2-a", "zone-beam-2-b"],
};

/**
 * These are the exact cropped boards the owner supplied for station use.
 * Their intrinsic dimensions are deliberately retained: `object-fit: cover`
 * would recreate the very crop problem this registry replaces.
 */
const referenceBoardsByPanelId: Record<string, StationBoardReference> = {
  f6: { src: "station-boards/f6.png", width: 632, height: 811, description: "F6" },
  wr: { src: "station-boards/wr.png", width: 419, height: 805, description: "Weight room" },
  "sr-ph": { src: "station-boards/sr-ph.png", width: 779, height: 601, description: "Still Rings and Pommel Horse" },
  rings: { src: "station-boards/sr.png", width: 222, height: 620, description: "Still Rings" },
  ph: { src: "station-boards/ph.png", width: 582, height: 569, description: "Pommel Horse" },
  hb: { src: "station-boards/hb.png", width: 509, height: 545, description: "High Bar" },
  pb: { src: "station-boards/pb.png", width: 1299, height: 385, description: "Parallel Bars" },
  "pb-hb": { src: "station-boards/pb-hb.png", width: 1767, height: 533, description: "Parallel Bars and High Bar" },
  "beam-1": { src: "station-boards/beam-1.png", width: 392, height: 371, description: "Beam 1" },
  "beam-2": { src: "station-boards/beam-2.png", width: 238, height: 143, description: "Beam 2" },
  "beam-all": { src: "station-boards/beam-all.png", width: 616, height: 373, description: "All beams" },
  beam: { src: "station-boards/beam-all.png", width: 616, height: 373, description: "All beams" },
  fx: { src: "station-boards/fx.png", width: 531, height: 530, description: "Full floor" },
  "fx-ts": { src: "station-boards/fx-ts.png", width: 618, height: 550, description: "Floor and Tumble Strip" },
  f5: { src: "station-boards/f5.png", width: 553, height: 176, description: "Floor 5" },
  ts: { src: "station-boards/ts.png", width: 112, height: 551, description: "Tumble Strip" },
  vault: { src: "station-boards/vault.png", width: 135, height: 726, description: "Vault" },
  "pit-pb": { src: "station-boards/pit-pb.png", width: 279, height: 330, description: "Pit Parallel Bars" },
  "pit-highbar-rings-pb": { src: "station-boards/pit-highbar-rings-pb.png", width: 479, height: 333, description: "Pit High Bar, Rings, and Parallel Bars" },
  "ub1-ub2-strap": { src: "station-boards/ub1-ub2-strap.png", width: 513, height: 277, description: "UB1, UB2, and Strap Bar" },
  "pit-strap": { src: "station-boards/pit-strap.png", width: 742, height: 354, description: "Pit and Strap Bar" },
  trampoline: { src: "station-boards/trampoline.png", width: 317, height: 289, description: "Trampoline" },
  "tumble-track": { src: "station-boards/tumble-track.png", width: 613, height: 163, description: "Tumble Track" },
  ub3: { src: "station-boards/ub3.png", width: 252, height: 165, description: "UB3" },
  preschool: { src: "station-boards/preschool.png", width: 307, height: 395, description: "Preschool" },
};

function freeformRectsForZone(zoneId: string): NormalizedRect[] {
  const entry = freeformGeometry[zoneId];
  if (!entry) return [];
  if ((entry.kind === "rect" || entry.kind === "container") && entry.rect) return [entry.rect];
  return entry.rects ?? [];
}

function anchorOverlayViewportRectsForZone(zoneId: string): NormalizedRect[] {
  const entry = viewports.find((candidate) => candidate.zoneId === zoneId);
  if (!entry) return [];
  if (entry.anchorLayerViewport.kind === "rect" && entry.anchorLayerViewport.rect) {
    return [entry.anchorLayerViewport.rect];
  }
  return entry.anchorLayerViewport.rects ?? [];
}

function unionRects(rects: NormalizedRect[]): NormalizedRect | null {
  if (!rects.length) return null;
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

type SkeletonAnchorComponent = {
  source: NormalizedRect;
  target: NormalizedRect;
};

function anchorComponentsForZone(zoneId: string): SkeletonAnchorComponent[] {
  const sourceRects = anchorOverlayViewportRectsForZone(zoneId);
  const targetRects = freeformRectsForZone(zoneId);
  return sourceRects.flatMap((source, index) => {
    const target = targetRects[index];
    return target ? [{ source, target }] : [];
  });
}

function distanceSquaredToRect(x: number, y: number, rect: NormalizedRect): number {
  const nearestX = Math.min(Math.max(x, rect.x), rect.x + rect.width);
  const nearestY = Math.min(Math.max(y, rect.y), rect.y + rect.height);
  return (x - nearestX) ** 2 + (y - nearestY) ** 2;
}

function repairedSourceRect(nominal: NormalizedRect, componentAnchors: GymPlacementAnchor[]): NormalizedRect {
  const hasOutlier = componentAnchors.some((anchor) => (
    anchor.rect.x < nominal.x
    || anchor.rect.y < nominal.y
    || anchor.rect.x + anchor.rect.width > nominal.x + nominal.width
    || anchor.rect.y + anchor.rect.height > nominal.y + nominal.height
  ));
  if (!hasOutlier) return nominal;
  const bounds = unionRects(componentAnchors.map((anchor) => anchor.rect)) ?? nominal;
  return {
    x: bounds.x,
    y: bounds.y,
    width: Math.max(bounds.width, nominal.width * 0.12),
    height: Math.max(bounds.height, nominal.height * 0.12),
  };
}

function projectRect(rect: NormalizedRect, source: NormalizedRect, target: NormalizedRect): NormalizedRect {
  const scaleX = target.width / source.width;
  const scaleY = target.height / source.height;
  return {
    x: target.x + (rect.x - source.x) * scaleX,
    y: target.y + (rect.y - source.y) * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

/**
 * Projects a yellow placement grid - never its PDF equipment drawing - into
 * the matching Skeleton Freeform component. If a PDF anchor was rendered
 * outside its named zone (F3 is the known case), the whole component is
 * rebased to the grid's own extent so every durable spot remains tappable.
 */
function normalizedAnchorsForSemanticZones(semanticZoneIds: string[]): Map<string, GymPlacementAnchor> {
  const normalizedById = new Map<string, GymPlacementAnchor>();

  semanticZoneIds.forEach((zoneId) => {
    const components = anchorComponentsForZone(zoneId);
    const zoneAnchors = anchors.filter((anchor) => anchor.zoneIds.includes(zoneId));
    if (!components.length || !zoneAnchors.length) return;

    const assigned = components.map(() => [] as GymPlacementAnchor[]);
    zoneAnchors.forEach((anchor) => {
      const centerX = anchor.rect.x + anchor.rect.width / 2;
      const centerY = anchor.rect.y + anchor.rect.height / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      components.forEach((component, index) => {
        const distance = distanceSquaredToRect(centerX, centerY, component.source);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      assigned[nearestIndex].push(anchor);
    });

    assigned.forEach((componentAnchors, index) => {
      if (!componentAnchors.length) return;
      const component = components[index];
      const source = repairedSourceRect(component.source, componentAnchors);
      componentAnchors.forEach((anchor) => {
        normalizedById.set(anchor.id, { ...anchor, rect: projectRect(anchor.rect, source, component.target) });
      });
    });
  });

  return normalizedById;
}

/**
 * The anchor PDF gives a useful relative label arrangement, but not the
 * physical proportions of an unmapped station. Rebase the labels into an
 * intentionally neutral square board so a fallback can never imply that its
 * size or shape came from the PDF gym drawing.
 */
function anchorsForNeutralLayer(panelAnchors: GymPlacementAnchor[]): GymPlacementAnchor[] {
  const bounds = unionRects(panelAnchors.map((anchor) => anchor.rect));
  if (!bounds) return panelAnchors;

  const safeWidth = Math.max(bounds.width, 1);
  const safeHeight = Math.max(bounds.height, 1);
  return panelAnchors.map((anchor) => {
    const centerX = (anchor.rect.x + anchor.rect.width / 2 - bounds.x) / safeWidth;
    const centerY = (anchor.rect.y + anchor.rect.height / 2 - bounds.y) / safeHeight;
    const width = Math.max(48, Math.min(150, (anchor.rect.width / safeWidth) * 840));
    const height = Math.max(38, Math.min(130, (anchor.rect.height / safeHeight) * 840));
    return {
      ...anchor,
      rect: {
        // A small neutral margin keeps a compact placed label readable at an
        // edge without claiming any physical relationship to the gym.
        x: 80 + centerX * 840 - width / 2,
        y: 80 + centerY * 840 - height / 2,
        width,
        height,
      },
    };
  });
}

/**
 * Exact zone crops can be impossibly skinny (for example a tumble-strip
 * lane) or too shallow to read a short placed label. This expands only the
 * surrounding image context - never the eligible anchors - without warping
 * the owner-drawn gym art.
 */
function makeReadableViewport(rect: NormalizedRect): NormalizedRect {
  const minimumDisplayAspect = 0.72;
  const maximumDisplayAspect = 3.1;
  let { x, y, width, height } = rect;
  let displayAspect = (width * SOURCE_ASPECT_RATIO) / height;

  if (displayAspect < minimumDisplayAspect) {
    const targetWidth = Math.min(1000, (height * minimumDisplayAspect) / SOURCE_ASPECT_RATIO);
    const horizontalInset = (targetWidth - width) / 2;
    x = Math.max(0, Math.min(1000 - targetWidth, x - horizontalInset));
    width = targetWidth;
    displayAspect = (width * SOURCE_ASPECT_RATIO) / height;
  }

  if (displayAspect > maximumDisplayAspect) {
    const targetHeight = Math.min(1000, (width * SOURCE_ASPECT_RATIO) / maximumDisplayAspect);
    const verticalInset = (targetHeight - height) / 2;
    y = Math.max(0, Math.min(1000 - targetHeight, y - verticalInset));
    height = targetHeight;
  }

  return { x, y, width, height };
}

export function gymPanelLayout(panelId: string): GymPanelLayout | null {
  const semanticZoneIds = semanticZoneIdsByPanelId[panelId];
  if (!semanticZoneIds?.length) return null;

  const referenceBoard = referenceBoardsByPanelId[panelId];

  const zoneSet = new Set(semanticZoneIds);
  const usesFreeformGeometry = semanticZoneIds.every((zoneId) => freeformRectsForZone(zoneId).length > 0);
  const normalizedAnchors = usesFreeformGeometry
    ? normalizedAnchorsForSemanticZones(semanticZoneIds)
    : new Map<string, GymPlacementAnchor>();
  const sourcePanelAnchors = anchors
    .filter((anchor) => anchor.zoneIds.some((zoneId) => zoneSet.has(zoneId)))
    .map((anchor) => normalizedAnchors.get(anchor.id) ?? anchor);
  const physicalViewport = usesFreeformGeometry
    ? unionRects(semanticZoneIds.flatMap(freeformRectsForZone))
    : null;
  if (usesFreeformGeometry && !physicalViewport) return null;
  if (!usesFreeformGeometry && !sourcePanelAnchors.length) return null;

  const reviewNotes = semanticZoneIds
    .map((zoneId) => freeformGeometry[zoneId]?.reviewRequired)
    .filter((note): note is string => Boolean(note));
  // The owner-supplied station board is the intended visual presentation for
  // this local editor, so it does not carry the older dynamic-crop warning.
  const requiresGeometryReview = usesFreeformGeometry && !referenceBoard && reviewNotes.length > 0;

  return {
    semanticZoneIds,
    usesFreeformGeometry,
    requiresGeometryReview,
    geometryReviewNote: requiresGeometryReview ? reviewNotes.join(" ") : undefined,
    referenceBoard,
    viewport: physicalViewport ? makeReadableViewport(physicalViewport) : NEUTRAL_ANCHOR_VIEWPORT,
    anchors: usesFreeformGeometry ? sourcePanelAnchors : anchorsForNeutralLayer(sourcePanelAnchors),
  };
}

export function panelAnchorIds(panelId: string): string[] {
  return gymPanelLayout(panelId)?.anchors.map((anchor) => anchor.id) ?? [];
}

export function anchorForPanel(panelId: string, anchorId: string): GymPlacementAnchor | null {
  return gymPanelLayout(panelId)?.anchors.find((anchor) => anchor.id === anchorId) ?? null;
}

export function imageStyleForViewport(viewport: NormalizedRect): CSSProperties {
  return {
    width: `${(1000 / viewport.width) * 100}%`,
    left: `${(-viewport.x / viewport.width) * 100}%`,
    top: `${(-viewport.y / viewport.height) * 100}%`,
  };
}

export function canvasAspectRatio(viewport: NormalizedRect): string {
  return `${viewport.width * 2200} / ${viewport.height * 1900}`;
}

type StationBoardFrameMetrics = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function stationBoardFrameMetrics(referenceBoard: StationBoardReference): StationBoardFrameMetrics {
  const sourceAspect = referenceBoard.width / referenceBoard.height;
  if (sourceAspect < STATION_BOARD_CANVAS_ASPECT) {
    const width = (sourceAspect / STATION_BOARD_CANVAS_ASPECT) * 100;
    return { width, height: 100, left: (100 - width) / 2, top: 0 };
  }

  const height = (STATION_BOARD_CANVAS_ASPECT / sourceAspect) * 100;
  return { width: 100, height, left: 0, top: (100 - height) / 2 };
}

/**
 * Gives every direct board the same compact lesson-plan footprint. The real
 * image is rendered inside a centered frame by `stationBoardFrameStyle`, so
 * this never crops, stretches, rotates, or substitutes supplied art.
 */
export function stationBoardCanvasStyle(): CSSProperties {
  return {
    width: "100%",
    maxWidth: `${STATION_BOARD_CANVAS_MAX_WIDTH}px`,
    aspectRatio: "16 / 10",
    marginInline: "auto",
  };
}

/**
 * Centers the exact-ratio board inside the fixed lesson-plan canvas. The
 * returned percentage frame is also used by `stationBoardAnchorStyle` to
 * project existing placement coordinates into the outer canvas, where labels
 * can be clamped safely inside the visible plan.
 */
export function stationBoardFrameStyle(referenceBoard: StationBoardReference): CSSProperties {
  const frame = stationBoardFrameMetrics(referenceBoard);
  return {
    width: `${frame.width}%`,
    height: `${frame.height}%`,
    left: `${frame.left}%`,
    top: `${frame.top}%`,
  };
}

/** Canvas-space frame bounds for a supplied station image inside its blue plan canvas. */
export function stationBoardFrameBounds(referenceBoard: StationBoardReference): NormalizedRect {
  const frame = stationBoardFrameMetrics(referenceBoard);
  return { x: frame.left, y: frame.top, width: frame.width, height: frame.height };
}

/**
 * Converts an immutable source anchor to the visible plan canvas. It is used
 * only for a browser-local overlay when a coach revises a station spot; the
 * underlying source anchor and owner-supplied image stay unchanged.
 */
export function stationBoardAnchorPoint(
  anchor: GymPlacementAnchor,
  viewport: NormalizedRect,
  referenceBoard?: StationBoardReference,
): { x: number; y: number } {
  const relativeLeft = (anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width;
  const relativeTop = (anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height;
  if (!referenceBoard) return { x: relativeLeft, y: relativeTop };
  const frame = stationBoardFrameMetrics(referenceBoard);
  return {
    x: (frame.left + relativeLeft * frame.width) / 100,
    y: (frame.top + relativeTop * frame.height) / 100,
  };
}

/** Keeps editable reference-board station spots on the uncropped source image. */
export function isPointInsideStationBoardFrame(
  point: { x: number; y: number },
  referenceBoard: StationBoardReference,
): boolean {
  const frame = stationBoardFrameMetrics(referenceBoard);
  const left = frame.left / 100;
  const top = frame.top / 100;
  const right = (frame.left + frame.width) / 100;
  const bottom = (frame.top + frame.height) / 100;
  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}

/**
 * Projects a placement anchor from its source/Freeform viewport through the
 * letterboxed direct-board frame and into the compact outer canvas. Labels
 * are deliberately children of that outer canvas, not a narrow image frame,
 * so their readable tap target can stay on-screen for TS, Vault, and SR.
 */
export function stationBoardAnchorStyle(
  anchor: GymPlacementAnchor,
  viewport: NormalizedRect,
  referenceBoard: StationBoardReference,
): CSSProperties {
  const frame = stationBoardFrameMetrics(referenceBoard);
  const relativeLeft = (anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width;
  const relativeTop = (anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height;
  const relativeWidth = anchor.rect.width / viewport.width;
  const relativeHeight = anchor.rect.height / viewport.height;
  const left = frame.left + relativeLeft * frame.width;
  const top = frame.top + relativeTop * frame.height;
  const width = relativeWidth * frame.width;
  const height = relativeHeight * frame.height;

  return {
    "--anchor-left": `${left}%`,
    "--anchor-top": `${top}%`,
    "--anchor-width": `${width}%`,
    "--anchor-height": `${height}%`,
  } as CSSProperties;
}

/**
 * Keeps a readable lesson label out of the supplied station image. The arrow
 * remains tied to the exact owner-defined anchor, while the button moves into
 * the letterboxed blue gutter around the non-cropped reference board.
 */
export function stationBoardCallout(
  anchor: GymPlacementAnchor,
  viewport: NormalizedRect,
  referenceBoard: StationBoardReference,
): StationBoardCallout {
  return stationBoardCallouts([{ id: anchor.id, anchor, label: "Idea" }], viewport, referenceBoard)[anchor.id];
}

type CalloutBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  side: "left" | "right" | "top" | "bottom" | "inside";
  /** Separate exterior track so two leaders never reuse an image-edge line. */
  track: number;
  /** The source edge used by the leader; defaults to the label's own side. */
  routeSide?: "left" | "right" | "top" | "bottom";
};
type CalloutPoint = { x: number; y: number };
type CalloutSide = CalloutBox["side"];

const stationBoardSafeRegionsByDescription: Record<string, NormalizedRect[]> = {
  // These are deliberately conservative open floor/background areas inside
  // owner-supplied images. The solver still chooses outside labels first.
  "Full floor": [{ x: 160, y: 160, width: 220, height: 190 }],
  "Floor and Tumble Strip": [{ x: 300, y: 240, width: 210, height: 250 }],
};

function labelBox(label: string, fontSize: number): { width: number; height: number } {
  const maxWidth = 136;
  const characterWidth = fontSize * 0.64;
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length * characterWidth > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  const widest = Math.max(...lines.map((entry) => entry.length * characterWidth), 42);
  return {
    // `shortAnchorLabel` limits the browser-facing title to whole words, so
    // retaining the natural width here protects a long single word without
    // ever relying on CSS to split it.
    width: Math.max(52, widest + 12),
    height: Math.max(28, lines.length * (fontSize * 1.22) + 12),
  };
}

function overlaps(first: CalloutBox, second: CalloutBox): boolean {
  return first.left < second.left + second.width + 3
    && first.left + first.width + 3 > second.left
    && first.top < second.top + second.height + 3
    && first.top + first.height + 3 > second.top;
}

function calloutPathPoints(
  box: CalloutBox,
  targetLeft: number,
  targetTop: number,
  frame: StationBoardFrameMetrics,
): CalloutPoint[] {
  const startX = box.left + box.width / 2;
  const startY = box.top + box.height / 2;
  if (box.side === "inside") return [{ x: startX, y: startY }, { x: targetLeft, y: targetTop }];
  const routeSide = box.routeSide ?? box.side;
  if (routeSide === "left" || routeSide === "right") {
    const edgeX = routeSide === "left" ? frame.left : frame.left + frame.width;
    const edgeY = Math.min(frame.top + frame.height, Math.max(frame.top, targetTop));
    const trackX = edgeX + (routeSide === "left" ? -1 : 1) * (8 + box.track * 10);
    return [
      { x: startX, y: startY },
      { x: trackX, y: startY },
      { x: trackX, y: edgeY },
      { x: edgeX, y: edgeY },
      { x: targetLeft, y: targetTop },
    ];
  }
  const edgeY = routeSide === "top" ? frame.top : frame.top + frame.height;
  const edgeX = Math.min(frame.left + frame.width, Math.max(frame.left, targetLeft));
  const trackY = edgeY + (routeSide === "top" ? -1 : 1) * (8 + box.track * 10);
  return [
    { x: startX, y: startY },
    { x: startX, y: trackY },
    { x: edgeX, y: trackY },
    { x: edgeX, y: edgeY },
    { x: targetLeft, y: targetTop },
  ];
}

function calloutPath(points: CalloutPoint[], boardWidth: number, boardHeight: number): string {
  return points.map((point) => `${point.x / boardWidth * 100},${point.y / boardHeight * 100}`).join(" ");
}

function cross(first: CalloutPoint, second: CalloutPoint): number {
  return first.x * second.y - first.y * second.x;
}

function subtract(first: CalloutPoint, second: CalloutPoint): CalloutPoint {
  return { x: first.x - second.x, y: first.y - second.y };
}

/**
 * Identifies a visible connector conflict: a proper crossing, a T-junction,
 * or reused/overlapping line track. A shared terminal point is allowed only
 * when it is an endpoint for both segments.
 */
function segmentsConflict(
  firstStart: CalloutPoint,
  firstEnd: CalloutPoint,
  secondStart: CalloutPoint,
  secondEnd: CalloutPoint,
): boolean {
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

function routeConflicts(first: CalloutPoint[], second: CalloutPoint[]): boolean {
  return first.slice(0, -1).some((start, index) => (
    second.slice(0, -1).some((otherStart, otherIndex) => (
      segmentsConflict(start, first[index + 1], otherStart, second[otherIndex + 1])
    ))
  ));
}

/**
 * A full board of occupied anchors needs a deterministic perimeter layout.
 * Each connector approaches through the nearest source edge, so the final
 * segment stays short. Labels on one edge are given independent outward
 * depth lanes; target entries preserve their physical order along that edge,
 * which prevents connectors from crossing each other.
 */
function denseStationBoardCallouts(
  inputs: StationBoardCalloutInput[],
  viewport: NormalizedRect,
  referenceBoard: StationBoardReference,
): Record<string, StationBoardCallout> {
  const frame = stationBoardFrameMetrics(referenceBoard);
  const boardWidth = 600;
  const boardHeight = 375;
  const framePixels = {
    left: (frame.left / 100) * boardWidth,
    top: (frame.top / 100) * boardHeight,
    width: (frame.width / 100) * boardWidth,
    height: (frame.height / 100) * boardHeight,
  };
  type DenseItem = {
    id: string;
    label: string;
    fontSize: number;
    target: CalloutPoint;
    side: "left" | "right" | "top" | "bottom";
    tangent: number;
    size: { width: number; height: number };
  };
  const items: DenseItem[] = inputs.map(({ id, anchor, label, fontSize = 9 }) => {
    const target = {
      x: framePixels.left + ((anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width) * framePixels.width,
      y: framePixels.top + ((anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height) * framePixels.height,
    };
    const distances: Array<[DenseItem["side"], number]> = [
      ["left", Math.abs(target.x - framePixels.left)],
      ["right", Math.abs(framePixels.left + framePixels.width - target.x)],
      ["top", Math.abs(target.y - framePixels.top)],
      ["bottom", Math.abs(framePixels.top + framePixels.height - target.y)],
    ];
    distances.sort((first, second) => first[1] - second[1] || first[0].localeCompare(second[0]));
    const side = distances[0][0];
    return {
      id,
      label,
      fontSize,
      target,
      side,
      tangent: side === "left" || side === "right" ? target.y : target.x,
      size: labelBox(label, fontSize),
    };
  });
  const output: Record<string, StationBoardCallout> = {};
  const used: CalloutBox[] = [];
  const sideOrder: DenseItem["side"][] = ["left", "right", "top", "bottom"];

  sideOrder.forEach((side) => {
    const group = items
      .filter((item) => item.side === side)
      .sort((first, second) => first.tangent - second.tangent || first.id.localeCompare(second.id));
    let depth = 12;
    let previousEntry = Number.NEGATIVE_INFINITY;
    const tangentMinimum = side === "left" || side === "right" ? framePixels.top : framePixels.left;
    const tangentMaximum = side === "left" || side === "right"
      ? framePixels.top + framePixels.height
      : framePixels.left + framePixels.width;

    group.forEach((item) => {
      const separation = Math.max(2, (side === "left" || side === "right" ? item.size.height : item.size.width) * 0.06);
      const entry = Math.min(tangentMaximum - 1, Math.max(tangentMinimum + 1, Math.max(item.tangent, previousEntry + separation)));
      previousEntry = entry;
      let box: CalloutBox;
      do {
        if (side === "left") {
          box = { left: framePixels.left - depth - item.size.width, top: entry - item.size.height / 2, width: item.size.width, height: item.size.height, side, track: 0 };
          depth += item.size.width + 8;
        } else if (side === "right") {
          box = { left: framePixels.left + framePixels.width + depth, top: entry - item.size.height / 2, width: item.size.width, height: item.size.height, side, track: 0 };
          depth += item.size.width + 8;
        } else if (side === "top") {
          box = { left: entry - item.size.width / 2, top: framePixels.top - depth - item.size.height, width: item.size.width, height: item.size.height, side, track: 0 };
          depth += item.size.height + 8;
        } else {
          box = { left: entry - item.size.width / 2, top: framePixels.top + framePixels.height + depth, width: item.size.width, height: item.size.height, side, track: 0 };
          depth += item.size.height + 8;
        }
      } while (used.some((other) => overlaps(box, other)));
      used.push(box);

      const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const edge = side === "left"
        ? { x: framePixels.left, y: entry }
        : side === "right"
          ? { x: framePixels.left + framePixels.width, y: entry }
          : side === "top"
            ? { x: entry, y: framePixels.top }
            : { x: entry, y: framePixels.top + framePixels.height };
      const bend = side === "left"
        ? { x: edge.x - 2, y: entry - 2 }
        : side === "right"
          ? { x: edge.x + 2, y: entry - 2 }
          : side === "top"
            ? { x: entry - 2, y: edge.y - 2 }
            : { x: entry - 2, y: edge.y + 2 };
      const outside = side === "left" || side === "right"
        ? { x: start.x, y: bend.y }
        : { x: bend.x, y: start.y };
      const pathPoints = [start, outside, bend, edge, item.target];
      const labelLeft = (box.left + box.width / 2) / boardWidth * 100;
      const labelTop = (box.top + box.height / 2) / boardHeight * 100;
      const labelWidth = box.width / boardWidth * 100;
      const labelHeight = box.height / boardHeight * 100;
      output[item.id] = {
        targetLeft: item.target.x / boardWidth * 100,
        targetTop: item.target.y / boardHeight * 100,
        labelLeft,
        labelTop,
        labelWidth,
        labelHeight,
        usesExternalLane: true,
        usesInsideSafeRegion: false,
        path: calloutPath(pathPoints, boardWidth, boardHeight),
        style: {
          "--callout-left": `${labelLeft}%`,
          "--callout-top": `${labelTop}%`,
          "--callout-width": `${labelWidth}%`,
          "--callout-font-size": `${item.fontSize}px`,
        } as CSSProperties,
      };
    });
  });
  return output;
}

/**
 * Batch layout for every visible label and active placement target on a board.
 * The previous one-label function could not see neighbouring labels. This
 * solver reserves a non-overlapping box for each item and sends the connector
 * along the image edge, leaving only its final short segment over the art.
 */
export function stationBoardCallouts(
  inputs: StationBoardCalloutInput[],
  viewport: NormalizedRect,
  referenceBoard: StationBoardReference,
): Record<string, StationBoardCallout> {
  if (inputs.length > 7) return denseStationBoardCallouts(inputs, viewport, referenceBoard);
  const frame = stationBoardFrameMetrics(referenceBoard);
  const boardWidth = 600;
  const boardHeight = 375;
  const framePixels = {
    left: (frame.left / 100) * boardWidth,
    top: (frame.top / 100) * boardHeight,
    width: (frame.width / 100) * boardWidth,
    height: (frame.height / 100) * boardHeight,
  };
  const used: CalloutBox[] = [];
  const routes: CalloutPoint[][] = [];
  const output: Record<string, StationBoardCallout> = {};
  const safeRegions = stationBoardSafeRegionsByDescription[referenceBoard.description] ?? [];
  const targetFor = (anchor: GymPlacementAnchor): CalloutPoint => ({
    x: framePixels.left
      + ((anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width) * framePixels.width,
    y: framePixels.top
      + ((anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height) * framePixels.height,
  });
  const nearestFrameEdgeDistance = (anchor: GymPlacementAnchor): number => {
    const target = targetFor(anchor);
    return Math.min(
      Math.abs(target.x - framePixels.left),
      Math.abs(framePixels.left + framePixels.width - target.x),
      Math.abs(target.y - framePixels.top),
      Math.abs(framePixels.top + framePixels.height - target.y),
    );
  };
  // Give edge-near anchors first choice. It prevents an inner label from
  // claiming the short external route an outer anchor needs, which otherwise
  // produces a forced shared line track later in the batch.
  const orderedInputs = [...inputs].sort((first, second) => (
    nearestFrameEdgeDistance(first.anchor) - nearestFrameEdgeDistance(second.anchor)
    || first.id.localeCompare(second.id)
 ));

  orderedInputs.forEach(({ id, anchor, label, fontSize = 9 }) => {
    const target = targetFor(anchor);
    const targetLeft = target.x;
    const targetTop = target.y;
    const size = labelBox(label, fontSize);
    // Prefer the source edge nearest the anchor. That keeps the one segment
    // crossing the supplied board as short as possible.
    const sides: Array<CalloutBox["side"]> = ["left", "right", "top", "bottom"].sort((first, second) => {
      const distance = (side: CalloutBox["side"]) => {
        if (side === "left") return Math.abs(targetLeft - framePixels.left);
        if (side === "right") return Math.abs(framePixels.left + framePixels.width - targetLeft);
        if (side === "top") return Math.abs(targetTop - framePixels.top);
        return Math.abs(framePixels.top + framePixels.height - targetTop);
      };
      return distance(first) - distance(second);
    });
    const candidates: CalloutBox[] = [];
    const offsets = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6];
    const exteriorCandidate = (side: CalloutBox["side"], offset: number, track = 0): CalloutBox => {
      if (side === "left" || side === "right") {
        return {
          left: side === "left" ? framePixels.left - size.width - 12 : framePixels.left + framePixels.width + 12,
          top: targetTop - size.height / 2 + offset * (size.height + 7),
          width: size.width,
          height: size.height,
          side,
          track,
        };
      }
      return {
        left: targetLeft - size.width / 2 + offset * (size.width + 8),
        top: side === "top" ? framePixels.top - size.height - 12 : framePixels.top + framePixels.height + 12,
        width: size.width,
        height: size.height,
        side,
        track,
      };
    };
    // Try the four closest surrounding positions before a deliberately safe
    // inside area. If those are taken, continue in the surrounding blue lane.
    offsets.forEach((offset) => sides.forEach((side) => {
      for (let track = 0; track < 5; track += 1) candidates.push(exteriorCandidate(side, offset, track));
    }));
    // Only use a verified interior region after the nearby external positions
    // are occupied. This preserves the owner image whenever there is room.
    safeRegions.forEach((region) => {
      const left = framePixels.left + (region.x / 1000) * framePixels.width;
      const top = framePixels.top + (region.y / 1000) * framePixels.height;
      const width = (region.width / 1000) * framePixels.width;
      const height = (region.height / 1000) * framePixels.height;
      if (size.width + 10 <= width && size.height + 10 <= height) {
        candidates.splice(4, 0, {
          left: left + (width - size.width) / 2,
          top: top + (height - size.height) / 2,
          width: size.width,
          height: size.height,
          side: "inside",
          track: 0,
        });
      }
    });
    const routeFor = (box: CalloutBox) => calloutPathPoints(box, targetLeft, targetTop, framePixels);
    const canUse = (box: CalloutBox): boolean => {
      if (used.some((other) => overlaps(box, other))) return false;
      const route = routeFor(box);
      return !routes.some((otherRoute) => routeConflicts(route, otherRoute));
    };
    let candidate = candidates.find(canUse);
    // A dense station can contain more labels than the nearby candidate list.
    // Continue down the least-obstructive exterior lane rather than allowing a
    // collision. The canvas deliberately permits this lane to remain visible.
    if (!candidate) {
      for (let index = 7; index < 160 && !candidate; index += 1) {
        const magnitude = Math.ceil((index - 6) / 2);
        const offset = index % 2 ? -magnitude : magnitude;
        for (const side of sides) {
          for (let track = 0; track < 12; track += 1) {
            const next = exteriorCandidate(side, offset, track);
            if (canUse(next)) {
              candidate = next;
              break;
            }
          }
          if (candidate) break;
        }
      }
    }
    if (!candidate) {
      // Keep the label where it already has space, but allow the leader to
      // approach from another exterior edge. This is the dense-board escape
      // hatch: all of the connector's long run stays in blue space and only
      // its final segment crosses the supplied board.
      for (let index = 7; index < 160 && !candidate; index += 1) {
        const magnitude = Math.ceil((index - 6) / 2);
        const offset = index % 2 ? -magnitude : magnitude;
        for (const labelSide of sides) {
          for (const routeSide of ["left", "right", "top", "bottom"] as const) {
            for (let track = 0; track < 14; track += 1) {
              const next = { ...exteriorCandidate(labelSide, offset, track), routeSide };
              if (canUse(next)) {
                candidate = next;
                break;
              }
            }
            if (candidate) break;
          }
          if (candidate) break;
        }
      }
    }
    if (!candidate) {
      // This is only a last-resort dense stress case (more labels than the
      // board has unique real anchors). Normal boards never reuse a route.
      for (let index = 7; !candidate; index += 1) {
        const next = exteriorCandidate(sides[0], index, index);
        if (!used.some((other) => overlaps(next, other))) candidate = next;
      }
    }
    used.push(candidate);
    const route = routeFor(candidate);
    routes.push(route);
    const labelLeft = (candidate.left + candidate.width / 2) / boardWidth * 100;
    const labelTop = (candidate.top + candidate.height / 2) / boardHeight * 100;
    const labelWidth = candidate.width / boardWidth * 100;
    const labelHeight = candidate.height / boardHeight * 100;
    const usesExternalLane = candidate.left < 0 || candidate.top < 0
      || candidate.left + candidate.width > boardWidth || candidate.top + candidate.height > boardHeight;
    output[id] = {
      targetLeft: targetLeft / boardWidth * 100,
      targetTop: targetTop / boardHeight * 100,
      labelLeft,
      labelTop,
      labelWidth,
      labelHeight,
      usesExternalLane,
      usesInsideSafeRegion: candidate.side === "inside",
      path: calloutPath(route, boardWidth, boardHeight),
      style: {
        "--callout-left": `${labelLeft}%`,
        "--callout-top": `${labelTop}%`,
        "--callout-width": `${labelWidth}%`,
        "--callout-font-size": `${fontSize}px`,
      } as CSSProperties,
    };
  });
  return output;
}

export function anchorStyleForViewport(anchor: GymPlacementAnchor, viewport: NormalizedRect): CSSProperties {
  const left = ((anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width) * 100;
  const top = ((anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height) * 100;
  const width = (anchor.rect.width / viewport.width) * 100;
  const height = (anchor.rect.height / viewport.height) * 100;
  return {
    left: `${left}%`,
    top: `${top}%`,
    "--anchor-width": `${width}%`,
    "--anchor-height": `${height}%`,
  } as CSSProperties;
}
