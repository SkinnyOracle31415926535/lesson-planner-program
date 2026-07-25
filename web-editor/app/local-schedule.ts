/**
 * Strict browser-local contract for the privacy-safe full gym schedule.
 *
 * This module has no network, calendar, roster, or automation dependency. It
 * consumes only the allowlisted JSON exported by bridge/safe_schedule_exporter.py.
 */

import gymMapSemantics from "../../contracts/gym-map-semantics.json";
import { gymPanelLayout } from "./gym-layout";

export const SAFE_SCHEDULE_FORMAT = "lesson-planner-safe-schedule";
export const SAFE_SCHEDULE_VERSION = 1;
export const SAFE_SCHEDULE_STORAGE_VERSION = 1;
export const MAX_SAFE_SCHEDULE_FILE_BYTES = 2 * 1024 * 1024;

export type ScheduleWeek = "Odd" | "Even";
export type ScheduleDay = "Mon" | "Tues" | "Wed" | "Thurs" | "Fri" | "Sat" | "Sun";

export type SafeSchedulePrivacy = {
  studentRecordsIncluded: false;
  rostersIncluded: false;
  mediaBytesIncluded: false;
  urlsIncluded: false;
  absoluteSourcePathsIncluded: false;
  rawScheduleLabelsIncluded: false;
  rawWeeklyNoteTextIncluded: false;
  sourceClassNamesIncluded: false;
  sourceBookingIdsIncluded: false;
  drillLibraryIncluded: false;
  weeklyLedgerIncluded: false;
};

export type SafeScheduleCalendarWeekRule = {
  ruleId: string;
  timezone: string;
  weekStart: "monday";
  weekEnd: "sunday";
  monthWeekAnchor: "monday_sunday_week_containing_month_day_1";
  oddWeekOrdinals: number[];
  evenWeekOrdinals: number[];
  weekFiveOrLaterRequiresManualConfirmation: boolean;
  overflowWeekBehavior: "manual_confirmation_required";
};

export type SafeScheduleEquipment = {
  name: string;
  displayOrder: number;
  isSingleUnit: boolean;
};

export type SafeScheduleTimeBlock = {
  bookingId: string;
  day: ScheduleDay;
  week: ScheduleWeek;
  group: string;
  startMinute: number;
  endMinute: number;
  canonicalEventLabel: string;
  eventLabel: string;
  equipment: string[];
  activityType: "rotation" | "open" | "support" | "conditioning" | "warmup";
  confidence: "high" | "medium" | "low";
  reviewStatus: "auto_extracted" | "color_inferred" | "color_inferred_needs_review" | "needs_review";
};

export type SafeScheduleBundleV1 = {
  format: typeof SAFE_SCHEDULE_FORMAT;
  version: typeof SAFE_SCHEDULE_VERSION;
  privacy: SafeSchedulePrivacy;
  schedule: {
    sourceId: string;
    scheduleId: string;
    revision: string;
    timezone: string;
    effectiveStart: string | null;
    effectiveEnd: string | null;
    calendarWeekRule: SafeScheduleCalendarWeekRule;
    equipment: SafeScheduleEquipment[];
    timeBlocks: SafeScheduleTimeBlock[];
    collisionWarnings: {
      warningCount: number;
      statusCounts: Record<string, number>;
    };
  };
};

export type SafeScheduleStorage = {
  version: typeof SAFE_SCHEDULE_STORAGE_VERSION;
  bundle: SafeScheduleBundleV1 | null;
  scheduleGroupByClassId: Record<string, string>;
  manualWeekByDate: Record<string, ScheduleWeek>;
};

export type SafeScheduleParseResult =
  | { ok: true; value: SafeScheduleBundleV1 }
  | { ok: false; error: string };

export type SafeScheduleDayResolution = {
  status: "ready" | "group_required" | "manual_week_confirmation_required" | "outside_schedule_range" | "no_blocks_for_group";
  date: string;
  day: ScheduleDay;
  monthWeekOrdinal: number;
  resolvedWeek: ScheduleWeek | null;
  group: string | null;
  allDayBlocks: SafeScheduleTimeBlock[];
  groupBlocks: SafeScheduleTimeBlock[];
  nonOpenBlocks: SafeScheduleTimeBlock[];
  openBlocks: SafeScheduleTimeBlock[];
};

