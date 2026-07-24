/**
 * Browser-local reminder templates and per-lesson completion records.
 *
 * This module has no UI, network, schedule, or storage dependency. A caller
 * supplies the active lesson context, then persists the returned JSON in its
 * own localStorage key.
 */

export const LOCAL_REMINDER_STORAGE_VERSION = 1;

const MAX_ID_LENGTH = 120;
const MAX_TITLE_LENGTH = 240;
const MAX_DETAIL_LENGTH = 2_000;
const SAFE_LOCAL_ID = /^[a-z0-9][a-z0-9_-]*$/i;

export type LocalReminderCadence = "recurring" | "temporary";

export type LocalReminderScope =
  | { kind: "all_classes" }
  | { kind: "classes"; classIds: string[] }
  | { kind: "lesson"; lessonId: string }
  | { kind: "phase"; phaseId: string };

export type LocalReminderTemplate = {
  id: string;
  title: string;
  detail?: string;
  cadence: LocalReminderCadence;
  scope: LocalReminderScope;
  startDate: string;
  /**
   * Recurring reminders may have no end date. Temporary reminders always get
   * a finite initial window; a missing end date is normalized to startDate.
   */
  endDate: string | null;
  /**
   * Only temporary reminders can roll past their initial end date. They stop
   * appearing after a matching lesson records completion.
   */
  rollForwardUntilCompleted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalReminderOccurrence = {
  id: string;
  templateId: string;
  planId: string;
  lessonDate: string;
  state: "open" | "completed";
  completedAt: string | null;
};

export type LocalReminderStorage = {
  version: typeof LOCAL_REMINDER_STORAGE_VERSION;
  templates: LocalReminderTemplate[];
  occurrences: LocalReminderOccurrence[];
};

export type LocalReminderDraft = {
  title: string;
  detail?: string;
  cadence: LocalReminderCadence;
  scope: LocalReminderScope;
  startDate: string;
  endDate: string | null;
  rollForwardUntilCompleted: boolean;
  active: boolean;
};

export type LocalReminderLesson = {
  /** Stable per-lesson-plan ID, including its class when plans share a date. */
  planId: string;
  /**
   * Optional stable lesson ID for an explicitly lesson-scoped reminder.
   * planId is used when the application has one stable ID for both concepts.
   */
  lessonId?: string;
  classId?: string | null;
  date: string;
  phaseIds: string[];
};

export type ResolvedLocalReminder = {
  template: LocalReminderTemplate;
  occurrence: LocalReminderOccurrence;
  /** True only when a temporary reminder is beyond its original date range. */
  isRollForward: boolean;
};

export type LocalReminderCreateOptions = {
  now?: string | Date;
  idFactory?: () => string;
};

export type LocalReminderParseResult =
  | { ok: true; value: LocalReminderStorage }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function hasAllKeys(value: Record<string, unknown>, required: readonly string[]): boolean {
  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isCanonicalText(value: unknown, maximumLength: number): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= maximumLength
    && value === cleanText(value);
}

function normalizeRequiredText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = cleanText(value);
  return normalized && normalized.length <= maximumLength ? normalized : null;
}

function normalizeOptionalText(value: unknown, maximumLength: number): string | undefined | null {
  if (value === undefined || value === null) return undefined;
  return normalizeRequiredText(value, maximumLength);
}

export function isLocalReminderId(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= MAX_ID_LENGTH
    && SAFE_LOCAL_ID.test(value);
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function isLocalReminderDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12) return false;
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= monthLengths[month - 1];
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return isLocalReminderDate(normalized) ? normalized : null;
}

function isCanonicalTimestamp(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value;
}

function normalizedTimestamp(value: string | Date | undefined): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  return new Date().toISOString();
}

function cloneScope(scope: LocalReminderScope): LocalReminderScope {
  switch (scope.kind) {
    case "all_classes":
      return { kind: "all_classes" };
    case "classes":
      return { kind: "classes", classIds: [...scope.classIds] };
    case "lesson":
      return { kind: "lesson", lessonId: scope.lessonId };
    case "phase":
      return { kind: "phase", phaseId: scope.phaseId };
  }
}

function cloneTemplate(template: LocalReminderTemplate): LocalReminderTemplate {
  return {
    ...template,
    scope: cloneScope(template.scope),
  };
}

function cloneOccurrence(occurrence: LocalReminderOccurrence): LocalReminderOccurrence {
  return { ...occurrence };
}

