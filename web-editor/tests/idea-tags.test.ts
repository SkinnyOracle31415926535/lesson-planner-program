import assert from "node:assert/strict";
import test from "node:test";

import {
  ideaTagKey,
  ideaTagOptions,
  normalizeIdeaTags,
  toggleIdeaTag,
} from "../app/idea-tags";

test("normalizes obvious duplicate Idea tag spellings only when saving", () => {
  assert.deepEqual(normalizeIdeaTags("Warm Up, warm-up\nWARMUP, Floor"), ["Warm Up", "Floor"]);
  assert.equal(ideaTagKey("warm up"), ideaTagKey("WARM-UP"));
});

test("derives reusable tag choices and toggles by canonical key", () => {
  const choices = ideaTagOptions([
    { tags: ["Warm Up", "Floor"] },
    { tags: ["warm-up", "Bars"] },
  ]);
  assert.deepEqual(choices.map((choice) => [choice.label, choice.count]), [["Warm Up", 2], ["Bars", 1], ["Floor", 1]]);
  assert.deepEqual(toggleIdeaTag(["Warm Up", "Floor"], "warm-up"), ["Floor"]);
  assert.deepEqual(toggleIdeaTag(["Floor"], "Warm-Up"), ["Floor", "Warm-Up"]);
});
