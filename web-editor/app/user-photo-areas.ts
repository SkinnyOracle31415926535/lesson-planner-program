import type { VisualLabelLayout } from "./custom-boards";
import type { LessonCard, LessonPhase } from "./lesson-data";

export type UserPhotoAreaMigration = {
  phases: LessonPhase[];
  visualAnchorByCardId: Record<string, string>;
  visualLabelLayoutByCardId: Record<string, VisualLabelLayout>;
  changed: boolean;
};

function copyCard(card: LessonCard): LessonCard {
  return { ...card, tags: [...card.tags], mats: card.mats ? [...card.mats] : undefined };
}

function removeUnusedVisualRecords<T>(
  record: Record<string, T>,
  removedCardIds: ReadonlySet<string>,
  retainedVisualCardIds: ReadonlySet<string>,
): Record<string, T> {
  if (![...removedCardIds].some((id) => !retainedVisualCardIds.has(id) && id in record)) return record;
  return Object.fromEntries(
    Object.entries(record).filter(([id]) => !removedCardIds.has(id) || retainedVisualCardIds.has(id)),
  );
}

/**
 * Removes legacy built-in areas from an editable lesson without losing the
 * lesson-local cards placed inside them. Past plans do not call this helper.
 */
export function migrateEditableLessonToUserPhotoAreas(
  phases: LessonPhase[],
  visualAnchorByCardId: Record<string, string>,
  visualLabelLayoutByCardId: Record<string, VisualLabelLayout>,
): UserPhotoAreaMigration {
  const removedCardIds = new Set<string>();
  const retainedVisualCardIds = new Set<string>();
  let changed = false;

  phases.forEach((phase) => {
    [...phase.zones, ...(phase.parkedZones ?? [])]
      .filter((zone) => Boolean(zone.customBoardId))
      .forEach((zone) => zone.cards.forEach((card) => retainedVisualCardIds.add(card.id)));
  });

  const migratedPhases = phases.map((phase) => {
    const legacyZones = [...phase.zones, ...(phase.parkedZones ?? [])]
      .filter((zone) => !zone.customBoardId);
    if (!legacyZones.length) return phase;

    changed = true;
    const zones = phase.zones.filter((zone) => Boolean(zone.customBoardId));
    const parkedZones = (phase.parkedZones ?? []).filter((zone) => Boolean(zone.customBoardId));
    const textCards = (phase.textCards ?? []).map(copyCard);
    const textCardIds = new Set(textCards.map((card) => card.id));
    let removedCards = false;

    legacyZones.forEach((zone) => zone.cards.forEach((card) => {
      removedCards = true;
      removedCardIds.add(card.id);
      if (textCardIds.has(card.id)) return;
      textCardIds.add(card.id);
      textCards.push(copyCard(card));
    }));

    return {
      ...phase,
      zones,
      parkedZones,
      ...(removedCards ? { textCards } : {}),
      mode: removedCards ? (zones.length ? "MIXED" : "TEXT") : phase.mode,
    };
  });

  if (!changed) {
    return { phases, visualAnchorByCardId, visualLabelLayoutByCardId, changed: false };
  }

  return {
    phases: migratedPhases,
    visualAnchorByCardId: removeUnusedVisualRecords(visualAnchorByCardId, removedCardIds, retainedVisualCardIds),
    visualLabelLayoutByCardId: removeUnusedVisualRecords(visualLabelLayoutByCardId, removedCardIds, retainedVisualCardIds),
    changed: true,
  };
}
