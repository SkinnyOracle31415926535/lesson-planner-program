import assert from "node:assert/strict";
import test from "node:test";
import { eventWindow } from "../app/event-schedule";
import type { LessonPhase } from "../app/lesson-data";
import {
  phaseHasCoachPlanningContent,
  reconcileLessonSchedulePhases,
} from "../app/lesson-schedule-reconciliation";

function phase(overrides: Partial<LessonPhase> & Pick<LessonPhase, "id" | "time" | "title">): LessonPhase {
  return {
    eventId: overrides.id,
    eventLabel: "Group",
    mode: "VISUAL",
    zones: [],
    parkedZones: [],
    text: [],
    textCards: [],
    ...overrides,
  };
}

test("schedule reconciliation keeps planning content while taking current schedule structure", () => {
  const current = phase({
    id: "schedule-safe-bars",
    time: "3:30 PM–4:00 PM",
    title: "Old bars",
    mode: "MIXED",
    text: ["Keep shoulders open"],
  });
  const incoming = phase({
    id: "schedule-safe-bars",
    time: "3:45 PM–4:15 PM",
    title: "Bars",
    eventLabel: "BRF/Int",
  });

  const result = reconcileLessonSchedulePhases([current], [incoming]);
  assert.deepEqual(result.phases, [{
    ...incoming,
    mode: "MIXED",
    text: ["Keep shoulders open"],
  }]);
  assert.deepEqual(result.replacementPhaseIdByOldId, { "schedule-safe-bars": "schedule-safe-bars" });
});

test("schedule reconciliation replaces an untouched writable scheduled shell", () => {
  const untouched = phase({
    id: "schedule-safe-old-bars",
    time: "3:00 PM–3:30 PM",
    title: "Bars",
    mode: "MIXED",
    text: [""],
  });
  const incoming = phase({
    id: "schedule-safe-new-bars",
    time: "3:15 PM–3:45 PM",
    title: "Bars",
    mode: "MIXED",
    text: [""],
  });

  assert.equal(phaseHasCoachPlanningContent(untouched), false);

  const result = reconcileLessonSchedulePhases([untouched], [incoming]);
  assert.deepEqual(result.phases, [incoming]);
  assert.equal(result.preservedScheduledCount, 0);
  assert.equal(result.removedEmptyCount, 0);
  assert.deepEqual(result.replacementPhaseIdByOldId, {
    "schedule-safe-old-bars": "schedule-safe-new-bars",
  });
});

test("schedule reconciliation maps a planned local shell into a matching safe shell", () => {
  const current = phase({
    id: "schedule-local-warmup",
    time: "3:00 PM–3:30 PM",
    title: "Warmup",
    mode: "TEXT",
    text: ["Bear walks"],
  });
  const incoming = phase({
    id: "schedule-safe-warmup",
    time: "3:00 PM–3:30 PM",
    title: "Warmup",
    eventLabel: "BRF/Int",
  });

  const result = reconcileLessonSchedulePhases([current], [incoming]);
  assert.equal(result.phases.length, 1);
  assert.equal(result.phases[0]?.id, "schedule-safe-warmup");
  assert.equal(result.phases[0]?.eventLabel, "BRF/Int");
  assert.deepEqual(result.phases[0]?.text, ["Bear walks"]);
  assert.deepEqual(result.replacementPhaseIdByOldId, { "schedule-local-warmup": "schedule-safe-warmup" });
});

test("schedule reconciliation follows a unique same-title schedule revision when its booking and time change", () => {
  const current = phase({
    id: "schedule-safe-old-bars-booking",
    time: "3:00 PM–3:30 PM",
    title: "Bars",
    mode: "MIXED",
    text: ["Keep shoulders open"],
  });
  const incoming = phase({
    id: "schedule-safe-revised-bars-booking",
    time: "3:15 PM–3:45 PM",
    title: "Bars",
    eventLabel: "BRF/Int",
  });

  const result = reconcileLessonSchedulePhases([current], [incoming]);
  assert.equal(result.phases.length, 1);
  assert.deepEqual(result.phases[0], {
    ...incoming,
    mode: "MIXED",
    text: ["Keep shoulders open"],
  });
  assert.deepEqual(result.replacementPhaseIdByOldId, {
    "schedule-safe-old-bars-booking": "schedule-safe-revised-bars-booking",
  });
});

