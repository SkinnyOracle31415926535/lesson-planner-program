import type { LessonPhase } from "./lesson-data";
import {
  localScheduleBlocksForLessonDate,
  parseLocalScheduleTime,
  type LocalClass,
  type LocalScheduleBlock,
} from "./local-classes";
import type { SafeScheduleDayResolution, SafeScheduleTimeBlock } from "./local-schedule";

export type LessonScheduleTemplateSource = "safe-schedule" | "local-class" | "none";
export type LessonScheduleTemplateStatus = "ready" | "no-class-selected" | "no-matching-blocks";
export type LessonScheduleTemplateSafeDay = Pick<SafeScheduleDayResolution, "status" | "nonOpenBlocks">;

export type LessonScheduleTemplate = {
  source: LessonScheduleTemplateSource;
  status: LessonScheduleTemplateStatus;
  /** Lets the UI explain why a local-class fallback was used. */
  safeScheduleStatus: SafeScheduleDayResolution["status"] | "not-loaded";
  phases: LessonPhase[];
};

export type LessonScheduleTemplateInput = {
  lessonDate: string;
  selectedClass: LocalClass | null;
  safeScheduleDay?: LessonScheduleTemplateSafeDay | null;
};

function formatScheduleMinute(minute: number): string {
  const normalized = ((minute % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minutePart = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutePart).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

function formatScheduleRange(startMinute: number, endMinute: number): string {
  return `${formatScheduleMinute(startMinute)}–${formatScheduleMinute(endMinute)}`;
}

function blankPhase(
  id: string,
  time: string,
  eventLabel: string,
  title: string,
): LessonPhase {
  return {
    id,
    time,
    eventId: id,
    eventLabel,
    title,
    // A scheduled block should be ready for a coach to type into as soon as
    // it is selected. Keep the visual canvas available too, but seed one
    // blank text input rather than making the coach switch formats first.
    mode: "MIXED",
    zones: [],
    parkedZones: [],
    text: [""],
    textCards: [],
  };
}

function compareSafeBlocks(first: SafeScheduleTimeBlock, second: SafeScheduleTimeBlock): number {
  return first.startMinute - second.startMinute
    || first.endMinute - second.endMinute
    || first.bookingId.localeCompare(second.bookingId);
}

function compareLocalBlocks(first: LocalScheduleBlock, second: LocalScheduleBlock): number {
  const firstStart = parseLocalScheduleTime(first.start) ?? Number.MAX_SAFE_INTEGER;
  const secondStart = parseLocalScheduleTime(second.start) ?? Number.MAX_SAFE_INTEGER;
  const firstEnd = parseLocalScheduleTime(first.end) ?? Number.MAX_SAFE_INTEGER;
  const secondEnd = parseLocalScheduleTime(second.end) ?? Number.MAX_SAFE_INTEGER;
  return firstStart - secondStart || firstEnd - secondEnd || first.id.localeCompare(second.id);
}

function isOpenLocalBlock(block: LocalScheduleBlock): boolean {
  return block.event.trim().toLocaleLowerCase() === "open";
}

function phaseForSafeBlock(block: SafeScheduleTimeBlock): LessonPhase {
  const id = `schedule-safe-${block.bookingId}`;
  return blankPhase(id, formatScheduleRange(block.startMinute, block.endMinute), block.group, block.eventLabel);
}

function phaseForLocalBlock(localClass: LocalClass, block: LocalScheduleBlock): LessonPhase {
  const id = `schedule-local-${block.id}`;
  const startMinute = parseLocalScheduleTime(block.start);
  const endMinute = parseLocalScheduleTime(block.end);
  const time = startMinute !== null && endMinute !== null
    ? formatScheduleRange(startMinute, endMinute)
    : `${block.start}–${block.end}`;
  return blankPhase(id, time, localClass.name, block.event);
}

/**
 * Creates a clean phase structure from the selected class and lesson date.
 * Safe-schedule blocks take priority only when their day resolution is ready;
 * scheduled Open time is intentionally excluded so it remains coach-chosen.
 */
export function createLessonScheduleTemplate({
  lessonDate,
  selectedClass,
  safeScheduleDay = null,
}: LessonScheduleTemplateInput): LessonScheduleTemplate {
  const safeScheduleStatus = safeScheduleDay?.status ?? "not-loaded";
  const safeBlocks = safeScheduleDay?.status === "ready"
    ? [...safeScheduleDay.nonOpenBlocks]
      .filter((block) => block.activityType !== "open")
      .sort(compareSafeBlocks)
    : [];
  if (safeBlocks.length) {
    return {
      source: "safe-schedule",
      status: "ready",
      safeScheduleStatus,
      phases: safeBlocks.map(phaseForSafeBlock),
    };
  }

  const localBlocks = selectedClass
    ? localScheduleBlocksForLessonDate(selectedClass.schedule, lessonDate)
      .filter((block) => !isOpenLocalBlock(block))
      .sort(compareLocalBlocks)
    : [];
  if (localBlocks.length && selectedClass) {
    return {
      source: "local-class",
      status: "ready",
      safeScheduleStatus,
      phases: localBlocks.map((block) => phaseForLocalBlock(selectedClass, block)),
    };
  }

  return {
    source: "none",
    status: selectedClass ? "no-matching-blocks" : "no-class-selected",
    safeScheduleStatus,
    phases: [],
  };
}
