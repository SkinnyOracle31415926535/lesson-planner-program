import {
  isLessonGoalPreferences,
  type LessonGoalPreferences,
} from "./lesson-goals";
import {
  parsePlannerIntake,
  type PlannerIntake,
} from "./planner-intake";

export type PlannerOperationsAttendanceStatus = "unmarked" | "present" | "late" | "absent";
export type PlannerOperationsUpdateDecision = "IMPORTANT" | "LATER" | "REJECTED";

export type PlannerOperationsV4 = {
  version: 4;
  taskDoneByPlanId: Record<string, Record<string, boolean>>;
  attendanceByPlanId: Record<string, Record<string, PlannerOperationsAttendanceStatus>>;
  updateDecisionByRevision: Record<string, PlannerOperationsUpdateDecision>;
  goalPreferences: LessonGoalPreferences;
  plannerIntake: PlannerIntake;
};

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/;
const MAX_PLAN_RECORDS = 1_000;
const MAX_ENTRIES_PER_PLAN = 1_000;
const MAX_UPDATE_DECISIONS = 2_000;
const OPERATIONS_KEYS = [
  "version",
  "taskDoneByPlanId",
  "attendanceByPlanId",
  "updateDecisionByRevision",
  "goalPreferences",
  "plannerIntake",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}

function isIdentifier(value: string): boolean {
  return ID_PATTERN.test(value);
}

function parseNestedRecord<T>(
  value: unknown,
  entryValidator: (entry: unknown) => entry is T,
): Record<string, Record<string, T>> | null {
  if (!isRecord(value) || Object.keys(value).length > MAX_PLAN_RECORDS) return null;
  const parsed: Record<string, Record<string, T>> = {};
  for (const [recordId, entries] of Object.entries(value)) {
    if (!isIdentifier(recordId)
      || !isRecord(entries)
      || Object.keys(entries).length > MAX_ENTRIES_PER_PLAN) return null;
    const parsedEntries: Record<string, T> = {};
    for (const [entryId, entry] of Object.entries(entries)) {
      if (!isIdentifier(entryId) || !entryValidator(entry)) return null;
      parsedEntries[entryId] = entry;
    }
    parsed[recordId] = parsedEntries;
  }
  return parsed;
}

function parseUpdateDecisions(value: unknown): Record<string, PlannerOperationsUpdateDecision> | null {
  if (!isRecord(value) || Object.keys(value).length > MAX_UPDATE_DECISIONS) return null;
  const parsed: Record<string, PlannerOperationsUpdateDecision> = {};
  for (const [id, decision] of Object.entries(value)) {
    if (!isIdentifier(id)
      || (decision !== "IMPORTANT" && decision !== "LATER" && decision !== "REJECTED")) return null;
    parsed[id] = decision;
  }
  return parsed;
}

function detachedGoalPreferences(preferences: LessonGoalPreferences): LessonGoalPreferences {
  return {
    version: 1,
    generalGoals: preferences.generalGoals.map((goal) => ({ ...goal })),
    defaultGoalIdsByClassId: Object.fromEntries(
      Object.entries(preferences.defaultGoalIdsByClassId).map(([classId, ids]) => [classId, [...ids]]),
    ),
  };
}

/** Strictly validates and detaches the public/browser-cached v4 operations document. */
export function parsePlannerOperationsV4(value: unknown): PlannerOperationsV4 | null {
  if (!isRecord(value) || !hasExactKeys(value, OPERATIONS_KEYS) || value.version !== 4) return null;
  const taskDoneByPlanId = parseNestedRecord(
    value.taskDoneByPlanId,
    (entry): entry is boolean => typeof entry === "boolean",
  );
  const attendanceByPlanId = parseNestedRecord(
    value.attendanceByPlanId,
    (entry): entry is PlannerOperationsAttendanceStatus => (
      entry === "unmarked" || entry === "present" || entry === "late" || entry === "absent"
    ),
  );
  const updateDecisionByRevision = parseUpdateDecisions(value.updateDecisionByRevision);
  const plannerIntake = parsePlannerIntake(value.plannerIntake);
  if (!taskDoneByPlanId
    || !attendanceByPlanId
    || !updateDecisionByRevision
    || !isLessonGoalPreferences(value.goalPreferences)
    || !plannerIntake) return null;
  return {
    version: 4,
    taskDoneByPlanId,
    attendanceByPlanId,
    updateDecisionByRevision,
    goalPreferences: detachedGoalPreferences(value.goalPreferences),
    plannerIntake,
  };
}