function normalizeScope(value: unknown): LocalReminderScope | null {
  if (!isRecord(value) || typeof value.kind !== "string") return null;

  if (value.kind === "all_classes") {
    return hasOnlyKeys(value, ["kind"]) ? { kind: "all_classes" } : null;
  }

  if (value.kind === "classes") {
    if (!hasOnlyKeys(value, ["kind", "classIds"]) || !Array.isArray(value.classIds)) return null;
    const classIds = value.classIds.map((id) => typeof id === "string" ? id.trim() : "");
    if (!classIds.length || classIds.some((id) => !isLocalReminderId(id))) return null;
    return { kind: "classes", classIds: [...new Set(classIds)] };
  }

  if (value.kind === "lesson") {
    if (!hasOnlyKeys(value, ["kind", "lessonId"]) || typeof value.lessonId !== "string") return null;
    const lessonId = value.lessonId.trim();
    return isLocalReminderId(lessonId) ? { kind: "lesson", lessonId } : null;
  }

  if (value.kind === "phase") {
    if (!hasOnlyKeys(value, ["kind", "phaseId"]) || typeof value.phaseId !== "string") return null;
    const phaseId = value.phaseId.trim();
    return isLocalReminderId(phaseId) ? { kind: "phase", phaseId } : null;
  }

  return null;
}

export function isLocalReminderScope(value: unknown): value is LocalReminderScope {
  if (!isRecord(value) || typeof value.kind !== "string") return false;
  if (value.kind === "all_classes") {
    return hasOnlyKeys(value, ["kind"]);
  }
  if (value.kind === "classes") {
    return hasOnlyKeys(value, ["kind", "classIds"])
      && Array.isArray(value.classIds)
      && value.classIds.length > 0
      && value.classIds.every(isLocalReminderId)
      && new Set(value.classIds).size === value.classIds.length;
  }
  if (value.kind === "lesson") {
    return hasOnlyKeys(value, ["kind", "lessonId"]) && isLocalReminderId(value.lessonId);
  }
  if (value.kind === "phase") {
    return hasOnlyKeys(value, ["kind", "phaseId"]) && isLocalReminderId(value.phaseId);
  }
  return false;
}

/**
 * Safely normalizes a form-friendly draft. A temporary reminder without an
 * end date starts as a one-lesson window unless the coach enables roll-forward.
 */
export function normalizeLocalReminderDraft(value: unknown): LocalReminderDraft | null {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "title", "detail", "cadence", "scope", "startDate", "endDate", "rollForwardUntilCompleted", "active",
  ])) {
    return null;
  }

  const title = normalizeRequiredText(value.title, MAX_TITLE_LENGTH);
  const detail = normalizeOptionalText(value.detail, MAX_DETAIL_LENGTH);
  const scope = normalizeScope(value.scope);
  const startDate = normalizeDate(value.startDate);
  if (!title || detail === null || !scope || !startDate) return null;
  if (value.cadence !== "recurring" && value.cadence !== "temporary") return null;
  if (value.active !== undefined && typeof value.active !== "boolean") return null;
  if (value.rollForwardUntilCompleted !== undefined && typeof value.rollForwardUntilCompleted !== "boolean") return null;

  let endDate: string | null;
  if (value.endDate === undefined || value.endDate === null || value.endDate === "") {
    endDate = null;
  } else {
    endDate = normalizeDate(value.endDate);
    if (!endDate) return null;
  }
  if (endDate && endDate < startDate) return null;

  const cadence = value.cadence;
  if (cadence === "temporary") {
    endDate = endDate ?? startDate;
  }

  return {
    title,
    ...(detail ? { detail } : {}),
    cadence,
    scope,
    startDate,
    endDate,
    rollForwardUntilCompleted: cadence === "temporary"
      ? value.rollForwardUntilCompleted ?? false
      : false,
    active: value.active ?? true,
  };
}

