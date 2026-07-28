import assert from "node:assert/strict";
import test from "node:test";

import { emptyLocalClassStorage } from "../app/local-classes";
import { emptySafeScheduleStorage } from "../app/local-schedule";
import { lessonPlannerMigrationGate } from "../app/lesson-planner-app-sync";
import {
  LESSON_PLANNER_APP_SYNC_MIGRATED_KEY,
  applyLessonPlannerRemoteRecord,
  hasCompletedLessonPlannerAppSync,
  lessonPlannerStorageKeysForRecord,
  markLessonPlannerAppSyncComplete,
  rawLessonPlannerBackup,
  readLessonPlannerSyncRecords,
  validateLessonPlannerSyncRecord,
} from "../app/lesson-planner-app-sync-storage";
import {
  LOCAL_CLASS_STORAGE_KEY,
  LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
  LOCAL_LESSON_STORAGE_KEY,
  LOCAL_OPERATIONS_STORAGE_KEY,
  LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
  emptyPlannerOperationsStorage,
  lessonPlanStorageKey,
} from "../app/shared-planner-storage";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const plan = {
  id: "lesson-example-1234567890",
  date: "2026-07-28",
  classId: null,
  title: "Example lesson",
  createdAt: "2026-07-28T00:00:00.000Z",
  updatedAt: "2026-07-28T00:00:00.000Z",
  storage: "scoped" as const,
};

const index = {
  version: 2 as const,
  activePlanId: plan.id,
  plans: [plan],
};

const lesson = { version: 8, phases: [] };
const validateLesson = (value: unknown) =>
  Boolean(value && typeof value === "object" && (value as { version?: number }).version === 8);

function readyStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_CLASS_STORAGE_KEY, JSON.stringify(emptyLocalClassStorage()));
  storage.setItem(LOCAL_SAFE_SCHEDULE_STORAGE_KEY, JSON.stringify(emptySafeScheduleStorage()));
  storage.setItem(LOCAL_OPERATIONS_STORAGE_KEY, JSON.stringify(emptyPlannerOperationsStorage()));
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(index));
  storage.setItem(lessonPlanStorageKey(plan.id), JSON.stringify(lesson));
  return storage;
}

test("the exact backup reads only fixed planner keys and lessons from a validated index", () => {
  const storage = readyStorage();
  storage.setItem("gym-lesson-planner-local-media", "NEVER_EXPORT");
  storage.setItem("another-app-secret", "NEVER_EXPORT");

  const backup = rawLessonPlannerBackup(storage as unknown as Storage);
  const keys = backup.records.map((record) => record.key);
  assert.equal(backup.index_valid, true);
  assert.deepEqual(keys, [
    LOCAL_CLASS_STORAGE_KEY,
    LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
    LOCAL_OPERATIONS_STORAGE_KEY,
    LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
    LOCAL_LESSON_STORAGE_KEY,
    lessonPlanStorageKey(plan.id),
  ]);
  assert.doesNotMatch(JSON.stringify(backup), /NEVER_EXPORT/);
});

test("planner records are individual, validated, and ordered with lessons before the index", () => {
  const records = readLessonPlannerSyncRecords(
    readyStorage() as unknown as Storage,
    validateLesson,
  );
  assert.deepEqual(records.map((record) => record.collection), [
    "classes",
    "rotation_schedule",
    "operations",
    "lesson_records",
    "lesson_z_index",
  ]);
  assert.ok(records.every((record) =>
    validateLessonPlannerSyncRecord(record, validateLesson)));
  const lessonRecord = records.find((record) => record.collection === "lesson_records");
  assert.deepEqual(lessonRecord?.value, {
    version: 1,
    planId: plan.id,
    storage: "scoped",
    lesson,
  });
});

test("remote lessons land before their index and deletions preserve recovery bytes", () => {
  const storage = readyStorage();
  const nextPlan = {
    ...plan,
    id: "lesson-next-1234567890",
    title: "Next lesson",
  };
  const nextLesson = { version: 8, phases: [{ id: "warmup" }] };
  const nextLessonRecord = {
    collection: "lesson_records" as const,
    recordId: nextPlan.id,
    value: {
      version: 1,
      planId: nextPlan.id,
      storage: "scoped",
      lesson: nextLesson,
    },
  };
  applyLessonPlannerRemoteRecord(
    storage as unknown as Storage,
    nextLessonRecord,
    false,
    validateLesson,
  );
  applyLessonPlannerRemoteRecord(
    storage as unknown as Storage,
    {
      collection: "lesson_z_index",
      recordId: "default",
      value: { version: 2, activePlanId: nextPlan.id, plans: [nextPlan] },
    },
    false,
    validateLesson,
  );
  assert.deepEqual(
    JSON.parse(storage.getItem(lessonPlanStorageKey(nextPlan.id))!),
    nextLesson,
  );

  applyLessonPlannerRemoteRecord(
    storage as unknown as Storage,
    { ...nextLessonRecord, value: null },
    true,
    validateLesson,
  );
  assert.ok(storage.getItem(lessonPlanStorageKey(nextPlan.id)));
  assert.throws(() => applyLessonPlannerRemoteRecord(
    storage as unknown as Storage,
    { collection: "classes", recordId: "default", value: null },
    true,
    validateLesson,
  ));
});

