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

test("choosing a later phase start closes the prior phase and deleting restores its end", () => {
  const split = reflowEventPhaseStart(pending, "new", "15:40");
  assert.deepEqual(split, [
    { id: "first", time: "3:30 PM–3:40 PM" },
    { id: "new", time: "3:40 PM–3:45 PM" },
  ]);
  assert.deepEqual(removeEventPhaseTiming(split, "new"), [{ id: "first", time: "3:30 PM–3:45 PM" }]);
});
