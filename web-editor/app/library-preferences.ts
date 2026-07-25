import type { LibraryItem } from "./lesson-data";

export type LibraryMediaMetadata = Pick<
  LibraryItem,
  "mediaId" | "mediaKind" | "mediaFilename" | "mediaMimeType" | "mediaWidth" | "mediaHeight" | "mediaDurationSeconds"
>;

export function normalizedLibraryMedia(card: Partial<LibraryItem>): LibraryMediaMetadata {
  if (card.mediaId && card.mediaKind && card.mediaFilename && card.mediaMimeType) {
    return {
      mediaId: card.mediaId,
      mediaKind: card.mediaKind,
      mediaFilename: card.mediaFilename,
      mediaMimeType: card.mediaMimeType,
      mediaWidth: card.mediaWidth,
      mediaHeight: card.mediaHeight,
      mediaDurationSeconds: card.mediaDurationSeconds,
    };
  }
  if (card.photoId && card.photoFilename && card.photoWidth && card.photoHeight) {
    return {
      mediaId: card.photoId,
      mediaKind: "image",
      mediaFilename: card.photoFilename,
      mediaMimeType: "image/*",
      mediaWidth: card.photoWidth,
      mediaHeight: card.photoHeight,
    };
  }
  return {};
}

export function withoutLibraryMedia(card: LibraryItem): LibraryItem {
  const copy = { ...card };
  delete copy.mediaId;
  delete copy.mediaKind;
  delete copy.mediaFilename;
  delete copy.mediaMimeType;
  delete copy.mediaWidth;
  delete copy.mediaHeight;
  delete copy.mediaDurationSeconds;
  delete copy.photoId;
  delete copy.photoFilename;
  delete copy.photoWidth;
  delete copy.photoHeight;
  return copy;
}

/** Removes the browser-local Station Maker link without touching idea text. */
export function withoutStationSetup(card: LibraryItem): LibraryItem {
  const copy = { ...card };
  delete copy.stationSetupId;
  delete copy.stationPreviewKind;
  return copy;
}

export type LibraryPreferenceCollections = {
  gemIds: string[];
  customCards: LibraryItem[];
  recentIdeaIds: string[];
  archivedIdeaIds: string[];
  restoredIdeaIds: string[];
  draftIdeaIds: string[];
  itemOverridesById: Record<string, LibraryItem>;
  removedIdeaIds: string[];
};

export function replacedLibraryMediaId(
  currentMediaId: string | undefined,
  nextMediaId: string | undefined,
): string | null {
  return currentMediaId && currentMediaId !== nextMediaId ? currentMediaId : null;
}

export function permanentlyDeleteLibraryIdea(
  current: LibraryPreferenceCollections,
  idea: LibraryItem,
): { next: LibraryPreferenceCollections; mediaId: string | null; stationSetupId: string | null } {
  const withoutIdea = (ids: string[]) => ids.filter((id) => id !== idea.id);
  const nextOverrides = { ...current.itemOverridesById };
  delete nextOverrides[idea.id];
  return {
    mediaId: idea.mediaId ?? idea.photoId ?? null,
    stationSetupId: idea.stationSetupId ?? null,
    next: {
      gemIds: withoutIdea(current.gemIds),
      customCards: current.customCards.filter((card) => card.id !== idea.id),
      recentIdeaIds: withoutIdea(current.recentIdeaIds),
      archivedIdeaIds: withoutIdea(current.archivedIdeaIds),
      restoredIdeaIds: withoutIdea(current.restoredIdeaIds),
      draftIdeaIds: withoutIdea(current.draftIdeaIds),
      itemOverridesById: nextOverrides,
      removedIdeaIds: withoutIdea(current.removedIdeaIds),
    },
  };
}
