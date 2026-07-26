import assert from "node:assert/strict";
import test from "node:test";
import { summer2026SafeScheduleFixture } from "../fixtures/summer-2026-safe-schedule-fixture";
import {
  DEFAULT_SAFE_SCHEDULE_WEEK_ANCHOR,
  MAX_SAFE_SCHEDULE_FILE_BYTES,
  emptySafeScheduleStorage,
  isSafeScheduleInterval,
  normalizeOpenPanelSelection,
  normalizeSafeScheduleStorage,
  openPanelSelectionAllowed,
  panelSelectionsConflict,
  parseSafeScheduleBundleJson,
  replaceSafeScheduleBundle,
  resolveAreaAvailabilityForInterval,
  resolveOpenAreaAvailability,
  resolveSafeScheduleDay,
  resolveSafeScheduleWeekCycle,
  safeScheduleGroups,
  scheduleWeekStartDate,
  setSafeScheduleClassGroup,
  setSafeScheduleManualWeek,
  setSafeScheduleWeekAnchor,
  suggestSafeScheduleGroup,
  type SafeScheduleBundleV1,
  type SafeScheduleTimeBlock,
} from "../app/local-schedule";

function block(overrides: Partial<SafeScheduleTimeBlock> = {}): SafeScheduleTimeBlock {
  return {
    bookingId: "block-default",
    day: "Mon",
    week: "Even",
    group: "B3",
    startMinute: 600,
    endMinute: 630,
    canonicalEventLabel: "Open",
    eventLabel: "Open",
    equipment: [],
    activityType: "open",
    confidence: "high",
    reviewStatus: "auto_extracted",
    ...overrides,
  };
}

function bundle(timeBlocks: SafeScheduleTimeBlock[] = [block()]): SafeScheduleBundleV1 {
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
      sourceId: "schedule:test",
      scheduleId: "test",
      revision: "revision-1",
      timezone: "America/Los_Angeles",
      effectiveStart: "2026-06-15",
      effectiveEnd: null,
      calendarWeekRule: {
        ruleId: "test-rule",
        timezone: "America/Los_Angeles",
        weekStart: "monday",
        weekEnd: "sunday",
        monthWeekAnchor: "monday_sunday_week_containing_month_day_1",
        oddWeekOrdinals: [1, 3],
        evenWeekOrdinals: [2, 4],
        weekFiveOrLaterRequiresManualConfirmation: true,
        overflowWeekBehavior: "manual_confirmation_required",
      },
      equipment: [
        { name: "F1", displayOrder: 0, isSingleUnit: true },
        { name: "Vault", displayOrder: 1, isSingleUnit: true },
      ],
      timeBlocks,
      collisionWarnings: { warningCount: 1, statusCounts: { needs_review: 1 } },
    },
  };
}

test("strict schedule import accepts only the safe allowlisted contract", () => {
  const valid = parseSafeScheduleBundleJson(JSON.stringify(bundle()));
  assert.equal(valid.ok, true);

  const unsafePrivacy: { privacy: { studentRecordsIncluded: boolean } } = structuredClone(bundle());
  unsafePrivacy.privacy.studentRecordsIncluded = true;
  const privacyResult = parseSafeScheduleBundleJson(JSON.stringify(unsafePrivacy));
  assert.equal(privacyResult.ok, false);
  if (!privacyResult.ok) assert.match(privacyResult.error, /studentRecordsIncluded/);

  const unknownField: { schedule: { privateRoster?: string[] } } = structuredClone(bundle());
  unknownField.schedule.privateRoster = ["No"];
  const unknownResult = parseSafeScheduleBundleJson(JSON.stringify(unknownField));
  assert.equal(unknownResult.ok, false);
  if (!unknownResult.ok) assert.match(unknownResult.error, /privateRoster/);

  assert.equal(parseSafeScheduleBundleJson("{}", MAX_SAFE_SCHEDULE_FILE_BYTES + 1).ok, false);
});

