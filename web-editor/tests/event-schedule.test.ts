import assert from "node:assert/strict";
import test from "node:test";
import {
  eventScheduleIssues,
  eventSplitStartOptions,
  eventStartOptionsBetween,
  eventWindow,
  insertedEventStartOptions,
  repairEventTimes,
  swapAdjacentEventSlots,
} from "../app/event-schedule";

const floorEvent = {
  id: "floor",
  phases: [
    { id: "floor-warmup", time: "3:30 PM–3:40 PM" },
    { id: "floor-skills", time: "3:40 PM–3:45 PM" },
  ],
};

const barsEvent = {
  id: "bars",
  phases: [
    { id: "bars-low", time: "3:45 PM–3:55 PM" },
    { id: "bars-high", time: "3:55 PM–4:00 PM" },
  ],
};

test("event windows require continuous, forward phase times", () => {
  assert.deepEqual(eventWindow(floorEvent.phases), { start: "15:30", end: "15:45" });
  assert.equal(eventWindow([{ id: "broken", time: "TBD" }]), null);
  assert.equal(eventWindow([
    { id: "first", time: "3:30 PM–3:40 PM" },
    { id: "second", time: "3:45 PM–3:50 PM" },
  ]), null);
});

test("schedule issues identify gaps and overlaps between otherwise valid events", () => {
  const issues = eventScheduleIssues([
    { id: "first", phases: [{ id: "a", time: "3:30 PM–3:45 PM" }] },
    { id: "gap", phases: [{ id: "b", time: "3:50 PM–4:00 PM" }] },
    { id: "overlap", phases: [{ id: "c", time: "3:55 PM–4:10 PM" }] },
    { id: "invalid", phases: [{ id: "d", time: "TBD" }] },
  ]);

  assert.deepEqual(issues, [
    { kind: "invalid", eventId: "invalid" },
    { kind: "gap", eventId: "gap", relatedEventId: "first" },
    { kind: "overlap", eventId: "overlap", relatedEventId: "gap" },
  ]);
});

test("moving an adjacent event swaps complete time slots and keeps its phases continuous", () => {
  const moved = swapAdjacentEventSlots([floorEvent, barsEvent], "bars", "up");

  assert.ok(moved);
  assert.deepEqual(moved.eventOrder, ["bars", "floor"]);
  assert.deepEqual([...moved.timeByPhaseId.entries()], [
    ["bars-low", "3:30 PM–3:40 PM"],
    ["bars-high", "3:40 PM–3:45 PM"],
    ["floor-warmup", "3:45 PM–3:55 PM"],
    ["floor-skills", "3:55 PM–4:00 PM"],
  ]);
});

test("repairing event times removes gaps and overlaps while preserving each event duration", () => {
  const repaired = repairEventTimes([
    { id: "first", phases: [{ id: "a", time: "3:30 PM–3:45 PM" }] },
    {
      id: "second",
      phases: [
        { id: "b1", time: "3:55 PM–4:00 PM" },
        { id: "b2", time: "4:00 PM–4:05 PM" },
      ],
    },
    { id: "third", phases: [{ id: "c", time: "4:00 PM–4:10 PM" }] },
  ]);

  assert.ok(repaired);
  assert.deepEqual([...repaired.entries()], [
    ["a", "3:30 PM–3:45 PM"],
    ["b1", "3:45 PM–3:50 PM"],
    ["b2", "3:50 PM–3:55 PM"],
    ["c", "3:55 PM–4:05 PM"],
  ]);
});

test("new-event start choices stay strictly inside the event being split", () => {
  assert.deepEqual(eventStartOptionsBetween("15:30", "15:45"), ["15:35", "15:40"]);
  assert.deepEqual(eventStartOptionsBetween("15:30", "15:35"), []);
  assert.deepEqual(eventStartOptionsBetween("bad", "15:45"), []);
  assert.deepEqual(insertedEventStartOptions(
    [{ id: "previous", time: "3:30 PM–3:45 PM" }],
    [{ id: "next", time: "3:45 PM–4:00 PM" }],
  ), ["15:35", "15:40"]);
});

test("splitting a multi-phase event only offers starts after its final phase begins", () => {
  const previous = [
    { id: "first", time: "3:30 PM–3:40 PM" },
    { id: "final", time: "3:40 PM–3:55 PM" },
  ];

  assert.deepEqual(eventSplitStartOptions(previous, "16:00"), ["15:45", "15:50", "15:55"]);
  assert.deepEqual(insertedEventStartOptions(
    previous,
    [{ id: "next", time: "4:00 PM–4:15 PM" }],
  ), ["15:45", "15:50", "15:55"]);
});

test("pending events cannot be used as either side of a new-event split", () => {
  const complete = [{ id: "complete", time: "3:30 PM–3:45 PM" }];
  const pending = [{ id: "pending", time: "TBD" }];

  assert.deepEqual(eventSplitStartOptions(pending, "16:00"), []);
  assert.deepEqual(insertedEventStartOptions(complete, pending), []);
});
