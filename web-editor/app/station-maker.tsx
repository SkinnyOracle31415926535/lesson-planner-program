"use client";
/* Event-handler factories intentionally close over pointer refs. */
/* eslint-disable react-hooks/refs */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  STATION_CANVAS,
  STATION_2P5D_PROJECTION,
  STATION_STACK_STEP,
  MAT_PLACEHOLDER_SHAPES,
  BUNGEE_COLORS,
  CHALK_BUCKET_COLORS,
  MINI_LOW_BAR_BASE_COLORS,
  MINI_LOW_BAR_HEIGHTS_INCHES,
  FOAM_ROLLER_END_COLORS,
  YOGA_BALL_COLORS,
  FOUR_INCH_RESI_COLORS,
  FOUR_PANEL_MAT_COLORWAYS,
  FIVE_PANEL_MAT_COLORWAYS,
  SIX_PANEL_MAT_COLORWAYS,
  MUSHROOM_MAT_COLORS,
  SPRINGBOARD_COLORS,
  FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES,
  FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES,
  SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES,
  SIX_PANEL_MAT_PANEL_HEIGHT_INCHES,
  BIG_BLOCK_COLORS,
  HALF_BLOCK_COLORS,
  HALF_BLOCK_COLOR_LABELS,
  SMALL_CHEESE_MAT_COLORS,
  SMALL_CHEESE_MAT_COLOR_LABELS,
  PANEL_MAT_FOLDED_HEIGHT_INCHES,
  PANEL_MAT_PANEL_HEIGHT_INCHES,
  bigBlockDimensions,
  bigBlockSide,
  bigBlockSpriteGeometry,
  bungeeLoopSpriteGeometry,
  chalkBucketSpriteGeometry,
  autoStackStationObject,
  canPlaceStationObject,
  clearStationSetupCrop,
  cloudMatDimensions,
  CLOUD_MAT_VELCRO_INSET_INCHES,
  cylinderFaceDimensions,
  cylinderFaceLabel,
  cylinderSpriteGeometry,
  constrainStationObjectToCanvas,
  createStationObject,
  cropStationSetupToContent,
  flipStationObjectFace,
  isStationSetupSaveable,
  nudgeStationObject,
  normalizeStationSetupDimensions,
  panelMatColors,
  panelMatFoldedSidePanels,
  panelMatOpenTopPanels,
  panelMatOpenSidePanels,
  panelMatState,
  panelMatSpriteGeometry,
  rotateStationObject,
  moveStationObjectVertical,
  cheeseMatFaceLabel,
  cheeseMatState,
  foldedCheeseMatColorScheme,
  foldedCheeseMatFaceDimensions,
  blueResiDimensions,
  miniResiDimensions,
  RESI_CROSS_STRIPE_CENTER_FROM_END_INCHES,
  RESI_CROSS_STRIPE_WIDTH_INCHES,
  isStripedResiAsset,
  stripedResiDimensions,
  pinkBeamMatDimensions,
  CARTWHEEL_MAT_COLORS,
  cartwheelMatDimensions,
  STAIRS_DEPTH_INCHES,
  STAIRS_HEIGHT_INCHES,
  STAIRS_WIDTH_INCHES,
  stairsSpriteGeometry,
  VELCRO_BEAM_COLORS,
  velcroBeamDimensions,
  redNorbertBlockDimensions,
  blueNorbertBlockDimensions,
  greenNorbertBlockDimensions,
  miniRedNorbertBlockDimensions,
  stingMatDimensions,
  gymNovaMatDimensions,
  teddyMatDimensions,
  handMatDimensions,
  halfBlockDimensions,
  SQUISHY_NORBERT_BLOCK_COLORS,
  squishyNorbertBlockDimensions,
  smallGreenNorbertBlockDimensions,
  halfBlockFaceColors,
  octagonFaceLabel,
  pbarBlockDimensions,
  pbarBlockFaceColors,
  setPanelMatState,
  setCheeseMatState,
  setMatPlaceholderShape,
  fivePanelMatFoldedSidePanels,
  fivePanelMatOpenSidePanels,
  fivePanelMatOpenTopPanels,
  fivePanelMatSpriteGeometry,
  sixPanelMatFoldedSidePanels,
  sixPanelMatOpenSidePanels,
  sixPanelMatOpenTopPanels,
  sixPanelMatSpriteGeometry,
  springboardSpringGeometry,
  springboardSpriteGeometry,
  preschoolSpringboardSpriteGeometry,
  tTrainerSpriteGeometry,
  mailBoxSpriteGeometry,
  greenMailBoxSpriteGeometry,
  matPlaceholderShape,
  matPlaceholderShapePoints,
  coltSpriteGeometry,
  paralletteSpriteGeometry,
  miniLowBarHeight,
  miniLowBarSpriteGeometry,
  recMiniBarSpriteGeometry,
  advancedMiniBarSpriteGeometry,
  trafficConeSpriteGeometry,
  targetMarkerSpriteGeometry,
  beanbagSpriteGeometry,
  rainbowMatSpriteGeometry,
  pacManSpriteGeometry,
  trapezeSpriteGeometry,
  pvcPipeSpriteGeometry,
  smallBarPadSpriteGeometry,
  rollingBarSpriteGeometry,
  woodenClimbingLadderSpriteGeometry,
  boseBallSpriteGeometry,
  foamRollerSpriteGeometry,
  yogaBallSpriteGeometry,
  vaultTrainerSpriteGeometry,
  bigBoulderSpriteGeometry,
  mediumBoulderSpriteGeometry,
  smallBoulderSpriteGeometry,
  smallSemicircleSpriteGeometry,
  miniMushroomSpriteGeometry,
  floorMushroomSpriteGeometry,
  mushroomMatSpriteGeometry,
  trapezoidMatSpriteGeometry,
  snapStationRotation,
  stationAsset,
  stationAssetFaceCount,
  stationCheeseMatSpriteGeometry,
  stationCuboidSpriteGeometry,
  stationMakerAssets,
  stationObjectFloorFootprint,
  stationObjectFootprint,
  stationObjectVerticalRange,
  stationObjectFace,
  stationOctagonSpriteGeometry,
  stationSetupCropBounds,
  isFoldableCheeseMatAsset,
  type StationAssetId,
  type BigBlockColor,
  type BungeeColor,
  type ChalkBucketColor,
  type MiniLowBarBaseColor,
  type MiniLowBarHeightInches,
  type FoamRollerEndColor,
  type YogaBallColor,
  type FourInchResiColor,
  type PanelMatColorway,
  type MushroomMatColor,
  type HalfBlockColor,
  type SquishyNorbertBlockColor,
  type CartwheelMatColor,
  type VelcroBeamColor,
  type SmallCheeseMatColor,
  type StationColor,
  type StationElevationDirection,
  type StationFlipDirection,
  type StationNudgeDirection,
  type StationObject,
  type StationRotationDirection,
  type StationSetup,
  type SpringboardColor,
  type StripedResiAssetId,
  type CheeseMatAssetId,
  type MatPlaceholderShape,
} from "./station-setups";

const COLORS: StationColor[] = ["blue", "pink", "yellow", "green", "purple"];
const SPRINGBOARD_COLOR_LABELS: Record<SpringboardColor, string> = { "white-grey": "WHITISH GREY", burgundy: "BURGUNDY", red: "RED", orange: "ORANGE", "blue-grey": "BLUEISH GREY" };
const MUSHROOM_MAT_COLOR_LABELS: Record<MushroomMatColor, string> = { "blue-brown": "BLUE / BROWN", "gray-red-cross": "GRAY / RED + YELLOW CROSS" };
const FOAM_ROLLER_END_COLOR_LABELS: Record<FoamRollerEndColor, string> = { green: "GREEN", orange: "ORANGE", blue: "BLUE", gray: "GRAY" };
const CHALK_BUCKET_COLOR_LABELS: Record<ChalkBucketColor, string> = { orange: "ORANGE", pink: "PINK" };
const CARTWHEEL_MAT_COLOR_LABELS: Record<CartwheelMatColor, string> = { blue: "BLUE", pink: "PINK", "light-blue": "LIGHT BLUE", "dark-blue": "DARK BLUE", purple: "PURPLE" };
const VELCRO_BEAM_COLOR_LABELS: Record<VelcroBeamColor, string> = { red: "RED", orange: "ORANGE", yellow: "YELLOW", green: "GREEN", blue: "BLUE" };
const MINI_LOW_BAR_BASE_COLOR_LABELS: Record<MiniLowBarBaseColor, string> = { gray: "GRAY", red: "RED", blue: "BLUE" };
const YOGA_BALL_COLOR_LABELS: Record<YogaBallColor, string> = { blue: "BLUE", yellow: "YELLOW", green: "GREEN", red: "RED", purple: "PURPLE", black: "BLACK" };
const MAT_PLACEHOLDER_SHAPE_LABELS: Record<MatPlaceholderShape, string> = { rectangle: "RECTANGLE", square: "SQUARE", round: "ROUND", wedge: "WEDGE" };
const PANEL_MAT_COLORWAY_LABELS: Record<PanelMatColorway, string> = { rainbow: "RAINBOW", purple: "PURPLE", "blue-green": "BLUE / GREEN", blue: "BLUE", "light-blue": "LIGHT BLUE", "dark-blue": "DARK BLUE" };
const MAT_COLLECTION_TODO_STORAGE_KEY = "gym-lesson-planner-station-mat-collection-todos";
type MatCollectionTodo = { id: string; label: string; shape: MatPlaceholderShape; completed: boolean };

function matCollectionTodoForObject(object: StationObject): MatCollectionTodo | null {
  if (object.kind !== "equipment" || object.assetId !== "mat-placeholder") return null;
  return { id: object.id, label: object.missingMatLabel?.trim() || "NEW MAT", shape: matPlaceholderShape(object.matPlaceholderShape), completed: false };
}

function mergeMatCollectionTodo(todos: readonly MatCollectionTodo[], todo: MatCollectionTodo): MatCollectionTodo[] {
  const existing = todos.find((item) => item.id === todo.id);
  if (!existing) return [...todos, todo];
  if (existing.label === todo.label && existing.shape === todo.shape) return [...todos];
  return todos.map((item) => item.id === todo.id ? { ...todo, completed: false } : item);
}

function loadMatCollectionTodos(): MatCollectionTodo[] {
  if (typeof globalThis.localStorage === "undefined") return [];
  try {
    const value: unknown = JSON.parse(globalThis.localStorage.getItem(MAT_COLLECTION_TODO_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.flatMap((item): MatCollectionTodo[] => item && typeof item === "object"
      && typeof item.id === "string" && typeof item.label === "string" && typeof item.completed === "boolean"
      && MAT_PLACEHOLDER_SHAPES.includes((item as { shape?: unknown }).shape as MatPlaceholderShape)
      ? [{ id: item.id, label: item.label, shape: (item as { shape: MatPlaceholderShape }).shape, completed: item.completed }]
      : []);
  } catch {
    return [];
  }
}
function panelMatColorwayOptions(assetId: StationAssetId): readonly PanelMatColorway[] {
  return assetId === "panel" ? FOUR_PANEL_MAT_COLORWAYS : assetId === "five-panel" ? FIVE_PANEL_MAT_COLORWAYS : SIX_PANEL_MAT_COLORWAYS;
}
function panelMatDefaultColorway(assetId: StationAssetId): PanelMatColorway {
  return assetId === "panel" ? "rainbow" : assetId === "five-panel" ? "blue" : "light-blue";
}
export const STATION_VIEW_ZOOMS = [.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4] as const;
const MOVE_GIZMO = { size: 128, center: 64, radius: 42 } as const;
const NUDGE_DIRECTIONS: readonly StationNudgeDirection[] = ["north", "east", "south", "west"];
type StationViewPan = { x: number; y: number };
type StationViewDirection = "up" | "right" | "down" | "left";

export function constrainStationViewPan(pan: StationViewPan, zoom: number, viewport: { width: number; height: number }): StationViewPan {
  const maxX = Math.max(0, viewport.width * (zoom - 1) / 2);
  const maxY = Math.max(0, viewport.height * (zoom - 1) / 2);
  return { x: maxX ? Math.max(-maxX, Math.min(maxX, pan.x)) : 0, y: maxY ? Math.max(-maxY, Math.min(maxY, pan.y)) : 0 };
}

function localNudgeVector(rotation: number, direction: StationNudgeDirection) {
  const offset = direction === "north" ? { x: 0, y: -1 }
    : direction === "east" ? { x: 1, y: 0 }
      : direction === "south" ? { x: 0, y: 1 }
        : { x: -1, y: 0 };
  const radians = snapStationRotation(rotation) * Math.PI / 180;
  return { x: offset.x * Math.cos(radians) - offset.y * Math.sin(radians), y: offset.x * Math.sin(radians) + offset.y * Math.cos(radians) };
}

type StationSound = "place" | "move" | "rotate" | "open" | "close" | "delete" | "save";

const STATION_SOUNDS: Record<StationSound, { notes: number[]; duration: number; type: OscillatorType }> = {
  place: { notes: [330, 440], duration: .055, type: "square" },
  move: { notes: [620], duration: .025, type: "square" },
  rotate: { notes: [410, 610], duration: .04, type: "triangle" },
  open: { notes: [196, 294, 392, 587], duration: .06, type: "square" },
  close: { notes: [587, 392, 294], duration: .06, type: "triangle" },
  delete: { notes: [240, 130], duration: .07, type: "sawtooth" },
  save: { notes: [392, 523], duration: .08, type: "square" },
};

function useStationSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastMoveSoundAtRef = useRef(0);
  return (sound: StationSound) => {
    if (typeof window === "undefined") return;
    if (sound === "move") {
      const now = Date.now();
      if (now - lastMoveSoundAtRef.current < 90) return;
      lastMoveSoundAtRef.current = now;
    }
    const BrowserAudioContext = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!BrowserAudioContext) return;
    const context = audioContextRef.current ?? new BrowserAudioContext();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
    const startedAt = context.currentTime;
    const effect = STATION_SOUNDS[sound];
    effect.notes.forEach((frequency, index) => {
      const start = startedAt + index * .045;
      const oscillator = context.createOscillator(); const gain = context.createGain();
      oscillator.type = effect.type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.055, start + .006);
      gain.gain.exponentialRampToValueAtTime(.0001, start + effect.duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start); oscillator.stop(start + effect.duration + .01);
    });
  };
}

