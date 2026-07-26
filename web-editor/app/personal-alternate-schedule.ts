import type { SafeScheduleBundleV1, ScheduleDay, ScheduleWeek } from "./local-schedule";

export const PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY = "gymnastics-vault:alternate-schedule:v1";

export type PersonalAlternateScheduleScope =
  | { type: "date"; date: string }
  | { type: "recurring"; weekday: Exclude<ScheduleDay, "Sun">; parity: ScheduleWeek };

export type PersonalAlternateScheduleRecord = {
  id: string;
  sourceScheduleId: string;
  sourceFingerprint: string;
  sourceSheet: string;
  sourceOpening: {
    key: string;
    equipment: string;
    startMinute: number;
    endMinute: number;
    durationMinute: number;
  };
  className: string;
  scope: PersonalAlternateScheduleScope;
  createdAt: string;
  updatedAt: string;
  staleReason: string;
  staleAt: string;
};

export type PersonalAlternateScheduleStore = {
  schemaVersion: 1;
  kind: "browser_local_alternate_schedule";
  updatedAt: string;
  records: PersonalAlternateScheduleRecord[];
};

export type PersonalAlternateScheduleParseResult =
  | { ok: true; value: PersonalAlternateScheduleStore }
  | { ok: false; error: string };

export type PersonalAlternateScheduleCard = PersonalAlternateScheduleRecord & {
  isStale: boolean;
  reviewReason: string;
};

const ROOT_KEYS = ["schema_version", "kind", "updated_at", "records"] as const;
const RECORD_KEYS = [
  "id", "source_schedule_id", "source_fingerprint", "source_sheet", "source_opening",
  "class_name", "scope", "created_at", "updated_at", "stale_reason", "stale_at",
] as const;
const OPENING_KEYS = ["key", "equipment", "start_min", "end_min", "duration_min"] as const;
const DATE_SCOPE_KEYS = ["type", "date"] as const;
const RECURRING_SCOPE_KEYS = ["type", "weekday", "parity"] as const;
const SHEET_PATTERN = /^(Mon|Tues|Wed|Thurs|Fri|Sat)-(Odd|Even)$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const WEEKDAYS: Exclude<ScheduleDay, "Sun">[] = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

class PersonalAlternateScheduleValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new PersonalAlternateScheduleValidationError(`${path} must be an object.`);
  return value;
}

function requireOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  path: string,
): void {
  const allowed = new Set(keys);
  const unknown = Object.keys(value).find((key) => !allowed.has(key));
  const missing = keys.find((key) => !(key in value));
  if (unknown) throw new PersonalAlternateScheduleValidationError(`${path} contains unsupported field "${unknown}".`);
  if (missing) throw new PersonalAlternateScheduleValidationError(`${path} is missing required field "${missing}".`);
}

function requireText(value: unknown, path: string, maximum: number, allowEmpty = false): string {
  if (typeof value !== "string" || value !== value.trim() || value.length > maximum || (!allowEmpty && !value)) {
    throw new PersonalAlternateScheduleValidationError(`${path} must be ${allowEmpty ? "a" : "a non-empty"} trimmed text value no longer than ${maximum} characters.`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new PersonalAlternateScheduleValidationError(`${path} cannot contain control characters.`);
  }
  return value;
}

function requireTimestamp(value: unknown, path: string): string {
  const timestamp = requireText(value, path, 40, true);
  if (timestamp && (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp)))) {
    throw new PersonalAlternateScheduleValidationError(`${path} must be an ISO timestamp or blank.`);
  }
  return timestamp;
}

function requireIsoDate(value: unknown, path: string): string {
  const date = requireText(value, path, 10);
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new PersonalAlternateScheduleValidationError(`${path} must use YYYY-MM-DD.`);
  }
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new PersonalAlternateScheduleValidationError(`${path} must be a real calendar date.`);
  }
  return date;
}

function requireMinute(value: unknown, path: string): number {
  if (
    typeof value !== "number"
    || !Number.isInteger(value)
    || value < 0
    || value >= 1440
    || value % 5 !== 0
  ) {
    throw new PersonalAlternateScheduleValidationError(`${path} must be a same-day five-minute boundary.`);
  }
  return value;
}

