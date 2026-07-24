import assert from "node:assert/strict";
import test from "node:test";
import {
  canAppendEventPhase,
  eventPhaseEnd,
  eventPhaseStartOptions,
  reflowEventPhaseStart,
  removeEventPhaseTiming,
} from "../app/event-phase-timing";

const single = [{ id: "first", time: "3:30 PM–3:45 PM" }];
const pending = [...single, { id: "new", time: "TBD" }];

test("a pending appended phase keeps the original event end and offers only in-window starts", () => {
  assert.equal(eventPhaseEnd(pending, 1), "15:45");
  assert.deepEqual(eventPhaseStartOptions(pending, 1), ["15:35", "15:40"]);
  assert.equal(canAppendEventPhase(single), true);
  assert.equal(canAppendEventPhase([{ id: "short", time: "3:30 PM–3:35 PM" }]), false);
});

test("an event can only append when its final phase can be split, and deleting a pending phase keeps the event intact", () => {
  const shortFinalPhase = [
    { id: "first", time: "3:30 PM–3:40 PM" },
    { id: "final", time: "3:40 PM–3:45 PM" },
  ];

  assert.equal(canAppendEventPhase(shortFinalPhase), false);
  assert.equal(canAppendEventPhase([...shortFinalPhase, { id: "pending", time: "TBD" }]), false);
  assert.equal(canAppendEventPhase([{ id: "pending", time: "TBD" }, { id: "final", time: "3:30 PM–3:40 PM" }]), false);
  assert.deepEqual(removeEventPhaseTiming(pending, "new"), single);
});

test("choosing a later phase start closes the prior phase and deleting restores its end", () => {
  const split = reflowEventPhaseStart(pending, "new", "15:40");
  assert.deepEqual(split, [
    { id: "first", time: "3:30 PM–3:40 PM" },
    { id: "new", time: "3:40 PM–3:45 PM" },
  ]);
  assert.deepEqual(removeEventPhaseTiming(split, "new"), [{ id: "first", time: "3:30 PM–3:45 PM" }]);
});
