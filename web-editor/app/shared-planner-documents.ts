import { PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN } from "./shared-photo-library";

/** Public document API used by every Lesson Planner web link. */
export const SHARED_PLANNER_DOCUMENT_API_VERSION = 1 as const;
export const SHARED_PLANNER_DOCUMENT_VERSION = 1 as const;

export const SHARED_PLANNER_DOCUMENT_KINDS = [
  "classes",
  "rotation-schedule",
  "lesson-index",
  "lesson",
  "operations",
] as const;

export type SharedPlannerDocumentKind = typeof SHARED_PLANNER_DOCUMENT_KINDS[number];

export type SharedPlannerDocumentAddress = {
  kind: SharedPlannerDocumentKind;
  id: string;
};

export type SharedPlannerDocumentManifest = {
  kind: SharedPlannerDocumentKind;
  id: string;
  documentVersion: number;
  revision: number;
  updatedAt: string;
};

export type SharedPlannerDocument = SharedPlannerDocumentManifest & {
  version: typeof SHARED_PLANNER_DOCUMENT_API_VERSION;
  value: unknown;
};

export type SharedPlannerDocumentWrite = {
  version: typeof SHARED_PLANNER_DOCUMENT_API_VERSION;
  value: unknown;
};

export type SharedPlannerDocumentInput = {
  kind: SharedPlannerDocumentKind;
  id: string;
  value: unknown;
};

/** Metadata for the single public planner workspace. Revision 0 means it has not been created yet. */
export type SharedPlannerWorkspaceManifest = {
  version: typeof SHARED_PLANNER_DOCUMENT_API_VERSION;
  revision: number;
  updatedAt: string | null;
  documents: SharedPlannerDocumentManifest[];
};

export type SharedPlannerWorkspace = Omit<SharedPlannerWorkspaceManifest, "documents"> & {
  documents: SharedPlannerDocument[];
};

export type PutSharedPlannerWorkspaceResult =
  | { status: "saved"; workspace: SharedPlannerWorkspace }
  | { status: "conflict" };

export type BootstrapSharedPlannerWorkspaceResult =
  | { status: "saved"; workspace: SharedPlannerWorkspace }
  | { status: "conflict" };

const DOCUMENT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,159}$/i;
const DEFAULT_DOCUMENT_ID = "default";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isWorkspaceRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function isSharedPlannerDocumentKind(value: unknown): value is SharedPlannerDocumentKind {
  return typeof value === "string" && (SHARED_PLANNER_DOCUMENT_KINDS as readonly string[]).includes(value);
}

/** Only these records are accepted by the public service. */
export function sharedPlannerDocumentAddress(kind: unknown, id: unknown): SharedPlannerDocumentAddress | null {
  if (!isSharedPlannerDocumentKind(kind) || typeof id !== "string" || !DOCUMENT_ID_PATTERN.test(id)) return null;
  if (kind === "lesson" || id === DEFAULT_DOCUMENT_ID) return { kind, id };
  return null;
}

export function isSharedPlannerDocumentAddress(kind: unknown, id: unknown): boolean {
  return sharedPlannerDocumentAddress(kind, id) !== null;
}

export function sharedPlannerDocumentKey(kind: SharedPlannerDocumentKind, id: string): string {
  return `${kind}:${id}`;
}

function manifestFields(value: unknown): SharedPlannerDocumentManifest | null {
  const address = isRecord(value) ? sharedPlannerDocumentAddress(value.kind, value.id) : null;
  if (!isRecord(value)
    || !address
    || !isRevision(value.documentVersion)
    || !isRevision(value.revision)
    || !isTimestamp(value.updatedAt)) {
    return null;
  }
  return {
    kind: address.kind,
    id: address.id,
    documentVersion: value.documentVersion,
    revision: value.revision,
    updatedAt: value.updatedAt,
  };
}

