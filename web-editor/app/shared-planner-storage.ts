import { emptyLocalClassStorage } from "./local-classes";
import { emptySafeScheduleStorage } from "./local-schedule";
import { emptyLessonGoalPreferences } from "./lesson-goals";

export const LOCAL_LESSON_STORAGE_KEY = "gym-lesson-planner-local-l3-2026-07-20-v1";
export const LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY = "gym-lesson-planner-local-plan-index-v1";
export const LOCAL_OPERATIONS_STORAGE_KEY = "gym-lesson-planner-local-operations-demo-v1";
export const LOCAL_CLASS_STORAGE_KEY = "gym-lesson-planner-local-classes-v1";
export const LOCAL_SAFE_SCHEDULE_STORAGE_KEY = "gym-lesson-planner-local-full-schedule-v1";

export const emptyPlannerOperationsStorage = () => ({
  version: 3 as const,
  taskDoneByPlanId: {},
  attendanceByPlanId: {},
  updateDecisionByRevision: {},
  goalPreferences: emptyLessonGoalPreferences(),
});

export function lessonPlanStorageKey(planId: string): string {
  return `gym-lesson-planner-local-plan-${planId}-v1`;
}

type PlannerStoragePlan = {
  id: string;
  storage: "legacy" | "scoped";
};

export type SharedPlannerStorageSnapshot = {
  classes: unknown;
  rotationSchedule: unknown;
  lessonIndex: unknown;
  operations: unknown;
  lessonsByPlanId: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStoredJson(storage: Storage, key: string): unknown | null {
  const raw = storage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function planDescriptors(value: unknown): PlannerStoragePlan[] {
  if (!isRecord(value) || !Array.isArray(value.plans)) return [];
  return value.plans.flatMap((candidate) => {
    if (!isRecord(candidate)
      || typeof candidate.id !== "string"
      || (candidate.storage !== "legacy" && candidate.storage !== "scoped")) {
      return [];
    }
    return [{ id: candidate.id, storage: candidate.storage }];
  });
}

export function lessonStorageKeyForSharedPlan(plan: PlannerStoragePlan): string {
  return plan.storage === "legacy" ? LOCAL_LESSON_STORAGE_KEY : lessonPlanStorageKey(plan.id);
}

/** Reads the durable planner records without including device-only library preferences or media. */
export function readSharedPlannerStorageSnapshot(storage: Storage): SharedPlannerStorageSnapshot {
  const lessonIndex = parseStoredJson(storage, LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY);
  const lessonsByPlanId: Record<string, unknown> = {};
  planDescriptors(lessonIndex).forEach((plan) => {
    const stored = parseStoredJson(storage, lessonStorageKeyForSharedPlan(plan));
    if (stored !== null) lessonsByPlanId[plan.id] = stored;
  });
  return {
    classes: parseStoredJson(storage, LOCAL_CLASS_STORAGE_KEY) ?? emptyLocalClassStorage(),
    rotationSchedule: parseStoredJson(storage, LOCAL_SAFE_SCHEDULE_STORAGE_KEY) ?? emptySafeScheduleStorage(),
    lessonIndex,
    operations: parseStoredJson(storage, LOCAL_OPERATIONS_STORAGE_KEY) ?? emptyPlannerOperationsStorage(),
    lessonsByPlanId,
  };
}

/** Keeps the local browser copy coherent after a validated shared workspace is loaded. */
export function replaceSharedPlannerStorage(
  storage: Storage,
  snapshot: SharedPlannerStorageSnapshot,
): void {
  const currentIndex = parseStoredJson(storage, LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY);
  const currentPlans = planDescriptors(currentIndex);
  const nextPlans = planDescriptors(snapshot.lessonIndex);
  const nextPlansById = new Map(nextPlans.map((plan) => [plan.id, plan]));

  storage.setItem(LOCAL_CLASS_STORAGE_KEY, JSON.stringify(snapshot.classes));
  storage.setItem(LOCAL_SAFE_SCHEDULE_STORAGE_KEY, JSON.stringify(snapshot.rotationSchedule));
  storage.setItem(LOCAL_OPERATIONS_STORAGE_KEY, JSON.stringify(snapshot.operations));
  // Write every payload first, then publish the index that references them.
  // A browser interruption can leave extra old plans, but never an index that
  // points at a missing new lesson record.
  nextPlans.forEach((plan) => {
    const lesson = snapshot.lessonsByPlanId[plan.id];
    if (lesson !== undefined) storage.setItem(lessonStorageKeyForSharedPlan(plan), JSON.stringify(lesson));
  });
  storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(snapshot.lessonIndex));
  currentPlans.forEach((plan) => {
    const nextPlan = nextPlansById.get(plan.id);
    if (!nextPlan || lessonStorageKeyForSharedPlan(nextPlan) !== lessonStorageKeyForSharedPlan(plan)) {
      storage.removeItem(lessonStorageKeyForSharedPlan(plan));
    }
  });
}

export function plannerDocumentFingerprint(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