test("duplicate bookings and malformed five-minute ranges are rejected", () => {
  const duplicate = bundle([block({ bookingId: "same" }), block({ bookingId: "same", group: "B4" })]);
  const duplicateResult = parseSafeScheduleBundleJson(JSON.stringify(duplicate));
  assert.equal(duplicateResult.ok, false);
  if (!duplicateResult.ok) assert.match(duplicateResult.error, /Duplicate bookingId/);

  const nonFive = bundle([block({ startMinute: 601 })]);
  const nonFiveResult = parseSafeScheduleBundleJson(JSON.stringify(nonFive));
  assert.equal(nonFiveResult.ok, false);
  if (!nonFiveResult.ok) assert.match(nonFiveResult.error, /five-minute/);

  const reversed = bundle([block({ startMinute: 630, endMinute: 600 })]);
  assert.equal(parseSafeScheduleBundleJson(JSON.stringify(reversed)).ok, false);

  const midnightEnding = bundle([block({ startMinute: 1435, endMinute: 1440 })]);
  const midnightResult = parseSafeScheduleBundleJson(JSON.stringify(midnightEnding));
  assert.equal(midnightResult.ok, false);
  if (!midnightResult.ok) assert.match(midnightResult.error, /before midnight/);
});

test("Open is resolved only from activityType and never from a label or gap", () => {
  const schedule = bundle([
    block({ bookingId: "explicit-open" }),
    block({ bookingId: "label-only", startMinute: 640, endMinute: 650, canonicalEventLabel: "Open", eventLabel: "Open", equipment: ["F1"], activityType: "rotation" }),
  ]);
  const resolution = resolveSafeScheduleDay(schedule, "2026-07-13", "B3");
  assert.equal(resolution.status, "ready");
  assert.deepEqual(resolution.openBlocks.map((entry) => entry.bookingId), ["explicit-open"]);
  assert.deepEqual(resolution.nonOpenBlocks.map((entry) => entry.bookingId), ["label-only"]);
});

test("full-block availability counts every group, ignores Open occupancy, and uses half-open overlap", () => {
  const open = block({ bookingId: "explicit-open" });
  const schedule = bundle([
    open,
    block({ bookingId: "partial-f1", group: "G1", startMinute: 595, endMinute: 605, canonicalEventLabel: "F1", eventLabel: "F1", equipment: ["F1"], activityType: "rotation" }),
    block({ bookingId: "partial-f2", group: "G2", startMinute: 625, endMinute: 635, canonicalEventLabel: "F2", eventLabel: "F2", equipment: ["F2"], activityType: "warmup" }),
    block({ bookingId: "pb-support", group: "B3", startMinute: 610, endMinute: 620, canonicalEventLabel: "PB", eventLabel: "PB", equipment: ["PB"], activityType: "conditioning" }),
    block({ bookingId: "touching-vault", group: "G3", startMinute: 630, endMinute: 640, canonicalEventLabel: "Vault", eventLabel: "Vault", equipment: ["Vault"], activityType: "rotation" }),
    block({ bookingId: "other-open", group: "G4", startMinute: 610, endMinute: 620, canonicalEventLabel: "Open", eventLabel: "Open", equipment: ["F3"], activityType: "open" }),
    block({ bookingId: "unknown", group: "G5", startMinute: 610, endMinute: 620, canonicalEventLabel: "UB", eventLabel: "UB", equipment: ["UB"], activityType: "support" }),
  ]);
  const resolution = resolveSafeScheduleDay(schedule, "2026-07-13", "B3");
  const availability = resolveOpenAreaAvailability(resolution, open, ["f1", "f2", "f3", "fx", "pb", "pb-hb", "vault"]);
  assert.deepEqual(availability.availablePanelIds, ["f3", "vault"]);
  assert.deepEqual(availability.unavailablePanelIds, ["f1", "f2", "fx", "pb", "pb-hb"]);
  assert.deepEqual(availability.unmappedEquipment, ["UB"]);
});

