import {
  isCustomBoardStorage,
  listCustomBoardPhotos,
  restoreCustomBoardPhotos,
  type StoredAreaPhoto,
} from "./custom-boards";
import { isFloorPhotoAreaStorage } from "./floor-photo-areas";
import {
  IDEA_IMAGE_MAX_BYTES,
  IDEA_VIDEO_MAX_BYTES,
  listIdeaMedia,
  restoreIdeaMedia,
  type IdeaMediaKind,
  type StoredIdeaMedia,
} from "./idea-photos";
import { PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY } from "./personal-alternate-schedule";
import {
  parseSharedIdeaLibraryState,
  sharedIdeaMediaReferences,
} from "./shared-idea-library";
import {
  isStationSetup,
  listStationSetups,
  restoreStationSetups,
  type StationSetup,
} from "./station-setups";
import { LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY } from "./shared-planner-storage";

export const PLANNER_BACKUP_FORMAT = "gym-lesson-planner-full-backup";
export const PLANNER_BACKUP_VERSION = 1 as const;
export const MAX_PLANNER_BACKUP_FILE_BYTES = 500 * 1024 * 1024;
export const MAX_PLANNER_BACKUP_ATTACHMENT_BYTES = 350 * 1024 * 1024;

const PLANNER_LOCAL_STORAGE_PREFIX = "gym-lesson-planner-local-";
const LOCAL_LIBRARY_STORAGE_KEY = "gym-lesson-planner-local-library-v1";
const LOCAL_CUSTOM_BOARD_STORAGE_KEY = "gym-lesson-planner-local-custom-boards-v1";
const LOCAL_FLOOR_PHOTO_AREA_STORAGE_KEY = "gym-lesson-planner-local-floor-photo-areas-v1";
const MAX_BACKUP_ENTRIES = 10_000;
const MAX_AREA_PHOTO_BYTES = 35 * 1024 * 1024;

export const PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY = "gym-lesson-planner-local-backup-workspace-guard-v1";
export const IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY = "gym-lesson-planner-local-backup-library-guard-v1";

type BackupAreaPhoto = {
  id: string;
  base64: string;
  byteSize: number;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
};

type BackupIdeaMedia = {
  id: string;
  ideaId: string;
  base64: string;
  byteSize: number;
  filename: string;
  mimeType: string;
  kind: IdeaMediaKind;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
};

export type PlannerBackupBundleV1 = {
  format: typeof PLANNER_BACKUP_FORMAT;
  version: typeof PLANNER_BACKUP_VERSION;
  exportedAt: string;
  localStorage: Record<string, string>;
  media: {
    areaPhotos: BackupAreaPhoto[];
    ideaMedia: BackupIdeaMedia[];
    stationSetups: StationSetup[];
  };
};

export type PlannerBackupSummary = {
  localRecordCount: number;
  areaPhotoCount: number;
  ideaMediaCount: number;
  stationSetupCount: number;
  attachmentBytes: number;
};

export type PlannerBackupParseResult =
  | { ok: true; value: PlannerBackupBundleV1 }
  | { ok: false; error: string };

type AreaPhotoReference = {
  id: string;
  filename: string;
  width: number;
  height: number;
  /** Imported shared-library boards retain metadata locally but their source image is not browser-owned. */
  requiresLocalCopy: boolean;
};

