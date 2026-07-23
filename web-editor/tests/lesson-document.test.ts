import assert from "node:assert/strict";
import test from "node:test";
import {
  documentDrillTitle,
  lessonPlanDownloadFilename,
  listedMats,
  standaloneLessonPlanHtml,
} from "../app/lesson-document";

test("generated lesson plan omits a redundant area prefix but keeps useful mixed-area labels", () => {
  assert.equal(documentDrillTitle("PB / HB", "PB / HB", "PB/HB", "Spot to Independent"), "Spot to Independent");
  assert.equal(documentDrillTitle("F4 + TS", "F4 + TS", "F4", "Handstand shapes"), "F4 · Handstand shapes");
  assert.equal(documentDrillTitle("F4 + TS", "F4 + TS", "TS", "Round-off drills"), "TS · Round-off drills");
  assert.equal(documentDrillTitle("TEXT", "TEXT", "TEXT", "Coach meeting"), "Coach meeting");
});

test("generated lesson plan lists mats only when a coach entered them", () => {
  assert.deepEqual(listedMats(undefined), []);
  assert.deepEqual(listedMats(["", "  "]), []);
  assert.deepEqual(listedMats([" panel mat ", "8-inch mat", ""]), ["panel mat", "8-inch mat"]);
});

test("lesson plan downloads receive a stable private local filename", () => {
  assert.equal(lessonPlanDownloadFilename("Level 3 Boys", "2026-07-20"), "lesson-plan-2026-07-20-level-3-boys.html");
  assert.equal(lessonPlanDownloadFilename("  Élite / Boys' Team  ", "not-a-date"), "lesson-plan-saved-elite-boys-team.html");
  assert.equal(lessonPlanDownloadFilename("", "2026-02-30"), "lesson-plan-saved.html");
});

test("standalone lesson downloads are styled, escaped, and offline only", () => {
  const paper = '<article class="legacy-document-paper"><h3>LEVEL 3 LESSON</h3></article>';
  const html = standaloneLessonPlanHtml({
    pageTitle: '</title><script>alert("no")</script>',
    renderedPaperHtml: paper,
  });

  assert.equal(html.startsWith("<!doctype html>"), true);
  assert.equal(html.includes("Content-Security-Policy"), true);
  assert.equal(html.includes("STYLED OFFLINE COPY"), true);
  assert.equal(html.includes("repeating-linear-gradient"), true);
  assert.equal(html.includes("&lt;/title&gt;&lt;script&gt;"), true);
  assert.equal(html.includes("</title><script>"), false);
  assert.equal(html.includes("<link"), false);
  assert.equal(html.includes("http://"), false);
  assert.equal(html.includes("https://"), false);
  assert.equal(html.split(paper).length - 1, 1);
});