test("an arbitrary lesson interval finds only full-duration open panels", () => {
  const schedule = bundle([
    block({ bookingId: "current-pb", canonicalEventLabel: "PB", eventLabel: "PB", equipment: ["PB"], activityType: "rotation" }),
    block({ bookingId: "partial-f1", group: "G1", startMinute: 595, endMinute: 605, canonicalEventLabel: "F1", eventLabel: "F1", equipment: ["F1"], activityType: "rotation" }),
    block({ bookingId: "touching-vault", group: "G2", startMinute: 630, endMinute: 640, canonicalEventLabel: "Vault", eventLabel: "Vault", equipment: ["Vault"], activityType: "rotation" }),
    block({ bookingId: "other-open", group: "G3", startMinute: 610, endMinute: 620, canonicalEventLabel: "Open", eventLabel: "Open", equipment: ["F3"], activityType: "open" }),
    block({ bookingId: "unknown", group: "G4", startMinute: 610, endMinute: 620, canonicalEventLabel: "UB", eventLabel: "UB", equipment: ["UB"], activityType: "support" }),
  ]);
  const resolution = resolveSafeScheduleDay(schedule, "2026-07-13", "B3");
  const availability = resolveAreaAvailabilityForInterval(
    resolution,
    { startMinute: 600, endMinute: 630 },
    ["f1", "f2", "fx", "pb", "pb-hb", "vault"],
  );

  assert.deepEqual(availability, {
    startMinute: 600,
    endMinute: 630,
    occupiedSemanticZoneIds: ["zone-floor-f1", "zone-parallel-bars"],
    availablePanelIds: ["f2", "vault"],
    unavailablePanelIds: ["f1", "fx", "pb", "pb-hb"],
    unmappedEquipment: ["UB"],
  });
});

test("event availability rejects unsafe intervals and unresolved schedule days", () => {
  const schedule = bundle([block({ activityType: "rotation", canonicalEventLabel: "F1", eventLabel: "F1", equipment: ["F1"] })]);
  const ready = resolveSafeScheduleDay(schedule, "2026-07-13", "B3");
  const candidates = ["f1", "f2"];

  assert.equal(isSafeScheduleInterval({ startMinute: 600, endMinute: 630 }), true);
  assert.equal(isSafeScheduleInterval({ startMinute: 601, endMinute: 630 }), false);
  assert.equal(isSafeScheduleInterval({ startMinute: 630, endMinute: 630 }), false);
  assert.equal(isSafeScheduleInterval({ startMinute: 1435, endMinute: 1440 }), false);
  assert.equal(isSafeScheduleInterval({ startMinute: 600, endMinute: 1445 }), false);
  assert.equal(resolveAreaAvailabilityForInterval(ready, { startMinute: 601, endMinute: 630 }, candidates), null);
  assert.equal(resolveAreaAvailabilityForInterval(ready, { startMinute: 630, endMinute: 600 }, candidates), null);

  const unresolved = resolveSafeScheduleDay(schedule, "2026-07-13", null);
  assert.equal(unresolved.status, "group_required");
  assert.equal(resolveAreaAvailabilityForInterval(unresolved, { startMinute: 600, endMinute: 630 }, candidates), null);
});

test("composite and single area selections cannot overlap semantically", () => {
  assert.equal(panelSelectionsConflict("fx", "f1"), true);
  assert.equal(panelSelectionsConflict("pb-hb", "pb"), true);
  assert.equal(panelSelectionsConflict("f1", "vault"), false);
  assert.equal(openPanelSelectionAllowed(["fx"], "f1"), false);
  assert.deepEqual(normalizeOpenPanelSelection(["fx", "f1", "vault"], ["fx", "f1", "vault"]), ["fx", "vault"]);
});

