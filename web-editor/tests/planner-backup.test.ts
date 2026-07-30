import assert from "node:assert/strict";
import test from "node:test";
import {
  IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY,
  PLANNER_BACKUP_FORMAT,
  PLANNER_BACKUP_VERSION,
  PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY,
  hasIdeaLibraryRestoreGuard,
  hasPlannerWorkspaceRestoreGuard,
  isPlannerBackupStorageKey,
  markPlannerBackupRestoreGuards,
  parsePlannerBackupJson,
  plannerBackupFilename,
  plannerBackupSummary,
} from "../app/planner-backup";

const exportedAt = "2026-07-29T20:30:00.000Z";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function emptyBackup() {
  return {
    format: PLANNER_BACKUP_FORMAT,
    version: PLANNER_BACKUP_VERSION,
    exportedAt,
    localStorage: {},
    media: { areaPhotos: [], ideaMedia: [], stationSetups: [] },
  };
}

function customBoardStorage() {
  return JSON.stringify({
    version: 1,
    boards: [{
      id: "board-one",
      title: "Floor board",
      photoId: "photo-one",
      filename: "floor.jpg",
      width: 800,
      height: 600,
      spots: [],
      createdAt: exportedAt,
      updatedAt: exportedAt,
    }],
  });
}

function sharedLibraryBoardStorage() {
  return JSON.stringify({
    version: 1,
    boards: [{
      id: "custom-board-import-beams",
      title: "Beams",
      photoId: "photo-custom-board-import-beams",
      filename: "beams.png",
      width: 800,
      height: 600,
      spots: [],
      createdAt: exportedAt,
      updatedAt: exportedAt,
    }],
  });
}

test("full planner backups use a dated portable filename and exclude sync guards", () => {
  assert.equal(plannerBackupFilename(new Date(2026, 6, 29, 9, 5)), "lesson-planner-full-backup-2026-07-29-0905.json");
  assert.equal(isPlannerBackupStorageKey("gym-lesson-planner-local-plan-a-v1"), true);
  assert.equal(isPlannerBackupStorageKey("gymnastics-vault:alternate-schedule:v1"), true);
  assert.equal(isPlannerBackupStorageKey(PLANNER_WORKSPACE_RESTORE_GUARD_STORAGE_KEY), false);
  assert.equal(isPlannerBackupStorageKey(IDEA_LIBRARY_RESTORE_GUARD_STORAGE_KEY), false);
  assert.equal(isPlannerBackupStorageKey("gym-lesson-planner-public-workspace-checkpoint-v1"), false);

  const storage = new MemoryStorage();
  markPlannerBackupRestoreGuards(storage as unknown as Storage);
  assert.equal(hasPlannerWorkspaceRestoreGuard(storage as unknown as Storage), true);
  assert.equal(hasIdeaLibraryRestoreGuard(storage as unknown as Storage), true);
});

test("full planner backups parse only their versioned format", () => {
  const parsed = parsePlannerBackupJson(JSON.stringify(emptyBackup()));
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.deepEqual(plannerBackupSummary(parsed.value), {
      localRecordCount: 0,
      areaPhotoCount: 0,
      ideaMediaCount: 0,
      stationSetupCount: 0,
      attachmentBytes: 0,
    });
  }

  const wrongFormat = { ...emptyBackup(), format: "lesson-planner-ideas" };
  assert.equal(parsePlannerBackupJson(JSON.stringify(wrongFormat)).ok, false);

  const withCheckpoint = {
    ...emptyBackup(),
    localStorage: { "gym-lesson-planner-public-workspace-checkpoint-v1": "{}" },
  };
  assert.equal(parsePlannerBackupJson(JSON.stringify(withCheckpoint)).ok, false);
});

test("full planner backups require every referenced photo", () => {
  const missingPhoto = {
    ...emptyBackup(),
    localStorage: { "gym-lesson-planner-local-custom-boards-v1": customBoardStorage() },
  };
  assert.equal(parsePlannerBackupJson(JSON.stringify(missingPhoto)).ok, false);

  const complete = {
    ...missingPhoto,
    media: {
      areaPhotos: [{
        id: "photo-one",
        base64: "AQID",
        byteSize: 3,
        filename: "floor.jpg",
        mimeType: "image/jpeg",
        width: 800,
        height: 600,
        createdAt: exportedAt,
      }],
      ideaMedia: [],
      stationSetups: [],
    },
  };
  const parsed = parsePlannerBackupJson(JSON.stringify(complete));
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(plannerBackupSummary(parsed.value).attachmentBytes, 3);
});

test("full planner backups keep supplied shared boards out of browser-owned attachments", () => {
  const sharedOnly = {
    ...emptyBackup(),
    localStorage: { "gym-lesson-planner-local-custom-boards-v1": sharedLibraryBoardStorage() },
  };
  assert.equal(parsePlannerBackupJson(JSON.stringify(sharedOnly)).ok, true);
});
