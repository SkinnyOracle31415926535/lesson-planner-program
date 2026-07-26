import assert from "node:assert/strict";
import test from "node:test";

import { parsePlannerOperationsV4 } from "../app/planner-operations";

function operations() {
  return {
    version: 4,
    taskDoneByPlanId: {
      "lesson-one": { "task-one": true },
    },
    attendanceByPlanId: {
      "lesson-one": { "athlete-one": "present" },
    },
    updateDecisionByRevision: {
      "update-one:revision-one": "LATER",
    },
    goalPreferences: {
      version: 1,
      generalGoals: [{ id: "goal-one", text: "Keep tight shapes" }],
      defaultGoalIdsByClassId: { "class-one": ["goal-one"] },
    },
    plannerIntake: {
      version: 1,
      lessonDrafts: [],
      announcementSuggestions: [],
      backlogCaptures: [],
      decisionById: {},
    },
  };
}

test("shared Planner v4 operations require the exact bounded contract and detach accepted state", () => {
  const source = operations();
  const parsed = parsePlannerOperationsV4(source);
  assert.ok(parsed);
  parsed.taskDoneByPlanId["lesson-one"]!["task-one"] = false;
  parsed.goalPreferences.generalGoals[0]!.text = "Detached";
  assert.equal(source.taskDoneByPlanId["lesson-one"]["task-one"], true);
  assert.equal(source.goalPreferences.generalGoals[0].text, "Keep tight shapes");

  assert.equal(parsePlannerOperationsV4({ ...operations(), unexpected: "do not preserve" }), null);
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    taskDoneByPlanId: { "lesson-one": [] },
  }), null);
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    attendanceByPlanId: { "lesson one": { "athlete-one": "present" } },
  }), null);
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    updateDecisionByRevision: [],
  }), null);
});

test("shared Planner v4 operations reject oversized public records", () => {
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    taskDoneByPlanId: Object.fromEntries(
      Array.from({ length: 1_001 }, (_, index) => [`lesson-${index}`, {}]),
    ),
  }), null);
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    attendanceByPlanId: {
      "lesson-one": Object.fromEntries(
        Array.from({ length: 1_001 }, (_, index) => [`athlete-${index}`, "present"]),
      ),
    },
  }), null);
  assert.equal(parsePlannerOperationsV4({
    ...operations(),
    updateDecisionByRevision: Object.fromEntries(
      Array.from({ length: 2_001 }, (_, index) => [`update-${index}`, "LATER"]),
    ),
  }), null);
});
