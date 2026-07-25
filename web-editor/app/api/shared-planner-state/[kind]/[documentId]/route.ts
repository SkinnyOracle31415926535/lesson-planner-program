import {
  sharedPlannerDocumentAddress,
  SHARED_PLANNER_DOCUMENT_API_VERSION,
  type SharedPlannerDocumentKind,
} from "../../../../shared-planner-documents";
import {
  publicPlannerCorsHeaders,
  sharedPlannerDatabase,
  sharedPlannerEtag,
  sharedPlannerError,
  sharedPlannerJson,
  storedPlannerDocumentPayload,
  type SharedPlannerStoredDocument,
} from "../../../../shared-planner-documents-server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ kind: string; documentId: string }> };

async function addressFor(context: RouteContext): Promise<{ kind: SharedPlannerDocumentKind; id: string } | null> {
  const { kind, documentId } = await context.params;
  return sharedPlannerDocumentAddress(kind, documentId);
}

function documentResponse(row: SharedPlannerStoredDocument): Response | null {
  const parsed = storedPlannerDocumentPayload(row);
  if (!parsed.ok) return null;
  return sharedPlannerJson({
    version: SHARED_PLANNER_DOCUMENT_API_VERSION,
    kind: row.kind,
    id: row.document_id,
    documentVersion: row.document_version,
    revision: row.revision,
    updatedAt: row.updated_at,
    value: parsed.value,
  }, 200, { ETag: sharedPlannerEtag(row.revision) });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicPlannerCorsHeaders() });
}

export async function GET(_request: Request, context: RouteContext) {
  const address = await addressFor(context);
  if (!address) return sharedPlannerError("Shared planner document not found.", 404);
  try {
    const database = await sharedPlannerDatabase();
    const document = await database
      .prepare(`SELECT kind, document_id, document_version, revision, payload_json, created_at, updated_at
        FROM shared_planner_documents WHERE kind = ? AND document_id = ?`)
      .bind(address.kind, address.id)
      .first<SharedPlannerStoredDocument>();
    if (!document) return sharedPlannerError("Shared planner document not found.", 404);
    return documentResponse(document) ?? sharedPlannerError("The shared planner document is invalid.", 500);
  } catch {
    return sharedPlannerError("The shared planner document is temporarily unavailable.", 503);
  }
}

/**
 * Writes intentionally go through the workspace endpoint so a public request
 * cannot expose a partial set of plans, classes, attendance, or rotations.
 */
export async function PUT() {
  return sharedPlannerError("Update the complete public planner workspace instead.", 405);
}
