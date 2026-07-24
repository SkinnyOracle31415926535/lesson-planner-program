import assert from "node:assert/strict";
import test from "node:test";
import {
  createLessonScheduleTemplate,
  type LessonScheduleTemplateSafeDay,
} from "../app/lesson-schedule-template";
import type { LocalClass, LocalScheduleBlock } from "../app/local-classes";
import type { SafeScheduleTimeBlock } from "../app/local-schedule";

const timestamp = "2026-07-20T12:00:00.000Z";

function localClass(schedule: LocalScheduleBlock[]): LocalClass {
  return {
    id: "class-level-3",
    name: "Level 3 Boys",
    students: [],
    schedule,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function safeBlock(overrides: Partial<SafeScheduleTimeBlock> = {}): SafeScheduleTimeBlock {
  return {
    bookingId: "safe-default",
    day: "Mon",
    week: "Even",
    group: "Level 3 Boys",
    startMinute: 930,
    endMinute: 960,
    canonicalEventLabel: "Bars",
    eventLabel: "Bars",
    equipment: ["PB/HB"],
    activityType: "rotation",
    confidence: "high",
    reviewStatus: "auto_extracted",
    ...overrides,
  };
}

function safeDay(
  status: LessonScheduleTemplateSafeDay["status"],
  nonOpenBlocks: SafeScheduleTimeBlock[],
): LessonScheduleTemplateSafeDay {
  return { status, nonOpenBlocks };
}

test("safe non-Open blocks take priority, sort by time, and create empty phase shells", () => {
  const result = createLessonScheduleTemplate({
    lessonDate: "2026-07-20",
    selectedClass: localClass([{ id: "local-floor", day: "Monday", start: "3:30 PM", end: "4:00 PM", event: "Floor" }]),
    safeScheduleDay: safeDay("ready", [
      safeBlock({ bookingId: "late", startMinute: 960, endMinute: 990, eventLabel: "Bars" }),
      safeBlock({ bookingId: "open", startMinute: 900, endMinute: 930, eventLabel: "Open", activityType: "open" }),
      safeBlock({ bookingId: "early", startMinute: 900, endMinute: 930, eventLabel: "Warm-up", activityType: "warmup" }),
    ]),
  });

  assert.equal(result.source, "safe-schedule");
  assert.equal(result.status, "ready");
  assert.equal(result.safeScheduleStatus, "ready");
  assert.deepEqual(result.phases.map((phase) => ({
    id: phase.id,
    eventId: phase.eventId,
    eventLabel: phase.eventLabel,
    title: phase.title,
    time: phase.time,
  })), [
    {
      id: "schedule-safe-early",
      eventId: "schedule-safe-early",
      eventLabel: "Level 3 Boys",
      title: "Warm-up",
      time: "3:00 PM–3:30 PM",
    },
    {
      id: "schedule-safe-late",
      eventId: "schedule-safe-late",
      eventLabel: "Level 3 Boys",
      title: "Bars",
      time: "4:00 PM–4:30 PM",
    },
  ]);
  assert.ok(result.phases.every((phase) => phase.mode === "VISUAL"
    && phase.zones.length === 0
    && phase.parkedZones?.length === 0
    && phase.text.length === 0
    && phase.textCards?.length === 0));
});

test("matching local class blocks are the fallback when no usable safe blocks are available", () => {
  const result = createLessonScheduleTemplate({
    lessonDate: "2026-07-20",
    selectedClass: localClass([
      { id: "late", day: "Monday", start: "4:00 PM", end: "4:30 PM", event: "Bars" },
      { id: "open", day: "Monday", start: "3:30 PM", end: "3:45 PM", event: "Open" },
      { id: "early", day: "Monday", start: "3:00 PM", end: "3:30 PM", event: "Floor" },
      { id: "other-day", day: "Tuesday", start: "3:00 PM", end: "3:30 PM", event: "Ignored" },
    ]),
    safeScheduleDay: safeDay("ready", []),
  });

  assert.equal(result.source, "local-class");
  assert.equal(result.status, "ready");
  assert.equal(result.safeScheduleStatus, "ready");
  assert.deepEqual(result.phases.map((phase) => [phase.id, phase.eventLabel, phase.title, phase.time]), [
    ["schedule-local-early", "Level 3 Boys", "Floor", "3:00 PM–3:30 PM"],
    ["schedule-local-late", "Level 3 Boys", "Bars", "4:00 PM–4:30 PM"],
  ]);
});

test("returns a UI-useful empty status when a class or matching schedule is unavailable", () => {
  const noClass = createLessonScheduleTemplate({ lessonDate: "2026-07-20", selectedClass: null });
  assert.deepEqual(noClass, {
    source: "none",
    status: "no-class-selected",
    safeScheduleStatus: "not-loaded",
    phases: [],
  });

  const noBlocks = createLessonScheduleTemplate({
    lessonDate: "2026-07-20",
    selectedClass: localClass([{ id: "tuesday", day: "Tuesday", start: "3:00 PM", end: "3:30 PM", event: "Floor" }]),
    safeScheduleDay: safeDay("group_required", []),
  });
  assert.deepEqual(noBlocks, {
    source: "none",
    status: "no-matching-blocks",
    safeScheduleStatus: "group_required",
    phases: [],
  });
});