export function isLocalReminderTemplate(value: unknown): value is LocalReminderTemplate {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "id", "title", "detail", "cadence", "scope", "startDate", "endDate", "rollForwardUntilCompleted", "active",
    "createdAt", "updatedAt",
  ]) || !hasAllKeys(value, [
    "id", "title", "cadence", "scope", "startDate", "endDate", "rollForwardUntilCompleted", "active",
    "createdAt", "updatedAt",
  ])) {
    return false;
  }
  if (!isLocalReminderId(value.id)
    || !isCanonicalText(value.title, MAX_TITLE_LENGTH)
    || (value.detail !== undefined && !isCanonicalText(value.detail, MAX_DETAIL_LENGTH))
    || (value.cadence !== "recurring" && value.cadence !== "temporary")
    || !isLocalReminderScope(value.scope)
    || !isLocalReminderDate(value.startDate)
    || (value.endDate !== null && !isLocalReminderDate(value.endDate))
    || (typeof value.endDate === "string" && value.endDate < value.startDate)
    || typeof value.rollForwardUntilCompleted !== "boolean"
    || typeof value.active !== "boolean"
    || !isCanonicalTimestamp(value.createdAt)
    || !isCanonicalTimestamp(value.updatedAt)
    || value.createdAt > value.updatedAt) {
    return false;
  }
  return (value.cadence === "recurring" && value.rollForwardUntilCompleted === false)
    || (value.cadence === "temporary" && typeof value.endDate === "string");
}

export function createLocalReminderTemplate(
  draft: unknown,
  options: LocalReminderCreateOptions = {},
): LocalReminderTemplate | null {
  const normalized = normalizeLocalReminderDraft(draft);
  if (!normalized) return null;
  const id = (options.idFactory?.() ?? createGeneratedId()).trim();
  if (!isLocalReminderId(id)) return null;
  const timestamp = normalizedTimestamp(options.now);
  return {
    id,
    ...normalized,
    scope: cloneScope(normalized.scope),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

let fallbackIdSequence = 0;

function createGeneratedId(): string {
  const random = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().replace(/-/g, "")
    : Date.now().toString(36) + (++fallbackIdSequence).toString(36) + Math.random().toString(36).slice(2, 10);
  return "reminder-" + random;
}

/**
 * A deterministic occurrence ID makes completion state stable per template
 * and plan without depending on display names or the browser clock.
 */
export function localReminderOccurrenceId(templateId: string, planId: string): string | null {
  if (!isLocalReminderId(templateId) || !isLocalReminderId(planId)) return null;
  return "reminder-occurrence-" + templateId.length + "-" + templateId + "-" + planId;
}

export function isLocalReminderOccurrence(value: unknown): value is LocalReminderOccurrence {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "id", "templateId", "planId", "lessonDate", "state", "completedAt",
  ]) || !hasAllKeys(value, [
    "id", "templateId", "planId", "lessonDate", "state", "completedAt",
  ])) {
    return false;
  }
  const expectedId = typeof value.templateId === "string" && typeof value.planId === "string"
    ? localReminderOccurrenceId(value.templateId, value.planId)
    : null;
  return expectedId !== null
    && value.id === expectedId
    && isLocalReminderId(value.templateId)
    && isLocalReminderId(value.planId)
    && isLocalReminderDate(value.lessonDate)
    && (value.state === "open" || value.state === "completed")
    && ((value.state === "open" && value.completedAt === null)
      || (value.state === "completed" && isCanonicalTimestamp(value.completedAt)));
}

export function isLocalReminderStorage(value: unknown): value is LocalReminderStorage {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "templates", "occurrences"])
    || !hasAllKeys(value, ["version", "templates", "occurrences"])
    || value.version !== LOCAL_REMINDER_STORAGE_VERSION
    || !Array.isArray(value.templates)
    || !Array.isArray(value.occurrences)
    || !value.templates.every(isLocalReminderTemplate)
    || !value.occurrences.every(isLocalReminderOccurrence)) {
    return false;
  }
  const templateIds = value.templates.map((template) => template.id);
  if (new Set(templateIds).size !== templateIds.length) return false;
  const occurrenceIds = value.occurrences.map((occurrence) => occurrence.id);
  const occurrencePairs = value.occurrences.map((occurrence) => occurrence.templateId + "|" + occurrence.planId);
  return new Set(occurrenceIds).size === occurrenceIds.length
    && new Set(occurrencePairs).size === occurrencePairs.length
    && value.occurrences.every((occurrence) => templateIds.includes(occurrence.templateId));
}

/**
 * Creates a detached, safe storage object. Invalid caller-owned records are
 * ignored instead of being persisted back into browser storage.
 */
