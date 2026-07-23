import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_LIBRARY_TRANSFER_FILE_BYTES,
  createLibraryTransferBundle,
  libraryTransferFilename,
  mergeLibraryTransfer,
  parseLibraryTransferJson,
  serializeLibraryTransfer,
} from "../app/library-transfer";
import type { LibraryItem } from "../app/lesson-data";

function idea(id: string, title = id): LibraryItem {
  return {
    id,
    kind: "SKILL",
    title,
    description: `${title} coaching note`,
    tags: ["floor"],
    accent: "pink",
    mats: ["panel mat"],
    events: ["Floor"],
    skills: [title],
    goals: [],
    instructions: ["Keep a tight shape."],
    coachingCues: ["Push tall."],
    variants: [{
      id: `${id}-variant`,
      title: "Easy setup",
      instructions: ["Use a line."],
      sourceRefs: [],
    }],
    sourceRefs: [],
    sourceStatus: "local",
    sourceType: "skill",
  };
}

test("library exports are versioned, detached, and omit browser-local photos", () => {
  const source = {
    ...idea("skill-one", "Handstand"),
    photoId: "photo-one",
    photoFilename: "handstand.jpg",
    photoWidth: 1200,
    photoHeight: 800,
  };
  const bundle = createLibraryTransferBundle([source], "2026-07-23T12:00:00.000Z");

  assert.equal(bundle.format, "gym-lesson-planner-idea-library");
  assert.equal(bundle.version, 1);
  assert.equal(bundle.photosIncluded, false);
  assert.equal("photoId" in bundle.ideas[0], false);

  source.tags.push("changed-after-export");
  assert.deepEqual(bundle.ideas[0].tags, ["floor"]);

  const parsed = parseLibraryTransferJson(serializeLibraryTransfer([source], bundle.exportedAt));
  assert.equal(parsed.ok, true);
});

test("library import rejects malformed, oversized, and photo-bearing files", () => {
  assert.equal(parseLibraryTransferJson("{").ok, false);
  assert.equal(parseLibraryTransferJson("{}", MAX_LIBRARY_TRANSFER_FILE_BYTES + 1).ok, false);

  const withPhotos = createLibraryTransferBundle([idea("skill-one")]);
  const unsafe = { ...withPhotos, photosIncluded: true };
  const photoResult = parseLibraryTransferJson(JSON.stringify(unsafe));
  assert.equal(photoResult.ok, false);
  if (!photoResult.ok) assert.match(photoResult.error, /does not import photos/);

  const unknown = { ...withPhotos, roster: ["No"] };
  assert.equal(parseLibraryTransferJson(JSON.stringify(unknown)).ok, false);
});

test("library merge adds only unseen IDs and never overwrites existing ideas", () => {
  const existing = {
    ...idea("same-id", "Work iPad version"),
    photoId: "work-photo",
    photoFilename: "work-photo.jpg",
    photoWidth: 800,
    photoHeight: 600,
  };
  const incomingDuplicate = idea("same-id", "Personal iPad version");
  const incomingNew = idea("new-id", "Roundoff");
  const result = mergeLibraryTransfer([existing], [incomingDuplicate, incomingNew]);

  assert.equal(result.duplicateCount, 1);
  assert.deepEqual(result.newIdeas.map((entry) => entry.title), ["Roundoff"]);
  assert.deepEqual(result.mergedIdeas.map((entry) => entry.title), ["Roundoff", "Work iPad version"]);
  assert.equal(result.mergedIdeas[1].photoId, "work-photo");
});

test("library transfer filenames use the local calendar date", () => {
  assert.equal(libraryTransferFilename(new Date(2026, 6, 23, 23, 30)), "lesson-planner-ideas-2026-07-23.json");
});