test("schedule reconciliation does not move coaching content onto a renamed same-time event", () => {
  const oldBars = phase({
    id: "schedule-safe-bars",
    time: "3:00 PM–3:30 PM",
    title: "Bars",
    mode: "TEXT",
    text: ["Keep shoulders open"],
  });
  const incomingVault = phase({
    id: "schedule-safe-vault",
    time: "3:00 PM–3:30 PM",
    title: "Vault",
  });

  const result = reconcileLessonSchedulePhases([oldBars], [incomingVault]);
  const vault = result.phases.find((entry) => entry.id === incomingVault.id);
  const bars = result.phases.find((entry) => entry.id === oldBars.id);
  assert.deepEqual(vault?.text, []);
  assert.equal(vault?.mode, "VISUAL");
  assert.deepEqual(bars?.text, ["Keep shoulders open"]);
  assert.deepEqual(result.replacementPhaseIdByOldId, {});
});

test("schedule reconciliation keeps an empty manually added event", () => {
  const manualEvent = phase({
    id: "local-event-empty",
    eventId: "local-event-empty",
    time: "4:00 PM–4:15 PM",
    title: "Coach check-in",
  });
  const incoming = phase({ id: "schedule-safe-floor", time: "3:30 PM–4:00 PM", title: "Floor" });

  const result = reconcileLessonSchedulePhases([manualEvent], [incoming]);
  assert.deepEqual(result.phases.map((entry) => entry.id), [incoming.id, manualEvent.id]);
  assert.equal(result.removedEmptyCount, 0);
});

test("schedule reconciliation re-times every phase of a scheduled event when its window changes", () => {
  const parent = phase({
    id: "schedule-safe-bars",
    eventId: "schedule-safe-bars",
    time: "3:00 PM–3:20 PM",
    title: "Bars",
    mode: "MIXED",
    text: ["Start cue"],
  });
  const child = phase({
    id: "local-phase-bars-finish",
    eventId: "schedule-safe-bars",
    time: "3:20 PM–3:30 PM",
    title: "Bars finish",
    mode: "TEXT",
    text: ["Finish cue"],
  });
  const incoming = phase({
    id: "schedule-safe-bars",
    eventId: "schedule-safe-bars",
    time: "4:00 PM–4:30 PM",
    title: "Bars",
    eventLabel: "BRF/Int",
  });

  const result = reconcileLessonSchedulePhases([parent, child], [incoming]);
  assert.deepEqual(result.phases.map((entry) => [entry.id, entry.eventId, entry.time]), [
    ["schedule-safe-bars", "schedule-safe-bars", "4:00 PM–4:20 PM"],
    ["local-phase-bars-finish", "schedule-safe-bars", "4:20 PM–4:30 PM"],
  ]);
  assert.deepEqual(result.phases.map((entry) => entry.text), [["Start cue"], ["Finish cue"]]);
});

test("schedule reconciliation detaches split coaching phases when a revised block is too short", () => {
  const parent = phase({
    id: "schedule-safe-bars",
    eventId: "schedule-safe-bars",
    time: "3:00 PM–3:10 PM",
    title: "Bars",
  });
  const middle = phase({
    id: "local-phase-bars-middle",
    eventId: "schedule-safe-bars",
    time: "3:10 PM–3:20 PM",
    title: "Bars middle",
    mode: "TEXT",
    text: ["Middle cue"],
  });
  const finish = phase({
    id: "local-phase-bars-finish",
    eventId: "schedule-safe-bars",
    time: "3:20 PM–3:30 PM",
    title: "Bars finish",
    mode: "TEXT",
    text: ["Finish cue"],
  });
  const incoming = phase({
    id: "schedule-safe-bars",
    eventId: "schedule-safe-bars",
    time: "4:00 PM–4:05 PM",
    title: "Bars",
  });

  const result = reconcileLessonSchedulePhases([parent, middle, finish], [incoming]);
  const scheduled = result.phases.find((entry) => entry.id === parent.id)!;
  const detached = result.phases.filter((entry) => entry.id !== parent.id);
  assert.equal(scheduled.time, incoming.time);
  assert.equal(detached.length, 2);
  assert.notEqual(detached[0]?.eventId, scheduled.eventId);
  assert.equal(detached[0]?.eventId, detached[1]?.eventId);
  assert.deepEqual(detached.map((entry) => entry.text), [["Middle cue"], ["Finish cue"]]);
  assert.deepEqual(eventWindow([scheduled]), { start: "16:00", end: "16:05" });
  assert.deepEqual(eventWindow(detached), { start: "15:10", end: "15:30" });
});

