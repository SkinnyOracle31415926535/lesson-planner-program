import assert from "node:assert/strict";
import test from "node:test";

import {
  emptyPersonalAlternateScheduleStore,
  parsePersonalAlternateScheduleStoreJson,
  personalAlternateScheduleCardsForLesson,
  personalAlternateScheduleScopeLabel,
  type PersonalAlternateScheduleRecord,
  type PersonalAlternateScheduleStore,
} from "../app/personal-alternate-schedule";
import {
  resolveSafeScheduleDay,
  type SafeScheduleBundleV1,
  type SafeScheduleTimeBlock,
} from "../app/local-schedule";

function rawRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "personal-one",
    source_schedule_id: "summer_2026",
    source_fingerprint: "summer-revision",
    source_sheet: "Mon-Even",
    source_opening: {
      key: "Mon-Even|Vault|1140|1150",
      equipment: "Vault",
      start_min: 1140,
      end_min: 1150,
      duration_min: 10,
    },
    class_name: "Boys Level 3",
    scope: { type: "date", date: "2026-07-27" },
    created_at: "2026-07-25T20:00:00.000Z",
    updated_at: "2026-07-25T20:00:00.000Z",
    stale_reason: "",
    stale_at: "",
    ...overrides,
  };
}

function rawStore(records: Record<string, unknown>[] = [rawRecord()]): string {
  return JSON.stringify({
    schema_version: 1,
    kind: "browser_local_alternate_schedule",
    updated_at: "2026-07-25T20:00:00.000Z",
    records,
  });
}

function scheduleBlock(overrides: Partial<SafeScheduleTimeBlock> = {}): SafeScheduleTimeBlock {
  return {
    bookingId: "block-one",
    day: "Mon",
    week: "Even",
    group: "B3",
    startMinute: 900,
    endMinute: 945,
    canonicalEventLabel: "Vault",
    eventLabel: "Vault",
    equipment: ["Vault"],
    activityType: "rotation",
    confidence: "high",
    reviewStatus: "auto_extracted",
    ...overrides,
  };
}

function safeSchedule(timeBlocks: SafeScheduleTimeBlock[] = [scheduleBlock()]): SafeScheduleBundleV1 {
  return {
    format: "lesson-planner-safe-schedule",
    version: 1,
    privacy: {
      studentRecordsIncluded: false,
      rostersIncluded: false,
      mediaBytesIncluded: false,
      urlsIncluded: false,
      absoluteSourcePathsIncluded: false,
      rawScheduleLabelsIncluded: false,
      rawWeeklyNoteTextIncluded: false,
      sourceClassNamesIncluded: false,
      sourceBookingIdsIncluded: false,
      drillLibraryIncluded: false,
      weeklyLedgerIncluded: false,
    },
    schedule: {
      sourceId: "schedule:summer_2026",
      scheduleId: "summer_2026",
      revision: "summer-revision",
      timezone: "America/Los_Angeles",
      effectiveStart: "2026-06-15",
      effectiveEnd: null,
      calendarWeekRule: {
        ruleId: "continuous",
        timezone: "America/Los_Angeles",
        weekStart: "monday",
        weekEnd: "sunday",
        monthWeekAnchor: "monday_sunday_week_containing_month_day_1",
        oddWeekOrdinals: [1, 3],
        evenWeekOrdinals: [2, 4],
        weekFiveOrLaterRequiresManualConfirmation: true,
        overflowWeekBehavior: "manual_confirmation_required",
      },
      equipment: [{ name: "Vault", displayOrder: 0, isSingleUnit: false }],
      timeBlocks,
      collisionWarnings: { warningCount: 0, statusCounts: {} },
    },
  };
}

function parsedRecord(overrides: Partial<PersonalAlternateScheduleRecord> = {}): PersonalAlternateScheduleRecord {
  const parsed = parsePersonalAlternateScheduleStoreJson(rawStore());
  assert.equal(parsed.ok, true);
  return { ...parsed.value.records[0], ...overrides };
}

test("strictly parses the Calendar v1 alternate-schedule contract", () => {
  const parsed = parsePersonalAlternateScheduleStoreJson(rawStore([
    rawRecord(),
    rawRecord({
      id: "personal-recurring",
      scope: { type: "recurring", weekday: "Mon", parity: "Even" },
    }),
  ]));

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.schemaVersion, 1);
  assert.equal(parsed.value.records.length, 2);
  assert.equal(parsed.value.records[0].sourceOpening.startMinute, 1140);
  assert.deepEqual(parsed.value.records[1].scope, { type: "recurring", weekday: "Mon", parity: "Even" });
  assert.equal(personalAlternateScheduleScopeLabel(parsed.value.records[0].scope), "Only 2026-07-27");
  assert.equal(personalAlternateScheduleScopeLabel(parsed.value.records[1].scope), "Every Mon-Even");
});

