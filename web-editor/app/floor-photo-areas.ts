/**
 * Browser-local photos for the two floor panels that need their own setup
 * image. The original Skeleton crop remains the fallback until a coach adds
 * a photo here; no supplied art or lesson-zone identity is changed.
 */

export const FLOOR_PHOTO_AREA_STORAGE_VERSION = 1;
export const FLOOR_PHOTO_AREA_IDS = ["f2", "f3"] as const;

export type FloorPhotoAreaId = typeof FLOOR_PHOTO_AREA_IDS[number];

export type FloorPhotoArea = {
  photoId: string;
  filename: string;
  width: number;
  height: number;
  updatedAt: string;
};

export type FloorPhotoAreaStorage = {
  version: typeof FLOOR_PHOTO_AREA_STORAGE_VERSION;
  photosByZoneId: Partial<Record<FloorPhotoAreaId, FloorPhotoArea>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= maximum;
}

function isPositiveSize(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 100_000;
}

function copyFloorPhotoArea(area: FloorPhotoArea): FloorPhotoArea {
  return { ...area };
}

export function isFloorPhotoAreaId(value: string): value is FloorPhotoAreaId {
  return (FLOOR_PHOTO_AREA_IDS as readonly string[]).includes(value);
}

export function isFloorPhotoArea(value: unknown): value is FloorPhotoArea {
  return isRecord(value)
    && isSafeText(value.photoId, 160)
    && isSafeText(value.filename, 240)
    && isPositiveSize(value.width)
    && isPositiveSize(value.height)
    && isSafeText(value.updatedAt, 48)
    && Object.keys(value).every((key) => key === "photoId" || key === "filename" || key === "width" || key === "height" || key === "updatedAt");
}

export function emptyFloorPhotoAreaStorage(): FloorPhotoAreaStorage {
  return { version: FLOOR_PHOTO_AREA_STORAGE_VERSION, photosByZoneId: {} };
}

/** Returns detached, JSON-safe metadata ready for browser localStorage. */
export function floorPhotoAreaStorage(
  photosByZoneId: Partial<Record<FloorPhotoAreaId, FloorPhotoArea>> = {},
): FloorPhotoAreaStorage {
  return {
    version: FLOOR_PHOTO_AREA_STORAGE_VERSION,
    photosByZoneId: Object.fromEntries(
      Object.entries(photosByZoneId)
        .filter(([zoneId, photo]) => isFloorPhotoAreaId(zoneId) && isFloorPhotoArea(photo))
        .map(([zoneId, photo]) => [zoneId, copyFloorPhotoArea(photo)]),
    ),
  } as FloorPhotoAreaStorage;
}

export function isFloorPhotoAreaStorage(value: unknown): value is FloorPhotoAreaStorage {
  if (!isRecord(value)
    || value.version !== FLOOR_PHOTO_AREA_STORAGE_VERSION
    || !isRecord(value.photosByZoneId)
    || Object.keys(value).some((key) => key !== "version" && key !== "photosByZoneId")) {
    return false;
  }
  return Object.entries(value.photosByZoneId).every(([zoneId, photo]) => (
    isFloorPhotoAreaId(zoneId) && isFloorPhotoArea(photo)
  ));
}
