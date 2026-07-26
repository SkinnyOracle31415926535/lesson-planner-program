import assert from "node:assert/strict";
import test from "node:test";

import {
  addPlannerIntakeItem,
  announcementApplies,
  appendAnnouncement,
  decidePlannerIntakeItem,
  emptyPlannerIntake,
  extractBacklogMarkers,
  lessonDraftCompatibility,
  parsePlannerIntake,
  type PlannerAnnouncementSuggestion,
  type PlannerBacklogCapture,
  type PlannerLessonDraft,
} from "../app/planner-intake";

const draft: PlannerLessonDraft = {
  id: "draft-2026-07-27-level-3",
  kind: "lesson-draft",
  createdAt: "2026-07-25T12:00:00.000Z",
  source: "CODEX LESSON PLAN SKILL",
  target: {
    lessonDate: "2026-07-27",
    classId: "class-level-3",
    className: "Level 3",
  },
  details: {
    announcements: "Bring grips.",
    goals: "• Tight shapes",
  },
  phases: [{
    phaseId: "phase-floor",
    title: "FLOOR",
    time: "3:30–4:00",
    text: ["Roundoff shapes"],
  }],
};

const announcement: PlannerAnnouncementSuggestion = {
  id: "announcement-level-3-grips",
  kind: "announcement",
  createdAt: "2026-07-25T12:00:00.000Z",
  source: "SANITIZED CODEX CRAWL",
  sourceRef: "weekly-notes:2026-07-25",
  classId: "class-level-3",
  className: "Level 3",
  effectiveStart: "2026-07-27",
  effectiveEnd: "2026-08-02",
  text: "Bring grips.",
};

const backlog: PlannerBacklogCapture = {
  id: "backlog-lesson-2026-07-27-1",
  kind: "backlog-capture",
  createdAt: "2026-07-27T18:00:00.000Z",
  source: {
    lessonId: "lesson-level-3-2026-07-27",
    lessonDate: "2026-07-27",
    classId: "class-level-3",
    className: "Level 3",
  },
  projectKey: "lesson-planner",
  request: "make the goal box easier to read",
};

test("planner intake accepts strict unique items and preserves detached copies", () => {
  let intake = emptyPlannerIntake();
  intake = addPlannerIntakeItem(intake, draft)!;
  intake = addPlannerIntakeItem(intake, announcement)!;
  intake = addPlannerIntakeItem(intake, backlog)!;
  const parsed = parsePlannerIntake(intake);
  assert.ok(parsed);
  assert.equal(parsed.lessonDrafts.length, 1);
  assert.equal(parsed.announcementSuggestions.length, 1);
  assert.equal(parsed.backlogCaptures.length, 1);

  parsed.lessonDrafts[0]!.phases[0]!.text!.push("copy only");
  assert.deepEqual(intake.lessonDrafts[0]!.phases[0]!.text, ["Roundoff shapes"]);
  assert.equal(addPlannerIntakeItem(intake, draft)?.lessonDrafts.length, 1);
});

test("planner intake rejects malformed, duplicate, or unbounded records", () => {
  const duplicate = {
    ...emptyPlannerIntake(),
    lessonDrafts: [draft],
    announcementSuggestions: [{ ...announcement, id: draft.id }],
  };
  assert.equal(parsePlannerIntake(duplicate), null);
  assert.equal(parsePlannerIntake({
    ...emptyPlannerIntake(),
    backlogCaptures: [{ ...backlog, projectKey: "arbitrary-repo" }],
  }), null);
  assert.equal(parsePlannerIntake({
    ...emptyPlannerIntake(),
    backlogCaptures: [{ ...backlog, request: "first line\ninjected line" }],
  }), null);
  assert.equal(parsePlannerIntake({
    ...emptyPlannerIntake(),
    announcementSuggestions: [{ ...announcement, sourceRef: "safe-id\nraw body" }],
  }), null);
  assert.equal(parsePlannerIntake({
    ...emptyPlannerIntake(),
    lessonDrafts: [{ ...draft, phases: [{ ...draft.phases[0], text: ["x".repeat(501)] }] }],
  }), null);
});

test("intake decisions only attach to existing immutable item IDs", () => {
  const intake = addPlannerIntakeItem(emptyPlannerIntake(), draft)!;
  assert.equal(decidePlannerIntakeItem(intake, "missing", "applied"), null);
  assert.deepEqual(decidePlannerIntakeItem(intake, draft.id, "applied")?.decisionById, {
    [draft.id]: "applied",
  });
});

test("lesson draft matching requires the exact class, date, phase ID, title, and time", () => {
  const target = { ...draft.target };
  const phases = [{ phaseId: "phase-floor", title: "FLOOR", time: "3:30–4:00" }];
  assert.deepEqual(lessonDraftCompatibility(draft, target, phases), { status: "ready" });
  assert.equal(lessonDraftCompatibility(draft, { ...target, lessonDate: "2026-07-28" }, phases).status, "target-mismatch");
  assert.equal(lessonDraftCompatibility(draft, target, [{ ...phases[0], time: "4:00–4:30" }]).status, "phase-mismatch");
});

test("announcement suggestions require an exact class and effective date", () => {
  assert.equal(announcementApplies(announcement, "class-level-3", "2026-07-27"), true);
  assert.equal(announcementApplies(announcement, "class-level-4", "2026-07-27"), false);
  assert.equal(announcementApplies(announcement, "class-level-3", "2026-08-03"), false);
  assert.equal(appendAnnouncement("", announcement.text), "Bring grips.");
  assert.equal(appendAnnouncement("Bring grips.", announcement.text), "Bring grips.");
  assert.equal(appendAnnouncement("Meet at floor.", announcement.text), "Meet at floor.\nBring grips.");
});

test("reflection parsing captures only text after explicit same-line backlog markers", () => {
  assert.deepEqual(extractBacklogMarkers([
    "Bars went well.",
    "$backlog make the goal box easier to read",
    "Keep this whole reflection private.",
    "note: $backlog: add a clearer timer",
    "$backlog",
    "$backlog make the goal box easier to read",
  ].join("\n")), [
    "make the goal box easier to read",
    "add a clearer timer",
  ]);
});
