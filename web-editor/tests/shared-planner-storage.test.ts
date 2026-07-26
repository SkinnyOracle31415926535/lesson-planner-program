import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_CLASS_STORAGE_KEY,
  LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
  LOCAL_OPERATIONS_STORAGE_KEY,
  LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
  lessonPlanStorageKey,
  readSharedPlannerStorageSnapshot,
  replaceSharedPlannerStorage,
} from "../app/shared-planner-storage";

class MemoryStorage {
  private readonly values = new Map<string, string>();
  readonly operations: string[] = [];

  get length() { return this.values.size; }
  clear() { this.values.clear(); this.operations.push("clear"); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); this.operations.push(`remove:${key}`); }
  setItem(key: string, value: string) { this.values.set(key, value); this.operations.push(`set:${key}`); }
  resetOperations() { this.operations.length = 0; }
}

const oldPlan = { id: "lesson-old-1234567890", storage: "scoped" as const };
const nextPlan = { id: "lesson-next-1234567890", storage: "scoped" as const };

test("shared planner storage captures only the requested durable planner records", () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify({ version: 2, plans: [oldPlan] }));
  storage.setItem(lessonPlanStorageKey(oldPlan.id), JSON.stringify({ version: 8, phases: [] }));
  storage.setItem("unrelated-local-preference", "keep this device only");

  const snapshot = readSharedPlannerStorageSnapshot(storage as unknown as Storage);
  assert.deepEqual(snapshot.lessonsByPlanId, { [oldPlan.id]: { version: 8, phases: [] } });
  assert.ok(snapshot.classes);
  assert.ok(snapshot.rotationSchedule);
  assert.ok(snapshot.operations);
});

test("loading a shared workspace replaces planner records without touching device-only preferences", () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify({ version: 2, plans: [oldPlan] }));
  storage.setItem(lessonPlanStorageKey(oldPlan.id), JSON.stringify({ version: 8, old: true }));
  storage.setItem("unrelated-local-preference", "keep this device only");
  storage.resetOperations();

  replaceSharedPlannerStorage(storage as unknown as Storage, {
    classes: { version: 1, activeClassId: null, classes: [] },
    rotationSchedule: {
      version: 2,
      bundle: null,
      scheduleGroupByClassId: {},
      manualWeekByDate: {},
      weekAnchors: [{ weekStartDate: "2026-07-27", week: "Even" }],
    },
    lessonIndex: { version: 2, plans: [nextPlan] },
    operations: {
      version: 4,
      taskDoneByPlanId: {},
      attendanceByPlanId: {},
      updateDecisionByRevision: {},
      goalPreferences: {
        version: 1,
        generalGoals: [],
        defaultGoalIdsByClassId: {},
      },
      plannerIntake: {
        version: 1,
        lessonDrafts: [],
        announcementSuggestions: [],
        backlogCaptures: [],
        decisionById: {},
      },
    },
    lessonsByPlanId: { [nextPlan.id]: { version: 8, next: true } },
  });

  assert.equal(storage.getItem(lessonPlanStorageKey(oldPlan.id)), null);
  assert.deepEqual(JSON.parse(storage.getItem(lessonPlanStorageKey(nextPlan.id))!), { version: 8, next: true });
  assert.equal(storage.getItem("unrelated-local-preference"), "keep this device only");
  assert.ok(storage.getItem(LOCAL_CLASS_STORAGE_KEY));
  assert.ok(storage.getItem(LOCAL_SAFE_SCHEDULE_STORAGE_KEY));
  assert.ok(storage.getItem(LOCAL_OPERATIONS_STORAGE_KEY));
  assert.ok(storage.operations.indexOf(`set:${lessonPlanStorageKey(nextPlan.id)}`) < storage.operations.indexOf(`set:${LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY}`));
  assert.ok(storage.operations.indexOf(`set:${LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY}`) < storage.operations.indexOf(`remove:${lessonPlanStorageKey(oldPlan.id)}`));
});
