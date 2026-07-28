import {
  SHARED_IDEA_LIBRARY_WORKSPACE_ID,
  parseSharedIdeaLibraryStateWrite,
  publicIdeaLibraryCorsHeaders,
  readSharedIdeaLibraryWorkspace,
  sharedIdeaLibraryDatabase,
  sharedIdeaLibraryError,
  workspaceResponse,
} from "../../shared-idea-library-server";
import { hasSharedPhotoLibraryWriteAccess } from "../../shared-photo-library-server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicIdeaLibraryCorsHeaders() });
}

/** Public state shared by every Lesson Planner link, including the standalone Library view. */
export async function GET(request: Request) {
  try {
    const row = await readSharedIdeaLibraryWorkspace(await sharedIdeaLibraryDatabase());
    return workspaceResponse(row, new URL(request.url).searchParams.get("manifest") === "1");
  } catch {
    return sharedIdeaLibraryError("The public Idea Library is temporarily unavailable.", 503);
  }
}

/** Creates exactly one initial public Idea Library. A blank browser never needs to call this. */
export async function POST(request: Request) {
  if (!(await hasSharedPhotoLibraryWriteAccess(request))) {
    return sharedIdeaLibraryError("Sign in with the owner ChatGPT account before editing the shared Idea Library.", 401);
  }
  if (request.headers.get("if-none-match") !== "*") {
    return sharedIdeaLibraryError("Use If-None-Match to create the public Idea Library.", 428);
  }
  const parsed = await parseSharedIdeaLibraryStateWrite(request);
  if (!parsed.ok) return sharedIdeaLibraryError(parsed.message, parsed.status);
  try {
    const database = await sharedIdeaLibraryDatabase();
    const timestamp = new Date().toISOString();
    const inserted = await database.prepare(`INSERT INTO shared_idea_library_workspaces
      (workspace_id, revision, write_token, payload_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(workspace_id) DO NOTHING`)
      .bind(SHARED_IDEA_LIBRARY_WORKSPACE_ID, 1, crypto.randomUUID(), parsed.payloadJson, timestamp, timestamp)
      .run();
    if (!inserted.meta.changes) {
      return sharedIdeaLibraryError("The public Idea Library already exists. Load its latest copy before saving.", 412);
    }
    return workspaceResponse(await readSharedIdeaLibraryWorkspace(database), false);
  } catch {
    return sharedIdeaLibraryError("The public Idea Library could not be created.", 503);
  }
}

/**
 * Intentionally public per Ryan's no-sign-in request. The revision precondition
 * prevents one device from silently replacing another device's full library.
 */
export async function PUT(request: Request) {
  if (!(await hasSharedPhotoLibraryWriteAccess(request))) {
    return sharedIdeaLibraryError("Sign in with the owner ChatGPT account before editing the shared Idea Library.", 401);
  }
  const expected = request.headers.get("if-match")?.match(/^\"([1-9]\d*)\"$/)?.[1];
  if (!expected) return sharedIdeaLibraryError("Use If-Match with the current public Idea Library revision.", 428);
  const parsed = await parseSharedIdeaLibraryStateWrite(request);
  if (!parsed.ok) return sharedIdeaLibraryError(parsed.message, parsed.status);
  try {
    const database = await sharedIdeaLibraryDatabase();
    const timestamp = new Date().toISOString();
    const nextRevision = Number(expected) + 1;
    const updated = await database.prepare(`UPDATE shared_idea_library_workspaces
      SET revision = ?, write_token = ?, payload_json = ?, updated_at = ?
      WHERE workspace_id = ? AND revision = ?`)
      .bind(nextRevision, crypto.randomUUID(), parsed.payloadJson, timestamp, SHARED_IDEA_LIBRARY_WORKSPACE_ID, Number(expected))
      .run();
    if (!updated.meta.changes) {
      return sharedIdeaLibraryError("The public Idea Library changed elsewhere. Load its latest copy before saving.", 412);
    }
    return workspaceResponse(await readSharedIdeaLibraryWorkspace(database), false);
  } catch {
    return sharedIdeaLibraryError("The public Idea Library could not be saved.", 503);
  }
}
