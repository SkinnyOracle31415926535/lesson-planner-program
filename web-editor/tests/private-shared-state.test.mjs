import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shared planner and Idea Library reads require the configured owner", async () => {
  const helper = await read("app/shared-photo-library-server.ts");
  assert.match(helper, /export async function hasSharedPhotoLibraryReadAccess/);
  assert.match(helper, /isSharedPhotoLibraryOwner\(user\)/);
  assert.match(helper, /!origin \|\| origin === new URL\(request\.url\)\.origin/);

  for (const path of [
    "app/api/shared-planner-state/route.ts",
    "app/api/shared-planner-state/[kind]/[documentId]/route.ts",
    "app/api/shared-idea-library-state/route.ts",
  ]) {
    const source = await read(path);
    const accessCheck = source.indexOf("hasSharedPhotoLibraryReadAccess(request)");
    const databaseRead = source.indexOf("sharedPlannerDatabase()", accessCheck);
    const ideaRead = source.indexOf("sharedIdeaLibraryDatabase()", accessCheck);
    assert.ok(accessCheck >= 0, `${path} must check owner access`);
    assert.ok(
      (databaseRead > accessCheck) || (ideaRead > accessCheck),
      `${path} must authorize before reading synchronized state`,
    );
  }
});

test("Lesson Planner's built-in workspace sync waits for local state and pauses concurrent edits", async () => {
  const page = await read("app/page.tsx");
  const localStateGate = page.indexOf("!hasLoadedLocalLesson");
  const remoteLoad = page.indexOf("const remoteWorkspace = await loadSharedPlannerWorkspace()", localStateGate);
  const conflictPause = page.indexOf("pauseSharedPlannerSync();", remoteLoad);
  assert.ok(localStateGate >= 0 && localStateGate < remoteLoad && remoteLoad < conflictPause);
  assert.match(page, /if \(checkpoint\.fingerprint === remoteFingerprint\)/);
  assert.match(page, /if \(sharedPlannerSyncConflictRef\.current\) return "paused"/);
  assert.match(page, /RYAN’S WORKSPACE CHANGED ELSEWHERE · YOUR LOCAL CHANGES ARE KEPT/);
});