test("the confirmed July 27 week anchors a continuous Monday Odd/Even cycle in both directions", () => {
  assert.equal(scheduleWeekStartDate("2026-07-27"), "2026-07-27");
  assert.equal(scheduleWeekStartDate("2026-08-02"), "2026-07-27");
  assert.deepEqual(resolveSafeScheduleWeekCycle("2026-07-27"), {
    week: "Even",
    weekStartDate: "2026-07-27",
    anchor: DEFAULT_SAFE_SCHEDULE_WEEK_ANCHOR,
  });
  assert.equal(resolveSafeScheduleWeekCycle("2026-08-02").week, "Even");
  assert.equal(resolveSafeScheduleWeekCycle("2026-08-03").week, "Odd");
  assert.equal(resolveSafeScheduleWeekCycle("2026-08-10").week, "Even");
  assert.equal(resolveSafeScheduleWeekCycle("2026-07-20").week, "Odd");
  assert.equal(resolveSafeScheduleWeekCycle("2026-07-13").week, "Even");

  const resolved = resolveSafeScheduleDay(bundle([block({ week: "Even" })]), "2026-07-27", "B3");
  assert.equal(resolved.monthWeekOrdinal, 5);
  assert.equal(resolved.status, "ready");
  assert.equal(resolved.resolvedWeek, "Even");
  assert.equal(resolved.weekResolutionSource, "anchored_cycle");
  assert.equal(resolved.openBlocks.length, 1);

  const redundantLegacyConfirmation = resolveSafeScheduleDay(
    bundle([block({ week: "Even" })]),
    "2026-07-27",
    "B3",
    "Even",
  );
  assert.equal(redundantLegacyConfirmation.weekResolutionSource, "anchored_cycle");
});

test("shared week anchors normalize chosen dates to Monday and the latest prior anchor governs", () => {
  const initial = emptySafeScheduleStorage();
  const first = setSafeScheduleWeekAnchor(initial, "2026-09-02", "Even");
  assert.ok(first);
  assert.deepEqual(first.weekAnchors, [
    DEFAULT_SAFE_SCHEDULE_WEEK_ANCHOR,
    { weekStartDate: "2026-08-31", week: "Even" },
  ]);
  assert.equal(resolveSafeScheduleWeekCycle("2026-08-30", first.weekAnchors).week, "Even");
  assert.equal(resolveSafeScheduleWeekCycle("2026-08-31", first.weekAnchors).week, "Even");
  assert.equal(resolveSafeScheduleWeekCycle("2026-09-07", first.weekAnchors).week, "Odd");

  const second = setSafeScheduleWeekAnchor(first, "2026-09-17", "Odd");
  assert.ok(second);
  assert.equal(resolveSafeScheduleWeekCycle("2026-09-13", second.weekAnchors).week, "Odd");
  assert.equal(resolveSafeScheduleWeekCycle("2026-09-14", second.weekAnchors).week, "Odd");
  assert.equal(resolveSafeScheduleWeekCycle("2026-09-21", second.weekAnchors).week, "Even");
  assert.equal(setSafeScheduleWeekAnchor(second, "2026-07-29", "Odd"), null);
});

test("storage v1 migrates safely while v2 strictly validates Monday anchors and keeps exact-date confirmations", () => {
  const legacy = {
    version: 1,
    bundle: null,
    scheduleGroupByClassId: {},
    manualWeekByDate: { "2026-07-28": "Odd" },
  };
  const migrated = normalizeSafeScheduleStorage(legacy);
  assert.deepEqual(migrated, {
    version: 2,
    bundle: null,
    scheduleGroupByClassId: {},
    manualWeekByDate: { "2026-07-28": "Odd" },
    weekAnchors: [DEFAULT_SAFE_SCHEDULE_WEEK_ANCHOR],
  });

  const withBundle = replaceSafeScheduleBundle(migrated!, bundle([
    block({ bookingId: "even", day: "Tues", week: "Even" }),
    block({ bookingId: "odd", day: "Tues", week: "Odd" }),
  ]));
  const legacyResolution = resolveSafeScheduleDay(
    withBundle.bundle!,
    "2026-07-28",
    "B3",
    withBundle.manualWeekByDate["2026-07-28"],
    withBundle.weekAnchors,
  );
  assert.equal(legacyResolution.resolvedWeek, "Odd");
  assert.equal(legacyResolution.weekResolutionSource, "legacy_exact_date");
  assert.deepEqual(legacyResolution.openBlocks.map((entry) => entry.bookingId), ["odd"]);

  const reanchored = setSafeScheduleWeekAnchor(withBundle, "2026-07-30", "Even");
  assert.ok(reanchored);
  assert.deepEqual(reanchored.manualWeekByDate, {});
  assert.equal(normalizeSafeScheduleStorage({ ...migrated, weekAnchors: [{ weekStartDate: "2026-07-28", week: "Even" }] }), null);
  assert.equal(normalizeSafeScheduleStorage({ ...migrated, weekAnchors: [{ ...DEFAULT_SAFE_SCHEDULE_WEEK_ANCHOR, extra: true }] }), null);
  assert.equal(normalizeSafeScheduleStorage({ ...migrated, weekAnchors: [{ weekStartDate: "2026-08-03", week: "Odd" }] }), null);
});