type IdeaMediaReference = {
  id: string;
  ideaId: string;
  filename: string;
  mimeType: string;
  kind: IdeaMediaKind;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isText(value: unknown, maximum = 20_000): value is string {
  return typeof value === "string" && value.length <= maximum && !value.includes("\0");
}

function isIdentifier(value: unknown): value is string {
  return isText(value, 240) && value.trim() === value && value.length > 0;
}

function isPositiveInteger(value: unknown, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= maximum;
}

function isOptionalPositiveInteger(value: unknown, maximum = Number.MAX_SAFE_INTEGER): boolean {
  return value === undefined || isPositiveInteger(value, maximum);
}

function isTimestamp(value: unknown): value is string {
  return isText(value, 100) && Number.isFinite(Date.parse(value));
}

function isBase64(value: unknown): value is string {
  return typeof value === "string"
    && value.length <= Math.ceil(MAX_PLANNER_BACKUP_FILE_BYTES * 4 / 3)
    && value.length % 4 === 0
    && /^[A-Za-z0-9+/]*={0,2}$/.test(value);
}

function byteSizeFromBase64(value: string): number {
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return (value.length / 4) * 3 - padding;
}

function normalizeIdeaMediaKind(media: Pick<StoredIdeaMedia, "kind" | "mimeType">): IdeaMediaKind {
  return media.kind ?? (media.mimeType.startsWith("video/") ? "video" : "image");
}

function plannerBackupStorageEntries(storage: Storage): Record<string, string> {
  const entries: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isPlannerBackupStorageKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return entries;
}

function parseStoredJson(values: Record<string, string>, key: string, label: string): unknown | null {
  const raw = values[key];
  if (raw === undefined) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`${label} is damaged and cannot be included in a full backup.`);
  }
}

function uniqueAreaPhotoReferences(references: AreaPhotoReference[]): AreaPhotoReference[] {
  const byId = new Map<string, AreaPhotoReference>();
  references.forEach((reference) => {
    const existing = byId.get(reference.id);
    if (existing && (existing.filename !== reference.filename || existing.width !== reference.width || existing.height !== reference.height)) {
      throw new Error(`The saved photo ${reference.filename} has conflicting area metadata.`);
    }
    byId.set(reference.id, existing
      ? { ...reference, requiresLocalCopy: existing.requiresLocalCopy || reference.requiresLocalCopy }
      : reference);
  });
  return [...byId.values()];
}

function isSharedLibraryBoard(board: { id: string; photoId: string }): boolean {
  return board.id.startsWith("custom-board-import-") && board.photoId === `photo-${board.id}`;
}

function areaPhotoReferences(values: Record<string, string>): AreaPhotoReference[] {
  const references: AreaPhotoReference[] = [];
  const customBoards = parseStoredJson(values, LOCAL_CUSTOM_BOARD_STORAGE_KEY, "Custom photo areas");
  if (customBoards !== null) {
    if (!isCustomBoardStorage(customBoards)) throw new Error("Custom photo-area data is damaged and cannot be included in a full backup.");
    customBoards.boards.forEach((board) => references.push({
      id: board.photoId,
      filename: board.filename,
      width: board.width,
      height: board.height,
      requiresLocalCopy: !isSharedLibraryBoard(board),
    }));
  }
  const floorPhotoAreas = parseStoredJson(values, LOCAL_FLOOR_PHOTO_AREA_STORAGE_KEY, "Floor photo areas");
  if (floorPhotoAreas !== null) {
    if (!isFloorPhotoAreaStorage(floorPhotoAreas)) throw new Error("Floor photo-area data is damaged and cannot be included in a full backup.");
    Object.values(floorPhotoAreas.photosByZoneId).forEach((area) => {
      if (area) references.push({ id: area.photoId, filename: area.filename, width: area.width, height: area.height, requiresLocalCopy: true });
    });
  }
  return uniqueAreaPhotoReferences(references);
}

function stationReferencesFromLibrary(value: unknown): string[] {
  if (!isRecord(value)) return [];
  const preferences = value.preferences;
  if (!isRecord(preferences)) return [];
  const cards = [
    ...(Array.isArray(preferences.customCards) ? preferences.customCards : []),
    ...(isRecord(preferences.itemOverridesById) ? Object.values(preferences.itemOverridesById) : []),
  ];
  return cards.flatMap((card) => isRecord(card) && typeof card.stationSetupId === "string" ? [card.stationSetupId] : []);
}

