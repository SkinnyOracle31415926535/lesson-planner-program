import { isLocalClassStorage } from "./local-classes";
import { normalizeLessonPlanIndex, type LessonPlanIndex } from "./lesson-plan-index";
import { normalizeSafeScheduleStorage } from "./local-schedule";
import { parsePlannerOperationsV4 } from "./planner-operations";
import {
  LOCAL_CLASS_STORAGE_KEY,
  LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
  LOCAL_LESSON_STORAGE_KEY,
  LOCAL_OPERATIONS_STORAGE_KEY,
  LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
  lessonPlanStorageKey,
} from "./shared-planner-storage";

export const LESSON_PLANNER_APP_SYNC_MIGRATED_KEY =
  "gym-lesson-planner-ryan-app-sync-migrated-v1";

export const LESSON_PLANNER_SYNC_COLLECTIONS = [
  "classes",
  "rotation_schedule",
  "operations",
  "lesson_records",
  "lesson_z_index",
] as const;

export type LessonPlannerSyncCollection =
  typeof LESSON_PLANNER_SYNC_COLLECTIONS[number];

export type LessonPlannerSyncRecord = {
  collection: LessonPlannerSyncCollection;
  recordId: string;
  value: unknown;
};

export type LessonPlannerLessonValidator = (value: unknown) => boolean;

type StoredPlan = LessonPlanIndex["plans"][number];

const FIXED_STORAGE_KEYS = [
  LOCAL_CLASS_STORAGE_KEY,
  LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
  LOCAL_OPERATIONS_STORAGE_KEY,
  LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
  LOCAL_LESSON_STORAGE_KEY,
] as const;

const SAFE_RECORD_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}

function parseStoredJson(storage: Storage, key: string, label: string): unknown {
  const raw = storage.getItem(key);
  if (raw === null) throw new Error(`${label} is not available in this browser yet.`);
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`${label} is malformed. Download the exact backup before changing it.`);
  }
}

function lessonStorageKey(plan: Pick<StoredPlan, "id" | "storage">): string {
  return plan.storage === "legacy"
    ? LOCAL_LESSON_STORAGE_KEY
    : lessonPlanStorageKey(plan.id);
}

function normalizedIndex(storage: Storage): LessonPlanIndex {
  const raw = parseStoredJson(
    storage,
    LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
    "The local lesson-plan index",
  );
  const normalized = normalizeLessonPlanIndex(raw);
  if (!normalized) {
    throw new Error(
      "The local lesson-plan index is unsupported. Download the exact backup before review.",
    );
  }
  return normalized.index;
}

function lessonWrapper(
  plan: Pick<StoredPlan, "id" | "storage">,
  lesson: unknown,
): Record<string, unknown> {
  return {
    version: 1,
    planId: plan.id,
    storage: plan.storage,
    lesson,
  };
}

function parseLessonWrapper(
  value: unknown,
  recordId: string,
  validateLesson: LessonPlannerLessonValidator,
): { planId: string; storage: "legacy" | "scoped"; lesson: unknown } | null {
  if (!isRecord(value)
    || !hasExactKeys(value, ["version", "planId", "storage", "lesson"])
    || value.version !== 1
    || typeof value.planId !== "string"
    || value.planId !== recordId
    || !SAFE_RECORD_ID.test(value.planId)
    || (value.storage !== "legacy" && value.storage !== "scoped")
    || !validateLesson(value.lesson)) {
    return null;
  }
  return {
    planId: value.planId,
    storage: value.storage,
    lesson: value.lesson,
  };
}

export function hasCompletedLessonPlannerAppSync(storage: Storage): boolean {
  return storage.getItem(LESSON_PLANNER_APP_SYNC_MIGRATED_KEY) === "1";
}

export function markLessonPlannerAppSyncComplete(storage: Storage): void {
  storage.setItem(LESSON_PLANNER_APP_SYNC_MIGRATED_KEY, "1");
}

