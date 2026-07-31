/**
 * Browser-local, editable Station Maker scenes.
 *
 * V2 uses meters throughout. V1 stays readable as a legacy pixel document so
 * an old sketch is never deceptively reinterpreted as a physical layout.
 */
import {
  isVerifiedStationEquipmentId,
  stationEquipmentFootprint,
  type VerifiedStationEquipmentId,
} from "./station-equipment-catalog";

export const LEGACY_STATION_SETUP_VERSION = 1 as const;
export const STATION_SETUP_VERSION = 2 as const;

/** One scene unit is one meter. New scenes are a 12m × 8m top-down area. */
export const STATION_CANVAS = { width: 12, height: 8, grid: 0.25, unit: "meter" } as const;
/** V1's coordinates are retained only to render legacy layouts honestly. */
export const LEGACY_STATION_CANVAS = { width: 960, height: 640, grid: 32 } as const;

export type StationColor = "blue" | "pink" | "yellow" | "green" | "purple";
export type StationObjectKind = "equipment" | "label" | "arrow";

/** The fixed generic assets that existed in v1 only. */
export type StationAssetId = "panel" | "folded-panel" | "wedge" | "block" | "landing" | "strip" | "barrel" | "beam";

export type LegacyStationObject = {
  id: string;
  kind: StationObjectKind;
  assetId?: StationAssetId;
  color?: StationColor;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export type MeterStationObject = {
  id: string;
  kind: StationObjectKind;
  /** Present only for a catalog item with a verified physical measurement. */
  equipmentId?: VerifiedStationEquipmentId;
  text?: string;
  /** Meter coordinates in the top-down scene. */
  x: number;
  y: number;
  /** Labels and arrows are resizable. Equipment uses the catalog footprint. */
  width?: number;
  height?: number;
  rotation: number;
  zIndex: number;
  /** Visual-only raised base, in meters; it does not imply support physics. */
  elevation: number;
};

/** A compatibility alias for code which handles either version's objects. */
export type StationObject = MeterStationObject | LegacyStationObject;

export type MeterStationSetup = {
  id: string;
  version: typeof STATION_SETUP_VERSION;
  canvas: typeof STATION_CANVAS;
  objects: MeterStationObject[];
  createdAt: string;
  updatedAt: string;
};

export type LegacyStationSetup = {
  id: string;
  version: typeof LEGACY_STATION_SETUP_VERSION;
  canvas: typeof LEGACY_STATION_CANVAS;
  objects: LegacyStationObject[];
  createdAt: string;
  updatedAt: string;
};

export type StationSetup = MeterStationSetup | LegacyStationSetup;

/** Kept for v1 rendering only; new scale scenes never use these footprints. */
export type StationAsset = {
  id: StationAssetId;
  name: string;
  width: number;
  height: number;
  heightCue: "flat" | "raised" | "tall";
};

export const stationAssets: readonly StationAsset[] = [
  { id: "panel", name: "PANEL MAT", width: 192, height: 96, heightCue: "flat" },
  { id: "folded-panel", name: "FOLDED PANEL", width: 96, height: 96, heightCue: "raised" },
  { id: "wedge", name: "WEDGE", width: 160, height: 112, heightCue: "raised" },
  { id: "block", name: "TALL BLOCK", width: 112, height: 112, heightCue: "tall" },
  { id: "landing", name: "LANDING MAT", width: 224, height: 128, heightCue: "raised" },
  { id: "strip", name: "LONG STRIP", width: 320, height: 64, heightCue: "flat" },
  { id: "barrel", name: "BARREL", width: 112, height: 96, heightCue: "tall" },
  { id: "beam", name: "BALANCE BEAM", width: 288, height: 48, heightCue: "raised" },
] as const;

const STATION_COLORS: readonly StationColor[] = ["blue", "pink", "yellow", "green", "purple"];
const STATION_OBJECT_KINDS: readonly StationObjectKind[] = ["equipment", "label", "arrow"];

export function stationAsset(assetId: StationAssetId): StationAsset {
  return stationAssets.find((asset) => asset.id === assetId) ?? stationAssets[0]!;
}

function identifier(prefix: string): string {
  return `${prefix}-${typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

export function createStationSetup(id = identifier("station")): MeterStationSetup {
  const now = new Date().toISOString();
  return { id, version: STATION_SETUP_VERSION, canvas: STATION_CANVAS, objects: [], createdAt: now, updatedAt: now };
}

/** Creates a true-scale catalog object; arbitrary resizing is intentionally unavailable. */
export function createStationObject(
  equipmentId: VerifiedStationEquipmentId,
  zIndex: number,
  id = identifier("station-object"),
): MeterStationObject {
  const footprint = stationEquipmentFootprint(equipmentId);
  return {
    id,
    kind: "equipment",
    equipmentId,
    x: snapStationCoordinate((STATION_CANVAS.width - footprint.length) / 2),
    y: snapStationCoordinate((STATION_CANVAS.height - footprint.width) / 2),
    rotation: 0,
    zIndex,
    elevation: 0,
  };
}

export function createStationAnnotation(
  kind: "label" | "arrow",
  zIndex: number,
  id = identifier(`station-${kind}`),
): MeterStationObject {
  return kind === "label"
    ? { id, kind, text: "START HERE", x: 1, y: 1, width: 2, height: 0.5, rotation: 0, zIndex, elevation: 0 }
    : { id, kind, x: 1, y: 1, width: 0.75, height: 0.5, rotation: 0, zIndex, elevation: 0 };
}

/** Retained for focused migration tests and legacy fixture construction only. */
export function createLegacyStationObject(assetId: StationAssetId, zIndex: number, id = identifier("station-object")): LegacyStationObject {
  const asset = stationAsset(assetId);
  return { id, kind: "equipment", assetId, color: "blue", x: 96, y: 96, width: asset.width, height: asset.height, rotation: 0, zIndex };
}

export function isLegacyStationSetup(value: unknown): value is LegacyStationSetup {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "version", "canvas", "objects", "createdAt", "updatedAt"])
    || !isIdentifier(value.id) || value.version !== LEGACY_STATION_SETUP_VERSION || !isLegacyCanvas(value.canvas)
    || !Array.isArray(value.objects) || !value.objects.every(isLegacyStationObject)
    || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) return false;
  return new Set(value.objects.map((object) => object.id)).size === value.objects.length;
}

export function isMeterStationSetup(value: unknown): value is MeterStationSetup {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "version", "canvas", "objects", "createdAt", "updatedAt"])
    || !isIdentifier(value.id) || value.version !== STATION_SETUP_VERSION || !isMeterCanvas(value.canvas)
    || !Array.isArray(value.objects) || !value.objects.every(isMeterStationObject)
    || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) return false;
  return new Set(value.objects.map((object) => object.id)).size === value.objects.length;
}

/**
 * V1 has no real-world scale. Its migration is intentionally a compatibility
 * wrapper, not a coordinate conversion: the original pixel record survives as
 * a visibly legacy/not-to-scale layout until the coach creates a new v2 scene.
 */
export function migrateStationSetup(value: unknown): StationSetup | null {
  if (isMeterStationSetup(value) || isLegacyStationSetup(value)) return copyStationSetup(value);
  return null;
}

export function isStationSetup(value: unknown): value is StationSetup {
  return isMeterStationSetup(value) || isLegacyStationSetup(value);
}

export function copyStationSetup(setup: StationSetup): StationSetup {
  return {
    ...setup,
    canvas: { ...setup.canvas },
    objects: setup.objects.map((object) => ({ ...object })),
  } as StationSetup;
}

/** A physical footprint for a v2 object, in meters. */
export function stationObjectFootprint(object: MeterStationObject): { width: number; height: number } {
  if (object.kind === "equipment") {
    // The v2 validator requires this ID to be verified before it can exist.
    const footprint = stationEquipmentFootprint(object.equipmentId!);
    return { width: footprint.length, height: footprint.width };
  }
  return { width: object.width!, height: object.height! };
}

export function snapStationCoordinate(value: number): number {
  return Number((Math.round(value / STATION_CANVAS.grid) * STATION_CANVAS.grid).toFixed(4));
}

type RotatedFootprint = { width: number; height: number; insetX: number; insetY: number };

/**
 * CSS rotates each object around its centre. Keep the physical rectangle and
 * its rotated bounding box together so the rendered footprint cannot extend
 * beyond the measured 12m × 8m scene.
 */
function rotatedFootprint(width: number, height: number, rotation: number): RotatedFootprint {
  const radians = rotation * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const rotatedWidth = width * cosine + height * sine;
  const rotatedHeight = width * sine + height * cosine;
  return {
    width: rotatedWidth,
    height: rotatedHeight,
    insetX: (rotatedWidth - width) / 2,
    insetY: (rotatedHeight - height) / 2,
  };
}

function fitAnnotationFootprint(width: number, height: number, rotation: number): { width: number; height: number } {
  const initialWidth = Math.min(STATION_CANVAS.width, Math.max(STATION_CANVAS.grid, width));
  const initialHeight = Math.min(STATION_CANVAS.height, Math.max(STATION_CANVAS.grid, height));
  const bounds = rotatedFootprint(initialWidth, initialHeight, rotation);
  const scale = Math.min(1, STATION_CANVAS.width / bounds.width, STATION_CANVAS.height / bounds.height);
  return {
    width: Math.max(STATION_CANVAS.grid, Number((initialWidth * scale).toFixed(4))),
    height: Math.max(STATION_CANVAS.grid, Number((initialHeight * scale).toFixed(4))),
  };
}

function constrainCoordinate(value: number, minimum: number, maximum: number): number {
  const lowerGridPoint = Number((Math.ceil((minimum - 0.000001) / STATION_CANVAS.grid) * STATION_CANVAS.grid).toFixed(4));
  const upperGridPoint = Number((Math.floor((maximum + 0.000001) / STATION_CANVAS.grid) * STATION_CANVAS.grid).toFixed(4));
  if (lowerGridPoint <= upperGridPoint) return Math.max(lowerGridPoint, Math.min(upperGridPoint, snapStationCoordinate(value)));
  return Number(Math.max(minimum, Math.min(maximum, value)).toFixed(4));
}

/** Keeps a v2 footprint, including its rotation, inside its meter scene. */
export function constrainStationObjectToCanvas(object: MeterStationObject): MeterStationObject {
  const originalFootprint = stationObjectFootprint(object);
  const footprint = object.kind === "equipment"
    ? originalFootprint
    : fitAnnotationFootprint(originalFootprint.width, originalFootprint.height, object.rotation);
  const bounds = rotatedFootprint(footprint.width, footprint.height, object.rotation);
  const x = constrainCoordinate(object.x, bounds.insetX, STATION_CANVAS.width - footprint.width - bounds.insetX);
  const y = constrainCoordinate(object.y, bounds.insetY, STATION_CANVAS.height - footprint.height - bounds.insetY);
  if (object.kind === "equipment") return { ...object, x, y };
  return { ...object, x, y, width: footprint.width, height: footprint.height };
}

export function isStationSetupSaveable(setup: StationSetup): boolean {
  return setup.objects.length > 0 && isStationSetup(setup);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 240 && value.trim() === value && !value.includes("\0");
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 100 && Number.isFinite(Date.parse(value));
}

function isFiniteNumber(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isFiniteInteger(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isInteger(value) && isFiniteNumber(value, minimum, maximum);
}

function isLegacyCanvas(value: unknown): boolean {
  return isRecord(value)
    && hasOnlyKeys(value, ["width", "height", "grid"])
    && value.width === LEGACY_STATION_CANVAS.width
    && value.height === LEGACY_STATION_CANVAS.height
    && value.grid === LEGACY_STATION_CANVAS.grid;
}

function isMeterCanvas(value: unknown): boolean {
  return isRecord(value)
    && hasOnlyKeys(value, ["width", "height", "grid", "unit"])
    && value.width === STATION_CANVAS.width
    && value.height === STATION_CANVAS.height
    && value.grid === STATION_CANVAS.grid
    && value.unit === STATION_CANVAS.unit;
}

function isLegacyStationObject(value: unknown): value is LegacyStationObject {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "kind", "assetId", "color", "text", "x", "y", "width", "height", "rotation", "zIndex"])
    || !isIdentifier(value.id)
    || !(STATION_OBJECT_KINDS as readonly string[]).includes(value.kind as string)
    || !isFiniteNumber(value.x, 0, LEGACY_STATION_CANVAS.width)
    || !isFiniteNumber(value.y, 0, LEGACY_STATION_CANVAS.height)
    || !isFiniteNumber(value.width, 1, LEGACY_STATION_CANVAS.width)
    || !isFiniteNumber(value.height, 1, LEGACY_STATION_CANVAS.height)
    || !isFiniteNumber(value.rotation, -3600, 3600)
    || !isFiniteInteger(value.zIndex, -10_000, 10_000)) return false;
  if (value.kind === "equipment" && (!(typeof value.assetId === "string") || !stationAssets.some((asset) => asset.id === value.assetId))) return false;
  if (value.kind !== "equipment" && value.assetId !== undefined) return false;
  if (value.color !== undefined && !(STATION_COLORS as readonly string[]).includes(value.color as string)) return false;
  if (value.text !== undefined && (typeof value.text !== "string" || value.text.length > 2_000 || value.text.includes("\0"))) return false;
  return value.x + value.width <= LEGACY_STATION_CANVAS.width && value.y + value.height <= LEGACY_STATION_CANVAS.height;
}

function isMeterStationObject(value: unknown): value is MeterStationObject {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "kind", "equipmentId", "text", "x", "y", "width", "height", "rotation", "zIndex", "elevation"])
    || !isIdentifier(value.id)
    || !(STATION_OBJECT_KINDS as readonly string[]).includes(value.kind as string)
    || !isFiniteNumber(value.x, 0, STATION_CANVAS.width)
    || !isFiniteNumber(value.y, 0, STATION_CANVAS.height)
    || !isFiniteNumber(value.rotation, -3600, 3600)
    || !isFiniteInteger(value.zIndex, -10_000, 10_000)
    || !isFiniteNumber(value.elevation, 0, 12)) return false;
  if (value.kind === "equipment") {
    if (!isVerifiedStationEquipmentId(value.equipmentId) || value.text !== undefined || value.width !== undefined || value.height !== undefined) return false;
    const footprint = stationEquipmentFootprint(value.equipmentId);
    const bounds = rotatedFootprint(footprint.length, footprint.width, value.rotation);
    return value.x - bounds.insetX >= -0.000001
      && value.y - bounds.insetY >= -0.000001
      && value.x + footprint.length + bounds.insetX <= STATION_CANVAS.width + 0.000001
      && value.y + footprint.width + bounds.insetY <= STATION_CANVAS.height + 0.000001;
  }
  if (value.equipmentId !== undefined || !isFiniteNumber(value.width, STATION_CANVAS.grid, STATION_CANVAS.width)
    || !isFiniteNumber(value.height, STATION_CANVAS.grid, STATION_CANVAS.height)) return false;
  const bounds = rotatedFootprint(value.width, value.height, value.rotation);
  if (value.x - bounds.insetX < -0.000001 || value.y - bounds.insetY < -0.000001
    || value.x + value.width + bounds.insetX > STATION_CANVAS.width + 0.000001
    || value.y + value.height + bounds.insetY > STATION_CANVAS.height + 0.000001) return false;
  if (value.kind === "label" && (typeof value.text !== "string" || value.text.length > 2_000 || value.text.includes("\0"))) return false;
  return value.kind !== "arrow" || value.text === undefined;
}

const DATABASE_NAME = "gym-lesson-planner-local-stations";
const STORE_NAME = "stationSetups";

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error("Station storage failed.")); });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error ?? new Error("Station storage failed.")); transaction.onabort = () => reject(transaction.error ?? new Error("Station storage stopped.")); });
}

async function database(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") throw new Error("This browser does not support local station storage.");
  // Version 2 changes document payloads only. The object store remains intact,
  // allowing v1 documents to be read through migrateStationSetup above.
  const request = indexedDB.open(DATABASE_NAME, 2);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" }); };
  return requestResult(request);
}

export async function saveStationSetup(setup: StationSetup): Promise<void> {
  if (!isStationSetupSaveable(setup)) throw new Error("Add at least one station object before saving.");
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put(copyStationSetup(setup)); await transactionDone(tx); } finally { db.close(); }
}

export async function loadStationSetup(id: string): Promise<StationSetup | null> {
  const db = await database();
  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const value = await requestResult(tx.objectStore(STORE_NAME).get(id));
    await transactionDone(tx);
    return migrateStationSetup(value);
  } finally { db.close(); }
}

/** Reads every local v2 scene and every preserved v1 legacy layout for a full backup. */
export async function listStationSetups(): Promise<StationSetup[]> {
  const db = await database();
  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const values = await requestResult(tx.objectStore(STORE_NAME).getAll());
    await transactionDone(tx);
    return (values as unknown[]).flatMap((value) => {
      const setup = migrateStationSetup(value);
      return setup ? [setup] : [];
    });
  } finally { db.close(); }
}

/** Restores either version without deleting unrelated local stations. */
export async function restoreStationSetups(setups: readonly StationSetup[]): Promise<void> {
  const validated = setups.map(migrateStationSetup);
  if (validated.some((setup) => !setup)) throw new Error("One or more station layouts are invalid.");
  const db = await database();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    validated.forEach((setup) => store.put(setup!));
    await transactionDone(tx);
  } finally { db.close(); }
}

export async function removeStationSetup(id: string): Promise<void> {
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).delete(id); await transactionDone(tx); } finally { db.close(); }
}
