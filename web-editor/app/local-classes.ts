/**
 * Private, browser-local class records.
 *
 * This module deliberately has no network, calendar, or automation dependency.
 * A schedule import always creates a new local class record; it never silently
 * overwrites an existing roster or lesson plan.
 */

export const LOCAL_CLASS_STORAGE_VERSION = 1;

const MAX_ID_LENGTH = 120;
const MAX_CLASS_NAME_LENGTH = 120;
const MAX_GROUP_LENGTH = 120;
const MAX_COACH_LENGTH = 120;
const MAX_STUDENT_NAME_LENGTH = 120;
const MAX_EVENT_LENGTH = 120;
const MAX_AREA_LENGTH = 80;
const MAX_DAY_LENGTH = 32;
const MAX_TIME_LENGTH = 40;
const MAX_NOTES_LENGTH = 2_000;
const SAFE_LOCAL_ID = /^[a-z0-9][a-z0-9_-]*$/i;

export type LocalStudent = {
  /** Stable local ID: attendance status is keyed by this, not by a mutable name. */
  id: string;
  name: string;
  notes?: string;
};

export type LocalScheduleBlock = {
  /** Stable local ID for a recurring or imported schedule row. */
  id: string;
  day: string;
  start: string;
  end: string;
  event: string;
  /** Optional area aliases such as ["PB/HB", "TS"]. */
  areas?: string[];
  notes?: string;
};

export type LocalClass = {
  id: string;
  name: string;
  group?: string;
  coach?: string;
  notes?: string;
  students: LocalStudent[];
  schedule: LocalScheduleBlock[];
  createdAt: string;
  updatedAt: string;
};

export type LocalClassStorage = {
  version: typeof LOCAL_CLASS_STORAGE_VERSION;
  /** Null means the planner is using its existing demo roster until a class is chosen. */
  activeClassId: string | null;
  classes: LocalClass[];
};

export type LocalStudentDraft = {
  name: string;
  notes?: string;
};

export type LocalScheduleBlockDraft = {
  day: string;
  start: string;
  end: string;
  event: string;
  areas?: string[];
  notes?: string;
};

export type LocalClassDraft = {
  name: string;
  group?: string;
  coach?: string;
  notes?: string;
  students: LocalStudentDraft[];
  schedule: LocalScheduleBlockDraft[];
};

/** The only supported portable import format. SQL is intentionally not parsed or executed. */
export type LocalClassScheduleImport = {
  version: typeof LOCAL_CLASS_STORAGE_VERSION;
  class: LocalClassDraft;
};

export type LocalClassImportParseResult =
  | { ok: true; value: LocalClassScheduleImport }
  | { ok: false; error: string };

export type LocalClassIdKind = "class" | "student" | "schedule";

export type LocalClassCreateOptions = {
  /** Useful for deterministic tests and for a UI that captures one save timestamp. */
  now?: string | Date;
  /** IDs are generated locally; an import cannot provide or replace them. */
  idFactory?: (kind: LocalClassIdKind) => string;
};

export type AddLocalClassOptions = {
  /** Activating a newly created class is explicit and never changes existing records. */
  makeActive?: boolean;
};

/**
 * A targeted edit. `null` clears an optional class field; omitted fields are
 * left alone. Roster text is intentionally separate from schedule editing so
 * the UI can preserve attendance IDs while a coach corrects names.
 */
