import {
  SHARED_PLANNER_DOCUMENT_API_VERSION,
  sharedPlannerDocumentAddress,
  type SharedPlannerDocumentKind,
} from "./shared-planner-documents";

type SharedPlannerRuntime = {
  DB?: D1Database;
};

export type SharedPlannerStoredDocument = {
  kind: SharedPlannerDocumentKind;
  document_id: string;
  document_version: number;
  revision: number;
  payload_json: string;
  created_at: string;
  updated_at: string;
};

export type SharedPlannerStoredWorkspace = {
  workspace_id: string;
  revision: number;
  write_token: string;
  created_at: string;
  updated_at: string;
};

export type SharedPlannerWriteCondition =
  | { kind: "create" }
  | { kind: "replace"; revision: number };

export type PreparedSharedPlannerDocument = {
  kind: SharedPlannerDocumentKind;
  id: string;
  value: unknown;
  payloadJson: string;
};

export const SHARED_PLANNER_WORKSPACE_ID = "public";

const MAX_DOCUMENT_BYTES: Record<SharedPlannerDocumentKind, number> = {
  classes: 512 * 1024,
  "rotation-schedule": 2 * 1024 * 1024,
  "lesson-index": 256 * 1024,
  lesson: 1024 * 1024,
  operations: 256 * 1024,
};

const MAX_BOOTSTRAP_BYTES = 12 * 1024 * 1024;
const REQUIRED_BOOTSTRAP_DOCUMENTS = [
  "classes:default",
  "rotation-schedule:default",
  "operations:default",
  "lesson-index:default",
] as const;

async function runtime(): Promise<SharedPlannerRuntime> {
  const workers = await import("cloudflare:workers") as unknown as { env: SharedPlannerRuntime };
  return workers.env;
}

export async function sharedPlannerDatabase(): Promise<D1Database> {
  const database = (await runtime()).DB;
  if (!database) throw new Error("The shared planner database is unavailable.");
  return database;
}

export function publicPlannerCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, If-Match, If-None-Match",
    "Access-Control-Expose-Headers": "ETag",
    "Cache-Control": "no-store",
  };
}

export function sharedPlannerJson(value: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(value, { status, headers: { ...publicPlannerCorsHeaders(), ...extraHeaders } });
}

export function sharedPlannerError(message: string, status: number): Response {
  return sharedPlannerJson({ error: message }, status);
}

export function sharedPlannerEtag(revision: number): string {
  return `\"${revision}\"`;
}

export function parseSharedPlannerWriteCondition(request: Request): SharedPlannerWriteCondition | null {
  const noneMatch = request.headers.get("if-none-match");
  if (noneMatch === "*") return { kind: "create" };
  const match = request.headers.get("if-match");
  const revision = match?.match(/^\"([1-9]\d*)\"$/)?.[1];
  return revision ? { kind: "replace", revision: Number(revision) } : null;
}

/** The complete workspace can only be replaced with the last committed revision. */
export function parseSharedPlannerWorkspaceRevision(request: Request): number | null {
  const revision = request.headers.get("if-match")?.match(/^\"([1-9]\d*)\"$/)?.[1];
  return revision ? Number(revision) : null;
}

export function isSafeSharedPlannerJsonValue(value: unknown, depth = 0): boolean {
  if (depth > 48 || value === null) return depth <= 48;
  if (typeof value === "string") return value.length <= 20_000;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 20_000 && value.every((entry) => isSafeSharedPlannerJsonValue(entry, depth + 1));
  if (typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const entries = Object.entries(record);
  return entries.length <= 20_000 && entries.every(([key, entry]) => (
    key.length <= 160
    && key !== "__proto__"
    && key !== "constructor"
    && key !== "prototype"
    && isSafeSharedPlannerJsonValue(entry, depth + 1)
  ));
}

/** Reads and bounds one deliberately public JSON document before it reaches D1. */
export async function parseSharedPlannerDocumentValue(
  request: Request,
  kind: SharedPlannerDocumentKind,
): Promise<{ ok: true; value: unknown; payloadJson: string } | { ok: false; message: string; status: number }> {
  const contentType = request.headers.get("content-type")?.toLocaleLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, message: "Use JSON to update the shared planner workspace.", status: 415 };
  }
  const body = await request.text();
  if (!body || new TextEncoder().encode(body).byteLength > MAX_DOCUMENT_BYTES[kind]) {
    return { ok: false, message: "This shared planner record is too large.", status: 413 };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch {
    return { ok: false, message: "The shared planner update is not valid JSON.", status: 400 };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, message: "The shared planner update has an invalid shape.", status: 400 };
  }
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length !== 2
    || record.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !Object.prototype.hasOwnProperty.call(record, "value")
    || !isSafeSharedPlannerJsonValue(record.value)) {
    return { ok: false, message: "The shared planner update has an unsupported shape.", status: 400 };
  }
  return { ok: true, value: record.value, payloadJson: JSON.stringify(record.value) };
}

