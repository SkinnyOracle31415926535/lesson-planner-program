import {
  SHARED_IDEA_LIBRARY_API_VERSION,
  SHARED_IDEA_LIBRARY_MAX_BYTES,
  parseSharedIdeaLibraryWrite,
  type SharedIdeaLibraryState,
} from "./shared-idea-library";

type SharedIdeaLibraryRuntime = {
  DB?: D1Database;
  PHOTO_AREA_IMAGES?: R2Bucket;
};

export const SHARED_IDEA_LIBRARY_WORKSPACE_ID = "public";

export type SharedIdeaLibraryStoredWorkspace = {
  workspace_id: string;
  revision: number;
  payload_json: string;
  created_at: string;
  updated_at: string;
};

async function runtime(): Promise<SharedIdeaLibraryRuntime> {
  const workers = await import("cloudflare:workers") as unknown as { env: SharedIdeaLibraryRuntime };
  return workers.env;
}

export async function sharedIdeaLibraryDatabase(): Promise<D1Database> {
  const database = (await runtime()).DB;
  if (!database) throw new Error("The shared Idea Library database is unavailable.");
  return database;
}

export async function sharedIdeaLibraryMediaBucket(): Promise<R2Bucket> {
  const bucket = (await runtime()).PHOTO_AREA_IMAGES;
  if (!bucket) throw new Error("The shared Idea Library media store is unavailable.");
  return bucket;
}

export function publicIdeaLibraryCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, If-Match, If-None-Match, Range",
    "Access-Control-Expose-Headers": "ETag, Content-Length, Content-Range, Accept-Ranges",
    "Cache-Control": "no-store",
  };
}

export function sharedIdeaLibraryJson(value: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(value, { status, headers: { ...publicIdeaLibraryCorsHeaders(), ...extraHeaders } });
}

export function sharedIdeaLibraryError(message: string, status: number): Response {
  return sharedIdeaLibraryJson({ error: message }, status);
}

export function sharedIdeaLibraryEtag(revision: number): string {
  return `\"${revision}\"`;
}

export function sharedIdeaLibraryExpectedRevision(request: Request): number | null {
  const match = request.headers.get("if-match")?.match(/^\"([1-9]\d*)\"$/)?.[1];
  return match ? Number(match) : null;
}

export async function parseSharedIdeaLibraryStateWrite(
  request: Request,
): Promise<{ ok: true; state: SharedIdeaLibraryState; payloadJson: string } | { ok: false; message: string; status: number }> {
  const contentType = request.headers.get("content-type")?.toLocaleLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, message: "Use JSON to update the public Idea Library.", status: 415 };
  }
  const body = await request.text();
  if (!body || new TextEncoder().encode(body).byteLength > SHARED_IDEA_LIBRARY_MAX_BYTES) {
    return { ok: false, message: "The public Idea Library is too large.", status: 413 };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(body) as unknown;
  } catch {
    return { ok: false, message: "The public Idea Library update is not valid JSON.", status: 400 };
  }
  const state = parseSharedIdeaLibraryWrite(raw);
  if (!state) return { ok: false, message: "The public Idea Library update has an unsupported shape.", status: 400 };
  const payloadJson = JSON.stringify(state);
  if (new TextEncoder().encode(payloadJson).byteLength > SHARED_IDEA_LIBRARY_MAX_BYTES) {
    return { ok: false, message: "The public Idea Library is too large.", status: 413 };
  }
  return { ok: true, state, payloadJson };
}

export function workspaceResponse(row: SharedIdeaLibraryStoredWorkspace | null, manifestOnly: boolean): Response {
  if (!row) {
    return sharedIdeaLibraryJson({
      version: SHARED_IDEA_LIBRARY_API_VERSION,
      revision: 0,
      updatedAt: null,
      ...(manifestOnly ? {} : { value: null }),
    });
  }
  if (manifestOnly) {
    return sharedIdeaLibraryJson({
      version: SHARED_IDEA_LIBRARY_API_VERSION,
      revision: row.revision,
      updatedAt: row.updated_at,
    }, 200, { ETag: sharedIdeaLibraryEtag(row.revision) });
  }
  try {
    const value = JSON.parse(row.payload_json) as unknown;
    return sharedIdeaLibraryJson({
      version: SHARED_IDEA_LIBRARY_API_VERSION,
      revision: row.revision,
      updatedAt: row.updated_at,
      value,
    }, 200, { ETag: sharedIdeaLibraryEtag(row.revision) });
  } catch {
    return sharedIdeaLibraryError("The public Idea Library contains an invalid record.", 500);
  }
}

export async function readSharedIdeaLibraryWorkspace(
  database: D1Database,
): Promise<SharedIdeaLibraryStoredWorkspace | null> {
  return database.prepare(`SELECT workspace_id, revision, payload_json, created_at, updated_at
    FROM shared_idea_library_workspaces WHERE workspace_id = ?`)
    .bind(SHARED_IDEA_LIBRARY_WORKSPACE_ID)
    .first<SharedIdeaLibraryStoredWorkspace>();
}
