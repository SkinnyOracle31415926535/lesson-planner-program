import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyFloorPhotoAreaStorage,
  floorPhotoAreaStorage,
  isFloorPhotoAreaStorage,
} from "../app/floor-photo-areas";

const photo = {
  photoId: "photo-f2-1720000000000",
  filename: "floor-two.jpg",
  width: 1600,
  height: 900,
  updatedAt: "2026-07-26T00:00:00.000Z",
};

test("F2 and F3 keep independent browser-local photo metadata", () => {
  const stored = floorPhotoAreaStorage({
    f2: photo,
    f3: { ...photo, photoId: "photo-f3-1720000000000", filename: "floor-three.jpg" },
  });

  assert.equal(isFloorPhotoAreaStorage(stored), true);
  assert.notEqual(stored.photosByZoneId.f2, photo);
  assert.notEqual(stored.photosByZoneId.f2?.photoId, stored.photosByZoneId.f3?.photoId);
  assert.deepEqual(emptyFloorPhotoAreaStorage().photosByZoneId, {});
});

test("floor photo storage rejects unknown zones and unsafe image metadata", () => {
  const stored = floorPhotoAreaStorage({ f2: photo });
  const unknownZone = structuredClone(stored) as { photosByZoneId: Record<string, unknown> };
  unknownZone.photosByZoneId.f4 = photo;
  assert.equal(isFloorPhotoAreaStorage(unknownZone), false);

  const unsafeSize = structuredClone(stored) as { photosByZoneId: { f2: { width: number } } };
  unsafeSize.photosByZoneId.f2.width = 0;
  assert.equal(isFloorPhotoAreaStorage(unsafeSize), false);
});