function scheduleDayForDate(date: string): ScheduleDay {
  const [year, month, day] = date.split("-").map(Number);
  return (["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"] as const)[
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
}

function normalizeScope(value: unknown, sourceSheet: string, path: string): PersonalAlternateScheduleScope {
  const scope = requireRecord(value, path);
  if (scope.type === "date") {
    requireOnlyKeys(scope, DATE_SCOPE_KEYS, path);
    const date = requireIsoDate(scope.date, `${path}.date`);
    const sheet = SHEET_PATTERN.exec(sourceSheet);
    if (!sheet || scheduleDayForDate(date) !== sheet[1]) {
      throw new PersonalAlternateScheduleValidationError(`${path}.date must match the source sheet weekday.`);
    }
    return { type: "date", date };
  }
  if (scope.type === "recurring") {
    requireOnlyKeys(scope, RECURRING_SCOPE_KEYS, path);
    const weekday = requireText(scope.weekday, `${path}.weekday`, 10);
    const parity = requireText(scope.parity, `${path}.parity`, 10);
    if (!WEEKDAYS.includes(weekday as Exclude<ScheduleDay, "Sun">) || (parity !== "Odd" && parity !== "Even")) {
      throw new PersonalAlternateScheduleValidationError(`${path} must contain a supported weekday and Odd or Even parity.`);
    }
    if (sourceSheet !== `${weekday}-${parity}`) {
      throw new PersonalAlternateScheduleValidationError(`${path} must match the source sheet.`);
    }
    return {
      type: "recurring",
      weekday: weekday as Exclude<ScheduleDay, "Sun">,
      parity,
    };
  }
  throw new PersonalAlternateScheduleValidationError(`${path}.type must be date or recurring.`);
}

function normalizeRecord(value: unknown, index: number): PersonalAlternateScheduleRecord {
  const path = `records[${index}]`;
  const record = requireRecord(value, path);
  requireOnlyKeys(record, RECORD_KEYS, path);
  const sourceSheet = requireText(record.source_sheet, `${path}.source_sheet`, 40);
  if (!SHEET_PATTERN.test(sourceSheet)) {
    throw new PersonalAlternateScheduleValidationError(`${path}.source_sheet is not supported.`);
  }
  const opening = requireRecord(record.source_opening, `${path}.source_opening`);
  requireOnlyKeys(opening, OPENING_KEYS, `${path}.source_opening`);
  const equipment = requireText(opening.equipment, `${path}.source_opening.equipment`, 80);
  const startMinute = requireMinute(opening.start_min, `${path}.source_opening.start_min`);
  const endMinute = requireMinute(opening.end_min, `${path}.source_opening.end_min`);
  if (endMinute <= startMinute) {
    throw new PersonalAlternateScheduleValidationError(`${path}.source_opening must use a forward time range.`);
  }
  const durationMinute = opening.duration_min;
  if (durationMinute !== endMinute - startMinute) {
    throw new PersonalAlternateScheduleValidationError(`${path}.source_opening.duration_min must match its time range.`);
  }
  const key = requireText(opening.key, `${path}.source_opening.key`, 240);
  if (key !== `${sourceSheet}|${equipment}|${startMinute}|${endMinute}`) {
    throw new PersonalAlternateScheduleValidationError(`${path}.source_opening.key does not match the source opening.`);
  }
  return {
    id: requireText(record.id, `${path}.id`, 120),
    sourceScheduleId: requireText(record.source_schedule_id, `${path}.source_schedule_id`, 80),
    sourceFingerprint: requireText(record.source_fingerprint, `${path}.source_fingerprint`, 160),
    sourceSheet,
    sourceOpening: { key, equipment, startMinute, endMinute, durationMinute },
    className: requireText(record.class_name, `${path}.class_name`, 100),
    scope: normalizeScope(record.scope, sourceSheet, `${path}.scope`),
    createdAt: requireTimestamp(record.created_at, `${path}.created_at`),
    updatedAt: requireTimestamp(record.updated_at, `${path}.updated_at`),
    staleReason: requireText(record.stale_reason, `${path}.stale_reason`, 240, true),
    staleAt: requireTimestamp(record.stale_at, `${path}.stale_at`),
  };
}

export function emptyPersonalAlternateScheduleStore(): PersonalAlternateScheduleStore {
  return { schemaVersion: 1, kind: "browser_local_alternate_schedule", updatedAt: "", records: [] };
}

export function parsePersonalAlternateScheduleStoreJson(raw: string): PersonalAlternateScheduleParseResult {
  try {
    const root = requireRecord(JSON.parse(raw) as unknown, "Alternate schedule");
    requireOnlyKeys(root, ROOT_KEYS, "Alternate schedule");
    if (root.schema_version !== 1 || root.kind !== "browser_local_alternate_schedule") {
      throw new PersonalAlternateScheduleValidationError("This is not the browser-local alternate schedule version 1 contract.");
    }
    if (!Array.isArray(root.records)) {
      throw new PersonalAlternateScheduleValidationError("Alternate schedule records must be a list.");
    }
    const records = root.records.map(normalizeRecord);
    if (new Set(records.map((record) => record.id)).size !== records.length) {
      throw new PersonalAlternateScheduleValidationError("Alternate schedule record IDs must be unique.");
    }
    return {
      ok: true,
      value: {
        schemaVersion: 1,
        kind: "browser_local_alternate_schedule",
        updatedAt: requireTimestamp(root.updated_at, "Alternate schedule updated_at"),
        records,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof PersonalAlternateScheduleValidationError
        ? error.message
        : "Alternate schedule storage is not valid JSON.",
    };
  }
}

function reviewReason(
  record: PersonalAlternateScheduleRecord,
  date: string,
  lessonWeek: ScheduleWeek | null,
  schedule: SafeScheduleBundleV1 | null,
): string {
  if (record.staleReason) return record.staleReason;
  if (!schedule) return "Import the matching privacy-safe schedule before trusting this personal opening.";
  if (schedule.schedule.scheduleId !== record.sourceScheduleId) {
    return `Saved from ${record.sourceScheduleId}; the active safe schedule is ${schedule.schedule.scheduleId}.`;
  }
  if (
    (schedule.schedule.effectiveStart && date < schedule.schedule.effectiveStart)
    || (schedule.schedule.effectiveEnd && date > schedule.schedule.effectiveEnd)
  ) {
    return "The selected lesson date is outside the active safe schedule range.";
  }
  if (!lessonWeek) return "Confirm the selected lesson's Odd or Even week before trusting this opening.";
  const expectedSheet = `${scheduleDayForDate(date)}-${lessonWeek}`;
  if (record.sourceSheet !== expectedSheet) {
    return `Saved from ${record.sourceSheet}; this lesson resolves to ${expectedSheet}.`;
  }
  if (!schedule.schedule.equipment.some((equipment) => equipment.name === record.sourceOpening.equipment)) {
    return `${record.sourceOpening.equipment} is not in the active safe schedule.`;
  }
  const opening = record.sourceOpening;
  const hasBlockingOverlap = schedule.schedule.timeBlocks.some((block) => (
    block.day === scheduleDayForDate(date)
    && block.week === lessonWeek
    && block.activityType !== "open"
    && block.startMinute < opening.endMinute
    && block.endMinute > opening.startMinute
    && block.equipment.includes(opening.equipment)
  ));
  return hasBlockingOverlap
    ? `${opening.equipment} is no longer open for the full saved time.`
    : "";
}

export function personalAlternateScheduleCardsForLesson({
  store,
  date,
  className,
  lessonWeek,
  safeSchedule,
}: {
  store: PersonalAlternateScheduleStore;
  date: string;
  className: string;
  lessonWeek: ScheduleWeek | null;
  safeSchedule: SafeScheduleBundleV1 | null;
}): PersonalAlternateScheduleCard[] {
  const lessonDay = scheduleDayForDate(date);
  return store.records
    .filter((record) => record.className === className)
    .filter((record) => record.scope.type === "date"
      ? record.scope.date === date
      : record.scope.weekday === lessonDay && record.scope.parity === lessonWeek)
    .map((record) => {
      const reason = reviewReason(record, date, lessonWeek, safeSchedule);
      return { ...record, isStale: Boolean(reason), reviewReason: reason };
    })
    .sort((left, right) => (
      left.sourceOpening.startMinute - right.sourceOpening.startMinute
      || left.sourceOpening.equipment.localeCompare(right.sourceOpening.equipment)
    ));
}

export function personalAlternateScheduleScopeLabel(scope: PersonalAlternateScheduleScope): string {
  return scope.type === "date"
    ? `Only ${scope.date}`
    : `Every ${scope.weekday}-${scope.parity}`;
}