function ideaMediaReferences(values: Record<string, string>, stationSetups: StationSetup[]): IdeaMediaReference[] {
  const preferences = parseStoredJson(values, LOCAL_LIBRARY_STORAGE_KEY, "Idea Library");
  if (preferences === null) return [];
  const referencedStationIds = new Set(stationReferencesFromLibrary(preferences));
  const state = parseSharedIdeaLibraryState({
    version: 1,
    preferences,
    stationSetups: stationSetups.filter((setup) => referencedStationIds.has(setup.id)),
  });
  if (!state) throw new Error("Idea Library data is damaged and cannot be included in a full backup.");
  return sharedIdeaMediaReferences(state).flatMap((reference) => (
    reference.mediaId && reference.mediaFilename && reference.mediaMimeType && reference.mediaKind
      ? [{
        id: reference.mediaId,
        ideaId: reference.id,
        filename: reference.mediaFilename,
        mimeType: reference.mediaMimeType,
        kind: reference.mediaKind,
      }]
      : []
  ));
}

async function base64ForBlob(blob: Blob): Promise<string> {
  if (!blob.size) throw new Error("A saved attachment is empty and cannot be included in a full backup.");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("The saved attachment could not be read."));
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("The saved attachment could not be read."));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("The saved attachment could not be encoded.");
  return dataUrl.slice(comma + 1);
}

function blobFromBase64(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const chunks: ArrayBuffer[] = [];
  for (let offset = 0; offset < binary.length; offset += 32_768) {
    const slice = binary.slice(offset, offset + 32_768);
    const buffer = new ArrayBuffer(slice.length);
    const bytes = new Uint8Array(buffer);
    for (let index = 0; index < slice.length; index += 1) bytes[index] = slice.charCodeAt(index);
    chunks.push(buffer);
  }
  return new Blob(chunks, { type: mimeType });
}

async function backupAreaPhotos(references: AreaPhotoReference[], photos: StoredAreaPhoto[]): Promise<BackupAreaPhoto[]> {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const backedUp = await Promise.all(references.map(async (reference) => {
    const photo = byId.get(reference.id);
    if (!photo || !photo.blob.size) {
      if (reference.requiresLocalCopy) throw new Error(`The saved photo ${reference.filename} is missing, so no incomplete backup was created.`);
      return null;
    }
    if (photo.blob.size > MAX_AREA_PHOTO_BYTES) throw new Error(`The saved photo ${reference.filename} is too large for a full JSON backup.`);
    if (photo.filename !== reference.filename || photo.width !== reference.width || photo.height !== reference.height) {
      throw new Error(`The saved photo ${reference.filename} no longer matches its area metadata.`);
    }
    return {
      id: photo.id,
      base64: await base64ForBlob(photo.blob),
      byteSize: photo.blob.size,
      filename: photo.filename,
      mimeType: photo.mimeType,
      width: photo.width,
      height: photo.height,
      createdAt: photo.createdAt,
    };
  }));
  return backedUp.filter((photo): photo is BackupAreaPhoto => photo !== null);
}

async function backupIdeaMedia(references: IdeaMediaReference[], media: StoredIdeaMedia[]): Promise<BackupIdeaMedia[]> {
  const byId = new Map(media.map((entry) => [entry.id, entry]));
  return Promise.all(references.map(async (reference) => {
    const entry = byId.get(reference.id);
    if (!entry || !entry.blob.size) throw new Error(`The saved attachment for ${reference.ideaId} is missing, so no incomplete backup was created.`);
    if (entry.ideaId !== reference.ideaId || entry.filename !== reference.filename || entry.mimeType !== reference.mimeType || normalizeIdeaMediaKind(entry) !== reference.kind) {
      throw new Error(`The saved attachment for ${reference.ideaId} no longer matches its Idea Library record.`);
    }
    if (entry.blob.size > (reference.kind === "video" ? IDEA_VIDEO_MAX_BYTES : IDEA_IMAGE_MAX_BYTES)) {
      throw new Error(`The saved attachment for ${reference.ideaId} is too large for a full JSON backup.`);
    }
    return {
      id: entry.id,
      ideaId: entry.ideaId,
      base64: await base64ForBlob(entry.blob),
      byteSize: entry.blob.size,
      filename: entry.filename,
      mimeType: entry.mimeType,
      kind: normalizeIdeaMediaKind(entry),
      ...(entry.width === undefined ? {} : { width: entry.width }),
      ...(entry.height === undefined ? {} : { height: entry.height }),
      ...(entry.durationSeconds === undefined ? {} : { durationSeconds: entry.durationSeconds }),
      createdAt: entry.createdAt,
    };
  }));
}