export function localReminderStorage(
  templates: LocalReminderTemplate[] = [],
  occurrences: LocalReminderOccurrence[] = [],
): LocalReminderStorage {
  const detachedTemplates = templates
    .filter(isLocalReminderTemplate)
    .filter((template, index, source) => source.findIndex((candidate) => candidate.id === template.id) === index)
    .map(cloneTemplate);
  const templateIds = new Set(detachedTemplates.map((template) => template.id));
  const seenPairs = new Set<string>();
  const detachedOccurrences = occurrences.flatMap((occurrence) => {
    if (!isLocalReminderOccurrence(occurrence) || !templateIds.has(occurrence.templateId)) return [];
    const pair = occurrence.templateId + "|" + occurrence.planId;
    if (seenPairs.has(pair)) return [];
    seenPairs.add(pair);
    return [cloneOccurrence(occurrence)];
  });
  return {
    version: LOCAL_REMINDER_STORAGE_VERSION,
    templates: detachedTemplates,
    occurrences: detachedOccurrences,
  };
}

export function emptyLocalReminderStorage(): LocalReminderStorage {
  return localReminderStorage();
}

export function parseLocalReminderStorage(serialized: string): LocalReminderParseResult {
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isLocalReminderStorage(parsed)) {
      return { ok: false, error: "Saved reminders are not a supported local reminder record." };
    }
    return { ok: true, value: localReminderStorage(parsed.templates, parsed.occurrences) };
  } catch {
    return { ok: false, error: "Saved reminders are not valid JSON." };
  }
}

export function serializeLocalReminderStorage(storage: LocalReminderStorage): string | null {
  if (!isLocalReminderStorage(storage)) return null;
  return JSON.stringify(localReminderStorage(storage.templates, storage.occurrences));
}

export function addLocalReminderTemplate(
  storage: LocalReminderStorage,
  template: LocalReminderTemplate,
): LocalReminderStorage {
  if (!isLocalReminderStorage(storage)
    || !isLocalReminderTemplate(template)
    || storage.templates.some((candidate) => candidate.id === template.id)) {
    return storage;
  }
  return localReminderStorage([...storage.templates, template], storage.occurrences);
}

function normalizeLessonContext(value: unknown): LocalReminderLesson | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["planId", "lessonId", "classId", "date", "phaseIds"])) return null;
  if (typeof value.planId !== "string" || typeof value.date !== "string") return null;
  const planId = value.planId.trim();
  const date = value.date.trim();
  if (!isLocalReminderId(planId) || !isLocalReminderDate(date)) return null;

  let lessonId: string | undefined;
  if (value.lessonId !== undefined) {
    if (typeof value.lessonId !== "string") return null;
    lessonId = value.lessonId.trim();
    if (!isLocalReminderId(lessonId)) return null;
  }

  let classId: string | null | undefined;
  if (value.classId !== undefined) {
    if (value.classId === null) {
      classId = null;
    } else if (typeof value.classId === "string") {
      classId = value.classId.trim();
      if (!isLocalReminderId(classId)) return null;
    } else {
      return null;
    }
  }

  const sourcePhaseIds = value.phaseIds === undefined ? [] : value.phaseIds;
  if (!Array.isArray(sourcePhaseIds)) return null;
  const phaseIds = sourcePhaseIds.map((id) => typeof id === "string" ? id.trim() : "");
  if (phaseIds.some((id) => !isLocalReminderId(id))) return null;

  return {
    planId,
    ...(lessonId ? { lessonId } : {}),
    ...(classId !== undefined ? { classId } : {}),
    date,
    phaseIds: [...new Set(phaseIds)],
  };
}

export function isLocalReminderLesson(value: unknown): value is LocalReminderLesson {
  const normalized = normalizeLessonContext(value);
  if (!normalized || !isRecord(value)) return false;
  if (value.planId !== normalized.planId || value.date !== normalized.date) return false;
  if (value.lessonId !== undefined && value.lessonId !== normalized.lessonId) return false;
  if (value.classId !== undefined && value.classId !== normalized.classId) return false;
  return Array.isArray(value.phaseIds)
    && value.phaseIds.length === normalized.phaseIds.length
    && value.phaseIds.every((id, index) => id === normalized.phaseIds[index]);
}

function templateMatchesScope(template: LocalReminderTemplate, lesson: LocalReminderLesson): boolean {
  switch (template.scope.kind) {
    case "all_classes":
      return true;
    case "classes":
      return lesson.classId !== undefined
        && lesson.classId !== null
        && template.scope.classIds.includes(lesson.classId);
    case "lesson":
      return template.scope.lessonId === (lesson.lessonId ?? lesson.planId);
    case "phase":
      return lesson.phaseIds.includes(template.scope.phaseId);
  }
}

