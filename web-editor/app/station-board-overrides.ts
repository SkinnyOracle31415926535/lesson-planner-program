/**
 * Browser-local adjustments for the supplied station-board anchors.
 *
 * The source anchors remain owned by `gym-layout.ts` and its contracts. This
 * module stores only a coach's local move/rename overrides and locally added
 * spots, so a future source-contract update can still provide the baseline.
 */

export const STATION_BOARD_OVERRIDE_STORAGE_VERSION = 1;

const MAX_SPOT_ID_LENGTH = 120;
const MAX_SPOT_NAME_LENGTH = 80;
const SAFE_SPOT_ID = /^[a-z0-9][a-z0-9_-]*$/i;

/**
 * A normalized immutable source input projected onto the visible planning
 * canvas. The source art/contract itself is never rewritten by this module.
 */
export type StationBoardSourceSpot = Readonly<{
  id: string;
  name: string;
  x: number;
  y: number;
}>;

/** A locally created spot, stored entirely in this browser. */
export type AddedStationBoardSpot = {
  id: string;
  name: string;
  x: number;
  y: number;
};

/** A sparse local patch for one source spot. Its source ID is the record key. */
export type SourceStationBoardSpotOverride = {
  name?: string;
  x?: number;
  y?: number;
};

export type StationBoardSpotOverrides = {
  sourceSpotOverridesById: Record<string, SourceStationBoardSpotOverride>;
  addedSpots: AddedStationBoardSpot[];
};

/**
 * Effective spots are safe copies. `origin` lets the UI offer RESET for a
 * source spot and REMOVE for a locally added one.
 */
export type EffectiveStationBoardSpot = AddedStationBoardSpot & {
  origin: "source" | "local";
};

/** All built-in board adjustments saved in one browser-local storage record. */
export type StationBoardOverrideStorage = {
  version: typeof STATION_BOARD_OVERRIDE_STORAGE_VERSION;
  boardsById: Record<string, StationBoardSpotOverrides>;
};