export function readLessonPlannerSyncRecords(
  storage: Storage,
  validateLesson: LessonPlannerLessonValidator,
): LessonPlannerSyncRecord[] {
  const classes = parseStoredJson(storage, LOCAL_CLASS_STORAGE_KEY, "Local classes");
  if (!isLocalClassStorage(classes)) {
    throw new Error("Local classes are unsupported. Download the exact backup before review.");
  }

  const scheduleRaw = parseStoredJson(
    storage,
    LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
    "The local rotation schedule",
  );
  const schedule = normalizeSafeScheduleStorage(scheduleRaw);
  if (!schedule) {
    throw new Error(
      "The local rotation schedule is unsupported. Download the exact backup before review.",
    );
  }

  const operationsRaw = parseStoredJson(
    storage,
    LOCAL_OPERATIONS_STORAGE_KEY,
    "Local lesson operations",
  );
  const operations = parsePlannerOperationsV4(operationsRaw);
  if (!operations) {
    throw new Error(
      "Local lesson operations are unsupported. Download the exact backup before review.",
    );
  }

  const index = normalizedIndex(storage);
  const lessons = index.plans.map((plan) => {
    if (!SAFE_RECORD_ID.test(plan.id)) {
      throw new Error(
        `Lesson plan “${plan.title}” has an unsupported local ID. Its data was not uploaded.`,
      );
    }
    const lesson = parseStoredJson(
      storage,
      lessonStorageKey(plan),
      `Lesson plan “${plan.title}”`,
    );
    if (!validateLesson(lesson)) {
      throw new Error(
        `Lesson plan “${plan.title}” is unsupported. Download the exact backup before review.`,
      );
    }
    return {
      collection: "lesson_records" as const,
      recordId: plan.id,
      value: lessonWrapper(plan, lesson),
    };
  });

  return [
    { collection: "classes", recordId: "default", value: classes },
    { collection: "rotation_schedule", recordId: "default", value: schedule },
    { collection: "operations", recordId: "default", value: operations },
    ...lessons,
    { collection: "lesson_z_index", recordId: "default", value: index },
  ];
}

export function validateLessonPlannerSyncRecord(
  record: LessonPlannerSyncRecord,
  validateLesson: LessonPlannerLessonValidator,
): boolean {
  if (!LESSON_PLANNER_SYNC_COLLECTIONS.includes(record.collection)
    || !SAFE_RECORD_ID.test(record.recordId)) return false;

  if (record.collection === "classes") {
    return record.recordId === "default" && isLocalClassStorage(record.value);
  }
  if (record.collection === "rotation_schedule") {
    return record.recordId === "default"
      && normalizeSafeScheduleStorage(record.value) !== null;
  }
  if (record.collection === "operations") {
    return record.recordId === "default"
      && parsePlannerOperationsV4(record.value) !== null;
  }
  if (record.collection === "lesson_z_index") {
    const index = normalizeLessonPlanIndex(record.value)?.index;
    return record.recordId === "default"
      && index !== undefined
      && index.plans.every((plan) => SAFE_RECORD_ID.test(plan.id));
  }
  return parseLessonWrapper(record.value, record.recordId, validateLesson) !== null;
}

export function lessonPlannerSyncRecordKey(
  record: Pick<LessonPlannerSyncRecord, "collection" | "recordId">,
): string {
  return `${record.collection}\u001f${record.recordId}`;
}

export function rawLessonPlannerBackup(
  storage: Storage,
): {
  version: 1;
  kind: "lesson_planner_browser_local_raw_backup";
  app_id: "lesson-planner-program";
  exported_at: string;
  index_valid: boolean;
  records: Array<{ key: string; present: boolean; raw_value: string | null }>;
} {
  const keys = new Set<string>(FIXED_STORAGE_KEYS);
  let indexValid = false;
  try {
    const index = normalizedIndex(storage);
    if (index.plans.some((plan) => !SAFE_RECORD_ID.test(plan.id))) {
      throw new Error("The lesson-plan index contains an unsupported local ID.");
    }
    indexValid = true;
    index.plans.forEach((plan) => keys.add(lessonStorageKey(plan)));
  } catch {
    // The exact fixed index bytes remain in the backup. Dynamic keys are added
    // only when that index can safely identify their bounded names.
  }
  return {
    version: 1,
    kind: "lesson_planner_browser_local_raw_backup",
    app_id: "lesson-planner-program",
    exported_at: new Date().toISOString(),
    index_valid: indexValid,
    records: Array.from(keys, (key) => {
      const rawValue = storage.getItem(key);
      return {
        key,
        present: rawValue !== null,
        raw_value: rawValue,
      };
    }),
  };
}

