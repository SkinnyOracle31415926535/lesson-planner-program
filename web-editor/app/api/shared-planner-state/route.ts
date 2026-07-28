import {
  SHARED_PLANNER_DOCUMENT_API_VERSION,
  SHARED_PLANNER_DOCUMENT_VERSION,
} from "../../shared-planner-documents";
import {
  parseSharedPlannerWorkspaceBootstrap,
  parseSharedPlannerWorkspaceRevision,
  publicPlannerCorsHeaders,
  SHARED_PLANNER_WORKSPACE_ID,
  sharedPlannerDatabase,
  sharedPlannerError,
  sharedPlannerJson,
  storedPlannerDocumentPayload,
  type PreparedSharedPlannerDocument,
  type SharedPlannerStoredDocument,
  type SharedPlannerStoredWorkspace,
} from "../../shared-planner-documents-server";
import {
  hasSharedPhotoLibraryReadAccess,
  hasSharedPhotoLibraryWriteAccess,
} from "../../shared-photo-library-server";

export const dynamic = "force-dynamic";

type SharedPlannerWorkspaceDocumentRow = SharedPlannerStoredWorkspace & {
  kind: SharedPlannerStoredDocument["kind"];
  document_id: string;
  document_version: number;
  document_revision: number;
  payload_json: string;
  document_created_at: string;
  document_updated_at: string;
};

type SharedPlannerDatabase = Awaited<ReturnType<typeof sharedPlannerDatabase>>;

function workspaceMetadata(workspace: SharedPlannerStoredWorkspace, documents: SharedPlannerStoredDocument[]) {
  return {
    version: SHARED_PLANNER_DOCUMENT_API_VERSION,
    revision: workspace.revision,
    updatedAt: workspace.updated_at,
    documents: documents.map((document) => ({
      kind: document.kind,
      id: document.document_id,
      documentVersion: document.document_version,
      revision: document.revision,
      updatedAt: document.updated_at,
    })),
  };
}

function emptyWorkspace() {
  return {
    version: SHARED_PLANNER_DOCUMENT_API_VERSION,
    revision: 0,
    updatedAt: null,
    documents: [],
  };
}

async function readWorkspaceResponse(database: SharedPlannerDatabase, manifestOnly: boolean): Promise<Response> {
  const rows = await database
    .prepare(manifestOnly
      ? `SELECT w.workspace_id, w.revision, w.write_token, w.created_at, w.updated_at,
          d.kind, d.document_id, d.document_version, d.revision AS document_revision,
          d.created_at AS document_created_at, d.updated_at AS document_updated_at
        FROM shared_planner_workspaces w
        LEFT JOIN shared_planner_documents d ON 1 = 1
        WHERE w.workspace_id = ?
        ORDER BY d.kind COLLATE NOCASE, d.document_id COLLATE NOCASE`
      : `SELECT w.workspace_id, w.revision, w.write_token, w.created_at, w.updated_at,
          d.kind, d.document_id, d.document_version, d.revision AS document_revision,
          d.payload_json, d.created_at AS document_created_at, d.updated_at AS document_updated_at
        FROM shared_planner_workspaces w
        LEFT JOIN shared_planner_documents d ON 1 = 1
        WHERE w.workspace_id = ?
        ORDER BY d.kind COLLATE NOCASE, d.document_id COLLATE NOCASE`)
    .bind(SHARED_PLANNER_WORKSPACE_ID)
    .all<SharedPlannerWorkspaceDocumentRow>();

  if (!rows.results.length) return sharedPlannerJson(emptyWorkspace());
  const first = rows.results[0];
  if (!first.kind || !first.document_id || !first.document_version || !first.document_revision || !first.document_updated_at) {
    throw new Error("The shared planner workspace is missing its documents.");
  }
  const workspace: SharedPlannerStoredWorkspace = {
    workspace_id: first.workspace_id,
    revision: first.revision,
    write_token: first.write_token,
    created_at: first.created_at,
    updated_at: first.updated_at,
  };
  const documents: SharedPlannerStoredDocument[] = rows.results.map((row: SharedPlannerWorkspaceDocumentRow) => ({
    kind: row.kind,
    document_id: row.document_id,
    document_version: row.document_version,
    revision: row.document_revision,
    payload_json: manifestOnly ? "" : row.payload_json,
    created_at: row.document_created_at,
    updated_at: row.document_updated_at,
  }));
  const metadata = workspaceMetadata(workspace, documents);
  if (manifestOnly) return sharedPlannerJson(metadata);

  const values = documents.map((document) => {
    const parsed = storedPlannerDocumentPayload(document);
    if (!parsed.ok) throw new Error("The shared planner workspace contains invalid JSON.");
    return {
      version: SHARED_PLANNER_DOCUMENT_API_VERSION,
      kind: document.kind,
      id: document.document_id,
      documentVersion: document.document_version,
      revision: document.revision,
      updatedAt: document.updated_at,
      value: parsed.value,
    };
  });
  return sharedPlannerJson({ ...metadata, documents: values });
}

function documentUpsertStatement(
  database: SharedPlannerDatabase,
  document: PreparedSharedPlannerDocument,
  timestamp: string,
  writeToken: string,
  nextWorkspaceRevision: number,
) {
  return database.prepare(`INSERT INTO shared_planner_documents
      (kind, document_id, document_version, revision, payload_json, created_at, updated_at)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE EXISTS (
        SELECT 1 FROM shared_planner_workspaces
        WHERE workspace_id = ? AND write_token = ? AND revision = ?
      )
      ON CONFLICT(kind, document_id) DO UPDATE SET
        document_version = excluded.document_version,
        revision = shared_planner_documents.revision + 1,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
      WHERE EXISTS (
        SELECT 1 FROM shared_planner_workspaces
        WHERE workspace_id = ? AND write_token = ? AND revision = ?
      )`)
    .bind(
      document.kind,
      document.id,
      SHARED_PLANNER_DOCUMENT_VERSION,
      1,
      document.payloadJson,
      timestamp,
      timestamp,
      SHARED_PLANNER_WORKSPACE_ID,
      writeToken,
      nextWorkspaceRevision,
      SHARED_PLANNER_WORKSPACE_ID,
      writeToken,
      nextWorkspaceRevision,
    );
}

