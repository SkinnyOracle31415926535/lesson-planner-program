import type { LibraryItem, LibraryVariant } from "./lesson-data";
import {
  STATION_CANVAS,
  STATION_SETUP_VERSION,
  type StationObject,
  type StationSetup,
} from "./station-setups";
import type { StoredIdeaMedia } from "./idea-photos";
import { PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN } from "./shared-photo-library";

/** Versioned, deliberately public state for the cross-device Idea Library. */
export const SHARED_IDEA_LIBRARY_API_VERSION = 1 as const;
export const SHARED_IDEA_LIBRARY_STATE_VERSION = 1 as const;
export const SHARED_IDEA_LIBRARY_PREFERENCES_VERSION = 7 as const;
export const SHARED_IDEA_LIBRARY_MAX_BYTES = 5 * 1024 * 1024;
export const SHARED_IDEA_IMAGE_MAX_BYTES = 35 * 1024 * 1024;
export const SHARED_IDEA_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export type SharedIdeaLibraryPreferences = {
  version: typeof SHARED_IDEA_LIBRARY_PREFERENCES_VERSION;
  gemIds: string[];
  customCards: LibraryItem[];
  recentIdeaIds: string[];
  archivedIdeaIds: string[];
  restoredIdeaIds: string[];
  /** Active editing queue. Drafts remain usable in All Ideas. */
  draftIdeaIds: string[];
  itemOverridesById: Record<string, LibraryItem>;
  removedIdeaIds: string[];
};

type SharedIdeaLibraryPreferencesV6 = Omit<SharedIdeaLibraryPreferences, "version" | "draftIdeaIds"> & {
  version: 6;
};

export type SharedIdeaLibraryState = {
  version: typeof SHARED_IDEA_LIBRARY_STATE_VERSION;
  preferences: SharedIdeaLibraryPreferences;
  stationSetups: StationSetup[];
};

export type SharedIdeaLibraryManifest = {
  version: typeof SHARED_IDEA_LIBRARY_API_VERSION;
  revision: number;
  updatedAt: string | null;
};

export type SharedIdeaLibraryWorkspace = SharedIdeaLibraryManifest & {
  value: SharedIdeaLibraryState;
};

export type SharedIdeaMediaMetadata = {
  id: string;
  ideaId: string;
  kind: "image" | "video";
  filename: string;
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
};

export type SharedIdeaMediaUpload = Pick<
  StoredIdeaMedia,
  "id" | "ideaId" | "blob" | "filename" | "mimeType" | "kind" | "width" | "height" | "durationSeconds" | "createdAt"
>;

export type SharedIdeaLibrarySaveResult =
  | { status: "saved"; workspace: SharedIdeaLibraryWorkspace }
  | { status: "conflict" };

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;
const ITEM_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
const CARD_KINDS = ["SKILL", "DRILL", "ROUTINE", "ACTIVITY", "REFERENCE"] as const;
const CARD_ACCENTS = ["cyan", "green", "yellow", "pink"] as const;
const STATION_ASSETS = ["panel", "folded-panel", "wedge", "block", "landing", "strip", "barrel", "beam"] as const;
const STATION_COLORS = ["blue", "pink", "yellow", "green", "purple"] as const;
const STATION_OBJECT_KINDS = ["equipment", "label", "arrow"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isText(value: unknown, maxLength = 20_000): value is string {
  return typeof value === "string" && value.length <= maxLength && !value.includes("\0");
}

function isIdentifier(value: unknown, item = false): value is string {
  if (typeof value !== "string") return false;
  if (!item) return ID_PATTERN.test(value);
  // Portable library JSON historically allowed coach-written IDs. Keep those
  // text-only records compatible while refusing prototype-pollution keys.
  return ITEM_ID_PATTERN.test(value)
    || (isText(value, 200) && value.trim().length > 0 && !["__proto__", "constructor", "prototype"].includes(value));
}

function isTimestamp(value: unknown): value is string {
  return isText(value, 100) && TIMESTAMP_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

function isFiniteInteger(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum;
}

function isFiniteNumber(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isIdeaLevelList(value: unknown): value is LibraryItem["levels"] {
  return Array.isArray(value)
    && value.every((level) => isFiniteInteger(level, 3, 10))
    && new Set(value).size === value.length
    && value.every((level, index) => index === 0 || value[index - 1] < level);
}

function isTextList(value: unknown, maxItems = 500, maxLength = 20_000): value is string[] {
  return Array.isArray(value)
    && value.length <= maxItems
    && value.every((entry) => isText(entry, maxLength));
}

function isOptionalTextList(value: unknown, maxItems = 500, maxLength = 20_000): boolean {
  return value === undefined || isTextList(value, maxItems, maxLength);
}

function isLibraryVariant(value: unknown): value is LibraryVariant {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "title", "instructions", "sourceRefs"])) return false;
  return isIdentifier(value.id, true)
    && isText(value.title, 500)
    && isTextList(value.instructions)
    && isTextList(value.sourceRefs);
}

