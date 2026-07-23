import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE,
  activeLocalClass,
  addLocalClass,
  appendLocalClassScheduleImport,
  createLocalClass,
  emptyLocalClassStorage,
  isLocalClassStorage,
  localClassById,
  localClassStorage,
  localScheduleBlocksForLessonDate,
  parseLocalScheduleTime,
  parseLocalClassScheduleImport,
  reconcileLocalRosterFromText,
  removeLocalClass,
  setActiveLocalClass,
  scheduleBlockMatchesLessonDate,
  updateLocalClass,
  type LocalClass,
} from "../app/local-classes";

const timestamp = "2026-07-20T12:00:00.000Z";

function idFactory() {
  let sequence = 0;
  return (kind: "class" | "student" | "schedule") => `${kind}-${++sequence}`;
}

function existingClass(): LocalClass {
  return {
    id: "class-existing",
    name: "Existing Level",
    group: "Level 2",
    students: [{ id: "student-existing", name: "Avery Kim" }],
    schedule: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

test("local class storage is versioned, detached, and rejects stale active IDs", () => {
  const stored = localClassStorage([existingClass()], "class-existing");
  assert.equal(isLocalClassStorage(stored), true);
  assert.notEqual(stored.classes[0], existingClass());

  const detached = activeLocalClass(stored);
  assert.ok(detached);
  detached.students[0].name = "Changed only in the UI copy";
  assert.equal(stored.classes[0].students[0].name, "Avery Kim");

  const staleActive = localClassStorage([existingClass()], "class-missing");
  assert.equal(staleActive.activeClassId, null);

  const unsafe = structuredClone(stored) as unknown as { classes: Array<{ unexpected: string }> };
  unsafe.classes[0].unexpected = "nope";
  assert.equal(isLocalClassStorage(unsafe), false);
});

test("a coach-created class receives stable local IDs independent of editable names", () => {
  const created = createLocalClass({
    name: "  Level   3 Boys ",
    group: "  Level 3 ",
    students: [{ name: "  Avery  Kim " }, { name: "Jordan Lee", notes: "  Injury check  " }],
    schedule: [{
      day: " Monday ",
      start: " 3:30 PM ",
      end: " 4:00 PM ",
      event: " PB / HB ",
      areas: [" PB/HB "],
    }],
  }, { now: timestamp, idFactory: idFactory() });

  assert.deepEqual(created, {
    id: "class-1",
    name: "Level 3 Boys",
    group: "Level 3",
    students: [
      { id: "student-2", name: "Avery Kim" },
      { id: "student-3", name: "Jordan Lee", notes: "Injury check" },
    ],
    schedule: [{
      id: "schedule-4",
      day: "Monday",
      start: "3:30 PM",
      end: "4:00 PM",
      event: "PB / HB",
      areas: ["PB/HB"],
    }],
    createdAt: timestamp,
    updatedAt: timestamp,
  });
});

test("the JSON importer accepts a small documented schedule and explicitly rejects SQL or unsafe fields", () => {
  const parsed = parseLocalClassScheduleImport(LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.class.name, "Level 3 Boys");
  assert.deepEqual(parsed.value.class.students, [{ name: "Avery Kim" }, { name: "Jordan Lee" }]);
  assert.equal(parsed.value.class.schedule[0].event, "Floor");

  const sql = parseLocalClassScheduleImport("INSERT INTO schedule VALUES ('Monday');");
  assert.deepEqual(sql, {
    ok: false,
    error: "Only JSON imports are supported. SQL is not executed by this local planner.",
  });

  const unsafe = parseLocalClassScheduleImport(JSON.stringify({
    version: 1,
    class: {
      id: "class-pretend-existing",
      name: "Level 3 Boys",
      students: [],
      schedule: [],
    },
  }));
  assert.equal(unsafe.ok, false, "imports cannot provide stable IDs that could overwrite a local record");

  const invalidBlock = parseLocalClassScheduleImport(JSON.stringify({
    version: 1,
    class: {
      name: "Level 3 Boys",
      students: [],
      schedule: [{ day: "Monday", start: "4:00 PM", end: "3:30 PM", event: "Floor" }],
    },
  }));
  assert.equal(invalidBlock.ok, false, "a schedule needs a known day and a forward time range");
});

test("import append preserves an existing class even when display names match", () => {
  const parsed = parseLocalClassScheduleImport(JSON.stringify({
    version: 1,
    class: {
      name: "Existing Level",
      students: ["New Student"],
      schedule: [{ day: "Tuesday", start: "4 PM", end: "5 PM", event: "Floor" }],
    },
  }));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const original = localClassStorage([existingClass()], "class-existing");
  const appended = appendLocalClassScheduleImport(original, parsed.value, {
    now: timestamp,
    idFactory: idFactory(),
    makeActive: true,
  });
  assert.ok(appended);
  assert.equal(original.classes.length, 1);
  assert.equal(appended.storage.classes.length, 2);
  assert.deepEqual(appended.storage.classes.map((localClass) => localClass.id), ["class-existing", "class-1"]);
  assert.equal(appended.storage.activeClassId, "class-1");
  assert.equal(appended.localClass.students[0].id, "student-2");
});

test("targeted selection and removal do not mutate unrelated local classes", () => {
  const first = existingClass();
  const second: LocalClass = {
    ...existingClass(),
    id: "class-second",
    name: "Second Class",
    students: [{ id: "student-second", name: "Jordan Lee" }],
  };
  const selected = setActiveLocalClass(localClassStorage([first, second]), "class-second");
  assert.equal(selected.activeClassId, "class-second");
  const removed = removeLocalClass(selected, "class-second");
  assert.deepEqual(removed.classes.map((localClass) => localClass.id), ["class-existing"]);
  assert.equal(removed.activeClassId, null);

  const duplicate = addLocalClass(emptyLocalClassStorage(), first);
  assert.equal(addLocalClass(duplicate, first), duplicate, "adding an existing ID never upserts or overwrites it");
});

test("newline roster editing preserves IDs and notes by normalized student name", () => {
  const roster = reconcileLocalRosterFromText([
    { id: "student-avery", name: "Avery Kim", notes: "Injury check" },
    { id: "student-jordan", name: "Jordan Lee" },
  ], "  avery   kim  \nJordan Lee\nNew Student", () => "student-new");
  assert.deepEqual(roster, [
    { id: "student-avery", name: "avery kim", notes: "Injury check" },
    { id: "student-jordan", name: "Jordan Lee" },
    { id: "student-new", name: "New Student" },
  ]);

  assert.equal(
    reconcileLocalRosterFromText([{ id: "student-avery", name: "Avery Kim" }], `Avery Kim\n${"x".repeat(121)}`),
    null,
    "an invalid edited line never returns a partly replaced roster",
  );
});

test("targeted class editing retains roster IDs and matches imported schedules to lesson dates", () => {
  const original = localClassStorage([{
    ...existingClass(),
    schedule: [{
      id: "schedule-floor",
      day: "Monday",
      start: "3:30 PM",
      end: "4:00 PM",
      event: "Floor",
      areas: ["F2"],
    }],
  }], "class-existing");
  const edited = updateLocalClass(original, "class-existing", {
    name: "Existing Level Updated",
    rosterText: "avery  kim\nNew Student",
    schedule: [{ day: "Monday", start: "3:30 PM", end: "4:00 PM", event: "Floor", areas: ["F2"] }],
  }, { now: "2026-07-20T13:00:00.000Z", idFactory: idFactory() });
  const changed = localClassById(edited, "class-existing");
  assert.ok(changed);
  assert.equal(original.classes[0].name, "Existing Level");
  assert.deepEqual(changed.students, [
    { id: "student-existing", name: "avery kim" },
    { id: "student-1", name: "New Student" },
  ]);
  assert.equal(changed.schedule[0].id, "schedule-floor", "an untouched schedule row keeps its local ID");
  assert.equal(changed.updatedAt, "2026-07-20T13:00:00.000Z");

  assert.equal(parseLocalScheduleTime("12:00 AM"), 0);
  assert.equal(parseLocalScheduleTime("12 PM"), 720);
  assert.equal(parseLocalScheduleTime("15:45"), 945);
  assert.equal(parseLocalScheduleTime("soon"), null);
  assert.equal(scheduleBlockMatchesLessonDate(changed.schedule[0], "2026-07-20"), true);
  assert.equal(scheduleBlockMatchesLessonDate(changed.schedule[0], "2026-07-21"), false);
  assert.deepEqual(
    localScheduleBlocksForLessonDate([
      { id: "schedule-late", day: "Monday", start: "4 PM", end: "5 PM", event: "Bars" },
      changed.schedule[0],
    ], "2026-07-20").map((block) => block.id),
    ["schedule-floor", "schedule-late"],
  );
});
