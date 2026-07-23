import assert from "node:assert/strict";
import test from "node:test";

import { phaseData, type LessonCard, type LessonPhase, type ZonePanel } from "../app/lesson-data";
import { migrateEditableLessonToUserPhotoAreas } from "../app/user-photo-areas";

function card(id: string): LessonCard {
  return {
    id,
    kind: "DRILL",
    title: id,
    description: `${id} description`,
    tags: ["saved"],
    accent: "cyan",
  };
}

function zone(id: string, cards: LessonCard[], customBoardId?: string): ZonePanel {
  return {
    id,
    title: id,
    alias: id,
    note: "Local test area",
    people: "Test group",
    cards,
    ...(customBoardId ? { customBoardId } : {}),
  };
}

test("new blank lesson phases do not seed built-in areas", () => {
  assert.ok(phaseData.length > 0);
  assert.ok(phaseData.every((phase) => phase.zones.length === 0));
});

test("editable lessons move legacy-area cards to text and retain custom photo areas", () => {
  const legacyCard = card("legacy-visible");
  const parkedLegacyCard = card("legacy-parked");
  const customCard = card("custom-visible");
  const phase: LessonPhase = {
    id: "phase-1",
    time: "3:30–4:00",
    title: "Bars",
    mode: "VISUAL",
    zones: [
      zone("pb-hb", [legacyCard]),
      zone("custom-area-bars", [customCard], "board-bars"),
    ],
    parkedZones: [zone("f2", [parkedLegacyCard])],
    text: [],
    textCards: [card("already-text"), card("legacy-parked")],
  };

  const migrated = migrateEditableLessonToUserPhotoAreas(
    [phase],
    { "legacy-visible": "spot-legacy", "legacy-parked": "spot-parked", "custom-visible": "spot-custom" },
    {
      "legacy-visible": { placement: "spot", x: 0.2, y: 0.2, route: "straight" },
      "custom-visible": { placement: "spot", x: 0.4, y: 0.4, route: "straight" },
    },
  );

  assert.equal(migrated.changed, true);
  assert.deepEqual(migrated.phases[0].zones.map((item) => item.id), ["custom-area-bars"]);
  assert.deepEqual(migrated.phases[0].parkedZones, []);
  assert.equal(migrated.phases[0].mode, "MIXED");
  assert.deepEqual(
    migrated.phases[0].textCards?.map((item) => item.id),
    ["already-text", "legacy-parked", "legacy-visible"],
  );
  assert.deepEqual(migrated.visualAnchorByCardId, { "custom-visible": "spot-custom" });
  assert.deepEqual(migrated.visualLabelLayoutByCardId, {
    "custom-visible": { placement: "spot", x: 0.4, y: 0.4, route: "straight" },
  });
});

test("editable lessons become text-only when migrated cards have no custom area", () => {
  const phase: LessonPhase = {
    id: "phase-2",
    time: "4:00–4:30",
    title: "Floor",
    mode: "VISUAL",
    zones: [zone("f2", [card("floor-drill")])],
    parkedZones: [],
    text: [],
  };

  const migrated = migrateEditableLessonToUserPhotoAreas([phase], {}, {});

  assert.equal(migrated.phases[0].mode, "TEXT");
  assert.deepEqual(migrated.phases[0].zones, []);
  assert.deepEqual(migrated.phases[0].textCards?.map((item) => item.id), ["floor-drill"]);
});

test("custom-photo-only lessons pass through unchanged", () => {
  const phases: LessonPhase[] = [{
    id: "phase-3",
    time: "4:30–5:00",
    title: "Vault",
    mode: "VISUAL",
    zones: [zone("custom-area-vault", [card("vault-drill")], "board-vault")],
    parkedZones: [],
    text: [],
  }];
  const anchors = { "vault-drill": "spot-vault" };
  const layouts = { "vault-drill": { placement: "spot" as const, x: 0.5, y: 0.5, route: "straight" as const } };

  const migrated = migrateEditableLessonToUserPhotoAreas(phases, anchors, layouts);

  assert.equal(migrated.changed, false);
  assert.equal(migrated.phases, phases);
  assert.equal(migrated.visualAnchorByCardId, anchors);
  assert.equal(migrated.visualLabelLayoutByCardId, layouts);
});
