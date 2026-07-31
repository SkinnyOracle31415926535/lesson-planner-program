import type { LibraryItem, LibraryVariant } from "./lesson-data";

export const LIBRARY_TRANSFER_FORMAT = "gym-lesson-planner-idea-library";
export const LIBRARY_TRANSFER_VERSION = 1;
export const MAX_LIBRARY_TRANSFER_FILE_BYTES = 5 * 1024 * 1024;

export type LibraryTransferIdea = Omit<
  LibraryItem,
  | "mediaId"
  | "mediaKind"
  | "mediaFilename"
  | "mediaMimeType"
  | "mediaWidth"
  | "mediaHeight"
  | "mediaDurationSeconds"
  | "stationSetupId"
  | "stationPreviewKind"
  | "photoId"
  | "photoFilename"
  | "photoWidth"
  | "photoHeight"
  | "lessonLocal"
  | "sourceIdeaId"
  | "selectedVariantId"
  | "starred"
>;

export type LibraryTransferBundleV1 = {
  format: typeof LIBRARY_TRANSFER_FORMAT;
  version: typeof LIBRARY_TRANSFER_VERSION;
  exportedAt: string;
  photosIncluded: false;
  ideas: LibraryTransferIdea[];
};

export type LibraryTransferParseResult =
  | { ok: true; value: LibraryTransferBundleV1 }
  | { ok: false; error: string };

export type LibraryMergeResult = {
  mergedIdeas: LibraryItem[];
  newIdeas: LibraryItem[];
  duplicateCount: number;
};

const ROOT_KEYS = ["exportedAt", "format", "ideas", "photosIncluded", "version"];
const IDEA_KEYS = [
  "accent",
  "coachingCues",
  "defaultArchived",
  "description",
  "events",
  "goals",
  "id",
  "instructions",
  "kind",
  "mats",
  "levels",
  "safety",
  "skills",
  "sourceRefs",
  "sourceStatus",
  "sourceType",
  "tags",
  "title",
  "variants",
];
const VARIANT_KEYS = ["id", "instructions", "sourceRefs", "title"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isText(value: unknown, maxLength = 20_000): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isTextList(value: unknown, maxItems = 500): value is string[] {
  return Array.isArray(value)
    && value.length <= maxItems
    && value.every((entry) => isText(entry));
}

function isIdeaLevelList(value: unknown): value is LibraryItem["levels"] {
  return Array.isArray(value)
    && value.every((level) => Number.isInteger(level) && level >= 3 && level <= 10)
    && new Set(value).size === value.length
    && value.every((level, index) => index === 0 || value[index - 1] < level);
}

function isLibraryVariant(value: unknown): value is LibraryVariant {
  if (!isRecord(value) || !hasOnlyKeys(value, VARIANT_KEYS)) return false;
  return isText(value.id, 200)
    && value.id.length > 0
    && isText(value.title, 500)
    && isTextList(value.instructions)
    && isTextList(value.sourceRefs);
}

function isLibraryTransferIdea(value: unknown): value is LibraryTransferIdea {
  if (!isRecord(value) || !hasOnlyKeys(value, IDEA_KEYS)) return false;
  return isText(value.id, 200)
    && value.id.length > 0
    && (value.kind === "SKILL"
      || value.kind === "DRILL"
      || value.kind === "ROUTINE"
      || value.kind === "ACTIVITY"
      || value.kind === "REFERENCE")
    && isText(value.title, 500)
    && value.title.trim().length > 0
    && isText(value.description)
    && isTextList(value.tags)
    && (value.accent === "cyan" || value.accent === "green" || value.accent === "yellow" || value.accent === "pink")
    && (value.safety === undefined || isText(value.safety))
    && (value.mats === undefined || isTextList(value.mats))
    && (value.levels === undefined || isIdeaLevelList(value.levels))
    && isTextList(value.events)
    && isTextList(value.skills)
    && isTextList(value.goals)
    && isTextList(value.instructions)
    && isTextList(value.coachingCues)
    && Array.isArray(value.variants)
    && value.variants.length <= 500
    && value.variants.every(isLibraryVariant)
    && isTextList(value.sourceRefs)
    && isText(value.sourceStatus, 200)
    && isText(value.sourceType, 200)
    && (value.defaultArchived === undefined || typeof value.defaultArchived === "boolean");
}

function portableLibraryIdea(idea: LibraryItem): LibraryTransferIdea {
  return {
    id: idea.id,
    kind: idea.kind,
    title: idea.title,
    description: idea.description,
    tags: [...idea.tags],
    accent: idea.accent,
    ...(idea.safety === undefined ? {} : { safety: idea.safety }),
    ...(idea.mats === undefined ? {} : { mats: [...idea.mats] }),
    ...(idea.levels === undefined ? {} : { levels: [...idea.levels] }),
    events: [...idea.events],
    skills: [...idea.skills],
    goals: [...idea.goals],
    instructions: [...idea.instructions],
    coachingCues: [...idea.coachingCues],
    variants: idea.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      instructions: [...variant.instructions],
      sourceRefs: [...variant.sourceRefs],
    })),
    sourceRefs: [...idea.sourceRefs],
    sourceStatus: idea.sourceStatus,
    sourceType: idea.sourceType,
    ...(idea.defaultArchived === undefined ? {} : { defaultArchived: idea.defaultArchived }),
  };
}

