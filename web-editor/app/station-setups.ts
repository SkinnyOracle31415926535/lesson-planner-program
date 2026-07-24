/** Browser-local, editable pixel station layouts. */
export const STATION_SETUP_VERSION = 1;
export const STATION_CANVAS = { width: 960, height: 640, grid: 32 } as const;

export type StationAssetId = "panel" | "folded-panel" | "wedge" | "block" | "landing" | "strip" | "barrel" | "beam";
export type StationColor = "blue" | "pink" | "yellow" | "green" | "purple";
export type StationObjectKind = "equipment" | "label" | "arrow";

export type StationObject = {
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

export type StationSetup = {
  id: string;
  version: typeof STATION_SETUP_VERSION;
  canvas: typeof STATION_CANVAS;
  objects: StationObject[];
  createdAt: string;
  updatedAt: string;
};

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

export function stationAsset(assetId: StationAssetId): StationAsset {
  return stationAssets.find((asset) => asset.id === assetId) ?? stationAssets[0];
}

export function createStationSetup(id = `station-${Date.now()}`): StationSetup {
  const now = new Date().toISOString();
  return { id, version: STATION_SETUP_VERSION, canvas: STATION_CANVAS, objects: [], createdAt: now, updatedAt: now };
}

export function createStationObject(assetId: StationAssetId, zIndex: number, id = `station-object-${Date.now()}-${Math.random().toString(36).slice(2)}`): StationObject {
  const asset = stationAsset(assetId);
  return { id, kind: "equipment", assetId, color: "blue", x: 96, y: 96, width: asset.width, height: asset.height, rotation: 0, zIndex };
}

/** Keeps the saved rectangle on the editable station canvas after a resize. */
export function constrainStationObjectToCanvas(object: StationObject): StationObject {
  const width = Math.min(STATION_CANVAS.width, Math.max(STATION_CANVAS.grid, object.width));
  const height = Math.min(STATION_CANVAS.height, Math.max(STATION_CANVAS.grid, object.height));
  return {
    ...object,
    width,
    height,
    x: Math.max(0, Math.min(STATION_CANVAS.width - width, object.x)),
    y: Math.max(0, Math.min(STATION_CANVAS.height - height, object.y)),
  };
}

export function isStationSetup(value: unknown): value is StationSetup {
  if (!value || typeof value !== "object") return false;
  const setup = value as Partial<StationSetup>;
  return typeof setup.id === "string" && setup.version === STATION_SETUP_VERSION
    && Array.isArray(setup.objects)
    && setup.objects.every((object) => object && typeof object.id === "string" && typeof object.kind === "string"
      && Number.isFinite(object.x) && Number.isFinite(object.y) && Number.isFinite(object.width) && Number.isFinite(object.height)
      && Number.isFinite(object.rotation) && Number.isFinite(object.zIndex));
}

export function isStationSetupSaveable(setup: StationSetup): boolean {
  return setup.objects.length > 0 && isStationSetup(setup);
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
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" }); };
  return requestResult(request);
}

export async function saveStationSetup(setup: StationSetup): Promise<void> {
  if (!isStationSetupSaveable(setup)) throw new Error("Add at least one station object before saving.");
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put(setup); await transactionDone(tx); } finally { db.close(); }
}

export async function loadStationSetup(id: string): Promise<StationSetup | null> {
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readonly"); const value = await requestResult(tx.objectStore(STORE_NAME).get(id)); await transactionDone(tx); return isStationSetup(value) ? value : null; } finally { db.close(); }
}

export async function removeStationSetup(id: string): Promise<void> {
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).delete(id); await transactionDone(tx); } finally { db.close(); }
}
