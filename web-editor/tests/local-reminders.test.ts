import assert from "node:assert/strict";
import test from "node:test";
import {
  addLocalReminderTemplate,
  createLocalReminderTemplate,
  emptyLocalReminderStorage,
  isLocalReminderStorage,
  localReminderStorage,
  parseLocalReminderStorage,
  resolveLocalReminders,
  serializeLocalReminderStorage,
  setLocalReminderComplete,
  type LocalReminderLesson,
} from "../app/local-reminders";

const timestamp = "2026-07-24T12:00:00.000Z";

function lesson(overrides: Partial<LocalReminderLesson> = {}): LocalReminderLesson {
  return {
    planId: "plan-level-3-2026-07-24",
    lessonId: "plan-level-3-2026-07-24",
    classId: "class-level-3",
    date: "2026-07-24",
    phaseIds: ["phase-warmup", "phase-bars"],
    ...overrides,
  };
}

function makeTemplate(draft: object, id: string) {
  const template = createLocalReminderTemplate(draft, {
    now: timestamp,
    idFactory: () => id,
  });
  assert.ok(template);
  return template;
}

test("coach-created reminder drafts normalize safely and temporary defaults stop on their date", () => {
  const temporary = makeTemplate({
    title: "  Bring   name tags ",
    detail: "  Put them at check-in.  ",
    cadence: "temporary",
    scope: { kind: "classes", classIds: [" class-level-3 ", "class-level-3"] },
    startDate: " 2026-07-24 ",
  }, "reminder-name-tags");

  assert.deepEqual(temporary, {
    id: "reminder-name-tags",
    title: "Bring name tags",
    detail: "Put them at check-in.",
    cadence: "temporary",
    scope: { kind: "classes", classIds: ["class-level-3"] },
    startDate: "2026-07-24",
    endDate: "2026-07-24",
    rollForwardUntilCompleted: false,
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  assert.equal(createLocalReminderTemplate({
    title: "Nope",
    cadence: "recurring",
    scope: { kind: "classes", classIds: [] },
    startDate: "2026-07-24",
  }, { idFactory: () => "reminder-nope" }), null);
});

test("storage serialization is detached and rejects unsupported reminder records", () => {
  const template = makeTemplate({
    title: "Check bar mats",
    cadence: "recurring",
    scope: { kind: "all_classes" },
    startDate: "2026-07-01",
  }, "reminder-bar-mats");
  const stored = localReminderStorage([template]);
  const serialized = serializeLocalReminderStorage(stored);
  assert.ok(serialized);
  const parsed = parseLocalReminderStorage(serialized);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  parsed.value.templates[0].title = "Only the detached copy changes";
  assert.equal(stored.templates[0].title, "Check bar mats");
  assert.equal(isLocalReminderStorage(stored), true);

  const unsafe = JSON.stringify({
    ...stored,
    unexpected: "not allowed",
  });
  assert.equal(parseLocalReminderStorage(unsafe).ok, false);
  assert.equal(parseLocalReminderStorage("{nope").ok, false);
});

test("recurring reminders honor all, class, lesson, phase, and date scopes with per-plan completion", () => {
  const allClasses = makeTemplate({
    title: "Open the gym",
    cadence: "recurring",
    scope: { kind: "all_classes" },
    startDate: "2026-07-01",
  }, "reminder-open-gym");
  const onlyClass = makeTemplate({
    title: "Level 3 cue",
    cadence: "recurring",
    scope: { kind: "classes", classIds: ["class-level-3"] },
    startDate: "2026-07-01",
  }, "reminder-level-3");
  const onlyLesson = makeTemplate({
    title: "First-day note",
    cadence: "recurring",
    scope: { kind: "lesson", lessonId: "plan-level-3-2026-07-24" },
    startDate: "2026-07-24",
    endDate: "2026-07-24",
  }, "reminder-first-day");
  const onlyPhase = makeTemplate({
    title: "Bars setup",
    cadence: "recurring",
    scope: { kind: "phase", phaseId: "phase-bars" },
    startDate: "2026-07-01",
  }, "reminder-bars");
  const storage = localReminderStorage([allClasses, onlyClass, onlyLesson, onlyPhase]);

  assert.deepEqual(
    resolveLocalReminders(storage, lesson()).map((resolved) => resolved.template.id),
    ["reminder-open-gym", "reminder-level-3", "reminder-first-day", "reminder-bars"],
  );
  assert.deepEqual(
    resolveLocalReminders(storage, lesson({
      planId: "plan-level-2-2026-07-25",
      lessonId: "plan-level-2-2026-07-25",
      classId: "class-level-2",
      date: "2026-07-25",
      phaseIds: ["phase-floor"],
    })).map((resolved) => resolved.template.id),
    ["reminder-open-gym"],
  );

  const completed = setLocalReminderComplete(storage, lesson(), "reminder-level-3", true, { now: timestamp });
  assert.equal(resolveLocalReminders(completed, lesson())
    .find((resolved) => resolved.template.id === "reminder-level-3")?.occurrence.state, "completed");
  assert.equal(resolveLocalReminders(completed, lesson({
    planId: "plan-level-3-2026-07-31",
    lessonId: "plan-level-3-2026-07-31",
    date: "2026-07-31",
  })).find((resolved) => resolved.template.id === "reminder-level-3")?.occurrence.state, "open");
});

test("unfinished temporary reminders roll forward until completed, then stop later matching plans", () => {
  const temporary = makeTemplate({
    title: "Send makeup-class message",
    cadence: "temporary",
    scope: { kind: "classes", classIds: ["class-level-3"] },
    startDate: "2026-07-20",
    endDate: "2026-07-21",
    rollForwardUntilCompleted: true,
  }, "reminder-makeup-message");
  const storage = addLocalReminderTemplate(emptyLocalReminderStorage(), temporary);
  const laterLesson = lesson({
    planId: "plan-level-3-2026-07-24",
    lessonId: "plan-level-3-2026-07-24",
    date: "2026-07-24",
  });

  const rolled = resolveLocalReminders(storage, laterLesson);
  assert.equal(rolled.length, 1);
  assert.equal(rolled[0].isRollForward, true);
  assert.equal(rolled[0].occurrence.state, "open");

  const completed = setLocalReminderComplete(storage, laterLesson, temporary.id, true, { now: timestamp });
  assert.equal(resolveLocalReminders(completed, laterLesson)[0].occurrence.state, "completed");
  assert.deepEqual(resolveLocalReminders(completed, lesson({
    planId: "plan-level-3-2026-07-31",
    lessonId: "plan-level-3-2026-07-31",
    date: "2026-07-31",
  })), []);
});

test("a temporary every-class reminder remains open for another class on its original date", () => {
  const temporary = makeTemplate({
    title: "Meet prep",
    cadence: "temporary",
    scope: { kind: "all_classes" },
    startDate: "2026-07-24",
    rollForwardUntilCompleted: true,
  }, "reminder-meet-prep");
  const storage = localReminderStorage([temporary]);
  const classA = lesson({ planId: "plan-class-a-2026-07-24", lessonId: "plan-class-a-2026-07-24", classId: "class-a" });
  const classB = lesson({ planId: "plan-class-b-2026-07-24", lessonId: "plan-class-b-2026-07-24", classId: "class-b" });

  const completed = setLocalReminderComplete(storage, classA, temporary.id, true, { now: timestamp });
  assert.equal(resolveLocalReminders(completed, classB)[0]?.occurrence.state, "open");
  assert.deepEqual(resolveLocalReminders(completed, lesson({
    planId: "plan-class-b-2026-07-25",
    lessonId: "plan-class-b-2026-07-25",
    classId: "class-b",
    date: "2026-07-25",
  })), []);
});

test("temporary reminders without roll-forward stop after their finite date range", () => {
  const temporary = makeTemplate({
    title: "Bring waiver forms",
    cadence: "temporary",
    scope: { kind: "all_classes" },
    startDate: "2026-07-20",
    endDate: "2026-07-21",
    rollForwardUntilCompleted: false,
  }, "reminder-waiver-forms");
  const storage = localReminderStorage([temporary]);
  assert.equal(resolveLocalReminders(storage, lesson({ date: "2026-07-21" })).length, 1);
  assert.equal(resolveLocalReminders(storage, lesson({
    planId: "plan-level-3-2026-07-22",
    lessonId: "plan-level-3-2026-07-22",
    date: "2026-07-22",
  })).length, 0);
});
