import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_LESSON_GOALS, loadDefaultLessonGoals } from "../app/lesson-goals";

test("Load Default Goals only fills blank lesson goals", () => {
  assert.equal(loadDefaultLessonGoals(""), DEFAULT_LESSON_GOALS);
  assert.equal(loadDefaultLessonGoals("   "), DEFAULT_LESSON_GOALS);
  assert.equal(loadDefaultLessonGoals("Coach one clean shape."), "Coach one clean shape.");
});
