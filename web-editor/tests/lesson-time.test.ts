import assert from "node:assert/strict";
import test from "node:test";
import {
  displayLessonTimeRange,
  formatLessonTimeRange,
  formatLessonTimePickerValue,
  normalizePickerTime,
  parseLessonTimeRange,
} from "../app/lesson-time";

test("legacy seeded afternoon ranges become detached 24-hour picker values", () => {
  assert.deepEqual(parseLessonTimeRange("3:30–3:45"), { start: "15:30", end: "15:45" });
  assert.deepEqual(parseLessonTimeRange("4:15-4:40"), { start: "16:15", end: "16:40" });
  assert.deepEqual(parseLessonTimeRange("4:50–5:25"), { start: "16:50", end: "17:25" });
});

test("explicit morning, noon, midnight, and afternoon ranges parse correctly", () => {
  assert.deepEqual(parseLessonTimeRange("8:05 AM–8:25 AM"), { start: "08:05", end: "08:25" });
  assert.deepEqual(parseLessonTimeRange("12:00 PM-12:30 PM"), { start: "12:00", end: "12:30" });
  assert.deepEqual(parseLessonTimeRange("12:00 AM–12:15 AM"), { start: "00:00", end: "00:15" });
  assert.deepEqual(parseLessonTimeRange("3:30 PM–3:45 PM"), { start: "15:30", end: "15:45" });
});

test("24-hour picker ranges remain literal", () => {
  assert.deepEqual(parseLessonTimeRange("15:30–15:45"), { start: "15:30", end: "15:45" });
  assert.deepEqual(parseLessonTimeRange("08:00-09:05"), { start: "08:00", end: "09:05" });
});

test("picker values normalize to five-minute increments", () => {
  assert.equal(normalizePickerTime("9:07"), "09:05");
  assert.equal(normalizePickerTime("15:33"), "15:35");
  assert.equal(normalizePickerTime("15:35"), "15:35");
  assert.equal(normalizePickerTime("23:59"), "23:55");
  assert.equal(normalizePickerTime("25:00"), null);
  assert.equal(normalizePickerTime("3:30 PM"), null);
});

test("complete picker ranges use the consistent 12-hour display", () => {
  assert.equal(formatLessonTimePickerValue("15:30"), "3:30 PM");
  assert.equal(formatLessonTimePickerValue("00:00"), "12:00 AM");
  assert.equal(formatLessonTimeRange({ start: "15:30", end: "15:45" }), "3:30 PM–3:45 PM");
  assert.equal(formatLessonTimeRange({ start: "00:00", end: "00:15" }), "12:00 AM–12:15 AM");
  assert.equal(formatLessonTimeRange({ start: "12:00", end: "12:30" }), "12:00 PM–12:30 PM");
});

test("unusable and reversed ranges fail safely", () => {
  assert.equal(parseLessonTimeRange("TBD"), null);
  assert.equal(parseLessonTimeRange(""), null);
  assert.equal(parseLessonTimeRange("not a time"), null);
  assert.equal(parseLessonTimeRange("3:45 PM–3:30 PM"), null);
  assert.equal(parseLessonTimeRange("3:30 PM–3:30 PM"), null);
  assert.equal(formatLessonTimeRange(null), "TBD");
  assert.equal(formatLessonTimeRange({ start: "15:45", end: "15:30" }), "TBD");
  assert.equal(formatLessonTimeRange({ start: "", end: "15:30" }), "TBD");
});

test("display formatting normalizes known ranges but preserves unusual legacy notes", () => {
  assert.equal(displayLessonTimeRange("3:30–3:45"), "3:30 PM–3:45 PM");
  assert.equal(displayLessonTimeRange("8:05 AM–8:25 AM"), "8:05 AM–8:25 AM");
  assert.equal(displayLessonTimeRange("After announcements"), "After announcements");
  assert.equal(displayLessonTimeRange("   "), "TBD");
});