function isSupportedMediaMime(kind: "image" | "video", value: unknown): value is string {
  if (!isText(value, 200) || !value.trim()) return false;
  if (kind === "image") return value === "image/*" || /^image\/(?:jpeg|png|webp|heic|heif)$/i.test(value);
  return value === "video/*" || /^video\/(?:mp4|webm|quicktime|x-m4v)$/i.test(value);
}

const LIBRARY_ITEM_KEYS = [
  "id", "kind", "title", "description", "tags", "accent", "starred", "safety", "mats", "lessonLocal", "sourceIdeaId", "selectedVariantId",
  "levels",
  "events", "skills", "goals", "instructions", "coachingCues", "variants", "sourceRefs", "sourceStatus", "sourceType", "defaultArchived",
  "mediaId", "mediaKind", "mediaFilename", "mediaMimeType", "mediaWidth", "mediaHeight", "mediaDurationSeconds",
  "stationSetupId", "stationPreviewKind", "photoId", "photoFilename", "photoWidth", "photoHeight",
] as const;

/** Strict enough for an intentionally public endpoint, while retaining prior local-library records. */
export function isSharedIdeaLibraryItem(value: unknown): value is LibraryItem {
  if (!isRecord(value) || !hasOnlyKeys(value, LIBRARY_ITEM_KEYS)) return false;
  if (!isIdentifier(value.id, true)
    || !(CARD_KINDS as readonly string[]).includes(value.kind as string)
    || !isText(value.title, 500) || !value.title.trim()
    || !isText(value.description)
    || !isTextList(value.tags)
    || !(CARD_ACCENTS as readonly string[]).includes(value.accent as string)
    || !isTextList(value.events)
    || !isTextList(value.skills)
    || !isTextList(value.goals)
    || !isTextList(value.instructions)
    || !isTextList(value.coachingCues)
    || !Array.isArray(value.variants) || value.variants.length > 500 || !value.variants.every(isLibraryVariant)
    || !isTextList(value.sourceRefs)
    || !isText(value.sourceStatus, 200)
    || !isText(value.sourceType, 200)) {
    return false;
  }
  if (value.starred !== undefined && typeof value.starred !== "boolean") return false;
  if (value.safety !== undefined && !isText(value.safety)) return false;
  if (!isOptionalTextList(value.mats)) return false;
  if (value.levels !== undefined && !isIdeaLevelList(value.levels)) return false;
  if (value.lessonLocal !== undefined && typeof value.lessonLocal !== "boolean") return false;
  if (value.sourceIdeaId !== undefined && !isIdentifier(value.sourceIdeaId, true)) return false;
  if (value.selectedVariantId !== undefined && !isIdentifier(value.selectedVariantId, true)) return false;
  if (value.defaultArchived !== undefined && typeof value.defaultArchived !== "boolean") return false;

  const hasMedia = value.mediaId !== undefined || value.mediaKind !== undefined || value.mediaFilename !== undefined
    || value.mediaMimeType !== undefined || value.mediaWidth !== undefined || value.mediaHeight !== undefined
    || value.mediaDurationSeconds !== undefined;
  if (hasMedia) {
    if (!isIdentifier(value.mediaId)
      || (value.mediaKind !== "image" && value.mediaKind !== "video")
      || !isText(value.mediaFilename, 500) || !value.mediaFilename.trim()
      || !isSupportedMediaMime(value.mediaKind, value.mediaMimeType)
      || (value.mediaWidth !== undefined && !isFiniteInteger(value.mediaWidth, 1, 50_000))
      || (value.mediaHeight !== undefined && !isFiniteInteger(value.mediaHeight, 1, 50_000))
      || (value.mediaDurationSeconds !== undefined && !isFiniteNumber(value.mediaDurationSeconds, 0, 86_400))) {
      return false;
    }
  }

  const hasLegacyPhoto = value.photoId !== undefined || value.photoFilename !== undefined || value.photoWidth !== undefined || value.photoHeight !== undefined;
  if (hasLegacyPhoto && (!isIdentifier(value.photoId)
    || !isText(value.photoFilename, 500) || !value.photoFilename.trim()
    || !isFiniteInteger(value.photoWidth, 1, 50_000)
    || !isFiniteInteger(value.photoHeight, 1, 50_000))) return false;
  if (hasMedia && hasLegacyPhoto) return false;

  const hasStation = value.stationSetupId !== undefined || value.stationPreviewKind !== undefined;
  if (hasStation && (!isIdentifier(value.stationSetupId) || value.stationPreviewKind !== "pixel-station")) return false;
  return !(hasMedia || hasLegacyPhoto) || !hasStation;
}

