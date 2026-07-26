export const LEVEL_3_DEFAULT_CLASS_ID = "class-boys-level-3";
export const SAMPLE_LEVEL_3_DEFAULT_CLASS_ID = "sample-level-3";

export const LEVEL_3_STANDARD_GOALS = [
  {
    id: "goal-level-3-behavior",
    text: "Behavior is controlled for the duration of class",
  },
  {
    id: "goal-level-3-concentration",
    text: "Everyone maintains concentration throughout the lesson",
  },
] as const;

export type GeneralClassGoal = {
  id: string;
  text: string;
};

export type LessonGoalPreferences = {
  version: 1;
  generalGoals: GeneralClassGoal[];
  defaultGoalIdsByClassId: Record<string, string[]>;
};

const MAX_GENERAL_GOALS = 60;
const MAX_GOAL_TEXT_LENGTH = 200;
const GOAL_ID_PATTERN = /^[a-z0-9][a-z0-9-]{2,79}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function isGeneralClassGoal(value: unknown): value is GeneralClassGoal {
  return isRecord(value)
    && hasOnlyKeys(value, ["id", "text"])
    && typeof value.id === "string"
    && GOAL_ID_PATTERN.test(value.id)
    && typeof value.text === "string"
    && Boolean(value.text.trim())
    && value.text.length <= MAX_GOAL_TEXT_LENGTH;
}

function copyPreferences(preferences: LessonGoalPreferences): LessonGoalPreferences {
  return {
    version: 1,
    generalGoals: preferences.generalGoals.map((goal) => ({ ...goal })),
    defaultGoalIdsByClassId: Object.fromEntries(
      Object.entries(preferences.defaultGoalIdsByClassId).map(([classId, ids]) => [classId, [...ids]]),
    ),
  };
}

export function emptyLessonGoalPreferences(): LessonGoalPreferences {
  return {
    version: 1,
    generalGoals: LEVEL_3_STANDARD_GOALS.map((goal) => ({ ...goal })),
    defaultGoalIdsByClassId: {
      [LEVEL_3_DEFAULT_CLASS_ID]: LEVEL_3_STANDARD_GOALS.map((goal) => goal.id),
      [SAMPLE_LEVEL_3_DEFAULT_CLASS_ID]: LEVEL_3_STANDARD_GOALS.map((goal) => goal.id),
    },
  };
}

export function isLessonGoalPreferences(value: unknown): value is LessonGoalPreferences {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "generalGoals", "defaultGoalIdsByClassId"])
    || value.version !== 1
    || !Array.isArray(value.generalGoals)
    || value.generalGoals.length > MAX_GENERAL_GOALS
    || !value.generalGoals.every(isGeneralClassGoal)
    || !isRecord(value.defaultGoalIdsByClassId)) {
    return false;
  }

  const goalIds = value.generalGoals.map((goal) => goal.id);
  if (new Set(goalIds).size !== goalIds.length) return false;
  const knownGoalIds = new Set(goalIds);

  return Object.entries(value.defaultGoalIdsByClassId).every(([classId, ids]) => (
    classId.trim() === classId
    && classId.length > 0
    && classId.length <= 100
    && Array.isArray(ids)
    && ids.every((id) => typeof id === "string" && knownGoalIds.has(id))
    && new Set(ids).size === ids.length
  ));
}

export function classDefaultGoalIds(
  preferences: LessonGoalPreferences,
  classId: string | null,
): string[] {
  const defaultKey = classId ?? SAMPLE_LEVEL_3_DEFAULT_CLASS_ID;
  return [...(preferences.defaultGoalIdsByClassId[defaultKey] ?? [])];
}

export function bulletedGoalText(goalTexts: readonly string[]): string {
  return [...new Set(goalTexts.map((text) => text.trim()).filter(Boolean))]
    .map((text) => `• ${text}`)
    .join("\n");
}

export function selectedGoalText(
  preferences: LessonGoalPreferences,
  selectedGoalIds: readonly string[],
): string {
  const selectedIds = new Set(selectedGoalIds);
  return bulletedGoalText(
    preferences.generalGoals
      .filter((goal) => selectedIds.has(goal.id))
      .map((goal) => goal.text),
  );
}

export function classDefaultGoalText(
  preferences: LessonGoalPreferences,
  classId: string | null,
): string {
  return selectedGoalText(preferences, classDefaultGoalIds(preferences, classId));
}

/** Explicit selection appends missing bullets and never erases existing lesson text. */
export function appendSelectedGoals(
  currentGoals: string,
  preferences: LessonGoalPreferences,
  selectedGoalIds: readonly string[],
): string {
  const selected = selectedGoalText(preferences, selectedGoalIds);
  if (!selected) return currentGoals;
  const current = currentGoals.trim();
  if (!current) return selected;

  const existingLines = new Set(current.split(/\r?\n/).map((line) => line.trim()));
  const missingLines = selected.split("\n").filter((line) => !existingLines.has(line));
  return missingLines.length ? `${current}\n${missingLines.join("\n")}` : currentGoals;
}

export function addGeneralClassGoal(
  preferences: LessonGoalPreferences,
  goal: GeneralClassGoal,
): LessonGoalPreferences {
  const text = goal.text.trim();
  if (!GOAL_ID_PATTERN.test(goal.id)
    || !text
    || text.length > MAX_GOAL_TEXT_LENGTH
    || preferences.generalGoals.length >= MAX_GENERAL_GOALS
    || preferences.generalGoals.some((existing) => existing.id === goal.id)) {
    return preferences;
  }
  const next = copyPreferences(preferences);
  next.generalGoals.push({ id: goal.id, text });
  return next;
}

export function updateGeneralClassGoal(
  preferences: LessonGoalPreferences,
  goalId: string,
  text: string,
): LessonGoalPreferences {
  if (!text.trim()
    || text.length > MAX_GOAL_TEXT_LENGTH
    || !preferences.generalGoals.some((goal) => goal.id === goalId)) {
    return preferences;
  }
  const next = copyPreferences(preferences);
  next.generalGoals = next.generalGoals.map((goal) => goal.id === goalId ? { ...goal, text } : goal);
  return next;
}

export function removeGeneralClassGoal(
  preferences: LessonGoalPreferences,
  goalId: string,
): LessonGoalPreferences {
  if (!preferences.generalGoals.some((goal) => goal.id === goalId)) return preferences;
  const next = copyPreferences(preferences);
  next.generalGoals = next.generalGoals.filter((goal) => goal.id !== goalId);
  next.defaultGoalIdsByClassId = Object.fromEntries(
    Object.entries(next.defaultGoalIdsByClassId)
      .map(([classId, ids]) => [classId, ids.filter((id) => id !== goalId)])
      .filter(([, ids]) => ids.length > 0),
  );
  return next;
}

export function setClassDefaultGoalIds(
  preferences: LessonGoalPreferences,
  classId: string | null,
  selectedGoalIds: readonly string[],
): LessonGoalPreferences {
  const normalizedClassId = classId?.trim() || SAMPLE_LEVEL_3_DEFAULT_CLASS_ID;
  if (!normalizedClassId || normalizedClassId.length > 100) return preferences;
  const knownGoalIds = new Set(
    preferences.generalGoals.filter((goal) => goal.text.trim()).map((goal) => goal.id),
  );
  const ids = [...new Set(selectedGoalIds.filter((id) => knownGoalIds.has(id)))];
  const next = copyPreferences(preferences);
  if (ids.length) next.defaultGoalIdsByClassId[normalizedClassId] = ids;
  else delete next.defaultGoalIdsByClassId[normalizedClassId];
  return next;
}