export function lessonPlannerStorageKeysForRecord(
  record: LessonPlannerSyncRecord,
  validateLesson: LessonPlannerLessonValidator,
): string[] {
  if (record.collection === "classes") return [LOCAL_CLASS_STORAGE_KEY];
  if (record.collection === "rotation_schedule") return [LOCAL_SAFE_SCHEDULE_STORAGE_KEY];
  if (record.collection === "operations") return [LOCAL_OPERATIONS_STORAGE_KEY];
  if (record.collection === "lesson_z_index") {
    const index = normalizeLessonPlanIndex(record.value)?.index;
    if (!index || index.plans.some((plan) => !SAFE_RECORD_ID.test(plan.id))) {
      return [LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY];
    }
    return [
      LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
      ...index.plans.map(lessonStorageKey),
    ];
  }
  const wrapper = parseLessonWrapper(record.value, record.recordId, validateLesson);
  return wrapper
    ? [lessonStorageKey({ id: wrapper.planId, storage: wrapper.storage })]
    : [];
}

export function applyLessonPlannerRemoteRecord(
  storage: Storage,
  record: LessonPlannerSyncRecord,
  deleted: boolean,
  validateLesson: LessonPlannerLessonValidator,
): void {
  if (!validateLessonPlannerSyncRecord(record, validateLesson) && !deleted) {
    throw new Error("The synchronized planner record is invalid.");
  }

  if (record.collection !== "lesson_records" && deleted) {
    throw new Error("A required planner record cannot be deleted.");
  }

  if (record.collection === "lesson_records") {
    if (deleted) return;
    const wrapper = parseLessonWrapper(record.value, record.recordId, validateLesson);
    if (!wrapper) throw new Error("The synchronized lesson record is invalid.");
    const key = lessonStorageKey({ id: wrapper.planId, storage: wrapper.storage });
    storage.setItem(key, JSON.stringify(wrapper.lesson));
    if (storage.getItem(key) !== JSON.stringify(wrapper.lesson)) {
      throw new Error("The synchronized lesson could not be verified locally.");
    }
    return;
  }

  let key: string;
  if (record.collection === "classes") key = LOCAL_CLASS_STORAGE_KEY;
  else if (record.collection === "rotation_schedule") key = LOCAL_SAFE_SCHEDULE_STORAGE_KEY;
  else if (record.collection === "operations") key = LOCAL_OPERATIONS_STORAGE_KEY;
  else key = LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY;

  if (record.collection === "lesson_z_index") {
    const index = normalizeLessonPlanIndex(record.value)?.index;
    if (!index) throw new Error("The synchronized lesson index is invalid.");
    for (const plan of index.plans) {
      const raw = storage.getItem(lessonStorageKey(plan));
      if (raw === null) {
        throw new Error("A synchronized lesson is missing. The local index was preserved.");
      }
      let lesson: unknown;
      try {
        lesson = JSON.parse(raw) as unknown;
      } catch {
        throw new Error("A synchronized lesson is malformed. The local index was preserved.");
      }
      if (!validateLesson(lesson)) {
        throw new Error("A synchronized lesson is invalid. The local index was preserved.");
      }
    }
  }

  const serialized = JSON.stringify(record.value);
  storage.setItem(key, serialized);
  if (storage.getItem(key) !== serialized) {
    throw new Error("The synchronized planner record could not be verified locally.");
  }
}