function isSharedIdeaLibraryPreferences(value: unknown): value is SharedIdeaLibraryPreferences | SharedIdeaLibraryPreferencesV6 {
  if (!isRecord(value)) return false;
  const baseKeys = [
    "version", "gemIds", "customCards", "recentIdeaIds", "archivedIdeaIds", "restoredIdeaIds", "itemOverridesById", "removedIdeaIds",
  ] as const;
  const isCurrent = value.version === SHARED_IDEA_LIBRARY_PREFERENCES_VERSION;
  if ((isCurrent && !hasOnlyKeys(value, [...baseKeys, "draftIdeaIds"]))
    || (!isCurrent && (value.version !== 6 || !hasOnlyKeys(value, baseKeys)))) return false;
  if (!isTextList(value.gemIds, 10_000, 200)
    || !Array.isArray(value.customCards) || value.customCards.length > 10_000 || !value.customCards.every(isSharedIdeaLibraryItem)
    || !isTextList(value.recentIdeaIds, 10_000, 200)
    || !isTextList(value.archivedIdeaIds, 10_000, 200)
    || !isTextList(value.restoredIdeaIds, 10_000, 200)
    || !isTextList(value.removedIdeaIds, 10_000, 200)
    || !isRecord(value.itemOverridesById)
    || Object.keys(value.itemOverridesById).length > 10_000) return false;
  if (!Object.entries(value.itemOverridesById).every(([id, card]) => isIdentifier(id, true) && isSharedIdeaLibraryItem(card))) return false;
  if (!isCurrent) return true;
  if (!isTextList(value.draftIdeaIds, 10_000, 200)) return false;
  const archived = new Set(value.archivedIdeaIds);
  const removed = new Set(value.removedIdeaIds);
  return !value.draftIdeaIds.some((id) => archived.has(id) || removed.has(id));
}