function reminderDateMatch(
  template: LocalReminderTemplate,
  date: string,
): { matches: boolean; isRollForward: boolean } {
  if (date < template.startDate) return { matches: false, isRollForward: false };
  if (template.cadence === "recurring") {
    return {
      matches: template.endDate === null || date <= template.endDate,
      isRollForward: false,
    };
  }
  const endDate = template.endDate!;
  if (date <= endDate) return { matches: true, isRollForward: false };
  return {
    matches: template.rollForwardUntilCompleted,
    isRollForward: template.rollForwardUntilCompleted,
  };
}

function occurrenceForPlan(
  storage: LocalReminderStorage,
  templateId: string,
  planId: string,
): LocalReminderOccurrence | undefined {
  return storage.occurrences.find((occurrence) => occurrence.templateId === templateId && occurrence.planId === planId);
}

function completionOnOrBefore(
  storage: LocalReminderStorage,
  templateId: string,
  date: string,
): LocalReminderOccurrence | undefined {
  return storage.occurrences.find((occurrence) => occurrence.templateId === templateId
    && occurrence.state === "completed"
    && occurrence.lessonDate <= date);
}

function openOccurrence(templateId: string, planId: string, lessonDate: string): LocalReminderOccurrence | null {
  const id = localReminderOccurrenceId(templateId, planId);
  return id ? {
    id,
    templateId,
    planId,
    lessonDate,
    state: "open",
    completedAt: null,
  } : null;
}

/**
 * Resolves applicable reminder templates without mutating storage. Completion
 * is per plan for recurring reminders; a completed temporary reminder stops
 * only its later roll-forward lessons from receiving another occurrence.
 */
export function resolveLocalReminders(
  storage: LocalReminderStorage,
  lesson: LocalReminderLesson,
): ResolvedLocalReminder[] {
  if (!isLocalReminderStorage(storage)) return [];
  const normalizedLesson = normalizeLessonContext(lesson);
  if (!normalizedLesson) return [];

  return storage.templates.flatMap((template) => {
    if (!template.active || !templateMatchesScope(template, normalizedLesson)) return [];
    const dateMatch = reminderDateMatch(template, normalizedLesson.date);
    if (!dateMatch.matches) return [];

    const existing = occurrenceForPlan(storage, template.id, normalizedLesson.planId);
    if (template.cadence === "temporary" && dateMatch.isRollForward) {
      const completion = completionOnOrBefore(storage, template.id, normalizedLesson.date);
      if (completion && completion.planId !== normalizedLesson.planId) return [];
    }

    const occurrence = existing ?? openOccurrence(template.id, normalizedLesson.planId, normalizedLesson.date);
    if (!occurrence) return [];
    return [{
      template: cloneTemplate(template),
      occurrence: cloneOccurrence(occurrence),
      isRollForward: dateMatch.isRollForward,
    }];
  });
}

/**
 * Writes only one template/plan completion record. A call outside the
 * reminder's valid scope or date window leaves storage unchanged.
 */
export function setLocalReminderComplete(
  storage: LocalReminderStorage,
  lesson: LocalReminderLesson,
  templateId: string,
  completed: boolean,
  options: Pick<LocalReminderCreateOptions, "now"> = {},
): LocalReminderStorage {
  if (!isLocalReminderStorage(storage) || !isLocalReminderId(templateId) || typeof completed !== "boolean") return storage;
  const normalizedLesson = normalizeLessonContext(lesson);
  if (!normalizedLesson) return storage;
  const resolved = resolveLocalReminders(storage, normalizedLesson)
    .find((candidate) => candidate.template.id === templateId);
  if (!resolved) return storage;

  const existingIndex = storage.occurrences.findIndex((occurrence) => occurrence.id === resolved.occurrence.id);
  const existing = existingIndex >= 0 ? storage.occurrences[existingIndex] : undefined;
  const occurrence: LocalReminderOccurrence = {
    ...resolved.occurrence,
    lessonDate: normalizedLesson.date,
    state: completed ? "completed" : "open",
    completedAt: completed ? existing?.completedAt ?? normalizedTimestamp(options.now) : null,
  };
  const occurrences = existingIndex >= 0
    ? storage.occurrences.map((candidate, index) => index === existingIndex ? occurrence : candidate)
    : [...storage.occurrences, occurrence];
  return localReminderStorage(storage.templates, occurrences);
}