export type OpenAreaAvailability = {
  bookingId: string;
  occupiedSemanticZoneIds: string[];
  availablePanelIds: string[];
  unavailablePanelIds: string[];
  unmappedEquipment: string[];
};

/** A five-minute lesson window that can be checked against a ready schedule day. */
export type SafeScheduleInterval = {
  startMinute: number;
  endMinute: number;
};

/** Availability for an arbitrary lesson event, not just an imported Open block. */
export type IntervalAreaAvailability = SafeScheduleInterval & {
  occupiedSemanticZoneIds: string[];
  availablePanelIds: string[];
  unavailablePanelIds: string[];
  unmappedEquipment: string[];
};

const ROOT_KEYS = ["format", "version", "privacy", "schedule"] as const;
const PRIVACY_KEYS = [
  "studentRecordsIncluded", "rostersIncluded", "mediaBytesIncluded", "urlsIncluded",
  "absoluteSourcePathsIncluded", "rawScheduleLabelsIncluded", "rawWeeklyNoteTextIncluded",
  "sourceClassNamesIncluded", "sourceBookingIdsIncluded", "drillLibraryIncluded", "weeklyLedgerIncluded",
] as const;
const SCHEDULE_KEYS = [
  "sourceId", "scheduleId", "revision", "timezone", "effectiveStart", "effectiveEnd",
  "calendarWeekRule", "equipment", "timeBlocks", "collisionWarnings",
] as const;
const CALENDAR_KEYS = [
  "ruleId", "timezone", "weekStart", "weekEnd", "monthWeekAnchor", "oddWeekOrdinals",
  "evenWeekOrdinals", "weekFiveOrLaterRequiresManualConfirmation", "overflowWeekBehavior",
] as const;
const EQUIPMENT_KEYS = ["name", "displayOrder", "isSingleUnit"] as const;
const TIME_BLOCK_KEYS = [
  "bookingId", "day", "week", "group", "startMinute", "endMinute", "canonicalEventLabel",
  "eventLabel", "equipment", "activityType", "confidence", "reviewStatus",
] as const;
const COLLISION_KEYS = ["warningCount", "statusCounts"] as const;
const STORAGE_KEYS = ["version", "bundle", "scheduleGroupByClassId", "manualWeekByDate"] as const;
const DAY_LABELS: ScheduleDay[] = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const ACTIVITY_TYPES: SafeScheduleTimeBlock["activityType"][] = ["rotation", "open", "support", "conditioning", "warmup"];
const CONFIDENCE_VALUES: SafeScheduleTimeBlock["confidence"][] = ["high", "medium", "low"];
const REVIEW_STATUS_VALUES: SafeScheduleTimeBlock["reviewStatus"][] = ["auto_extracted", "color_inferred", "color_inferred_needs_review", "needs_review"];
const SAFE_LOCAL_ID = /^[a-z0-9][a-z0-9_-]*$/i;
const MAX_TEXT_LENGTH = 240;

class ScheduleValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Keeps event searches on the same forward five-minute boundaries as imports. */
export function isSafeScheduleInterval(value: unknown): value is SafeScheduleInterval {
  if (!isRecord(value)) return false;
  const { startMinute, endMinute } = value;
  return typeof startMinute === "number"
    && Number.isInteger(startMinute)
    && startMinute >= 0
    && startMinute < 1440
    && startMinute % 5 === 0
    && typeof endMinute === "number"
    && Number.isInteger(endMinute)
    && endMinute > startMinute
    && endMinute < 1440
    && endMinute % 5 === 0;
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new ScheduleValidationError(`${path} must be an object.`);
  return value;
}