function isStationObject(value: unknown): value is StationObject {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "kind", "assetId", "color", "text", "x", "y", "width", "height", "rotation", "zIndex"])) return false;
  if (!isIdentifier(value.id)
    || !(STATION_OBJECT_KINDS as readonly string[]).includes(value.kind as string)
    || !isFiniteNumber(value.x, 0, STATION_CANVAS.width)
    || !isFiniteNumber(value.y, 0, STATION_CANVAS.height)
    || !isFiniteNumber(value.width, 1, STATION_CANVAS.width)
    || !isFiniteNumber(value.height, 1, STATION_CANVAS.height)
    || !isFiniteNumber(value.rotation, -3600, 3600)
    || !isFiniteInteger(value.zIndex, -10_000, 10_000)) return false;
  if (value.assetId !== undefined && !(STATION_ASSETS as readonly string[]).includes(value.assetId as string)) return false;
  if (value.color !== undefined && !(STATION_COLORS as readonly string[]).includes(value.color as string)) return false;
  if (value.text !== undefined && !isText(value.text, 2_000)) return false;
  return value.x + value.width <= STATION_CANVAS.width && value.y + value.height <= STATION_CANVAS.height;
}

export function isSharedIdeaStationSetup(value: unknown): value is StationSetup {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "version", "canvas", "objects", "createdAt", "updatedAt"])) return false;
  if (!isIdentifier(value.id) || value.version !== STATION_SETUP_VERSION || !isRecord(value.canvas)
    || value.canvas.width !== STATION_CANVAS.width || value.canvas.height !== STATION_CANVAS.height || value.canvas.grid !== STATION_CANVAS.grid
    || !Array.isArray(value.objects) || value.objects.length < 1 || value.objects.length > 500 || !value.objects.every(isStationObject)
    || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) return false;
  const ids = value.objects.map((object) => object.id);
  return new Set(ids).size === ids.length;
}

function copyLibraryItem(item: LibraryItem): LibraryItem {
  return {
    ...item,
    tags: [...item.tags],
    ...(item.mats === undefined ? {} : { mats: [...item.mats] }),
    ...(item.levels === undefined ? {} : { levels: [...item.levels] }),
    events: [...item.events],
    skills: [...item.skills],
    goals: [...item.goals],
    instructions: [...item.instructions],
    coachingCues: [...item.coachingCues],
    variants: item.variants.map((variant) => ({ ...variant, instructions: [...variant.instructions], sourceRefs: [...variant.sourceRefs] })),
    sourceRefs: [...item.sourceRefs],
  };
}

function copyStationSetup(setup: StationSetup): StationSetup {
  return {
    ...setup,
    canvas: { ...setup.canvas },
    objects: setup.objects.map((object) => ({ ...object })),
  };
}

/** Copies a validated state so React/browser storage callers cannot mutate a shared reference. */
export function copySharedIdeaLibraryState(state: SharedIdeaLibraryState): SharedIdeaLibraryState {
  return {
    version: SHARED_IDEA_LIBRARY_STATE_VERSION,
    preferences: {
      version: SHARED_IDEA_LIBRARY_PREFERENCES_VERSION,
      gemIds: [...state.preferences.gemIds],
      customCards: state.preferences.customCards.map(copyLibraryItem),
      recentIdeaIds: [...state.preferences.recentIdeaIds],
      archivedIdeaIds: [...state.preferences.archivedIdeaIds],
      restoredIdeaIds: [...state.preferences.restoredIdeaIds],
      draftIdeaIds: [...state.preferences.draftIdeaIds],
      itemOverridesById: Object.fromEntries(Object.entries(state.preferences.itemOverridesById).map(([id, card]) => [id, copyLibraryItem(card)])),
      removedIdeaIds: [...state.preferences.removedIdeaIds],
    },
    stationSetups: state.stationSetups.map(copyStationSetup),
  };
}