function isBackupAreaPhoto(value: unknown): value is BackupAreaPhoto {
  return isRecord(value)
    && hasOnlyKeys(value, ["id", "base64", "byteSize", "filename", "mimeType", "width", "height", "createdAt"])
    && isIdentifier(value.id)
    && isBase64(value.base64)
    && isPositiveInteger(value.byteSize, MAX_AREA_PHOTO_BYTES)
    && byteSizeFromBase64(value.base64) === value.byteSize
    && isText(value.filename, 240) && value.filename.trim().length > 0
    && isText(value.mimeType, 200) && value.mimeType.trim().length > 0
    && isPositiveInteger(value.width, 100_000)
    && isPositiveInteger(value.height, 100_000)
    && isTimestamp(value.createdAt);
}

function isBackupIdeaMedia(value: unknown): value is BackupIdeaMedia {
  return isRecord(value)
    && hasOnlyKeys(value, ["id", "ideaId", "base64", "byteSize", "filename", "mimeType", "kind", "width", "height", "durationSeconds", "createdAt"])
    && isIdentifier(value.id)
    && isIdentifier(value.ideaId)
    && isBase64(value.base64)
    && isPositiveInteger(value.byteSize, value.kind === "video" ? IDEA_VIDEO_MAX_BYTES : IDEA_IMAGE_MAX_BYTES)
    && byteSizeFromBase64(value.base64) === value.byteSize
    && isText(value.filename, 240) && value.filename.trim().length > 0
    && isText(value.mimeType, 200) && value.mimeType.trim().length > 0
    && (value.kind === "image" || value.kind === "video")
    && isOptionalPositiveInteger(value.width, 100_000)
    && isOptionalPositiveInteger(value.height, 100_000)
    && (value.durationSeconds === undefined || (typeof value.durationSeconds === "number" && Number.isFinite(value.durationSeconds) && value.durationSeconds >= 0 && value.durationSeconds <= 86_400))
    && isTimestamp(value.createdAt);
}

function isLocalStorageRecord(value: unknown): value is Record<string, string> {
  return isRecord(value)
    && Object.keys(value).length <= MAX_BACKUP_ENTRIES
    && Object.entries(value).every(([key, entry]) => isPlannerBackupStorageKey(key) && typeof entry === "string");
}

function validateReferenceIntegrity(bundle: PlannerBackupBundleV1): string | null {
  try {
    const areaReferences = areaPhotoReferences(bundle.localStorage);
    const ideaReferences = ideaMediaReferences(bundle.localStorage, bundle.media.stationSetups);
    const areaById = new Map(bundle.media.areaPhotos.map((photo) => [photo.id, photo]));
    const ideaById = new Map(bundle.media.ideaMedia.map((media) => [media.id, media]));
    if (areaById.size !== bundle.media.areaPhotos.length || ideaById.size !== bundle.media.ideaMedia.length) return "The backup has duplicate attachment IDs.";
    if (areaById.size > areaReferences.length || ideaById.size !== ideaReferences.length) return "The backup has missing or unreferenced attachments.";
    for (const reference of areaReferences) {
      const photo = areaById.get(reference.id);
      if (!photo && !reference.requiresLocalCopy) continue;
      if (!photo || photo.filename !== reference.filename || photo.width !== reference.width || photo.height !== reference.height) {
        return `The backup is missing the saved photo ${reference.filename}.`;
      }
    }
    for (const reference of ideaReferences) {
      const media = ideaById.get(reference.id);
      if (!media || media.ideaId !== reference.ideaId || media.filename !== reference.filename || media.mimeType !== reference.mimeType || media.kind !== reference.kind) {
        return `The backup is missing the attachment for ${reference.ideaId}.`;
      }
    }
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "The backup has invalid local planner data.";
  }
}

