import assert from "node:assert/strict";
import test from "node:test";
import type { LessonCard, LessonPhase, ZonePanel } from "../app/lesson-data";
import {
  generatePlannerUpdates,
  type PlannerScheduleAvailability,
} from "../app/planner-updates";

function card(overrides: Partial<LessonCard> = {}): LessonCard {
  return {
    id: "card-1",
    kind: "DRILL",
    title: "Handstand shapes",
    description: "A local card",
    tags: [],
    accent: "green",
    ...overrides,
  };
}

function zone(overrides: Partial<ZonePanel> = {}): ZonePanel {
  return {
    id: "f1",
    title: "FLOOR 1",
    alias: "F1",
    note: "",
    people: "",
    cards: [],
    ...overrides,
  };
}

function phase(overrides: Partial<LessonPhase> = {}): LessonPhase {
  return {
    id: "phase-1",
    eventId: "event-1",
    eventLabel: "Event 1",
    title: "Floor",
    time: "3:30 PM–3:45 PM",
    mode: "VISUAL",
    zones: [zone({ cards: [card()] })],
    text: [],
    ...overrides,
  };
}

function rules(phases: readonly LessonPhase[], schedule?: PlannerScheduleAvailability | null) {
  return generatePlannerUpdates({ phases, schedule }).map((update) => update.rule);
}

test("flags event and within-event timing problems with no schedule dependency", () => {
  const updates = generatePlannerUpdates({
    phases: [
      phase({ id: "first", eventId: "first-event", eventLabel: "First", time: "3:30 PM–3:45 PM" }),
      phase({ id: "second", eventId: "second-event", eventLabel: "Second", time: "3:40 PM–4:00 PM" }),
      phase({ id: "third", eventId: "third-event", eventLabel: "Third", time: "4:10 PM–4:30 PM" }),
      phase({ id: "part-one", eventId: "split-event", eventLabel: "Split", time: "4:30 PM–4:40 PM" }),
      phase({ id: "part-two", eventId: "split-event", eventLabel: "Split", title: "Landing", time: "4:45 PM–4:55 PM" }),
    ],
  });

  assert.deepEqual(
    updates.filter((update) => update.rule.includes("time-")).map((update) => update.rule),
    ["event-time-overlap", "phase-time-gap", "event-time-gap"],
  );
  assert.equal(updates.find((update) => update.rule === "event-time-overlap")?.priority, "URGENT");
  assert.match(updates.find((update) => update.rule === "phase-time-gap")?.summary ?? "", /5 minutes/);
});

test("flags only explicit missing plan pieces and does not mutate the lesson", () => {
  const incomplete = phase({
    id: "incomplete",
    eventId: "incomplete-event",
    title: "",
    time: "TBD",
    zones: [],
    text: [],
    note: "Coach note only",
  });
  const before = structuredClone(incomplete);
  const updates = generatePlannerUpdates({ phases: [incomplete] });

  assert.deepEqual(rules([incomplete]), ["invalid-phase-time", "missing-phase-title", "missing-phase-plan"]);
  assert.deepEqual(incomplete, before);
  assert.equal(updates.find((update) => update.rule === "missing-phase-plan")?.summary.includes("Notes alone"), true);
});

test("surfaces only explicit safety and setup data", () => {
  const updates = generatePlannerUpdates({
    phases: [phase({
      id: "explicit-cues",
      text: ["Safety: Confirm landing lane is clear."],
      note: "Setup: Put panel mats at the landing.",
      zones: [zone({ cards: [
        card({ id: "safe-card", safety: "Coach spots the first progression.", mats: ["8-inch mat", "Panel mat", "Panel mat"] }),
        card({ id: "ordinary-card", title: "Ordinary drill" }),
      ] })],
    })],
  });

  assert.deepEqual(
    updates.filter((update) => update.rule.startsWith("explicit-")).map((update) => update.rule),
    ["explicit-phase-cue", "explicit-phase-cue", "explicit-card-safety", "explicit-card-mats"],
  );
  assert.match(updates.find((update) => update.rule === "explicit-card-mats")?.summary ?? "", /8-inch mat, Panel mat/);
  assert.equal(updates.some((update) => update.title.includes("Ordinary drill")), false);
});

test("uses caller-provided schedule advisories without calculating or reserving availability", () => {
  const schedule: PlannerScheduleAvailability = {
    status: "ready",
    collisionWarningCount: 2,
    eventConflicts: [{ eventId: "event-1", unavailablePanelIds: ["f1", "vault"] }],
  };
  const updates = generatePlannerUpdates({ phases: [phase()], schedule });

  assert.deepEqual(
    updates.filter((update) => update.rule.startsWith("schedule-")).map((update) => update.rule),
    ["schedule-collision-warning", "schedule-event-conflict"],
  );
  assert.match(updates.find((update) => update.rule === "schedule-event-conflict")?.summary ?? "", /advisory only/i);
  assert.deepEqual(
    rules([phase()], { status: "not_linked" }),
    ["schedule-not-ready"],
  );
});

test("gives the same local rule input stable ids and revisions", () => {
  const input = { phases: [phase({ id: "stable", eventId: "stable-event", time: "TBD", zones: [] })] };
  assert.deepEqual(generatePlannerUpdates(input), generatePlannerUpdates(input));
});