/** Parses and copies a public idea-library payload before it reaches browser state or D1. */
export function parseSharedIdeaLibraryState(value: unknown): SharedIdeaLibraryState | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "preferences", "stationSetups"])
    || value.version !== SHARED_IDEA_LIBRARY_STATE_VERSION
    || !isSharedIdeaLibraryPreferences(value.preferences)
    || !Array.isArray(value.stationSetups) || value.stationSetups.length > 10_000 || !value.stationSetups.every(isSharedIdeaStationSetup)) return null;
  const stationIds = value.stationSetups.map((setup) => setup.id);
  if (new Set(stationIds).size !== stationIds.length) return null;
  const cards = [...value.preferences.customCards, ...Object.values(value.preferences.itemOverridesById)];
  const referencedStations = new Set(cards.flatMap((card) => card.stationSetupId ? [card.stationSetupId] : []));
  if (stationIds.some((id) => !referencedStations.has(id)) || [...referencedStations].some((id) => !stationIds.includes(id))) return null;
  const preferences = value.preferences;
  return copySharedIdeaLibraryState({
    version: SHARED_IDEA_LIBRARY_STATE_VERSION,
    preferences: {
      version: SHARED_IDEA_LIBRARY_PREFERENCES_VERSION,
      gemIds: [...preferences.gemIds],
      customCards: preferences.customCards.map(copyLibraryItem),
      recentIdeaIds: [...preferences.recentIdeaIds],
      archivedIdeaIds: [...preferences.archivedIdeaIds],
      restoredIdeaIds: [...preferences.restoredIdeaIds],
      draftIdeaIds: preferences.version === SHARED_IDEA_LIBRARY_PREFERENCES_VERSION ? [...preferences.draftIdeaIds] : [],
      itemOverridesById: Object.fromEntries(Object.entries(preferences.itemOverridesById).map(([id, card]) => [id, copyLibraryItem(card)])),
      removedIdeaIds: [...preferences.removedIdeaIds],
    },
    stationSetups: value.stationSetups.map(copyStationSetup),
  });
}

export function isSharedIdeaLibraryEmpty(state: SharedIdeaLibraryState): boolean {
  const preferences = state.preferences;
  return preferences.gemIds.length === 0
    && preferences.customCards.length === 0
    && preferences.recentIdeaIds.length === 0
    && preferences.archivedIdeaIds.length === 0
    && preferences.restoredIdeaIds.length === 0
    && preferences.draftIdeaIds.length === 0
    && Object.keys(preferences.itemOverridesById).length === 0
    && preferences.removedIdeaIds.length === 0
    && state.stationSetups.length === 0;
}

/** Returns every current attachment reference exactly once, including hidden overrides. */
export function sharedIdeaMediaReferences(state: SharedIdeaLibraryState): Array<Pick<LibraryItem, "id" | "mediaId" | "mediaKind" | "mediaFilename" | "mediaMimeType">> {
  const seen = new Set<string>();
  return [...state.preferences.customCards, ...Object.values(state.preferences.itemOverridesById)].flatMap((card) => {
    if (!card.mediaId || !card.mediaKind || !card.mediaFilename || !card.mediaMimeType || seen.has(card.mediaId)) return [];
    seen.add(card.mediaId);
    return [{
      id: card.id,
      mediaId: card.mediaId,
      mediaKind: card.mediaKind,
      mediaFilename: card.mediaFilename,
      mediaMimeType: card.mediaMimeType,
    }];
  });
}

export function sharedIdeaLibraryFingerprint(state: SharedIdeaLibraryState): string | null {
  try {
    const serialized = JSON.stringify(state);
    let first = 0x811c9dc5;
    let second = 0x9e3779b9;
    for (let index = 0; index < serialized.length; index += 1) {
      const code = serialized.charCodeAt(index);
      first = Math.imul(first ^ code, 0x01000193);
      second = Math.imul(second ^ code, 0x5bd1e995);
    }
    return `${serialized.length}:${(first >>> 0).toString(36)}:${(second >>> 0).toString(36)}`;
  } catch {
    return null;
  }
}

function isRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isWorkspaceRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function parseSharedIdeaLibraryManifest(value: unknown): SharedIdeaLibraryManifest | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "revision", "updatedAt"])
    || value.version !== SHARED_IDEA_LIBRARY_API_VERSION || !isWorkspaceRevision(value.revision)
    || (value.updatedAt !== null && !isTimestamp(value.updatedAt))
    || (value.revision === 0 && value.updatedAt !== null)
    || (value.revision > 0 && value.updatedAt === null)) return null;
  return { version: SHARED_IDEA_LIBRARY_API_VERSION, revision: value.revision, updatedAt: value.updatedAt };
}

export function parseSharedIdeaLibraryWorkspace(value: unknown): SharedIdeaLibraryWorkspace | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "revision", "updatedAt", "value"]) || !hasOwn(value, "value")) return null;
  const manifest = parseSharedIdeaLibraryManifest({ version: value.version, revision: value.revision, updatedAt: value.updatedAt });
  if (!manifest || !isRevision(manifest.revision)) return null;
  const state = parseSharedIdeaLibraryState(value.value);
  return state ? { ...manifest, value: state } : null;
}

export function parseSharedIdeaLibraryWrite(value: unknown): SharedIdeaLibraryState | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "value"])
    || value.version !== SHARED_IDEA_LIBRARY_API_VERSION || !hasOwn(value, "value")) return null;
  return parseSharedIdeaLibraryState(value.value);
}

export function isSafeSharedIdeaMediaId(value: unknown): value is string {
  return isIdentifier(value);
}

function sharedIdeaServiceOrigin(): string {
  // All hosted versions deliberately use one canonical service, so GitHub
  // Pages, previews, and the public app never split a library by origin.
  return PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN;
}

function stateUrl(manifestOnly = false): URL {
  const url = new URL("/api/shared-idea-library-state", sharedIdeaServiceOrigin());
  if (manifestOnly) url.searchParams.set("manifest", "1");
  return url;
}

export function sharedIdeaMediaUrl(mediaId: string): string {
  return new URL(`/api/shared-idea-media/${encodeURIComponent(mediaId)}`, sharedIdeaServiceOrigin()).toString();
}

function sharedIdeaMediaMetadataUrl(mediaId: string): string {
  const url = new URL(`/api/shared-idea-media/${encodeURIComponent(mediaId)}`, sharedIdeaServiceOrigin());
  url.searchParams.set("metadata", "1");
  return url.toString();
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchSharedIdeaLibraryManifest(): Promise<SharedIdeaLibraryManifest> {
  const response = await fetch(stateUrl(true), { cache: "no-store" });
  if (!response.ok) throw new Error("The public Idea Library could not be checked.");
  const manifest = parseSharedIdeaLibraryManifest(await responseJson(response));
  if (!manifest) throw new Error("The public Idea Library returned an invalid manifest.");
  return manifest;
}

export async function fetchSharedIdeaLibrary(): Promise<SharedIdeaLibraryWorkspace | null> {
  const response = await fetch(stateUrl(), { cache: "no-store" });
  if (!response.ok) throw new Error("The public Idea Library could not be loaded.");
  const raw = await responseJson(response);
  const manifest = isRecord(raw)
    ? parseSharedIdeaLibraryManifest({ version: raw.version, revision: raw.revision, updatedAt: raw.updatedAt })
    : null;
  if (!manifest) throw new Error("The public Idea Library returned an invalid snapshot.");
  if (manifest.revision === 0) return null;
  const workspace = parseSharedIdeaLibraryWorkspace(raw);
  if (!workspace) throw new Error("The public Idea Library returned an invalid snapshot.");
  return workspace;
}

export async function bootstrapSharedIdeaLibrary(state: SharedIdeaLibraryState): Promise<SharedIdeaLibrarySaveResult> {
  const response = await fetch(stateUrl(), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", "If-None-Match": "*" },
    body: JSON.stringify({ version: SHARED_IDEA_LIBRARY_API_VERSION, value: state }),
  });
  if (response.status === 412) return { status: "conflict" };
  if (!response.ok) throw new Error("The public Idea Library could not be created.");
  const workspace = parseSharedIdeaLibraryWorkspace(await responseJson(response));
  if (!workspace) throw new Error("The public Idea Library returned an invalid creation response.");
  return { status: "saved", workspace };
}

