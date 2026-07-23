import assert from "node:assert/strict";
import test from "node:test";
import { createIdeaPhotoId, deleteIdeaPhoto, removeIdeaPhoto } from "../app/idea-photos";

test("idea photo IDs stay opaque, unique, and safe to persist beside a local idea", () => {
  const first = createIdeaPhotoId("local idea / floor");
  const second = createIdeaPhotoId("local idea / floor");
  const fallback = createIdeaPhotoId("   ");

  assert.match(first, /^idea-photo-local-idea-floor-[a-z0-9]+$/i);
  assert.match(second, /^idea-photo-local-idea-floor-[a-z0-9]+$/i);
  assert.notEqual(first, second);
  assert.match(fallback, /^idea-photo-idea-[a-z0-9]+$/i);
  assert.equal(deleteIdeaPhoto, removeIdeaPhoto);
});
