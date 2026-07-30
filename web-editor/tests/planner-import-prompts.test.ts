import assert from "node:assert/strict";
import test from "node:test";
import { classScheduleImportPrompt, fullScheduleImportPrompt, PLANNER_JSON_DIRECTORY } from "../app/planner-import-prompts";

test("class import request is schema-first and never embeds Planner records", () => {
  const prompt = classScheduleImportPrompt();
  assert.match(prompt, /"version": 1/);
  assert.match(prompt, /"students"/);
  assert.match(prompt, new RegExp(PLANNER_JSON_DIRECTORY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(prompt, /no Markdown, explanation, SQL, IDs, URLs, credentials/);
  assert.doesNotMatch(prompt, /Avery Kim/);
});

test("full schedule request keeps the safe schedule contract and privacy boundary", () => {
  const prompt = fullScheduleImportPrompt();
  assert.match(prompt, /lesson-planner-safe-schedule/);
  assert.match(prompt, /Every privacy flag must be false/);
  assert.match(prompt, /bookingId, day \(Mon\/Tues\/Wed\/Thurs\/Fri\/Sat\/Sun\), week/);
  assert.match(prompt, /must never reserve equipment/);
});
