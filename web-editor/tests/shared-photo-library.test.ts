import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeSharedPhotoBoards,
  parseSharedPhotoLibraryPayload,
  SHARED_PHOTO_LIBRARY_VERSION,
  sharedPhotoBoardForImport,
  sharedPhotoMimeType,
} from "../app/shared-photo-library";
import type { CustomBoard } from "../app/custom-boards";

const importArea = {
  sourceId: "north-bars",
  title: "North low bars",
  eventName: "Bars",
  photo: "north-bars.png",
  photoScale: 1.2,
  spots: [{ id: "low-bar", name: "Low bar", x: 0.25, y: 0.5 }],
};

function localBoard(): CustomBoard {
  return {
    id: "local-photo-area",
    title: "Local photo area",
    photoId: "photo-local-photo-area",
    filename: "local.png",
    width: 800,
    height: 600,
    spots: [],
    createdAt: "2026-07-25T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z",
  };
}

test("shared photo records use the portable import IDs and preserve photo geometry", () => {
  const board = sharedPhotoBoardForImport(importArea, {
    photo: importArea.photo,
    width: 1600,
    height: 1200,
  }, "2026-07-25T01:00:00.000Z");

  assert.equal(board.id, "custom-board-import-north-bars");
  assert.equal(board.photoId, "photo-custom-board-import-north-bars");
  assert.equal(board.photoScale, 1.2);
  assert.deepEqual(board.spots, importArea.spots);
  assert.equal(sharedPhotoMimeType("north-bars.png"), "image/png");
  assert.equal(sharedPhotoMimeType("north-bars.svg"), null);
});

test("public shared-library responses are validated before they replace browser-local boards", () => {
  const board = sharedPhotoBoardForImport(importArea, {
    photo: importArea.photo,
    width: 1600,
    height: 1200,
  }, "2026-07-25T01:00:00.000Z");
  const payload = {
    version: SHARED_PHOTO_LIBRARY_VERSION,
    updatedAt: "2026-07-25T01:00:00.000Z",
    areas: [{
      sourceId: importArea.sourceId,
      board,
      imageUrl: "https://shared.example/api/shared-photo-areas/photo-custom-board-import-north-bars",
    }],
  };
  const parsed = parseSharedPhotoLibraryPayload(payload);
  assert.ok(parsed);
  assert.equal(parsed?.areas[0].board.title, "North low bars");

  const merged = mergeSharedPhotoBoards([localBoard(), { ...board, title: "Old local copy" }], parsed!.areas);
  assert.deepEqual(merged.map((candidate) => candidate.id), ["local-photo-area", board.id]);
  assert.equal(merged[1].title, "North low bars");

  assert.equal(parseSharedPhotoLibraryPayload({ ...payload, areas: [{ ...payload.areas[0], imageUrl: "javascript:bad" }] }), null);
  assert.equal(parseSharedPhotoLibraryPayload({ ...payload, areas: [{ ...payload.areas[0], sourceId: "wrong-id" }] }), null);
});