export type LocalClassUpdate = {
  name?: string;
  group?: string | null;
  coach?: string | null;
  notes?: string | null;
  rosterText?: string;
  schedule?: LocalScheduleBlockDraft[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
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

function isOptionalCanonicalText(value: unknown, maximumLength: number): boolean {
  return value === undefined || isCanonicalText(value, maximumLength);
}

function normalizeOptionalText(value: unknown, maximumLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = cleanText(value);
  return normalized && normalized.length <= maximumLength ? normalized : undefined;
}

function normalizeRequiredText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = cleanText(value);
  return normalized && normalized.length <= maximumLength ? normalized : null;
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && Number.isFinite(Date.parse(value));
}

function cloneStudent(student: LocalStudent): LocalStudent {
  return { ...student };
}

function cloneScheduleBlock(block: LocalScheduleBlock): LocalScheduleBlock {
  return { ...block, ...(block.areas ? { areas: [...block.areas] } : {}) };
}

function cloneLocalClass(localClass: LocalClass): LocalClass {
  return {
    ...localClass,
    students: localClass.students.map(cloneStudent),
    schedule: localClass.schedule.map(cloneScheduleBlock),
  };
}

function normalizedAreas(value: unknown): string[] | undefined | null {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  const areas = value.map((area) => normalizeRequiredText(area, MAX_AREA_LENGTH));
  if (areas.some((area) => area === null)) return null;
  const normalized = areas as string[];
  if (new Set(normalized.map((area) => area.toLocaleLowerCase())).size !== normalized.length) return null;
  return normalized;
}

function normalizedStudentDraft(value: unknown): LocalStudentDraft | null {
  if (typeof value === "string") {
    const name = normalizeRequiredText(value, MAX_STUDENT_NAME_LENGTH);
    return name ? { name } : null;
  }
  if (!isRecord(value) || !hasOnlyKeys(value, ["name", "notes"])) return null;
  const name = normalizeRequiredText(value.name, MAX_STUDENT_NAME_LENGTH);
  if (!name) return null;
  const notes = normalizeOptionalText(value.notes, MAX_NOTES_LENGTH);
  if (value.notes !== undefined && !notes) return null;
  return { name, ...(notes ? { notes } : {}) };
}

function normalizedScheduleDraft(value: unknown): LocalScheduleBlockDraft | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["day", "start", "end", "event", "areas", "notes"])) return null;
  const day = normalizeRequiredText(value.day, MAX_DAY_LENGTH);
  const start = normalizeRequiredText(value.start, MAX_TIME_LENGTH);
  const end = normalizeRequiredText(value.end, MAX_TIME_LENGTH);
  const event = normalizeRequiredText(value.event, MAX_EVENT_LENGTH);
  const areas = normalizedAreas(value.areas);
  const notes = normalizeOptionalText(value.notes, MAX_NOTES_LENGTH);
  if (!day || !start || !end || !event || areas === null || (value.notes !== undefined && !notes)) return null;
  const startMinute = parseLocalScheduleTime(start);
  const endMinute = parseLocalScheduleTime(end);
  if (!isSupportedScheduleDay(day) || startMinute === null || endMinute === null || startMinute >= endMinute) return null;
  return { day, start, end, event, ...(areas ? { areas } : {}), ...(notes ? { notes } : {}) };
}

/** Normalizes a form draft without accepting unsafe or ambiguous child records. */
export function normalizeLocalClassDraft(value: unknown): LocalClassDraft | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["name", "group", "coach", "notes", "students", "schedule"])) return null;
  const name = normalizeRequiredText(value.name, MAX_CLASS_NAME_LENGTH);
  const group = normalizeOptionalText(value.group, MAX_GROUP_LENGTH);
  const coach = normalizeOptionalText(value.coach, MAX_COACH_LENGTH);
  const notes = normalizeOptionalText(value.notes, MAX_NOTES_LENGTH);
  if (!name
    || (value.group !== undefined && !group)
    || (value.coach !== undefined && !coach)
    || (value.notes !== undefined && !notes)
    || !Array.isArray(value.students)
    || !Array.isArray(value.schedule)) {
    return null;
  }

  const students = value.students.map(normalizedStudentDraft);
  const schedule = value.schedule.map(normalizedScheduleDraft);
  if (students.some((student) => student === null) || schedule.some((block) => block === null)) return null;
  return {
    name,
    ...(group ? { group } : {}),
    ...(coach ? { coach } : {}),
    ...(notes ? { notes } : {}),
    students: students as LocalStudentDraft[],
    schedule: schedule as LocalScheduleBlockDraft[],
  };
}

