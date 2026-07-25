import {
  customBoardImportBoardId,
  customBoardImportPhotoId,
  type CustomBoardImportArea,
} from "./custom-board-import";
import {
  isCustomBoardStorage,
  type CustomBoard,
} from "./custom-boards";

/** Public, cross-device library format served by the shared photo service. */
export const SHARED_PHOTO_LIBRARY_VERSION = 1;
export const MAX_SHARED_PHOTO_BYTES = 35 * 1024 * 1024;
export const MAX_SHARED_PHOTO_BATCH_BYTES = 100 * 1024 * 1024;

/** Filled in after the shared Sites service receives its first public URL. */
export const PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN = "";

const SOURCE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;
const SAFE_IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export type SharedPhotoUploadMetadata = {
  photo: string;
  width: number;
  height: number;
};

export type SharedPhotoLibraryArea = {
  sourceId: string;
  board: CustomBoard;
  imageUrl: string;
};

export type SharedPhotoLibraryPayload = {
  version: typeof SHARED_PHOTO_LIBRARY_VERSION;
  updatedAt: string | null;
  areas: SharedPhotoLibraryArea[];
};

export type SharedPhotoLibraryUploadResult = {
  added: number;
  skipped: number;
  total: number;
  updatedAt: string;
};

export type SharedPhotoFileLike = Pick<File, "name" | "size" | "type">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedPhotoName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function copyBoard(board: CustomBoard): CustomBoard {
  return {
    ...board,
    spots: board.spots.map((spot) => ({ ...spot })),
  };
}

function isAbsoluteHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function sharedPhotoMimeType(filename: string): string | null {
  const extension = filename.trim().split(".").at(-1)?.toLocaleLowerCase();
  return extension ? MIME_BY_EXTENSION[extension] ?? null : null;
}

export function isAllowedSharedPhoto(file: SharedPhotoFileLike): boolean {
  const filename = file.name.trim();
  if (!filename || !SAFE_IMAGE_EXTENSION.test(filename) || file.size <= 0 || file.size > MAX_SHARED_PHOTO_BYTES) {
    return false;
  }
  return file.type === "" || file.type === "application/octet-stream" || file.type.startsWith("image/");
}

export function isSharedPhotoUploadMetadata(value: unknown): value is SharedPhotoUploadMetadata {
  if (!isRecord(value)) return false;
  const { photo, width, height } = value;
  return isRecord(value)
    && typeof photo === "string"
    && photo.trim().length > 0
    && !/[\\/]/.test(photo)
    && typeof width === "number"
    && typeof height === "number"
    && Number.isInteger(width)
    && Number.isInteger(height)
    && width > 0
    && height > 0
    && width <= 100_000
    && height <= 100_000;
}

/** Converts a portable import area into the stable board identity used by the planner. */
export function sharedPhotoBoardForImport(
  area: CustomBoardImportArea,
  metadata: SharedPhotoUploadMetadata,
  timestamp: string,
): CustomBoard {
  return {
    id: customBoardImportBoardId(area.sourceId),
    title: area.title,
    ...(area.eventName ? { eventName: area.eventName } : {}),
    photoId: customBoardImportPhotoId(area.sourceId),
    filename: metadata.photo,
    width: metadata.width,
    height: metadata.height,
    ...(area.photoScale === undefined ? {} : { photoScale: area.photoScale }),
    spots: area.spots.map((spot) => ({ ...spot })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Checks an untrusted public API response before it can affect planner state. */
export function parseSharedPhotoLibraryPayload(value: unknown): SharedPhotoLibraryPayload | null {
  if (!isRecord(value) || value.version !== SHARED_PHOTO_LIBRARY_VERSION || !Array.isArray(value.areas)) return null;
  if (value.updatedAt !== null && typeof value.updatedAt !== "string") return null;

  const areas: SharedPhotoLibraryArea[] = [];
  const sourceIds = new Set<string>();
  const boardIds = new Set<string>();
  const photoIds = new Set<string>();
  for (const candidate of value.areas) {
    if (!isRecord(candidate)
      || typeof candidate.sourceId !== "string"
      || !SOURCE_ID_PATTERN.test(candidate.sourceId)
      || !isAbsoluteHttpUrl(candidate.imageUrl)
      || !isCustomBoardStorage({ version: 1, boards: [candidate.board] })) {
      return null;
    }
    const board = (candidate.board as CustomBoard);
    if (board.id !== customBoardImportBoardId(candidate.sourceId)
      || board.photoId !== customBoardImportPhotoId(candidate.sourceId)
      || sourceIds.has(candidate.sourceId)
      || boardIds.has(board.id)
      || photoIds.has(board.photoId)) {
      return null;
    }
    sourceIds.add(candidate.sourceId);
    boardIds.add(board.id);
    photoIds.add(board.photoId);
    areas.push({ sourceId: candidate.sourceId, board: copyBoard(board), imageUrl: candidate.imageUrl });
  }

  return {
    version: SHARED_PHOTO_LIBRARY_VERSION,
    updatedAt: value.updatedAt,
    areas,
  };
}

/** Remote boards replace only their matching local IDs; device-only boards remain intact. */
export function mergeSharedPhotoBoards(
  localBoards: readonly CustomBoard[],
  sharedAreas: readonly SharedPhotoLibraryArea[],
): CustomBoard[] {
  const sharedByBoardId = new Map(sharedAreas.map((area) => [area.board.id, copyBoard(area.board)]));
  const localIds = new Set(localBoards.map((board) => board.id));
  return [
    ...localBoards.map((board) => sharedByBoardId.get(board.id) ?? copyBoard(board)),
    ...sharedAreas
      .filter((area) => !localIds.has(area.board.id))
      .map((area) => copyBoard(area.board)),
  ];
}

export function sharedPhotoLibraryServiceOrigin(): string | null {
  if (typeof window === "undefined") return null;
  if (window.location.hostname.endsWith(".chatgpt.site")) return window.location.origin;
  return PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN || null;
}

export function sharedPhotoLibraryManagerUrl(): string | null {
  const origin = sharedPhotoLibraryServiceOrigin();
  return origin ? new URL("/admin", origin).toString() : null;
}

export async function fetchSharedPhotoLibrary(): Promise<SharedPhotoLibraryPayload | null> {
  const origin = sharedPhotoLibraryServiceOrigin();
  if (!origin) return null;
  const response = await fetch(new URL("/api/shared-photo-areas", origin), { cache: "no-store" });
  if (!response.ok) throw new Error("Shared photo library could not be loaded.");
  return parseSharedPhotoLibraryPayload(await response.json());
}

export function sharedPhotoMetadataByName(
  metadata: readonly SharedPhotoUploadMetadata[],
): Map<string, SharedPhotoUploadMetadata> | null {
  const byName = new Map<string, SharedPhotoUploadMetadata>();
  for (const entry of metadata) {
    if (!isSharedPhotoUploadMetadata(entry)) return null;
    const normalized = normalizedPhotoName(entry.photo);
    if (byName.has(normalized)) return null;
    byName.set(normalized, { ...entry, photo: entry.photo.trim() });
  }
  return byName;
}

export function normalizedSharedPhotoName(value: string): string {
  return normalizedPhotoName(value);
}
