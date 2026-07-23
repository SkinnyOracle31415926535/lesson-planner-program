import {
  CUSTOM_BOARD_STORAGE_VERSION,
  customBoardStorage,
  isCustomBoard,
  isCustomBoardStorage,
  type CustomBoard,
} from "./custom-boards";
import {
  isStationBoardOverrideStorage,
  stationBoardOverrideStorage,
  type StationBoardOverrideStorage,
} from "./station-board-overrides";

export const LESSON_BOARD_SNAPSHOT_VERSION = 1;

/** Only the zone identity needed to collect board state for one lesson. */
export type LessonBoardSnapshotZone = Readonly<{
  id: string;
  customBoardId?: string;
}>;

/** Keeps this helper independent from the editor's full lesson-plan shape. */
export type LessonBoardSnapshotPhase = Readonly<{
  zones: readonly LessonBoardSnapshotZone[];
  parkedZones?: readonly LessonBoardSnapshotZone[];
}>;

/** Detached browser-local board metadata frozen alongside one lesson plan. */
export type LessonBoardSnapshot = {
  version: typeof LESSON_BOARD_SNAPSHOT_VERSION;
  customBoards: CustomBoard[];
  stationBoardOverrides: StationBoardOverrideStorage;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A valid no-board snapshot for older lessons and defensive fallbacks. */
export function emptyLessonBoardSnapshot(): LessonBoardSnapshot {
  return {
    version: LESSON_BOARD_SNAPSHOT_VERSION,
    customBoards: [],
    stationBoardOverrides: stationBoardOverrideStorage(),
  };
}

/** Strictly validates the JSON-compatible value persisted with a lesson. */
export function isLessonBoardSnapshot(value: unknown): value is LessonBoardSnapshot {
  if (!isRecord(value)
    || value.version !== LESSON_BOARD_SNAPSHOT_VERSION
    || Object.keys(value).some((key) => (
      key !== "version" && key !== "customBoards" && key !== "stationBoardOverrides"
    ))) {
    return false;
  }

  return isCustomBoardStorage({
    version: CUSTOM_BOARD_STORAGE_VERSION,
    boards: value.customBoards,
  }) && isStationBoardOverrideStorage(value.stationBoardOverrides);
}

/** Returns a detached validated copy, or a safe empty snapshot for invalid persisted data. */
export function copyLessonBoardSnapshot(value: unknown): LessonBoardSnapshot {
  if (!isLessonBoardSnapshot(value)) return emptyLessonBoardSnapshot();
  return {
    version: LESSON_BOARD_SNAPSHOT_VERSION,
    customBoards: customBoardStorage(value.customBoards).boards,
    stationBoardOverrides: stationBoardOverrideStorage(value.stationBoardOverrides.boardsById),
  };
}

/**
 * Captures only board records referenced by visible or parked lesson zones.
 * Custom-photo zones never retain a built-in override record with the same
 * zone ID.
 */
export function createLessonBoardSnapshot(
  phases: readonly LessonBoardSnapshotPhase[],
  customBoards: readonly CustomBoard[],
  stationBoardOverrides: StationBoardOverrideStorage,
): LessonBoardSnapshot {
  const customBoardIds = new Set<string>();
  const builtInBoardIds = new Set<string>();

  phases.forEach((phase) => {
    [...phase.zones, ...(phase.parkedZones ?? [])].forEach((zone) => {
      if (zone.customBoardId) customBoardIds.add(zone.customBoardId);
      else if (zone.id) builtInBoardIds.add(zone.id);
    });
  });

  const seenCustomBoardIds = new Set<string>();
  const referencedCustomBoards = customBoards.filter((board) => {
    if (!isCustomBoard(board)
      || !customBoardIds.has(board.id)
      || seenCustomBoardIds.has(board.id)) {
      return false;
    }
    seenCustomBoardIds.add(board.id);
    return true;
  });

  const validOverrides = isStationBoardOverrideStorage(stationBoardOverrides)
    ? stationBoardOverrides
    : stationBoardOverrideStorage();
  const referencedOverrides = Object.fromEntries(
    Object.entries(validOverrides.boardsById).filter(([boardId]) => builtInBoardIds.has(boardId)),
  );

  return {
    version: LESSON_BOARD_SNAPSHOT_VERSION,
    customBoards: customBoardStorage(referencedCustomBoards).boards,
    stationBoardOverrides: stationBoardOverrideStorage(referencedOverrides),
  };
}