export function isLocalClassId(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= MAX_ID_LENGTH
    && SAFE_LOCAL_ID.test(value);
}

export function isLocalStudent(value: unknown): value is LocalStudent {
  return isRecord(value)
    && hasOnlyKeys(value, ["id", "name", "notes"])
    && isLocalClassId(value.id)
    && isCanonicalText(value.name, MAX_STUDENT_NAME_LENGTH)
    && isOptionalCanonicalText(value.notes, MAX_NOTES_LENGTH);
}

export function isLocalScheduleBlock(value: unknown): value is LocalScheduleBlock {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "day", "start", "end", "event", "areas", "notes"])) return false;
  const areas = value.areas;
  return isLocalClassId(value.id)
    && isCanonicalText(value.day, MAX_DAY_LENGTH)
    && isCanonicalText(value.start, MAX_TIME_LENGTH)
    && isCanonicalText(value.end, MAX_TIME_LENGTH)
    && isCanonicalText(value.event, MAX_EVENT_LENGTH)
    && (areas === undefined || (Array.isArray(areas)
      && areas.every((area) => isCanonicalText(area, MAX_AREA_LENGTH))
      && new Set(areas.map((area) => area.toLocaleLowerCase())).size === areas.length))
    && isOptionalCanonicalText(value.notes, MAX_NOTES_LENGTH);
}

export function isLocalClass(value: unknown): value is LocalClass {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "id", "name", "group", "coach", "notes", "students", "schedule", "createdAt", "updatedAt",
  ])) return false;
  if (!isLocalClassId(value.id)
    || !isCanonicalText(value.name, MAX_CLASS_NAME_LENGTH)
    || !isOptionalCanonicalText(value.group, MAX_GROUP_LENGTH)
    || !isOptionalCanonicalText(value.coach, MAX_COACH_LENGTH)
    || !isOptionalCanonicalText(value.notes, MAX_NOTES_LENGTH)
    || !Array.isArray(value.students)
    || !Array.isArray(value.schedule)
    || !value.students.every(isLocalStudent)
    || !value.schedule.every(isLocalScheduleBlock)
    || !validTimestamp(value.createdAt)
    || !validTimestamp(value.updatedAt)) {
    return false;
  }
  return new Set(value.students.map((student) => student.id)).size === value.students.length
    && new Set(value.schedule.map((block) => block.id)).size === value.schedule.length;
}

/** Strictly validates the JSON-compatible record read from browser localStorage. */
export function isLocalClassStorage(value: unknown): value is LocalClassStorage {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["version", "activeClassId", "classes"])
    || value.version !== LOCAL_CLASS_STORAGE_VERSION
    || (value.activeClassId !== null && !isLocalClassId(value.activeClassId))
    || !Array.isArray(value.classes)
    || !value.classes.every(isLocalClass)) {
    return false;
  }
  const ids = value.classes.map((localClass) => localClass.id);
  return new Set(ids).size === ids.length
    && (value.activeClassId === null || ids.includes(value.activeClassId));
}

export function emptyLocalClassStorage(): LocalClassStorage {
  return { version: LOCAL_CLASS_STORAGE_VERSION, activeClassId: null, classes: [] };
}

/** Makes a detached, localStorage-safe copy and clears a stale active selection. */
export function localClassStorage(
  classes: LocalClass[] = [],
  activeClassId: string | null = null,
): LocalClassStorage {
  const detached = classes.filter(isLocalClass).map(cloneLocalClass);
  const ids = new Set(detached.map((localClass) => localClass.id));
  return {
    version: LOCAL_CLASS_STORAGE_VERSION,
    activeClassId: activeClassId && ids.has(activeClassId) ? activeClassId : null,
    classes: detached,
  };
}

let fallbackIdSequence = 0;

