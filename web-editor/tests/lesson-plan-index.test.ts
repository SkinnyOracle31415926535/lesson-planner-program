import assert from "node:assert/strict";
import test from "node:test";
import {
  LESSON_PLAN_INDEX_VERSION,
  addLessonPlan,
  createLessonPlanMeta,
  indexWithLessonPlan,
  isLessonPlanIndex,
  isOpaqueLessonPlanId,
  lessonPlanForIdentity,
  lessonPlanIdentityKey,
  normalizeLessonPlanIndex,
  upsertLessonPlan,
  type LessonPlanMeta,
} from "../app/lesson-plan-index";

const now = "2026-07-24T18:00:00.000Z";

function idFactory(...ids: string[]) {
  let index = 0;
  return () => ids[index++] ?? "lesson-ffffffffffffffffffffffffffffffff";
}

function plan(
  date: string,
  classId: string | null,
  id: string,
  title = "Lesson",
): LessonPlanMeta {
  return {
    id,
    date,
    classId,
    title,
    createdAt: now,
    updatedAt: now,
    storage: "scoped",
  };
}

test("one plan is retained for each exact date and class identity", () => {
  const first = createLessonPlanMeta({
    identity: { date: "2026-07-28", classId: "class-boys" },
    title: "Boys lesson",
    now,
    idFactory: idFactory("lesson-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  });
  assert.ok(first);

  const firstResult = addLessonPlan(null, first);
  assert.ok(firstResult);
  assert.equal(firstResult.added, true);

  const second = createLessonPlanMeta({
    identity: { date: "2026-07-28", classId: "class-girls" },
    title: "Girls lesson",
    now,
    existingPlanIds: firstResult.index.plans.map((entry) => entry.id),
    idFactory: idFactory("lesson-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  });
  assert.ok(second);
  const secondResult = addLessonPlan(firstResult.index, second);
  assert.ok(secondResult);
  assert.equal(secondResult.added, true);
  assert.equal(secondResult.index.plans.length, 2);
  assert.equal(
    lessonPlanForIdentity(secondResult.index, { date: "2026-07-28", classId: "class-boys" })?.id,
    first.id,
  );
  assert.equal(
    lessonPlanForIdentity(secondResult.index, { date: "2026-07-28", classId: "class-girls" })?.id,
    second.id,
  );

  const duplicate = plan("2026-07-28", "class-boys", "lesson-cccccccccccccccccccccccccccccccc", "Replacement");
  const duplicateResult = addLessonPlan(secondResult.index, duplicate);
  assert.ok(duplicateResult);
  assert.equal(duplicateResult.added, false);
  assert.equal(duplicateResult.plan.id, first.id);
  assert.equal(duplicateResult.index.plans.length, 2);
});

test("new IDs are opaque and retry an injected collision without encoding lesson identity", () => {
  const existingId = "lesson-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const created = createLessonPlanMeta({
    identity: { date: "2026-08-01", classId: "class-team" },
    title: "Team lesson",
    now,
    existingPlanIds: [existingId],
    idFactory: idFactory(existingId, "lesson-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  });
  assert.ok(created);
  assert.equal(created.id, "lesson-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
  assert.equal(isOpaqueLessonPlanId(created.id), true);
  assert.equal(created.id.includes(created.date), false);
  assert.equal(created.id.includes(created.classId!), false);
  assert.equal(created.createdAt, now);
  assert.equal(created.updatedAt, now);
});

test("v1 index migration preserves every plan ID, storage reference, and active plan", () => {
  const legacy = {
    version: 1,
    activePlanId: "lesson-2026-07-25",
    plans: [
      {
        id: "legacy-current",
        date: "2026-07-24",
        title: "LEVEL 3 LESSON",
        createdAt: now,
        updatedAt: now,
        storage: "legacy",
      },
      {
        id: "lesson-2026-07-25",
        date: "2026-07-25",
        title: "LEVEL 3 LESSON",
        createdAt: "2026-07-24T19:00:00.000Z",
        updatedAt: "2026-07-24T20:00:00.000Z",
        storage: "scoped",
      },
    ],
  };

  const loaded = normalizeLessonPlanIndex(legacy);
  assert.ok(loaded);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.index.version, LESSON_PLAN_INDEX_VERSION);
  assert.equal(loaded.index.activePlanId, legacy.activePlanId);
  assert.deepEqual(loaded.index.plans.map((entry) => ({
    id: entry.id,
    date: entry.date,
    classId: entry.classId,
    title: entry.title,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    storage: entry.storage,
  })), [
    { ...legacy.plans[0], classId: null },
    { ...legacy.plans[1], classId: null },
  ]);
});

test("identity keys are display-only and metadata updates retain a plan ID", () => {
  assert.equal(lessonPlanIdentityKey({ date: "2026-08-04", classId: null }), "2026-08-04\u001f");
  assert.equal(lessonPlanIdentityKey({ date: "not-a-date", classId: null }), null);

  const original = plan("2026-08-04", "class-rec", "lesson-dddddddddddddddddddddddddddddddd", "Original");
  const first = addLessonPlan(null, original);
  assert.ok(first);
  const updated = { ...original, title: "Updated", updatedAt: "2026-08-03T18:00:00.000Z" };
  const revised = indexWithLessonPlan(first.index, updated);
  assert.ok(revised);
  assert.equal(revised.plans.length, 1);
  assert.deepEqual(revised.plans[0], updated);
});

test("metadata updates cannot turn two saved plans into the same class and date", () => {
  const first = addLessonPlan(null, plan("2026-08-04", null, "lesson-eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "Sample"));
  assert.ok(first);
  const second = addLessonPlan(first.index, plan("2026-08-04", "class-rec", "lesson-ffffffffffffffffffffffffffffffff", "Class"));
  assert.ok(second);

  const collidingUpdate = {
    ...second.index.plans.find((entry) => entry.id === "lesson-ffffffffffffffffffffffffffffffff")!,
    classId: null,
  };
  const rejectedUpdate = upsertLessonPlan(second.index, collidingUpdate);
  assert.ok(rejectedUpdate);
  assert.equal(rejectedUpdate.status, "duplicate-identity");
  assert.equal(rejectedUpdate.duplicate?.id, first.index.plans[0].id);
  assert.deepEqual(rejectedUpdate.index, second.index);
  assert.equal(indexWithLessonPlan(second.index, collidingUpdate), null);

  const malformedDuplicateIndex = {
    ...second.index,
    plans: [
      ...second.index.plans,
      { ...second.index.plans[0], id: "lesson-99999999999999999999999999999999" },
    ],
  };
  assert.equal(isLessonPlanIndex(malformedDuplicateIndex), false);
  const repaired = normalizeLessonPlanIndex(malformedDuplicateIndex);
  assert.ok(repaired);
  assert.equal(repaired.migrated, true);
  assert.equal(repaired.index.plans.length, 3);
  assert.equal(lessonPlanForIdentity(repaired.index, { date: "2026-08-04", classId: null })?.id, first.index.plans[0].id);
  assert.equal(repaired.index.plans.some((entry) => entry.id === "lesson-99999999999999999999999999999999"), true);
  assert.equal(repaired.index.plans.find((entry) => entry.id === "lesson-99999999999999999999999999999999")?.classId?.startsWith("orphan-"), true);
});

test("upsert reports and preserves the saved plan when a class/date identity collides", () => {
  const saved = plan("2026-08-11", "class-rec", "lesson-11111111111111111111111111111111", "Saved lesson");
  const index = addLessonPlan(null, saved);
  assert.ok(index);

  const attempted = plan("2026-08-11", "class-rec", "lesson-22222222222222222222222222222222", "Duplicate lesson");
  const result = upsertLessonPlan(index.index, attempted);
  assert.ok(result);
  assert.equal(result.status, "duplicate-identity");
  assert.equal(result.duplicate?.id, saved.id);
  assert.equal(result.plan.id, saved.id);
  assert.deepEqual(result.index, index.index);
  assert.equal(indexWithLessonPlan(index.index, attempted), null);
});
