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

test("Lesson Planner sync loads on demand and preserves concurrent local edits", async () => {
  const sync = await read("app/lesson-planner-app-sync.tsx");
  const snapshot = sync.indexOf("const before = new Map");
  const idleWait = sync.indexOf("await waitForEditorIdle()", snapshot);
  const lockedApply = sync.indexOf("await withStorageLock", idleWait);
  const recheck = sync.indexOf("window.localStorage.getItem(key) !== before.get(key)", lockedApply);
  assert.ok(snapshot >= 0 && snapshot < idleWait && idleWait < lockedApply && lockedApply < recheck);
  assert.match(sync, /clientScriptPromise = null/);
  assert.match(sync, /setupPromise = null/);
  assert.match(sync, /showModal\(\);[\s\S]*?void initializeSync\(\);/);
  assert.doesNotMatch(
    sync,
    /useEffect\(\(\) => \{[\s\S]{0,300}?setupClient\(validateLesson\)/,
  );
});
