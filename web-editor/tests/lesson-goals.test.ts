import assert from "node:assert/strict";
import test from "node:test";

import {
  LEVEL_3_DEFAULT_CLASS_ID,
  LEVEL_3_STANDARD_GOALS,
  SAMPLE_LEVEL_3_DEFAULT_CLASS_ID,
  addGeneralClassGoal,
  appendSelectedGoals,
  classDefaultGoalIds,
  classDefaultGoalText,
  emptyLessonGoalPreferences,
  isLessonGoalPreferences,
  removeGeneralClassGoal,
  selectedGoalText,
  setClassDefaultGoalIds,
  updateGeneralClassGoal,
} from "../app/lesson-goals";

test("Level 3 starts with the two existing standard goals as class defaults", () => {
  const preferences = emptyLessonGoalPreferences();
  assert.deepEqual(
    classDefaultGoalIds(preferences, LEVEL_3_DEFAULT_CLASS_ID),
    LEVEL_3_STANDARD_GOALS.map((goal) => goal.id),
  );
  assert.equal(
    classDefaultGoalText(preferences, LEVEL_3_DEFAULT_CLASS_ID),
    LEVEL_3_STANDARD_GOALS.map((goal) => `• ${goal.text}`).join("\n"),
  );
  assert.deepEqual(
    classDefaultGoalIds(preferences, null),
    preferences.defaultGoalIdsByClassId[SAMPLE_LEVEL_3_DEFAULT_CLASS_ID],
  );
  assert.equal(
    classDefaultGoalText(preferences, null),
    LEVEL_3_STANDARD_GOALS.map((goal) => `• ${goal.text}`).join("\n"),
  );
  assert.equal(classDefaultGoalText(preferences, "class-boys-level-4"), "");
  assert.equal(isLessonGoalPreferences(preferences), true);
});

test("selected goals become unique bullets and append without erasing lesson text", () => {
  const preferences = emptyLessonGoalPreferences();
  const selectedIds = LEVEL_3_STANDARD_GOALS.map((goal) => goal.id);
  const selected = selectedGoalText(preferences, selectedIds);
  assert.equal(appendSelectedGoals("", preferences, selectedIds), selected);
  assert.equal(
    appendSelectedGoals("Coach one clean shape.", preferences, selectedIds),
    `Coach one clean shape.\n${selected}`,
  );
  assert.equal(appendSelectedGoals(selected, preferences, selectedIds), selected);
});

test("general goals can be added, edited, assigned per class, and removed safely", () => {
  const seeded = emptyLessonGoalPreferences();
  const added = addGeneralClassGoal(seeded, { id: "goal-stick-landings", text: "  Stick landings with control  " });
  assert.equal(added.generalGoals.at(-1)?.text, "Stick landings with control");
  const edited = updateGeneralClassGoal(added, "goal-stick-landings", "Show a controlled finish");
  const assigned = setClassDefaultGoalIds(edited, "class-boys-level-4", ["goal-stick-landings", "missing"]);
  assert.deepEqual(classDefaultGoalIds(assigned, "class-boys-level-4"), ["goal-stick-landings"]);
  const blank = updateGeneralClassGoal(assigned, "goal-stick-landings", "");
  assert.equal(blank, assigned);
  const removed = removeGeneralClassGoal(assigned, "goal-stick-landings");
  assert.equal(removed.generalGoals.some((goal) => goal.id === "goal-stick-landings"), false);
  assert.deepEqual(classDefaultGoalIds(removed, "class-boys-level-4"), []);
  assert.equal(isLessonGoalPreferences(removed), true);
});

test("the built-in Sample Level 3 type can keep its own editable defaults", () => {
  const preferences = emptyLessonGoalPreferences();
  const changed = setClassDefaultGoalIds(preferences, null, [LEVEL_3_STANDARD_GOALS[1].id]);
  assert.deepEqual(classDefaultGoalIds(changed, null), [LEVEL_3_STANDARD_GOALS[1].id]);
  assert.deepEqual(classDefaultGoalIds(changed, LEVEL_3_DEFAULT_CLASS_ID), LEVEL_3_STANDARD_GOALS.map((goal) => goal.id));
});

test("goal preference validation rejects unknown or duplicate default references", () => {
  const valid = emptyLessonGoalPreferences();
  assert.equal(isLessonGoalPreferences({
    ...valid,
    defaultGoalIdsByClassId: { "class-boys-level-3": ["missing"] },
  }), false);
  assert.equal(isLessonGoalPreferences({
    ...valid,
    defaultGoalIdsByClassId: {
      "class-boys-level-3": [
        LEVEL_3_STANDARD_GOALS[0].id,
        LEVEL_3_STANDARD_GOALS[0].id,
      ],
    },
  }), false);
});