function PanelMatSprite({ rotation, elevation, panelState, colorway, frame }: { rotation: number; elevation?: number; panelState: "closed" | "open"; colorway?: PanelMatColorway; frame: { width: number; height: number } }) {
  const colors = panelMatColors("panel", colorway);
  const { top } = panelMatSpriteGeometry(rotation, elevation, panelState === "closed" ? PANEL_MAT_FOLDED_HEIGHT_INCHES : PANEL_MAT_PANEL_HEIGHT_INCHES, frame);
  const foldedSides = panelMatFoldedSidePanels(rotation, elevation, frame, colors);
  const openPanels = panelMatOpenTopPanels(rotation, elevation, frame);
  const openSides = panelMatOpenSidePanels(rotation, elevation, frame, colors);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="panel-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {panelState === "open" ? openSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />) : foldedSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />)}
    {panelState === "open"
      ? <>{openPanels.map((face, index) => <polygon key={index} className={`panel-mat-color-panel ${colors[index]}`} points={points(face)} />)}<polygon className="panel-mat-outline" points={points(top)} /></>
      : <polygon className={`panel-mat-color-panel ${colors[0]}`} points={points(top)} />}
  </svg>;
}

function FivePanelMatSprite({ rotation, elevation, panelState, colorway, frame }: { rotation: number; elevation?: number; panelState: "closed" | "open"; colorway?: PanelMatColorway; frame: { width: number; height: number } }) {
  const colors = panelMatColors("five-panel", colorway);
  const { top } = fivePanelMatSpriteGeometry(rotation, elevation, panelState === "closed" ? FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES : FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, frame);
  const foldedSides = fivePanelMatFoldedSidePanels(rotation, elevation, frame, colors);
  const openPanels = fivePanelMatOpenTopPanels(rotation, elevation, frame);
  const openSides = fivePanelMatOpenSidePanels(rotation, elevation, frame, colors);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="panel-mat-sprite five-panel-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {panelState === "open" ? openSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />) : foldedSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />)}
    {panelState === "open"
      ? <>{openPanels.map((face, index) => <polygon key={index} className={`panel-mat-color-panel ${colors[index]}`} points={points(face)} />)}<polygon className="panel-mat-outline" points={points(top)} /></>
      : <polygon className={`panel-mat-color-panel ${colors[0]}`} points={points(top)} />}
  </svg>;
}

function SixPanelMatSprite({ rotation, elevation, panelState, colorway, frame }: { rotation: number; elevation?: number; panelState: "closed" | "open"; colorway?: PanelMatColorway; frame: { width: number; height: number } }) {
  const colors = panelMatColors("six-panel", colorway);
  const { top } = sixPanelMatSpriteGeometry(rotation, elevation, panelState === "closed" ? SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES : SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, frame);
  const foldedSides = sixPanelMatFoldedSidePanels(rotation, elevation, frame, colors);
  const openPanels = sixPanelMatOpenTopPanels(rotation, elevation, frame);
  const openSides = sixPanelMatOpenSidePanels(rotation, elevation, frame, colors);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="panel-mat-sprite six-panel-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {panelState === "open" ? openSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />) : foldedSides.map((face, index) => <polygon key={index} className={`panel-mat-color-side ${face.color}`} points={points(face.points)} />)}
    {panelState === "open"
      ? <>{openPanels.map((face, index) => <polygon key={index} className={`panel-mat-color-panel ${colors[index]}`} points={points(face)} />)}<polygon className="panel-mat-outline" points={points(top)} /></>
      : <polygon className={`panel-mat-color-panel ${colors[0]}`} points={points(top)} />}
  </svg>;
}

function BigBlockSprite({ rotation, elevation, side, color, frame }: { rotation: number; elevation?: number; side: number; color: string; frame: { width: number; height: number } }) {
  const { top, sides } = bigBlockSpriteGeometry(rotation, elevation, side, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`big-block-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((face, index) => <polygon key={index} className="big-block-side" points={points(face)} />)}
    <polygon className="big-block-top" points={points(top)} />
  </svg>;
}

function BungeeLoopSprite({ color, rotation, elevation, frame }: { color: BungeeColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { loop } = bungeeLoopSpriteGeometry(rotation, elevation, frame);
  const points = loop.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`bungee-loop-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true"><polyline className="bungee-loop-band" points={points} /></svg>;
}

function CuboidSprite({ rotation, elevation, dimensions, colors, frame, className }: { rotation: number; elevation?: number; dimensions: ReturnType<typeof pbarBlockDimensions>; colors: { top: StationColor; sides: StationColor[] }; frame: { width: number; height: number }; className: string }) {
  const { top, sides, sideIndices } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={className} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((face, index) => <polygon key={index} className={`station-cuboid-side ${colors.sides[sideIndices[index]]}`} points={points(face)} />)}
    <polygon className={`station-cuboid-top ${colors.top}`} points={points(top)} />
  </svg>;
}

function CartwheelMatSprite({ color, rotation, elevation, face, frame }: { color: CartwheelMatColor; rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const dimensions = cartwheelMatDimensions(face);
  const { top, sides } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  const surfacePoint = (width: number, depth: number) => ({
    x: Math.round(top[0].x + (top[1].x - top[0].x) * width + (top[3].x - top[0].x) * depth),
    y: Math.round(top[0].y + (top[1].y - top[0].y) * width + (top[3].y - top[0].y) * depth),
  });
  // The photographed cartwheel mat has a broad stripe down its long center, rather than a thin line across it.
  const halfStripeWidth = Math.min(6 / dimensions.depthInches, .5) / 2;
  const centerLine = [surfacePoint(0, .5 - halfStripeWidth), surfacePoint(1, .5 - halfStripeWidth), surfacePoint(1, .5 + halfStripeWidth), surfacePoint(0, .5 + halfStripeWidth)];
  return <svg className={`cartwheel-mat-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((surface, index) => <polygon key={index} className={`station-cuboid-side ${color}`} points={points(surface)} />)}
    <polygon className={`station-cuboid-top ${color}`} points={points(top)} />
    <polygon className="cartwheel-mat-center-line" points={points(centerLine)} />
  </svg>;
}

function HandMatSprite({ rotation, elevation, face, frame }: { rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const dimensions = handMatDimensions(face);
  const { top, sides } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  const surfacePoint = (width: number, depth: number) => ({
    x: Math.round(top[0].x + (top[1].x - top[0].x) * width + (top[3].x - top[0].x) * depth),
    y: Math.round(top[0].y + (top[1].y - top[0].y) * width + (top[3].y - top[0].y) * depth),
  });
  const dividerWidth = Math.min(1.25 / dimensions.widthInches, .045) / 2;
  const dividerDepth = Math.min(1.25 / dimensions.depthInches, .045) / 2;
  const lengthwiseDivider = [surfacePoint(.5 - dividerWidth, 0), surfacePoint(.5 + dividerWidth, 0), surfacePoint(.5 + dividerWidth, 1), surfacePoint(.5 - dividerWidth, 1)];
  const crosswiseDivider = [surfacePoint(0, .5 - dividerDepth), surfacePoint(1, .5 - dividerDepth), surfacePoint(1, .5 + dividerDepth), surfacePoint(0, .5 + dividerDepth)];
  return <svg className="hand-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((surface, index) => <polygon key={index} className="hand-mat-side" points={points(surface)} />)}
    <polygon className="hand-mat-top" points={points(top)} />
    <polygon className="hand-mat-divider" points={points(lengthwiseDivider)} />
    <polygon className="hand-mat-divider" points={points(crosswiseDivider)} />
  </svg>;
}

function StairsSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { surfaces } = stairsSpriteGeometry(rotation, elevation, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="stairs-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {surfaces.map((surface, index) => <polygon key={index} className={`stairs-${surface.color}`} points={points(surface.points)} />)}
  </svg>;
}

function MiniResiSprite({ rotation, elevation, face, frame }: { rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const { top, sides, sideIndices } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, miniResiDimensions(face), frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  const topPoint = (width: number, depth: number) => ({ x: Math.round(top[0].x + (top[1].x - top[0].x) * width + (top[3].x - top[0].x) * depth), y: Math.round(top[0].y + (top[1].y - top[0].y) * width + (top[3].y - top[0].y) * depth) });
  const topSurface = (left: number, right: number, near: number, far: number) => [topPoint(left, near), topPoint(right, near), topPoint(right, far), topPoint(left, far)];
  const sideColor = (side: number) => side === 0 || side === 2 ? "red" : "blue";
  return <svg className="mini-resi-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((surface, index) => <polygon key={index} className={`mini-resi-side ${sideColor(sideIndices[index])}`} points={points(surface)} />)}
    <polygon className="mini-resi-top blue" points={points(top)} />
    <polygon className="mini-resi-top red" points={points(topSurface(2 / 3, 1, 0, 1))} />
    <polygon className="mini-resi-top light-blue" points={points(topSurface(.02, 2 / 3, 0, .14))} />
    <polygon className="mini-resi-top light-blue" points={points(topSurface(.02, 2 / 3, .86, 1))} />
    <polygon className="mini-resi-top gray" points={points(topSurface(.06, .62, .17, .83))} />
  </svg>;
}

function StripedResiSprite({ assetId, color, rotation, elevation, face, frame }: { assetId: StripedResiAssetId; color: FourInchResiColor; rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const dimensions = stripedResiDimensions(assetId, face);
  const { top, sides } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  const pointOnTop = (width: number, depth: number) => ({
    x: Math.round(top[0].x + (top[1].x - top[0].x) * width + (top[3].x - top[0].x) * depth),
    y: Math.round(top[0].y + (top[1].y - top[0].y) * width + (top[3].y - top[0].y) * depth),
  });
  const bigFourTopFace = assetId === "big-four-inch-resi" && face === 2;
  const coverColor = assetId === "four-inch-resi" ? color : "blue";
  const stripeWidth = Math.min(RESI_CROSS_STRIPE_WIDTH_INCHES / dimensions.widthInches, .48);
  const stripeCenter = Math.min(.92, Math.max(.08, RESI_CROSS_STRIPE_CENTER_FROM_END_INCHES / dimensions.widthInches));
  const stripe = [pointOnTop(stripeCenter - stripeWidth / 2, 0), pointOnTop(stripeCenter + stripeWidth / 2, 0), pointOnTop(stripeCenter + stripeWidth / 2, 1), pointOnTop(stripeCenter - stripeWidth / 2, 1)];
  const bigFourSurface = [pointOnTop(.04, .1), pointOnTop(.96, .1), pointOnTop(.96, .9), pointOnTop(.04, .9)];
  return <svg className="striped-resi-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((surface, index) => <polygon key={index} className={`station-cuboid-side ${coverColor}`} points={points(surface)} />)}
    <polygon className={`station-cuboid-top ${coverColor}`} points={points(top)} />
    {bigFourTopFace ? <polygon className="station-cuboid-top gray" points={points(bigFourSurface)} /> : assetId !== "big-four-inch-resi" ? <polygon className="station-cuboid-top yellow" points={points(stripe)} /> : null}
  </svg>;
}

function CloudMatSprite({ rotation, elevation, face, frame }: { rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const dimensions = cloudMatDimensions(face);
  const { top, sides } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  const widthInset = CLOUD_MAT_VELCRO_INSET_INCHES / dimensions.widthInches;
  const depthInset = CLOUD_MAT_VELCRO_INSET_INCHES / dimensions.depthInches;
  const velcro = [[widthInset, depthInset], [1 - widthInset, depthInset], [1 - widthInset, 1 - depthInset], [widthInset, 1 - depthInset]].map(([widthPosition, depthPosition]) => ({
    x: Math.round(top[0].x + (top[1].x - top[0].x) * widthPosition + (top[3].x - top[0].x) * depthPosition),
    y: Math.round(top[0].y + (top[1].y - top[0].y) * widthPosition + (top[3].y - top[0].y) * depthPosition),
  }));
  return <svg className="cloud-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.map((face, index) => <polygon key={index} className="cloud-mat-side" points={points(face)} />)}
    <polygon className="cloud-mat-top" points={points(top)} />
    <polygon className="cloud-mat-velcro" points={points(velcro)} />
  </svg>;
}

function OctagonSprite({ assetId, rotation, elevation, face, frame }: { assetId: "big-octagon" | "medium-octagon" | "small-octagon"; rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const { outerFaces, endFaces } = stationOctagonSpriteGeometry(assetId, face, rotation, elevation, frame);
  const prefix = assetId === "big-octagon" ? "big-octagon" : assetId === "medium-octagon" ? "medium-octagon" : "small-octagon";
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`${prefix}-sprite`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {outerFaces.map((face, index) => <polygon key={index} className={`${prefix}-outer`} points={points(face)} />)}
    {endFaces.map((face, index) => <polygon key={index} className={`${prefix}-end`} points={points(face)} />)}
  </svg>;
}

function CheeseMatSprite({ assetId, rotation, elevation, face, frame, smallCheeseMatColor = "orange-purple" }: { assetId: "tiny-cheese-mat" | "small-cheese-mat" | "medium-cheese-mat" | "large-cheese-mat" | "big-cheese-mat" | "squishy-cheese-mat"; rotation: number; elevation?: number; face: number; frame: { width: number; height: number }; smallCheeseMatColor?: SmallCheeseMatColor }) {
  const surfaces = stationCheeseMatSpriteGeometry(assetId, face, rotation, elevation, frame, smallCheeseMatColor);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`${assetId}-sprite${assetId === "small-cheese-mat" ? ` ${smallCheeseMatColor}` : ""}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {surfaces.map((surface, index) => <polygon key={index} className={`${assetId}-${surface.role}${surface.role === "side" ? ` ${surface.color}` : ""}`} points={points(surface.points)} />)}
  </svg>;
}

function FoldedCheeseMatSprite({ assetId, rotation, elevation, face, frame, smallCheeseMatColor = "orange-purple" }: { assetId: Exclude<CheeseMatAssetId, "big-cheese-mat">; rotation: number; elevation?: number; face: number; frame: { width: number; height: number }; smallCheeseMatColor?: SmallCheeseMatColor }) {
  const dimensions = foldedCheeseMatFaceDimensions(assetId, face);
  const colors = foldedCheeseMatColorScheme(assetId, smallCheeseMatColor);
  const { top, sides } = stationCuboidSpriteGeometry(rotation, elevation ?? 0, dimensions, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  const pointOnSurface = (surface: readonly { x: number; y: number }[], width: number, height: number) => ({
    x: Math.round(surface[0].x + (surface[1].x - surface[0].x) * width + (surface[3].x - surface[0].x) * height),
    y: Math.round(surface[0].y + (surface[1].y - surface[0].y) * width + (surface[3].y - surface[0].y) * height),
  });
  const panel = (surface: readonly { x: number; y: number }[], start: number, end: number) => [pointOnSurface(surface, start, 0), pointOnSurface(surface, end, 0), pointOnSurface(surface, end, 1), pointOnSurface(surface, start, 1)];
  const foldLine = [pointOnSurface(top, .5, 0), pointOnSurface(top, .5, 1)];
  return <svg className={`folded-cheese-mat-sprite ${assetId}${assetId === "small-cheese-mat" ? ` ${smallCheeseMatColor}` : ""}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sides.flatMap((surface, sideIndex) => colors.sides.map((color, panelIndex) => <polygon key={`${sideIndex}-${color}-${panelIndex}`} className={`folded-cheese-mat-side ${color}`} points={points(panel(surface, panelIndex / colors.sides.length, (panelIndex + 1) / colors.sides.length))} />))}
    <polygon className={`folded-cheese-mat-top ${colors.top}`} points={points(top)} />
    <polyline className="folded-cheese-mat-fold-line" points={points(foldLine)} />
  </svg>;
}

function SpringboardSprite({ color, rotation, elevation, frame }: { color: SpringboardColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const surfaces = springboardSpriteGeometry(rotation, elevation, frame);
  const springs = springboardSpringGeometry(rotation, elevation, frame);
  const top = surfaces.filter((surface) => surface.role === "top");
  const frameSurfaces = surfaces.filter((surface) => surface.role !== "top");
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`springboard-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {frameSurfaces.map((surface, index) => <polygon key={index} className={`springboard-${surface.role}`} points={points(surface.points)} />)}
    {springs.map((spring, index) => <polyline key={index} className="springboard-spring" points={points(spring)} />)}
    {top.map((surface, index) => <polygon key={index} className={`springboard-${surface.role}`} points={points(surface.points)} />)}
  </svg>;
}

function PreschoolSpringboardSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { surfaces, springs, purpleFootprints } = preschoolSpringboardSpriteGeometry(rotation, elevation, frame);
  const top = surfaces.filter((surface) => surface.role === "top");
  const frameSurfaces = surfaces.filter((surface) => surface.role !== "top");
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="preschool-springboard-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {frameSurfaces.map((surface, index) => <polygon key={`frame-${index}`} className={`preschool-springboard-${surface.role}`} points={points(surface.points)} />)}
    {springs.map((spring, index) => <polyline key={`spring-${index}`} className="preschool-springboard-spring" points={points(spring)} />)}
    {top.map((surface, index) => <polygon key={`top-${index}`} className="preschool-springboard-top" points={points(surface.points)} />)}
    {purpleFootprints.map((footprint, index) => <polygon key={`footprint-${index}`} className="preschool-springboard-footprint" points={points(footprint)} />)}
  </svg>;
}

function TTrainerSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { frameBars, railFaces, runwaySides, trampoline, dashes, crossLine } = tTrainerSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="t-trainer-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {frameBars.map((bar, index) => <polyline key={index} className="t-trainer-frame-bar" points={points(bar)} />)}
    {runwaySides.map((face, index) => <polygon key={index} className="t-trainer-runway-side" points={points(face)} />)}
    {railFaces.map((face, index) => <polygon key={index} className="t-trainer-rail" points={points(face)} />)}
    <polygon className="t-trainer-trampoline" points={points(trampoline)} />
    {dashes.map((dash, index) => <polygon key={index} className="t-trainer-dash" points={points(dash)} />)}
    <polygon className="t-trainer-cross-line" points={points(crossLine)} />
  </svg>;
}

function MailBoxSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redFaces, yellowEndCaps, redEndStraps, blackEndLabels } = mailBoxSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="mail-box-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redFaces.map((face, index) => <polygon key={index} className="mail-box-red-face" points={points(face)} />)}
    {yellowEndCaps.map((face, index) => <polygon key={index} className="mail-box-yellow-end" points={points(face)} />)}
    {redEndStraps.map((face, index) => <polygon key={index} className="mail-box-end-strap" points={points(face)} />)}
    {blackEndLabels.map((face, index) => <polygon key={index} className="mail-box-end-label" points={points(face)} />)}
  </svg>;
}

function GreenMailBoxSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redFaces, yellowEndCaps, redEndStraps, blackEndLabels } = greenMailBoxSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="green-mail-box-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redFaces.map((face, index) => <polygon key={index} className="green-mail-box-curve" points={points(face)} />)}
    {yellowEndCaps.map((face, index) => <polygon key={index} className="green-mail-box-yellow-end" points={points(face)} />)}
    {redEndStraps.map((face, index) => <polygon key={index} className="green-mail-box-end-handle" points={points(face)} />)}
    {blackEndLabels.map((face, index) => <polygon key={index} className="green-mail-box-end-label" points={points(face)} />)}
  </svg>;
}

function ColtSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { grayBaseFaces, caramelRoofFaces, grayEndFaces, caramelEndFaces, blackHandleBases, tanHandleBars } = coltSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="colt-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {grayBaseFaces.map((face, index) => <polygon key={`base-${index}`} className="colt-gray-base" points={points(face)} />)}
    {caramelRoofFaces.map((face, index) => <polygon key={`roof-${index}`} className="colt-caramel-roof" points={points(face)} />)}
    {grayEndFaces.map((face, index) => <polygon key={`end-base-${index}`} className="colt-gray-end" points={points(face)} />)}
    {caramelEndFaces.map((face, index) => <polygon key={`end-roof-${index}`} className="colt-caramel-end" points={points(face)} />)}
    {blackHandleBases.map((face, index) => <polygon key={`handle-base-${index}`} className="colt-handle-base" points={points(face)} />)}
    {tanHandleBars.map((bar, index) => <polyline key={`handle-bar-${index}`} className="colt-handle-bar" points={points(bar)} />)}
  </svg>;
}

function ParalletteSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { barFaces, supportFaces, barEndFaces } = paralletteSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="parallette-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {supportFaces.map((face, index) => <polygon key={`support-${index}`} className="parallette-support" points={points(face)} />)}
    {barFaces.map((face, index) => <polygon key={`bar-${index}`} className="parallette-bar" points={points(face)} />)}
    {barEndFaces.map((face, index) => <polygon key={`end-${index}`} className="parallette-bar-end" points={points(face)} />)}
  </svg>;
}

function MiniLowBarSprite({ baseColor, heightInches, rotation, elevation, frame }: { baseColor: MiniLowBarBaseColor; heightInches: MiniLowBarHeightInches; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { railFaces, baseFaces, supportFaces, railEndFaces } = miniLowBarSpriteGeometry(rotation, elevation, heightInches, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`mini-low-bar-sprite ${baseColor}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {baseFaces.map((face, index) => <polygon key={`base-${index}`} className="mini-low-bar-base" points={points(face)} />)}
    {supportFaces.map((face, index) => <polygon key={`support-${index}`} className="mini-low-bar-support" points={points(face)} />)}
    {railFaces.map((face, index) => <polygon key={`rail-${index}`} className="mini-low-bar-rail" points={points(face)} />)}
    {railEndFaces.map((face, index) => <polygon key={`end-${index}`} className="mini-low-bar-rail-end" points={points(face)} />)}
  </svg>;
}

function AdvancedMiniBarSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { tanRailFaces, tanRailEnds, orangeBaseFaces, orangePostFaces, silverSupportFaces, greenMountFaces, blackKnobs } = advancedMiniBarSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="advanced-mini-bar-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {orangeBaseFaces.map((face, index) => <polygon key={`base-${index}`} className="advanced-mini-bar-base" points={points(face)} />)}
    {orangePostFaces.map((face, index) => <polygon key={`post-${index}`} className="advanced-mini-bar-post" points={points(face)} />)}
    {silverSupportFaces.map((face, index) => <polygon key={`support-${index}`} className="advanced-mini-bar-support" points={points(face)} />)}
    {greenMountFaces.map((face, index) => <polygon key={`mount-${index}`} className="advanced-mini-bar-mount" points={points(face)} />)}
    {blackKnobs.map((face, index) => <polygon key={`knob-${index}`} className="advanced-mini-bar-knob" points={points(face)} />)}
    {tanRailFaces.map((face, index) => <polygon key={`rail-${index}`} className="advanced-mini-bar-rail" points={points(face)} />)}
    {tanRailEnds.map((face, index) => <polygon key={`rail-end-${index}`} className="advanced-mini-bar-rail-end" points={points(face)} />)}
  </svg>;
}

function RecMiniBarSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { tanRailFaces, tanRailEnds, blueBaseFaces, bluePostFaces, silverUpperFaces, blackElbowFaces, blackKnobs } = recMiniBarSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="rec-mini-bar-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueBaseFaces.map((face, index) => <polygon key={`base-${index}`} className="rec-mini-bar-base" points={points(face)} />)}
    {bluePostFaces.map((face, index) => <polygon key={`post-${index}`} className="rec-mini-bar-post" points={points(face)} />)}
    {silverUpperFaces.map((face, index) => <polygon key={`upper-${index}`} className="rec-mini-bar-upper" points={points(face)} />)}
    {blackElbowFaces.map((face, index) => <polygon key={`elbow-${index}`} className="rec-mini-bar-elbow" points={points(face)} />)}
    {blackKnobs.map((face, index) => <polygon key={`knob-${index}`} className="rec-mini-bar-knob" points={points(face)} />)}
    {tanRailFaces.map((face, index) => <polygon key={`rail-${index}`} className="rec-mini-bar-rail" points={points(face)} />)}
    {tanRailEnds.map((face, index) => <polygon key={`rail-end-${index}`} className="rec-mini-bar-rail-end" points={points(face)} />)}
  </svg>;
}

function TrafficConeSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { orangeBaseFaces, orangeConeFaces, orangeTip } = trafficConeSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="traffic-cone-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {orangeBaseFaces.map((face, index) => <polygon key={`base-${index}`} className="traffic-cone-base" points={points(face)} />)}
    {orangeConeFaces.map((face, index) => <polygon key={`cone-${index}`} className="traffic-cone-body" points={points(face)} />)}
    <polygon className="traffic-cone-tip" points={points(orangeTip)} />
  </svg>;
}

function TargetMarkerSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { yellowTop, yellowSides, redTarget } = targetMarkerSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="target-marker-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {yellowSides.map((face, index) => <polygon key={`side-${index}`} className="target-marker-side" points={points(face)} />)}
    <polygon className="target-marker-yellow" points={points(yellowTop)} />
    <polygon className="target-marker-red" points={points(redTarget)} />
  </svg>;
}

function BeanbagSprite({ color, rotation, elevation, frame }: { color: StationColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { center, slopes } = beanbagSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`beanbag-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {slopes.map((face, index) => <polygon key={`slope-${index}`} className="beanbag-slope" points={points(face)} />)}
    <polygon className="beanbag-center" points={points(center)} />
  </svg>;
}

function RainbowMatSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { blueOuterFaces, cyanEndFaces, yellowEndFaces, redInnerFaces } = rainbowMatSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="rainbow-mat-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueOuterFaces.map((face, index) => <polygon key={`outer-${index}`} className="rainbow-mat-outer" points={points(face)} />)}
    {cyanEndFaces.map((face, index) => <polygon key={`cyan-end-${index}`} className="rainbow-mat-cyan-end" points={points(face)} />)}
    {yellowEndFaces.map((face, index) => <polygon key={`yellow-end-${index}`} className="rainbow-mat-yellow-end" points={points(face)} />)}
    {redInnerFaces.map((face, index) => <polygon key={`inner-${index}`} className="rainbow-mat-inner" points={points(face)} />)}
  </svg>;
}

function PacManSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redCurvedSides, redCutoutSides, yellowTop } = pacManSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="pac-man-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redCurvedSides.map((face, index) => <polygon key={`curve-${index}`} className="pac-man-curved-side" points={points(face)} />)}
    {redCutoutSides.map((face, index) => <polygon key={`cutout-${index}`} className="pac-man-cutout-side" points={points(face)} />)}
    <polygon className="pac-man-top" points={points(yellowTop)} />
  </svg>;
}

function TrapezeSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { barFaces, barEndCaps, straps } = trapezeSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="trapeze-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {straps.map((face, index) => <polygon key={`strap-${index}`} className="trapeze-strap" points={points(face)} />)}
    {barFaces.map((face, index) => <polygon key={`bar-${index}`} className="trapeze-bar" points={points(face)} />)}
    {barEndCaps.map((face, index) => <polygon key={`end-${index}`} className="trapeze-bar-end" points={points(face)} />)}
  </svg>;
}

function PvcPipeSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { lateralFaces, endCaps } = pvcPipeSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="pvc-pipe-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {lateralFaces.map((face, index) => <polygon key={`lateral-${index}`} className="pvc-pipe-lateral" points={points(face)} />)}
    {endCaps.map((face, index) => <polygon key={`end-${index}`} className="pvc-pipe-end" points={points(face)} />)}
  </svg>;
}

function SmallBarPadSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { lateralFaces, endCaps } = smallBarPadSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="small-bar-pad-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {lateralFaces.map((face, index) => <polygon key={`lateral-${index}`} className="small-bar-pad-lateral" points={points(face)} />)}
    {endCaps.map((face, index) => <polygon key={`end-${index}`} className="small-bar-pad-end" points={points(face)} />)}
  </svg>;
}

function RollingBarSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redBarFaces, blueWheelFaces, blueWheelEnds } = rollingBarSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="rolling-bar-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redBarFaces.map((face, index) => <polygon key={`bar-${index}`} className="rolling-bar-axle" points={points(face)} />)}
    {blueWheelFaces.map((face, index) => <polygon key={`wheel-${index}`} className="rolling-bar-wheel" points={points(face)} />)}
    {blueWheelEnds.map((face, index) => <polygon key={`end-${index}`} className="rolling-bar-wheel-end" points={points(face)} />)}
  </svg>;
}

function WoodenClimbingLadderSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { railTops, railSides, rungTops, rungSides } = woodenClimbingLadderSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="wooden-climbing-ladder-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {railSides.map((face, index) => <polygon key={`rail-side-${index}`} className="wooden-climbing-ladder-rail-side" points={points(face)} />)}
    {rungSides.map((face, index) => <polygon key={`rung-side-${index}`} className="wooden-climbing-ladder-rung-side" points={points(face)} />)}
    {rungTops.map((face, index) => <polygon key={`rung-top-${index}`} className="wooden-climbing-ladder-rung" points={points(face)} />)}
    {railTops.map((face, index) => <polygon key={`rail-top-${index}`} className="wooden-climbing-ladder-rail" points={points(face)} />)}
  </svg>;
}

function BoseBallSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { rimTopFaces, rimSideFaces, domeFaces, gripRibs } = boseBallSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="bose-ball-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {rimSideFaces.map((face, index) => <polygon key={`rim-side-${index}`} className="bose-ball-rim-side" points={points(face)} />)}
    {domeFaces.map((face, index) => <polygon key={`dome-${index}`} className="bose-ball-dome" points={points(face)} />)}
    {rimTopFaces.map((face, index) => <polygon key={`rim-top-${index}`} className="bose-ball-rim-top" points={points(face)} />)}
    {gripRibs.map((rib, index) => <polyline key={`grip-${index}`} className="bose-ball-grip" points={points(rib)} />)}
  </svg>;
}

