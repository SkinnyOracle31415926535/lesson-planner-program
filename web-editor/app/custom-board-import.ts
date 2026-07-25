import { CUSTOM_BOARD_PHOTO_SCALE } from "./custom-boards";

export const CUSTOM_BOARD_IMPORT_FORMAT = "gym-lesson-planner-photo-areas";
export const CUSTOM_BOARD_IMPORT_VERSION = 1;
export const MAX_CUSTOM_BOARD_IMPORT_FILE_BYTES = 1 * 1024 * 1024;
export const MAX_CUSTOM_BOARD_IMPORT_AREAS = 250;

export type CustomBoardImportSpot = {
  id: string;
  name: string;
  x: number;
  y: number;
};

/** A portable record that points to a separately selected local photo. */
export type CustomBoardImportArea = {
  sourceId: string;
  title: string;
  eventName?: string;
  photo: string;
  photoScale?: number;
  spots: CustomBoardImportSpot[];
};

export type CustomBoardImportBundleV1 = {
  format: typeof CUSTOM_BOARD_IMPORT_FORMAT;
  version: typeof CUSTOM_BOARD_IMPORT_VERSION;
  areas: CustomBoardImportArea[];
};

export type CustomBoardImportParseResult =
  | { ok: true; value: CustomBoardImportBundleV1 }
  | { ok: false; error: string };

export type CustomBoardImportPlan = {
  readyAreas: CustomBoardImportArea[];
  duplicateAreas: CustomBoardImportArea[];
  missingPhotoAreas: CustomBoardImportArea[];
  ambiguousPhotoNames: string[];
  unmatchedPhotoNames: string[];
};