function isPlannerBackupBundle(value: unknown): value is PlannerBackupBundleV1 {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["format", "version", "exportedAt", "localStorage", "media"])
    || value.format !== PLANNER_BACKUP_FORMAT
    || value.version !== PLANNER_BACKUP_VERSION
    || !isTimestamp(value.exportedAt)
    || !isLocalStorageRecord(value.localStorage)
    || !isRecord(value.media)
    || !hasOnlyKeys(value.media, ["areaPhotos", "ideaMedia", "stationSetups"])
    || !Array.isArray(value.media.areaPhotos)
    || !Array.isArray(value.media.ideaMedia)
    || !Array.isArray(value.media.stationSetups)
    || value.media.areaPhotos.length > MAX_BACKUP_ENTRIES
    || value.media.ideaMedia.length > MAX_BACKUP_ENTRIES
    || value.media.stationSetups.length > MAX_BACKUP_ENTRIES
    || !value.media.areaPhotos.every(isBackupAreaPhoto)
    || !value.media.ideaMedia.every(isBackupIdeaMedia)
    || !value.media.stationSetups.every(isStationSetup)
    || new Set(value.media.stationSetups.map((setup) => setup.id)).size !== value.media.stationSetups.length) {
    return false;
  }
  const attachmentBytes = [...value.media.areaPhotos, ...value.media.ideaMedia]
    .reduce((total, entry) => total + entry.byteSize, 0);
  return attachmentBytes <= MAX_PLANNER_BACKUP_ATTACHMENT_BYTES && validateReferenceIntegrity(value as PlannerBackupBundleV1) === null;
}

function restoreLocalStorage(storage: Storage, values: Record<string, string>): void {
  const currentKeys = Object.keys(plannerBackupStorageEntries(storage));
  // Publish every lesson payload first, then its index. This matches the
  // planner's normal persistence order and avoids an index pointing at a
  // missing restored lesson if the browser is interrupted mid-write.
  Object.entries(values)
    .filter(([key]) => key !== LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY)
    .forEach(([key, value]) => storage.setItem(key, value));
  const lessonIndex = values[LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY];
  if (lessonIndex !== undefined) storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, lessonIndex);
  currentKeys.filter((key) => !(key in values)).forEach((key) => storage.removeItem(key));
}

export function isPlannerBackupStorageKey(key: string): boolean {
  return (key.startsWith(PLANNER_LOCAL_STORAGE_PREFIX)
    && key !== PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY
    && key !== IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY)
    || key === PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY;
}

export function plannerBackupFilename(now = new Date()): string {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const time = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join("");
  return `lesson-planner-full-backup-${date}-${time}.json`;
}

export function plannerBackupSummary(bundle: PlannerBackupBundleV1): PlannerBackupSummary {
  const areaPhotoCount = bundle.media.areaPhotos.length;
  const ideaMediaCount = bundle.media.ideaMedia.length;
  return {
    localRecordCount: Object.keys(bundle.localStorage).length,
    areaPhotoCount,
    ideaMediaCount,
    stationSetupCount: bundle.media.stationSetups.length,
    attachmentBytes: [...bundle.media.areaPhotos, ...bundle.media.ideaMedia].reduce((total, entry) => total + entry.byteSize, 0),
  };
}