function parseManifest(value: unknown): SharedPlannerDocumentManifest | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["kind", "id", "documentVersion", "revision", "updatedAt"])) return null;
  return manifestFields(value);
}

export function parseSharedPlannerDocumentManifest(value: unknown): SharedPlannerDocumentManifest[] | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "documents"])
    || value.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !Array.isArray(value.documents)) {
    return null;
  }
  const documents = value.documents.map(parseManifest);
  if (documents.some((document) => document === null)) return null;
  const parsed = documents as SharedPlannerDocumentManifest[];
  const keys = parsed.map((document) => sharedPlannerDocumentKey(document.kind, document.id));
  return new Set(keys).size === keys.length ? parsed : null;
}

/** Parses the public workspace metadata response without accepting arbitrary wrapper fields. */
export function parseSharedPlannerWorkspaceManifest(value: unknown): SharedPlannerWorkspaceManifest | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "revision", "updatedAt", "documents"])
    || value.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !isWorkspaceRevision(value.revision)
    || (value.updatedAt !== null && !isTimestamp(value.updatedAt))
    || !Array.isArray(value.documents)) {
    return null;
  }
  const documents = value.documents.map(parseManifest);
  if (documents.some((document) => document === null)) return null;
  const parsedDocuments = documents as SharedPlannerDocumentManifest[];
  const keys = parsedDocuments.map((document) => sharedPlannerDocumentKey(document.kind, document.id));
  if (new Set(keys).size !== keys.length) return null;
  if (value.revision === 0 && (value.updatedAt !== null || parsedDocuments.length !== 0)) return null;
  if (value.revision > 0 && (value.updatedAt === null || parsedDocuments.length === 0)) return null;
  return {
    version: SHARED_PLANNER_DOCUMENT_API_VERSION,
    revision: value.revision,
    updatedAt: value.updatedAt,
    documents: parsedDocuments,
  };
}

export function parseSharedPlannerDocument(value: unknown): SharedPlannerDocument | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "kind", "id", "documentVersion", "revision", "updatedAt", "value"])
    || value.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !hasOwn(value, "value")) {
    return null;
  }
  const manifest = manifestFields(value);
  return manifest ? { version: SHARED_PLANNER_DOCUMENT_API_VERSION, ...manifest, value: value.value } : null;
}

/** Parses the full, atomically-read public planner workspace. */
export function parseSharedPlannerWorkspace(value: unknown): SharedPlannerWorkspace | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "revision", "updatedAt", "documents"])
    || value.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !isWorkspaceRevision(value.revision)
    || (value.updatedAt !== null && !isTimestamp(value.updatedAt))
    || !Array.isArray(value.documents)) {
    return null;
  }
  const documents = value.documents.map(parseSharedPlannerDocument);
  if (documents.some((document) => document === null)) return null;
  const parsedDocuments = documents as SharedPlannerDocument[];
  const keys = parsedDocuments.map((document) => sharedPlannerDocumentKey(document.kind, document.id));
  if (new Set(keys).size !== keys.length) return null;
  if (value.revision === 0 && (value.updatedAt !== null || parsedDocuments.length !== 0)) return null;
  if (value.revision > 0 && (value.updatedAt === null || parsedDocuments.length === 0)) return null;
  return {
    version: SHARED_PLANNER_DOCUMENT_API_VERSION,
    revision: value.revision,
    updatedAt: value.updatedAt,
    documents: parsedDocuments,
  };
}

/** Shared by route handlers and client requests so wrapper fields stay narrow. */
export function parseSharedPlannerDocumentWrite(value: unknown): SharedPlannerDocumentWrite | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "value"])
    || value.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !hasOwn(value, "value")) {
    return null;
  }
  return { version: SHARED_PLANNER_DOCUMENT_API_VERSION, value: value.value };
}