export async function putSharedIdeaLibrary(
  state: SharedIdeaLibraryState,
  expectedRevision: number,
): Promise<SharedIdeaLibrarySaveResult> {
  if (!isRevision(expectedRevision)) throw new Error("The public Idea Library revision is invalid.");
  const response = await fetch(stateUrl(), {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json", "If-Match": `\"${expectedRevision}\"` },
    body: JSON.stringify({ version: SHARED_IDEA_LIBRARY_API_VERSION, value: state }),
  });
  if (response.status === 412) return { status: "conflict" };
  if (!response.ok) throw new Error("The public Idea Library could not be saved.");
  const workspace = parseSharedIdeaLibraryWorkspace(await responseJson(response));
  if (!workspace || workspace.revision <= expectedRevision) throw new Error("The public Idea Library returned an invalid save response.");
  return { status: "saved", workspace };
}

function parseSharedIdeaMediaMetadata(value: unknown): SharedIdeaMediaMetadata | null {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "id", "ideaId", "kind", "filename", "mimeType", "byteSize", "width", "height", "durationSeconds", "createdAt", "updatedAt",
  ])) return null;
  if (!isIdentifier(value.id) || !isIdentifier(value.ideaId, true)
    || (value.kind !== "image" && value.kind !== "video")
    || !isText(value.filename, 500) || !value.filename.trim()
    || !isSupportedMediaMime(value.kind, value.mimeType)
    || !isFiniteInteger(value.byteSize, 1, value.kind === "image" ? SHARED_IDEA_IMAGE_MAX_BYTES : SHARED_IDEA_VIDEO_MAX_BYTES)
    || (value.width !== undefined && !isFiniteInteger(value.width, 1, 50_000))
    || (value.height !== undefined && !isFiniteInteger(value.height, 1, 50_000))
    || (value.durationSeconds !== undefined && !isFiniteNumber(value.durationSeconds, 0, 86_400))
    || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) return null;
  return value as SharedIdeaMediaMetadata;
}

export async function fetchSharedIdeaMediaMetadata(mediaId: string): Promise<SharedIdeaMediaMetadata | null> {
  if (!isSafeSharedIdeaMediaId(mediaId)) return null;
  const response = await fetch(sharedIdeaMediaMetadataUrl(mediaId), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("The public Idea Library attachment could not be checked.");
  const metadata = parseSharedIdeaMediaMetadata(await responseJson(response));
  if (!metadata) throw new Error("The public Idea Library attachment metadata is invalid.");
  return metadata;
}

export async function uploadSharedIdeaMedia(media: SharedIdeaMediaUpload): Promise<SharedIdeaMediaMetadata> {
  if (!isSafeSharedIdeaMediaId(media.id) || !isIdentifier(media.ideaId, true)
    || (media.kind !== "image" && media.kind !== "video") || !media.filename.trim()) {
    throw new Error("The Idea Library attachment is invalid.");
  }
  const form = new FormData();
  form.set("file", media.blob, media.filename);
  form.set("metadata", JSON.stringify({
    ideaId: media.ideaId,
    kind: media.kind,
    filename: media.filename,
    mimeType: media.mimeType,
    ...(media.width === undefined ? {} : { width: media.width }),
    ...(media.height === undefined ? {} : { height: media.height }),
    ...(media.durationSeconds === undefined ? {} : { durationSeconds: media.durationSeconds }),
    createdAt: media.createdAt,
  }));
  const response = await fetch(sharedIdeaMediaUrl(media.id), { method: "PUT", cache: "no-store", body: form });
  if (!response.ok) throw new Error("The Idea Library attachment could not be uploaded.");
  const metadata = parseSharedIdeaMediaMetadata(await responseJson(response));
  if (!metadata) throw new Error("The public Idea Library attachment returned invalid metadata.");
  return metadata;
}
