import assert from "node:assert/strict";
import test from "node:test";
import { isPastLessonPlanDate, localLessonPlanDate } from "../app/lesson-plan-dates";

test("past lesson snapshots use the local calendar boundary", () => {
  assert.equal(localLessonPlanDate(new Date(2026, 6, 20, 23, 59)), "2026-07-20");
  assert.equal(isPastLessonPlanDate("2026-07-19", "2026-07-20"), true);
  assert.equal(isPastLessonPlanDate("2026-07-20", "2026-07-20"), false);
  assert.equal(isPastLessonPlanDate("2026-07-21", "2026-07-20"), false);
  assert.equal(isPastLessonPlanDate("not-a-date", "2026-07-20"), false);
});