function requireOnlyKeys(value: Record<string, unknown>, allowed: readonly string[], path: string) {
  const unknownKey = Object.keys(value).find((key) => !allowed.includes(key));
  const missingKey = allowed.find((key) => !Object.prototype.hasOwnProperty.call(value, key));
  if (unknownKey) throw new ScheduleValidationError(`${path} contains unsupported field “${unknownKey}”.`);
  if (missingKey) throw new ScheduleValidationError(`${path} is missing required field “${missingKey}”.`);
}

function requireSafeText(value: unknown, path: string, maximumLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximumLength || /[\r\n\0]/.test(value)) {
    throw new ScheduleValidationError(`${path} must be a short, trimmed text value.`);
  }
  if (/^(?:\/|~|[a-z]:\\)/i.test(value) || value.includes("://") || value.includes("\\")) {
    throw new ScheduleValidationError(`${path} cannot contain a URL or file path.`);
  }
  return value;
}

function requireInteger(value: unknown, path: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
    throw new ScheduleValidationError(`${path} must be an integer of at least ${minimum}.`);
  }
  return value;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isoDateParts(value: unknown, path: string): { year: number; month: number; day: number; iso: string } {
  if (typeof value !== "string") throw new ScheduleValidationError(`${path} must use YYYY-MM-DD.`);
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new ScheduleValidationError(`${path} must use YYYY-MM-DD.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > monthLengths[month - 1]) {
    throw new ScheduleValidationError(`${path} must be a real calendar date.`);
  }
  return { year, month, day, iso: value };
}

function optionalIsoDate(value: unknown, path: string): string | null {
  if (value === null) return null;
  return isoDateParts(value, path).iso;
}

function normalizedOrdinalList(value: unknown, path: string): number[] {
  if (!Array.isArray(value) || !value.length) throw new ScheduleValidationError(`${path} must be a non-empty integer list.`);
  const ordinals = value.map((entry, index) => requireInteger(entry, `${path}[${index}]`, 1));
  if (new Set(ordinals).size !== ordinals.length) throw new ScheduleValidationError(`${path} cannot contain duplicates.`);
  return [...ordinals];
}

function normalizeCalendarWeekRule(value: unknown, timezone: string): SafeScheduleCalendarWeekRule {
  const rule = requireRecord(value, "schedule.calendarWeekRule");
  requireOnlyKeys(rule, CALENDAR_KEYS, "schedule.calendarWeekRule");
  const oddWeekOrdinals = normalizedOrdinalList(rule.oddWeekOrdinals, "schedule.calendarWeekRule.oddWeekOrdinals");
  const evenWeekOrdinals = normalizedOrdinalList(rule.evenWeekOrdinals, "schedule.calendarWeekRule.evenWeekOrdinals");
  if (oddWeekOrdinals.some((ordinal) => evenWeekOrdinals.includes(ordinal))) {
    throw new ScheduleValidationError("Odd and Even calendar week ordinals cannot overlap.");
  }
  if (rule.timezone !== timezone
    || rule.weekStart !== "monday"
    || rule.weekEnd !== "sunday"
    || rule.monthWeekAnchor !== "monday_sunday_week_containing_month_day_1"
    || rule.overflowWeekBehavior !== "manual_confirmation_required"
    || rule.weekFiveOrLaterRequiresManualConfirmation !== true) {
    throw new ScheduleValidationError("The calendar week rule is not supported by this local planner.");
  }
  return {
    ruleId: requireSafeText(rule.ruleId, "schedule.calendarWeekRule.ruleId"),
    timezone,
    weekStart: "monday",
    weekEnd: "sunday",
    monthWeekAnchor: "monday_sunday_week_containing_month_day_1",
    oddWeekOrdinals,
    evenWeekOrdinals,
    weekFiveOrLaterRequiresManualConfirmation: rule.weekFiveOrLaterRequiresManualConfirmation,
    overflowWeekBehavior: "manual_confirmation_required",
  };
}

function normalizeEquipment(value: unknown): SafeScheduleEquipment[] {
  if (!Array.isArray(value) || !value.length) throw new ScheduleValidationError("schedule.equipment must be a non-empty list.");
  const names = new Set<string>();
  const orders = new Set<number>();
  return value.map((entry, index) => {
    const item = requireRecord(entry, `schedule.equipment[${index}]`);
    requireOnlyKeys(item, EQUIPMENT_KEYS, `schedule.equipment[${index}]`);
    const name = requireSafeText(item.name, `schedule.equipment[${index}].name`, 80);
    const displayOrder = requireInteger(item.displayOrder, `schedule.equipment[${index}].displayOrder`);
    if (typeof item.isSingleUnit !== "boolean") throw new ScheduleValidationError(`schedule.equipment[${index}].isSingleUnit must be true or false.`);
    if (names.has(name) || orders.has(displayOrder)) throw new ScheduleValidationError("Equipment names and display orders must be unique.");
    names.add(name);
    orders.add(displayOrder);
    return { name, displayOrder, isSingleUnit: item.isSingleUnit };
  });
}

function normalizeTimeBlocks(value: unknown): SafeScheduleTimeBlock[] {
  if (!Array.isArray(value) || !value.length) throw new ScheduleValidationError("schedule.timeBlocks must be a non-empty list.");
  const bookingIds = new Set<string>();
  return value.map((entry, index) => {
    const path = `schedule.timeBlocks[${index}]`;
    const block = requireRecord(entry, path);
    requireOnlyKeys(block, TIME_BLOCK_KEYS, path);
    const bookingId = requireSafeText(block.bookingId, `${path}.bookingId`);
    if (bookingIds.has(bookingId)) throw new ScheduleValidationError(`Duplicate bookingId “${bookingId}”.`);
    bookingIds.add(bookingId);
    if (!DAY_LABELS.includes(block.day as ScheduleDay)) throw new ScheduleValidationError(`${path}.day is not supported.`);
    if (block.week !== "Odd" && block.week !== "Even") throw new ScheduleValidationError(`${path}.week must be Odd or Even.`);
    const startMinute = requireInteger(block.startMinute, `${path}.startMinute`);
    const endMinute = requireInteger(block.endMinute, `${path}.endMinute`);
    if (startMinute >= endMinute || endMinute >= 1440 || startMinute % 5 || endMinute % 5) {
      throw new ScheduleValidationError(`${path} must use a forward same-day five-minute time range ending before midnight.`);
    }
    if (!Array.isArray(block.equipment)) throw new ScheduleValidationError(`${path}.equipment must be a list.`);
    const equipment = block.equipment.map((token, tokenIndex) => requireSafeText(token, `${path}.equipment[${tokenIndex}]`, 80));
    if (new Set(equipment).size !== equipment.length) throw new ScheduleValidationError(`${path}.equipment cannot contain duplicates.`);
    if (!ACTIVITY_TYPES.includes(block.activityType as SafeScheduleTimeBlock["activityType"])) throw new ScheduleValidationError(`${path}.activityType is not supported.`);
    if (!CONFIDENCE_VALUES.includes(block.confidence as SafeScheduleTimeBlock["confidence"])) throw new ScheduleValidationError(`${path}.confidence is not supported.`);
    if (!REVIEW_STATUS_VALUES.includes(block.reviewStatus as SafeScheduleTimeBlock["reviewStatus"])) throw new ScheduleValidationError(`${path}.reviewStatus is not supported.`);
    const canonicalEventLabel = requireSafeText(block.canonicalEventLabel, `${path}.canonicalEventLabel`);
    const eventLabel = requireSafeText(block.eventLabel, `${path}.eventLabel`);
    if (canonicalEventLabel !== eventLabel) throw new ScheduleValidationError(`${path}.eventLabel must match the safe canonical label.`);
    return {
      bookingId,
      day: block.day as ScheduleDay,
      week: block.week as ScheduleWeek,
      group: requireSafeText(block.group, `${path}.group`),
      startMinute,
      endMinute,
      canonicalEventLabel,
      eventLabel,
      equipment,
      activityType: block.activityType as SafeScheduleTimeBlock["activityType"],
      confidence: block.confidence as SafeScheduleTimeBlock["confidence"],
      reviewStatus: block.reviewStatus as SafeScheduleTimeBlock["reviewStatus"],
    };
  });
}

function normalizeCollisionWarnings(value: unknown): SafeScheduleBundleV1["schedule"]["collisionWarnings"] {
  const warnings = requireRecord(value, "schedule.collisionWarnings");
  requireOnlyKeys(warnings, COLLISION_KEYS, "schedule.collisionWarnings");
  const statusCountsValue = requireRecord(warnings.statusCounts, "schedule.collisionWarnings.statusCounts");
  const statusCounts = Object.fromEntries(Object.entries(statusCountsValue).map(([status, count]) => [
    requireSafeText(status, "collision warning status", 80),
    requireInteger(count, `collision warning status ${status}`),
  ]));
  const warningCount = requireInteger(warnings.warningCount, "schedule.collisionWarnings.warningCount");
  if (warningCount > Object.values(statusCounts).reduce((total, count) => total + count, 0)) {
    throw new ScheduleValidationError("Collision warning count exceeds its status total.");
  }
  return { warningCount, statusCounts };
}

function normalizeSafeScheduleBundle(value: unknown): SafeScheduleBundleV1 {
  const root = requireRecord(value, "Schedule bundle");
  requireOnlyKeys(root, ROOT_KEYS, "Schedule bundle");
  if (root.format !== SAFE_SCHEDULE_FORMAT || root.version !== SAFE_SCHEDULE_VERSION) {
    throw new ScheduleValidationError("This is not a Lesson Planner safe schedule version 1 file.");
  }
  const privacy = requireRecord(root.privacy, "privacy");
  requireOnlyKeys(privacy, PRIVACY_KEYS, "privacy");
  for (const key of PRIVACY_KEYS) {
    if (privacy[key] !== false) throw new ScheduleValidationError(`privacy.${key} must be false.`);
  }
  const schedule = requireRecord(root.schedule, "schedule");
  requireOnlyKeys(schedule, SCHEDULE_KEYS, "schedule");
  const timezone = requireSafeText(schedule.timezone, "schedule.timezone");
  const effectiveStart = optionalIsoDate(schedule.effectiveStart, "schedule.effectiveStart");
  const effectiveEnd = optionalIsoDate(schedule.effectiveEnd, "schedule.effectiveEnd");
  if (effectiveStart && effectiveEnd && effectiveStart > effectiveEnd) throw new ScheduleValidationError("The schedule effective date range is reversed.");
  return {
    format: SAFE_SCHEDULE_FORMAT,
    version: SAFE_SCHEDULE_VERSION,
    privacy: Object.fromEntries(PRIVACY_KEYS.map((key) => [key, false])) as SafeSchedulePrivacy,
    schedule: {
      sourceId: requireSafeText(schedule.sourceId, "schedule.sourceId"),
      scheduleId: requireSafeText(schedule.scheduleId, "schedule.scheduleId"),
      revision: requireSafeText(schedule.revision, "schedule.revision"),
      timezone,
      effectiveStart,
      effectiveEnd,
      calendarWeekRule: normalizeCalendarWeekRule(schedule.calendarWeekRule, timezone),
      equipment: normalizeEquipment(schedule.equipment),
      timeBlocks: normalizeTimeBlocks(schedule.timeBlocks),
      collisionWarnings: normalizeCollisionWarnings(schedule.collisionWarnings),
    },
  };
}

export function parseSafeScheduleBundleJson(raw: string, byteLength?: number): SafeScheduleParseResult {
  const measuredBytes = byteLength ?? new TextEncoder().encode(raw).byteLength;
  if (measuredBytes > MAX_SAFE_SCHEDULE_FILE_BYTES) {
    return { ok: false, error: "Schedule file is too large for this private local importer." };
  }
  try {
    return { ok: true, value: normalizeSafeScheduleBundle(JSON.parse(raw) as unknown) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ScheduleValidationError ? error.message : "Schedule file is not valid JSON.",
    };
  }
}

export function isSafeScheduleBundle(value: unknown): value is SafeScheduleBundleV1 {
  try {
    normalizeSafeScheduleBundle(value);
    return true;
  } catch {
    return false;
  }
}

export function emptySafeScheduleStorage(): SafeScheduleStorage {
  return { version: SAFE_SCHEDULE_STORAGE_VERSION, bundle: null, scheduleGroupByClassId: {}, manualWeekByDate: {} };
}

export function normalizeSafeScheduleStorage(value: unknown): SafeScheduleStorage | null {
  try {
    const storage = requireRecord(value, "Safe schedule storage");
    requireOnlyKeys(storage, STORAGE_KEYS, "Safe schedule storage");
    if (storage.version !== SAFE_SCHEDULE_STORAGE_VERSION) return null;
    const bundle = storage.bundle === null ? null : normalizeSafeScheduleBundle(storage.bundle);
    const mappingsValue = requireRecord(storage.scheduleGroupByClassId, "scheduleGroupByClassId");
    const manualValue = requireRecord(storage.manualWeekByDate, "manualWeekByDate");
    const groups = new Set(bundle ? safeScheduleGroups(bundle) : []);
    const scheduleGroupByClassId: Record<string, string> = {};
    for (const [classId, groupValue] of Object.entries(mappingsValue)) {
      if (!SAFE_LOCAL_ID.test(classId) || classId.length > 120) return null;
      const group = requireSafeText(groupValue, `scheduleGroupByClassId.${classId}`);
      if (!groups.has(group)) return null;
      scheduleGroupByClassId[classId] = group;
    }
    const manualWeekByDate: Record<string, ScheduleWeek> = {};
    for (const [date, week] of Object.entries(manualValue)) {
      isoDateParts(date, `manualWeekByDate.${date}`);
      if (week !== "Odd" && week !== "Even") return null;
      manualWeekByDate[date] = week;
    }
    return { version: SAFE_SCHEDULE_STORAGE_VERSION, bundle, scheduleGroupByClassId, manualWeekByDate };
  } catch {
    return null;
  }
}

export function isSafeScheduleStorage(value: unknown): value is SafeScheduleStorage {
  return normalizeSafeScheduleStorage(value) !== null;
}

export function replaceSafeScheduleBundle(current: SafeScheduleStorage, bundle: SafeScheduleBundleV1): SafeScheduleStorage {
  const normalized = normalizeSafeScheduleBundle(bundle);
  const validGroups = new Set(safeScheduleGroups(normalized));
  return {
    version: SAFE_SCHEDULE_STORAGE_VERSION,
    bundle: normalized,
    scheduleGroupByClassId: Object.fromEntries(
      Object.entries(current.scheduleGroupByClassId).filter(([, group]) => validGroups.has(group)),
    ),
    manualWeekByDate: { ...current.manualWeekByDate },
  };
}

export function setSafeScheduleClassGroup(storage: SafeScheduleStorage, classId: string, group: string | null): SafeScheduleStorage | null {
  if (!SAFE_LOCAL_ID.test(classId) || classId.length > 120) return null;
  const mappings = { ...storage.scheduleGroupByClassId };
  if (group === null || group === "") delete mappings[classId];
  else if (!storage.bundle || !safeScheduleGroups(storage.bundle).includes(group)) return null;
  else mappings[classId] = group;
  return { ...storage, scheduleGroupByClassId: mappings };
}

export function setSafeScheduleManualWeek(storage: SafeScheduleStorage, date: string, week: ScheduleWeek | null): SafeScheduleStorage | null {
  try {
    isoDateParts(date, "date");
  } catch {
    return null;
  }
  const manualWeekByDate = { ...storage.manualWeekByDate };
  if (week === null) delete manualWeekByDate[date];
  else manualWeekByDate[date] = week;
  return { ...storage, manualWeekByDate };
}

export function safeScheduleGroups(bundle: SafeScheduleBundleV1): string[] {
  return [...new Set(bundle.schedule.timeBlocks.map((block) => block.group))].sort((first, second) => first.localeCompare(second));
}

/**
 * Offers a reviewable schedule-group suggestion without relaxing the exact
 * mapping contract. A local group may link to the identical schedule group,
 * or to one unambiguous explicitly suffixed schedule group (for example,
 * "B4" to "B4-6" or "B4/6"). Callers must still pass the returned value
 * through setSafeScheduleClassGroup before storing it.
 */
export function suggestSafeScheduleGroup(localGroup: string, availableGroups: readonly string[]): string | null {
  if (availableGroups.includes(localGroup)) return localGroup;

  const explicitExpansions = availableGroups.filter((group) => (
    group.startsWith(`${localGroup}-`) || group.startsWith(`${localGroup}/`)
  ));
  return explicitExpansions.length === 1 ? explicitExpansions[0] : null;
}

function scheduleDayForDate(date: string): ScheduleDay {
  const { year, month, day } = isoDateParts(date, "date");
  const sundayFirst = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"] as const)[sundayFirst];
}

export function scheduleMonthWeekOrdinal(date: string): number {
  const { year, month, day } = isoDateParts(date, "date");
  const firstSundayFirst = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysFromMonday = (firstSundayFirst + 6) % 7;
  return Math.floor((daysFromMonday + day - 1) / 7) + 1;
}

export function resolveSafeScheduleDay(
  bundle: SafeScheduleBundleV1,
  date: string,
  group: string | null,
  manualWeek: ScheduleWeek | null = null,
): SafeScheduleDayResolution {
  isoDateParts(date, "date");
  const day = scheduleDayForDate(date);
  const monthWeekOrdinal = scheduleMonthWeekOrdinal(date);
  const rule = bundle.schedule.calendarWeekRule;
  let resolvedWeek: ScheduleWeek | null = null;
  if (monthWeekOrdinal >= 5 && rule.weekFiveOrLaterRequiresManualConfirmation) resolvedWeek = manualWeek;
  else if (rule.oddWeekOrdinals.includes(monthWeekOrdinal)) resolvedWeek = "Odd";
  else if (rule.evenWeekOrdinals.includes(monthWeekOrdinal)) resolvedWeek = "Even";
  else if (manualWeek) resolvedWeek = manualWeek;
  const inRange = (!bundle.schedule.effectiveStart || date >= bundle.schedule.effectiveStart)
    && (!bundle.schedule.effectiveEnd || date <= bundle.schedule.effectiveEnd);
  const allDayBlocks = inRange && resolvedWeek
    ? bundle.schedule.timeBlocks.filter((block) => block.day === day && block.week === resolvedWeek)
    : [];
  const groupBlocks = group ? allDayBlocks.filter((block) => block.group === group) : [];
  const status: SafeScheduleDayResolution["status"] = !inRange
    ? "outside_schedule_range"
    : !resolvedWeek && rule.weekFiveOrLaterRequiresManualConfirmation
      ? "manual_week_confirmation_required"
      : !group
        ? "group_required"
        : !groupBlocks.length
          ? "no_blocks_for_group"
          : "ready";
  return {
    status,
    date,
    day,
    monthWeekOrdinal,
    resolvedWeek,
    group,
    allDayBlocks,
    groupBlocks,
    nonOpenBlocks: groupBlocks.filter((block) => block.activityType !== "open"),
    openBlocks: groupBlocks.filter((block) => block.activityType === "open"),
  };
}

type SemanticZoneRecord = {
  id: string;
  aliases?: string[];
  childZoneIds?: string[];
};

type SemanticCompositeRecord = {
  aliases?: string[];
  memberZoneIds?: string[];
};

const scheduleAliasToSemanticZoneIds = (() => {
  const registry = gymMapSemantics as { zones: SemanticZoneRecord[]; compositeGroups: SemanticCompositeRecord[] };
  const aliases = new Map<string, Set<string>>();
  const add = (alias: string, zoneIds: string[]) => {
    const current = aliases.get(alias) ?? new Set<string>();
    zoneIds.forEach((zoneId) => current.add(zoneId));
    aliases.set(alias, current);
  };
  registry.zones.forEach((zone) => zone.aliases?.forEach((alias) => add(alias, zone.childZoneIds?.length ? zone.childZoneIds : [zone.id])));
  registry.compositeGroups.forEach((group) => group.aliases?.forEach((alias) => add(alias, group.memberZoneIds ?? [])));
  return new Map([...aliases].map(([alias, zoneIds]) => [alias, [...zoneIds].sort()]));
})();

export function semanticZoneIdsForScheduleEquipment(token: string): string[] {
  return [...(scheduleAliasToSemanticZoneIds.get(token) ?? [])];
}

function calculateAreaAvailability(
  resolution: SafeScheduleDayResolution,
  interval: SafeScheduleInterval,
  candidatePanelIds: readonly string[],
): Omit<IntervalAreaAvailability, "startMinute" | "endMinute"> {
  const occupiedSemanticZoneIds = new Set<string>();
  const unmappedEquipment = new Set<string>();
  resolution.allDayBlocks
    .filter((block) => block.activityType !== "open"
      && block.equipment.length > 0
      && block.startMinute < interval.endMinute
      && block.endMinute > interval.startMinute)
    .forEach((block) => block.equipment.forEach((token) => {
      const zoneIds = semanticZoneIdsForScheduleEquipment(token);
      if (!zoneIds.length) unmappedEquipment.add(token);
      else zoneIds.forEach((zoneId) => occupiedSemanticZoneIds.add(zoneId));
    }));
  const availablePanelIds: string[] = [];
  const unavailablePanelIds: string[] = [];
  candidatePanelIds.forEach((panelId) => {
    const layout = gymPanelLayout(panelId);
    if (!layout || layout.semanticZoneIds.some((zoneId) => occupiedSemanticZoneIds.has(zoneId))) unavailablePanelIds.push(panelId);
    else availablePanelIds.push(panelId);
  });
  return {
    occupiedSemanticZoneIds: [...occupiedSemanticZoneIds].sort(),
    availablePanelIds,
    unavailablePanelIds,
    unmappedEquipment: [...unmappedEquipment].sort(),
  };
}

/**
 * Calculates all-gym availability for a lesson event's full interval.
 *
 * A null result is unknown availability: callers must not treat it as a free
 * gym. The date, linked group, and week must already resolve to a ready local
 * schedule, and the event must use a forward five-minute window.
 */
export function resolveAreaAvailabilityForInterval(
  resolution: SafeScheduleDayResolution,
  interval: SafeScheduleInterval,
  candidatePanelIds: readonly string[],
): IntervalAreaAvailability | null {
  if (resolution.status !== "ready" || !isSafeScheduleInterval(interval)) return null;
  return {
    startMinute: interval.startMinute,
    endMinute: interval.endMinute,
    ...calculateAreaAvailability(resolution, interval, candidatePanelIds),
  };
}

export function resolveOpenAreaAvailability(
  resolution: SafeScheduleDayResolution,
  openBlock: SafeScheduleTimeBlock,
  candidatePanelIds: readonly string[],
): OpenAreaAvailability {
  if (openBlock.activityType !== "open") throw new Error("Availability can be calculated only for an explicit Open block.");
  return {
    bookingId: openBlock.bookingId,
    ...calculateAreaAvailability(resolution, openBlock, candidatePanelIds),
  };
}

export function panelSelectionsConflict(firstPanelId: string, secondPanelId: string): boolean {
  const first = gymPanelLayout(firstPanelId)?.semanticZoneIds ?? [];
  const second = new Set(gymPanelLayout(secondPanelId)?.semanticZoneIds ?? []);
  return first.some((zoneId) => second.has(zoneId));
}

export function openPanelSelectionAllowed(selectedPanelIds: readonly string[], candidatePanelId: string): boolean {
  return !selectedPanelIds.some((selectedPanelId) => selectedPanelId !== candidatePanelId && panelSelectionsConflict(selectedPanelId, candidatePanelId));
}

export function normalizeOpenPanelSelection(selectedPanelIds: readonly string[], availablePanelIds: readonly string[]): string[] {
  const available = new Set(availablePanelIds);
  const normalized: string[] = [];
  selectedPanelIds.forEach((panelId) => {
    if (available.has(panelId) && !normalized.includes(panelId) && openPanelSelectionAllowed(normalized, panelId)) normalized.push(panelId);
  });
  return normalized;
}