export type StationBoardSpotPatch = Partial<Pick<AddedStationBoardSpot, "name" | "x" | "y">>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function own(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function cleanSpotName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cloneSourceOverride(override: SourceStationBoardSpotOverride): SourceStationBoardSpotOverride {
  return {
    ...(override.name === undefined ? {} : { name: override.name }),
    ...(override.x === undefined ? {} : { x: override.x }),
    ...(override.y === undefined ? {} : { y: override.y }),
  };
}

function cloneOverrides(overrides: StationBoardSpotOverrides): StationBoardSpotOverrides {
  return {
    sourceSpotOverridesById: Object.fromEntries(
      Object.entries(overrides.sourceSpotOverridesById).map(([id, override]) => [id, cloneSourceOverride(override)]),
    ),
    addedSpots: overrides.addedSpots.map((spot) => ({ ...spot })),
  };
}

function normalizedAddedSpot(spot: AddedStationBoardSpot): AddedStationBoardSpot | null {
  const id = spot.id.trim();
  const name = cleanSpotName(spot.name);
  if (!isStationBoardSpotId(id) || !isStationBoardSpotName(name)) return null;
  return { id, name, x: clampNormalizedCoordinate(spot.x), y: clampNormalizedCoordinate(spot.y) };
}

/** Normalized coordinates are always on the visible, uncropped planning canvas. */
export function isNormalizedCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

/** UI helpers clamp pointer calculations before they enter browser-local state. */
export function clampNormalizedCoordinate(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/** IDs are deliberately narrow because they are later used as stable DOM/state keys. */
export function isStationBoardSpotId(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= MAX_SPOT_ID_LENGTH
    && SAFE_SPOT_ID.test(value);
}

export function isStationBoardSpotName(value: unknown): value is string {
  return typeof value === "string"
    && value === cleanSpotName(value)
    && value.length > 0
    && value.length <= MAX_SPOT_NAME_LENGTH;
}

export function isAddedStationBoardSpot(value: unknown): value is AddedStationBoardSpot {
  return isRecord(value)
    && isStationBoardSpotId(value.id)
    && isStationBoardSpotName(value.name)
    && isNormalizedCoordinate(value.x)
    && isNormalizedCoordinate(value.y)
    && Object.keys(value).every((key) => key === "id" || key === "name" || key === "x" || key === "y");
}

/** Validates a sparse source patch without accepting unknown persisted fields. */
export function isSourceStationBoardSpotOverride(value: unknown): value is SourceStationBoardSpotOverride {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (!keys.length || keys.some((key) => key !== "name" && key !== "x" && key !== "y")) return false;
  return (!own(value, "name") || isStationBoardSpotName(value.name))
    && (!own(value, "x") || isNormalizedCoordinate(value.x))
    && (!own(value, "y") || isNormalizedCoordinate(value.y));
}

export function isStationBoardSpotOverrides(value: unknown): value is StationBoardSpotOverrides {
  if (!isRecord(value)
    || !isRecord(value.sourceSpotOverridesById)
    || !Array.isArray(value.addedSpots)
    || Object.keys(value).some((key) => key !== "sourceSpotOverridesById" && key !== "addedSpots")) {
    return false;
  }

  const sourceOverrides = value.sourceSpotOverridesById as Record<string, unknown>;
  const addedSpots = value.addedSpots as unknown[];
  const sourceIds = Object.keys(sourceOverrides);
  const addedIds = addedSpots.map((spot) => isRecord(spot) ? spot.id : "");
  return sourceIds.every((id) => isStationBoardSpotId(id) && isSourceStationBoardSpotOverride(sourceOverrides[id]))
    && addedSpots.every(isAddedStationBoardSpot)
    && new Set(addedIds).size === addedIds.length
    && addedIds.every((id) => typeof id === "string" && !sourceIds.includes(id));
}

/** Strictly validates the JSON-compatible record read from browser localStorage. */
export function isStationBoardOverrideStorage(value: unknown): value is StationBoardOverrideStorage {
  return isRecord(value)
    && value.version === STATION_BOARD_OVERRIDE_STORAGE_VERSION
    && isRecord(value.boardsById)
    && Object.keys(value).every((key) => key === "version" || key === "boardsById")
    && Object.entries(value.boardsById).every(([boardId, overrides]) => (
      isStationBoardSpotId(boardId) && isStationBoardSpotOverrides(overrides)
    ));
}

export function emptyStationBoardSpotOverrides(): StationBoardSpotOverrides {
  return { sourceSpotOverridesById: {}, addedSpots: [] };
}

/** Makes a detached, JSON-safe storage value ready for localStorage. */
export function stationBoardOverrideStorage(
  boardsById: Record<string, StationBoardSpotOverrides> = {},
): StationBoardOverrideStorage {
  return {
    version: STATION_BOARD_OVERRIDE_STORAGE_VERSION,
    boardsById: Object.fromEntries(
      Object.entries(boardsById).map(([boardId, overrides]) => [boardId, cloneOverrides(overrides)]),
    ),
  };
}

/** Retrieves a detached board record; callers can freely pass it to a helper below. */
export function stationBoardSpotOverridesFor(
  storage: StationBoardOverrideStorage,
  boardId: string,
): StationBoardSpotOverrides {
  const saved = storage.boardsById[boardId];
  return saved ? cloneOverrides(saved) : emptyStationBoardSpotOverrides();
}

/** Replaces one board's local record without mutating the storage value that React holds. */
export function replaceStationBoardSpotOverrides(
  storage: StationBoardOverrideStorage,
  boardId: string,
  overrides: StationBoardSpotOverrides,
): StationBoardOverrideStorage {
  if (!isStationBoardSpotId(boardId) || !isStationBoardSpotOverrides(overrides)) return storage;
  const boardsById = { ...storage.boardsById, [boardId]: cloneOverrides(overrides) };
  return stationBoardOverrideStorage(boardsById);
}

/**
 * Applies browser-local adjustments to source spots without mutating either
 * input. Invalid/duplicate source records are ignored defensively; a local
 * spot can never replace a source ID.
 */
export function effectiveStationBoardSpots(
  sourceSpots: readonly StationBoardSourceSpot[],
  overrides: StationBoardSpotOverrides,
): EffectiveStationBoardSpot[] {
  const seenIds = new Set<string>();
  const effective: EffectiveStationBoardSpot[] = [];

  sourceSpots.forEach((sourceSpot) => {
    if (!isAddedStationBoardSpot(sourceSpot) || seenIds.has(sourceSpot.id)) return;
    seenIds.add(sourceSpot.id);
    const patch = overrides.sourceSpotOverridesById[sourceSpot.id];
    effective.push({
      id: sourceSpot.id,
      name: patch?.name ?? sourceSpot.name,
      x: patch?.x ?? sourceSpot.x,
      y: patch?.y ?? sourceSpot.y,
      origin: "source",
    });
  });

  overrides.addedSpots.forEach((spot) => {
    if (!isAddedStationBoardSpot(spot) || seenIds.has(spot.id)) return;
    seenIds.add(spot.id);
    effective.push({ ...spot, origin: "local" });
  });

  return effective;
}

/** Adds a local-only spot. Source IDs and existing local IDs are never reused. */
export function addLocalStationBoardSpot(
  overrides: StationBoardSpotOverrides,
  spot: AddedStationBoardSpot,
  sourceSpots: readonly StationBoardSourceSpot[] = [],
): StationBoardSpotOverrides {
  const normalized = normalizedAddedSpot(spot);
  if (!normalized
    || overrides.addedSpots.some((existing) => existing.id === normalized.id)
    || sourceSpots.some((source) => source.id === normalized.id)) {
    return overrides;
  }
  return { ...cloneOverrides(overrides), addedSpots: [...overrides.addedSpots.map((existing) => ({ ...existing })), normalized] };
}

/** Renames or moves one local spot while keeping its stable ID. */
export function updateLocalStationBoardSpot(
  overrides: StationBoardSpotOverrides,
  spotId: string,
  patch: StationBoardSpotPatch,
): StationBoardSpotOverrides {
  const current = overrides.addedSpots.find((spot) => spot.id === spotId);
  if (!current) return overrides;
  const next = normalizedAddedSpot({
    id: current.id,
    name: patch.name ?? current.name,
    x: patch.x ?? current.x,
    y: patch.y ?? current.y,
  });
  if (!next || (next.name === current.name && next.x === current.x && next.y === current.y)) return overrides;
  return {
    ...cloneOverrides(overrides),
    addedSpots: overrides.addedSpots.map((spot) => (spot.id === spotId ? next : { ...spot })),
  };
}

/** Source anchors cannot be deleted; reset is how the UI returns one to its contract value. */
export function updateSourceStationBoardSpot(
  overrides: StationBoardSpotOverrides,
  sourceSpotId: string,
  patch: StationBoardSpotPatch,
): StationBoardSpotOverrides {
  if (!isStationBoardSpotId(sourceSpotId)) return overrides;
  const previous = overrides.sourceSpotOverridesById[sourceSpotId] ?? {};
  const next: SourceStationBoardSpotOverride = cloneSourceOverride(previous);

  if (patch.name !== undefined) {
    const name = cleanSpotName(patch.name);
    if (!isStationBoardSpotName(name)) return overrides;
    next.name = name;
  }
  if (patch.x !== undefined) next.x = clampNormalizedCoordinate(patch.x);
  if (patch.y !== undefined) next.y = clampNormalizedCoordinate(patch.y);
  if (next.name === previous.name && next.x === previous.x && next.y === previous.y) return overrides;

  return {
    ...cloneOverrides(overrides),
    sourceSpotOverridesById: {
      ...Object.fromEntries(Object.entries(overrides.sourceSpotOverridesById).map(([id, override]) => [id, cloneSourceOverride(override)])),
      [sourceSpotId]: next,
    },
  };
}

/** Removes one locally added spot. It cannot remove a supplied source anchor. */
export function removeLocalStationBoardSpot(
  overrides: StationBoardSpotOverrides,
  spotId: string,
): StationBoardSpotOverrides {
  if (!overrides.addedSpots.some((spot) => spot.id === spotId)) return overrides;
  return {
    ...cloneOverrides(overrides),
    addedSpots: overrides.addedSpots.filter((spot) => spot.id !== spotId).map((spot) => ({ ...spot })),
  };
}

/** Removes just one source patch, revealing its untouched source-contract value. */
export function resetSourceStationBoardSpot(
  overrides: StationBoardSpotOverrides,
  sourceSpotId: string,
): StationBoardSpotOverrides {
  if (!Object.prototype.hasOwnProperty.call(overrides.sourceSpotOverridesById, sourceSpotId)) return overrides;
  const sourceSpotOverridesById = Object.fromEntries(
    Object.entries(overrides.sourceSpotOverridesById)
      .filter(([id]) => id !== sourceSpotId)
      .map(([id, patch]) => [id, cloneSourceOverride(patch)]),
  );
  return { ...cloneOverrides(overrides), sourceSpotOverridesById };
}

/** Clears every local move/rename and every local-only station from one board. */
export function resetStationBoardSpotOverrides(): StationBoardSpotOverrides {
  return emptyStationBoardSpotOverrides();
}