export async function createPlannerBackupBundle(storage: Storage, exportedAt = new Date().toISOString()): Promise<PlannerBackupBundleV1> {
  const localStorage = plannerBackupStorageEntries(storage);
  const [photos, ideaMedia, stationSetups] = await Promise.all([
    listCustomBoardPhotos(),
    listIdeaMedia(),
    listStationSetups(),
  ]);
  const [areaPhotos, backedUpIdeaMedia] = await Promise.all([
    backupAreaPhotos(areaPhotoReferences(localStorage), photos),
    backupIdeaMedia(ideaMediaReferences(localStorage, stationSetups), ideaMedia),
  ]);
  const bundle: PlannerBackupBundleV1 = {
    format: PLANNER_BACKUP_FORMAT,
    version: PLANNER_BACKUP_VERSION,
    exportedAt,
    localStorage,
    media: { areaPhotos, ideaMedia: backedUpIdeaMedia, stationSetups },
  };
  if (plannerBackupSummary(bundle).attachmentBytes > MAX_PLANNER_BACKUP_ATTACHMENT_BYTES) {
    throw new Error("The saved attachments are too large for one full JSON backup.");
  }
  const error = validateReferenceIntegrity(bundle);
  if (error) throw new Error(error);
  return bundle;
}

export function parsePlannerBackupJson(json: string, fileSize = json.length): PlannerBackupParseResult {
  if (fileSize > MAX_PLANNER_BACKUP_FILE_BYTES) {
    return { ok: false, error: "The selected backup is larger than 500 MB." };
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isPlannerBackupBundle(parsed)) return { ok: false, error: "This is not a valid full Lesson Planner backup." };
    const integrityError = validateReferenceIntegrity(parsed);
    return integrityError ? { ok: false, error: integrityError } : { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "The selected file is not valid JSON." };
  }
}

export async function restorePlannerBackup(storage: Storage, bundle: PlannerBackupBundleV1): Promise<void> {
  const validation = parsePlannerBackupJson(JSON.stringify(bundle));
  if (!validation.ok) throw new Error(validation.error);
  // Pause both automatic sync paths before the restored browser data becomes visible.
  // If an IndexedDB write fails, preserving this guard is safer than risking a
  // partially restored local copy being overwritten by the remote workspace.
  markPlannerBackupRestoreGuards(storage);
  const areaPhotos: StoredAreaPhoto[] = bundle.media.areaPhotos.map((photo) => ({
    id: photo.id,
    blob: blobFromBase64(photo.base64, photo.mimeType),
    filename: photo.filename,
    mimeType: photo.mimeType,
    width: photo.width,
    height: photo.height,
    createdAt: photo.createdAt,
  }));
  const ideaMedia: StoredIdeaMedia[] = bundle.media.ideaMedia.map((media) => ({
    id: media.id,
    ideaId: media.ideaId,
    blob: blobFromBase64(media.base64, media.mimeType),
    filename: media.filename,
    mimeType: media.mimeType,
    kind: media.kind,
    ...(media.width === undefined ? {} : { width: media.width }),
    ...(media.height === undefined ? {} : { height: media.height }),
    ...(media.durationSeconds === undefined ? {} : { durationSeconds: media.durationSeconds }),
    createdAt: media.createdAt,
  }));
  await Promise.all([
    restoreCustomBoardPhotos(areaPhotos),
    restoreIdeaMedia(ideaMedia),
    restoreStationSetups(bundle.media.stationSetups),
  ]);
  restoreLocalStorage(storage, bundle.localStorage);
}

export function markPlannerBackupRestoreGuards(storage: Storage): void {
  const marker = JSON.stringify({ version: 1, restoredAt: new Date().toISOString() });
  storage.setItem(PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY, marker);
  storage.setItem(IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY, marker);
}

export function hasPlannerWorkspaceRestoreGuard(storage: Storage): boolean {
  return storage.getItem(PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY) !== null;
}

export function hasIdeaLibraryRestoreGuard(storage: Storage): boolean {
  return storage.getItem(IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY) !== null;
}

export function clearPlannerWorkspaceRestoreGuard(storage: Storage): void {
  storage.removeItem(PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY);
}

export function clearIdeaLibraryRestoreGuard(storage: Storage): void {
  storage.removeItem(IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY);
}
