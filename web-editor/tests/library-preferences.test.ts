import assert from "node:assert/strict";
import test from "node:test";
import type { LibraryItem } from "../app/lesson-data";
import {
  normalizedLibraryMedia,
  permanentlyDeleteLibraryIdea,
  replacedLibraryMediaId,
  withoutLibraryMedia,
} from "../app/library-preferences";

function idea(id: string, mediaId?: string): LibraryItem {
  return {
    id,
    kind: "SKILL",
    title: id,
    description: "Local idea",
    tags: [],
    accent: "pink",
    events: [],
    skills: [],
    goals: [],
    instructions: [],
    coachingCues: [],
    variants: [],
    sourceRefs: [],
    sourceStatus: "local",
    sourceType: "skill",
    ...(mediaId ? {
      mediaId,
      mediaKind: "video",
      mediaFilename: "clip.mov",
      mediaMimeType: "video/quicktime",
    } : {}),
  };
}

test("permanent deletion clears every library reference and returns attached media", () => {
  const deleted = idea("delete-me", "media-delete-me");
  const kept = idea("keep-me");
  const result = permanentlyDeleteLibraryIdea({
    gemIds: [deleted.id, kept.id],
    customCards: [deleted, kept],
    recentIdeaIds: [deleted.id, kept.id],
    archivedIdeaIds: [deleted.id],
    restoredIdeaIds: [deleted.id],
    itemOverridesById: { [deleted.id]: deleted, [kept.id]: kept },
    removedIdeaIds: [deleted.id],
  }, deleted);

  assert.equal(result.mediaId, "media-delete-me");
  assert.deepEqual(result.next.gemIds, [kept.id]);
  assert.deepEqual(result.next.customCards, [kept]);
  assert.deepEqual(result.next.recentIdeaIds, [kept.id]);
  assert.deepEqual(result.next.archivedIdeaIds, []);
  assert.deepEqual(result.next.restoredIdeaIds, []);
  assert.deepEqual(result.next.itemOverridesById, { [kept.id]: kept });
  assert.deepEqual(result.next.removedIdeaIds, []);
});

test("legacy photo metadata is also returned for cleanup", () => {
  const deleted = { ...idea("legacy"), photoId: "legacy-photo" };
  const result = permanentlyDeleteLibraryIdea({
    gemIds: [],
    customCards: [deleted],
    recentIdeaIds: [],
    archivedIdeaIds: [],
    restoredIdeaIds: [],
    itemOverridesById: {},
    removedIdeaIds: [],
  }, deleted);

  assert.equal(result.mediaId, "legacy-photo");
});

test("legacy photo metadata migrates to generic image metadata", () => {
  const legacy = {
    ...idea("legacy-migration"),
    photoId: "legacy-photo",
    photoFilename: "legacy.jpg",
    photoWidth: 1200,
    photoHeight: 800,
  };

  assert.deepEqual(normalizedLibraryMedia(legacy), {
    mediaId: "legacy-photo",
    mediaKind: "image",
    mediaFilename: "legacy.jpg",
    mediaMimeType: "image/*",
    mediaWidth: 1200,
    mediaHeight: 800,
  });
  assert.equal(withoutLibraryMedia(legacy).photoId, undefined);
});

test("attachment replacement and removal identify only the old media for cleanup", () => {
  assert.equal(replacedLibraryMediaId("old-media", "new-media"), "old-media");
  assert.equal(replacedLibraryMediaId("old-media", undefined), "old-media");
  assert.equal(replacedLibraryMediaId("same-media", "same-media"), null);
  assert.equal(replacedLibraryMediaId(undefined, "new-media"), null);
});