const ROOT_KEYS = ["areas", "format", "version"];
const AREA_KEYS = ["eventName", "photo", "photoScale", "sourceId", "spots", "title"];
const SPOT_KEYS = ["id", "name", "x", "y"];
const SOURCE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;
const MAX_FILENAME_LENGTH = 255;
const MAX_SPOTS_PER_AREA = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isFiniteUnit(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isSafePhotoFilename(value: unknown): value is string {
  return isText(value, MAX_FILENAME_LENGTH)
    && value.trim().length > 0
    && value === value.trim()
    && !/[\\/]/.test(value);
}

function isImportSpot(value: unknown): value is CustomBoardImportSpot {
  return isRecord(value)
    && hasOnlyKeys(value, SPOT_KEYS)
    && isText(value.id, 120)
    && value.id.trim().length > 0
    && isText(value.name, 80)
    && value.name.trim().length > 0
    && isFiniteUnit(value.x)
    && isFiniteUnit(value.y);
}

function isImportArea(value: unknown): value is CustomBoardImportArea {
  if (!isRecord(value) || !hasOnlyKeys(value, AREA_KEYS)) return false;
  if (!isText(value.sourceId, 120) || !SOURCE_ID_PATTERN.test(value.sourceId)) return false;
  if (!isText(value.title, 80) || !value.title.trim()) return false;
  if (value.eventName !== undefined && (!isText(value.eventName, 48) || !value.eventName.trim())) return false;
  if (!isSafePhotoFilename(value.photo)) return false;
  if (value.photoScale !== undefined && (
    typeof value.photoScale !== "number"
    || !Number.isFinite(value.photoScale)
    || value.photoScale < CUSTOM_BOARD_PHOTO_SCALE.minimum
    || value.photoScale > CUSTOM_BOARD_PHOTO_SCALE.maximum
  )) return false;
  if (!Array.isArray(value.spots) || value.spots.length > MAX_SPOTS_PER_AREA || !value.spots.every(isImportSpot)) return false;
  return new Set(value.spots.map((spot) => spot.id)).size === value.spots.length;
}

function copyImportArea(area: CustomBoardImportArea): CustomBoardImportArea {
  return {
    sourceId: area.sourceId,
    title: area.title.trim().replace(/\s+/g, " "),
    ...(area.eventName === undefined ? {} : { eventName: area.eventName.trim().replace(/\s+/g, " ") }),
    photo: area.photo,
    ...(area.photoScale === undefined ? {} : { photoScale: area.photoScale }),
    spots: area.spots.map((spot) => ({
      id: spot.id.trim(),
      name: spot.name.trim().replace(/\s+/g, " "),
      x: spot.x,
      y: spot.y,
    })),
  };
}

function normalizedPhotoName(filename: string): string {
  return filename.trim().toLocaleLowerCase();
}

function withoutExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function sourceIdFromFilename(filename: string): string {
  const normalized = withoutExtension(filename)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return normalized || "photo-area";
}

function titlePartsFromFilename(filename: string): { title: string; eventName?: string } {
  const displayName = withoutExtension(filename)
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = displayName.split(/\s+[-–—]\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2 && parts[0].length <= 48 && parts[1].length <= 80) {
    return { eventName: parts[0], title: parts[1] };
  }
  return { title: displayName.slice(0, 80) || "Photo area" };
}

/** Stable local IDs make re-importing the same manifest safely skip duplicates. */
export function customBoardImportBoardId(sourceId: string): string {
  return `custom-board-import-${sourceId}`;
}

export function customBoardImportPhotoId(sourceId: string): string {
  return `photo-${customBoardImportBoardId(sourceId)}`;
}

/** Parses a portable manifest; image bytes are deliberately selected separately. */
export function parseCustomBoardImportJson(
  raw: string,
  fileSize = new TextEncoder().encode(raw).byteLength,
): CustomBoardImportParseResult {
  if (fileSize > MAX_CUSTOM_BOARD_IMPORT_FILE_BYTES) {
    return { ok: false, error: "The photo-area JSON file is larger than 1 MB." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "This is not valid JSON." };
  }

  if (!isRecord(parsed) || !hasOnlyKeys(parsed, ROOT_KEYS)) {
    return { ok: false, error: "This is not a Lesson Planner photo-area import file." };
  }
  if (parsed.format !== CUSTOM_BOARD_IMPORT_FORMAT || parsed.version !== CUSTOM_BOARD_IMPORT_VERSION) {
    return { ok: false, error: "Use a version 1 Lesson Planner photo-area JSON file." };
  }
  if (!Array.isArray(parsed.areas) || !parsed.areas.length || parsed.areas.length > MAX_CUSTOM_BOARD_IMPORT_AREAS || !parsed.areas.every(isImportArea)) {
    return { ok: false, error: "One or more photo areas do not match the supported import format." };
  }

  const sourceIds = parsed.areas.map((area) => area.sourceId);
  if (new Set(sourceIds).size !== sourceIds.length) {
    return { ok: false, error: "The import file contains duplicate source IDs." };
  }
  const photoNames = parsed.areas.map((area) => normalizedPhotoName(area.photo));
  if (new Set(photoNames).size !== photoNames.length) {
    return { ok: false, error: "The import file maps more than one area to the same photo." };
  }

  return {
    ok: true,
    value: {
      format: CUSTOM_BOARD_IMPORT_FORMAT,
      version: CUSTOM_BOARD_IMPORT_VERSION,
      areas: parsed.areas.map(copyImportArea),
    },
  };
}

/** Makes an optional manifest unnecessary when photo filenames are descriptive. */
export function createCustomBoardImportFromPhotoNames(photoNames: readonly string[]): CustomBoardImportBundleV1 {
  const usedSourceIds = new Set<string>();
  const areas = photoNames.map((photo) => {
    const baseSourceId = sourceIdFromFilename(photo);
    let sourceId = baseSourceId;
    let suffix = 2;
    while (usedSourceIds.has(sourceId)) {
      const stem = baseSourceId.slice(0, Math.max(1, 120 - String(suffix).length - 1));
      sourceId = `${stem}-${suffix}`;
      suffix += 1;
    }
    usedSourceIds.add(sourceId);
    const { title, eventName } = titlePartsFromFilename(photo);
    return { sourceId, title, ...(eventName ? { eventName } : {}), photo, spots: [] };
  });
  return { format: CUSTOM_BOARD_IMPORT_FORMAT, version: CUSTOM_BOARD_IMPORT_VERSION, areas };
}

/**
 * Separates safe additions from photos that are unavailable or would replace
 * an existing imported area. The caller validates file types and bytes first.
 */
export function planCustomBoardImport(
  areas: readonly CustomBoardImportArea[],
  selectedPhotoNames: readonly string[],
  existingBoardIds: readonly string[],
): CustomBoardImportPlan {
  const selectedPhotoCounts = new Map<string, number>();
  selectedPhotoNames.forEach((filename) => {
    const name = normalizedPhotoName(filename);
    selectedPhotoCounts.set(name, (selectedPhotoCounts.get(name) ?? 0) + 1);
  });
  const ambiguousPhotoNames = [...selectedPhotoCounts]
    .filter(([, count]) => count > 1)
    .map(([filename]) => filename);
  const manifestPhotoNames = new Set(areas.map((area) => normalizedPhotoName(area.photo)));
  const unmatchedPhotoNames = [...selectedPhotoCounts.keys()]
    .filter((filename) => !manifestPhotoNames.has(filename));
  const existingIds = new Set(existingBoardIds);
  const readyAreas: CustomBoardImportArea[] = [];
  const duplicateAreas: CustomBoardImportArea[] = [];
  const missingPhotoAreas: CustomBoardImportArea[] = [];

  areas.forEach((area) => {
    const photoCount = selectedPhotoCounts.get(normalizedPhotoName(area.photo)) ?? 0;
    if (photoCount !== 1) {
      missingPhotoAreas.push(copyImportArea(area));
    } else if (existingIds.has(customBoardImportBoardId(area.sourceId))) {
      duplicateAreas.push(copyImportArea(area));
    } else {
      readyAreas.push(copyImportArea(area));
    }
  });

  return { readyAreas, duplicateAreas, missingPhotoAreas, ambiguousPhotoNames, unmatchedPhotoNames };
}