function createGeneratedId(kind: LocalClassIdKind): string {
  const randomUUID = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().replace(/-/g, "")
    : `${Date.now().toString(36)}${(++fallbackIdSequence).toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}-${randomUUID}`;
}

function normalizedTimestamp(value: string | Date | undefined): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && validTimestamp(value)) return new Date(value).toISOString();
  return new Date().toISOString();
}

/**
 * Builds one detached local class from a form or an already validated import.
 * It generates all IDs here so names can safely be edited later.
 */
export function createLocalClass(
  draft: LocalClassDraft,
  options: LocalClassCreateOptions = {},
): LocalClass | null {
  const normalized = normalizeLocalClassDraft(draft);
  if (!normalized) return null;
  const nextId = options.idFactory ?? createGeneratedId;
  const now = normalizedTimestamp(options.now);
  const usedIds = new Set<string>();
  const allocate = (kind: LocalClassIdKind): string | null => {
    const id = nextId(kind).trim();
    if (!isLocalClassId(id) || usedIds.has(id)) return null;
    usedIds.add(id);
    return id;
  };
  const id = allocate("class");
  if (!id) return null;
  const students: LocalStudent[] = [];
  for (const student of normalized.students) {
    const studentId = allocate("student");
    if (!studentId) return null;
    students.push({ id: studentId, ...student });
  }
  const schedule: LocalScheduleBlock[] = [];
  for (const block of normalized.schedule) {
    const blockId = allocate("schedule");
    if (!blockId) return null;
    schedule.push({ id: blockId, ...block, ...(block.areas ? { areas: [...block.areas] } : {}) });
  }
  return {
    id,
    name: normalized.name,
    ...(normalized.group ? { group: normalized.group } : {}),
    ...(normalized.coach ? { coach: normalized.coach } : {}),
    ...(normalized.notes ? { notes: normalized.notes } : {}),
    students,
    schedule,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Turns a one-name-per-line roster editor into stable attendance records.
 * Existing IDs (and private notes) follow their normalized name, so correcting
 * spacing or capitalization does not reset a student's attendance history.
 */
export function reconcileLocalRosterFromText(
  existingStudents: readonly LocalStudent[],
  rosterText: string,
  idFactory: (kind: "student") => string = createGeneratedId,
): LocalStudent[] | null {
  if (!existingStudents.every(isLocalStudent)) return null;
  const existingByNormalizedName = new Map<string, LocalStudent[]>();
  existingStudents.forEach((student) => {
    const key = student.name.toLocaleLowerCase();
    const matching = existingByNormalizedName.get(key) ?? [];
    matching.push(student);
    existingByNormalizedName.set(key, matching);
  });

  const names = rosterText
    .split(/\r?\n/)
    .map((line) => normalizeRequiredText(line, MAX_STUDENT_NAME_LENGTH))
    .filter((name): name is string => name !== null);
  const nonBlankLines = rosterText.split(/\r?\n/).filter((line) => line.trim());
  if (names.length !== nonBlankLines.length) return null;

  // Never recycle an ID from a removed row: an old attendance status must not
  // accidentally become the status of a newly typed student.
  const usedIds = new Set(existingStudents.map((student) => student.id));
  const nextStudents: LocalStudent[] = [];
  for (const name of names) {
    const matching = existingByNormalizedName.get(name.toLocaleLowerCase());
    const prior = matching?.shift();
    if (prior) {
      usedIds.add(prior.id);
      nextStudents.push({ id: prior.id, name, ...(prior.notes ? { notes: prior.notes } : {}) });
      continue;
    }
    const id = idFactory("student").trim();
    if (!isLocalClassId(id) || usedIds.has(id)) return null;
    usedIds.add(id);
    nextStudents.push({ id, name });
  }
  return nextStudents;
}

/** Adds a class only when its stable ID is new; it never performs an upsert. */
export function addLocalClass(
  storage: LocalClassStorage,
  localClass: LocalClass,
  options: AddLocalClassOptions = {},
): LocalClassStorage {
  if (!isLocalClassStorage(storage)
    || !isLocalClass(localClass)
    || storage.classes.some((existing) => existing.id === localClass.id)) {
    return storage;
  }
  return localClassStorage(
    [...storage.classes, cloneLocalClass(localClass)],
    options.makeActive ? localClass.id : storage.activeClassId,
  );
}

/** Selects an already-saved local class, or clears selection; no record changes. */
export function setActiveLocalClass(storage: LocalClassStorage, classId: string | null): LocalClassStorage {
  if (!isLocalClassStorage(storage)) return storage;
  if (classId !== null && !storage.classes.some((localClass) => localClass.id === classId)) return storage;
  return localClassStorage(storage.classes, classId);
}

/** Returns a detached selected class so UI editing cannot mutate persisted state by reference. */
export function activeLocalClass(storage: LocalClassStorage): LocalClass | null {
  if (!isLocalClassStorage(storage) || !storage.activeClassId) return null;
  const selected = storage.classes.find((localClass) => localClass.id === storage.activeClassId);
  return selected ? cloneLocalClass(selected) : null;
}

/** Looks up any explicit class selection, including a class ID stored on one lesson plan. */
export function localClassById(storage: LocalClassStorage, classId: string | null | undefined): LocalClass | null {
  if (!isLocalClassStorage(storage) || !classId) return null;
  const selected = storage.classes.find((localClass) => localClass.id === classId);
  return selected ? cloneLocalClass(selected) : null;
}

function scheduleIdentity(block: LocalScheduleBlockDraft | LocalScheduleBlock): string {
  return [
    block.day.toLocaleLowerCase(),
    block.start.toLocaleLowerCase(),
    block.end.toLocaleLowerCase(),
    block.event.toLocaleLowerCase(),
    ...(block.areas ?? []).map((area) => area.toLocaleLowerCase()),
  ].join("\u001f");
}

function reconcileLocalSchedule(
  existingSchedule: readonly LocalScheduleBlock[],
  draftedSchedule: readonly LocalScheduleBlockDraft[],
  idFactory: (kind: "schedule") => string,
): LocalScheduleBlock[] | null {
  const existingByIdentity = new Map<string, LocalScheduleBlock[]>();
  existingSchedule.forEach((block) => {
    const identity = scheduleIdentity(block);
    const matching = existingByIdentity.get(identity) ?? [];
    matching.push(block);
    existingByIdentity.set(identity, matching);
  });
  // As with roster IDs, a deleted row's stable ID is never reused by a new row.
  const usedIds = new Set(existingSchedule.map((block) => block.id));
  const nextSchedule: LocalScheduleBlock[] = [];
  for (const block of draftedSchedule) {
    const prior = existingByIdentity.get(scheduleIdentity(block))?.shift();
    if (prior) {
      usedIds.add(prior.id);
      nextSchedule.push({ id: prior.id, ...block, ...(block.areas ? { areas: [...block.areas] } : {}) });
      continue;
    }
    const id = idFactory("schedule").trim();
    if (!isLocalClassId(id) || usedIds.has(id)) return null;
    usedIds.add(id);
    nextSchedule.push({ id, ...block, ...(block.areas ? { areas: [...block.areas] } : {}) });
  }
  return nextSchedule;
}

function optionalUpdatedText(value: string | null | undefined, maximumLength: number): string | null | undefined {
  if (value === undefined || value === null) return value;
  const normalized = normalizeOptionalText(value, maximumLength);
  return normalized ?? null;
}

/**
 * Saves an explicit edit to exactly one local class. Invalid drafts leave the
 * entire storage object unchanged; this function is never used by import.
 */
export function updateLocalClass(
  storage: LocalClassStorage,
  classId: string,
  update: LocalClassUpdate,
  options: LocalClassCreateOptions = {},
): LocalClassStorage {
  if (!isLocalClassStorage(storage) || !isLocalClassId(classId) || !isRecord(update)) return storage;
  const current = storage.classes.find((localClass) => localClass.id === classId);
  if (!current) return storage;

  const name = update.name === undefined
    ? current.name
    : normalizeRequiredText(update.name, MAX_CLASS_NAME_LENGTH);
  if (!name) return storage;
  const group = optionalUpdatedText(update.group, MAX_GROUP_LENGTH);
  const coach = optionalUpdatedText(update.coach, MAX_COACH_LENGTH);
  const notes = optionalUpdatedText(update.notes, MAX_NOTES_LENGTH);
  if (group === null && update.group !== null && update.group !== undefined) return storage;
  if (coach === null && update.coach !== null && update.coach !== undefined) return storage;
  if (notes === null && update.notes !== null && update.notes !== undefined) return storage;

  const generatedIds = options.idFactory ?? createGeneratedId;
  const students = update.rosterText === undefined
    ? current.students.map(cloneStudent)
    : reconcileLocalRosterFromText(current.students, update.rosterText, (kind) => generatedIds(kind));
  if (!students) return storage;
  let schedule = current.schedule.map(cloneScheduleBlock);
  if (update.schedule !== undefined) {
    const normalizedSchedule = update.schedule.map(normalizedScheduleDraft);
    if (normalizedSchedule.some((block) => block === null)) return storage;
    const reconciled = reconcileLocalSchedule(current.schedule, normalizedSchedule as LocalScheduleBlockDraft[], (kind) => generatedIds(kind));
    if (!reconciled) return storage;
    schedule = reconciled;
  }

  const next: LocalClass = {
    id: current.id,
    name,
    ...(group === undefined ? (current.group ? { group: current.group } : {}) : group ? { group } : {}),
    ...(coach === undefined ? (current.coach ? { coach: current.coach } : {}) : coach ? { coach } : {}),
    ...(notes === undefined ? (current.notes ? { notes: current.notes } : {}) : notes ? { notes } : {}),
    students,
    schedule,
    createdAt: current.createdAt,
    updatedAt: normalizedTimestamp(options.now),
  };
  if (!isLocalClass(next)) return storage;
  return localClassStorage(
    storage.classes.map((localClass) => (localClass.id === classId ? next : localClass)),
    storage.activeClassId,
  );
}

/** Targeted removal only. The UI is responsible for its double-confirmation affordance. */
export function removeLocalClass(storage: LocalClassStorage, classId: string): LocalClassStorage {
  if (!isLocalClassStorage(storage) || !storage.classes.some((localClass) => localClass.id === classId)) return storage;
  const remaining = storage.classes.filter((localClass) => localClass.id !== classId);
  return localClassStorage(remaining, storage.activeClassId === classId ? null : storage.activeClassId);
}

/** A strict check for the portable import shape before the UI shows its preview. */
export function isLocalClassScheduleImport(value: unknown): value is LocalClassScheduleImport {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "class"]) || value.version !== LOCAL_CLASS_STORAGE_VERSION) return false;
  return normalizeLocalClassDraft(value.class) !== null;
}