function detachedLibraryItem(idea: LibraryItem): LibraryItem {
  return {
    ...idea,
    tags: [...idea.tags],
    ...(idea.mats === undefined ? {} : { mats: [...idea.mats] }),
    ...(idea.levels === undefined ? {} : { levels: [...idea.levels] }),
    events: [...idea.events],
    skills: [...idea.skills],
    goals: [...idea.goals],
    instructions: [...idea.instructions],
    coachingCues: [...idea.coachingCues],
    variants: idea.variants.map((variant) => ({
      ...variant,
      instructions: [...variant.instructions],
      sourceRefs: [...variant.sourceRefs],
    })),
    sourceRefs: [...idea.sourceRefs],
  };
}

export function createLibraryTransferBundle(
  ideas: readonly LibraryItem[],
  exportedAt = new Date().toISOString(),
): LibraryTransferBundleV1 {
  return {
    format: LIBRARY_TRANSFER_FORMAT,
    version: LIBRARY_TRANSFER_VERSION,
    exportedAt,
    photosIncluded: false,
    ideas: ideas.map(portableLibraryIdea),
  };
}

export function serializeLibraryTransfer(
  ideas: readonly LibraryItem[],
  exportedAt = new Date().toISOString(),
): string {
  return JSON.stringify(createLibraryTransferBundle(ideas, exportedAt), null, 2);
}

export function parseLibraryTransferJson(
  raw: string,
  fileSize = new TextEncoder().encode(raw).byteLength,
): LibraryTransferParseResult {
  if (fileSize > MAX_LIBRARY_TRANSFER_FILE_BYTES) {
    return { ok: false, error: "The library JSON file is larger than 5 MB." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "This is not valid JSON." };
  }

  if (!isRecord(parsed) || !hasOnlyKeys(parsed, ROOT_KEYS)) {
    return { ok: false, error: "This is not a Lesson Planner Idea Library export." };
  }
  if (parsed.format !== LIBRARY_TRANSFER_FORMAT || parsed.version !== LIBRARY_TRANSFER_VERSION) {
    return { ok: false, error: "Use a version 1 Lesson Planner Idea Library JSON file." };
  }
  if (parsed.photosIncluded !== false) {
    return { ok: false, error: "This transfer format does not import attachments." };
  }
  if (!isText(parsed.exportedAt, 100) || !Number.isFinite(Date.parse(parsed.exportedAt))) {
    return { ok: false, error: "The export date is missing or invalid." };
  }
  if (!Array.isArray(parsed.ideas) || parsed.ideas.length > 10_000 || !parsed.ideas.every(isLibraryTransferIdea)) {
    return { ok: false, error: "One or more ideas do not match the supported transfer format." };
  }

  const ids = parsed.ideas.map((idea) => idea.id);
  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: "The transfer file contains duplicate idea IDs." };
  }

  return {
    ok: true,
    value: {
      format: LIBRARY_TRANSFER_FORMAT,
      version: LIBRARY_TRANSFER_VERSION,
      exportedAt: parsed.exportedAt,
      photosIncluded: false,
      ideas: parsed.ideas.map(portableLibraryIdea),
    },
  };
}

export function mergeLibraryTransfer(
  existingIdeas: readonly LibraryItem[],
  importedIdeas: readonly LibraryTransferIdea[],
): LibraryMergeResult {
  const existingIds = new Set(existingIdeas.map((idea) => idea.id));
  const newIdeas = importedIdeas
    .filter((idea) => !existingIds.has(idea.id))
    .map(portableLibraryIdea);
  return {
    mergedIdeas: [...newIdeas, ...existingIdeas.map(detachedLibraryItem)],
    newIdeas,
    duplicateCount: importedIdeas.length - newIdeas.length,
  };
}

export function replaceLibraryTransfer(importedIdeas: readonly LibraryTransferIdea[]): LibraryItem[] {
  return importedIdeas.map(portableLibraryIdea);
}

export function libraryTransferFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `lesson-planner-ideas-${year}-${month}-${day}.json`;
}