test("class mappings are explicit exact values and survive only compatible replacements", () => {
  const first = replaceSafeScheduleBundle(emptySafeScheduleStorage(), bundle([
    block({ group: "B3" }),
    block({ bookingId: "b4-open", group: "B4" }),
  ]));
  assert.deepEqual(safeScheduleGroups(first.bundle!), ["B3", "B4"]);
  const fuzzy = setSafeScheduleClassGroup(first, "class-one", "b3");
  assert.equal(fuzzy, null);
  const mapped = setSafeScheduleClassGroup(first, "class-one", "B3");
  assert.equal(mapped?.scheduleGroupByClassId["class-one"], "B3");
  const withWeek = setSafeScheduleManualWeek(mapped!, "2026-07-27", "Odd");
  assert.equal(withWeek?.manualWeekByDate["2026-07-27"], "Odd");

  const replacement = replaceSafeScheduleBundle(withWeek!, bundle([block({ group: "B4" })]));
  assert.deepEqual(replacement.scheduleGroupByClassId, {});
  assert.equal(replacement.manualWeekByDate["2026-07-27"], "Odd");
});

test("schedule group suggestions only surface an exact or unique explicit expansion", () => {
  const availableGroups = ["B3", "B4-6", "G1/2"];
  assert.equal(suggestSafeScheduleGroup("B3", availableGroups), "B3");
  assert.equal(suggestSafeScheduleGroup("B4", availableGroups), "B4-6");
  assert.equal(suggestSafeScheduleGroup("G1", availableGroups), "G1/2");

  assert.equal(suggestSafeScheduleGroup("b4", availableGroups), null);
  assert.equal(suggestSafeScheduleGroup("B4 ", availableGroups), null);
  assert.equal(suggestSafeScheduleGroup("B5", availableGroups), null);
  assert.equal(suggestSafeScheduleGroup("B4", ["B4-6", "B4/5"]), null);
  assert.equal(suggestSafeScheduleGroup("B4", ["B40-6"]), null);
});

test("the Summer 2026 local fixture is a privacy-safe, advisory-only schedule bundle", () => {
  const raw = JSON.stringify(summer2026SafeScheduleFixture);
  const parsed = parseSafeScheduleBundleJson(raw);

  assert.equal(parsed.ok, true);
  assert.equal(summer2026SafeScheduleFixture.schedule.timeBlocks.length, 2106);
  assert.equal(summer2026SafeScheduleFixture.schedule.effectiveStart, "2026-06-15");
  assert.equal(summer2026SafeScheduleFixture.schedule.revision, "summer-2026-accepted-as-is-source-draft-color-filled");
  assert.equal(summer2026SafeScheduleFixture.schedule.collisionWarnings.warningCount, 189);
  assert.equal(raw.includes("/Users/"), false);
  assert.equal(raw.includes("raw_label"), false);
  assert.equal(raw.includes("source_class_name"), false);
  assert.equal(raw.includes("source_text_fragments"), false);
  assert.equal(raw.includes("booking_id"), false);
});