/**
 * Parses JSON only. SQL is neither useful nor safe for private browser storage,
 * so it is explicitly rejected instead of being treated as a schedule command.
 */
export function parseLocalClassScheduleImport(raw: string): LocalClassImportParseResult {
  const source = raw.trim();
  if (!source) return { ok: false, error: "Paste a class schedule JSON document first." };
  if (!source.startsWith("{")) {
    return { ok: false, error: "Only JSON imports are supported. SQL is not executed by this local planner." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(source) as unknown;
  } catch {
    return { ok: false, error: "That schedule is not valid JSON yet." };
  }
  if (!isLocalClassScheduleImport(parsed)) {
    return {
      ok: false,
      error: "Use version 1 with a class name, students array, and schedule array. Imported IDs and unknown fields are not accepted.",
    };
  }
  const normalized = normalizeLocalClassDraft(parsed.class);
  if (!normalized) return { ok: false, error: "The class schedule has an invalid field." };
  return { ok: true, value: { version: LOCAL_CLASS_STORAGE_VERSION, class: normalized } };
}

/**
 * Creates and appends a new class from an import preview. Existing records are
 * preserved even if the imported class has the same display name.
 */
export function appendLocalClassScheduleImport(
  storage: LocalClassStorage,
  imported: LocalClassScheduleImport,
  options: LocalClassCreateOptions & AddLocalClassOptions = {},
): { storage: LocalClassStorage; localClass: LocalClass } | null {
  if (!isLocalClassStorage(storage) || !isLocalClassScheduleImport(imported)) return null;
  const localClass = createLocalClass(imported.class, options);
  if (!localClass) return null;
  const nextStorage = addLocalClass(storage, localClass, { makeActive: options.makeActive ?? true });
  if (nextStorage === storage) return null;
  return { storage: nextStorage, localClass };
}

const WEEKDAY_BY_NAME: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function isSupportedScheduleDay(value: string): boolean {
  const normalized = value.toLocaleLowerCase();
  return normalized === "daily"
    || normalized === "every day"
    || normalized in WEEKDAY_BY_NAME
    || isLessonDate(value);
}

function isLessonDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Converts a coach-friendly 12- or 24-hour time into minutes since midnight. */
export function parseLocalScheduleTime(value: string): number | null {
  const normalized = cleanText(value).toLocaleLowerCase();
  const twentyFourHour = normalized.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHour) return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);

  const twelveHour = normalized.match(/^([1-9]|1[0-2])(?::([0-5]\d))?\s*([ap])\.?m\.?$/);
  if (!twelveHour) return null;
  const hour = Number(twelveHour[1]);
  const minute = Number(twelveHour[2] ?? 0);
  const period = twelveHour[3];
  return ((hour % 12) + (period === "p" ? 12 : 0)) * 60 + minute;
}

