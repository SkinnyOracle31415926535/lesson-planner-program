import assert from "node:assert/strict";
import test from "node:test";

import {
  parseSharedPlannerDocument,
  parseSharedPlannerDocumentManifest,
  parseSharedPlannerDocumentWrite,
  parseSharedPlannerWorkspace,
  parseSharedPlannerWorkspaceManifest,
  sharedPlannerDocumentAddress,
} from "../app/shared-planner-documents";

const manifestEntry = {
  kind: "lesson" as const,
  id: "lesson-example-1234567890",
  documentVersion: 1,
  revision: 3,
  updatedAt: "2026-07-25T00:00:00.000Z",
};

test("public planner document responses accept only supported document addresses", () => {
  const document = parseSharedPlannerDocument({
    version: 1,
    ...manifestEntry,
    value: { version: 8, phases: [] },
  });
  assert.ok(document);
  assert.equal(document?.revision, 3);
  assert.deepEqual(document?.value, { version: 8, phases: [] });

  assert.equal(sharedPlannerDocumentAddress("classes", "default")?.kind, "classes");
  assert.equal(sharedPlannerDocumentAddress("classes", "another-workspace"), null);
  assert.equal(sharedPlannerDocumentAddress("unknown", "default"), null);
  assert.equal(parseSharedPlannerDocument({ version: 1, ...manifestEntry, value: {}, extra: true }), null);
});

test("planner manifest and writes reject extra or missing fields", () => {
  const manifest = parseSharedPlannerDocumentManifest({ version: 1, documents: [manifestEntry] });
  assert.equal(manifest?.length, 1);
  assert.equal(parseSharedPlannerDocumentManifest({ version: 1, documents: [{ ...manifestEntry, kind: "classes", id: "lesson-example-1234567890" }] }), null);
  assert.deepEqual(parseSharedPlannerDocumentWrite({ version: 1, value: { ok: true } }), { version: 1, value: { ok: true } });
  assert.equal(parseSharedPlannerDocumentWrite({ version: 1, value: {}, other: true }), null);
});

test("public workspace snapshots require one coherent revision and full document records", () => {
  const workspaceManifest = parseSharedPlannerWorkspaceManifest({
    version: 1,
    revision: 4,
    updatedAt: "2026-07-25T00:00:00.000Z",
    documents: [manifestEntry],
  });
  assert.equal(workspaceManifest?.revision, 4);
  assert.equal(workspaceManifest?.documents[0]?.id, manifestEntry.id);

  const workspace = parseSharedPlannerWorkspace({
    version: 1,
    revision: 4,
    updatedAt: "2026-07-25T00:00:00.000Z",
    documents: [{ version: 1, ...manifestEntry, value: { version: 8, phases: [] } }],
  });
  assert.equal((workspace?.documents[0]?.value as { version?: number } | undefined)?.version, 8);

  assert.equal(parseSharedPlannerWorkspaceManifest({
    version: 1,
    revision: 0,
    updatedAt: "2026-07-25T00:00:00.000Z",
    documents: [],
  }), null);
  assert.equal(parseSharedPlannerWorkspace({
    version: 1,
    revision: 4,
    updatedAt: "2026-07-25T00:00:00.000Z",
    documents: [manifestEntry],
  }), null);
});