function FoamRollerSprite({ color, rotation, elevation, frame }: { color: FoamRollerEndColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { sideFaces, endCaps } = foamRollerSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`foam-roller-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {sideFaces.map((face, index) => <polygon key={`side-${index}`} className="foam-roller-side" points={points(face)} />)}
    {endCaps.map((face, index) => <polygon key={`end-${index}`} className="foam-roller-end" points={points(face)} />)}
  </svg>;
}

function YogaBallSprite({ color, rotation, elevation, frame }: { color: YogaBallColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { facets } = yogaBallSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`yoga-ball-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {facets.map((face, index) => <polygon key={index} className={`yoga-ball-facet shade-${index % 3}`} points={points(face)} />)}
  </svg>;
}

function VaultTrainerSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { blueFaces, tanTopFaces, blackHandles } = vaultTrainerSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="vault-trainer-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueFaces.map((face, index) => <polygon key={`blue-${index}`} className="vault-trainer-blue" points={points(face)} />)}
    {tanTopFaces.map((face, index) => <polygon key={`top-${index}`} className="vault-trainer-tan-top" points={points(face)} />)}
    {blackHandles.map((face, index) => <polygon key={`handle-${index}`} className="vault-trainer-handle" points={points(face)} />)}
  </svg>;
}

function BigBoulderSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redCurvedFaces, yellowFlatFaces } = bigBoulderSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="big-boulder-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redCurvedFaces.map((face, index) => <polygon key={index} className="big-boulder-red-curve" points={points(face)} />)}
    {yellowFlatFaces.map((face, index) => <polygon key={index} className="big-boulder-yellow-flat" points={points(face)} />)}
  </svg>;
}

function MediumBoulderSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redCurvedFaces, yellowFlatFaces } = mediumBoulderSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="medium-boulder-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redCurvedFaces.map((face, index) => <polygon key={index} className="medium-boulder-blue-curve" points={points(face)} />)}
    {yellowFlatFaces.map((face, index) => <polygon key={index} className="medium-boulder-yellow-flat" points={points(face)} />)}
  </svg>;
}

function SmallBoulderSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { redCurvedFaces, yellowFlatFaces } = smallBoulderSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="small-boulder-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {redCurvedFaces.map((face, index) => <polygon key={index} className="small-boulder-purple-curve" points={points(face)} />)}
    {yellowFlatFaces.map((face, index) => <polygon key={index} className="small-boulder-yellow-flat" points={points(face)} />)}
  </svg>;
}

function SmallSemicircleSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { blueCurvedFaces, yellowFlatFaces } = smallSemicircleSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="small-semicircle-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueCurvedFaces.map((face, index) => <polygon key={index} className="small-semicircle-blue-curve" points={points(face)} />)}
    {yellowFlatFaces.map((face, index) => <polygon key={index} className="small-semicircle-yellow-flat" points={points(face)} />)}
  </svg>;
}

function MiniMushroomSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { top, blueSides } = miniMushroomSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="mini-mushroom-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueSides.map((face, index) => <polygon key={index} className="mini-mushroom-blue-side" points={points(face)} />)}
    <polygon className="mini-mushroom-top" points={points(top)} />
  </svg>;
}

