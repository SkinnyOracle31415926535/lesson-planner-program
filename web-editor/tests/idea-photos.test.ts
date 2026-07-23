import assert from "node:assert/strict";
import test from "node:test";
import {
  IDEA_IMAGE_MAX_BYTES,
  IDEA_VIDEO_MAX_BYTES,
  createIdeaMediaId,
  createIdeaPhotoId,
  deleteIdeaPhoto,
  ideaMediaKindForFile,
  ideaMediaValidationMessage,
  removeIdeaMedia,
  removeIdeaPhoto,
} from "../app/idea-photos";

test("idea photo IDs stay opaque, unique, and safe to persist beside a local idea", () => {
  const first = createIdeaPhotoId("local idea / floor");
  const second = createIdeaPhotoId("local idea / floor");
  const fallback = createIdeaPhotoId("   ");

  assert.match(first, /^idea-photo-local-idea-floor-[a-z0-9]+$/i);
  assert.match(second, /^idea-photo-local-idea-floor-[a-z0-9]+$/i);
  assert.notEqual(first, second);
  assert.match(fallback, /^idea-photo-idea-[a-z0-9]+$/i);
  assert.equal(createIdeaPhotoId, createIdeaMediaId);
  assert.equal(deleteIdeaPhoto, removeIdeaPhoto);
  assert.equal(removeIdeaPhoto, removeIdeaMedia);
});

test("idea media accepts supported photos and videos within their local limits", () => {
  const image = { name: "shape.webp", type: "image/webp", size: IDEA_IMAGE_MAX_BYTES };
  const video = { name: "routine.mov", type: "video/quicktime", size: IDEA_VIDEO_MAX_BYTES };

  assert.equal(ideaMediaKindForFile(image), "image");
  assert.equal(ideaMediaValidationMessage(image), null);
  assert.equal(ideaMediaKindForFile(video), "video");
  assert.equal(ideaMediaValidationMessage(video), null);
});

test("idea media rejects unsupported files and oversized attachments", () => {
  assert.equal(
    ideaMediaValidationMessage({ name: "shape.png", type: "image/png", size: IDEA_IMAGE_MAX_BYTES + 1 }),
    "USE A PHOTO UNDER 35 MB",
  );
  assert.equal(
    ideaMediaValidationMessage({ name: "routine.mp4", type: "video/mp4", size: IDEA_VIDEO_MAX_BYTES + 1 }),
    "USE A VIDEO UNDER 100 MB",
  );
  assert.match(
    ideaMediaValidationMessage({ name: "unsafe.svg", type: "image/svg+xml", size: 10 }) ?? "",
    /JPEG/,
  );
});
