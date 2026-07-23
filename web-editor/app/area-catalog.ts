import type { ZonePanel } from "./lesson-data";

/** Browser-local names and soft-removals for supplied and uploaded areas. */
export const AREA_CATALOG_STORAGE_VERSION = 1;

const SAFE_AREA_ID = /^[a-z0-9][a-z0-9-]*$/i;
const MAX_AREA_TITLE_LENGTH = 80;
const MAX_EVENT_LABEL_LENGTH = 48;
const MAX_AREA_NOTE_LENGTH = 320;

export type BuiltInAreaOverride = {
  title?: string;
  alias?: string;
  note?: string;
};

export type AreaCatalogPreferences = {
  version: typeof AREA_CATALOG_STORAGE_VERSION;
  /** Local metadata only; source zone IDs and source artwork never change. */
  builtInOverridesById: Record<string, BuiltInAreaOverride>;
  /** Soft-removal keeps supplied examples recoverable. */
  hiddenBuiltInZoneIds: string[];
  /** Uploaded photo metadata and blobs stay intact while an area is hidden. */
  hiddenCustomBoardIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanAreaText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isSafeAreaId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 120 && SAFE_AREA_ID.test(value);
}

function isSafeAreaText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value === cleanAreaText(value) && value.length > 0 && value.length <= maximum;
}

function cloneBuiltInOverride(override: BuiltInAreaOverride): BuiltInAreaOverride {
  return {
    ...(override.title === undefined ? {} : { title: override.title }),
    ...(override.alias === undefined ? {} : { alias: override.alias }),
    ...(override.note === undefined ? {} : { note: override.note }),
  };
}

function isBuiltInAreaOverride(value: unknown): value is BuiltInAreaOverride {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0
    && keys.every((key) => key === "title" || key === "alias" || key === "note")
    && (value.title === undefined || isSafeAreaText(value.title, MAX_AREA_TITLE_LENGTH))
    && (value.alias === undefined || isSafeAreaText(value.alias, MAX_EVENT_LABEL_LENGTH))
    && (value.note === undefined || isSafeAreaText(value.note, MAX_AREA_NOTE_LENGTH));
}

function isUniqueSafeIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isSafeAreaId) && new Set(value).size === value.length;
}

export function emptyAreaCatalogPreferences(): AreaCatalogPreferences {
  return {
    version: AREA_CATALOG_STORAGE_VERSION,
    builtInOverridesById: {},
    hiddenBuiltInZoneIds: [],
    hiddenCustomBoardIds: [],
  };
}

/** Creates a detached JSON-safe value for browser localStorage. */
export function areaCatalogPreferences(preferences: AreaCatalogPreferences): AreaCatalogPreferences {
  return {
    version: AREA_CATALOG_STORAGE_VERSION,
    builtInOverridesById: Object.fromEntries(
      Object.entries(preferences.builtInOverridesById).map(([id, override]) => [id, cloneBuiltInOverride(override)]),
    ),
    hiddenBuiltInZoneIds: [...preferences.hiddenBuiltInZoneIds],
    hiddenCustomBoardIds: [...preferences.hiddenCustomBoardIds],
  };
}

/** Rejects unknown supplied-area IDs while preserving safe browser-local custom IDs. */
export function isAreaCatalogPreferences(
  value: unknown,
  knownBuiltInZoneIds: readonly string[],
): value is AreaCatalogPreferences {
  if (!isRecord(value)
    || value.version !== AREA_CATALOG_STORAGE_VERSION
    || !isRecord(value.builtInOverridesById)
    || !isUniqueSafeIds(value.hiddenBuiltInZoneIds)
    || !isUniqueSafeIds(value.hiddenCustomBoardIds)
    || Object.keys(value).some((key) => key !== "version" && key !== "builtInOverridesById" && key !== "hiddenBuiltInZoneIds" && key !== "hiddenCustomBoardIds")) {
    return false;
  }
  const knownIds = new Set(knownBuiltInZoneIds);
  const overrides = value.builtInOverridesById as Record<string, unknown>;
  return Object.entries(overrides).every(([id, override]) => knownIds.has(id) && isBuiltInAreaOverride(override))
    && value.hiddenBuiltInZoneIds.every((id) => knownIds.has(id));
}

/** Applies a local name/note override without changing a zone's identity, cards, or map role. */
export function areaZoneWithOverride(zone: ZonePanel, preferences: AreaCatalogPreferences): ZonePanel {
  const override = preferences.builtInOverridesById[zone.id];
  return override ? { ...zone, ...cloneBuiltInOverride(override) } : zone;
}

export function updateBuiltInAreaOverride(
  preferences: AreaCatalogPreferences,
  zoneId: string,
  patch: BuiltInAreaOverride,
  knownBuiltInZoneIds: readonly string[],
): AreaCatalogPreferences {
  if (!knownBuiltInZoneIds.includes(zoneId) || !isBuiltInAreaOverride(patch)) return preferences;
  const previous = preferences.builtInOverridesById[zoneId] ?? {};
  const next = { ...previous, ...cloneBuiltInOverride(patch) };
  if (next.title === previous.title && next.alias === previous.alias && next.note === previous.note) return preferences;
  return areaCatalogPreferences({
    ...preferences,
    builtInOverridesById: { ...preferences.builtInOverridesById, [zoneId]: next },
  });
}

function setHiddenId(ids: readonly string[], id: string, hidden: boolean): string[] {
  if (!isSafeAreaId(id)) return [...ids];
  if (hidden) return ids.includes(id) ? [...ids] : [...ids, id];
  return ids.filter((candidate) => candidate !== id);
}

export function setBuiltInAreaHidden(
  preferences: AreaCatalogPreferences,
  zoneId: string,
  hidden: boolean,
  knownBuiltInZoneIds: readonly string[],
): AreaCatalogPreferences {
  if (!knownBuiltInZoneIds.includes(zoneId)) return preferences;
  const hiddenBuiltInZoneIds = setHiddenId(preferences.hiddenBuiltInZoneIds, zoneId, hidden);
  if (hiddenBuiltInZoneIds.join("\u0000") === preferences.hiddenBuiltInZoneIds.join("\u0000")) return preferences;
  return areaCatalogPreferences({ ...preferences, hiddenBuiltInZoneIds });
}

export function setCustomBoardHidden(
  preferences: AreaCatalogPreferences,
  boardId: string,
  hidden: boolean,
): AreaCatalogPreferences {
  const hiddenCustomBoardIds = setHiddenId(preferences.hiddenCustomBoardIds, boardId, hidden);
  if (hiddenCustomBoardIds.join("\u0000") === preferences.hiddenCustomBoardIds.join("\u0000")) return preferences;
  return areaCatalogPreferences({ ...preferences, hiddenCustomBoardIds });
}

export function isBuiltInAreaHidden(preferences: AreaCatalogPreferences, zoneId: string): boolean {
  return preferences.hiddenBuiltInZoneIds.includes(zoneId);
}

export function isCustomBoardHidden(preferences: AreaCatalogPreferences, boardId: string): boolean {
  return preferences.hiddenCustomBoardIds.includes(boardId);
}