/**
 * Matches either a one-off ISO date, a weekday name/abbreviation, or `Daily`.
 * It avoids locale parsing so a Monday schedule remains predictable on iPad.
 */
export function scheduleBlockMatchesLessonDate(block: LocalScheduleBlock, lessonDate: string): boolean {
  if (!isLocalScheduleBlock(block) || !isLessonDate(lessonDate)) return false;
  const day = block.day.toLocaleLowerCase();
  if (day === lessonDate) return true;
  if (day === "daily" || day === "every day") return true;
  const expectedWeekday = WEEKDAY_BY_NAME[day];
  if (expectedWeekday === undefined) return false;
  const [year, month, date] = lessonDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay() === expectedWeekday;
}

/** Returns detached matching blocks in start-time order; unparseable times stay after parsed times. */
export function localScheduleBlocksForLessonDate(
  schedule: readonly LocalScheduleBlock[],
  lessonDate: string,
): LocalScheduleBlock[] {
  return schedule
    .filter((block) => scheduleBlockMatchesLessonDate(block, lessonDate))
    .map(cloneScheduleBlock)
    .sort((first, second) => {
      const firstTime = parseLocalScheduleTime(first.start);
      const secondTime = parseLocalScheduleTime(second.start);
      if (firstTime === null && secondTime === null) return 0;
      if (firstTime === null) return 1;
      if (secondTime === null) return -1;
      return firstTime - secondTime;
    });
}

/** Copy-ready example shown by the UI; the importer intentionally supports no SQL dialect. */
export const LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE = `{
  "version": 1,
  "class": {
    "name": "Level 3 Boys",
    "group": "Level 3",
    "students": ["Avery Kim", "Jordan Lee"],
    "schedule": [
      { "day": "Monday", "start": "3:30 PM", "end": "4:00 PM", "event": "Floor", "areas": ["F2"] },
      { "day": "Monday", "start": "4:00 PM", "end": "4:30 PM", "event": "Bars", "areas": ["PB/HB"] }
    ]
  }
}`;