function sharedPlannerServiceOrigin(): string | null {
  if (typeof window === "undefined") return null;
  // Every hosted preview and GitHub Pages link deliberately uses this one
  // canonical public service. A preview's own origin has a separate D1
  // binding, so using `window.location.origin` would split the workspace.
  return PUBLISHED_SHARED_PHOTO_LIBRARY_ORIGIN || window.location.origin;
}

function workspaceUrl(manifestOnly = false): URL | null {
  const origin = sharedPlannerServiceOrigin();
  if (!origin) return null;
  const url = new URL("/api/shared-planner-state", origin);
  if (manifestOnly) url.searchParams.set("manifest", "1");
  return url;
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Checks the canonical workspace revision without downloading every lesson payload. */
export async function fetchSharedPlannerWorkspaceManifest(): Promise<SharedPlannerWorkspaceManifest> {
  const url = workspaceUrl(true);
  if (!url) throw new Error("The shared planner workspace is unavailable in this environment.");
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("The shared planner workspace could not be checked.");
  const manifest = parseSharedPlannerWorkspaceManifest(await responseJson(response));
  if (!manifest) throw new Error("The shared planner workspace returned an invalid manifest.");
  return manifest;
}

/** Reads every planner record from one server snapshot. */
export async function fetchSharedPlannerWorkspace(): Promise<SharedPlannerWorkspace | null> {
  const url = workspaceUrl();
  if (!url) throw new Error("The shared planner workspace is unavailable in this environment.");
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("The shared planner workspace could not be loaded.");
  const workspace = parseSharedPlannerWorkspace(await responseJson(response));
  if (!workspace) throw new Error("The shared planner workspace returned an invalid snapshot.");
  return workspace.revision === 0 ? null : workspace;
}

/** Atomically creates the first public workspace so no device can observe a mixed partial set of records. */
export async function bootstrapSharedPlannerWorkspace(
  documents: readonly SharedPlannerDocumentInput[],
): Promise<BootstrapSharedPlannerWorkspaceResult> {
  const url = workspaceUrl();
  if (!url) throw new Error("The shared planner workspace is unavailable in this environment.");
  if (!documents.length || documents.some((document) => !isSharedPlannerDocumentAddress(document.kind, document.id))) {
    throw new Error("The initial shared planner workspace contains an unsupported document address.");
  }
  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: SHARED_PLANNER_DOCUMENT_API_VERSION, documents }),
  });
  if (response.status === 412) return { status: "conflict" };
  if (!response.ok) throw new Error("The shared planner workspace could not be created.");
  const workspace = parseSharedPlannerWorkspace(await responseJson(response));
  if (!workspace || workspace.revision === 0) throw new Error("The shared planner workspace returned an invalid creation response.");
  return { status: "saved", workspace };
}

/**
 * Atomically replaces the complete public workspace with a revision
 * precondition. A stale browser receives a conflict without any partial write.
 */
export async function putSharedPlannerWorkspace(
  documents: readonly SharedPlannerDocumentInput[],
  expectedRevision: number,
): Promise<PutSharedPlannerWorkspaceResult> {
  const url = workspaceUrl();
  if (!url) throw new Error("The shared planner workspace is unavailable in this environment.");
  if (!isRevision(expectedRevision)) throw new Error("The shared planner workspace revision is invalid.");
  if (!documents.length || documents.some((document) => !isSharedPlannerDocumentAddress(document.kind, document.id))) {
    throw new Error("The shared planner workspace contains an unsupported document address.");
  }
  const response = await fetch(url, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "If-Match": `\"${expectedRevision}\"`,
    },
    body: JSON.stringify({ version: SHARED_PLANNER_DOCUMENT_API_VERSION, documents }),
  });
  if (response.status === 412) return { status: "conflict" };
  if (!response.ok) throw new Error("The shared planner document could not be saved.");
  const workspace = parseSharedPlannerWorkspace(await responseJson(response));
  if (!workspace || workspace.revision <= expectedRevision) {
    throw new Error("The shared planner workspace returned an invalid save response.");
  }
  return { status: "saved", workspace };
}