/** Validates every record for an all-or-nothing first public workspace creation. */
export async function parseSharedPlannerWorkspaceBootstrap(
  request: Request,
): Promise<{ ok: true; documents: PreparedSharedPlannerDocument[] } | { ok: false; message: string; status: number }> {
  const contentType = request.headers.get("content-type")?.toLocaleLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, message: "Use JSON to create the shared planner workspace.", status: 415 };
  }
  const body = await request.text();
  if (!body || new TextEncoder().encode(body).byteLength > MAX_BOOTSTRAP_BYTES) {
    return { ok: false, message: "The first shared planner workspace is too large.", status: 413 };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch {
    return { ok: false, message: "The shared planner workspace is not valid JSON.", status: 400 };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, message: "The shared planner workspace has an invalid shape.", status: 400 };
  }
  const root = parsed as Record<string, unknown>;
  if (Object.keys(root).length !== 2
    || root.version !== SHARED_PLANNER_DOCUMENT_API_VERSION
    || !Array.isArray(root.documents)
    || root.documents.length < REQUIRED_BOOTSTRAP_DOCUMENTS.length
    || root.documents.length > 256) {
    return { ok: false, message: "The shared planner workspace has an unsupported document list.", status: 400 };
  }

  const documents: PreparedSharedPlannerDocument[] = [];
  const documentKeys = new Set<string>();
  for (const candidate of root.documents) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return { ok: false, message: "The shared planner workspace contains an invalid document.", status: 400 };
    }
    const record = candidate as Record<string, unknown>;
    const address = sharedPlannerDocumentAddress(record.kind, record.id);
    if (Object.keys(record).length !== 3
      || !address
      || !Object.prototype.hasOwnProperty.call(record, "value")
      || !isSafeSharedPlannerJsonValue(record.value)) {
      return { ok: false, message: "The shared planner workspace contains an unsupported document.", status: 400 };
    }
    const payloadJson = JSON.stringify(record.value);
    if (new TextEncoder().encode(payloadJson).byteLength > MAX_DOCUMENT_BYTES[address.kind]) {
      return { ok: false, message: "One shared planner document is too large.", status: 413 };
    }
    const key = `${address.kind}:${address.id}`;
    if (documentKeys.has(key)) return { ok: false, message: "The shared planner workspace contains a duplicate document.", status: 400 };
    documentKeys.add(key);
    documents.push({ kind: address.kind, id: address.id, value: record.value, payloadJson });
  }
  if (!REQUIRED_BOOTSTRAP_DOCUMENTS.every((key) => documentKeys.has(key))) {
    return { ok: false, message: "The shared planner workspace is missing a required record.", status: 400 };
  }
  const index = documents.find((document) => document.kind === "lesson-index" && document.id === "default");
  const lessonIds = index ? sharedLessonIds(index.value) : null;
  const suppliedLessonIds = documents.filter((document) => document.kind === "lesson").map((document) => document.id);
  if (!lessonIds
    || lessonIds.length !== suppliedLessonIds.length
    || lessonIds.some((id) => !suppliedLessonIds.includes(id))) {
    return { ok: false, message: "The shared planner workspace lesson records do not match its index.", status: 400 };
  }
  return { ok: true, documents };
}

/** Extracts only safe lesson IDs from the app-owned index before an atomic workspace commit. */
function sharedLessonIds(value: unknown): string[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const plans = (value as Record<string, unknown>).plans;
  if (!Array.isArray(plans)) return null;
  const ids = plans.map((plan) => {
    if (!plan || typeof plan !== "object" || Array.isArray(plan)) return null;
    const id = (plan as Record<string, unknown>).id;
    return sharedPlannerDocumentAddress("lesson", id)?.id ?? null;
  });
  if (ids.some((id) => id === null)) return null;
  const validIds = ids as string[];
  return new Set(validIds).size === validIds.length ? validIds : null;
}

export function storedPlannerDocumentPayload(row: SharedPlannerStoredDocument): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(row.payload_json) as unknown };
  } catch {
    return { ok: false };
  }
}