test("rejects unsupported fields, malformed opening identity, and duplicate IDs", () => {
  const unknownRoot = JSON.parse(rawStore()) as Record<string, unknown>;
  unknownRoot.extra = true;
  assert.equal(parsePersonalAlternateScheduleStoreJson(JSON.stringify(unknownRoot)).ok, false);

  const badOpening = rawRecord({
    source_opening: {
      key: "Mon-Even|Vault|1140|1155",
      equipment: "Vault",
      start_min: 1140,
      end_min: 1150,
      duration_min: 10,
    },
  });
  assert.equal(parsePersonalAlternateScheduleStoreJson(rawStore([badOpening])).ok, false);
  assert.equal(parsePersonalAlternateScheduleStoreJson(rawStore([rawRecord(), rawRecord()])).ok, false);
});

test("rejects a scope that does not match its source sheet", () => {
  const wrongWeekday = rawRecord({ scope: { type: "date", date: "2026-07-28" } });
  const wrongParity = rawRecord({ scope: { type: "recurring", weekday: "Mon", parity: "Odd" } });
  assert.equal(parsePersonalAlternateScheduleStoreJson(rawStore([wrongWeekday])).ok, false);
  assert.equal(parsePersonalAlternateScheduleStoreJson(rawStore([wrongParity])).ok, false);
});

test("returns only exact-class cards applicable to the selected date and week", () => {
  const exact = parsedRecord();
  const recurring = parsedRecord({
    id: "personal-recurring",
    scope: { type: "recurring", weekday: "Mon", parity: "Even" },
  });
  const wrongClass = parsedRecord({ id: "wrong-class", className: "Boys Level 4" });
  const wrongDate = parsedRecord({
    id: "wrong-date",
    scope: { type: "date", date: "2026-08-03" },
  });
  const store: PersonalAlternateScheduleStore = {
    ...emptyPersonalAlternateScheduleStore(),
    records: [wrongClass, recurring, wrongDate, exact],
  };
  const anchoredDay = resolveSafeScheduleDay(
    safeSchedule(),
    "2026-07-27",
    "B3",
    null,
    [{ weekStartDate: "2026-07-27", week: "Even" }],
  );

  const cards = personalAlternateScheduleCardsForLesson({
    store,
    date: "2026-07-27",
    className: "Boys Level 3",
    lessonWeek: anchoredDay.resolvedWeek,
    safeSchedule: safeSchedule(),
  });

  assert.equal(anchoredDay.weekResolutionSource, "anchored_cycle");
  assert.deepEqual(cards.map((card) => card.id), ["personal-recurring", "personal-one"]);
  assert.equal(cards.every((card) => !card.isStale), true);
});

test("marks unvalidated, cross-schedule, occupied, and Calendar-stale openings for review", () => {
  const record = parsedRecord();
  const store: PersonalAlternateScheduleStore = {
    ...emptyPersonalAlternateScheduleStore(),
    records: [record],
  };
  const cardsFor = (schedule: SafeScheduleBundleV1 | null, storedRecord = record) =>
    personalAlternateScheduleCardsForLesson({
      store: { ...store, records: [storedRecord] },
      date: "2026-07-27",
      className: "Boys Level 3",
      lessonWeek: "Even",
      safeSchedule: schedule,
    })[0];

  assert.match(cardsFor(null).reviewReason, /Import the matching/);
  assert.match(cardsFor({
    ...safeSchedule(),
    schedule: { ...safeSchedule().schedule, scheduleId: "spring_2026" },
  }).reviewReason, /active safe schedule/);
  assert.match(cardsFor(safeSchedule([
    scheduleBlock({ startMinute: 1145, endMinute: 1155 }),
  ])).reviewReason, /no longer open/);
  assert.equal(cardsFor(safeSchedule(), parsedRecord({
    staleReason: "Calendar no longer contains this source opening.",
  })).reviewReason, "Calendar no longer contains this source opening.");
});

test("displays but does not compare Calendar fingerprints to safe-schedule revisions", () => {
  const record = parsedRecord({ sourceFingerprint: "calendar-source-fingerprint" });
  const cards = personalAlternateScheduleCardsForLesson({
    store: { ...emptyPersonalAlternateScheduleStore(), records: [record] },
    date: "2026-07-27",
    className: "Boys Level 3",
    lessonWeek: "Even",
    safeSchedule: safeSchedule(),
  });

  assert.equal(cards[0].sourceFingerprint, "calendar-source-fingerprint");
  assert.equal(cards[0].isStale, false);
});