test("an invalid index is backed up without discovering arbitrary dynamic keys", () => {
  const storage = readyStorage();
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, "{broken");
  storage.setItem("gym-lesson-planner-local-plan-guessed-v1", "NEVER_DISCOVER");
  const backup = rawLessonPlannerBackup(storage as unknown as Storage);
  assert.equal(backup.index_valid, false);
  assert.equal(
    backup.records.some((record) => record.key.includes("guessed")),
    false,
  );
  assert.doesNotMatch(JSON.stringify(backup), /NEVER_DISCOVER/);
});

test("unsafe lesson IDs cannot validate or materialize dynamic storage keys", () => {
  const unsafePlan = { ...plan, id: "unsupported lesson id" };
  const unsafeRecord = {
    collection: "lesson_z_index" as const,
    recordId: "default",
    value: {
      ...index,
      activePlanId: unsafePlan.id,
      plans: [unsafePlan],
    },
  };
  assert.equal(validateLessonPlannerSyncRecord(unsafeRecord, validateLesson), false);
  assert.deepEqual(
    lessonPlannerStorageKeysForRecord(unsafeRecord, validateLesson),
    [LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY],
  );

  const storage = readyStorage();
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(unsafeRecord.value));
  const backup = rawLessonPlannerBackup(storage as unknown as Storage);
  assert.equal(backup.index_valid, false);
  assert.equal(
    backup.records.some((record) => record.key.includes(unsafePlan.id)),
    false,
  );
  assert.throws(() => applyLessonPlannerRemoteRecord(
    storage as unknown as Storage,
    unsafeRecord,
    false,
    validateLesson,
  ));

  const unsafeActiveRecord = {
    ...unsafeRecord,
    value: { version: 2 as const, activePlanId: "unsupported active id", plans: [] },
  };
  assert.equal(validateLessonPlannerSyncRecord(unsafeActiveRecord, validateLesson), false);
  assert.deepEqual(
    lessonPlannerStorageKeysForRecord(unsafeActiveRecord, validateLesson),
    [LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY],
  );
  storage.setItem(
    LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
    JSON.stringify(unsafeActiveRecord.value),
  );
  assert.equal(rawLessonPlannerBackup(storage as unknown as Storage).index_valid, false);

  const emptyIndexRecord = {
    ...unsafeRecord,
    value: { version: 2 as const, activePlanId: "", plans: [] },
  };
  assert.equal(validateLessonPlannerSyncRecord(emptyIndexRecord, validateLesson), true);
});

test("the central migration marker is explicit and does not alter planner records", () => {
  const storage = readyStorage();
  assert.equal(hasCompletedLessonPlannerAppSync(storage as unknown as Storage), false);
  const lessonBefore = storage.getItem(lessonPlanStorageKey(plan.id));
  markLessonPlannerAppSyncComplete(storage as unknown as Storage);
  assert.equal(
    storage.getItem(LESSON_PLANNER_APP_SYNC_MIGRATED_KEY),
    "1",
  );
  assert.equal(hasCompletedLessonPlannerAppSync(storage as unknown as Storage), true);
  assert.equal(storage.getItem(lessonPlanStorageKey(plan.id)), lessonBefore);
});

test("migration allows reviewed remote records but never silent conflicts or writes", () => {
  const preview = {
    localCount: 1,
    remoteCount: 1,
    conflictCount: 1,
    orphanedCount: 0,
    writesPerformed: 0,
    review: [{
      recordKey: "lesson-planner-program\u001flesson-planner-program\u001fclasses\u001fdefault",
      collection: "classes",
      recordId: "default",
      status: "content-conflict",
      localPresent: true,
    }],
  };
  assert.equal(lessonPlannerMigrationGate(preview, {}).safe, false);
  assert.equal(
    lessonPlannerMigrationGate(preview, {
      [preview.review[0].recordKey]: "accept-remote",
    }).safe,
    true,
  );
  assert.equal(
    lessonPlannerMigrationGate({ ...preview, writesPerformed: 1 }, {
      [preview.review[0].recordKey]: "keep-local",
    }).safe,
    false,
  );
});