test("schedule reconciliation keeps a pending in-between event directly before its end boundary", () => {
  const first = phase({ id: "schedule-safe-first", time: "3:00 PM–3:30 PM", title: "Floor" });
  const pending = phase({
    id: "local-event-pending",
    eventId: "local-event-pending",
    time: "TBD",
    pendingEventEnd: "15:30",
    title: "New event",
    mode: "TEXT",
  });
  const next = phase({ id: "schedule-safe-next", time: "3:30 PM–4:00 PM", title: "Bars" });

  const result = reconcileLessonSchedulePhases([first, pending, next], [first, next]);
  assert.deepEqual(result.phases.map((entry) => entry.id), [first.id, pending.id, next.id]);
});

test("schedule reconciliation follows a uniquely revised pending-event boundary", () => {
  const first = phase({ id: "schedule-safe-first", time: "3:00 PM–3:30 PM", title: "Floor" });
  const oldNext = phase({ id: "schedule-safe-next", time: "3:30 PM–4:00 PM", title: "Bars" });
  const pending = phase({
    id: "local-event-pending",
    eventId: "local-event-pending",
    time: "TBD",
    pendingEventEnd: "15:30",
    title: "New event",
    mode: "TEXT",
  });
  const revisedNext = phase({ id: "schedule-safe-next", time: "3:45 PM–4:15 PM", title: "Bars" });

  const result = reconcileLessonSchedulePhases([first, pending, oldNext], [first, revisedNext]);
  assert.deepEqual(result.phases.map((entry) => entry.id), [first.id, pending.id, revisedNext.id]);
  assert.equal(result.phases.find((entry) => entry.id === pending.id)?.pendingEventEnd, "15:45");
});

test("schedule reconciliation keeps Open and manual phases in chronological order", () => {
  const safeEarly = phase({ id: "schedule-safe-early", time: "4:00 PM–4:15 PM", title: "F6" });
  const safeLate = phase({ id: "schedule-safe-late", time: "4:30 PM–4:40 PM", title: "PH" });
  const open = phase({
    id: "local-open-f6",
    time: "4:15 PM–4:25 PM",
    title: "Open",
    mode: "VISUAL",
    zones: [{ id: "f6", title: "F6", alias: "F6", note: "", people: "", cards: [] }],
  });
  const manual = phase({ id: "local-warmup", time: "3:00 PM–3:30 PM", title: "Warmup", mode: "TEXT", text: ["Coach cue"] });
  const emptyOldShell = phase({ id: "schedule-local-old", time: "3:30 PM–4:00 PM", title: "Old" });

  const result = reconcileLessonSchedulePhases([open, manual, emptyOldShell], [safeEarly, safeLate]);
  assert.deepEqual(result.phases.map((entry) => [entry.id, entry.time]), [
    ["local-warmup", "3:00 PM–3:30 PM"],
    ["schedule-safe-early", "4:00 PM–4:15 PM"],
    ["local-open-f6", "4:15 PM–4:25 PM"],
    ["schedule-safe-late", "4:30 PM–4:40 PM"],
  ]);
  assert.equal(result.removedEmptyCount, 1);
});

test("schedule reconciliation leaves an unmatched planned TBD phase last", () => {
  const pending = phase({ id: "local-pending", time: "TBD", title: "Coach review", mode: "TEXT", text: ["Assign later"] });
  const scheduled = phase({ id: "schedule-safe-floor", time: "4:00 PM–4:20 PM", title: "Floor" });

  const result = reconcileLessonSchedulePhases([pending], [scheduled]);
  assert.deepEqual(result.phases.map((entry) => entry.id), ["schedule-safe-floor", "local-pending"]);
});