function staleLessonDeleteStatement(
  database: SharedPlannerDatabase,
  documents: readonly PreparedSharedPlannerDocument[],
  writeToken: string,
  nextWorkspaceRevision: number,
) {
  const lessonIds = documents.filter((document) => document.kind === "lesson").map((document) => document.id);
  const workspaceCondition = `EXISTS (
    SELECT 1 FROM shared_planner_workspaces
    WHERE workspace_id = ? AND write_token = ? AND revision = ?
  )`;
  if (!lessonIds.length) {
    return database.prepare(`DELETE FROM shared_planner_documents
      WHERE kind = 'lesson' AND ${workspaceCondition}`)
      .bind(SHARED_PLANNER_WORKSPACE_ID, writeToken, nextWorkspaceRevision);
  }
  const placeholders = lessonIds.map(() => "?").join(", ");
  return database.prepare(`DELETE FROM shared_planner_documents
    WHERE kind = 'lesson' AND document_id NOT IN (${placeholders}) AND ${workspaceCondition}`)
    .bind(...lessonIds, SHARED_PLANNER_WORKSPACE_ID, writeToken, nextWorkspaceRevision);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicPlannerCorsHeaders() });
}

/** An owner-only workspace snapshot is read in one D1 query, never document-by-document. */
export async function GET(request: Request) {
  if (!(await hasSharedPhotoLibraryReadAccess(request))) {
    return sharedPlannerError("Sign in with the owner ChatGPT account before reading the shared planner.", 401);
  }
  try {
    const manifestOnly = new URL(request.url).searchParams.get("manifest") === "1";
    return await readWorkspaceResponse(await sharedPlannerDatabase(), manifestOnly);
  } catch {
    return sharedPlannerError("The shared planner workspace is temporarily unavailable.", 503);
  }
}

/** Creates the first deliberately public workspace as one all-or-nothing D1 batch. */
export async function POST(request: Request) {
  if (!(await hasSharedPhotoLibraryWriteAccess(request))) {
    return sharedPlannerError("Sign in with the owner ChatGPT account before editing the shared planner.", 401);
  }
  const parsed = await parseSharedPlannerWorkspaceBootstrap(request);
  if (!parsed.ok) return sharedPlannerError(parsed.message, parsed.status);

  try {
    const database = await sharedPlannerDatabase();
    const timestamp = new Date().toISOString();
    const writeToken = crypto.randomUUID();
    const statements = [
      database.prepare(`INSERT INTO shared_planner_workspaces
        (workspace_id, revision, write_token, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(workspace_id) DO NOTHING`)
        .bind(SHARED_PLANNER_WORKSPACE_ID, 1, writeToken, timestamp, timestamp),
      ...parsed.documents.map((document) => documentUpsertStatement(database, document, timestamp, writeToken, 1)),
    ];
    const results = await database.batch(statements);
    if (!results[0]?.meta.changes) {
      return sharedPlannerError("The public planner workspace already exists. Load its latest copy before saving.", 412);
    }
    return await readWorkspaceResponse(database, false);
  } catch {
    return sharedPlannerError("The shared planner workspace could not be created.", 503);
  }
}

/**
 * Intentionally public: Ryan explicitly chose a public, no-sign-in workspace.
 * The workspace revision is a compare-and-swap guard, so an old browser cannot
 * publish a partial or stale multi-document snapshot.
 */
export async function PUT(request: Request) {
  if (!(await hasSharedPhotoLibraryWriteAccess(request))) {
    return sharedPlannerError("Sign in with the owner ChatGPT account before editing the shared planner.", 401);
  }
  const expectedRevision = parseSharedPlannerWorkspaceRevision(request);
  if (!expectedRevision) return sharedPlannerError("Use If-Match with the current public workspace revision.", 428);
  const parsed = await parseSharedPlannerWorkspaceBootstrap(request);
  if (!parsed.ok) return sharedPlannerError(parsed.message, parsed.status);

  try {
    const database = await sharedPlannerDatabase();
    const timestamp = new Date().toISOString();
    const writeToken = crypto.randomUUID();
    const nextWorkspaceRevision = expectedRevision + 1;
    const statements = [
      database.prepare(`UPDATE shared_planner_workspaces
        SET revision = ?, write_token = ?, updated_at = ?
        WHERE workspace_id = ? AND revision = ?`)
        .bind(nextWorkspaceRevision, writeToken, timestamp, SHARED_PLANNER_WORKSPACE_ID, expectedRevision),
      ...parsed.documents.map((document) => documentUpsertStatement(database, document, timestamp, writeToken, nextWorkspaceRevision)),
      staleLessonDeleteStatement(database, parsed.documents, writeToken, nextWorkspaceRevision),
    ];
    const results = await database.batch(statements);
    if (!results[0]?.meta.changes) {
      return sharedPlannerError("The public planner workspace changed elsewhere. Load its latest copy before saving.", 412);
    }
    return await readWorkspaceResponse(database, false);
  } catch {
    return sharedPlannerError("The shared planner workspace could not be saved.", 503);
  }
}
