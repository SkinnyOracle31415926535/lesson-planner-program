import assert from "node:assert/strict";
import test from "node:test";

import type { LibraryItem } from "../app/lesson-data";
import { STATION_CANVAS, type StationSetup } from "../app/station-setups";
import {
  copySharedIdeaLibraryState,
  isSharedIdeaLibraryEmpty,
  parseSharedIdeaLibraryManifest,
  parseSharedIdeaLibraryState,
  parseSharedIdeaLibraryWorkspace,
  parseSharedIdeaLibraryWrite,
  sharedIdeaLibraryFingerprint,
  sharedIdeaMediaReferences,
  sharedIdeaMediaUrl,
} from "../app/shared-idea-library";

function idea(id: string): LibraryItem {
  return {
    id,
    kind: "DRILL",
    title: "Handstand Shapes",
    description: "Build a long, tight body shape.",
    tags: ["handstand"],
    accent: "cyan",
    events: ["floor"],
    skills: ["handstand"],
    goals: ["body shape"],
    instructions: ["Hold a hollow shape."],
    coachingCues: ["Long arms"],
    variants: [],
    sourceRefs: [],
    sourceStatus: "local",
    sourceType: "drill",
  };
}

const station: StationSetup = {
  id: "station-handstand",
  version: 1,
  canvas: STATION_CANVAS,
  objects: [{
    id: "station-object-panel",
    kind: "equipment",
    assetId: "panel",
    color: "blue",
    x: 0,
    y: 0,
    width: 192,
    height: 96,
    rotation: 0,
    zIndex: 1,
  }],
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

function state() {
  const card = { ...idea("idea-handstand"), stationSetupId: station.id, stationPreviewKind: "pixel-station" as const };
  return {
    version: 1,
    preferences: {
      version: 6,
      gemIds: [card.id],
      customCards: [card],
      recentIdeaIds: [card.id],
      archivedIdeaIds: [],
      restoredIdeaIds: [],
      itemOverridesById: {},
      removedIdeaIds: [],
    },
    stationSetups: [station],
  };
}

test("public Idea Library state keeps preferences and referenced pixel stations together", () => {
  const parsed = parseSharedIdeaLibraryState(state());
  assert.ok(parsed);
  assert.equal(parsed?.preferences.customCards[0]?.stationSetupId, station.id);
  assert.equal(parsed?.stationSetups[0]?.objects.length, 1);
  assert.equal(isSharedIdeaLibraryEmpty(parsed!), false);

  const copied = copySharedIdeaLibraryState(parsed!);
  copied.preferences.customCards[0]!.tags.push("changed-only-in-copy");
  assert.deepEqual(parsed?.preferences.customCards[0]?.tags, ["handstand"]);
  assert.match(sharedIdeaLibraryFingerprint(parsed!) ?? "", /^\d+:/);
});

test("public Idea Library parser rejects unbounded or orphaned public records", () => {
  assert.equal(parseSharedIdeaLibraryState({ ...state(), unexpected: true }), null);
  assert.equal(parseSharedIdeaLibraryState({ ...state(), stationSetups: [] }), null);
  assert.equal(parseSharedIdeaLibraryState({
    ...state(),
    preferences: { ...state().preferences, customCards: [{ ...idea("__proto__") }] },
  }), null);
});

test("workspace and write envelopes require one exact, versioned shape", () => {
  const payload = state();
  assert.equal(parseSharedIdeaLibraryManifest({ version: 1, revision: 0, updatedAt: null })?.revision, 0);
  assert.equal(parseSharedIdeaLibraryManifest({ version: 1, revision: 0, updatedAt: "2026-07-25T00:00:00.000Z" }), null);
  assert.deepEqual(parseSharedIdeaLibraryWrite({ version: 1, value: payload })?.preferences.gemIds, ["idea-handstand"]);
  assert.equal(parseSharedIdeaLibraryWrite({ version: 1, value: payload, extra: true }), null);
  assert.equal(parseSharedIdeaLibraryWorkspace({
    version: 1,
    revision: 3,
    updatedAt: "2026-07-25T00:00:00.000Z",
    value: payload,
  })?.revision, 3);
});

test("media references include hidden overrides and use the canonical public service", () => {
  const mediaCard: LibraryItem = {
    ...idea("idea-media"),
    mediaId: "idea-photo-idea-media-abc123",
    mediaKind: "image",
    mediaFilename: "shape.jpg",
    mediaMimeType: "image/jpeg",
  };
  const parsed = parseSharedIdeaLibraryState({
    version: 1,
    preferences: {
      version: 6,
      gemIds: [],
      customCards: [mediaCard],
      recentIdeaIds: [],
      archivedIdeaIds: [],
      restoredIdeaIds: [],
      itemOverridesById: { "idea-media-override": mediaCard },
      removedIdeaIds: [],
    },
    stationSetups: [],
  });
  assert.ok(parsed);
  assert.equal(sharedIdeaMediaReferences(parsed!).length, 1);
  assert.match(sharedIdeaMediaUrl("idea-photo-idea-media-abc123"), /\/api\/shared-idea-media\/idea-photo-idea-media-abc123$/);
});