function FloorMushroomSprite({ rotation, elevation, frame }: { rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { top, blueSides } = floorMushroomSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="floor-mushroom-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueSides.map((face, index) => <polygon key={index} className="floor-mushroom-gray-side" points={points(face)} />)}
    <polygon className="floor-mushroom-brown-top" points={points(top)} />
  </svg>;
}

function ChalkBucketSprite({ color, rotation, elevation, frame }: { color: ChalkBucketColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { chalkTop, coloredSides, rimSides, handle } = chalkBucketSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`chalk-bucket-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {coloredSides.map((face, index) => <polygon key={`body-${index}`} className="chalk-bucket-body" points={points(face)} />)}
    {rimSides.map((face, index) => <polygon key={`rim-${index}`} className="chalk-bucket-rim" points={points(face)} />)}
    <polygon className="chalk-bucket-chalk" points={points(chalkTop)} />
    <polygon className="chalk-bucket-handle" points={points(handle)} />
  </svg>;
}

function MushroomMatSprite({ color, rotation, elevation, frame }: { color: MushroomMatColor; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { flange, top, bodySides, topCross } = mushroomMatSpriteGeometry(rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`mushroom-mat-sprite ${color}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    <polygon className="mushroom-mat-flange" points={points(flange)} />
    {bodySides.map((face, index) => <polygon key={index} className="mushroom-mat-side" points={points(face)} />)}
    <polygon className="mushroom-mat-top" points={points(top)} />
    {color === "gray-red-cross" ? topCross.map((face, index) => <polygon key={index} className="mushroom-mat-cross" points={points(face)} />) : null}
  </svg>;
}

function CylinderSprite({ face, rotation, elevation, frame }: { face: number; rotation: number; elevation?: number; frame: { width: number; height: number } }) {
  const { blueCurvedFaces, yellowFlatFaces } = cylinderSpriteGeometry(face, rotation, elevation, frame);
  const points = (surface: readonly { x: number; y: number }[]) => surface.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className="cylinder-sprite" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {blueCurvedFaces.map((surface, index) => <polygon key={`curve-${index}`} className="cylinder-blue-curve" points={points(surface)} />)}
    {yellowFlatFaces.map((surface, index) => <polygon key={`end-${index}`} className="cylinder-yellow-flat" points={points(surface)} />)}
  </svg>;
}

function TrapezoidMatSprite({ assetId, rotation, elevation, face, frame }: { assetId: "red-trapezoid" | "yellow-trapezoid" | "green-trapezoid"; rotation: number; elevation?: number; face: number; frame: { width: number; height: number } }) {
  const surfaces = trapezoidMatSpriteGeometry(assetId, face, rotation, elevation, frame);
  const points = (face: readonly { x: number; y: number }[]) => face.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`${assetId}-sprite`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    {surfaces.map((surface, index) => <polygon key={index} className={`${assetId}-${surface.role}`} points={points(surface.points)} />)}
  </svg>;
}

function MatPlaceholderSprite({ shape, label, frame }: { shape: MatPlaceholderShape | undefined; label: string | undefined; frame: { width: number; height: number } }) {
  const currentShape = matPlaceholderShape(shape);
  const points = matPlaceholderShapePoints(currentShape, frame).map((point) => `${point.x},${point.y}`).join(" ");
  const displayLabel = (label?.trim() || "NEW MAT").slice(0, 14).toUpperCase();
  return <svg className={`mat-placeholder-sprite ${currentShape}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    <polygon className="mat-placeholder-top" points={points} />
    <line className="mat-placeholder-stripe" x1={frame.width * .18} y1={frame.height * .8} x2={frame.width * .82} y2={frame.height * .2} />
    <text className="mat-placeholder-label" x={frame.width / 2} y={frame.height / 2} textAnchor="middle" dominantBaseline="middle">{displayLabel}</text>
  </svg>;
}

function Equipment({ object, selected, onSelect }: { object: StationObject; selected?: boolean; onSelect?: (event: React.PointerEvent<HTMLButtonElement>) => void }) {
  const layout: React.CSSProperties = {
    left: `${object.x / STATION_CANVAS.width * 100}%`,
    top: `${object.y / STATION_CANVAS.height * 100}%`,
    width: `${object.width / STATION_CANVAS.width * 100}%`,
    height: `${object.height / STATION_CANVAS.height * 100}%`,
    transform: `rotate(${object.rotation}deg)`,
    zIndex: equipmentLayerZIndex(object),
  };
  const render = (className: string, content: React.ReactNode, style = layout, ariaLabel?: string) => onSelect
    ? <button type="button" className={className} aria-label={ariaLabel} title="Double tap to show movement arrows" style={style} onPointerDown={onSelect}>{content}</button>
    : <span aria-hidden="true" className={className} style={style}>{content}</span>;
  if (object.kind === "label") return render(`station-label-object${selected ? " selected" : ""}`, object.text || "LABEL");
  if (object.kind === "arrow") return render(`station-arrow-object${selected ? " selected" : ""}`, "➜", { ...layout, fontSize: `${Math.max(16, Math.min(object.width, object.height))}px` }, "Direction arrow");
  const asset = stationAsset(object.assetId!);
  const frame = { width: object.width, height: object.height };
  if (asset.id === "panel") return render(`station-piece panel ${object.color ?? "blue"}${selected ? " selected" : ""}`, <PanelMatSprite rotation={object.rotation} elevation={object.elevation} panelState={panelMatState(object)} colorway={object.panelMatColorway} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "five-panel") return render(`station-piece panel five-panel${selected ? " selected" : ""}`, <FivePanelMatSprite rotation={object.rotation} elevation={object.elevation} panelState={panelMatState(object)} colorway={object.panelMatColorway} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "six-panel") return render(`station-piece panel six-panel${selected ? " selected" : ""}`, <SixPanelMatSprite rotation={object.rotation} elevation={object.elevation} panelState={panelMatState(object)} colorway={object.panelMatColorway} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "big-block") return render(`station-piece big-block${selected ? " selected" : ""}`, <BigBlockSprite rotation={object.rotation} elevation={object.elevation} side={bigBlockSide(object)} color={object.bigBlockColor ?? "orange"} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "bungee") {
    const color = BUNGEE_COLORS.includes(object.bungeeColor as BungeeColor) ? object.bungeeColor as BungeeColor : "black";
    return render(`station-piece bungee${selected ? " selected" : ""}`, <BungeeLoopSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "chalk-bucket") {
    const color = CHALK_BUCKET_COLORS.includes(object.chalkBucketColor as ChalkBucketColor) ? object.chalkBucketColor as ChalkBucketColor : "orange";
    return render(`station-piece chalk-bucket${selected ? " selected" : ""}`, <ChalkBucketSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "blue-resi") return render(`station-piece blue-resi${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={blueResiDimensions(stationObjectFace(object))} colors={{ top: "blue", sides: ["blue", "blue", "blue", "blue"] }} frame={frame} className="station-cuboid-sprite blue-resi-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mini-resi") return render(`station-piece mini-resi${selected ? " selected" : ""}`, <MiniResiSprite rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (isStripedResiAsset(asset.id)) {
    const color = FOUR_INCH_RESI_COLORS.includes(object.fourInchResiColor as FourInchResiColor) ? object.fourInchResiColor as FourInchResiColor : "blue";
    return render(`station-piece ${asset.id}${selected ? " selected" : ""}`, <StripedResiSprite assetId={asset.id} color={color} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "pink-beam-mat") return render(`station-piece pink-beam-mat${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={pinkBeamMatDimensions(stationObjectFace(object))} colors={{ top: "pink", sides: ["pink", "pink", "pink", "pink"] }} frame={frame} className="station-cuboid-sprite pink-beam-mat-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "cartwheel-mat") {
    const color = CARTWHEEL_MAT_COLORS.includes(object.cartwheelMatColor as CartwheelMatColor) ? object.cartwheelMatColor as CartwheelMatColor : "blue";
    return render(`station-piece cartwheel-mat${selected ? " selected" : ""}`, <CartwheelMatSprite color={color} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "stairs") return render(`station-piece stairs${selected ? " selected" : ""}`, <StairsSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "velcro-beam") {
    const color = VELCRO_BEAM_COLORS.includes(object.velcroBeamColor as VelcroBeamColor) ? object.velcroBeamColor as VelcroBeamColor : "red";
    return render(`station-piece velcro-beam${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={velcroBeamDimensions(stationObjectFace(object))} colors={{ top: color, sides: [color, color, color, color] }} frame={frame} className={`station-cuboid-sprite velcro-beam-sprite ${color}`} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "sting-mat") return render(`station-piece sting-mat${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={stingMatDimensions(stationObjectFace(object))} colors={{ top: "brown", sides: ["brown", "brown", "brown", "brown"] }} frame={frame} className="station-cuboid-sprite sting-mat-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "gym-nova-mat") return render(`station-piece gym-nova-mat${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={gymNovaMatDimensions(stationObjectFace(object))} colors={{ top: "gray", sides: ["cream", "cream", "cream", "cream"] }} frame={frame} className="station-cuboid-sprite gym-nova-mat-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "teddy-mat") return render(`station-piece teddy-mat${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={teddyMatDimensions(stationObjectFace(object))} colors={{ top: "brown", sides: ["brown", "brown", "brown", "brown"] }} frame={frame} className="station-cuboid-sprite teddy-mat-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "hand-mat") return render(`station-piece hand-mat${selected ? " selected" : ""}`, <HandMatSprite rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "red-norbert-block") return render(`station-piece red-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={redNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: "red", sides: ["red", "red", "red", "red"] }} frame={frame} className="station-cuboid-sprite red-norbert-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "squishy-norbert-block") {
    const color = SQUISHY_NORBERT_BLOCK_COLORS.includes(object.squishyNorbertBlockColor as SquishyNorbertBlockColor) ? object.squishyNorbertBlockColor as SquishyNorbertBlockColor : "blue";
    return render(`station-piece squishy-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={squishyNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: color, sides: [color, color, color, color] }} frame={frame} className={`station-cuboid-sprite squishy-norbert-block-sprite ${color}`} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "small-green-norbert-block") return render(`station-piece small-green-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={smallGreenNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: "green", sides: ["green", "green", "green", "green"] }} frame={frame} className="station-cuboid-sprite small-green-norbert-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "blue-norbert-block") return render(`station-piece blue-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={blueNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: "blue", sides: ["blue", "blue", "blue", "blue"] }} frame={frame} className="station-cuboid-sprite blue-norbert-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "green-norbert-block") return render(`station-piece green-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={greenNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: "green", sides: ["green", "green", "green", "green"] }} frame={frame} className="station-cuboid-sprite green-norbert-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mini-red-norbert-block") return render(`station-piece mini-red-norbert-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={miniRedNorbertBlockDimensions(stationObjectFace(object))} colors={{ top: "red", sides: ["red", "red", "red", "red"] }} frame={frame} className="station-cuboid-sprite mini-red-norbert-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "pbar-block") return render(`station-piece pbar-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={pbarBlockDimensions(stationObjectFace(object))} colors={pbarBlockFaceColors(stationObjectFace(object))} frame={frame} className="station-cuboid-sprite pbar-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "half-block") return render(`station-piece half-block${selected ? " selected" : ""}`, <CuboidSprite rotation={object.rotation} elevation={object.elevation} dimensions={halfBlockDimensions(stationObjectFace(object))} colors={halfBlockFaceColors(stationObjectFace(object), object.halfBlockColor ?? "green-yellow")} frame={frame} className="station-cuboid-sprite half-block-sprite" />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "big-octagon" || asset.id === "medium-octagon" || asset.id === "small-octagon") return render(`station-piece ${asset.id}${selected ? " selected" : ""}`, <OctagonSprite assetId={asset.id} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "tiny-cheese-mat" || asset.id === "small-cheese-mat" || asset.id === "medium-cheese-mat" || asset.id === "large-cheese-mat" || asset.id === "big-cheese-mat" || asset.id === "squishy-cheese-mat") return render(`station-piece ${asset.id}${selected ? " selected" : ""}`, isFoldableCheeseMatAsset(asset.id) && cheeseMatState(object) === "closed" ? <FoldedCheeseMatSprite assetId={asset.id} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} smallCheeseMatColor={object.smallCheeseMatColor ?? "orange-purple"} /> : <CheeseMatSprite assetId={asset.id} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} smallCheeseMatColor={object.smallCheeseMatColor ?? "orange-purple"} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "cloud-mat") return render(`station-piece cloud-mat${selected ? " selected" : ""}`, <CloudMatSprite rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "springboard") {
    const color = SPRINGBOARD_COLORS.includes(object.color as SpringboardColor) ? object.color as SpringboardColor : "white-grey";
    return render(`station-piece springboard${selected ? " selected" : ""}`, <SpringboardSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "preschool-springboard") return render(`station-piece preschool-springboard${selected ? " selected" : ""}`, <PreschoolSpringboardSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "t-trainer") return render(`station-piece t-trainer${selected ? " selected" : ""}`, <TTrainerSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mail-box") return render(`station-piece mail-box${selected ? " selected" : ""}`, <MailBoxSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "green-mail-box") return render(`station-piece green-mail-box${selected ? " selected" : ""}`, <GreenMailBoxSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "colt") return render(`station-piece colt${selected ? " selected" : ""}`, <ColtSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "parallette") return render(`station-piece parallette${selected ? " selected" : ""}`, <ParalletteSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mini-low-bar") {
    const baseColor = MINI_LOW_BAR_BASE_COLORS.includes(object.miniLowBarBaseColor as MiniLowBarBaseColor) ? object.miniLowBarBaseColor as MiniLowBarBaseColor : "gray";
    return render(`station-piece mini-low-bar${selected ? " selected" : ""}`, <MiniLowBarSprite baseColor={baseColor} heightInches={miniLowBarHeight(object)} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "rec-mini-bar") return render(`station-piece rec-mini-bar${selected ? " selected" : ""}`, <RecMiniBarSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "advanced-mini-bar") return render(`station-piece advanced-mini-bar${selected ? " selected" : ""}`, <AdvancedMiniBarSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "traffic-cone") return render(`station-piece traffic-cone${selected ? " selected" : ""}`, <TrafficConeSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "target-marker") return render(`station-piece target-marker${selected ? " selected" : ""}`, <TargetMarkerSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "beanbag") return render(`station-piece beanbag${selected ? " selected" : ""}`, <BeanbagSprite color={object.color ?? "blue"} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "rainbow-mat") return render(`station-piece rainbow-mat${selected ? " selected" : ""}`, <RainbowMatSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "pac-man") return render(`station-piece pac-man${selected ? " selected" : ""}`, <PacManSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "trapeze") return render(`station-piece trapeze${selected ? " selected" : ""}`, <TrapezeSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "pvc-pipe") return render(`station-piece pvc-pipe${selected ? " selected" : ""}`, <PvcPipeSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "small-bar-pad") return render(`station-piece small-bar-pad${selected ? " selected" : ""}`, <SmallBarPadSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "rolling-bar") return render(`station-piece rolling-bar${selected ? " selected" : ""}`, <RollingBarSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "wooden-climbing-ladder") return render(`station-piece wooden-climbing-ladder${selected ? " selected" : ""}`, <WoodenClimbingLadderSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "bose-ball") return render(`station-piece bose-ball${selected ? " selected" : ""}`, <BoseBallSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "foam-roller") {
    const color = FOAM_ROLLER_END_COLORS.includes(object.foamRollerEndColor as FoamRollerEndColor) ? object.foamRollerEndColor as FoamRollerEndColor : "green";
    return render(`station-piece foam-roller${selected ? " selected" : ""}`, <FoamRollerSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "yoga-ball") {
    const color = YOGA_BALL_COLORS.includes(object.yogaBallColor as YogaBallColor) ? object.yogaBallColor as YogaBallColor : "blue";
    return render(`station-piece yoga-ball${selected ? " selected" : ""}`, <YogaBallSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "mat-placeholder") return render(`station-piece mat-placeholder${selected ? " selected" : ""}`, <MatPlaceholderSprite shape={object.matPlaceholderShape} label={object.missingMatLabel} frame={frame} />, layout, `Missing mat placeholder: ${object.missingMatLabel?.trim() || "new mat"}`);
  if (asset.id === "vault-trainer") return render(`station-piece vault-trainer${selected ? " selected" : ""}`, <VaultTrainerSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "big-boulder") return render(`station-piece big-boulder${selected ? " selected" : ""}`, <BigBoulderSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "medium-boulder") return render(`station-piece medium-boulder${selected ? " selected" : ""}`, <MediumBoulderSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "small-boulder") return render(`station-piece small-boulder${selected ? " selected" : ""}`, <SmallBoulderSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "small-semicircle") return render(`station-piece small-semicircle${selected ? " selected" : ""}`, <SmallSemicircleSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mini-mushroom") return render(`station-piece mini-mushroom${selected ? " selected" : ""}`, <MiniMushroomSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "floor-mushroom") return render(`station-piece floor-mushroom${selected ? " selected" : ""}`, <FloorMushroomSprite rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "mushroom-mat") {
    const color = MUSHROOM_MAT_COLORS.includes(object.mushroomMatColor as MushroomMatColor) ? object.mushroomMatColor as MushroomMatColor : "blue-brown";
    return render(`station-piece mushroom-mat${selected ? " selected" : ""}`, <MushroomMatSprite color={color} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  }
  if (asset.id === "cylinder") return render(`station-piece cylinder${selected ? " selected" : ""}`, <CylinderSprite face={stationObjectFace(object)} rotation={object.rotation} elevation={object.elevation} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  if (asset.id === "red-trapezoid" || asset.id === "yellow-trapezoid" || asset.id === "green-trapezoid") return render(`station-piece ${asset.id}${selected ? " selected" : ""}`, <TrapezoidMatSprite assetId={asset.id} rotation={object.rotation} elevation={object.elevation} face={stationObjectFace(object)} frame={frame} />, { ...layout, transform: "none" }, asset.name);
  return render(`station-piece ${asset.id} ${object.color ?? "blue"}${selected ? " selected" : ""}`, <span>{asset.id === "beam" ? "" : asset.name}</span>, layout, asset.name);
}

/** Raised equipment casts a crisp footprint on the floor layer beneath every piece. */
function EquipmentShadow({ object }: { object: StationObject }) {
  if (object.kind !== "equipment" || (object.elevation ?? 0) <= 0) return null;
  const footprint = stationObjectFootprint({ ...object, elevation: 0 });
  const points = footprint.map((point) => `${point.x - object.x},${point.y - object.y}`).join(" ");
  const style: React.CSSProperties = {
    left: `${object.x / STATION_CANVAS.width * 100}%`,
    top: `${object.y / STATION_CANVAS.height * 100}%`,
    width: `${object.width / STATION_CANVAS.width * 100}%`,
    height: `${object.height / STATION_CANVAS.height * 100}%`,
  };
  return <span aria-hidden="true" className="station-ground-shadow" style={style}><svg viewBox={`0 0 ${object.width} ${object.height}`} preserveAspectRatio="none" shapeRendering="crispEdges"><polygon points={points} /></svg></span>;
}

function StationShadowLayer({ objects }: { objects: readonly StationObject[] }) {
  return <div className="station-shadow-layer" aria-hidden="true">{objects.map((object) => <EquipmentShadow key={object.id} object={object} />)}</div>;
}

/**
 * The bottom edge of an object's real floor footprint is its projected depth.
 * Paint from the back of the gym toward the front, so a nearer Resi can hide
 * the part of a board that is physically behind it. Creation order is only a
 * deterministic tie breaker.
 */
function stationObjectProjectedDepth(object: StationObject) {
  return Math.max(...stationObjectFloorFootprint(object).map((point) => point.y));
}

function compareStationObjectLayers(first: StationObject, second: StationObject) {
  const elevationDifference = (first.elevation ?? 0) - (second.elevation ?? 0);
  if (elevationDifference) return elevationDifference;
  const depthDifference = stationObjectProjectedDepth(first) - stationObjectProjectedDepth(second);
  return depthDifference || first.zIndex - second.zIndex;
}

function equipmentLayerZIndex(object: StationObject) {
  const elevation = Math.round((object.elevation ?? 0) / STATION_STACK_STEP);
  return elevation * 100000 + Math.round(stationObjectProjectedDepth(object)) * 100 + object.zIndex;
}

/** Projects an elevated piece's pixel silhouette onto the visible support beneath it. */
function EquipmentSupportShadow({ support, object }: { support: StationObject; object: StationObject }) {
  if (support.kind !== "equipment" || object.kind !== "equipment") return null;
  const supportRange = stationObjectVerticalRange(support);
  const objectRange = stationObjectVerticalRange(object);
  const gap = objectRange.base - supportRange.top;
  if (gap < 0) return null;
  const supportFootprint = stationObjectFootprint(support);
  const shadowFootprint = stationObjectFootprint({ ...object, elevation: supportRange.top });
  const clipPath = `polygon(${supportFootprint.map((point) => `${point.x / STATION_CANVAS.width * 100}% ${point.y / STATION_CANVAS.height * 100}%`).join(",")})`;
  const points = shadowFootprint.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg aria-hidden="true" className="station-support-shadow" style={{ zIndex: equipmentLayerZIndex(support) + 50, opacity: Math.min(.5, .18 + gap / 288 * .32), clipPath }} viewBox={`0 0 ${STATION_CANVAS.width} ${STATION_CANVAS.height}`} preserveAspectRatio="none" shapeRendering="crispEdges"><polygon points={points} /></svg>;
}

function StationEquipmentLayers({ objects, selectedId, onSelect }: { objects: readonly StationObject[]; selectedId?: string | null; onSelect?: (event: React.PointerEvent<HTMLButtonElement>, object: StationObject) => void }) {
  const ordered = objects.slice().sort(compareStationObjectLayers);
  return <><StationShadowLayer objects={ordered} />{ordered.map((support, index) => <span key={support.id}><Equipment object={support} selected={selectedId === support.id} onSelect={onSelect ? (event) => onSelect(event, support) : undefined} />{ordered.slice(index + 1).map((object) => <EquipmentSupportShadow key={`${support.id}-${object.id}`} support={support} object={object} />)}</span>)}</>;
}

/** The board uses the same skewed depth axis as the hard-edged 2.5D equipment. */
function StationFloorGrid() {
  const rowStep = STATION_CANVAS.grid * STATION_2P5D_PROJECTION.depthY;
  const columnStep = STATION_CANVAS.grid * STATION_2P5D_PROJECTION.x;
  const depthRun = STATION_CANVAS.height * Math.abs(STATION_2P5D_PROJECTION.depthX / STATION_2P5D_PROJECTION.depthY);
  const rows = Array.from({ length: Math.ceil(STATION_CANVAS.height / rowStep) + 1 }, (_, index) => index * rowStep);
  const columns = Array.from({ length: Math.ceil((STATION_CANVAS.width + depthRun) / columnStep) + 1 }, (_, index) => index * columnStep);
  return <svg className="station-floor-grid" viewBox={`0 0 ${STATION_CANVAS.width} ${STATION_CANVAS.height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    <g className="station-floor-grid-lines">
      {rows.map((y) => <line key={`row-${y}`} className="station-floor-grid-line" x1="0" y1={y} x2={STATION_CANVAS.width} y2={y} />)}
      {columns.map((x) => <line key={`column-${x}`} className="station-floor-grid-line" x1={x} y1="0" x2={x - depthRun} y2={STATION_CANVAS.height} />)}
    </g>
  </svg>;
}

export function StationPreview({ setup, label }: { setup: StationSetup | null | undefined; label: string }) {
  if (!setup) return <div className="station-preview-empty"><StationFloorGrid /><span className="station-preview-empty-copy">PIXEL STATION<br />LOCAL PREVIEW</span></div>;
  const current = normalizeStationSetupDimensions(setup);
  const crop = stationSetupCropBounds(current);
  const cropStyle: React.CSSProperties = { left: `${-crop.x / crop.width * 100}%`, top: `${-crop.y / crop.height * 100}%`, width: `${STATION_CANVAS.width / crop.width * 100}%`, height: `${STATION_CANVAS.height / crop.height * 100}%` };
  const previewStyle: React.CSSProperties = { aspectRatio: `${crop.width} / ${crop.height}` };
  return <div className="station-preview" style={previewStyle} aria-label={`Pixel station preview for ${label}`}><div className="station-preview-board" style={cropStyle}><StationFloorGrid /><StationEquipmentLayers objects={current.objects} /></div></div>;
}

type Drag = { id: string; pointerId: number; startX: number; startY: number; objectX: number; objectY: number };
type Tap = { id: string; at: number };

export function StationMakerDialog({ setup, onSave, onCancel }: { setup: StationSetup; onSave: (setup: StationSetup) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<StationSetup>(() => normalizeStationSetupDimensions(setup));
  const [matCollectionTodos, setMatCollectionTodos] = useState<MatCollectionTodo[]>(() => setup.objects.reduce<MatCollectionTodo[]>((todos, object) => {
    const todo = matCollectionTodoForObject(object);
    return todo ? mergeMatCollectionTodo(todos, todo) : todos;
  }, loadMatCollectionTodos()));
  const [selectedId, setSelectedId] = useState<string | null>(draft.objects.at(-1)?.id ?? null);
  const [moveGizmoId, setMoveGizmoId] = useState<string | null>(null);
  const [viewZoom, setViewZoom] = useState<(typeof STATION_VIEW_ZOOMS)[number]>(1);
  const [viewPan, setViewPan] = useState<StationViewPan>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const lastTapRef = useRef<Tap | null>(null);
  const nudgeHoldRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedPointerNudgeRef = useRef(false);
  const verticalHoldRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedPointerVerticalRef = useRef(false);
  const playStationSound = useStationSounds();
  const selected = draft.objects.find((object) => object.id === selectedId) ?? null;

  const queueMatPlaceholderTodo = useCallback((object: StationObject) => {
    const todo = matCollectionTodoForObject(object);
    if (todo) setMatCollectionTodos((current) => mergeMatCollectionTodo(current, todo));
  }, []);

  useEffect(() => {
    draft.objects.forEach(queueMatPlaceholderTodo);
  }, [draft.objects, queueMatPlaceholderTodo]);

  useEffect(() => {
    if (typeof globalThis.localStorage === "undefined") return;
    try { globalThis.localStorage.setItem(MAT_COLLECTION_TODO_STORAGE_KEY, JSON.stringify(matCollectionTodos)); } catch { /* Keep the board usable if browser storage is full or blocked. */ }
  }, [matCollectionTodos]);

  const revise = (change: (current: StationSetup) => StationSetup) => setDraft((current) => {
    const next = change(current);
    return next === current ? current : { ...next, updatedAt: new Date().toISOString() };
  });
  const placeSelected = (current: StationSetup, object: StationObject) => {
    const occupied = current.objects.filter((item) => item.id !== object.id);
    const placed = autoStackStationObject(object, occupied);
    return placed ? { ...current, objects: current.objects.map((item) => item.id === object.id ? placed : item) } : current;
  };
  const findOpenPlacement = (object: StationObject, occupied: readonly StationObject[]) => {
    const placements = [{ x: object.x, y: object.y }];
    for (let y = 0; y <= STATION_CANVAS.height - object.height; y += STATION_CANVAS.grid) for (let x = 0; x <= STATION_CANVAS.width - object.width; x += STATION_CANVAS.grid) placements.push({ x, y });
    return placements.map((placement) => constrainStationObjectToCanvas({ ...object, ...placement })).find((candidate) => canPlaceStationObject(candidate, occupied)) ?? null;
  };
  const addEquipment = (assetId: StationAssetId) => revise((current) => {
    const object = createStationObject(assetId, Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1);
    const placed = findOpenPlacement(object, current.objects);
    if (!placed) return current;
    setSelectedId(placed.id);
    return { ...current, objects: [...current.objects, placed] };
  });
  const addAnnotation = (kind: "label" | "arrow") => revise((current) => {
    const zIndex = Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1;
    const object: StationObject = kind === "label"
      ? { id: `station-label-${Date.now()}`, kind, text: "START HERE", x: 128, y: 96, width: 160, height: 32, rotation: 0, zIndex }
      : { id: `station-arrow-${Date.now()}`, kind, x: 160, y: 160, width: 64, height: 32, rotation: 0, zIndex };
    const placed = findOpenPlacement(object, current.objects);
    if (!placed) return current;
    setSelectedId(placed.id);
    return { ...current, objects: [...current.objects, placed] };
  });
  const addEquipmentWithSound = (assetId: StationAssetId) => { playStationSound("place"); addEquipment(assetId); };
  const addAnnotationWithSound = (kind: "label" | "arrow") => { playStationSound("place"); addAnnotation(kind); };
  const patchSelected = (patch: Partial<StationObject>) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, constrainStationObjectToCanvas({ ...object, ...patch })) : current;
  });
  const nudgeSelected = (direction: StationNudgeDirection) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, nudgeStationObject(object, direction)) : current;
  });
  const nudgeSelectedWithSound = (direction: StationNudgeDirection) => { playStationSound("move"); nudgeSelected(direction); };
  const rotateSelected = (direction: StationRotationDirection) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, rotateStationObject(object, direction)) : current;
  });
  const rotateSelectedWithSound = (direction: StationRotationDirection) => { playStationSound("rotate"); rotateSelected(direction); };
  const moveSelectedVertical = (direction: StationElevationDirection) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, moveStationObjectVertical(object, direction)) : current;
  });
  const moveSelectedVerticalWithSound = (direction: StationElevationDirection) => { playStationSound("place"); moveSelectedVertical(direction); };
  const changeSelectedPanelState = (panelState: "closed" | "open") => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, constrainStationObjectToCanvas(setPanelMatState(object, panelState))) : current;
  });
  const changeSelectedPanelStateWithSound = (panelState: "closed" | "open") => { playStationSound(panelState === "open" ? "open" : "close"); changeSelectedPanelState(panelState); };
  const changeSelectedCheeseMatState = (cheeseMatState: "closed" | "open") => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, constrainStationObjectToCanvas(setCheeseMatState(object, cheeseMatState))) : current;
  });
  const changeSelectedCheeseMatStateWithSound = (cheeseMatState: "closed" | "open") => { playStationSound(cheeseMatState === "open" ? "open" : "close"); changeSelectedCheeseMatState(cheeseMatState); };
  const changeSelectedMatPlaceholderShape = (shape: MatPlaceholderShape) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, constrainStationObjectToCanvas(setMatPlaceholderShape(object, shape))) : current;
  });
  const flipSelectedFace = (direction: StationFlipDirection) => selected && revise((current) => {
    const object = current.objects.find((item) => item.id === selected.id);
    return object ? placeSelected(current, constrainStationObjectToCanvas(flipStationObjectFace(object, direction))) : current;
  });
  const flipSelectedFaceWithSound = (direction: StationFlipDirection) => { playStationSound("rotate"); flipSelectedFace(direction); };
  const markMatCollectionTodoAdded = (id: string) => setMatCollectionTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: true } : todo));
  const removeSelected = () => { if (!selected) return; playStationSound("delete"); revise((current) => ({ ...current, objects: current.objects.filter((object) => object.id !== selected.id) })); };
  const stopNudge = () => {
    if (nudgeHoldRef.current) clearInterval(nudgeHoldRef.current);
    nudgeHoldRef.current = null;
  };
  const startNudge = (event: React.PointerEvent<HTMLButtonElement>, direction: StationNudgeDirection) => {
    event.preventDefault();
    usedPointerNudgeRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    stopNudge(); nudgeSelectedWithSound(direction);
    nudgeHoldRef.current = setInterval(() => nudgeSelectedWithSound(direction), 45);
  };
  const clickNudge = (direction: StationNudgeDirection) => {
    if (usedPointerNudgeRef.current) { usedPointerNudgeRef.current = false; return; }
    nudgeSelectedWithSound(direction);
  };
  const nudgeButtonProps = (direction: StationNudgeDirection) => ({
    onClick: () => clickNudge(direction),
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => startNudge(event, direction),
    onPointerUp: stopNudge,
    onPointerCancel: () => { usedPointerNudgeRef.current = false; stopNudge(); },
    onLostPointerCapture: stopNudge,
  });
  const stopVerticalMove = () => {
    if (verticalHoldRef.current) clearInterval(verticalHoldRef.current);
    verticalHoldRef.current = null;
  };
  const startVerticalMove = (event: React.PointerEvent<HTMLButtonElement>, direction: StationElevationDirection) => {
    event.preventDefault();
    usedPointerVerticalRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    stopVerticalMove(); moveSelectedVerticalWithSound(direction);
    verticalHoldRef.current = setInterval(() => moveSelectedVerticalWithSound(direction), 90);
  };
  const clickVerticalMove = (direction: StationElevationDirection) => {
    if (usedPointerVerticalRef.current) { usedPointerVerticalRef.current = false; return; }
    moveSelectedVerticalWithSound(direction);
  };
  const verticalMoveButtonProps = (direction: StationElevationDirection) => ({
    onClick: () => clickVerticalMove(direction),
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => startVerticalMove(event, direction),
    onPointerUp: stopVerticalMove,
    onPointerCancel: () => { usedPointerVerticalRef.current = false; stopVerticalMove(); },
    onLostPointerCapture: stopVerticalMove,
  });
  useEffect(() => () => { stopNudge(); stopVerticalMove(); }, []);

  const beginDrag = (event: React.PointerEvent, object: StationObject) => {
    event.preventDefault(); event.stopPropagation();
    setSelectedId(object.id);
    if (moveGizmoId !== object.id) setMoveGizmoId(null);
    dragRef.current = { id: object.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, objectX: object.x, objectY: object.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = dragRef.current; const bounds = canvasRef.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !bounds) return;
    const x = Math.round((active.objectX + (event.clientX - active.startX) / bounds.width * STATION_CANVAS.width) / STATION_CANVAS.grid) * STATION_CANVAS.grid;
    const y = Math.round((active.objectY + (event.clientY - active.startY) / bounds.height * STATION_CANVAS.height) / STATION_CANVAS.grid) * STATION_CANVAS.grid;
    revise((current) => {
      const object = current.objects.find((item) => item.id === active.id);
      return object ? placeSelected(current, constrainStationObjectToCanvas({ ...object, x, y })) : current;
    });
  };
  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = dragRef.current;
    dragRef.current = null;
    if (!active || active.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - active.startX, event.clientY - active.startY) > 8) { setMoveGizmoId(null); lastTapRef.current = null; return; }
    const now = event.timeStamp;
    if (lastTapRef.current?.id === active.id && now - lastTapRef.current.at < 400) {
      setMoveGizmoId(active.id);
      lastTapRef.current = null;
      return;
    }
    lastTapRef.current = { id: active.id, at: now };
  };

  const canSave = isStationSetupSaveable(draft);
  const viewZoomIndex = STATION_VIEW_ZOOMS.indexOf(viewZoom);
  const panStationView = useCallback((direction: StationViewDirection) => {
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (!bounds || viewZoom <= 1) return;
    const step = { x: Math.max(32, bounds.width * .18), y: Math.max(32, bounds.height * .18) };
    const offset = direction === "up" ? { x: 0, y: step.y }
      : direction === "right" ? { x: -step.x, y: 0 }
        : direction === "down" ? { x: 0, y: -step.y }
          : { x: step.x, y: 0 };
    setViewPan((current) => constrainStationViewPan({ x: current.x + offset.x, y: current.y + offset.y }, viewZoom, bounds));
  }, [viewZoom]);
  const changeViewZoom = (direction: -1 | 1) => {
    const next = STATION_VIEW_ZOOMS[viewZoomIndex + direction] ?? viewZoom;
    setViewZoom(next);
    const bounds = viewportRef.current?.getBoundingClientRect();
    setViewPan((current) => bounds ? constrainStationViewPan(current, next, bounds) : current);
  };
  useEffect(() => {
    const panWithArrowKey = (event: KeyboardEvent) => {
      if (viewZoom <= 1 || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      const direction = event.key === "ArrowUp" ? "up" : event.key === "ArrowRight" ? "right" : event.key === "ArrowDown" ? "down" : event.key === "ArrowLeft" ? "left" : null;
      if (!direction) return;
      event.preventDefault();
      panStationView(direction);
    };
    window.addEventListener("keydown", panWithArrowKey);
    return () => window.removeEventListener("keydown", panWithArrowKey);
  }, [viewZoom, panStationView]);
  const cropToContent = () => revise(cropStationSetupToContent);
  const resetCrop = () => revise(clearStationSetupCrop);
  const selectedMoveGizmo = selected && moveGizmoId === selected.id ? (() => {
    const arrows = NUDGE_DIRECTIONS.map((direction) => {
      const vector = localNudgeVector(selected.rotation, direction);
      return { direction, x: MOVE_GIZMO.center + vector.x * MOVE_GIZMO.radius, y: MOVE_GIZMO.center + vector.y * MOVE_GIZMO.radius, rotation: Math.atan2(vector.y, vector.x) * 180 / Math.PI + 90, color: direction === "north" || direction === "south" ? "blue" : "red" };
    });
    return { left: `${(selected.x + selected.width / 2) / STATION_CANVAS.width * 100}%`, top: `${(selected.y + selected.height / 2) / STATION_CANVAS.height * 100}%`, arrows };
  })() : null;
  const activeMatCollectionTodos = matCollectionTodos.filter((todo) => !todo.completed);

  return <div className="station-maker-scrim" role="presentation">
    <section className="station-maker retro-window" role="dialog" aria-modal="true" aria-label="Make pixel station">
      <div className="window-title"><b>MAKE STATION</b><span>PIXEL SETUP · SYNCED WITH RYAN’S IDEA LIBRARY</span><button type="button" onClick={onCancel} aria-label="Close station maker">×</button></div>
      <div className="station-maker-body">
        <aside className="station-palette"><b>BUILDING BLOCKS</b>{stationMakerAssets.map((asset) => <button key={asset.id} type="button" onClick={() => addEquipmentWithSound(asset.id)}><i className={`station-palette-icon ${asset.id}`} /><span>{asset.name}</span></button>)}<hr /><b>MATS TO ADD</b><div className="station-mat-todo-list" aria-live="polite">{activeMatCollectionTodos.length ? activeMatCollectionTodos.map((todo) => <div key={todo.id} className="station-mat-todo"><span>{todo.label} · {MAT_PLACEHOLDER_SHAPE_LABELS[todo.shape]}</span><button type="button" onClick={() => markMatCollectionTodoAdded(todo.id)} aria-label={`Mark ${todo.label} as added to the collection`}>✓ ADDED</button></div>) : <span className="station-mat-todo-empty">ADD A PLACEHOLDER TO TRACK A MAT</span>}</div><hr /><button type="button" onClick={() => addAnnotationWithSound("label")}>+ TEXT LABEL</button><button type="button" onClick={() => addAnnotationWithSound("arrow")}>+ ARROW</button></aside>
        <div className="station-maker-center">
          <div className="station-view-controls" aria-label="Station board zoom"><b>VIEW</b><button type="button" onClick={() => changeViewZoom(-1)} disabled={viewZoomIndex === 0} aria-label="Zoom station board out">−</button><span>{Math.round(viewZoom * 100)}%</span><button type="button" onClick={() => changeViewZoom(1)} disabled={viewZoomIndex === STATION_VIEW_ZOOMS.length - 1} aria-label="Zoom station board in">+</button></div>
          {viewZoom > 1 ? <div className="station-view-pan-controls" aria-label="Move around zoomed station board"><b>MOVE VIEW</b><button type="button" onClick={() => panStationView("up")} aria-label="Move view up">↑</button><button type="button" onClick={() => panStationView("left")} aria-label="Move view left">←</button><button type="button" onClick={() => panStationView("down")} aria-label="Move view down">↓</button><button type="button" onClick={() => panStationView("right")} aria-label="Move view right">→</button><span>KEYS TOO</span></div> : null}
          <div className="station-crop-controls"><button type="button" disabled={!draft.objects.length} onClick={cropToContent}>CROP TO CONTENT</button><button type="button" disabled={!draft.crop} onClick={resetCrop}>FULL FRAME</button></div>
          <div ref={viewportRef} className="station-canvas-viewport">
            <div ref={canvasRef} className="station-canvas" style={{ transform: `translate(${viewPan.x}px, ${viewPan.y}px) scale(${viewZoom})` }} onPointerMove={drag} onPointerUp={finishDrag} onPointerCancel={() => { dragRef.current = null; lastTapRef.current = null; }}>
              <StationFloorGrid />
              <StationEquipmentLayers objects={draft.objects} selectedId={selectedId} onSelect={(event, object) => beginDrag(event, object)} />
              {!draft.objects.length ? <span className="station-canvas-hint">PICK A MAT, THEN DRAG IT INTO PLACE</span> : null}
              {selectedMoveGizmo ? <div className="station-move-gizmo" style={{ left: selectedMoveGizmo.left, top: selectedMoveGizmo.top }} aria-label="Hold a local direction arrow to move the selected piece"><svg className="station-move-gizmo-art" viewBox={`0 0 ${MOVE_GIZMO.size} ${MOVE_GIZMO.size}`} shapeRendering="crispEdges" aria-hidden="true">{selectedMoveGizmo.arrows.map((arrow) => <g key={arrow.direction}><line className="station-move-gizmo-shadow" x1={MOVE_GIZMO.center} y1={MOVE_GIZMO.center} x2={arrow.x} y2={arrow.y} /><line className={`station-move-gizmo-axis ${arrow.color}`} x1={MOVE_GIZMO.center} y1={MOVE_GIZMO.center} x2={arrow.x} y2={arrow.y} /></g>)}</svg>{selectedMoveGizmo.arrows.map((arrow) => <button key={arrow.direction} type="button" className={`station-move-gizmo-arrow ${arrow.color}`} style={{ left: `${arrow.x}px`, top: `${arrow.y}px`, transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)` }} {...nudgeButtonProps(arrow.direction)} aria-label={`Hold to move selected piece toward its local ${arrow.direction}`} title={`Hold to move local ${arrow.direction}`}>▲</button>)}</div> : null}
            </div>
          </div>
          <p>GRID: APPROXIMATE MAT SCALE · TALL PIECES USE A PIXEL SIDE + SHADOW</p>
        </div>
        <aside className="station-inspector">
          <b>SELECTED PIECE</b>
          {selected ? <>
            <strong>{selected.kind === "equipment" ? stationAsset(selected.assetId!).name : selected.kind.toUpperCase()}</strong>
            {selected.kind === "equipment" && selected.assetId !== "panel" && selected.assetId !== "five-panel" && selected.assetId !== "six-panel" && selected.assetId !== "big-block" && selected.assetId !== "blue-resi" && selected.assetId !== "mini-resi" && !isStripedResiAsset(selected.assetId) && selected.assetId !== "pink-beam-mat" && selected.assetId !== "cartwheel-mat" && selected.assetId !== "velcro-beam" && selected.assetId !== "sting-mat" && selected.assetId !== "gym-nova-mat" && selected.assetId !== "teddy-mat" && selected.assetId !== "hand-mat" && selected.assetId !== "red-norbert-block" && selected.assetId !== "blue-norbert-block" && selected.assetId !== "green-norbert-block" && selected.assetId !== "mini-red-norbert-block" && selected.assetId !== "squishy-norbert-block" && selected.assetId !== "small-green-norbert-block" && selected.assetId !== "pbar-block" && selected.assetId !== "half-block" && selected.assetId !== "big-octagon" && selected.assetId !== "medium-octagon" && selected.assetId !== "small-octagon" && selected.assetId !== "tiny-cheese-mat" && selected.assetId !== "small-cheese-mat" && selected.assetId !== "medium-cheese-mat" && selected.assetId !== "large-cheese-mat" && selected.assetId !== "big-cheese-mat" && selected.assetId !== "squishy-cheese-mat" && selected.assetId !== "cloud-mat" && selected.assetId !== "springboard" && selected.assetId !== "preschool-springboard" && selected.assetId !== "t-trainer" && selected.assetId !== "mail-box" && selected.assetId !== "green-mail-box" && selected.assetId !== "colt" && selected.assetId !== "parallette" && selected.assetId !== "mini-low-bar" && selected.assetId !== "rec-mini-bar" && selected.assetId !== "advanced-mini-bar" && selected.assetId !== "traffic-cone" && selected.assetId !== "target-marker" && selected.assetId !== "rainbow-mat" && selected.assetId !== "pac-man" && selected.assetId !== "trapeze" && selected.assetId !== "pvc-pipe" && selected.assetId !== "small-bar-pad" && selected.assetId !== "rolling-bar" && selected.assetId !== "wooden-climbing-ladder" && selected.assetId !== "bose-ball" && selected.assetId !== "foam-roller" && selected.assetId !== "chalk-bucket" && selected.assetId !== "yoga-ball" && selected.assetId !== "vault-trainer" && selected.assetId !== "big-boulder" && selected.assetId !== "medium-boulder" && selected.assetId !== "small-boulder" && selected.assetId !== "small-semicircle" && selected.assetId !== "mini-mushroom" && selected.assetId !== "floor-mushroom" && selected.assetId !== "mushroom-mat" && selected.assetId !== "cylinder" && selected.assetId !== "red-trapezoid" && selected.assetId !== "yellow-trapezoid" && selected.assetId !== "green-trapezoid" && selected.assetId !== "bungee" && selected.assetId !== "mat-placeholder" ? <label>COLOR<select value={selected.color} onChange={(event) => patchSelected({ color: event.target.value as StationColor })}>{COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label> : null}
            {selected.kind === "equipment" && selected.assetId === "colt" ? <span>CARAMEL TOP · GRAY BASE · 31 IN × 15 IN × 16 IN · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "green-mail-box" ? <span>GREEN CURVED SIDES · YELLOW FLAT ENDS · 24 IN × 17.5 IN × 33 IN · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "small-semicircle" ? <span>BLUE CURVED SURFACE · YELLOW FLAT ENDS · 25.5 IN DIAMETER · 15 IN DEEP · 12.75 IN HIGH · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "parallette" ? <span>WOOD · 12 IN LONG · 8 IN BASE · 5 IN HIGH · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "mini-low-bar" ? <><label>BASE COLOR<select value={MINI_LOW_BAR_BASE_COLORS.includes(selected.miniLowBarBaseColor as MiniLowBarBaseColor) ? selected.miniLowBarBaseColor : "gray"} onChange={(event) => patchSelected({ miniLowBarBaseColor: event.target.value as MiniLowBarBaseColor })}>{MINI_LOW_BAR_BASE_COLORS.map((color) => <option key={color} value={color}>{MINI_LOW_BAR_BASE_COLOR_LABELS[color]}</option>)}</select></label><label>RAIL HEIGHT<select value={miniLowBarHeight(selected)} onChange={(event) => patchSelected({ miniLowBarHeightInches: Number(event.target.value) as MiniLowBarHeightInches })}>{MINI_LOW_BAR_HEIGHTS_INCHES.map((height) => <option key={height} value={height}>{height} IN</option>)}</select></label><span>BROWN RAIL · 51 IN LONG · 18 IN BASE · {miniLowBarHeight(selected)} IN HIGH · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "rec-mini-bar" ? <span>TAN RAIL · 51 IN LONG · 39 IN HIGH · BLUE BASES · NO GREEN TIE · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "advanced-mini-bar" ? <span>TAN RAIL · 69 IN LONG · 44 IN HIGH · ORANGE BASES · GREEN MOUNTS · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "traffic-cone" ? <span>ORANGE TRAFFIC CONE · 7 IN TALL · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "target-marker" ? <span>YELLOW TARGET · 9 IN DIAMETER · RED CENTER · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "beanbag" ? <span>5.5 IN SQUARE · 0.5 IN CENTER · TAPERS TO EDGE · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "rainbow-mat" ? <span>BLUE ARCH · CYAN / YELLOW ENDS · RED TUNNEL · 49 IN DIAMETER · 15.5 IN DEEP · 24 IN OPENING · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "pac-man" ? <span>YELLOW TOP · RED CURVED / CUTOUT SIDES · 32 IN DIAMETER · 27 IN TALL · QUARTER OPENING · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "trapeze" ? <span>BROWN BAR · 21 IN LONG · 1.5 IN THICK · BLACK STRAPS · 24 IN LONG · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "pvc-pipe" ? <span>WHITE PVC · 36 IN LONG · 1 IN DIAMETER · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "small-bar-pad" ? <span>RED · 9 IN LONG · 2 IN THICK · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "rolling-bar" ? <span>RED BAR · 17 IN LONG · 1.5 IN THICK · BLUE OCTAGONS · 5 IN · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "wooden-climbing-ladder" ? <span>LIGHT WOOD · 72 IN LONG · 19 IN WIDE · 3.5 IN THICK · 8 RUNGS · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "bose-ball" ? <span>DARK GRAY · 21 IN DIAMETER · 10.5 IN HIGH · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "foam-roller" ? <><label>ROUND ENDS<select value={FOAM_ROLLER_END_COLORS.includes(selected.foamRollerEndColor as FoamRollerEndColor) ? selected.foamRollerEndColor : "green"} onChange={(event) => patchSelected({ foamRollerEndColor: event.target.value as FoamRollerEndColor })}>{FOAM_ROLLER_END_COLORS.map((color) => <option key={color} value={color}>{FOAM_ROLLER_END_COLOR_LABELS[color]}</option>)}</select></label><span>GRAY SIDES · 18 IN LONG · 5.5 IN DIAMETER · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "chalk-bucket" ? <><label>COLOR<select value={CHALK_BUCKET_COLORS.includes(selected.chalkBucketColor as ChalkBucketColor) ? selected.chalkBucketColor : "orange"} onChange={(event) => patchSelected({ chalkBucketColor: event.target.value as ChalkBucketColor })}>{CHALK_BUCKET_COLORS.map((color) => <option key={color} value={color}>{CHALK_BUCKET_COLOR_LABELS[color]}</option>)}</select></label><span>HOME DEPOT-STYLE PAIL · 12 IN DIAMETER · 15 IN TALL · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "yoga-ball" ? <><label>COLOR<select value={YOGA_BALL_COLORS.includes(selected.yogaBallColor as YogaBallColor) ? selected.yogaBallColor : "blue"} onChange={(event) => patchSelected({ yogaBallColor: event.target.value as YogaBallColor })}>{YOGA_BALL_COLORS.map((color) => <option key={color} value={color}>{YOGA_BALL_COLOR_LABELS[color]}</option>)}</select></label><span>20 IN DIAMETER · FULL SPHERE · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "mat-placeholder" ? <><label>MAT NAME<input value={selected.missingMatLabel ?? ""} maxLength={40} onChange={(event) => patchSelected({ missingMatLabel: event.target.value })} /></label><label>SHAPE<select value={matPlaceholderShape(selected.matPlaceholderShape)} onChange={(event) => changeSelectedMatPlaceholderShape(event.target.value as MatPlaceholderShape)}>{MAT_PLACEHOLDER_SHAPES.map((shape) => <option key={shape} value={shape}>{MAT_PLACEHOLDER_SHAPE_LABELS[shape]}</option>)}</select></label><span>ON YOUR LOCAL MATS-TO-ADD LIST · PLACEHOLDER ONLY · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "vault-trainer" ? <span>BLUE BODY · WORN TAN TOP · 47 IN × 38 IN BASE · 49 IN TALL · 15 IN ROUND EDGE · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "bungee" ? <><label>COLOR<select value={BUNGEE_COLORS.includes(selected.bungeeColor as BungeeColor) ? selected.bungeeColor : "black"} onChange={(event) => patchSelected({ bungeeColor: event.target.value as BungeeColor })}>{BUNGEE_COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label><span>CONTINUOUS LOOP · 41 IN LAY-FLAT · 82 IN CIRCUMFERENCE · 3/16 IN THICK</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "mushroom-mat" ? <><label>COLOR<select value={MUSHROOM_MAT_COLORS.includes(selected.mushroomMatColor as MushroomMatColor) ? selected.mushroomMatColor : "blue-brown"} onChange={(event) => patchSelected({ mushroomMatColor: event.target.value as MushroomMatColor })}>{MUSHROOM_MAT_COLORS.map((color) => <option key={color} value={color}>{MUSHROOM_MAT_COLOR_LABELS[color]}</option>)}</select></label><span>22 IN DIAMETER · 16 IN TALL · NO FLIP</span></> : null}
            {selected.kind === "equipment" && selected.assetId === "springboard" ? <label>COLOR<select value={SPRINGBOARD_COLORS.includes(selected.color as SpringboardColor) ? selected.color : "white-grey"} onChange={(event) => patchSelected({ color: event.target.value as SpringboardColor })}>{SPRINGBOARD_COLORS.map((color) => <option key={color} value={color}>{SPRINGBOARD_COLOR_LABELS[color]}</option>)}</select></label> : null}
            {selected.kind === "equipment" && selected.assetId === "preschool-springboard" ? <span>RED BOARD · 30 IN × 20 IN · 0–6.5 IN RISE · 4 RED SPRINGS · NO FLIP</span> : null}
            {selected.kind === "equipment" && (selected.assetId === "panel" || selected.assetId === "five-panel" || selected.assetId === "six-panel") ? <><label>COLOR<select value={selected.panelMatColorway ?? panelMatDefaultColorway(selected.assetId)} onChange={(event) => patchSelected({ panelMatColorway: event.target.value as PanelMatColorway })}>{panelMatColorwayOptions(selected.assetId).map((colorway) => <option key={colorway} value={colorway}>{PANEL_MAT_COLORWAY_LABELS[colorway]}</option>)}</select></label><span>{stationAsset(selected.assetId).name}: {panelMatState(selected).toUpperCase()}</span><span>{selected.assetId === "five-panel" ? "5 PANELS · 5 FT × 2 FT EACH · 1.1 IN THICK" : selected.assetId === "six-panel" ? "6 PANELS · 6 FT × 2 FT EACH · 1.1 IN THICK" : "4 PANELS · 1.5 IN THICK"}</span><span>NO FLIP · FOLDING MAT</span><button type="button" className="station-panel-action" onClick={() => changeSelectedPanelStateWithSound(panelMatState(selected) === "closed" ? "open" : "closed")}>{panelMatState(selected) === "closed" ? `OPEN ${stationAsset(selected.assetId).name}` : `CLOSE ${stationAsset(selected.assetId).name}`}</button></> : null}
                  {selected.kind === "equipment" && selected.assetId === "big-block" ? <><label>COLOR<select value={selected.bigBlockColor ?? BIG_BLOCK_COLORS[0]} onChange={(event) => patchSelected({ bigBlockColor: event.target.value as BigBlockColor })}>{BIG_BLOCK_COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label><span>SIDE: {bigBlockSide(selected) + 1}/6 · {bigBlockDimensions(bigBlockSide(selected)).widthFeet} FT × {bigBlockDimensions(bigBlockSide(selected)).depthFeet} FT TOP · {bigBlockDimensions(bigBlockSide(selected)).heightFeet} FT TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP SIDE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP SIDE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "pbar-block" ? <><span>FACE: {stationObjectFace(selected) + 1}/6 · {pbarBlockDimensions(stationObjectFace(selected)).widthInches} IN × {pbarBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {pbarBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "blue-resi" ? <><span>BLUE · FACE: {stationObjectFace(selected) + 1}/6 · {blueResiDimensions(stationObjectFace(selected)).widthInches} IN × {blueResiDimensions(stationObjectFace(selected)).depthInches} IN TOP · {blueResiDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "mini-resi" ? <><span>BLUE / RED · FACE: {stationObjectFace(selected) + 1}/6 · {miniResiDimensions(stationObjectFace(selected)).widthInches} IN × {miniResiDimensions(stationObjectFace(selected)).depthInches} IN TOP · {miniResiDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && isStripedResiAsset(selected.assetId) ? <>{selected.assetId === "four-inch-resi" ? <label>COLOR<select value={FOUR_INCH_RESI_COLORS.includes(selected.fourInchResiColor as FourInchResiColor) ? selected.fourInchResiColor : "blue"} onChange={(event) => patchSelected({ fourInchResiColor: event.target.value as FourInchResiColor })}>{FOUR_INCH_RESI_COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label> : null}<span>{selected.assetId === "big-four-inch-resi" ? "GRAY TOP / BLUE EDGE · BLUE UNDERSIDE" : selected.assetId === "four-inch-resi" ? `${(FOUR_INCH_RESI_COLORS.includes(selected.fourInchResiColor as FourInchResiColor) ? selected.fourInchResiColor : "blue").toUpperCase()} · YELLOW CROSS-STRIPE 20 IN FROM ONE END` : "BLUE · YELLOW CROSS-STRIPE 20 IN FROM ONE END"} · FACE: {stationObjectFace(selected) + 1}/6 · {stripedResiDimensions(selected.assetId, stationObjectFace(selected)).widthInches} IN × {stripedResiDimensions(selected.assetId, stationObjectFace(selected)).depthInches} IN TOP · {stripedResiDimensions(selected.assetId, stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "red-norbert-block" ? <><span>RED · FACE: {stationObjectFace(selected) + 1}/6 · {redNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {redNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {redNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "blue-norbert-block" ? <><span>BLUE · FACE: {stationObjectFace(selected) + 1}/6 · {blueNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {blueNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {blueNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "green-norbert-block" ? <><span>GREEN · FACE: {stationObjectFace(selected) + 1}/6 · {greenNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {greenNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {greenNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "mini-red-norbert-block" ? <><span>RED · FACE: {stationObjectFace(selected) + 1}/6 · {miniRedNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {miniRedNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {miniRedNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "squishy-norbert-block" ? <><label>COLOR<select value={SQUISHY_NORBERT_BLOCK_COLORS.includes(selected.squishyNorbertBlockColor as SquishyNorbertBlockColor) ? selected.squishyNorbertBlockColor : "blue"} onChange={(event) => patchSelected({ squishyNorbertBlockColor: event.target.value as SquishyNorbertBlockColor })}>{SQUISHY_NORBERT_BLOCK_COLORS.map((color) => <option key={color} value={color}>{color.toUpperCase()}</option>)}</select></label><span>{(SQUISHY_NORBERT_BLOCK_COLORS.includes(selected.squishyNorbertBlockColor as SquishyNorbertBlockColor) ? selected.squishyNorbertBlockColor : "blue").toUpperCase()} · FACE: {stationObjectFace(selected) + 1}/6 · {squishyNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {squishyNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {squishyNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "small-green-norbert-block" ? <><span>GREEN · FACE: {stationObjectFace(selected) + 1}/6 · {smallGreenNorbertBlockDimensions(stationObjectFace(selected)).widthInches} IN × {smallGreenNorbertBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {smallGreenNorbertBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "cartwheel-mat" ? <><label>COLOR<select value={CARTWHEEL_MAT_COLORS.includes(selected.cartwheelMatColor as CartwheelMatColor) ? selected.cartwheelMatColor : "blue"} onChange={(event) => patchSelected({ cartwheelMatColor: event.target.value as CartwheelMatColor })}>{CARTWHEEL_MAT_COLORS.map((color) => <option key={color} value={color}>{CARTWHEEL_MAT_COLOR_LABELS[color]}</option>)}</select></label><span>{CARTWHEEL_MAT_COLOR_LABELS[CARTWHEEL_MAT_COLORS.includes(selected.cartwheelMatColor as CartwheelMatColor) ? selected.cartwheelMatColor as CartwheelMatColor : "blue"]} · PALE YELLOW CENTER STRIPE · FACE: {stationObjectFace(selected) + 1}/6 · PHYSICAL FACE · {cartwheelMatDimensions(stationObjectFace(selected)).widthInches} IN × {cartwheelMatDimensions(stationObjectFace(selected)).depthInches} IN TOP · {cartwheelMatDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "stairs" ? <span>RED TREADS · BLUE TALL STEP · YELLOW LOWER STEP · {STAIRS_WIDTH_INCHES} IN × {STAIRS_DEPTH_INCHES} IN BASE · {STAIRS_HEIGHT_INCHES} IN TALL · NO FLIP</span> : null}
            {selected.kind === "equipment" && selected.assetId === "velcro-beam" ? <><label>COLOR<select value={VELCRO_BEAM_COLORS.includes(selected.velcroBeamColor as VelcroBeamColor) ? selected.velcroBeamColor : "red"} onChange={(event) => patchSelected({ velcroBeamColor: event.target.value as VelcroBeamColor })}>{VELCRO_BEAM_COLORS.map((color) => <option key={color} value={color}>{VELCRO_BEAM_COLOR_LABELS[color]}</option>)}</select></label><span>{VELCRO_BEAM_COLOR_LABELS[VELCRO_BEAM_COLORS.includes(selected.velcroBeamColor as VelcroBeamColor) ? selected.velcroBeamColor as VelcroBeamColor : "red"]} · 8 FT × 4 IN · 0.5 IN THICK (PROVISIONAL) · FACE: {stationObjectFace(selected) + 1}/6 · {velcroBeamDimensions(stationObjectFace(selected)).widthInches} IN × {velcroBeamDimensions(stationObjectFace(selected)).depthInches} IN TOP · {velcroBeamDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "pink-beam-mat" ? <span>PINK · 54 IN × 36 IN · 0.35 IN THICK</span> : null}
            {selected.kind === "equipment" && selected.assetId === "sting-mat" ? <span>LIGHT BROWN · 76 IN × 55 IN · 1.5 IN THICK</span> : null}
            {selected.kind === "equipment" && selected.assetId === "gym-nova-mat" ? <span>GRAY TOP · CREAM SIDES · {gymNovaMatDimensions(stationObjectFace(selected)).widthInches} IN × {gymNovaMatDimensions(stationObjectFace(selected)).depthInches} IN TOP · {gymNovaMatDimensions(stationObjectFace(selected)).heightInches} IN TALL</span> : null}
            {selected.kind === "equipment" && selected.assetId === "teddy-mat" ? <span>DARK BROWN · {teddyMatDimensions(stationObjectFace(selected)).widthInches} IN × {teddyMatDimensions(stationObjectFace(selected)).depthInches} IN TOP · {teddyMatDimensions(stationObjectFace(selected)).heightInches} IN TALL</span> : null}
            {selected.kind === "equipment" && selected.assetId === "hand-mat" ? <span>BURGUNDY · FAINT WHITE FOUR-SECTION CROSS · {handMatDimensions(stationObjectFace(selected)).widthInches} IN × {handMatDimensions(stationObjectFace(selected)).depthInches} IN TOP · {handMatDimensions(stationObjectFace(selected)).heightInches} IN TALL</span> : null}
            {selected.kind === "equipment" && selected.assetId === "mini-mushroom" ? <span>BLUE BASE · WHITE/GRAY TOP · 22 IN DIAMETER · 11 IN TALL</span> : null}
            {selected.kind === "equipment" && selected.assetId === "floor-mushroom" ? <span>BROWN / GRAY · 22 IN DIAMETER · FLOOR DISK · 1 IN CLEARANCE (PROVISIONAL)</span> : null}
            {selected.kind === "equipment" && selected.assetId === "cylinder" ? <><span>BLUE CURVE · YELLOW ENDS · 24 IN DIAMETER · 48 IN TALL · FACE: {stationObjectFace(selected) + 1}/2 · {cylinderFaceLabel(stationObjectFace(selected))} · {cylinderFaceDimensions(stationObjectFace(selected)).widthInches} IN × {cylinderFaceDimensions(stationObjectFace(selected)).depthInches} IN FLOOR · {cylinderFaceDimensions(stationObjectFace(selected)).heightInches} IN CLEARANCE</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "half-block" ? <><label>COLOR<select value={HALF_BLOCK_COLORS.includes(selected.halfBlockColor as HalfBlockColor) ? selected.halfBlockColor : "green-yellow"} onChange={(event) => patchSelected({ halfBlockColor: event.target.value as HalfBlockColor })}>{HALF_BLOCK_COLORS.map((color) => <option key={color} value={color}>{HALF_BLOCK_COLOR_LABELS[color]}</option>)}</select></label><span>FACE: {stationObjectFace(selected) + 1}/6 · {halfBlockDimensions(stationObjectFace(selected)).widthInches} IN × {halfBlockDimensions(stationObjectFace(selected)).depthInches} IN TOP · {halfBlockDimensions(stationObjectFace(selected)).heightInches} IN TALL</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && selected.assetId === "small-cheese-mat" ? <label>COLOR<select value={SMALL_CHEESE_MAT_COLORS.includes(selected.smallCheeseMatColor as SmallCheeseMatColor) ? selected.smallCheeseMatColor : "orange-purple"} onChange={(event) => patchSelected({ smallCheeseMatColor: event.target.value as SmallCheeseMatColor })}>{SMALL_CHEESE_MAT_COLORS.map((color) => <option key={color} value={color}>{SMALL_CHEESE_MAT_COLOR_LABELS[color]}</option>)}</select></label> : null}
            {selected.kind === "equipment" && (selected.assetId === "pink-beam-mat" || selected.assetId === "sting-mat" || selected.assetId === "gym-nova-mat" || selected.assetId === "teddy-mat" || selected.assetId === "hand-mat" || selected.assetId === "cloud-mat" || selected.assetId === "red-trapezoid" || selected.assetId === "yellow-trapezoid" || selected.assetId === "green-trapezoid") ? <><span>FACE: {stationObjectFace(selected) + 1}/{stationAssetFaceCount(selected.assetId)} · PHYSICAL FACE</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && (selected.assetId === "big-octagon" || selected.assetId === "medium-octagon" || selected.assetId === "small-octagon") ? <><span>FACE: {stationObjectFace(selected) + 1}/{stationAssetFaceCount(selected.assetId)} · {octagonFaceLabel(selected.assetId, stationObjectFace(selected))}</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "equipment" && (selected.assetId === "tiny-cheese-mat" || selected.assetId === "small-cheese-mat" || selected.assetId === "medium-cheese-mat" || selected.assetId === "large-cheese-mat" || selected.assetId === "big-cheese-mat" || selected.assetId === "squishy-cheese-mat") ? <>{isFoldableCheeseMatAsset(selected.assetId) ? <><span>{stationAsset(selected.assetId).name}: {cheeseMatState(selected).toUpperCase()} · FOLDS IN HALF LENGTHWISE</span><button type="button" className="station-panel-action" onClick={() => changeSelectedCheeseMatStateWithSound(cheeseMatState(selected) === "closed" ? "open" : "closed")}>{cheeseMatState(selected) === "closed" ? `OPEN ${stationAsset(selected.assetId).name}` : `CLOSE ${stationAsset(selected.assetId).name}`}</button></> : null}<span>FACE: {stationObjectFace(selected) + 1}/5 · {isFoldableCheeseMatAsset(selected.assetId) && cheeseMatState(selected) === "closed" ? "FOLDED BLOCK" : cheeseMatFaceLabel(selected.assetId, stationObjectFace(selected), selected.smallCheeseMatColor ?? "orange-purple")}</span><div className="station-inspector-row"><button type="button" onClick={() => flipSelectedFaceWithSound("previous")}>↶ FLIP FACE</button><button type="button" onClick={() => flipSelectedFaceWithSound("next")}>FLIP FACE ↷</button></div></> : null}
            {selected.kind === "label" ? <label>TEXT<input value={selected.text ?? ""} maxLength={40} onChange={(event) => patchSelected({ text: event.target.value })} /></label> : null}
            <div className="station-inspector-row"><button type="button" onClick={() => rotateSelectedWithSound("counterclockwise")}>↶ ROTATE 30°</button><button type="button" onClick={() => rotateSelectedWithSound("clockwise")}>ROTATE 30° ↷</button></div>
            <div className="station-nudge-control"><span>MOVE 1 PX · LOCAL DIRECTION · HOLD TO REPEAT</span><div className="station-nudge-pad" aria-label="Move selected piece one pixel in its local directions"><button type="button" className="north" {...nudgeButtonProps("north")} aria-label="Move selected piece one pixel toward its local north" title="Move local north one pixel">↑ N</button><button type="button" className="west" {...nudgeButtonProps("west")} aria-label="Move selected piece one pixel toward its local west" title="Move local west one pixel">← W</button><span className="station-nudge-center">LOCAL<br />1 PX</span><button type="button" className="east" {...nudgeButtonProps("east")} aria-label="Move selected piece one pixel toward its local east" title="Move local east one pixel">E →</button><button type="button" className="south" {...nudgeButtonProps("south")} aria-label="Move selected piece one pixel toward its local south" title="Move local south one pixel">↓ S</button></div></div>
            <div className="station-inspector-row"><button type="button" {...verticalMoveButtonProps("up")} aria-label="Hold to raise selected mat" title="Hold to raise">↑ UP</button><button type="button" disabled={(selected.elevation ?? 0) === 0} {...verticalMoveButtonProps("down")} aria-label="Hold to lower selected mat" title="Hold to lower">↓ DOWN</button></div>
            <span>HEIGHT: {(selected.elevation ?? 0) / STATION_STACK_STEP}</span>
            <button type="button" onClick={removeSelected} className="station-delete">DELETE PIECE</button>
          </> : <span>SELECT A PIECE TO EDIT IT</span>}
        </aside>
      </div>
      <footer className="station-maker-actions"><span>{canSave ? `${draft.objects.length} OBJECT${draft.objects.length === 1 ? "" : "S"} · EDITABLE AFTER SAVING` : "ADD A PIECE TO ENABLE SAVE"}</span><div><button type="button" onClick={onCancel}>CANCEL</button><button type="button" className="station-save" disabled={!canSave} onClick={() => { if (canSave) { playStationSound("save"); onSave(draft); } }}>SAVE STATION</button></div></footer>
    </section>
  </div>;
}
