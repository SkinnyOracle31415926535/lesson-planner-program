import assert from "node:assert/strict";
import test from "node:test";

import {
  IDEA_EVENT_OPTIONS,
  addIdeaEvent,
  normalizeIdeaEvents,
  toggleIdeaEvent,
} from "../app/idea-events";

test("uses the approved standard event order", () => {
  assert.deepEqual(IDEA_EVENT_OPTIONS, ["VAULT", "BARS", "BEAM", "FLOOR", "TRAMPOLINE", "TUMBLE TRACK"]);
});

test("preserves custom events while normalizing equivalent values", () => {
  assert.deepEqual(normalizeIdeaEvents("Vault, vault\nTumble Track, tumble-track, Open Gym"), ["Vault", "Tumble Track", "Open Gym"]);
  assert.deepEqual(normalizeIdeaEvents(["Vault", "Open Gym", "open-gym", "Team Event"]), ["Vault", "Open Gym", "Team Event"]);
  assert.deepEqual(toggleIdeaEvent(["Vault", "Open Gym"], "VAULT"), ["Open Gym"]);
  assert.deepEqual(addIdeaEvent(["Vault", "Open Gym"], "vault"), ["Vault", "Open Gym"]);
});
