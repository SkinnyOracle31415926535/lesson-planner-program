"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  anchorForPanel,
  anchorStyleForViewport,
  canvasAspectRatio,
  gymPanelLayout,
  imageStyleForViewport,
  isPointInsideStationBoardFrame,
  panelAnchorIds,
  stationBoardAnchorPoint,
  stationBoardCallouts,
  stationBoardAnchorStyle,
  stationBoardCanvasStyle,
  stationBoardFrameBounds,
  stationBoardFrameStyle,
  type GymPanelLayout,
  type GymPlacementAnchor,
  type StationBoardCallout,
} from "./gym-layout";
import {
  attendance,
  operationTasks,
  phaseData,
  scheduleDayAdvisoryDemo,
  zoneCatalog,
  type AttendanceStatus,
  type DemoOperationTask,
  type LessonCard,
  type LessonPhase,
  type LibraryItem,
  type LibraryShelf,
  type LibraryVariant,
  type ZonePanel,
} from "./lesson-data";
import {
  addCustomStationSpot,
  boxesOverlap,
  customBoardPhotoPanelLayout,
  clampVisualLabelPosition,
  customBoardPhotoScale,
  customBoardLeaderPathsConflict,
  customBoardStorage,
  customLabelGeometry,
  decrementCustomBoardPhotoScale,
  incrementCustomBoardPhotoScale,
  isCustomBoardStorage,
  isVisualLabelLayout,
  loadCustomBoardPhoto,
  leaderIntersectsLabelBox,
  pointsAttribute,
  renameCustomBoard,
  removeCustomStationSpot,
  renameCustomBoardEvent,
  replaceCustomBoardPhotoMetadata,
  saveCustomBoardPhoto,
  setCustomBoardPhotoScale,
  updateCustomStationSpot,
  validateCustomLabelLayout,
  visualLabelLeaderPath,
  type CustomBoard,
  type CustomStationSpot,
  type NormalizedLabelBox,
  type NormalizedPoint,
  type VisualLabelLayout,
} from "./custom-boards";
import {
  createIdeaMediaId,
  ideaMediaKindForFile,
  ideaMediaValidationMessage,
  loadIdeaMedia,
  removeIdeaMedia,
  saveIdeaMedia,
} from "./idea-photos";
import {
  normalizedLibraryMedia,
  permanentlyDeleteLibraryIdea,
  replacedLibraryMediaId,
  withoutLibraryMedia,
  type LibraryMediaMetadata,
} from "./library-preferences";
import {
  libraryTransferFilename,
  mergeLibraryTransfer,
  parseLibraryTransferJson,
  serializeLibraryTransfer,
  type LibraryTransferBundleV1,
} from "./library-transfer";
import {
  addLocalStationBoardSpot,
  effectiveStationBoardSpots,
  isStationBoardOverrideStorage,
  removeLocalStationBoardSpot,
  replaceStationBoardSpotOverrides,
  resetSourceStationBoardSpot,
  stationBoardOverrideStorage,
  stationBoardSpotOverridesFor,
  updateLocalStationBoardSpot,
  updateSourceStationBoardSpot,
  type EffectiveStationBoardSpot,
  type StationBoardOverrideStorage,
  type StationBoardSourceSpot,
} from "./station-board-overrides";
import {
  LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE,
  addLocalClass,
  appendLocalClassScheduleImport,
  createLocalClass,
  emptyLocalClassStorage,
  isLocalClass,
  isLocalClassStorage,
  localClassById,
  localClassStorage,
  localScheduleBlocksForLessonDate,
  parseLocalClassScheduleImport,
  removeLocalClass,
  updateLocalClass,
  type LocalClass,
  type LocalClassImportParseResult,
  type LocalClassStorage,
} from "./local-classes";
import { isPastLessonPlanDate, localLessonPlanDate } from "./lesson-plan-dates";
import { migrateEditableLessonToUserPhotoAreas } from "./user-photo-areas";
import {
  areaCatalogPreferences,
  areaZoneWithOverride,
  emptyAreaCatalogPreferences,
  isAreaCatalogPreferences,
  isBuiltInAreaHidden,
  isCustomBoardHidden,
  setBuiltInAreaHidden,
  setCustomBoardHidden,
  updateBuiltInAreaOverride,
  type AreaCatalogPreferences,
} from "./area-catalog";
import {
  documentDrillTitle,
  lessonPlanDownloadFilename,
  listedMats,
  standaloneLessonPlanHtml,
} from "./lesson-document";
import {
  displayLessonTimeRange,
  formatLessonTimePickerValue,
  formatLessonTimeRange,
  normalizePickerTime,
  parseLessonTimeRange,
} from "./lesson-time";
import {
  canAppendEventPhase,
  eventPhaseEnd,
  eventPhaseStartOptions,
  reflowEventPhaseStart,
  removeEventPhaseTiming,
} from "./event-phase-timing";
import {
  eventScheduleIssues,
  eventStartOptionsBetween,
  eventWindow,
  repairEventTimes,
  swapAdjacentEventSlots,
  type EventScheduleIssue,
} from "./event-schedule";
import {
  MAX_SAFE_SCHEDULE_FILE_BYTES,
  emptySafeScheduleStorage,
  normalizeOpenPanelSelection,
  normalizeSafeScheduleStorage,
  openPanelSelectionAllowed,
  parseSafeScheduleBundleJson,
  replaceSafeScheduleBundle,
  resolveOpenAreaAvailability,
  resolveAreaAvailabilityForInterval,
  resolveSafeScheduleDay,
  safeScheduleGroups,
  setSafeScheduleClassGroup,
  setSafeScheduleManualWeek,
  type SafeScheduleParseResult,
  type SafeScheduleStorage,
  type SafeScheduleTimeBlock,
  type ScheduleWeek,
} from "./local-schedule";
import { generatePlannerUpdates, type PlannerUpdate } from "./planner-updates";
import { summer2026SafeScheduleFixture } from "../fixtures/summer-2026-safe-schedule-fixture";
import {
  copyLessonBoardSnapshot,
  createLessonBoardSnapshot,
  emptyLessonBoardSnapshot,
  isLessonBoardSnapshot,
  type LessonBoardSnapshot,
} from "./lesson-board-snapshot";

const LOCAL_LESSON_STORAGE_KEY = "gym-lesson-planner-local-l3-2026-07-20-v1";
const LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY = "gym-lesson-planner-local-plan-index-v1";
const LOCAL_LIBRARY_STORAGE_KEY = "gym-lesson-planner-local-library-v1";
const LOCAL_LIBRARY_VIEW_STORAGE_KEY = "gym-lesson-planner-local-library-view-v1";
const LOCAL_OPERATIONS_STORAGE_KEY = "gym-lesson-planner-local-operations-demo-v1";
const LOCAL_CUSTOM_BOARD_STORAGE_KEY = "gym-lesson-planner-local-custom-boards-v1";
const LOCAL_STATION_BOARD_OVERRIDE_STORAGE_KEY = "gym-lesson-planner-local-station-board-overrides-v1";
const LOCAL_AREA_CATALOG_STORAGE_KEY = "gym-lesson-planner-local-area-catalog-v1";
const LOCAL_CLASS_STORAGE_KEY = "gym-lesson-planner-local-classes-v1";
const LOCAL_SAFE_SCHEDULE_STORAGE_KEY = "gym-lesson-planner-local-full-schedule-v1";
const BUILT_IN_BOARD_TOOL_PREFIX = "built-in:";
const BUILT_IN_ZONE_IDS = zoneCatalog.map((zone) => zone.id);
const INITIAL_DEMO_GEM_IDS: string[] = [];
const LIBRARY_ROW_HEIGHT_MIN = 56;
const LIBRARY_ROW_HEIGHT_DEFAULT = 66;
const LIBRARY_ROW_HEIGHT_MAX = 118;
const LIBRARY_ROW_HEIGHT_STEP = 18;
const LEGACY_RECURRING_TASK_ID = "set-bar-station-mats";
const TODAY_LESSON_PLAN_ID = "legacy-current";
const TODAY_LESSON_PLAN_DATE = scheduleDayAdvisoryDemo.date.iso;
const CLASS_AND_SCHEDULE_SETUP_GUIDE = [
  "CREATE A CLASS",
  "1. Open a current or future lesson, switch to EDIT, then tap + CREATE CLASS.",
  "2. Enter the class name. Group/level and coach are optional.",
  "3. Put one student name on each line, then tap CREATE + USE FOR THIS LESSON.",
  "",
  "IMPORT A CLASS SCHEDULE",
  "1. In LOCAL CLASSES, use LOAD EXAMPLE under IMPORT CLASS + SCHEDULE.",
  "2. Replace the example values with your class, students, and schedule rows.",
  "3. Tap PREVIEW JSON. When it says READY, tap APPLY AS NEW LOCAL CLASS.",
  "4. Imports always add a new class; they never overwrite an existing class, roster, schedule, or lesson phase.",
  "",
  "FULL GYM SCHEDULE / OPEN STATIONS",
  "1. Tap LOAD SUMMER 2026 LOCAL COPY, or choose a validated lesson-planner-safe-schedule.json file.",
  "2. In SAVED CLASSES, select the exact FULL SCHEDULE GROUP for the class.",
  "3. The imported full schedule is advisory only. It never reserves equipment or changes the source vault.",
  "",
  "THIS IPAD",
  "Classes, schedules, attendance, and photos stay in this browser on this device. Create or import them again on another browser/device.",
].join("\n");

const shelfCopy: Record<LibraryShelf, string> = {
  all: "Your locally created skills, drills, routines, activities, and references",
  gems: "Your starred planning shelf",
  recent: "Your most recently placed ideas in this browser",
  archive: "Your archived ideas — nothing is deleted",
};

type StoredLesson = {
  version: 7;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
  /** The browser-local class selected for this lesson; never an automation ID. */
  classId: string | null;
  attendanceById: Record<string, AttendanceStatus>;
  /** Browser-local canvas position for each placed lesson snapshot. */
  visualAnchorByCardId: Record<string, string>;
  /** Browser-local layout for labels arranged around a custom photo area. */
  visualLabelLayoutByCardId: Record<string, VisualLabelLayout>;
  /** Detached board/photo metadata and spot overrides frozen with this lesson. */
  boardSnapshot: LessonBoardSnapshot;
};

/** The prior lesson shape before board/photo state was frozen per plan. */
type StoredLessonV6 = {
  version: 6;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
  /** The browser-local class selected for this lesson; never an automation ID. */
  classId: string | null;
  attendanceById: Record<string, AttendanceStatus>;
  /** Browser-local canvas position for each placed lesson snapshot. */
  visualAnchorByCardId: Record<string, string>;
  /** Browser-local layout for labels arranged around a custom photo area. */
  visualLabelLayoutByCardId: Record<string, VisualLabelLayout>;
};

/** The prior lesson shape before a local class could be selected per plan. */
type StoredLessonV5 = {
  version: 5;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
  attendanceById: Record<string, AttendanceStatus>;
  visualAnchorByCardId: Record<string, string>;
  visualLabelLayoutByCardId: Record<string, VisualLabelLayout>;
};

/** The previously saved local lesson shape before custom photo-board labels existed. */
type StoredLessonV4 = {
  version: 4;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
  attendanceById: Record<string, AttendanceStatus>;
  visualAnchorByCardId: Record<string, string>;
};

/** The previously saved local lesson shape before visual anchors existed. */
type StoredLessonV3 = {
  version: 3;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
  attendanceById: Record<string, AttendanceStatus>;
};

/** The previously saved local lesson shape before editable attendance existed. */
type StoredLessonV2 = {
  version: 2;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady: boolean;
};

/** The previously saved local lesson shape before phase editing existed. */
type StoredLessonV1 = {
  version: 1;
  phases: LessonPhase[];
  todoDone: boolean;
  isReady?: boolean;
};

type RestoredLesson = Omit<StoredLesson, "version" | "boardSnapshot"> & {
  boardSnapshot: LessonBoardSnapshot | null;
  migrated: boolean;
};

type SafeScheduleImportPreview = {
  fileName: string;
  fileSize: number;
  result: SafeScheduleParseResult;
};

type LessonPlanStorage = "legacy" | "scoped";

type LessonPlanMeta = {
  id: string;
  date: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  storage: LessonPlanStorage;
};

type StoredLessonPlanIndex = {
  version: 1;
  activePlanId: string;
  plans: LessonPlanMeta[];
};

type PlanShelf = "PAST" | "FUTURE" | null;

/**
 * This is deliberately transient UI state. A library card does not become a
 * lesson-local snapshot (or enter browser storage) until the coach selects a
 * destination zone.
 */
type PendingZonePlacement = {
  card: LessonCard;
  phaseId: string;
  kind?: "idea" | "visual-label";
};

type BoardTool = "none" | "spots" | "labels" | "resize";

type AreaEditTarget =
  | { kind: "built-in"; id: string }
  | { kind: "custom"; id: string };

type CustomBoardDrag =
  | { kind: "spot"; boardId: string; spotId: string; pointerId: number }
  | { kind: "label"; boardId: string; zoneId: string; cardId: string; pointerId: number };

type BuiltInBoardDrag =
  | { kind: "spot"; zoneId: string; spotId: string; pointerId: number }
  | { kind: "label"; zoneId: string; cardId: string; pointerId: number };

const CUSTOM_PHOTO_FRAME = { left: 9, top: 10, width: 82, height: 80 } as const;

/**
 * Kept only for a zone that has not yet been mapped in the owner-provided
 * layout contract. All current station selectors resolve to real durable
 * anchors through `gym-layout.ts`.
 */
const FALLBACK_VISUAL_ANCHOR_IDS = [
  "anchor-nw", "anchor-n", "anchor-ne",
  "anchor-w", "anchor-center", "anchor-e",
  "anchor-sw", "anchor-s", "anchor-se",
] as const;
type VisualAnchorId = string;

type ResolvedVisualAnchor = {
  id: VisualAnchorId;
  card: LessonCard;
};

type StoredLibraryPreferences = {
  version: 6;
  gemIds: string[];
  customCards: LibraryItem[];
  /** Source-library idea IDs ordered from most to least recently placed. */
  recentIdeaIds: string[];
  archivedIdeaIds: string[];
  restoredIdeaIds: string[];
  /** Browser-local edits to a vault-backed idea. The source fixture is never changed. */
  itemOverridesById: Record<string, LibraryItem>;
  /** Browser-local soft removals. They remain restorable from Archive. */
  removedIdeaIds: string[];
};

type StoredLibraryPreferencesV5 = Omit<StoredLibraryPreferences, "version"> & {
  version: 5;
};

type StoredLibraryPreferencesV4 = {
  version: 4;
  gemIds: string[];
  customCards: LibraryItem[];
  recentIdeaIds: string[];
  archivedIdeaIds: string[];
  restoredIdeaIds: string[];
};

type StoredLibraryPreferencesV2 = {
  version: 2;
  gemIds: string[];
  customCards: LibraryItem[];
};

type StoredLibraryPreferencesV3 = {
  version: 3;
  gemIds: string[];
  customCards: LessonCard[];
  recentIdeaIds: string[];
};

type StoredLibraryPreferencesV1 = {
  version: 1;
  gemIds: string[];
};

type LibraryEditDraft = {
  title: string;
  kind: LibraryItem["kind"];
  description: string;
  safety: string;
  mats: string;
  tags: string;
  events: string;
  skills: string;
  goals: string;
  instructions: string;
  coachingCues: string;
};

type LibraryTransferImportState =
  | {
    kind: "ready";
    fileName: string;
    bundle: LibraryTransferBundleV1;
    newCount: number;
    duplicateCount: number;
  }
  | {
    kind: "error";
    fileName: string;
    message: string;
  };

type LibraryPinchState = {
  active: boolean;
  startDistance: number;
  startRowHeight: number;
};

function clampLibraryRowHeight(value: number): number {
  return Math.round(Math.max(LIBRARY_ROW_HEIGHT_MIN, Math.min(LIBRARY_ROW_HEIGHT_MAX, value)));
}

function libraryRowHeightFromStorage(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clampLibraryRowHeight(parsed) : null;
}

function libraryDetailLevel(rowHeight: number): "COMPACT" | "DETAILS" | "FULL DETAILS" {
  if (rowHeight < 86) return "COMPACT";
  if (rowHeight < 110) return "DETAILS";
  return "FULL DETAILS";
}

type EventEditorGroup = {
  id: string;
  phases: LessonPhase[];
};

type UpdateDecision = "IMPORTANT" | "LATER" | "REJECTED";

type StoredOperations = {
  version: 2;
  taskDoneByPlanId: Record<string, Record<string, boolean>>;
  attendanceByPlanId: Record<string, Record<string, AttendanceStatus>>;
  /** Keys are immutable demo update id + revision id pairs. */
  updateDecisionByRevision: Record<string, UpdateDecision>;
};

type StoredOperationsV1 = {
  version: 1;
  taskDoneById: Record<string, boolean>;
  updateDecisionByRevision: Record<string, UpdateDecision>;
};

const updateDecisionOptions: Array<{ value: UpdateDecision; label: string }> = [
  { value: "IMPORTANT", label: "IMPORTANT" },
  { value: "LATER", label: "LATER" },
  { value: "REJECTED", label: "REJECT" },
];

function copyCard(card: LessonCard): LessonCard {
  return { ...card, tags: [...card.tags], mats: card.mats ? [...card.mats] : undefined };
}

function copyLibraryItem(card: LibraryItem): LibraryItem {
  const copied: LibraryItem = {
    ...card,
    ...copyCard(card),
    ...normalizedLibraryMedia(card),
    events: [...card.events],
    skills: [...card.skills],
    goals: [...card.goals],
    instructions: [...card.instructions],
    coachingCues: [...card.coachingCues],
    variants: card.variants.map((variant) => ({
      ...variant,
      instructions: [...variant.instructions],
      sourceRefs: [...variant.sourceRefs],
    })),
    sourceRefs: [...card.sourceRefs],
  };
  delete copied.photoId;
  delete copied.photoFilename;
  delete copied.photoWidth;
  delete copied.photoHeight;
  return copied;
}

function editableList(values: string[]): string {
  return values.join("\n");
}

function parseEditableList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((entry) => entry.trim()).filter(Boolean))];
}

function libraryEditDraftFor(card: LibraryItem): LibraryEditDraft {
  return {
    title: card.title,
    kind: card.kind,
    description: card.description,
    safety: card.safety ?? "",
    mats: editableList(card.mats ?? []),
    tags: editableList(card.tags),
    events: editableList(card.events),
    skills: editableList(card.skills),
    goals: editableList(card.goals),
    instructions: editableList(card.instructions),
    coachingCues: editableList(card.coachingCues),
  };
}

function copyZone(zone: ZonePanel): ZonePanel {
  return { ...zone, cards: zone.cards.map(copyCard) };
}

function customBoardEventLabel(board: CustomBoard): string {
  return board.eventName?.trim() || board.title;
}

function customZoneForBoard(board: CustomBoard): ZonePanel {
  return {
    id: `custom-area-${board.id}`,
    title: board.title,
    alias: customBoardEventLabel(board),
    note: "Custom photo area · edit its station spots whenever your setup changes.",
    people: "Assign a group in this lesson",
    cards: [],
    customBoardId: board.id,
    mapGroup: "APPARATUS",
    mapRole: "station",
  };
}

function customBoardCanvasPoint(point: { x: number; y: number }) {
  const frameLeft = CUSTOM_PHOTO_FRAME.left;
  const frameTop = CUSTOM_PHOTO_FRAME.top;
  return {
    x: (frameLeft + point.x * CUSTOM_PHOTO_FRAME.width) / 100,
    y: (frameTop + point.y * CUSTOM_PHOTO_FRAME.height) / 100,
  };
}

function customBoardPhotoPoint(clientX: number, clientY: number, canvas: Element) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = ((clientX - rect.left) / rect.width) * 100;
  const canvasY = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: (canvasX - CUSTOM_PHOTO_FRAME.left) / CUSTOM_PHOTO_FRAME.width,
    y: (canvasY - CUSTOM_PHOTO_FRAME.top) / CUSTOM_PHOTO_FRAME.height,
  };
}

function isInsideCustomPhoto(point: { x: number; y: number }) {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

function customLabelSize(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const longestWord = Math.max(1, ...words.map((word) => word.length));
  const lines = Math.max(1, Math.ceil(title.trim().length / 22), Math.ceil(longestWord / 22));
  return {
    width: Math.min(0.31, Math.max(0.15, 0.105 + Math.min(34, title.trim().length) * 0.006)),
    height: Math.min(0.22, 0.075 + (lines - 1) * 0.055),
  };
}

function boundedCustomLabelLayout(layout: VisualLabelLayout, size: { width: number; height: number }): VisualLabelLayout {
  const point = clampVisualLabelPosition(layout.placement, layout);
  if (layout.placement === "spot") return { ...layout, ...point };
  // Keep the full box in the blue gutter/canvas. The photo itself remains
  // uncropped inside the inset frame, while a short label can still live in
  // the deliberately reserved space around it.
  const minimumX = -CUSTOM_PHOTO_FRAME.left / CUSTOM_PHOTO_FRAME.width + size.width / 2;
  const maximumX = (100 - CUSTOM_PHOTO_FRAME.left) / CUSTOM_PHOTO_FRAME.width - size.width / 2;
  const minimumY = -CUSTOM_PHOTO_FRAME.top / CUSTOM_PHOTO_FRAME.height + size.height / 2;
  const maximumY = (100 - CUSTOM_PHOTO_FRAME.top) / CUSTOM_PHOTO_FRAME.height - size.height / 2;
  return {
    ...layout,
    x: Math.min(maximumX, Math.max(minimumX, point.x)),
    y: Math.min(maximumY, Math.max(minimumY, point.y)),
  };
}

function suggestedCustomCalloutLayout(
  spot: CustomStationSpot,
  title: string,
  route: VisualLabelLayout["route"],
): VisualLabelLayout {
  const size = customLabelSize(title);
  return boundedCustomLabelLayout({
    placement: "callout",
    x: spot.x <= 0.5 ? 1.03 : -0.03,
    y: spot.y,
    route,
  }, size);
}

function stationSpotName(anchor: GymPlacementAnchor): string {
  return anchor.id
    .replace(/^anchor-/, "")
    .replace(/-/g, " ")
    .replace(/\b\d+\b/g, (value) => String(Number(value)))
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * The supplied contract remains the source of truth. This small projection
 * merely gives the local editor the same visible canvas coordinates used by
 * the already-rendered board, including its uncropped image frame.
 */
function sourceStationSpots(layout: GymPanelLayout): StationBoardSourceSpot[] {
  return layout.anchors.map((anchor) => {
    const point = stationBoardAnchorPoint(anchor, layout.viewport, layout.referenceBoard);
    return { id: anchor.id, name: stationSpotName(anchor), x: point.x, y: point.y };
  });
}

function boardCanvasPoint(clientX: number, clientY: number, canvas: Element): NormalizedPoint {
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.width ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) : 0,
    y: rect.height ? Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)) : 0,
  };
}

/**
 * Labels may use the intentionally reserved callout lane around a supplied
 * board. Station spots themselves still use `boardCanvasPoint`, so no spot
 * can ever be moved outside the uncropped source image.
 */
function boardCalloutPoint(clientX: number, clientY: number, canvas: Element): NormalizedPoint {
  const rect = canvas.getBoundingClientRect();
  const rawX = rect.width ? (clientX - rect.left) / rect.width : 0;
  const rawY = rect.height ? (clientY - rect.top) / rect.height : 0;
  return clampVisualLabelPosition("callout", { x: rawX, y: rawY });
}

function boundedBuiltInLabelLayout(
  layout: VisualLabelLayout,
  size: { width: number; height: number },
): VisualLabelLayout {
  if (layout.placement === "spot") {
    return {
      ...layout,
      x: Math.min(1, Math.max(0, layout.x)),
      y: Math.min(1, Math.max(0, layout.y)),
    };
  }
  const point = clampVisualLabelPosition("callout", layout);
  return {
    ...layout,
    // Keep a full text box inside the deliberately reserved outer lane. It
    // may sit just beyond the compact canvas, but never overflows endlessly.
    x: Math.min(1.32 - size.width / 2, Math.max(-0.32 + size.width / 2, point.x)),
    y: Math.min(1.32 - size.height / 2, Math.max(-0.32 + size.height / 2, point.y)),
  };
}

/** Keep the compact plan readable on iPad—callouts may extend vertically, never sideways off-screen. */
function builtInLabelFitsCanvasWidth(
  layout: VisualLabelLayout,
  size: { width: number; height: number },
): boolean {
  return layout.x - size.width / 2 >= 0 && layout.x + size.width / 2 <= 1;
}

function suggestedBuiltInCalloutLayouts(
  layout: GymPanelLayout,
  spot: NormalizedPoint,
  title: string,
  route: VisualLabelLayout["route"],
): VisualLabelLayout[] {
  const size = customLabelSize(title);
  const sourceFrame = layout.referenceBoard
    ? stationBoardFrameBounds(layout.referenceBoard)
    : { x: 0, y: 0, width: 100, height: 100 };
  const frame = {
    left: sourceFrame.x / 100,
    top: sourceFrame.y / 100,
    right: (sourceFrame.x + sourceFrame.width) / 100,
    bottom: (sourceFrame.y + sourceFrame.height) / 100,
  };
  const gap = 0.025;
  const sideCandidates = {
    left: (offset: number): VisualLabelLayout => ({
      placement: "callout",
      x: frame.left - gap - size.width / 2,
      y: spot.y + offset,
      route,
    }),
    right: (offset: number): VisualLabelLayout => ({
      placement: "callout",
      x: frame.right + gap + size.width / 2,
      y: spot.y + offset,
      route,
    }),
    top: (offset: number): VisualLabelLayout => ({
      placement: "callout",
      x: spot.x + offset,
      y: frame.top - gap - size.height / 2,
      route,
    }),
    bottom: (offset: number): VisualLabelLayout => ({
      placement: "callout",
      x: spot.x + offset,
      y: frame.bottom + gap + size.height / 2,
      route,
    }),
  };
  const sides = [...(["left", "right", "top", "bottom"] as const)].sort((first, second) => {
    const distance = (side: typeof first) => {
      if (side === "left") return Math.abs(spot.x - frame.left);
      if (side === "right") return Math.abs(frame.right - spot.x);
      if (side === "top") return Math.abs(spot.y - frame.top);
      return Math.abs(frame.bottom - spot.y);
    };
    return distance(first) - distance(second);
  });
  const offsets = [0, -0.12, 0.12, -0.24, 0.24, -0.36, 0.36];
  const candidates = offsets.flatMap((offset) => sides.map((side) => sideCandidates[side](offset)));
  return candidates
    .map((candidate, index) => ({ candidate: boundedBuiltInLabelLayout(candidate, size), index }))
    // A right-side label that would create page-wide horizontal scrolling is
    // less useful than a bottom callout. Keep labels in the canvas width and
    // use the vertical exterior lane when the source image fills that side.
    .filter(({ candidate }) => builtInLabelFitsCanvasWidth(candidate, size))
    .sort((first, second) => {
      const outsideRank = (candidate: VisualLabelLayout) => {
        if (candidate.y + size.height / 2 > 1) return 1; // below the board is clearest on iPad
        if (candidate.y - size.height / 2 < 0) return 2;
        return 0;
      };
      return outsideRank(first.candidate) - outsideRank(second.candidate) || first.index - second.index;
    })
    .map(({ candidate }) => candidate)
    .filter((candidate, index, all) => all.findIndex((other) => (
      Math.abs(other.x - candidate.x) < 0.0001 && Math.abs(other.y - candidate.y) < 0.0001
    )) === index);
}

function stationCalloutPathPoints(path: string): NormalizedPoint[] {
  return path.trim().split(/\s+/).flatMap((pair) => {
    const [xText, yText] = pair.split(",");
    const x = Number(xText);
    const y = Number(yText);
    return Number.isFinite(x) && Number.isFinite(y) ? [{ x: x / 100, y: y / 100 }] : [];
  });
}

function stationCalloutBox(callout: StationBoardCallout): NormalizedLabelBox {
  return {
    left: (callout.labelLeft - callout.labelWidth / 2) / 100,
    top: (callout.labelTop - callout.labelHeight / 2) / 100,
    width: callout.labelWidth / 100,
    height: callout.labelHeight / 100,
  };
}

function readCustomPhotoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("The selected photo could not be opened."));
    };
    image.src = sourceUrl;
  });
}

function isAllowedCustomBoardPhoto(file: File): boolean {
  const hasPhotoExtension = /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
  const allowedPhoto = (file.type.startsWith("image/") && file.type !== "image/svg+xml") || hasPhotoExtension;
  return allowedPhoto && file.size <= 35 * 1024 * 1024;
}

function readIdeaVideoMetadata(file: File): Promise<{ width?: number; height?: number; durationSeconds?: number }> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    const finish = () => URL.revokeObjectURL(sourceUrl);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const width = video.videoWidth || undefined;
      const height = video.videoHeight || undefined;
      const durationSeconds = Number.isFinite(video.duration) ? video.duration : undefined;
      finish();
      resolve({ width, height, durationSeconds });
    };
    video.onerror = () => {
      finish();
      reject(new Error("The selected video could not be opened by this browser."));
    };
    video.src = sourceUrl;
  });
}

async function libraryMediaMetadataForFile(file: File): Promise<LibraryMediaMetadata> {
  const kind = ideaMediaKindForFile(file);
  if (!kind) throw new Error("unsupported media");
  const details = kind === "image"
    ? await readCustomPhotoDimensions(file).then(({ width, height }) => ({ width, height }))
    : await readIdeaVideoMetadata(file);
  return {
    mediaKind: kind,
    mediaFilename: file.name || (kind === "image" ? "idea-reference-photo" : "idea-reference-video"),
    mediaMimeType: file.type || `${kind}/*`,
    mediaWidth: details.width,
    mediaHeight: details.height,
    mediaDurationSeconds: "durationSeconds" in details ? details.durationSeconds : undefined,
  };
}

function useLocalFileUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const nextUrl = file ? URL.createObjectURL(file) : null;
    const frame = window.requestAnimationFrame(() => setUrl(nextUrl));
    return () => {
      window.cancelAnimationFrame(frame);
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [file]);
  return url;
}

const REQUIRED_PHASE_IDS = new Set(phaseData.filter((phase) => phase.isRequired).map((phase) => phase.id));

function normalizeLessonPhase(phase: LessonPhase): LessonPhase {
  return {
    ...phase,
    eventId: phase.eventId ?? phase.id,
    eventLabel: phase.eventLabel ?? phase.title,
    isRequired: phase.isRequired ?? REQUIRED_PHASE_IDS.has(phase.id),
    text: [...phase.text],
    textCards: (phase.textCards ?? []).map(copyCard),
    zones: phase.zones.map(copyZone),
    parkedZones: (phase.parkedZones ?? []).map(copyZone),
    ...(phase.scheduleProvenance ? { scheduleProvenance: { ...phase.scheduleProvenance } } : {}),
  };
}

function makeInitialLesson(): LessonPhase[] {
  return phaseData.map(normalizeLessonPhase);
}

function makeBlankStoredLesson(classId: string | null = null): StoredLesson {
  return {
    version: 7,
    phases: makeInitialLesson(),
    todoDone: false,
    isReady: false,
    classId,
    attendanceById: makeDefaultAttendance(),
    visualAnchorByCardId: {},
    visualLabelLayoutByCardId: {},
    boardSnapshot: emptyLessonBoardSnapshot(),
  };
}

function isLessonCard(value: unknown): value is LessonCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<LessonCard>;
  return typeof card.id === "string"
    && typeof card.kind === "string"
    && typeof card.title === "string"
    && typeof card.description === "string"
    && Array.isArray(card.tags)
    && (card.mats === undefined || (Array.isArray(card.mats) && card.mats.every((mat) => typeof mat === "string")))
    && typeof card.accent === "string";
}

function isLibraryShelf(value: unknown): value is LibraryShelf {
  return value === "all" || value === "gems" || value === "recent" || value === "archive";
}

function isLibraryItem(value: unknown): value is LibraryItem {
  if (!isLessonCard(value)) return false;
  const item = value as Partial<LibraryItem>;
  return Array.isArray(item.events)
    && Array.isArray(item.skills)
    && Array.isArray(item.goals)
    && Array.isArray(item.instructions)
    && Array.isArray(item.coachingCues)
    && Array.isArray(item.variants)
    && Array.isArray(item.sourceRefs)
    && typeof item.sourceStatus === "string"
    && typeof item.sourceType === "string"
    && isOptionalLibraryIdeaMedia(item);
}

/** Old ideas may omit media or use the complete version-5 photo shape. */
function isOptionalLibraryIdeaMedia(item: Partial<LibraryItem>): boolean {
  const hasGenericMedia = item.mediaId !== undefined
    || item.mediaKind !== undefined
    || item.mediaFilename !== undefined
    || item.mediaMimeType !== undefined
    || item.mediaWidth !== undefined
    || item.mediaHeight !== undefined
    || item.mediaDurationSeconds !== undefined;
  if (hasGenericMedia) {
    return typeof item.mediaId === "string" && item.mediaId.trim().length > 0
      && (item.mediaKind === "image" || item.mediaKind === "video")
      && typeof item.mediaFilename === "string" && item.mediaFilename.trim().length > 0
      && typeof item.mediaMimeType === "string" && item.mediaMimeType.trim().length > 0
      && (item.mediaWidth === undefined || (Number.isFinite(item.mediaWidth) && item.mediaWidth > 0))
      && (item.mediaHeight === undefined || (Number.isFinite(item.mediaHeight) && item.mediaHeight > 0))
      && (item.mediaDurationSeconds === undefined || (Number.isFinite(item.mediaDurationSeconds) && item.mediaDurationSeconds >= 0));
  }
  const hasLegacyPhoto = item.photoId !== undefined
    || item.photoFilename !== undefined
    || item.photoWidth !== undefined
    || item.photoHeight !== undefined;
  if (!hasLegacyPhoto) return true;
  return typeof item.photoId === "string" && item.photoId.trim().length > 0
    && typeof item.photoFilename === "string" && item.photoFilename.trim().length > 0
    && typeof item.photoWidth === "number" && Number.isFinite(item.photoWidth) && item.photoWidth > 0
    && typeof item.photoHeight === "number" && Number.isFinite(item.photoHeight) && item.photoHeight > 0;
}

function isLibraryItemRecord(value: unknown): value is Record<string, LibraryItem> {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.values(value).every(isLibraryItem);
}

function makeLocalLibraryItem(card: LessonCard): LibraryItem {
  return {
    ...copyCard(card),
    events: [],
    skills: [],
    goals: [],
    instructions: [card.description],
    coachingCues: [],
    variants: [],
    sourceRefs: [],
    sourceStatus: "local",
    sourceType: card.kind.toLocaleLowerCase(),
  };
}

function isZonePanel(value: unknown): value is ZonePanel {
  if (!value || typeof value !== "object") return false;
  const zone = value as Partial<ZonePanel>;
  return typeof zone.id === "string"
    && typeof zone.title === "string"
    && typeof zone.alias === "string"
    && typeof zone.note === "string"
    && typeof zone.people === "string"
    && Array.isArray(zone.cards)
    && zone.cards.every(isLessonCard)
    && (zone.customBoardId === undefined || typeof zone.customBoardId === "string")
    && (zone.openStation === undefined || typeof zone.openStation === "boolean");
}

function isPhaseMode(value: unknown): value is LessonPhase["mode"] {
  return value === "TEXT" || value === "MIXED" || value === "VISUAL";
}

function isScheduleOpenProvenance(value: unknown): value is NonNullable<LessonPhase["scheduleProvenance"]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const provenance = value as Record<string, unknown>;
  return Object.keys(provenance).every((key) => [
    "kind", "sourceId", "scheduleId", "revision", "bookingId", "lessonDate", "scheduleGroup",
  ].includes(key))
    && provenance.kind === "safe-schedule-open"
    && typeof provenance.sourceId === "string" && Boolean(provenance.sourceId)
    && typeof provenance.scheduleId === "string" && Boolean(provenance.scheduleId)
    && typeof provenance.revision === "string" && Boolean(provenance.revision)
    && typeof provenance.bookingId === "string" && Boolean(provenance.bookingId)
    && typeof provenance.lessonDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(provenance.lessonDate)
    && typeof provenance.scheduleGroup === "string" && Boolean(provenance.scheduleGroup);
}

function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return value === "unmarked" || value === "present" || value === "late" || value === "absent";
}

function isAttendanceRecord(value: unknown): value is Record<string, AttendanceStatus> {
  return Boolean(value)
    && typeof value === "object"
    && Object.values(value).every(isAttendanceStatus);
}

function makeDefaultAttendance(): Record<string, AttendanceStatus> {
  return Object.fromEntries(attendance.map((athlete) => [athlete.id, athlete.status]));
}

function isVisualAnchorId(value: unknown): value is VisualAnchorId {
  return typeof value === "string" && /^(?:anchor|spot)-[a-z0-9-]+$/i.test(value);
}

function isVisualAnchorRecord(value: unknown): value is Record<string, string> {
  return Boolean(value)
    && typeof value === "object"
    && Object.values(value).every(isVisualAnchorId);
}

function isVisualLabelLayoutRecord(value: unknown): value is Record<string, VisualLabelLayout> {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.values(value).every(isVisualLabelLayout);
}

function visualAnchorIdsForZone(
  zone: ZonePanel,
  customBoard?: CustomBoard,
  stationSpots?: readonly Pick<EffectiveStationBoardSpot, "id">[],
): VisualAnchorId[] {
  if (zone.customBoardId) return customBoard?.spots.map((spot) => spot.id) ?? [];
  if (stationSpots) return stationSpots.map((spot) => spot.id);
  const mappedAnchorIds = panelAnchorIds(zone.id);
  return mappedAnchorIds.length ? mappedAnchorIds : [...FALLBACK_VISUAL_ANCHOR_IDS];
}

/**
 * Resolves saved positions first, then gives legacy snapshots a stable
 * first-free anchor. This keeps older local lessons readable without adding
 * fake station equipment or unplaced dots to the normal board.
 */
function resolveVisualAnchors(
  zone: ZonePanel,
  visualAnchorByCardId: Record<string, string>,
  customBoard?: CustomBoard,
  stationSpots?: readonly Pick<EffectiveStationBoardSpot, "id">[],
): ResolvedVisualAnchor[] {
  const availableAnchors = visualAnchorIdsForZone(zone, customBoard, stationSpots);
  const used = new Set<VisualAnchorId>();

  return zone.cards.flatMap((card) => {
    const saved = visualAnchorByCardId[card.id];
    const anchor = isVisualAnchorId(saved) && availableAnchors.includes(saved) && !used.has(saved)
      ? saved
      : availableAnchors.find((candidate) => !used.has(candidate));
    if (!anchor) return [];
    used.add(anchor);
    return [{ id: anchor, card }];
  });
}

function compatibleVisualAnchors(
  zone: ZonePanel,
  visualAnchorByCardId: Record<string, string>,
  customBoard?: CustomBoard,
  stationSpots?: readonly Pick<EffectiveStationBoardSpot, "id">[],
): VisualAnchorId[] {
  const occupied = new Set(resolveVisualAnchors(zone, visualAnchorByCardId, customBoard, stationSpots).map((anchor) => anchor.id));
  return visualAnchorIdsForZone(zone, customBoard, stationSpots).filter((anchor) => !occupied.has(anchor));
}

function shortAnchorLabel(title: string) {
  const trimmed = title.trim();
  if (trimmed.length <= 34) return trimmed;
  const wholeWords = trimmed.slice(0, 31).trimEnd();
  const boundary = wholeWords.lastIndexOf(" ");
  return `${(boundary > 0 ? wholeWords.slice(0, boundary) : wholeWords).trimEnd()}…`;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function hasUniqueZoneIds(zones: ZonePanel[]): boolean {
  return new Set(zones.map((zone) => zone.id)).size === zones.length;
}

function isLessonPhase(value: unknown): value is LessonPhase {
  if (!value || typeof value !== "object") return false;
  const phase = value as Partial<LessonPhase>;
  const visibleZones = Array.isArray(phase.zones) ? phase.zones : null;
  const parkedZones = phase.parkedZones === undefined
    ? []
    : Array.isArray(phase.parkedZones) ? phase.parkedZones : null;
  const allZoneIds = visibleZones && parkedZones
    ? [...visibleZones, ...parkedZones].map((zone) => zone.id)
    : [];

  return typeof phase.id === "string"
    && typeof phase.time === "string"
    && typeof phase.title === "string"
    && (phase.eventId === undefined || typeof phase.eventId === "string")
    && (phase.eventLabel === undefined || typeof phase.eventLabel === "string")
    && (phase.pendingEventEnd === undefined || Boolean(normalizePickerTime(phase.pendingEventEnd)))
    && isPhaseMode(phase.mode)
    && visibleZones !== null
    && visibleZones.every(isZonePanel)
    && parkedZones !== null
    && parkedZones.every(isZonePanel)
    && hasUniqueZoneIds(visibleZones)
    && hasUniqueZoneIds(parkedZones)
    && new Set(allZoneIds).size === allZoneIds.length
    && Array.isArray(phase.text)
    && phase.text.every((item) => typeof item === "string")
    && (phase.isRequired === undefined || typeof phase.isRequired === "boolean")
    && (phase.note === undefined || typeof phase.note === "string")
    && (phase.textCards === undefined || (Array.isArray(phase.textCards) && phase.textCards.every(isLessonCard)))
    && (phase.scheduleProvenance === undefined || isScheduleOpenProvenance(phase.scheduleProvenance));
}

function hasUniquePhaseIds(phases: LessonPhase[]): boolean {
  return new Set(phases.map((phase) => phase.id)).size === phases.length;
}

function isLessonPlanMeta(value: unknown): value is LessonPlanMeta {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<LessonPlanMeta>;
  return typeof plan.id === "string"
    && isLessonPlanDate(plan.date ?? "")
    && typeof plan.title === "string"
    && typeof plan.createdAt === "string"
    && typeof plan.updatedAt === "string"
    && (plan.storage === "legacy" || plan.storage === "scoped");
}

function isStoredLessonPlanIndex(value: unknown): value is StoredLessonPlanIndex {
  if (!value || typeof value !== "object") return false;
  const index = value as Partial<StoredLessonPlanIndex>;
  return index.version === 1
    && typeof index.activePlanId === "string"
    && Array.isArray(index.plans)
    && index.plans.every(isLessonPlanMeta)
    && new Set(index.plans.map((plan) => plan.id)).size === index.plans.length;
}

function isStoredLesson(value: unknown): value is StoredLesson {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLesson>;
  return candidate.version === 7
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean"
    && (candidate.classId === null || typeof candidate.classId === "string")
    && isAttendanceRecord(candidate.attendanceById)
    && isVisualAnchorRecord(candidate.visualAnchorByCardId)
    && isVisualLabelLayoutRecord(candidate.visualLabelLayoutByCardId)
    && isLessonBoardSnapshot(candidate.boardSnapshot);
}

function isStoredLessonV6(value: unknown): value is StoredLessonV6 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV6>;
  return candidate.version === 6
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean"
    && (candidate.classId === null || typeof candidate.classId === "string")
    && isAttendanceRecord(candidate.attendanceById)
    && isVisualAnchorRecord(candidate.visualAnchorByCardId)
    && isVisualLabelLayoutRecord(candidate.visualLabelLayoutByCardId);
}

function isStoredLessonV5(value: unknown): value is StoredLessonV5 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV5>;
  return candidate.version === 5
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean"
    && isAttendanceRecord(candidate.attendanceById)
    && isVisualAnchorRecord(candidate.visualAnchorByCardId)
    && isVisualLabelLayoutRecord(candidate.visualLabelLayoutByCardId);
}

function isStoredLessonV4(value: unknown): value is StoredLessonV4 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV4>;
  return candidate.version === 4
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean"
    && isAttendanceRecord(candidate.attendanceById)
    && isVisualAnchorRecord(candidate.visualAnchorByCardId);
}

function isStoredLessonV3(value: unknown): value is StoredLessonV3 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV3>;
  return candidate.version === 3
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean"
    && isAttendanceRecord(candidate.attendanceById);
}

function isStoredLessonV2(value: unknown): value is StoredLessonV2 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV2>;
  return candidate.version === 2
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && typeof candidate.isReady === "boolean";
}

function isStoredLessonV1(value: unknown): value is StoredLessonV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLessonV1>;
  return candidate.version === 1
    && Array.isArray(candidate.phases)
    && candidate.phases.length > 0
    && candidate.phases.every(isLessonPhase)
    && hasUniquePhaseIds(candidate.phases)
    && typeof candidate.todoDone === "boolean"
    && (candidate.isReady === undefined || typeof candidate.isReady === "boolean");
}

function restoreLesson(value: unknown): RestoredLesson | null {
  if (isStoredLesson(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: value.classId,
      attendanceById: { ...makeDefaultAttendance(), ...value.attendanceById },
      visualAnchorByCardId: { ...value.visualAnchorByCardId },
      visualLabelLayoutByCardId: { ...value.visualLabelLayoutByCardId },
      boardSnapshot: copyLessonBoardSnapshot(value.boardSnapshot),
      migrated: false,
    };
  }

  if (isStoredLessonV6(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: value.classId,
      attendanceById: { ...makeDefaultAttendance(), ...value.attendanceById },
      visualAnchorByCardId: { ...value.visualAnchorByCardId },
      visualLabelLayoutByCardId: { ...value.visualLabelLayoutByCardId },
      boardSnapshot: null,
      migrated: true,
    };
  }

  if (isStoredLessonV5(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: null,
      attendanceById: { ...makeDefaultAttendance(), ...value.attendanceById },
      visualAnchorByCardId: { ...value.visualAnchorByCardId },
      visualLabelLayoutByCardId: { ...value.visualLabelLayoutByCardId },
      boardSnapshot: null,
      migrated: true,
    };
  }

  if (isStoredLessonV4(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: null,
      attendanceById: { ...makeDefaultAttendance(), ...value.attendanceById },
      visualAnchorByCardId: { ...value.visualAnchorByCardId },
      visualLabelLayoutByCardId: {},
      boardSnapshot: null,
      migrated: true,
    };
  }

  if (isStoredLessonV3(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: null,
      attendanceById: { ...makeDefaultAttendance(), ...value.attendanceById },
      visualAnchorByCardId: {},
      visualLabelLayoutByCardId: {},
      boardSnapshot: null,
      migrated: true,
    };
  }

  if (isStoredLessonV2(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady,
      classId: null,
      attendanceById: makeDefaultAttendance(),
      visualAnchorByCardId: {},
      visualLabelLayoutByCardId: {},
      boardSnapshot: null,
      migrated: true,
    };
  }

  if (isStoredLessonV1(value)) {
    return {
      phases: value.phases.map(normalizeLessonPhase),
      todoDone: value.todoDone,
      isReady: value.isReady ?? false,
      classId: null,
      attendanceById: makeDefaultAttendance(),
      visualAnchorByCardId: {},
      visualLabelLayoutByCardId: {},
      boardSnapshot: null,
      migrated: true,
    };
  }

  return null;
}

function migrateEditableRestoredLesson(restored: RestoredLesson): RestoredLesson {
  const migration = migrateEditableLessonToUserPhotoAreas(
    restored.phases,
    restored.visualAnchorByCardId,
    restored.visualLabelLayoutByCardId,
  );
  if (!migration.changed) return restored;
  return {
    ...restored,
    phases: migration.phases,
    visualAnchorByCardId: migration.visualAnchorByCardId,
    visualLabelLayoutByCardId: migration.visualLabelLayoutByCardId,
    migrated: true,
  };
}

function storedLessonWithBoardSnapshot(
  restored: RestoredLesson,
  boardSnapshot: LessonBoardSnapshot,
): StoredLesson {
  return {
    version: 7,
    phases: restored.phases,
    todoDone: restored.todoDone,
    isReady: restored.isReady,
    classId: restored.classId,
    attendanceById: restored.attendanceById,
    visualAnchorByCardId: restored.visualAnchorByCardId,
    visualLabelLayoutByCardId: restored.visualLabelLayoutByCardId,
    boardSnapshot,
  };
}

function isStoredLibraryPreferences(value: unknown): value is StoredLibraryPreferences {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferences>;
  return candidate.version === 6
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.customCards)
    && candidate.customCards.every(isLibraryItem)
    && Array.isArray(candidate.recentIdeaIds)
    && candidate.recentIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.archivedIdeaIds)
    && candidate.archivedIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.restoredIdeaIds)
    && candidate.restoredIdeaIds.every((id) => typeof id === "string")
    && isLibraryItemRecord(candidate.itemOverridesById)
    && Array.isArray(candidate.removedIdeaIds)
    && candidate.removedIdeaIds.every((id) => typeof id === "string");
}

function isStoredLibraryPreferencesV5(value: unknown): value is StoredLibraryPreferencesV5 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferencesV5>;
  return candidate.version === 5
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.customCards)
    && candidate.customCards.every(isLibraryItem)
    && Array.isArray(candidate.recentIdeaIds)
    && candidate.recentIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.archivedIdeaIds)
    && candidate.archivedIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.restoredIdeaIds)
    && candidate.restoredIdeaIds.every((id) => typeof id === "string")
    && isLibraryItemRecord(candidate.itemOverridesById)
    && Array.isArray(candidate.removedIdeaIds)
    && candidate.removedIdeaIds.every((id) => typeof id === "string");
}

function isStoredLibraryPreferencesV4(value: unknown): value is StoredLibraryPreferencesV4 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferencesV4>;
  return candidate.version === 4
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.customCards)
    && candidate.customCards.every(isLibraryItem)
    && Array.isArray(candidate.recentIdeaIds)
    && candidate.recentIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.archivedIdeaIds)
    && candidate.archivedIdeaIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.restoredIdeaIds)
    && candidate.restoredIdeaIds.every((id) => typeof id === "string");
}

function isStoredLibraryPreferencesV2(value: unknown): value is StoredLibraryPreferencesV2 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferencesV2>;
  return candidate.version === 2
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.customCards)
    && candidate.customCards.every(isLessonCard);
}

function isStoredLibraryPreferencesV3(value: unknown): value is StoredLibraryPreferencesV3 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferencesV3>;
  return candidate.version === 3
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string")
    && Array.isArray(candidate.customCards)
    && candidate.customCards.every(isLessonCard)
    && Array.isArray(candidate.recentIdeaIds)
    && candidate.recentIdeaIds.every((id) => typeof id === "string");
}

function isStoredLibraryPreferencesV1(value: unknown): value is StoredLibraryPreferencesV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredLibraryPreferencesV1>;
  return candidate.version === 1
    && Array.isArray(candidate.gemIds)
    && candidate.gemIds.every((id) => typeof id === "string");
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return Boolean(value)
    && typeof value === "object"
    && Object.values(value).every((entry) => typeof entry === "boolean");
}

function isBooleanRecordByPlan(value: unknown): value is Record<string, Record<string, boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(isBooleanRecord);
}

function isAttendanceRecordByPlan(value: unknown): value is Record<string, Record<string, AttendanceStatus>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(isAttendanceRecord);
}

function isUpdateDecision(value: unknown): value is UpdateDecision {
  return value === "IMPORTANT" || value === "LATER" || value === "REJECTED";
}

function isUpdateDecisionRecord(value: unknown): value is Record<string, UpdateDecision> {
  return Boolean(value)
    && typeof value === "object"
    && Object.values(value).every(isUpdateDecision);
}

function isStoredOperations(value: unknown): value is StoredOperations {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredOperations>;
  return candidate.version === 2
    && isBooleanRecordByPlan(candidate.taskDoneByPlanId)
    && isAttendanceRecordByPlan(candidate.attendanceByPlanId)
    && isUpdateDecisionRecord(candidate.updateDecisionByRevision);
}

function isStoredOperationsV1(value: unknown): value is StoredOperationsV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredOperationsV1>;
  return candidate.version === 1
    && isBooleanRecord(candidate.taskDoneById)
    && isUpdateDecisionRecord(candidate.updateDecisionByRevision);
}

function revisionKey(update: Pick<PlannerUpdate, "id" | "revisionId">) {
  return `${update.id}:${update.revisionId}`;
}

function formatScheduleMinute(minute: number) {
  const normalized = ((minute % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minutePart = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutePart).padStart(2, "0")}${hour24 >= 12 ? "P" : "A"}`;
}

function formatScheduleRange(startMinute: number, endMinute: number) {
  return `${formatScheduleMinute(startMinute)}–${formatScheduleMinute(endMinute)}`;
}

function formatScheduleMinuteLong(minute: number) {
  const normalized = ((minute % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minutePart = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutePart).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

function formatScheduleLessonRange(startMinute: number, endMinute: number) {
  return `${formatScheduleMinuteLong(startMinute)}–${formatScheduleMinuteLong(endMinute)}`;
}

function pickerMinuteForSchedule(value: string): number | null {
  const normalized = normalizePickerTime(value);
  if (!normalized) return null;
  const [hour, minute] = normalized.split(":").map(Number);
  return (hour * 60) + minute;
}

function safeScheduleSelectionKey(revision: string, bookingId: string) {
  return `${revision}:${bookingId}`;
}

function isLessonPlanDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

function formatLessonPlanDate(value: string): string {
  if (!isLessonPlanDate(value)) return value.toUpperCase();
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`)).toUpperCase();
}

function nextLessonPlanDate(value: string): string {
  const date = new Date(`${isLessonPlanDate(value) ? value : TODAY_LESSON_PLAN_DATE}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lessonPlanStorageKey(planId: string): string {
  return `gym-lesson-planner-local-plan-${planId}-v1`;
}

function makeLessonPlanMeta(date: string, storage: LessonPlanStorage, now = new Date().toISOString()): LessonPlanMeta {
  return {
    id: storage === "legacy" ? TODAY_LESSON_PLAN_ID : `lesson-${date}`,
    date,
    title: "LEVEL 3 LESSON",
    createdAt: now,
    updatedAt: now,
    storage,
  };
}

function Card({ card, compact = false, onRemove }: { card: LessonCard; compact?: boolean; onRemove?: () => void }) {
  return (
    <article className={`lesson-card accent-${card.accent} ${compact ? "compact" : ""}`}>
      <div className="card-kicker">
        <span>{card.kind}{card.lessonLocal ? " · SNAPSHOT" : ""}</span>
        {card.starred ? <span aria-label="Starred idea">★</span> : null}
      </div>
      <strong>{card.title}</strong>
      <p>{card.description}</p>
      <div className="tag-row">
        {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {card.mats?.length ? <div className="mats-mini">MATS: {card.mats.join(" · ")}</div> : null}
      {card.safety ? <div className="safety-mini">⚠ {card.safety}</div> : null}
      {onRemove ? <button className="remove-snapshot" onClick={onRemove}>REMOVE SNAPSHOT</button> : null}
    </article>
  );
}

function eventNameForPhase(phase: LessonPhase): string {
  const eventLabel = phase.eventLabel?.trim() ?? "";
  const phaseTitle = phase.title.trim();
  // The seeded plan used the group name as a placeholder event label. The
  // actual event is the phase title until the coach gives the block a name.
  if (!eventLabel || eventLabel.toLocaleLowerCase() === "level 3 boys") return phaseTitle || eventLabel || "Untitled event";
  return eventLabel;
}

function documentPhaseName(phase: LessonPhase): string {
  const eventName = eventNameForPhase(phase);
  const phaseName = phase.title.trim();
  return phaseName && phaseName.toLocaleLowerCase() !== eventName.toLocaleLowerCase()
    ? `${eventName} · ${phaseName}`
    : eventName;
}

function phaseDrillEntries(phase: LessonPhase): Array<{ area: string; card: LessonCard }> {
  return [
    ...(phase.textCards ?? []).map((card) => ({ area: "TEXT", card })),
    ...phase.zones.flatMap((zone) => zone.cards.map((card) => ({ area: zone.alias, card }))),
  ];
}

const LESSON_TIME_PICKER_OPTIONS = Array.from({ length: 24 * 12 }, (_, index) => {
  const hour = Math.floor(index / 12);
  const minute = (index % 12) * 5;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { value, label: formatLessonTimePickerValue(value) ?? value };
});

function pickerTimeMinutes(value: string): number | null {
  const normalized = normalizePickerTime(value);
  if (!normalized) return null;
  const [hour, minute] = normalized.split(":").map(Number);
  return (hour * 60) + minute;
}

function pickerTimeValue(totalMinutes: number): string {
  const bounded = Math.max(0, Math.min((23 * 60) + 55, totalMinutes));
  const hour = Math.floor(bounded / 60);
  const minute = bounded % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function revisedLessonTimeRange(
  currentValue: string,
  field: "start" | "end",
  selectedValue: string,
): string {
  if (!selectedValue) return "TBD";
  const selected = normalizePickerTime(selectedValue);
  const selectedMinute = selected ? pickerTimeMinutes(selected) : null;
  if (!selected || selectedMinute === null) return currentValue;

  const current = parseLessonTimeRange(currentValue);
  let start = current?.start ?? "";
  let end = current?.end ?? "";
  if (field === "start") {
    start = selected;
    if (!end || end <= start) end = pickerTimeValue(selectedMinute + 5);
  } else {
    end = selected;
    if (!start || start >= end) start = pickerTimeValue(selectedMinute - 5);
  }
  return formatLessonTimeRange({ start, end });
}

function LessonTimeRangePicker({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const range = parseLessonTimeRange(value);
  const savedLegacyValue = !range && value.trim() && value.trim().toUpperCase() !== "TBD"
    ? value.trim()
    : null;
  return (
    <div className="lesson-time-range" role="group" aria-label={`${label} time range`}>
      <label>START
        <select
          value={range?.start ?? ""}
          onChange={(event) => onChange(revisedLessonTimeRange(value, "start", event.target.value))}
          aria-label={`${label} start time`}
        >
          <option value="">NOT SET</option>
          {LESSON_TIME_PICKER_OPTIONS.slice(0, -1).map((option) => (
            <option key={option.value} value={option.value} disabled={Boolean(range?.end && option.value >= range.end)}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>END
        <select
          value={range?.end ?? ""}
          onChange={(event) => onChange(revisedLessonTimeRange(value, "end", event.target.value))}
          aria-label={`${label} end time`}
        >
          <option value="">NOT SET</option>
          {LESSON_TIME_PICKER_OPTIONS.slice(1).map((option) => (
            <option key={option.value} value={option.value} disabled={Boolean(range?.start && option.value <= range.start)}>{option.label}</option>
          ))}
        </select>
      </label>
      {savedLegacyValue ? <small>SAVED TIME: {savedLegacyValue} · CHOOSE START AND END TO STANDARDIZE IT</small> : null}
    </div>
  );
}

function EventPhaseTimePicker({
  phases,
  phaseId,
  label,
  onStartChange,
}: {
  phases: Array<Pick<LessonPhase, "id" | "time">>;
  phaseId: string;
  label: string;
  onStartChange: (value: string) => void;
}) {
  const phaseIndex = phases.findIndex((phase) => phase.id === phaseId);
  const range = phaseIndex >= 0 ? parseLessonTimeRange(phases[phaseIndex].time) : null;
  const end = eventPhaseEnd(phases, phaseIndex);
  const startOptions = eventPhaseStartOptions(phases, phaseIndex);
  const isFirstPhase = phaseIndex === 0;
  return (
    <div className="lesson-time-range event-phase-time-range" role="group" aria-label={`${label} time range`}>
      <label>START
        <select
          value={range?.start ?? ""}
          onChange={(event) => onStartChange(event.target.value)}
          aria-label={`${label} start time`}
        >
          {!isFirstPhase ? <option value="">NOT SET</option> : null}
          {startOptions.map((option) => <option key={option} value={option}>{formatLessonTimePickerValue(option) ?? option}</option>)}
        </select>
      </label>
      <label>END
        <output aria-label={`${label} automatic end time`}>{end ? formatLessonTimePickerValue(end) : "NOT SET"}</output>
      </label>
    </div>
  );
}

function PendingEventTimePicker({
  label,
  end,
  options,
  onStartChange,
}: {
  label: string;
  end: string;
  options: string[];
  onStartChange: (value: string) => void;
}) {
  return (
    <div className="lesson-time-range event-phase-time-range" role="group" aria-label={`${label} pending event time range`}>
      <label>START
        <select value="" onChange={(event) => onStartChange(event.target.value)} aria-label={`${label} new event start time`}>
          <option value="">CHOOSE START</option>
          {options.map((option) => <option key={option} value={option}>{formatLessonTimePickerValue(option) ?? option}</option>)}
        </select>
      </label>
      <label>END
        <output aria-label={`${label} automatic next-event end time`}>{formatLessonTimePickerValue(end) ?? end}</output>
      </label>
    </div>
  );
}

function EventEditor({
  events,
  activePhaseId,
  issues,
  searchingEventId,
  openStationResults,
  openStationWarning,
  canSearchOpenStations,
  onClose,
  onUpdateEvent,
  onUpdatePhaseTitle,
  onUpdatePhaseStart,
  onSetPendingEventStart,
  onOpenPhase,
  onAddPhase,
  onDeletePhase,
  onMoveEvent,
  onRepairTimes,
  onAddEventBetween,
  onSearchOpenStations,
  onAddOpenStation,
}: {
  events: EventEditorGroup[];
  activePhaseId: string;
  issues: EventScheduleIssue[];
  searchingEventId: string | null;
  openStationResults: Array<{ id: string; alias: string }>;
  openStationWarning: string | null;
  canSearchOpenStations: boolean;
  onClose: () => void;
  onUpdateEvent: (eventId: string, value: string) => void;
  onUpdatePhaseTitle: (phaseId: string, value: string) => void;
  onUpdatePhaseStart: (phaseId: string, value: string) => void;
  onSetPendingEventStart: (eventId: string, value: string) => void;
  onOpenPhase: (phaseId: string) => void;
  onAddPhase: (eventId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onMoveEvent: (eventId: string, direction: "up" | "down") => void;
  onRepairTimes: () => void;
  onAddEventBetween: (previousEventId: string, nextEventId: string) => void;
  onSearchOpenStations: (eventId: string) => void;
  onAddOpenStation: (eventId: string, panelId: string) => void;
}) {
  return (
    <section className="event-editor retro-window" aria-label="Edit lesson events">
      <div className="window-title">EVENT EDITOR <button type="button" onClick={onClose}>RETURN TO PLAN</button></div>
      <div className="event-editor-body">
        <p className="event-editor-note">Edit event names, phases, and times here. Opening a phase returns you to its stations and lesson details. Open-station results are advisory only.</p>
        {issues.length ? <div className="event-editor-conflicts" role="alert"><b>⚠ TIMING NEEDS ATTENTION</b><span>{issues.length} overlap, gap, or incomplete event timing issue{issues.length === 1 ? "" : "s"} found.</span><button type="button" onClick={onRepairTimes}>REPAIR TIMES</button></div> : <p className="event-editor-clear">✓ EVENT TIMES ARE CONTINUOUS</p>}
        <div className="event-editor-list">
          {events.map((event, eventIndex) => {
            const firstPhase = event.phases[0];
            if (!firstPhase) return null;
            const previousEvent = events[eventIndex - 1];
            const nextEvent = events[eventIndex + 1];
            const pendingEnd = firstPhase.pendingEventEnd;
            const eventIsPending = Boolean(pendingEnd && !eventWindow(event.phases));
            const startOptions = eventIsPending
              ? eventStartOptionsBetween(eventWindow(previousEvent?.phases ?? [])?.start ?? null, eventWindow(previousEvent?.phases ?? [])?.end ?? null)
              : [];
            const eventIssues = issues.filter((issue) => issue.eventId === event.id || issue.relatedEventId === event.id);
            return (
              <Fragment key={event.id}>
              <article className={`event-editor-event ${eventIssues.length ? "has-conflict" : ""}`}>
                <div className="event-editor-event-head">
                  <label>EVENT NAME
                    <input
                      value={eventNameForPhase(firstPhase)}
                      onChange={(change) => onUpdateEvent(event.id, change.target.value)}
                      maxLength={80}
                      aria-label={`Event name for ${eventNameForPhase(firstPhase)}`}
                    />
                  </label>
                  <div className="event-editor-event-meta">
                    <span>{event.phases.length} PHASE{event.phases.length === 1 ? "" : "S"}</span>
                    <div className="event-editor-order" aria-label={`Move ${eventNameForPhase(firstPhase)}`}>
                      <button type="button" onClick={() => onMoveEvent(event.id, "up")} disabled={!previousEvent}>↑</button>
                      <button type="button" onClick={() => onMoveEvent(event.id, "down")} disabled={!nextEvent}>↓</button>
                    </div>
                  </div>
                </div>
                {eventIssues.length ? <p className="event-editor-event-warning">{eventIssues.map((issue) => issue.kind.toUpperCase()).join(" · ")} — use REPAIR TIMES or change a start time.</p> : null}
                <div className="event-editor-phase-list">
                  {event.phases.map((phase) => (
                    <div key={phase.id} className={`event-editor-phase ${phase.id === activePhaseId ? "selected" : ""}`}>
                      <label>PHASE NAME
                        <input
                          value={phase.title}
                          onChange={(change) => onUpdatePhaseTitle(phase.id, change.target.value)}
                          maxLength={80}
                          aria-label={`Phase name for ${eventNameForPhase(phase)}`}
                        />
                      </label>
                      {phase.pendingEventEnd && !parseLessonTimeRange(phase.time) ? (
                        <PendingEventTimePicker
                          label={phase.title}
                          end={phase.pendingEventEnd}
                          options={startOptions}
                          onStartChange={(value) => onSetPendingEventStart(event.id, value)}
                        />
                      ) : <EventPhaseTimePicker
                        phases={event.phases}
                        phaseId={phase.id}
                        label={phase.title}
                        onStartChange={(value) => onUpdatePhaseStart(phase.id, value)}
                      />}
                      <div className="event-editor-phase-actions">
                        <button type="button" onClick={() => onOpenPhase(phase.id)}>OPEN PLAN</button>
                        <button type="button" className="event-editor-delete-phase" onClick={() => onDeletePhase(phase.id)} disabled={phase.isRequired}>DELETE PHASE</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="event-editor-add-phase"
                  onClick={() => onAddPhase(event.id)}
                  disabled={!canAppendEventPhase(event.phases)}
                  title={canAppendEventPhase(event.phases) ? undefined : "This event needs at least 10 minutes before it can be split."}
                >+ PHASE IN THIS EVENT</button>
                <div className="event-editor-open-stations">
                  <button type="button" onClick={() => onSearchOpenStations(event.id)} disabled={!canSearchOpenStations || !eventWindow(event.phases)} title={canSearchOpenStations ? undefined : "Import and link the full schedule to search open stations."}>SEARCH OPEN STATIONS</button>
                  {searchingEventId === event.id ? <div className="event-editor-open-results">
                    <b>OPEN FOR THIS FULL EVENT</b>
                    {openStationWarning ? <span className="event-editor-open-warning">⚠ {openStationWarning}</span> : openStationResults.length ? openStationResults.map((station) => <button key={station.id} type="button" onClick={() => onAddOpenStation(event.id, station.id)}>+ {station.alias} · OPEN STATION</button>) : <span>No mapped areas are free for the entire event window.</span>}
                  </div> : null}
                </div>
              </article>
              {nextEvent ? <button type="button" className="event-editor-add-between" onClick={() => onAddEventBetween(event.id, nextEvent.id)}>+ NEW EVENT HERE</button> : null}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LegacyLessonDocument({
  phases,
  attendanceById,
  attendanceRoster,
  tasks,
  taskIsDone,
  className,
  dateLabel,
  dateIso,
  isCurrentPlan,
  onSetAttendanceStatus,
  onSetTaskDone,
}: {
  phases: LessonPhase[];
  attendanceById: Record<string, AttendanceStatus>;
  attendanceRoster: Array<{ id: string; name: string }>;
  tasks: DemoOperationTask[];
  taskIsDone: (taskId: string) => boolean;
  className: string;
  dateLabel: string;
  dateIso: string;
  isCurrentPlan: boolean;
  onSetAttendanceStatus: (athleteId: string, status: AttendanceStatus) => void;
  onSetTaskDone: (taskId: string, isDone: boolean) => void;
}) {
  const paperRef = useRef<HTMLElement | null>(null);

  function downloadLessonPlan() {
    if (!paperRef.current) return;
    const html = standaloneLessonPlanHtml({
      pageTitle: `${className} Lesson · ${dateLabel}`,
      renderedPaperHtml: paperRef.current.outerHTML,
    });
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = lessonPlanDownloadFilename(className, dateIso);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="legacy-document retro-window" aria-label="Generated text lesson plan">
      <div className="window-title">{isCurrentPlan ? "TODAY'S LESSON PLAN" : "SAVED LESSON PLAN"} <span>GENERATED FROM YOUR PHASES</span></div>
      <div className="legacy-document-download-toolbar">
        <span><b>STYLED OFFLINE COPY</b> · PRIVATE LOCAL HTML · NO SYNC</span>
        <button type="button" onClick={downloadLessonPlan}>DOWNLOAD LESSON PLAN (.HTML)</button>
      </div>
      <article ref={paperRef} className="legacy-document-paper">
        <h3>✧ {className.toUpperCase()} LESSON ✧</h3>
        <p className="legacy-date">{dateLabel}</p>
        <section><h4>ANNOUNCEMENTS</h4><p>—</p></section>
        <section><h4>GOALS</h4><p>Keep rotations clear and use the lesson plan as the shared coaching reference.</p></section>
        <section>
          <h4>PLAN</h4>
          <div className="legacy-plan-list">
            {phases.map((phase) => {
              const drills = phaseDrillEntries(phase);
              return (
                <article key={phase.id} className="legacy-phase-plan">
                  <h5>{displayLessonTimeRange(phase.time)} · {documentPhaseName(phase)}</h5>
                  {phase.text.map((item, index) => <p key={`${phase.id}-cue-${index}`} className="legacy-text-cue"><b>COACHING CUE:</b> {item}</p>)}
                  {drills.map(({ area, card }) => {
                    const mats = listedMats(card.mats);
                    return (
                      <div key={`${area}-${card.id}`} className="legacy-drill">
                        <b>{documentDrillTitle(eventNameForPhase(phase), phase.title, area, card.title)}</b>
                        <p>{card.description}</p>
                        {mats.length ? <p className="legacy-mats"><strong>MATS:</strong> {mats.join(" · ")}</p> : null}
                      </div>
                    );
                  })}
                  {!phase.text.length && !drills.length ? <p className="legacy-plan-empty">No activities or drills added for this phase yet.</p> : null}
                </article>
              );
            })}
          </div>
        </section>
        <section><h4>REMINDERS</h4><p>Use the attendance controls below throughout class.</p></section>
        <section>
          <h4>TO-DOS</h4>
          <div className="legacy-todo-list">
            {tasks.map((task) => {
              const isDone = taskIsDone(task.id);
              return (
                <label key={task.id} className={`legacy-todo-check ${isDone ? "completed" : ""}`}>
                  <input type="checkbox" checked={isDone} onChange={(event) => onSetTaskDone(task.id, event.currentTarget.checked)} />
                  <span>{task.title}</span>
                </label>
              );
            })}
          </div>
        </section>
        <section><h4>REFLECTION</h4><p>—</p></section>
        <section>
          <h4>ATTENDANCE</h4>
          <ul className="legacy-attendance-list">
            {attendanceRoster.length ? attendanceRoster.map((athlete) => {
              const status = attendanceById[athlete.id] ?? "unmarked";
              const isChecked = status === "present" || status === "late";
              return (
                <li key={athlete.id}>
                  <label className="legacy-attendance-check">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) => onSetAttendanceStatus(athlete.id, event.currentTarget.checked ? "present" : "unmarked")}
                      aria-label={`Mark ${athlete.name} ${isChecked ? "not present" : "present"}`}
                    />
                    <span>{athlete.name}</span>
                  </label>
                  <small>{status}</small>
                </li>
              );
            }) : <li>No students are listed for this local class yet.</li>}
          </ul>
        </section>
      </article>
    </section>
  );
}

export default function Home() {
  const [lessonToday, setLessonToday] = useState(localLessonPlanDate);
  const [activePhaseId, setActivePhaseId] = useState("l3-f2");
  const [mode, setMode] = useState<"EDIT" | "VIEW">("EDIT");
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlanMeta>(() => makeLessonPlanMeta(TODAY_LESSON_PLAN_DATE, "legacy"));
  const activeLessonPlanIdRef = useRef(activeLessonPlan.id);
  const lessonModeRef = useRef(mode);
  const classSetupGuideRef = useRef<HTMLTextAreaElement | null>(null);
  const newIdeaCameraInputRef = useRef<HTMLInputElement | null>(null);
  const newIdeaMediaInputRef = useRef<HTMLInputElement | null>(null);
  const editIdeaCameraInputRef = useRef<HTMLInputElement | null>(null);
  const editIdeaMediaInputRef = useRef<HTMLInputElement | null>(null);
  const libraryTransferInputRef = useRef<HTMLInputElement | null>(null);
  const libraryStackRef = useRef<HTMLDivElement | null>(null);
  const libraryPinchRef = useRef<LibraryPinchState>({ active: false, startDistance: 0, startRowHeight: LIBRARY_ROW_HEIGHT_DEFAULT });
  const libraryPinchJustEndedRef = useRef(0);
  const libraryRowHeightRef = useRef(LIBRARY_ROW_HEIGHT_DEFAULT);
  const libraryStorageSnapshotRef = useRef<string | null>(null);
  const [isLibraryWindow, setIsLibraryWindow] = useState(false);
  activeLessonPlanIdRef.current = activeLessonPlan.id;
  lessonModeRef.current = mode;
  const [lessonPlanIndex, setLessonPlanIndex] = useState<StoredLessonPlanIndex | null>(null);
  const [planShelf, setPlanShelf] = useState<PlanShelf>(null);
  const [futurePlanDate, setFuturePlanDate] = useState(() => nextLessonPlanDate(TODAY_LESSON_PLAN_DATE));
  const [hydratedPlanId, setHydratedPlanId] = useState<string | null>(null);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [openStationSearchEventId, setOpenStationSearchEventId] = useState<string | null>(null);
  const [notice, setNotice] = useState("DRAFT LOCAL · MEDIA/SYNC NOT CONFIGURED");
  const [todoDone, setTodoDone] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [placedCard, setPlacedCard] = useState<string | null>(null);
  const [pendingZonePlacement, setPendingZonePlacement] = useState<PendingZonePlacement | null>(null);
  const [lessonPhases, setLessonPhases] = useState<LessonPhase[]>(makeInitialLesson);
  const [activeBoardSnapshot, setActiveBoardSnapshot] = useState<LessonBoardSnapshot | null>(null);
  const [attendanceById, setAttendanceById] = useState<Record<string, AttendanceStatus>>(makeDefaultAttendance);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [classStorage, setClassStorage] = useState<LocalClassStorage>(emptyLocalClassStorage);
  const [hasLoadedLocalClasses, setHasLoadedLocalClasses] = useState(false);
  const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classDraftName, setClassDraftName] = useState("");
  const [classDraftGroup, setClassDraftGroup] = useState("");
  const [classDraftCoach, setClassDraftCoach] = useState("");
  const [classDraftNotes, setClassDraftNotes] = useState("");
  const [classDraftRoster, setClassDraftRoster] = useState("");
  const [classImportRaw, setClassImportRaw] = useState("");
  const [classImportPreview, setClassImportPreview] = useState<LocalClassImportParseResult | null>(null);
  const [removeClassCandidate, setRemoveClassCandidate] = useState<LocalClass | null>(null);
  const [safeScheduleStorageState, setSafeScheduleStorageState] = useState<SafeScheduleStorage>(emptySafeScheduleStorage);
  const [hasLoadedSafeSchedule, setHasLoadedSafeSchedule] = useState(false);
  const [safeScheduleImportPreview, setSafeScheduleImportPreview] = useState<SafeScheduleImportPreview | null>(null);
  const [openAreaSelectionByKey, setOpenAreaSelectionByKey] = useState<Record<string, string[]>>({});
  const [visualAnchorByCardId, setVisualAnchorByCardId] = useState<Record<string, string>>({});
  const [visualLabelLayoutByCardId, setVisualLabelLayoutByCardId] = useState<Record<string, VisualLabelLayout>>({});
  const [customBoards, setCustomBoards] = useState<CustomBoard[]>([]);
  const [customBoardPhotoUrls, setCustomBoardPhotoUrls] = useState<Record<string, string>>({});
  const [hasLoadedCustomBoards, setHasLoadedCustomBoards] = useState(false);
  const [areaCatalog, setAreaCatalog] = useState<AreaCatalogPreferences>(emptyAreaCatalogPreferences);
  const [hasLoadedAreaCatalog, setHasLoadedAreaCatalog] = useState(false);
  const [stationBoardOverrides, setStationBoardOverrides] = useState<StationBoardOverrideStorage>(() => stationBoardOverrideStorage());
  const [hasLoadedStationBoardOverrides, setHasLoadedStationBoardOverrides] = useState(false);
  const [isAddingCustomBoard, setIsAddingCustomBoard] = useState(false);
  const [newCustomBoardTitle, setNewCustomBoardTitle] = useState("");
  const [newCustomBoardEventName, setNewCustomBoardEventName] = useState("");
  const [newCustomBoardFile, setNewCustomBoardFile] = useState<File | null>(null);
  const [replacingCustomBoardId, setReplacingCustomBoardId] = useState<string | null>(null);
  const [replacementCustomBoardFile, setReplacementCustomBoardFile] = useState<File | null>(null);
  const [editingArea, setEditingArea] = useState<AreaEditTarget | null>(null);
  const [areaTitleDraft, setAreaTitleDraft] = useState("");
  const [areaAliasDraft, setAreaAliasDraft] = useState("");
  const [areaNoteDraft, setAreaNoteDraft] = useState("");
  const [removingArea, setRemovingArea] = useState<AreaEditTarget | null>(null);
  const [boardToolById, setBoardToolById] = useState<Record<string, BoardTool>>({});
  const [selectedCustomSpotByBoardId, setSelectedCustomSpotByBoardId] = useState<Record<string, string | null>>({});
  const [selectedCustomLabelByBoardId, setSelectedCustomLabelByBoardId] = useState<Record<string, string | null>>({});
  const [selectedBuiltInSpotByZoneId, setSelectedBuiltInSpotByZoneId] = useState<Record<string, string | null>>({});
  const [selectedBuiltInLabelByZoneId, setSelectedBuiltInLabelByZoneId] = useState<Record<string, string | null>>({});
  const customBoardDragRef = useRef<CustomBoardDrag | null>(null);
  const customBoardDragConflictRef = useRef(false);
  const builtInBoardDragRef = useRef<BuiltInBoardDrag | null>(null);
  const builtInBoardDragConflictRef = useRef(false);
  const hasMigratedStoredBoardSnapshotsRef = useRef(false);
  const [detailCard, setDetailCard] = useState<LessonCard | LibraryItem | null>(null);
  const [editingLibraryItem, setEditingLibraryItem] = useState<LibraryItem | null>(null);
  const [libraryEditDraft, setLibraryEditDraft] = useState<LibraryEditDraft | null>(null);
  const [editingIdeaMediaFile, setEditingIdeaMediaFile] = useState<File | null>(null);
  const [removeEditingIdeaMedia, setRemoveEditingIdeaMedia] = useState(false);
  const [isSavingLibraryEdit, setIsSavingLibraryEdit] = useState(false);
  const [removeCandidate, setRemoveCandidate] = useState<LibraryItem | null>(null);
  const [isDeletingIdea, setIsDeletingIdea] = useState(false);
  const [hasLoadedLocalLesson, setHasLoadedLocalLesson] = useState(false);
  const [libraryRowHeight, setLibraryRowHeight] = useState(LIBRARY_ROW_HEIGHT_DEFAULT);
  const [hasLoadedLibraryView, setHasLoadedLibraryView] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<LibraryShelf>("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [gemIds, setGemIds] = useState<string[]>(INITIAL_DEMO_GEM_IDS);
  const [customLibraryCards, setCustomLibraryCards] = useState<LibraryItem[]>([]);
  const [ideaMediaUrls, setIdeaMediaUrls] = useState<Record<string, string>>({});
  const [recentIdeaIds, setRecentIdeaIds] = useState<string[]>([]);
  const [archivedIdeaIds, setArchivedIdeaIds] = useState<string[]>([]);
  const [restoredIdeaIds, setRestoredIdeaIds] = useState<string[]>([]);
  const [itemOverridesById, setItemOverridesById] = useState<Record<string, LibraryItem>>({});
  const [removedIdeaIds, setRemovedIdeaIds] = useState<string[]>([]);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaKind, setNewIdeaKind] = useState<LessonCard["kind"]>("DRILL");
  const [newIdeaTags, setNewIdeaTags] = useState("");
  const [newIdeaMats, setNewIdeaMats] = useState("");
  const [newIdeaMediaFile, setNewIdeaMediaFile] = useState<File | null>(null);
  const [isSavingNewIdea, setIsSavingNewIdea] = useState(false);
  const newIdeaMediaPreviewUrl = useLocalFileUrl(newIdeaMediaFile);
  const editingIdeaMediaPreviewUrl = useLocalFileUrl(editingIdeaMediaFile);
  const [libraryTransferImport, setLibraryTransferImport] = useState<LibraryTransferImportState | null>(null);
  const [visualLabelDraft, setVisualLabelDraft] = useState("");
  const [hasLoadedLibraryPreferences, setHasLoadedLibraryPreferences] = useState(false);
  const [operationTaskDoneByPlanId, setOperationTaskDoneByPlanId] = useState<Record<string, Record<string, boolean>>>({});
  const [viewAttendanceByPlanId, setViewAttendanceByPlanId] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [updateDecisionByRevision, setUpdateDecisionByRevision] = useState<Record<string, UpdateDecision>>({});
  const [hasLoadedOperations, setHasLoadedOperations] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  useEffect(() => {
    const libraryOnly = new URLSearchParams(window.location.search).get("library") === "1";
    setIsLibraryWindow(libraryOnly);
    if (!libraryOnly) return;
    const previousTitle = document.title;
    document.title = "Idea Library · Lesson Planner";
    return () => { document.title = previousTitle; };
  }, []);
  const setLibraryRowHeightVisual = useCallback((value: number) => {
    const next = clampLibraryRowHeight(value);
    const descriptionProgress = Math.max(0, Math.min(1, (next - 82) / (LIBRARY_ROW_HEIGHT_MAX - 82)));
    const extraProgress = Math.max(0, Math.min(1, (next - 100) / (LIBRARY_ROW_HEIGHT_MAX - 100)));
    libraryRowHeightRef.current = next;
    const stack = libraryStackRef.current;
    if (stack) {
      stack.style.setProperty("--idea-row-height", `${next}px`);
      stack.style.setProperty("--library-description-height", `${Math.round(descriptionProgress * 34)}px`);
      stack.style.setProperty("--library-description-opacity", String(descriptionProgress));
      stack.style.setProperty("--library-extra-height", `${Math.round(extraProgress * 18)}px`);
      stack.style.setProperty("--library-extra-opacity", String(extraProgress));
    }
    return next;
  }, []);
  const adjustLibraryRowHeight = useCallback((delta: number) => {
    const next = setLibraryRowHeightVisual(libraryRowHeightRef.current + delta);
    setLibraryRowHeight(next);
  }, [setLibraryRowHeightVisual]);
  const activePhase = useMemo(
    () => lessonPhases.find((phase) => phase.id === activePhaseId) ?? lessonPhases[0],
    [activePhaseId, lessonPhases],
  );
  const eventEditorGroups = useMemo(() => {
    const byId = new Map<string, EventEditorGroup>();
    lessonPhases.forEach((phase) => {
      const eventId = phase.eventId ?? phase.id;
      const current = byId.get(eventId);
      if (current) current.phases.push(phase);
      else byId.set(eventId, { id: eventId, phases: [phase] });
    });
    return [...byId.values()];
  }, [lessonPhases]);
  const eventTimingIssues = useMemo(
    () => eventScheduleIssues(eventEditorGroups),
    [eventEditorGroups],
  );
  const activeEventPhases = useMemo(
    () => lessonPhases.filter((phase) => (phase.eventId ?? phase.id) === (activePhase.eventId ?? activePhase.id)),
    [activePhase.eventId, activePhase.id, lessonPhases],
  );
  const activeLessonDateLabel = formatLessonPlanDate(activeLessonPlan.date);
  const isPastActivePlan = isPastLessonPlanDate(activeLessonPlan.date, lessonToday);
  const operationTaskDoneById = operationTaskDoneByPlanId[activeLessonPlan.id] ?? {};
  const activeLocalClass = useMemo(
    () => localClassById(classStorage, activeClassId),
    [activeClassId, classStorage],
  );
  const attendanceRoster = useMemo(
    () => activeLocalClass?.students ?? attendance,
    [activeLocalClass],
  );
  const localScheduleBlocks = useMemo(
    () => activeLocalClass
      ? localScheduleBlocksForLessonDate(activeLocalClass.schedule, activeLessonPlan.date)
      : [],
    [activeLessonPlan.date, activeLocalClass],
  );
  const safeScheduleBundle = safeScheduleStorageState.bundle;
  const safeScheduleGroupOptions = useMemo(
    () => safeScheduleBundle ? safeScheduleGroups(safeScheduleBundle) : [],
    [safeScheduleBundle],
  );
  const linkedSafeScheduleGroup = activeLocalClass
    ? safeScheduleStorageState.scheduleGroupByClassId[activeLocalClass.id] ?? null
    : null;
  const safeScheduleDay = useMemo(
    () => safeScheduleBundle
      ? resolveSafeScheduleDay(
        safeScheduleBundle,
        activeLessonPlan.date,
        linkedSafeScheduleGroup,
        safeScheduleStorageState.manualWeekByDate[activeLessonPlan.date] ?? null,
      )
      : null,
    [activeLessonPlan.date, linkedSafeScheduleGroup, safeScheduleBundle, safeScheduleStorageState.manualWeekByDate],
  );
  const usesSafeScheduleDay = safeScheduleDay?.status === "ready";
  const activeScheduleBlockCount = usesSafeScheduleDay
    ? safeScheduleDay.nonOpenBlocks.length
    : activeLocalClass ? localScheduleBlocks.length : scheduleDayAdvisoryDemo.rotationBlocks.length;
  const activeScheduleGroup = linkedSafeScheduleGroup
    ?? activeLocalClass?.group
    ?? activeLocalClass?.name
    ?? scheduleDayAdvisoryDemo.selectedGroup;
  const pastLessonPlans = useMemo(
    () => (lessonPlanIndex?.plans ?? [])
      .filter((plan) => plan.id !== activeLessonPlan.id && isPastLessonPlanDate(plan.date, lessonToday))
      .sort((first, second) => second.date.localeCompare(first.date)),
    [activeLessonPlan.id, lessonPlanIndex, lessonToday],
  );
  const renderingCustomBoards = useMemo(
    () => isPastActivePlan ? activeBoardSnapshot?.customBoards ?? [] : customBoards,
    [activeBoardSnapshot, customBoards, isPastActivePlan],
  );
  const renderingStationBoardOverrides = useMemo(
    () => isPastActivePlan
      ? activeBoardSnapshot?.stationBoardOverrides ?? stationBoardOverrideStorage()
      : stationBoardOverrides,
    [activeBoardSnapshot, isPastActivePlan, stationBoardOverrides],
  );
  const currentCustomBoardById = useMemo(
    () => new Map(customBoards.map((board) => [board.id, board])),
    [customBoards],
  );
  const renderingCustomBoardById = useMemo(
    () => new Map(renderingCustomBoards.map((board) => [board.id, board])),
    [renderingCustomBoards],
  );
  const isZoneHidden = (zone: ZonePanel) => zone.customBoardId
    ? isCustomBoardHidden(areaCatalog, zone.customBoardId)
    : isBuiltInAreaHidden(areaCatalog, zone.id);
  const availableZones = useMemo(
    () => customBoards
      .filter((board) => !isCustomBoardHidden(areaCatalog, board.id))
      .map(customZoneForBoard),
    [areaCatalog, customBoards],
  );
  const openScheduleZones = useMemo(
    () => zoneCatalog
      .filter((zone) => !isBuiltInAreaHidden(areaCatalog, zone.id) && Boolean(gymPanelLayout(zone.id)))
      .map((zone) => areaZoneWithOverride(zone, areaCatalog)),
    [areaCatalog],
  );
  const openAvailabilityByBookingId = useMemo(() => {
    if (!usesSafeScheduleDay || !safeScheduleDay) return new Map<string, ReturnType<typeof resolveOpenAreaAvailability>>();
    return new Map(safeScheduleDay.openBlocks.map((block) => [
      block.bookingId,
      resolveOpenAreaAvailability(safeScheduleDay, block, openScheduleZones.map((zone) => zone.id)),
    ]));
  }, [openScheduleZones, safeScheduleDay, usesSafeScheduleDay]);
  const plannerScheduleEventConflicts = useMemo(() => {
    if (!usesSafeScheduleDay || !safeScheduleDay) return [];
    const candidatePanelIds = openScheduleZones.map((zone) => zone.id);
    const zoneById = new Map(openScheduleZones.map((zone) => [zone.id, zone]));
    return eventEditorGroups.flatMap((event) => {
      const window = eventWindow(event.phases);
      const startMinute = window ? pickerMinuteForSchedule(window.start) : null;
      const endMinute = window ? pickerMinuteForSchedule(window.end) : null;
      if (startMinute === null || endMinute === null) return [];
      const availability = resolveAreaAvailabilityForInterval(
        safeScheduleDay,
        { startMinute, endMinute },
        candidatePanelIds,
      );
      if (!availability) return [];
      const selectedPanelIds = [...new Set(event.phases.flatMap((phase) => phase.zones.map((zone) => zone.id)))]
        .filter((panelId) => candidatePanelIds.includes(panelId));
      const unavailablePanelIds = selectedPanelIds.filter((panelId) => availability.unavailablePanelIds.includes(panelId));
      if (!selectedPanelIds.length || (!unavailablePanelIds.length && !availability.unmappedEquipment.length)) return [];
      const detailParts = [
        unavailablePanelIds.length
          ? `${unavailablePanelIds.map((panelId) => zoneById.get(panelId)?.alias ?? panelId).join(", ")} ${unavailablePanelIds.length === 1 ? "is" : "are"} occupied during this full event window.`
          : null,
        availability.unmappedEquipment.length
          ? `${availability.unmappedEquipment.join(", ")} ${availability.unmappedEquipment.length === 1 ? "is" : "are"} unmapped in the imported schedule, so full-event availability cannot be confirmed.`
          : null,
      ].filter((detail): detail is string => Boolean(detail));
      return [{
        eventId: event.id,
        unavailablePanelIds,
        detail: detailParts.join(" "),
      }];
    });
  }, [eventEditorGroups, openScheduleZones, safeScheduleDay, usesSafeScheduleDay]);
  const openStationSearch = useMemo(() => {
    if (!openStationSearchEventId || !usesSafeScheduleDay || !safeScheduleDay) return { stations: [], warning: null };
    const event = eventEditorGroups.find((candidate) => candidate.id === openStationSearchEventId);
    const window = event ? eventWindow(event.phases) : null;
    const startMinute = window ? pickerMinuteForSchedule(window.start) : null;
    const endMinute = window ? pickerMinuteForSchedule(window.end) : null;
    if (startMinute === null || endMinute === null) return { stations: [], warning: null };
    const availability = resolveAreaAvailabilityForInterval(
      safeScheduleDay,
      { startMinute, endMinute },
      openScheduleZones.map((zone) => zone.id),
    );
    if (!availability) return { stations: [], warning: null };
    if (availability.unmappedEquipment.length) {
      return {
        stations: [],
        warning: `${availability.unmappedEquipment.join(", ")} ${availability.unmappedEquipment.length === 1 ? "is" : "are"} not mapped to a planner area, so no station can be confirmed open for this event.`,
      };
    }
    return {
      stations: openScheduleZones
        .filter((zone) => availability.availablePanelIds.includes(zone.id))
        .map((zone) => ({ id: zone.id, alias: zone.alias })),
      warning: null,
    };
  }, [eventEditorGroups, openScheduleZones, openStationSearchEventId, safeScheduleDay, usesSafeScheduleDay]);
  const assistantUpdates = useMemo(
    () => generatePlannerUpdates({
      phases: lessonPhases,
      schedule: {
        status: safeScheduleDay?.status ?? "not_linked",
        collisionWarningCount: safeScheduleBundle?.schedule.collisionWarnings.warningCount,
        eventConflicts: plannerScheduleEventConflicts,
      },
    }),
    [lessonPhases, plannerScheduleEventConflicts, safeScheduleBundle?.schedule.collisionWarnings.warningCount, safeScheduleDay?.status],
  );
  const hiddenAreaEntries = useMemo(
    () => customBoards
      .filter((board) => isCustomBoardHidden(areaCatalog, board.id))
      .map((board) => ({ target: { kind: "custom", id: board.id } as AreaEditTarget, zone: customZoneForBoard(board) })),
    [areaCatalog, customBoards],
  );
  const pendingPlacementPhase = useMemo(
    () => pendingZonePlacement
      ? lessonPhases.find((phase) => phase.id === pendingZonePlacement.phaseId)
      : undefined,
    [lessonPhases, pendingZonePlacement],
  );
  const allLibraryItems = useMemo(
    () => customLibraryCards.map(copyLibraryItem),
    [customLibraryCards],
  );
  const libraryCards = useMemo(() => {
    const normalizedSearch = librarySearch.trim().toLocaleLowerCase();
    const gemIdSet = new Set(gemIds);
    const recentOrder = new Map(recentIdeaIds.map((id, index) => [id, index]));
    const archivedIdSet = new Set(archivedIdeaIds);
    const restoredIdSet = new Set(restoredIdeaIds);
    const removedIdSet = new Set(removedIdeaIds);

    return allLibraryItems
      .map((card) => ({
        ...card,
        starred: gemIdSet.has(card.id),
        isArchived: archivedIdSet.has(card.id) || (Boolean(card.defaultArchived) && !restoredIdSet.has(card.id)),
        isRemoved: removedIdSet.has(card.id),
      }))
      .filter((card) => {
        if (libraryFilter === "archive") return card.isArchived || card.isRemoved;
        if (card.isArchived || card.isRemoved) return false;
        if (libraryFilter === "gems") return card.starred;
        return libraryFilter !== "recent" || recentOrder.has(card.id);
      })
      .filter((card) => !normalizedSearch
        || card.title.toLocaleLowerCase().includes(normalizedSearch)
        || card.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedSearch))
        || card.events.some((event) => event.toLocaleLowerCase().includes(normalizedSearch))
        || card.skills.some((skill) => skill.toLocaleLowerCase().includes(normalizedSearch))
        || (card.mats ?? []).some((mat) => mat.toLocaleLowerCase().includes(normalizedSearch))
        || card.instructions.some((instruction) => instruction.toLocaleLowerCase().includes(normalizedSearch))
        || card.variants.some((variant) => (
          variant.title.toLocaleLowerCase().includes(normalizedSearch)
          || variant.instructions.some((instruction) => instruction.toLocaleLowerCase().includes(normalizedSearch))
        )))
      .sort((first, second) => {
        if (libraryFilter === "recent") return (recentOrder.get(first.id) ?? 0) - (recentOrder.get(second.id) ?? 0);
        const firstRecentRank = recentOrder.get(first.id) ?? Number.POSITIVE_INFINITY;
        const secondRecentRank = recentOrder.get(second.id) ?? Number.POSITIVE_INFINITY;
        if (firstRecentRank !== secondRecentRank) return firstRecentRank - secondRecentRank;
        return Number(Boolean(second.starred)) - Number(Boolean(first.starred)) || first.title.localeCompare(second.title);
      });
  }, [allLibraryItems, archivedIdeaIds, gemIds, libraryFilter, librarySearch, recentIdeaIds, removedIdeaIds, restoredIdeaIds]);
  const unresolvedUpdateCount = useMemo(
    () => assistantUpdates.filter((update) => !updateDecisionByRevision[revisionKey(update)]).length,
    [assistantUpdates, updateDecisionByRevision],
  );
  const visibleZones = activePhase.mode === "TEXT"
    ? []
    : activePhase.zones.filter((zone) => isPastActivePlan || !isZoneHidden(zone));
  const isActivePhasePlacementMode = mode === "EDIT" && pendingZonePlacement?.phaseId === activePhase.id;
  const placementAllowsText = pendingZonePlacement?.kind !== "visual-label";
  const shouldShowTextLane = activePhase.mode === "TEXT"
    || (activePhase.mode === "MIXED"
      && (Boolean(activePhase.text.length || activePhase.textCards?.length) || (isActivePhasePlacementMode && placementAllowsText)));

  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return;
    const timer = window.setInterval(() => setTimerSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 5, 0);
    const timeout = window.setTimeout(() => setLessonToday(localLessonPlanDate()), Math.max(1, nextMidnight.getTime() - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [lessonToday]);

  useEffect(() => {
    if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setNotice("PHASE TIMER COMPLETE · LOCAL DEMO ONLY");
    }
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    if (!hasLoadedLocalLesson || !isPastActivePlan) return;
    clearTransientLessonPlanControls();
    lessonModeRef.current = "VIEW";
    setMode("VIEW");
    setNotice(`${formatLessonPlanDate(activeLessonPlan.date)} IS A PAST SNAPSHOT · READ-ONLY`);
  }, [activeLessonPlan.date, hasLoadedLocalLesson, isPastActivePlan]);

  useEffect(() => {
    try {
      const storedIndex = window.localStorage.getItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY);
      const parsedIndex: unknown = storedIndex ? JSON.parse(storedIndex) : null;
      const legacyMeta = makeLessonPlanMeta(TODAY_LESSON_PLAN_DATE, "legacy");
      let index = isStoredLessonPlanIndex(parsedIndex)
        ? parsedIndex
        : { version: 1 as const, activePlanId: legacyMeta.id, plans: [legacyMeta] };

      if (!isStoredLessonPlanIndex(parsedIndex)) {
        window.localStorage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(index));
      }

      let activePlan = index.plans.find((plan) => plan.id === index.activePlanId) ?? index.plans[0] ?? legacyMeta;
      if (!index.plans.some((plan) => plan.id === activePlan.id)) {
        index = { ...index, activePlanId: legacyMeta.id, plans: [legacyMeta] };
        activePlan = legacyMeta;
        window.localStorage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(index));
      }

      const storedLesson = window.localStorage.getItem(
        activePlan.storage === "legacy" ? LOCAL_LESSON_STORAGE_KEY : lessonPlanStorageKey(activePlan.id),
      );
      const restoredSource = storedLesson ? restoreLesson(JSON.parse(storedLesson)) : restoreLesson(makeBlankStoredLesson());
      const restored = restoredSource && !isPastLessonPlanDate(activePlan.date, localLessonPlanDate())
        ? migrateEditableRestoredLesson(restoredSource)
        : restoredSource;

      if (restored) {
        activeLessonPlanIdRef.current = activePlan.id;
        setActiveLessonPlan(activePlan);
        setLessonPlanIndex(index);
        setLessonPhases(restored.phases);
        setTodoDone(restored.todoDone);
        setIsReady(restored.isReady);
        setActiveClassId(restored.classId);
        setAttendanceById(restored.attendanceById);
        setVisualAnchorByCardId(restored.visualAnchorByCardId);
        setVisualLabelLayoutByCardId(restored.visualLabelLayoutByCardId);
        setActiveBoardSnapshot(restored.boardSnapshot);
        setActivePhaseId(restored.phases[0]?.id ?? "l3-f2");
        setFuturePlanDate(nextLessonPlanDate(localLessonPlanDate()));
        setHydratedPlanId(activePlan.id);
        setNotice(restored.migrated
          ? "LOCAL LESSON PLAN RESTORED · PHASE DATA UPGRADED IN THIS BROWSER"
          : "LOCAL LESSON PLAN RESTORED · THIS BROWSER ONLY");
      }
    } catch {
      setNotice("LOCAL DEMO DATA ACTIVE · COULD NOT RESTORE THE LAST EDIT");
    } finally {
      setHasLoadedLocalLesson(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalLesson
      || !hasLoadedCustomBoards
      || !hasLoadedStationBoardOverrides
      || hydratedPlanId !== activeLessonPlan.id
      || isPastActivePlan) return;
    const savedLesson: StoredLesson = {
      version: 7,
      phases: lessonPhases,
      todoDone,
      isReady,
      classId: activeClassId,
      attendanceById,
      visualAnchorByCardId,
      visualLabelLayoutByCardId,
      boardSnapshot: createLessonBoardSnapshot(lessonPhases, customBoards, stationBoardOverrides),
    };
    try {
      const storageKey = activeLessonPlan.storage === "legacy"
        ? LOCAL_LESSON_STORAGE_KEY
        : lessonPlanStorageKey(activeLessonPlan.id);
      window.localStorage.setItem(storageKey, JSON.stringify(savedLesson));
      setActiveBoardSnapshot(savedLesson.boardSnapshot);
      setLessonPlanIndex((current) => {
        const fallback: StoredLessonPlanIndex = {
          version: 1,
          activePlanId: activeLessonPlan.id,
          plans: [activeLessonPlan],
        };
        const source = current ?? fallback;
        const updatedPlan = { ...activeLessonPlan, updatedAt: new Date().toISOString() };
        const next: StoredLessonPlanIndex = {
          ...source,
          activePlanId: activeLessonPlan.id,
          plans: source.plans.some((plan) => plan.id === activeLessonPlan.id)
            ? source.plans.map((plan) => plan.id === activeLessonPlan.id ? updatedPlan : plan)
            : [...source.plans, updatedPlan],
        };
        window.localStorage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    } catch {
      setNotice("LOCAL LESSON PLAN ACTIVE · BROWSER STORAGE IS UNAVAILABLE");
    }
  }, [activeClassId, activeLessonPlan, attendanceById, customBoards, hasLoadedCustomBoards, hasLoadedLocalLesson, hasLoadedStationBoardOverrides, hydratedPlanId, isPastActivePlan, isReady, lessonPhases, stationBoardOverrides, todoDone, visualAnchorByCardId, visualLabelLayoutByCardId]);

  function currentLessonSnapshot(): StoredLesson {
    return {
      version: 7,
      phases: lessonPhases,
      todoDone,
      isReady,
      classId: activeClassId,
      attendanceById,
      visualAnchorByCardId,
      visualLabelLayoutByCardId,
      boardSnapshot: createLessonBoardSnapshot(lessonPhases, customBoards, stationBoardOverrides),
    };
  }

  function makeBlankStoredLessonForCurrentBoards(classId = activeClassId): StoredLesson {
    const blankLesson = makeBlankStoredLesson(classId);
    return {
      ...blankLesson,
      boardSnapshot: createLessonBoardSnapshot(blankLesson.phases, customBoards, stationBoardOverrides),
    };
  }

  function storageKeyForLessonPlan(plan: LessonPlanMeta): string {
    return plan.storage === "legacy" ? LOCAL_LESSON_STORAGE_KEY : lessonPlanStorageKey(plan.id);
  }

  function indexWithPlan(index: StoredLessonPlanIndex | null, plan: LessonPlanMeta, activePlanId = plan.id): StoredLessonPlanIndex {
    const source: StoredLessonPlanIndex = index ?? {
      version: 1,
      activePlanId,
      plans: [plan],
    };
    return {
      ...source,
      activePlanId,
      plans: source.plans.some((candidate) => candidate.id === plan.id)
        ? source.plans.map((candidate) => candidate.id === plan.id ? plan : candidate)
        : [...source.plans, plan],
    };
  }

  function persistLessonPlanIndex(index: StoredLessonPlanIndex): boolean {
    try {
      window.localStorage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(index));
      setLessonPlanIndex(index);
      return true;
    } catch {
      setNotice("LOCAL PLAN LIST ACTIVE · BROWSER STORAGE IS UNAVAILABLE");
      return false;
    }
  }

  function persistCurrentLessonForSwitch(): StoredLessonPlanIndex | null {
    if (!hasLoadedCustomBoards || !hasLoadedStationBoardOverrides) {
      setNotice("LOCAL BOARD SNAPSHOTS ARE STILL LOADING · TRY AGAIN IN A MOMENT");
      return null;
    }
    if (isPastActivePlan) return lessonPlanIndex;
    const savedCurrentPlan = { ...activeLessonPlan, updatedAt: new Date().toISOString() };
    const nextIndex = indexWithPlan(lessonPlanIndex, savedCurrentPlan, activeLessonPlan.id);
    try {
      window.localStorage.setItem(storageKeyForLessonPlan(savedCurrentPlan), JSON.stringify(currentLessonSnapshot()));
      window.localStorage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, JSON.stringify(nextIndex));
      setLessonPlanIndex(nextIndex);
      return nextIndex;
    } catch {
      setNotice("CURRENT LESSON STAYS OPEN · BROWSER STORAGE IS UNAVAILABLE");
      return null;
    }
  }

  function clearTransientLessonPlanControls() {
    setPendingZonePlacement(null);
    setPlacedCard(null);
    setVisualLabelDraft("");
    setIsEventEditorOpen(false);
    setIsAddingIdea(false);
    setIsAddingCustomBoard(false);
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
    setEditingArea(null);
    setAreaTitleDraft("");
    setAreaAliasDraft("");
    setAreaNoteDraft("");
    setRemovingArea(null);
    setIsClassManagerOpen(false);
    setRemoveClassCandidate(null);
    setOpenAreaSelectionByKey({});
    setDetailCard(null);
    setEditingLibraryItem(null);
    setLibraryEditDraft(null);
    setEditingIdeaMediaFile(null);
    setRemoveEditingIdeaMedia(false);
    setRemoveCandidate(null);
    setBoardToolById({});
    setSelectedCustomSpotByBoardId({});
    setSelectedCustomLabelByBoardId({});
    setSelectedBuiltInSpotByZoneId({});
    setSelectedBuiltInLabelByZoneId({});
    customBoardDragRef.current = null;
    customBoardDragConflictRef.current = false;
    builtInBoardDragRef.current = null;
    builtInBoardDragConflictRef.current = false;
    setIsTimerRunning(false);
    setTimerSeconds(30 * 60);
  }

  function hydrateLessonPlan(
    plan: LessonPlanMeta,
    restored: RestoredLesson,
    index: StoredLessonPlanIndex,
    message: string,
  ) {
    // This guard keeps the current plan's autosave effect from ever writing
    // into the next plan while React applies the new lesson state.
    setHydratedPlanId(null);
    activeLessonPlanIdRef.current = plan.id;
    setActiveLessonPlan(plan);
    setLessonPlanIndex(index);
    setLessonPhases(isPastLessonPlanDate(plan.date, lessonToday) ? restored.phases : refreshAreaZoneMetadata(restored.phases));
    setTodoDone(restored.todoDone);
    setIsReady(restored.isReady);
    setActiveClassId(restored.classId);
    setAttendanceById({ ...restored.attendanceById, ...viewAttendanceByPlanId[plan.id] });
    setVisualAnchorByCardId(restored.visualAnchorByCardId);
    setVisualLabelLayoutByCardId(restored.visualLabelLayoutByCardId);
    setActiveBoardSnapshot(restored.boardSnapshot);
    setActivePhaseId(restored.phases[0]?.id ?? "l3-f2");
    setFuturePlanDate(nextLessonPlanDate(lessonToday));
    clearTransientLessonPlanControls();
    const nextMode = isPastLessonPlanDate(plan.date, lessonToday) ? "VIEW" : "EDIT";
    lessonModeRef.current = nextMode;
    setMode(nextMode);
    setPlanShelf(null);
    setHydratedPlanId(plan.id);
    setNotice(message);
  }

  function openLessonPlan(requestedPlan: LessonPlanMeta) {
    if (requestedPlan.id === activeLessonPlan.id) {
      setPlanShelf(null);
      setIsEventEditorOpen(false);
      scrollToPlannerSection("today");
      return;
    }

    const savedIndex = persistCurrentLessonForSwitch();
    if (!savedIndex) return;
    const plan = savedIndex.plans.find((candidate) => candidate.id === requestedPlan.id);
    if (!plan) {
      setNotice("THAT LOCAL LESSON PLAN IS NO LONGER IN THIS BROWSER'S LIST");
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKeyForLessonPlan(plan));
      const restoredSource = stored
        ? restoreLesson(JSON.parse(stored))
        : restoreLesson(makeBlankStoredLessonForCurrentBoards());
      const restored = restoredSource && !isPastLessonPlanDate(plan.date, lessonToday)
        ? migrateEditableRestoredLesson(restoredSource)
        : restoredSource;
      if (!restored) {
        setNotice("THAT LOCAL LESSON PLAN COULD NOT BE OPENED · THE CURRENT PLAN WAS NOT CHANGED");
        return;
      }
      const needsBoardSnapshotUpgrade = restored.boardSnapshot === null;
      const frozenBoardSnapshot = restored.boardSnapshot
        ?? createLessonBoardSnapshot(restored.phases, customBoards, stationBoardOverrides);
      const frozenRestored: RestoredLesson = { ...restored, boardSnapshot: frozenBoardSnapshot };
      let boardSnapshotPersistenceFailed = false;
      if (!stored || needsBoardSnapshotUpgrade) {
        try {
          window.localStorage.setItem(
            storageKeyForLessonPlan(plan),
            JSON.stringify(storedLessonWithBoardSnapshot(frozenRestored, frozenBoardSnapshot)),
          );
        } catch {
          // Keep the detached snapshot in memory so this opened past plan does
          // not fall through to mutable global board state during this visit.
          boardSnapshotPersistenceFailed = true;
        }
      }
      const nextIndex = indexWithPlan(savedIndex, plan, plan.id);
      if (!persistLessonPlanIndex(nextIndex)) return;
      hydrateLessonPlan(
        plan,
        frozenRestored,
        nextIndex,
        `${stored
          ? `${formatLessonPlanDate(plan.date)} OPENED · ${isPastLessonPlanDate(plan.date, lessonToday) ? "PAST SNAPSHOT · READ-ONLY" : "LOCAL LESSON DRAFT"}`
          : `${formatLessonPlanDate(plan.date)} OPENED AS A CLEAN LOCAL TEMPLATE`}${
          needsBoardSnapshotUpgrade ? " · VISUAL BOARD STATE FROZEN NOW" : ""
        }${boardSnapshotPersistenceFailed ? " · FREEZE COULD NOT BE SAVED" : ""}`,
      );
      window.requestAnimationFrame(() => scrollToPlannerSection("today"));
    } catch {
      setNotice("THAT LOCAL LESSON PLAN COULD NOT BE OPENED · THE CURRENT PLAN WAS NOT CHANGED");
    }
  }

  function openTodayLessonPlan() {
    const existing = lessonPlanIndex?.plans.find((plan) => plan.date === lessonToday)
      ?? (lessonToday === TODAY_LESSON_PLAN_DATE ? makeLessonPlanMeta(TODAY_LESSON_PLAN_DATE, "legacy") : undefined);
    if (existing) {
      openLessonPlan(existing);
      return;
    }

    const savedIndex = persistCurrentLessonForSwitch();
    if (!savedIndex) return;
    const currentPlan = makeLessonPlanMeta(lessonToday, "scoped");
    const blankLesson = makeBlankStoredLessonForCurrentBoards();
    const restored = restoreLesson(blankLesson);
    if (!restored) return;
    const nextIndex = indexWithPlan(savedIndex, currentPlan, currentPlan.id);
    try {
      window.localStorage.setItem(storageKeyForLessonPlan(currentPlan), JSON.stringify(blankLesson));
      if (!persistLessonPlanIndex(nextIndex)) return;
      hydrateLessonPlan(
        currentPlan,
        restored,
        nextIndex,
        `${formatLessonPlanDate(currentPlan.date)} STARTED · BLANK LOCAL PLAN · PAST PLANS STAY UNCHANGED`,
      );
      window.requestAnimationFrame(() => scrollToPlannerSection("today"));
    } catch {
      setNotice("TODAY'S LOCAL PLAN COULD NOT START · THE CURRENT PLAN WAS NOT CHANGED");
    }
  }

  function createFutureLessonPlan(requestedDate = futurePlanDate) {
    const date = requestedDate.trim();
    if (!isLessonPlanDate(date) || date <= lessonToday) {
      setNotice(`CHOOSE A DATE AFTER ${formatLessonPlanDate(lessonToday)} FOR A FUTURE PLAN`);
      return;
    }

    const existing = lessonPlanIndex?.plans.find((plan) => plan.date === date);
    if (existing) {
      setNotice("A LOCAL LESSON PLAN ALREADY EXISTS FOR THAT DATE · OPENING IT NOW");
      openLessonPlan(existing);
      return;
    }

    const savedIndex = persistCurrentLessonForSwitch();
    if (!savedIndex) return;
    const futurePlan = makeLessonPlanMeta(date, "scoped");
    const blankLesson = makeBlankStoredLessonForCurrentBoards();
    const restored = restoreLesson(blankLesson);
    if (!restored) return;
    const nextIndex = indexWithPlan(savedIndex, futurePlan, futurePlan.id);
    try {
      window.localStorage.setItem(storageKeyForLessonPlan(futurePlan), JSON.stringify(blankLesson));
      if (!persistLessonPlanIndex(nextIndex)) return;
      hydrateLessonPlan(
        futurePlan,
        restored,
        nextIndex,
        `${formatLessonPlanDate(futurePlan.date)} STARTED · BLANK LOCAL PLAN · TODAY IS UNCHANGED`,
      );
      window.requestAnimationFrame(() => scrollToPlannerSection("today"));
    } catch {
      setNotice("FUTURE PLAN COULD NOT START · THE CURRENT PLAN WAS NOT CHANGED");
    }
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_CUSTOM_BOARD_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isCustomBoardStorage(parsed)) {
          setCustomBoards(parsed.boards);
          setNotice("LOCAL PHOTO AREAS RESTORED · PHOTOS STAY IN THIS DEVICE AND BROWSER");
        }
      }
    } catch {
      setNotice("PHOTO AREA DATA IS LOCAL · THE LAST AREA LIST COULD NOT BE RESTORED");
    } finally {
      setHasLoadedCustomBoards(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCustomBoards) return;
    try {
      window.localStorage.setItem(LOCAL_CUSTOM_BOARD_STORAGE_KEY, JSON.stringify(customBoardStorage(customBoards)));
    } catch {
      setNotice("PHOTO AREA LIST CHANGED · BROWSER STORAGE COULD NOT SAVE THE METADATA");
    }
  }, [customBoards, hasLoadedCustomBoards]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_AREA_CATALOG_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isAreaCatalogPreferences(parsed, BUILT_IN_ZONE_IDS)) {
          setAreaCatalog(parsed);
          setNotice("LOCAL AREA CUSTOMIZATIONS RESTORED · SUPPLIED BOARDS STAY UNCHANGED");
        } else {
          setNotice("SAVED AREA CUSTOMIZATIONS WERE NOT VALID · SUPPLIED AREAS STAY AVAILABLE");
        }
      }
    } catch {
      setNotice("LOCAL AREA CUSTOMIZATIONS ARE ACTIVE · THE LAST AREA LIST COULD NOT BE RESTORED");
    } finally {
      setHasLoadedAreaCatalog(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedAreaCatalog) return;
    try {
      window.localStorage.setItem(LOCAL_AREA_CATALOG_STORAGE_KEY, JSON.stringify(areaCatalogPreferences(areaCatalog)));
    } catch {
      setNotice("AREA CUSTOMIZATION IS ON SCREEN · BROWSER STORAGE COULD NOT SAVE IT");
    }
  }, [areaCatalog, hasLoadedAreaCatalog]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STATION_BOARD_OVERRIDE_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStationBoardOverrideStorage(parsed)) {
          setStationBoardOverrides(parsed);
        } else {
          setNotice("SAVED STATION-SPOT CHANGES WERE NOT VALID · THE SUPPLIED BOARD SPOTS ARE STILL INTACT");
        }
      }
    } catch {
      setNotice("SUPPLIED BOARD SPOTS ARE ACTIVE · LOCAL STATION-EDIT DATA COULD NOT BE RESTORED");
    } finally {
      setHasLoadedStationBoardOverrides(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStationBoardOverrides) return;
    try {
      window.localStorage.setItem(LOCAL_STATION_BOARD_OVERRIDE_STORAGE_KEY, JSON.stringify(stationBoardOverrides));
    } catch {
      setNotice("STATION-SPOT CHANGE IS ON SCREEN · BROWSER STORAGE COULD NOT SAVE IT");
    }
  }, [hasLoadedStationBoardOverrides, stationBoardOverrides]);

  useEffect(() => {
    if (hasMigratedStoredBoardSnapshotsRef.current
      || !hasLoadedLocalLesson
      || !hasLoadedCustomBoards
      || !hasLoadedStationBoardOverrides
      || !lessonPlanIndex) return;
    hasMigratedStoredBoardSnapshotsRef.current = true;

    let upgradedPlanCount = 0;
    let failedPlanCount = 0;
    lessonPlanIndex.plans.forEach((plan) => {
      try {
        const storageKey = storageKeyForLessonPlan(plan);
        const stored = window.localStorage.getItem(storageKey);
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (isStoredLesson(parsed)) return;
        const restored = restoreLesson(parsed);
        if (!restored) return;
        const boardSnapshot = createLessonBoardSnapshot(restored.phases, customBoards, stationBoardOverrides);
        const upgraded = storedLessonWithBoardSnapshot(restored, boardSnapshot);
        window.localStorage.setItem(storageKey, JSON.stringify(upgraded));
        if (plan.id === activeLessonPlan.id) setActiveBoardSnapshot(boardSnapshot);
        upgradedPlanCount += 1;
      } catch {
        failedPlanCount += 1;
      }
    });

    if (failedPlanCount) {
      setNotice("SAVED LESSONS STAY AVAILABLE · ONE OR MORE VISUAL BOARD SNAPSHOTS COULD NOT BE UPGRADED");
    } else if (upgradedPlanCount) {
      setNotice(`${upgradedPlanCount} SAVED LESSON${upgradedPlanCount === 1 ? "" : "S"} UPGRADED · VISUAL BOARD STATE IS NOW FROZEN PER PLAN`);
    }
  }, [activeLessonPlan.id, customBoards, hasLoadedCustomBoards, hasLoadedLocalLesson, hasLoadedStationBoardOverrides, lessonPlanIndex, stationBoardOverrides]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_CLASS_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isLocalClassStorage(parsed)) {
          setClassStorage(parsed);
        } else {
          setNotice("SAVED CLASS DATA WAS NOT VALID · NO ROSTER OR SCHEDULE WAS CHANGED");
        }
      }
    } catch {
      setNotice("LOCAL CLASSES ARE AVAILABLE · THE LAST CLASS LIST COULD NOT BE RESTORED");
    } finally {
      setHasLoadedLocalClasses(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalClasses) return;
    try {
      window.localStorage.setItem(LOCAL_CLASS_STORAGE_KEY, JSON.stringify(classStorage));
    } catch {
      setNotice("CLASS LIST CHANGED · BROWSER STORAGE COULD NOT SAVE IT");
    }
  }, [classStorage, hasLoadedLocalClasses]);

  useEffect(() => {
    if (!hasLoadedLocalClasses || !activeClassId) return;
    if (classStorage.classes.some((localClass) => localClass.id === activeClassId)) return;
    setActiveClassId(null);
    setNotice("THE CLASS SAVED ON THIS LESSON IS NO LONGER IN THIS BROWSER · SAMPLE ROSTER SHOWN");
  }, [activeClassId, classStorage.classes, hasLoadedLocalClasses]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_SAFE_SCHEDULE_STORAGE_KEY);
      if (stored) {
        const normalized = normalizeSafeScheduleStorage(JSON.parse(stored) as unknown);
        if (normalized) setSafeScheduleStorageState(normalized);
        else setNotice("SAVED FULL SCHEDULE WAS NOT VALID · CLASSES AND LESSONS WERE NOT CHANGED");
      }
    } catch {
      setNotice("FULL SCHEDULE IMPORT IS AVAILABLE · THE LAST LOCAL SCHEDULE COULD NOT BE RESTORED");
    } finally {
      setHasLoadedSafeSchedule(true);
    }
  }, []);

  function persistSafeScheduleStorage(next: SafeScheduleStorage): boolean {
    const normalized = normalizeSafeScheduleStorage(next);
    if (!normalized) {
      setNotice("FULL SCHEDULE CHANGE WAS REJECTED · SAVED LOCAL DATA STAYS UNCHANGED");
      return false;
    }
    try {
      window.localStorage.setItem(LOCAL_SAFE_SCHEDULE_STORAGE_KEY, JSON.stringify(normalized));
      setSafeScheduleStorageState(normalized);
      return true;
    } catch {
      setNotice("FULL SCHEDULE COULD NOT SAVE · THE CURRENT LOCAL COPY STAYS UNCHANGED");
      return false;
    }
  }

  useEffect(() => {
    if (!hasLoadedCustomBoards || !hasLoadedAreaCatalog || isPastActivePlan) return;
    setLessonPhases((phases) => refreshAreaZoneMetadata(phases));
  }, [areaCatalog, customBoards, hasLoadedAreaCatalog, hasLoadedCustomBoards, isPastActivePlan]);

  useEffect(() => {
    if (!hasLoadedCustomBoards) return;
    let active = true;
    const urls: string[] = [];
    setCustomBoardPhotoUrls({});
    void Promise.all(renderingCustomBoards.map(async (board) => {
      const photo = await loadCustomBoardPhoto(board.photoId);
      if (!photo || !active) return [board.photoId, ""] as const;
      const url = URL.createObjectURL(photo.blob);
      urls.push(url);
      return [board.photoId, url] as const;
    })).then((entries) => {
      if (!active) return;
      setCustomBoardPhotoUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))));
    }).catch(() => {
      if (active) setNotice("PHOTO AREA METADATA RESTORED · ONE OR MORE LOCAL PHOTOS ARE UNAVAILABLE");
    });
    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [hasLoadedCustomBoards, renderingCustomBoards]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_LIBRARY_STORAGE_KEY);
      libraryStorageSnapshotRef.current = stored;
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStoredLibraryPreferences(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setCustomLibraryCards(parsed.customCards.map(copyLibraryItem));
          setRecentIdeaIds([...new Set(parsed.recentIdeaIds)]);
          setArchivedIdeaIds([...new Set(parsed.archivedIdeaIds)]);
          setRestoredIdeaIds([...new Set(parsed.restoredIdeaIds)]);
          setItemOverridesById(Object.fromEntries(Object.entries(parsed.itemOverridesById).map(([id, card]) => [id, copyLibraryItem(card)])));
          setRemovedIdeaIds([...new Set(parsed.removedIdeaIds)]);
        } else if (isStoredLibraryPreferencesV5(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setCustomLibraryCards(parsed.customCards.map(copyLibraryItem));
          setRecentIdeaIds([...new Set(parsed.recentIdeaIds)]);
          setArchivedIdeaIds([...new Set(parsed.archivedIdeaIds)]);
          setRestoredIdeaIds([...new Set(parsed.restoredIdeaIds)]);
          setItemOverridesById(Object.fromEntries(Object.entries(parsed.itemOverridesById).map(([id, card]) => [id, copyLibraryItem(card)])));
          setRemovedIdeaIds([...new Set(parsed.removedIdeaIds)]);
          setNotice("LOCAL LIBRARY RESTORED · PHOTOS UPGRADED FOR PHOTO OR VIDEO ATTACHMENTS");
        } else if (isStoredLibraryPreferencesV4(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setCustomLibraryCards(parsed.customCards.map(copyLibraryItem));
          setRecentIdeaIds([...new Set(parsed.recentIdeaIds)]);
          setArchivedIdeaIds([...new Set(parsed.archivedIdeaIds)]);
          setRestoredIdeaIds([...new Set(parsed.restoredIdeaIds)]);
          setNotice("LOCAL LIBRARY RESTORED · EDITABLE IDEAS ADDED IN THIS BROWSER");
        } else if (isStoredLibraryPreferencesV3(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setCustomLibraryCards(parsed.customCards.map(makeLocalLibraryItem));
          setRecentIdeaIds([...new Set(parsed.recentIdeaIds)]);
          setNotice("LOCAL LIBRARY RESTORED · FULL VAULT CATALOG ADDED IN THIS BROWSER");
        } else if (isStoredLibraryPreferencesV2(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setCustomLibraryCards(parsed.customCards.map(makeLocalLibraryItem));
          setNotice("LOCAL LIBRARY RESTORED · ARCHIVE CONTROLS ADDED IN THIS BROWSER");
        } else if (isStoredLibraryPreferencesV1(parsed)) {
          setGemIds([...new Set(parsed.gemIds)]);
          setNotice("LOCAL DEMO CATALOG RESTORED · IDEA LIBRARY UPGRADED IN THIS BROWSER");
        }
      }
    } catch {
      setNotice("LOCAL DEMO CATALOG ACTIVE · GEM PREFERENCES COULD NOT BE RESTORED");
    } finally {
      setHasLoadedLibraryPreferences(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLibraryPreferences) return;
    const savedPreferences: StoredLibraryPreferences = {
      version: 6,
      gemIds,
      customCards: customLibraryCards,
      recentIdeaIds,
      archivedIdeaIds,
      restoredIdeaIds,
      itemOverridesById,
      removedIdeaIds,
    };
    try {
      const serialized = JSON.stringify(savedPreferences);
      if (serialized === libraryStorageSnapshotRef.current) return;
      libraryStorageSnapshotRef.current = serialized;
      window.localStorage.setItem(LOCAL_LIBRARY_STORAGE_KEY, serialized);
    } catch {
      setNotice("LOCAL DEMO CATALOG ACTIVE · GEM PREFERENCES CANNOT BE SAVED IN THIS BROWSER");
    }
  }, [archivedIdeaIds, customLibraryCards, gemIds, hasLoadedLibraryPreferences, itemOverridesById, recentIdeaIds, removedIdeaIds, restoredIdeaIds]);

  useEffect(() => {
    const syncLibraryPreferences = (event: StorageEvent) => {
      if (event.key !== LOCAL_LIBRARY_STORAGE_KEY || !event.newValue || event.newValue === libraryStorageSnapshotRef.current) return;
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (!isStoredLibraryPreferences(parsed) && !isStoredLibraryPreferencesV5(parsed)) return;
        libraryStorageSnapshotRef.current = event.newValue;
        setGemIds([...new Set(parsed.gemIds)]);
        setCustomLibraryCards(parsed.customCards.map(copyLibraryItem));
        setRecentIdeaIds([...new Set(parsed.recentIdeaIds)]);
        setArchivedIdeaIds([...new Set(parsed.archivedIdeaIds)]);
        setRestoredIdeaIds([...new Set(parsed.restoredIdeaIds)]);
        setItemOverridesById(Object.fromEntries(Object.entries(parsed.itemOverridesById).map(([id, card]) => [id, copyLibraryItem(card)])));
        setRemovedIdeaIds([...new Set(parsed.removedIdeaIds)]);
        setNotice("IDEA LIBRARY UPDATED FROM THE OTHER LOCAL WINDOW");
      } catch {
        // Keep the current in-memory library when another window writes invalid data.
      }
    };
    window.addEventListener("storage", syncLibraryPreferences);
    return () => window.removeEventListener("storage", syncLibraryPreferences);
  }, []);

  useEffect(() => {
    try {
      const storedHeight = libraryRowHeightFromStorage(window.localStorage.getItem(LOCAL_LIBRARY_VIEW_STORAGE_KEY));
      if (storedHeight !== null) {
        setLibraryRowHeightVisual(storedHeight);
        setLibraryRowHeight(storedHeight);
      }
    } finally {
      setHasLoadedLibraryView(true);
    }
  }, [setLibraryRowHeightVisual]);

  useEffect(() => {
    if (!hasLoadedLibraryView) return;
    try {
      window.localStorage.setItem(LOCAL_LIBRARY_VIEW_STORAGE_KEY, String(libraryRowHeight));
    } catch {
      // The tray still resizes for this visit if browser storage is unavailable.
    }
  }, [hasLoadedLibraryView, libraryRowHeight]);

  useEffect(() => {
    if (mode !== "EDIT" && !isLibraryWindow) return;
    const stack = libraryStackRef.current;
    if (!stack) return;
    setLibraryRowHeightVisual(libraryRowHeightRef.current);
    const pinch = libraryPinchRef.current;
    const distanceBetweenTouches = (touches: TouchList): number | null => {
      const first = touches.item(0);
      const second = touches.item(1);
      if (!first || !second) return null;
      return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    };
    const touchesAreInsideTray = (touches: TouchList) => Array.from(touches).every((touch) => {
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      return Boolean(target && stack.contains(target));
    });
    const beginPinch = (touches: TouchList) => {
      if (touches.length !== 2 || !touchesAreInsideTray(touches)) return false;
      const distance = distanceBetweenTouches(touches);
      if (!distance) return false;
      pinch.active = true;
      pinch.startDistance = distance;
      pinch.startRowHeight = libraryRowHeightRef.current;
      return true;
    };
    const finishPinch = (touches: TouchList) => {
      if (!pinch.active || touches.length >= 2) return;
      pinch.active = false;
      libraryPinchJustEndedRef.current = Date.now();
      setLibraryRowHeight(libraryRowHeightRef.current);
    };
    const onTouchStart = (event: TouchEvent) => {
      if (beginPinch(event.touches)) event.preventDefault();
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!pinch.active && !beginPinch(event.touches)) return;
      if (event.touches.length !== 2) return;
      const distance = distanceBetweenTouches(event.touches);
      if (!distance || !pinch.startDistance) return;
      event.preventDefault();
      setLibraryRowHeightVisual(pinch.startRowHeight * (distance / pinch.startDistance));
    };
    const onTouchEnd = (event: TouchEvent) => finishPinch(event.touches);
    const onTouchCancel = (event: TouchEvent) => finishPinch(event.touches);
    const preventSafariPinchZoom = (event: Event) => {
      if (pinch.active) event.preventDefault();
    };

    stack.addEventListener("touchstart", onTouchStart, { passive: false });
    stack.addEventListener("touchmove", onTouchMove, { passive: false });
    stack.addEventListener("touchend", onTouchEnd);
    stack.addEventListener("touchcancel", onTouchCancel);
    stack.addEventListener("gesturestart", preventSafariPinchZoom, { passive: false });
    stack.addEventListener("gesturechange", preventSafariPinchZoom, { passive: false });
    return () => {
      stack.removeEventListener("touchstart", onTouchStart);
      stack.removeEventListener("touchmove", onTouchMove);
      stack.removeEventListener("touchend", onTouchEnd);
      stack.removeEventListener("touchcancel", onTouchCancel);
      stack.removeEventListener("gesturestart", preventSafariPinchZoom);
      stack.removeEventListener("gesturechange", preventSafariPinchZoom);
    };
  }, [isLibraryWindow, mode, setLibraryRowHeightVisual]);

  useEffect(() => {
    if (!hasLoadedLibraryPreferences) return;
    let active = true;
    const urls: string[] = [];
    const mediaIds = [...new Set(allLibraryItems.flatMap((item) => item.mediaId ? [item.mediaId] : []))];
    void Promise.all(mediaIds.map(async (mediaId) => {
      const media = await loadIdeaMedia(mediaId);
      if (!media || !active) return [mediaId, ""] as const;
      const url = URL.createObjectURL(media.blob);
      urls.push(url);
      return [mediaId, url] as const;
    })).then((entries) => {
      if (!active) return;
      setIdeaMediaUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))));
    }).catch(() => {
      if (active) setNotice("IDEA LIBRARY RESTORED · ONE OR MORE LOCAL ATTACHMENTS ARE UNAVAILABLE ON THIS DEVICE");
    });
    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [allLibraryItems, hasLoadedLibraryPreferences]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_OPERATIONS_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStoredOperations(parsed)) {
          setOperationTaskDoneByPlanId(parsed.taskDoneByPlanId);
          setViewAttendanceByPlanId(parsed.attendanceByPlanId);
          const savedAttendance = parsed.attendanceByPlanId[activeLessonPlanIdRef.current];
          if (savedAttendance) setAttendanceById((current) => ({ ...current, ...savedAttendance }));
          setUpdateDecisionByRevision(parsed.updateDecisionByRevision);
          setNotice("LOCAL DEMO OPERATIONS RESTORED · THIS BROWSER ONLY");
        } else if (isStoredOperationsV1(parsed)) {
          setOperationTaskDoneByPlanId({ [activeLessonPlanIdRef.current]: parsed.taskDoneById });
          setUpdateDecisionByRevision(parsed.updateDecisionByRevision);
          setNotice("LOCAL DEMO OPERATIONS RESTORED · THIS BROWSER ONLY");
        }
      }
    } catch {
      setNotice("LOCAL DEMO OPERATIONS ACTIVE · COULD NOT RESTORE THE LAST EDIT");
    } finally {
      setHasLoadedOperations(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedOperations) return;
    const savedOperations: StoredOperations = {
      version: 2,
      taskDoneByPlanId: operationTaskDoneByPlanId,
      attendanceByPlanId: viewAttendanceByPlanId,
      updateDecisionByRevision,
    };
    try {
      window.localStorage.setItem(LOCAL_OPERATIONS_STORAGE_KEY, JSON.stringify(savedOperations));
    } catch {
      setNotice("LOCAL DEMO OPERATIONS ACTIVE · BROWSER STORAGE IS UNAVAILABLE");
    }
  }, [hasLoadedOperations, operationTaskDoneByPlanId, updateDecisionByRevision, viewAttendanceByPlanId]);

  function activePlanIsReadOnly() {
    if (!isPastActivePlan) return false;
    setNotice("PAST LESSON SNAPSHOT IS READ-ONLY · OPEN TODAY OR A FUTURE PLAN TO EDIT");
    return true;
  }

  function updateActivePhase(updater: (phase: LessonPhase) => LessonPhase) {
    if (activePlanIsReadOnly()) return;
    setLessonPhases((phases) => phases.map((phase) => (
      phase.id === activePhaseId ? updater(phase) : phase
    )));
  }

  function updatePhaseDetails(field: "title" | "time", value: string) {
    updateActivePhase((phase) => ({ ...phase, [field]: value }));
  }

  function updatePhaseDetailsById(phaseId: string, field: "title" | "time", value: string) {
    if (activePlanIsReadOnly()) return;
    setLessonPhases((phases) => phases.map((phase) => (
      phase.id === phaseId ? { ...phase, [field]: value } : phase
    )));
  }

  function updateEventPhaseStartById(phaseId: string, value: string) {
    if (activePlanIsReadOnly()) return;
    setLessonPhases((phases) => {
      const target = phases.find((phase) => phase.id === phaseId);
      if (!target) return phases;
      const eventId = target.eventId ?? target.id;
      const eventPhases = phases.filter((phase) => (phase.eventId ?? phase.id) === eventId);
      const revisedTimes = new Map(reflowEventPhaseStart(eventPhases, phaseId, value).map((phase) => [phase.id, phase.time]));
      return phases.map((phase) => revisedTimes.has(phase.id) ? { ...phase, time: revisedTimes.get(phase.id)! } : phase);
    });
  }

  function updateEventLabelById(eventId: string, value: string) {
    if (activePlanIsReadOnly()) return;
    setLessonPhases((phases) => phases.map((phase) => (
      (phase.eventId ?? phase.id) === eventId ? { ...phase, eventLabel: value } : phase
    )));
  }

  function moveEventById(eventId: string, direction: "up" | "down") {
    if (activePlanIsReadOnly()) return;
    const swap = swapAdjacentEventSlots(eventEditorGroups, eventId, direction);
    if (!swap) {
      setNotice("EVENTS NEED COMPLETE TIMES BEFORE THEIR TIME SLOTS CAN BE SWAPPED");
      return;
    }
    const groupsById = new Map(eventEditorGroups.map((event) => [event.id, event]));
    const revisedTimes = swap.timeByPhaseId;
    setLessonPhases(swap.eventOrder.flatMap((id) => (groupsById.get(id)?.phases ?? []).map((phase) => ({
      ...phase,
      time: revisedTimes.get(phase.id) ?? phase.time,
    }))));
    setNotice("EVENT TIME SLOTS SWAPPED · EACH EVENT KEPT ITS INTERNAL PHASE ORDER");
  }

  function repairAllEventTimes() {
    if (activePlanIsReadOnly()) return;
    const revisedTimes = repairEventTimes(eventEditorGroups);
    if (!revisedTimes) {
      setNotice("REPAIR TIMES NEEDS A COMPLETE START/END RANGE FOR EVERY EVENT · FINISH ANY PENDING EVENT FIRST");
      return;
    }
    setLessonPhases((phases) => phases.map((phase) => revisedTimes.has(phase.id)
      ? { ...phase, time: revisedTimes.get(phase.id)! }
      : phase));
    setNotice("EVENT TIMES REPAIRED · DURATIONS WERE KEPT AND THE DAY NOW RUNS CONTINUOUSLY");
  }

  function addEventBetween(previousEventId: string, nextEventId: string) {
    if (activePlanIsReadOnly()) return;
    const previous = eventEditorGroups.find((event) => event.id === previousEventId);
    const next = eventEditorGroups.find((event) => event.id === nextEventId);
    const previousWindow = previous ? eventWindow(previous.phases) : null;
    const nextWindow = next ? eventWindow(next.phases) : null;
    const choices = eventStartOptionsBetween(previousWindow?.start ?? null, previousWindow?.end ?? null);
    if (!previous || !next || !previousWindow || !nextWindow || !choices.length) {
      setNotice("THIS EVENT NEEDS AT LEAST 10 MINUTES OF ITS OWN TIME BEFORE A NEW EVENT CAN SPLIT IT");
      return;
    }
    const id = `local-event-${Date.now()}`;
    const phase: LessonPhase = {
      id,
      time: "TBD",
      eventId: id,
      eventLabel: "New event",
      pendingEventEnd: nextWindow.start,
      title: "New event",
      mode: "TEXT",
      isRequired: false,
      zones: [],
      parkedZones: [],
      text: [],
    };
    setLessonPhases((phases) => {
      const lastPreviousIndex = phases.reduce((last, candidate, index) => (
        (candidate.eventId ?? candidate.id) === previousEventId ? index : last
      ), -1);
      return lastPreviousIndex < 0
        ? phases
        : [...phases.slice(0, lastPreviousIndex + 1), phase, ...phases.slice(lastPreviousIndex + 1)];
    });
    setActivePhaseId(id);
    setNotice(`NEW EVENT INSERTED · CHOOSE A START BETWEEN ${formatLessonTimePickerValue(previousWindow.start)} AND ${formatLessonTimePickerValue(previousWindow.end)} · ITS END STAYS ${formatLessonTimePickerValue(nextWindow.start)}`);
  }

  function setPendingEventStart(eventId: string, value: string) {
    if (activePlanIsReadOnly()) return;
    const eventIndex = eventEditorGroups.findIndex((event) => event.id === eventId);
    const event = eventEditorGroups[eventIndex];
    const previous = eventIndex > 0 ? eventEditorGroups[eventIndex - 1] : undefined;
    const pending = event?.phases[0];
    const previousWindow = previous ? eventWindow(previous.phases) : null;
    const end = pending?.pendingEventEnd ?? null;
    const start = normalizePickerTime(value);
    const options = eventStartOptionsBetween(previousWindow?.start ?? null, previousWindow?.end ?? null);
    if (!event || !previous || !pending || !start || !end || !options.includes(start)) {
      setNotice("CHOOSE A START INSIDE THE PRECEDING EVENT'S TIME WINDOW");
      return;
    }
    const previousLastId = previous.phases.at(-1)?.id;
    setLessonPhases((phases) => phases.map((phase) => {
      if (phase.id === pending.id) {
        return { ...phase, pendingEventEnd: undefined, time: formatLessonTimeRange({ start, end }) };
      }
      if (phase.id === previousLastId) {
        const range = parseLessonTimeRange(phase.time);
        return range && range.start < start ? { ...phase, time: formatLessonTimeRange({ start: range.start, end: start }) } : phase;
      }
      return phase;
    }));
    setNotice("NEW EVENT TIME SET · THE PRECEDING EVENT NOW ENDS AT ITS START");
  }

  function searchOpenStationsForEvent(eventId: string) {
    if (activePlanIsReadOnly() || !safeScheduleBundle || !safeScheduleDay || safeScheduleDay.status !== "ready" || !linkedSafeScheduleGroup) {
      setNotice("IMPORT THE FULL SCHEDULE, SELECT A LOCAL CLASS, AND LINK ITS EXACT GROUP BEFORE SEARCHING OPEN STATIONS");
      return;
    }
    const event = eventEditorGroups.find((candidate) => candidate.id === eventId);
    if (!eventWindow(event?.phases ?? [])) {
      setNotice("GIVE THIS EVENT A COMPLETE, CONTINUOUS TIME WINDOW BEFORE SEARCHING OPEN STATIONS");
      return;
    }
    const opening = openStationSearchEventId !== eventId;
    setOpenStationSearchEventId(opening ? eventId : null);
    setNotice(opening
      ? "OPEN-STATION OPTIONS SHOWN · THEY ARE FREE FOR THE WHOLE EVENT WINDOW · ADVISORY ONLY"
      : "OPEN-STATION OPTIONS HIDDEN");
  }

  function addOpenStationToEvent(eventId: string, panelId: string) {
    if (activePlanIsReadOnly() || !safeScheduleDay || safeScheduleDay.status !== "ready") return;
    const event = eventEditorGroups.find((candidate) => candidate.id === eventId);
    const window = event ? eventWindow(event.phases) : null;
    const startMinute = window ? pickerMinuteForSchedule(window.start) : null;
    const endMinute = window ? pickerMinuteForSchedule(window.end) : null;
    const zone = openScheduleZones.find((candidate) => candidate.id === panelId);
    if (!event || !zone || startMinute === null || endMinute === null) {
      setNotice("THE OPEN-STATION SEARCH CHANGED · SEARCH AGAIN BEFORE ADDING AN AREA");
      return;
    }
    const availability = resolveAreaAvailabilityForInterval(
      safeScheduleDay,
      { startMinute, endMinute },
      openScheduleZones.map((candidate) => candidate.id),
    );
    if (availability?.unmappedEquipment.length) {
      setNotice(`OPEN-STATION SEARCH CANNOT CONFIRM THIS EVENT · ${availability.unmappedEquipment.join(", ").toUpperCase()} IS NOT MAPPED TO A PLANNER AREA`);
      return;
    }
    if (!availability?.availablePanelIds.includes(panelId)) {
      setNotice(`${zone.alias.toUpperCase()} IS NO LONGER CONFIRMED OPEN FOR THIS EVENT · SEARCH AGAIN`);
      return;
    }
    setLessonPhases((phases) => phases.map((phase) => {
      if ((phase.eventId ?? phase.id) !== eventId) return phase;
      const existing = phase.zones.find((candidate) => candidate.id === panelId);
      return {
        ...phase,
        zones: existing
          ? phase.zones.map((candidate) => candidate.id === panelId ? { ...candidate, openStation: true } : candidate)
          : [...phase.zones, copyZone({ ...zone, cards: [], openStation: true })],
        parkedZones: (phase.parkedZones ?? []).filter((candidate) => candidate.id !== panelId),
      };
    }));
    setOpenStationSearchEventId(null);
    setNotice(`${zone.alias.toUpperCase()} ADDED TO EVERY PHASE IN THIS EVENT AS AN OPEN STATION · ADVISORY ONLY`);
  }

  function setActivePhaseFormat(nextFormat: LessonPhase["mode"]) {
    if (activePhase.mode === nextFormat) return;
    updateActivePhase((phase) => ({ ...phase, mode: nextFormat }));
    const hiddenNotice = nextFormat === "TEXT" && activePhase.zones.length
      ? " · SELECTED ZONES STAY SAVED BUT HIDE IN TEXT"
      : nextFormat === "VISUAL" && (activePhase.text.length || activePhase.textCards?.length)
        ? " · TEXT CUES STAY SAVED BUT HIDE IN VISUAL"
        : "";
    setNotice(`${nextFormat} FORMAT SET FOR THIS LOCAL PHASE${hiddenNotice}${pendingZonePlacement?.phaseId === activePhase.id ? " · UNPLACED IDEA STAYS SELECTED" : ""}`);
  }

  function existingOpenPhaseForBlock(block: SafeScheduleTimeBlock): LessonPhase | undefined {
    if (!safeScheduleBundle) return undefined;
    return lessonPhases.find((phase) => phase.scheduleProvenance?.kind === "safe-schedule-open"
      && phase.scheduleProvenance.sourceId === safeScheduleBundle.schedule.sourceId
      && phase.scheduleProvenance.scheduleId === safeScheduleBundle.schedule.scheduleId
      && phase.scheduleProvenance.bookingId === block.bookingId);
  }

  function toggleOpenAreaSelection(block: SafeScheduleTimeBlock, panelId: string) {
    if (mode !== "EDIT" || isPastActivePlan || !safeScheduleBundle) return;
    const availability = openAvailabilityByBookingId.get(block.bookingId);
    if (!availability?.availablePanelIds.includes(panelId)) return;
    const key = safeScheduleSelectionKey(safeScheduleBundle.schedule.revision, block.bookingId);
    setOpenAreaSelectionByKey((current) => {
      const selected = normalizeOpenPanelSelection(current[key] ?? [], availability.availablePanelIds);
      const nextSelected = selected.includes(panelId)
        ? selected.filter((candidate) => candidate !== panelId)
        : openPanelSelectionAllowed(selected, panelId) ? [...selected, panelId] : selected;
      return { ...current, [key]: nextSelected };
    });
  }

  function addOpenEvent(block: SafeScheduleTimeBlock) {
    if (activePlanIsReadOnly() || mode !== "EDIT" || !safeScheduleBundle || !safeScheduleDay || safeScheduleDay.status !== "ready" || !linkedSafeScheduleGroup) return;
    const existing = existingOpenPhaseForBlock(block);
    if (existing) {
      setActivePhaseId(existing.id);
      setIsEventEditorOpen(false);
      setNotice("THIS SCHEDULED OPEN EVENT IS ALREADY IN THE LESSON · OPENED THE SAVED PHASE");
      return;
    }
    const availability = resolveOpenAreaAvailability(
      safeScheduleDay,
      block,
      openScheduleZones.map((zone) => zone.id),
    );
    const key = safeScheduleSelectionKey(safeScheduleBundle.schedule.revision, block.bookingId);
    const selectedPanelIds = normalizeOpenPanelSelection(openAreaSelectionByKey[key] ?? [], availability.availablePanelIds);
    if (!selectedPanelIds.length) {
      setNotice("CHOOSE AT LEAST ONE FULL-BLOCK AVAILABLE AREA BEFORE ADDING OPEN");
      return;
    }
    const selectedZones = selectedPanelIds.flatMap((panelId) => {
      const zone = openScheduleZones.find((candidate) => candidate.id === panelId);
      return zone ? [copyZone({ ...zone, cards: [] })] : [];
    });
    if (!selectedZones.length) {
      setNotice("OPEN AREA SELECTION CHANGED · CHOOSE AN AVAILABLE AREA AGAIN");
      return;
    }
    const phaseId = `local-open-${Date.now()}`;
    const phase: LessonPhase = {
      id: phaseId,
      time: formatScheduleLessonRange(block.startMinute, block.endMinute),
      eventId: phaseId,
      eventLabel: "Open",
      title: "Open",
      mode: "VISUAL",
      isRequired: false,
      zones: selectedZones,
      parkedZones: [],
      text: [],
      scheduleProvenance: {
        kind: "safe-schedule-open",
        sourceId: safeScheduleBundle.schedule.sourceId,
        scheduleId: safeScheduleBundle.schedule.scheduleId,
        revision: safeScheduleBundle.schedule.revision,
        bookingId: block.bookingId,
        lessonDate: activeLessonPlan.date,
        scheduleGroup: linkedSafeScheduleGroup,
      },
    };
    setLessonPhases((phases) => {
      const insertAt = phases.findIndex((candidate) => {
        const range = parseLessonTimeRange(candidate.time);
        if (!range) return false;
        const [hour, minute] = range.start.split(":").map(Number);
        return (hour * 60) + minute > block.startMinute;
      });
      return insertAt < 0
        ? [...phases, phase]
        : [...phases.slice(0, insertAt), phase, ...phases.slice(insertAt)];
    });
    setActivePhaseId(phaseId);
    setOpenAreaSelectionByKey((current) => ({ ...current, [key]: [] }));
    setNotice(`OPEN ADDED · ${selectedZones.map((zone) => zone.alias).join(" + ")} · ADVISORY ONLY, NOT A RESERVATION`);
  }

  function insertPhase(kind: "CONTINUE" | "TRANSITION", eventIdFromEditor?: string) {
    if (activePlanIsReadOnly()) return;
    const id = `local-phase-${Date.now()}`;
    const sameEvent = kind === "CONTINUE";
    const sourceEventId = eventIdFromEditor ?? (activePhase.eventId ?? activePhase.id);
    const sourceEventPhases = lessonPhases.filter((candidate) => (candidate.eventId ?? candidate.id) === sourceEventId);
    const sourcePhase = sourceEventPhases[0] ?? activePhase;
    if (sameEvent && !canAppendEventPhase(sourceEventPhases)) {
      setNotice("THIS EVENT NEEDS AT LEAST 10 MINUTES BEFORE IT CAN BE SPLIT INTO PHASES");
      return;
    }
    const phase: LessonPhase = {
      id,
      time: "TBD",
      eventId: sameEvent ? sourceEventId : id,
      eventLabel: sameEvent ? (sourcePhase.eventLabel ?? sourcePhase.title) : "New event",
      title: sameEvent ? "New phase in this event" : "New event phase",
      mode: "TEXT",
      isRequired: false,
      zones: [],
      parkedZones: [],
      text: [],
    };
    setLessonPhases((phases) => {
      const activeIndex = eventIdFromEditor && sameEvent
        ? phases.reduce((lastIndex, candidate, index) => (
          (candidate.eventId ?? candidate.id) === sourceEventId ? index : lastIndex
        ), -1)
        : sameEvent
          ? phases.reduce((lastIndex, candidate, index) => (
            (candidate.eventId ?? candidate.id) === sourceEventId ? index : lastIndex
          ), -1)
          : phases.findIndex((candidate) => candidate.id === activePhase.id);
      return activeIndex < 0
        ? [...phases, phase]
        : [...phases.slice(0, activeIndex + 1), phase, ...phases.slice(activeIndex + 1)];
    });
    setActivePhaseId(id);
    setNotice(sameEvent
      ? `NEW PHASE INSERTED IN ${eventNameForPhase(phase).toUpperCase()} · CHOOSE ITS START TIME TO SPLIT THE EVENT`
      : "NEW EVENT STARTED · SET ITS TIME, FORMAT, AND ZONES");
  }

  function deletePhaseById(phaseId: string) {
    if (activePlanIsReadOnly()) return;
    const target = lessonPhases.find((phase) => phase.id === phaseId);
    if (!target) return;
    if (target.isRequired) {
      setNotice("CORE DEMO PHASES STAY PROTECTED · ADD A LOCAL PHASE TO TRY THE FLOW");
      return;
    }
    const phaseIndex = lessonPhases.findIndex((phase) => phase.id === phaseId);
    const eventId = target.eventId ?? target.id;
    const eventPhases = lessonPhases.filter((phase) => (phase.eventId ?? phase.id) === eventId);
    const revisedTimes = new Map(removeEventPhaseTiming(eventPhases, phaseId).map((phase) => [phase.id, phase.time]));
    const targetRange = parseLessonTimeRange(target.time);
    const restoredBoundary = target.pendingEventEnd ?? targetRange?.end;
    const eventIndex = eventEditorGroups.findIndex((event) => event.id === eventId);
    const previousEvent = eventIndex > 0 ? eventEditorGroups[eventIndex - 1] : undefined;
    const previousLastId = eventPhases.length === 1 ? previousEvent?.phases.at(-1)?.id : undefined;
    const nextPhases = lessonPhases
      .filter((phase) => phase.id !== phaseId)
      .map((phase) => {
        if (revisedTimes.has(phase.id)) return { ...phase, time: revisedTimes.get(phase.id)! };
        if (phase.id === previousLastId && restoredBoundary) {
          const range = parseLessonTimeRange(phase.time);
          return range && range.start < restoredBoundary
            ? { ...phase, time: formatLessonTimeRange({ start: range.start, end: restoredBoundary }) }
            : phase;
        }
        return phase;
      });
    if (!nextPhases.length) return;
    const nextActive = nextPhases[Math.max(0, phaseIndex - 1)] ?? nextPhases[0];
    setLessonPhases(nextPhases);
    setActivePhaseId(nextActive.id);
    setPlacedCard(null);
    if (pendingZonePlacement?.phaseId === phaseId) setPendingZonePlacement(null);
    setNotice(eventPhases.length === 1
      ? "LOCAL EVENT DELETED · THE PRECEDING EVENT RESTORED ITS ORIGINAL END TIME"
      : "LOCAL PHASE DELETED · THE PREVIOUS PHASE RESTORED ITS EVENT END TIME");
  }

  function deleteActivePhase() {
    deletePhaseById(activePhase.id);
  }

  function toggleZonePanelForActivePhase(catalogZone: ZonePanel) {
    if (activePlanIsReadOnly()) return;
    const zoneId = catalogZone.id;

    const selectedZone = activePhase.zones.find((zone) => zone.id === zoneId);
    if (selectedZone) {
      updateActivePhase((phase) => ({
        ...phase,
        zones: phase.zones.filter((zone) => zone.id !== zoneId),
        parkedZones: [...(phase.parkedZones ?? []).filter((zone) => zone.id !== zoneId), copyZone(selectedZone)],
      }));
      setNotice(`${catalogZone.alias} REMOVED FROM THE VISIBLE PHASE · ITS LOCAL CONTENT IS KEPT OFF-CANVAS`);
      return;
    }

    const parkedZone = activePhase.parkedZones?.find((zone) => zone.id === zoneId);
    updateActivePhase((phase) => ({
      ...phase,
      // Uploaded photo areas need a visible canvas before their per-area
      // bottom controls can be used. Keep any written plan and reveal it.
      mode: catalogZone.customBoardId && phase.mode === "TEXT" ? "MIXED" : phase.mode,
      zones: [...phase.zones, copyZone(parkedZone ?? catalogZone)],
      parkedZones: (phase.parkedZones ?? []).filter((zone) => zone.id !== zoneId),
    }));
    const madeMixed = Boolean(catalogZone.customBoardId && activePhase.mode === "TEXT");
    setNotice(parkedZone
      ? `${catalogZone.alias} RESTORED TO THIS LOCAL PHASE${madeMixed ? " · TEXT PLAN KEPT · PHOTO AREA NOW VISIBLE" : ""}`
      : `${catalogZone.alias} ADDED AS AN EMPTY LOCAL PANEL · NO DRILLS PLACED${madeMixed ? " · TEXT PLAN KEPT · PHOTO AREA NOW VISIBLE" : ""}`);
  }

  function toggleZoneForActivePhase(zoneId: string) {
    const catalogZone = availableZones.find((zone) => zone.id === zoneId);
    if (!catalogZone) return;
    toggleZonePanelForActivePhase(catalogZone);
  }

  function makeLessonSnapshot(card: LessonCard): LessonCard {
    return {
      ...copyCard(card),
      id: `${card.id}-snapshot-${Date.now()}`,
      tags: [...card.tags, "lesson snapshot"],
      lessonLocal: true,
    };
  }

  function variantPlacementCard(card: LibraryItem, variant: LibraryVariant): LessonCard {
    const variantDescription = variant.instructions[0]
      ?? card.instructions[0]
      ?? card.description;
    return {
      ...copyCard(card),
      id: `${card.id}:${variant.id}`,
      title: `${card.title} · ${variant.title}`,
      description: variantDescription,
      tags: [...new Set([...card.tags, "variant"])],
      sourceIdeaId: card.id,
      selectedVariantId: variant.id,
    };
  }

  function placeSnapshot(
    card: LessonCard,
    phaseId: string,
    destinationZoneId?: string,
    destinationAnchorId?: VisualAnchorId,
  ) {
    if (activePlanIsReadOnly()) return;
    const targetPhase = lessonPhases.find((phase) => phase.id === phaseId);
    if (!targetPhase) {
      setPendingZonePlacement(null);
      setNotice("DESTINATION PHASE IS NO LONGER AVAILABLE · NO SNAPSHOT WAS CREATED");
      return;
    }

    const targetZone = destinationZoneId
      ? targetPhase.mode !== "TEXT"
        ? targetPhase.zones.find((zone) => zone.id === destinationZoneId)
        : undefined
      : undefined;

    if (destinationZoneId && !targetZone) {
      setPendingZonePlacement(null);
      setNotice("DESTINATION ZONE CHANGED · NO SNAPSHOT WAS CREATED");
      return;
    }

    const targetCustomBoard = targetZone?.customBoardId
      ? currentCustomBoardById.get(targetZone.customBoardId)
      : undefined;
    const targetBuiltInLayout = targetZone && !targetCustomBoard ? gymPanelLayout(targetZone.id) : null;
    const targetBuiltInSpots = targetZone && targetBuiltInLayout
      ? effectiveBuiltInStationSpots(targetZone, targetBuiltInLayout)
      : undefined;
    const compatibleAnchors = targetZone
      ? compatibleVisualAnchors(targetZone, visualAnchorByCardId, targetCustomBoard, targetBuiltInSpots)
      : [];
    const selectedAnchor = destinationAnchorId ?? compatibleAnchors[0];
    if (targetZone && (!selectedAnchor || !compatibleAnchors.includes(selectedAnchor))) {
      setNotice("THAT VISUAL SPOT IS NO LONGER AVAILABLE · NO SNAPSHOT WAS CREATED");
      return;
    }

    const snapshot = makeLessonSnapshot(card);
    const selectedCustomSpot = targetCustomBoard?.spots.find((candidate) => candidate.id === selectedAnchor);
    const selectedBuiltInSpot = targetBuiltInSpots?.find((candidate) => candidate.id === selectedAnchor);
    const initialCustomLabelLayout = targetZone && targetCustomBoard && selectedCustomSpot
      ? automaticCustomLabelLayout(targetCustomBoard, targetZone, snapshot, selectedCustomSpot)
      : undefined;
    // A new or moved supplied-board spot has no verified interior safe region.
    // Start its label in a collision-checked callout lane instead of laying
    // text over the owner-supplied image.
    const initialBuiltInLabelLayout = targetZone
      && targetBuiltInLayout
      && targetBuiltInSpots
      && selectedBuiltInSpot
      && builtInSpotHasCoordinateOverride(targetZone.id, selectedBuiltInSpot)
      ? automaticBuiltInLabelLayout(targetZone, targetBuiltInLayout, targetBuiltInSpots, snapshot, selectedBuiltInSpot)
      : undefined;
    if (targetZone && targetCustomBoard && selectedCustomSpot && !initialCustomLabelLayout) {
      setNotice("NO CLEAR LABEL POSITION IS AVAILABLE · MOVE AN EXISTING LABEL OR ADD ANOTHER STATION SPOT FIRST");
      return;
    }
    if (targetZone && targetBuiltInLayout && selectedBuiltInSpot
      && builtInSpotHasCoordinateOverride(targetZone.id, selectedBuiltInSpot)
      && !initialBuiltInLabelLayout) {
      setNotice("NO CLEAR CALLOUT LANE IS AVAILABLE · MOVE ANOTHER LABEL OR ADD A DIFFERENT STATION SPOT FIRST");
      return;
    }
    setLessonPhases((phases) => phases.map((phase) => {
      if (phase.id !== phaseId) return phase;
      if (targetZone) {
        return {
          ...phase,
          zones: phase.zones.map((zone) => (
            zone.id === targetZone.id ? { ...zone, cards: [...zone.cards, snapshot] } : zone
          )),
        };
      }
      return { ...phase, textCards: [...(phase.textCards ?? []), snapshot] };
    }));
    if (targetZone && selectedAnchor) {
      setVisualAnchorByCardId((current) => ({ ...current, [snapshot.id]: selectedAnchor }));
      const initialLabelLayout = initialCustomLabelLayout ?? initialBuiltInLabelLayout;
      if (initialLabelLayout) {
        setVisualLabelLayoutByCardId((current) => ({
          ...current,
          [snapshot.id]: initialLabelLayout,
        }));
      }
    }
    setPendingZonePlacement(null);
    setPlacedCard(card.title);
    setRecentIdeaIds((ids) => [card.id, ...ids.filter((id) => id !== card.id)].slice(0, 80));
    setNotice(`${card.title.toUpperCase()} ADDED TO ${targetZone ? targetZone.alias : "TEXT LANE"} AS A LOCAL SNAPSHOT`);
  }

  function addToLesson(card: LessonCard) {
    if (mode !== "EDIT") return;
    // Placement mode deliberately shows only its empty anchors. Leaving a
    // spot/label editor open here would stack two competing sets of markers.
    setBoardToolById({});
    setSelectedCustomSpotByBoardId({});
    setSelectedCustomLabelByBoardId({});
    setSelectedBuiltInSpotByZoneId({});
    setSelectedBuiltInLabelByZoneId({});
    setPendingZonePlacement({ card: copyCard(card), phaseId: activePhase.id, kind: "idea" });
    setPlacedCard(null);
    setNotice(`PLACE ${card.title.toUpperCase()} · TAP A HIGHLIGHTED STATION OR THE TEXT PLAN · NO SNAPSHOT EXISTS YET`);
  }

  function placeVisualLabel() {
    if (mode !== "EDIT" || activePhase.mode === "TEXT") return;
    const title = visualLabelDraft.trim();
    if (!title) {
      setNotice("TYPE A SHORT VISUAL LABEL BEFORE CHOOSING ITS STATION SPOT");
      return;
    }
    // See addToLesson: one clear anchor layer at a time keeps placement
    // understandable on the small iPad board.
    setBoardToolById({});
    setSelectedCustomSpotByBoardId({});
    setSelectedCustomLabelByBoardId({});
    setSelectedBuiltInSpotByZoneId({});
    setSelectedBuiltInLabelByZoneId({});
    setPendingZonePlacement({
      phaseId: activePhase.id,
      kind: "visual-label",
      card: {
        id: `visual-label-${Date.now()}`,
        kind: "REFERENCE",
        title,
        description: "Short visual label for this station. Tap it after placement to add details or connect a media reference.",
        tags: ["visual label", "lesson local"],
        accent: "yellow",
      },
    });
    setVisualLabelDraft("");
    setPlacedCard(null);
    setNotice(`PLACE “${title.toUpperCase()}” · TAP A HIGHLIGHTED EMPTY ANCHOR · NO SNAPSHOT EXISTS YET`);
  }

  function placePendingSnapshot(zoneId: string, anchorId: VisualAnchorId) {
    if (!pendingZonePlacement || mode !== "EDIT") return;
    placeSnapshot(pendingZonePlacement.card, pendingZonePlacement.phaseId, zoneId, anchorId);
  }

  function cancelPendingSnapshot() {
    if (!pendingZonePlacement) return;
    setPendingZonePlacement(null);
    setNotice("DESTINATION SELECTION CANCELED · NO SNAPSHOT WAS CREATED");
  }

  function setLessonMode(nextMode: "EDIT" | "VIEW") {
    if (nextMode === "EDIT" && activePlanIsReadOnly()) return;
    if (nextMode === "VIEW" && pendingZonePlacement) {
      setPendingZonePlacement(null);
      setNotice("VIEW MODE ON · UNPLACED SNAPSHOT CANCELED");
    }
    if (nextMode === "VIEW") {
      setOpenAreaSelectionByKey({});
      setIsEventEditorOpen(false);
      setIsAddingIdea(false);
      setEditingLibraryItem(null);
      setLibraryEditDraft(null);
      setEditingIdeaMediaFile(null);
      setRemoveEditingIdeaMedia(false);
      setRemoveCandidate(null);
      setIsClassManagerOpen(false);
      setRemoveClassCandidate(null);
      setIsAddingCustomBoard(false);
      setReplacingCustomBoardId(null);
      setReplacementCustomBoardFile(null);
      setBoardToolById({});
      setSelectedCustomSpotByBoardId({});
      setSelectedCustomLabelByBoardId({});
      setSelectedBuiltInSpotByZoneId({});
      setSelectedBuiltInLabelByZoneId({});
      customBoardDragRef.current = null;
      customBoardDragConflictRef.current = false;
      builtInBoardDragRef.current = null;
      builtInBoardDragConflictRef.current = false;
    }
    lessonModeRef.current = nextMode;
    setMode(nextMode);
  }

  function customBoardTool(boardId: string): BoardTool {
    return boardToolById[boardId] ?? "none";
  }

  function setCustomBoardTool(boardId: string, nextTool: BoardTool) {
    if (mode !== "EDIT") return;
    setBoardToolById((current) => ({
      ...current,
      [boardId]: current[boardId] === nextTool ? "none" : nextTool,
    }));
    if (nextTool !== "spots") setSelectedCustomSpotByBoardId((current) => ({ ...current, [boardId]: null }));
    if (nextTool !== "labels") setSelectedCustomLabelByBoardId((current) => ({ ...current, [boardId]: null }));
  }

  function builtInBoardKey(zoneId: string): string {
    return `${BUILT_IN_BOARD_TOOL_PREFIX}${zoneId}`;
  }

  function builtInBoardTool(zoneId: string): BoardTool {
    return boardToolById[builtInBoardKey(zoneId)] ?? "none";
  }

  function setBuiltInBoardTool(zoneId: string, nextTool: BoardTool) {
    if (mode !== "EDIT") return;
    const boardId = builtInBoardKey(zoneId);
    setBoardToolById((current) => ({
      ...current,
      [boardId]: current[boardId] === nextTool ? "none" : nextTool,
    }));
    if (nextTool !== "spots") setSelectedBuiltInSpotByZoneId((current) => ({ ...current, [zoneId]: null }));
    if (nextTool !== "labels") setSelectedBuiltInLabelByZoneId((current) => ({ ...current, [zoneId]: null }));
  }

  function effectiveBuiltInStationSpots(zone: ZonePanel, layout: GymPanelLayout): EffectiveStationBoardSpot[] {
    return effectiveStationBoardSpots(
      sourceStationSpots(layout),
      stationBoardSpotOverridesFor(renderingStationBoardOverrides, zone.id),
    );
  }

  function builtInSpotHasCoordinateOverride(zoneId: string, spot: EffectiveStationBoardSpot): boolean {
    if (spot.origin === "local") return true;
    const override = stationBoardSpotOverridesFor(renderingStationBoardOverrides, zoneId).sourceSpotOverridesById[spot.id];
    return override?.x !== undefined || override?.y !== undefined;
  }

  function updateBuiltInSpot(
    zoneId: string,
    spot: EffectiveStationBoardSpot,
    patch: Partial<Pick<EffectiveStationBoardSpot, "name" | "x" | "y">>,
  ) {
    setStationBoardOverrides((current) => {
      const overrides = stationBoardSpotOverridesFor(current, zoneId);
      const next = spot.origin === "local"
        ? updateLocalStationBoardSpot(overrides, spot.id, patch)
        : updateSourceStationBoardSpot(overrides, spot.id, patch);
      return next === overrides ? current : replaceStationBoardSpotOverrides(current, zoneId, next);
    });
  }

  function resetBuiltInSourceSpot(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    spotId: string,
  ) {
    const suppliedSpot = sourceStationSpots(layout).find((spot) => spot.id === spotId);
    const revisedStationSpots = suppliedSpot
      ? stationSpots.map((spot) => (spot.id === spotId ? { ...spot, x: suppliedSpot.x, y: suppliedSpot.y } : spot))
      : stationSpots;
    const preparedLayouts = suppliedSpot
      ? preparedBuiltInLabelLayoutsForSpot(zone, layout, revisedStationSpots, spotId)
      : null;
    if (!suppliedSpot || !preparedLayouts || !canMoveBuiltInSpotTo(zone, layout, stationSpots, spotId, suppliedSpot, preparedLayouts)) {
      setNotice("THE SUPPLIED SPOT WOULD CROSS A LABEL OR CONNECTOR · MOVE THE LABEL FIRST");
      return;
    }
    savePreparedBuiltInLabelLayouts(preparedLayouts);
    setStationBoardOverrides((current) => {
      const overrides = stationBoardSpotOverridesFor(current, zone.id);
      const next = resetSourceStationBoardSpot(overrides, spotId);
      return next === overrides ? current : replaceStationBoardSpotOverrides(current, zone.id, next);
    });
    setSelectedBuiltInSpotByZoneId((current) => ({ ...current, [zone.id]: null }));
    setNotice("SUPPLIED STATION SPOT RESTORED · THE SOURCE BOARD ART WAS NEVER CHANGED");
  }

  function removeBuiltInLocalSpot(zoneId: string, spotId: string) {
    const usedByCard = lessonPhases.some((phase) => phase.zones.some((zone) => (
      zone.id === zoneId && zone.cards.some((card) => visualAnchorByCardId[card.id] === spotId)
    )));
    if (usedByCard) {
      setNotice("THAT STATION SPOT HAS A PLACED LABEL · MOVE OR REMOVE THE LESSON LABEL FIRST");
      return;
    }
    setStationBoardOverrides((current) => {
      const overrides = stationBoardSpotOverridesFor(current, zoneId);
      const next = removeLocalStationBoardSpot(overrides, spotId);
      return next === overrides ? current : replaceStationBoardSpotOverrides(current, zoneId, next);
    });
    setSelectedBuiltInSpotByZoneId((current) => ({ ...current, [zoneId]: null }));
    setNotice("LOCAL STATION SPOT REMOVED · THE SUPPLIED BOARD ART STAYS UNTOUCHED");
  }

  function builtInLabelLayoutFor(
    cardId: string,
    spot: EffectiveStationBoardSpot,
    layouts = visualLabelLayoutByCardId,
  ): VisualLabelLayout {
    const saved = layouts[cardId];
    if (!saved || saved.placement === "spot") {
      return { placement: "spot", x: spot.x, y: spot.y, route: saved?.route ?? "straight" };
    }
    return saved;
  }

  function builtInManualLabelGeometriesForZone(
    zone: ZonePanel,
    stationSpots: EffectiveStationBoardSpot[],
    layouts = visualLabelLayoutByCardId,
  ) {
    return resolveVisualAnchors(zone, visualAnchorByCardId, undefined, stationSpots).flatMap(({ id, card }) => {
      const spot = stationSpots.find((candidate) => candidate.id === id);
      if (!spot || (!layouts[card.id] && !builtInSpotHasCoordinateOverride(zone.id, spot))) return [];
      const size = customLabelSize(shortAnchorLabel(card.title));
      const layout = boundedBuiltInLabelLayout(builtInLabelLayoutFor(card.id, spot, layouts), size);
      return [customLabelGeometry(card.id, spot, layout, size.width, size.height)];
    });
  }

  function automaticBuiltInCalloutsForZone(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    layouts = visualLabelLayoutByCardId,
    ignoredCardId?: string,
  ): Record<string, StationBoardCallout> {
    if (!layout.referenceBoard) return {};
    const automatic = resolveVisualAnchors(zone, visualAnchorByCardId, undefined, stationSpots).flatMap(({ id, card }) => {
      const anchor = anchorForPanel(zone.id, id);
      const spot = stationSpots.find((candidate) => candidate.id === id);
      if (!anchor || !spot || card.id === ignoredCardId || layouts[card.id] || builtInSpotHasCoordinateOverride(zone.id, spot)) return [];
      return [{ id: `placed:${id}`, anchor, label: shortAnchorLabel(card.title) }];
    });
    return stationBoardCallouts(automatic, layout.viewport, layout.referenceBoard);
  }

  /**
   * Supplied-board anchors already use the source-aware batch solver above.
   * A coach-added or moved spot has no source safe-region contract, so it
   * begins in a short, nearest-edge callout rather than blocking the photo.
   */
  function automaticBuiltInLabelLayout(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    card: LessonCard,
    spot: EffectiveStationBoardSpot,
    layouts = visualLabelLayoutByCardId,
  ): VisualLabelLayout | null {
    const label = shortAnchorLabel(card.title);
    const size = customLabelSize(label);
    const otherManual = builtInManualLabelGeometriesForZone(zone, stationSpots, layouts)
      .filter((geometry) => geometry.id !== card.id);
    const automaticCallouts = automaticBuiltInCalloutsForZone(zone, layout, stationSpots, layouts, card.id);
    for (const proposed of suggestedBuiltInCalloutLayouts(layout, spot, label, "one-turn")) {
      const candidate = customLabelGeometry(
        card.id,
        spot,
        boundedBuiltInLabelLayout(proposed, size),
        size.width,
        size.height,
      );
      if (isBuiltInLabelLayoutClear(candidate, otherManual, automaticCallouts)) return candidate.layout;
    }
    return null;
  }

  /**
   * Old browser-local lessons may predate the saved-callout behavior. Render
   * those cards with the same safe default immediately, without mutating a
   * lesson merely because it was opened.
   */
  function resolvedBuiltInLabelLayoutsForZone(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    initialLayouts = visualLabelLayoutByCardId,
  ): Record<string, VisualLabelLayout> {
    let layouts = initialLayouts;
    const placements = resolveVisualAnchors(zone, visualAnchorByCardId, undefined, stationSpots);
    for (const { id, card } of placements) {
      const spot = stationSpots.find((candidate) => candidate.id === id);
      if (!spot || layouts[card.id] || !builtInSpotHasCoordinateOverride(zone.id, spot)) continue;
      const callout = automaticBuiltInLabelLayout(zone, layout, stationSpots, card, spot, layouts);
      if (callout) layouts = { ...layouts, [card.id]: callout };
    }
    return layouts;
  }

  function isBuiltInLabelLayoutClear(
    candidate: ReturnType<typeof customLabelGeometry>,
    otherManual: ReturnType<typeof customLabelGeometry>[],
    automaticCallouts: Record<string, StationBoardCallout>,
  ): boolean {
    if (!validateCustomLabelLayout(candidate, otherManual).isValid) return false;
    const candidatePath = visualLabelLeaderPath(candidate);
    return Object.values(automaticCallouts).every((callout) => {
      const calloutBox = stationCalloutBox(callout);
      const calloutPath = stationCalloutPathPoints(callout.path);
      if (boxesOverlap(candidate.box, calloutBox)) return false;
      if (candidatePath.length && leaderIntersectsLabelBox(candidatePath, calloutBox)) return false;
      if (calloutPath.length && leaderIntersectsLabelBox(calloutPath, candidate.box)) return false;
      return !(candidatePath.length && calloutPath.length && customBoardLeaderPathsConflict(candidatePath, calloutPath));
    });
  }

  function trySetBuiltInLabelLayout(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    cardId: string,
    nextLayout: VisualLabelLayout,
    showConflictNotice = true,
  ): boolean {
    const target = resolveVisualAnchors(zone, visualAnchorByCardId, undefined, stationSpots).find((entry) => entry.card.id === cardId);
    const spot = target ? stationSpots.find((candidate) => candidate.id === target.id) : undefined;
    if (!target || !spot) return false;
    const resolvedLayouts = resolvedBuiltInLabelLayoutsForZone(zone, layout, stationSpots);
    const size = customLabelSize(shortAnchorLabel(target.card.title));
    const layoutCandidate = nextLayout.placement === "spot"
      ? { ...nextLayout, x: spot.x, y: spot.y }
      : boundedBuiltInLabelLayout(nextLayout, size);
    if (!builtInLabelFitsCanvasWidth(layoutCandidate, size)) {
      if (showConflictNotice) setNotice("KEEP THIS LABEL WITHIN THE PLAN WIDTH · USE THE TOP OR BOTTOM CALLOUT LANE INSTEAD");
      return false;
    }
    const candidate = customLabelGeometry(cardId, spot, layoutCandidate, size.width, size.height);
    const otherManual = builtInManualLabelGeometriesForZone(zone, stationSpots, resolvedLayouts)
      .filter((geometry) => geometry.id !== cardId);
    const automaticCallouts = automaticBuiltInCalloutsForZone(zone, layout, stationSpots, resolvedLayouts, cardId);
    if (!isBuiltInLabelLayoutClear(candidate, otherManual, automaticCallouts)) {
      if (showConflictNotice) setNotice("THAT LABEL POSITION WOULD OVERLAP TEXT OR A CONNECTOR · IT STAYED AT THE LAST CLEAR SPOT");
      return false;
    }
    const resolvedAdditions = Object.entries(resolvedLayouts).filter(([resolvedCardId]) => !visualLabelLayoutByCardId[resolvedCardId]);
    setVisualLabelLayoutByCardId((current) => ({
      ...current,
      ...Object.fromEntries(resolvedAdditions),
      [cardId]: layoutCandidate,
    }));
    return true;
  }

  function addBuiltInStationSpotAtPointer(
    event: React.PointerEvent<HTMLDivElement>,
    zone: ZonePanel,
    layout: GymPanelLayout,
  ) {
    if (mode !== "EDIT" || builtInBoardTool(zone.id) !== "spots") return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const point = boardCanvasPoint(event.clientX, event.clientY, event.currentTarget);
    if (layout.referenceBoard && !isPointInsideStationBoardFrame(point, layout.referenceBoard)) {
      setNotice("TAP THE SUPPLIED AREA IMAGE TO ADD A STATION SPOT · THE BLUE GUTTER IS RESERVED FOR LABELS");
      return;
    }
    const sourceSpots = sourceStationSpots(layout);
    const existing = effectiveBuiltInStationSpots(zone, layout);
    const spot: EffectiveStationBoardSpot = {
      id: `spot-${zone.id}-${Date.now()}`,
      name: `Station ${existing.length + 1}`,
      x: point.x,
      y: point.y,
      origin: "local",
    };
    setStationBoardOverrides((current) => {
      const overrides = stationBoardSpotOverridesFor(current, zone.id);
      const next = addLocalStationBoardSpot(overrides, spot, sourceSpots);
      return next === overrides ? current : replaceStationBoardSpotOverrides(current, zone.id, next);
    });
    setSelectedBuiltInSpotByZoneId((current) => ({ ...current, [zone.id]: spot.id }));
    setNotice(`${spot.name.toUpperCase()} ADDED · DRAG IT, RENAME IT, OR PLACE A LESSON LABEL ON IT`);
  }

  function beginBuiltInSpotDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    zoneId: string,
    spotId: string,
  ) {
    if (mode !== "EDIT" || builtInBoardTool(zoneId) !== "spots") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    builtInBoardDragConflictRef.current = false;
    builtInBoardDragRef.current = { kind: "spot", zoneId, spotId, pointerId: event.pointerId };
    setSelectedBuiltInSpotByZoneId((current) => ({ ...current, [zoneId]: spotId }));
  }

  function beginBuiltInLabelDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    zone: ZonePanel,
    cardId: string,
  ) {
    if (mode !== "EDIT" || builtInBoardTool(zone.id) !== "labels") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    builtInBoardDragConflictRef.current = false;
    builtInBoardDragRef.current = { kind: "label", zoneId: zone.id, cardId, pointerId: event.pointerId };
    setSelectedBuiltInLabelByZoneId((current) => ({ ...current, [zone.id]: cardId }));
  }

  function canMoveBuiltInSpotTo(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    spotId: string,
    point: NormalizedPoint,
    layouts = visualLabelLayoutByCardId,
  ): boolean {
    const revisedStationSpots = stationSpots.map((spot) => (
      spot.id === spotId ? { ...spot, x: point.x, y: point.y } : spot
    ));
    const cardsAtSpot = resolveVisualAnchors(zone, visualAnchorByCardId, undefined, revisedStationSpots)
      .filter((entry) => entry.id === spotId)
      .map((entry) => entry.card);
    const otherManual = builtInManualLabelGeometriesForZone(zone, revisedStationSpots, layouts)
      .filter((geometry) => !cardsAtSpot.some((card) => card.id === geometry.id));
    const automaticCallouts = automaticBuiltInCalloutsForZone(
      zone,
      layout,
      revisedStationSpots,
      layouts,
      cardsAtSpot[0]?.id,
    );
    return cardsAtSpot.every((card) => {
      const size = customLabelSize(shortAnchorLabel(card.title));
      const savedLayout = layouts[card.id];
      const candidateLayout = savedLayout?.placement === "callout"
        ? boundedBuiltInLabelLayout(savedLayout, size)
        : {
          placement: "spot" as const,
          x: point.x,
          y: point.y,
          route: savedLayout?.route ?? "straight",
        };
      if (!builtInLabelFitsCanvasWidth(candidateLayout, size)) return false;
      const candidate = customLabelGeometry(card.id, point, candidateLayout, size.width, size.height);
      return isBuiltInLabelLayoutClear(candidate, otherManual, automaticCallouts);
    });
  }

  /**
   * When an existing card's supplied spot becomes local/moved, promote it to
   * a verified callout before the visual override is committed. This prevents
   * the brief on-image default that made connectors hard to read.
   */
  function preparedBuiltInLabelLayoutsForSpot(
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
    spotId: string,
  ): Record<string, VisualLabelLayout> | null {
    let layouts = resolvedBuiltInLabelLayoutsForZone(zone, layout, stationSpots);
    const spot = stationSpots.find((candidate) => candidate.id === spotId);
    if (!spot) return null;
    const cardsAtSpot = resolveVisualAnchors(zone, visualAnchorByCardId, undefined, stationSpots)
      .filter((entry) => entry.id === spotId)
      .map((entry) => entry.card);
    for (const card of cardsAtSpot) {
      if (layouts[card.id]) continue;
      const callout = automaticBuiltInLabelLayout(zone, layout, stationSpots, card, spot, layouts);
      if (!callout) return null;
      layouts = { ...layouts, [card.id]: callout };
    }
    return layouts;
  }

  function savePreparedBuiltInLabelLayouts(layouts: Record<string, VisualLabelLayout>) {
    const additions = Object.entries(layouts).filter(([cardId]) => !visualLabelLayoutByCardId[cardId]);
    if (!additions.length) return;
    setVisualLabelLayoutByCardId((current) => ({ ...current, ...Object.fromEntries(additions) }));
  }

  function moveBuiltInBoardDrag(
    event: React.PointerEvent<HTMLDivElement>,
    zone: ZonePanel,
    layout: GymPanelLayout,
    stationSpots: EffectiveStationBoardSpot[],
  ) {
    const drag = builtInBoardDragRef.current;
    if (!drag || drag.zoneId !== zone.id || drag.pointerId !== event.pointerId) return;
    const point = drag.kind === "label"
      ? boardCalloutPoint(event.clientX, event.clientY, event.currentTarget)
      : boardCanvasPoint(event.clientX, event.clientY, event.currentTarget);
    if (layout.referenceBoard && !isPointInsideStationBoardFrame(point, layout.referenceBoard) && drag.kind === "spot") return;
    if (drag.kind === "spot") {
      const spot = stationSpots.find((candidate) => candidate.id === drag.spotId);
      if (!spot) return;
      const revisedStationSpots = stationSpots.map((candidate) => (
        candidate.id === drag.spotId ? { ...candidate, x: point.x, y: point.y } : candidate
      ));
      const preparedLayouts = preparedBuiltInLabelLayoutsForSpot(zone, layout, revisedStationSpots, drag.spotId);
      if (!preparedLayouts || !canMoveBuiltInSpotTo(zone, layout, stationSpots, drag.spotId, point, preparedLayouts)) {
        builtInBoardDragConflictRef.current = true;
        return;
      }
      builtInBoardDragConflictRef.current = false;
      savePreparedBuiltInLabelLayouts(preparedLayouts);
      updateBuiltInSpot(zone.id, spot, point);
      return;
    }
    const card = zone.cards.find((candidate) => candidate.id === drag.cardId);
    if (!card) return;
    const currentLayout = visualLabelLayoutByCardId[drag.cardId];
    const accepted = trySetBuiltInLabelLayout(zone, layout, stationSpots, drag.cardId, {
      placement: "callout",
      x: point.x,
      y: point.y,
      route: currentLayout?.route ?? "one-turn",
    }, false);
    builtInBoardDragConflictRef.current = !accepted;
  }

  function endBuiltInBoardDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = builtInBoardDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    builtInBoardDragRef.current = null;
    if (builtInBoardDragConflictRef.current) {
      setNotice(drag.kind === "label"
        ? "LABEL STAYED AT THE LAST CLEAR POSITION · CONNECTORS AND TEXT CANNOT OVERLAP"
        : "STATION SPOT STAYED AT THE LAST CLEAR POSITION · ITS LABELS AND CONNECTORS CANNOT OVERLAP");
    }
    builtInBoardDragConflictRef.current = false;
  }

  function updateCustomBoard(boardId: string, updater: (board: CustomBoard) => CustomBoard) {
    setCustomBoards((boards) => boards.map((board) => board.id === boardId ? updater(board) : board));
  }

  function adjustCustomBoardPhotoScale(board: CustomBoard, direction: "smaller" | "larger") {
    if (activePlanIsReadOnly()) return;
    const currentScale = customBoardPhotoScale(board);
    const nextScale = direction === "larger"
      ? incrementCustomBoardPhotoScale(currentScale)
      : decrementCustomBoardPhotoScale(currentScale);
    if (nextScale === currentScale) return;
    updateCustomBoard(board.id, (current) => setCustomBoardPhotoScale(current, nextScale, new Date().toISOString()));
    setNotice(`${board.title.toUpperCase()} PANEL SIZE ${Math.round(nextScale * 100)}% · STATIONS AND LABELS STAY ALIGNED`);
  }

  function refreshAreaZoneMetadata(
    phases: LessonPhase[],
    boards = customBoards,
    preferences = areaCatalog,
  ): LessonPhase[] {
    const boardsById = new Map(boards.map((board) => [board.id, board]));
    const builtInZonesById = new Map(zoneCatalog.map((zone) => [zone.id, areaZoneWithOverride(zone, preferences)]));
    const refreshZone = (zone: ZonePanel) => {
      const board = zone.customBoardId ? boardsById.get(zone.customBoardId) : undefined;
      if (board) return { ...zone, title: board.title, alias: customBoardEventLabel(board) };
      const builtInZone = builtInZonesById.get(zone.id);
      return builtInZone
        ? { ...zone, title: builtInZone.title, alias: builtInZone.alias, note: builtInZone.note }
        : zone;
    };
    return phases.map((phase) => ({
      ...phase,
      zones: phase.zones.map(refreshZone),
      parkedZones: (phase.parkedZones ?? []).map(refreshZone),
    }));
  }

  function isEditingArea(target: AreaEditTarget): boolean {
    return editingArea?.kind === target.kind && editingArea.id === target.id;
  }

  function isRemovingArea(target: AreaEditTarget): boolean {
    return removingArea?.kind === target.kind && removingArea.id === target.id;
  }

  function areaTargetMatchesZone(target: AreaEditTarget, zone: ZonePanel): boolean {
    return target.kind === "custom" ? zone.customBoardId === target.id : !zone.customBoardId && zone.id === target.id;
  }

  function updateCustomBoardDetails(boardId: string, title: string, eventName: string) {
    if (activePlanIsReadOnly()) return;
    const board = currentCustomBoardById.get(boardId);
    if (!board) return;
    const timestamp = new Date().toISOString();
    const renamed = renameCustomBoard(board, title, timestamp);
    const revised = renameCustomBoardEvent(renamed, eventName, timestamp);
    if (revised === board) return;
    const revisedBoards = customBoards.map((candidate) => candidate.id === boardId ? revised : candidate);
    setCustomBoards(revisedBoards);
    setLessonPhases((phases) => refreshAreaZoneMetadata(phases, revisedBoards));
  }

  function startEditingBuiltInArea(zone: ZonePanel) {
    if (activePlanIsReadOnly()) return;
    const source = zoneCatalog.find((candidate) => candidate.id === zone.id);
    if (!source) return;
    setEditingArea({ kind: "built-in", id: source.id });
    setAreaTitleDraft(zone.title);
    setAreaAliasDraft(zone.alias);
    setAreaNoteDraft(zone.note);
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
    setRemovingArea(null);
  }

  function startEditingCustomBoard(board: CustomBoard) {
    if (activePlanIsReadOnly()) return;
    setEditingArea({ kind: "custom", id: board.id });
    setAreaTitleDraft(board.title);
    setAreaAliasDraft(board.eventName ?? "");
    setAreaNoteDraft("");
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
    setRemovingArea(null);
  }

  function cancelEditingArea() {
    setEditingArea(null);
    setAreaTitleDraft("");
    setAreaAliasDraft("");
    setAreaNoteDraft("");
  }

  function saveBuiltInAreaDetails(zone: ZonePanel) {
    if (activePlanIsReadOnly()) return;
    const source = zoneCatalog.find((candidate) => candidate.id === zone.id);
    if (!source) return;
    const revised = updateBuiltInAreaOverride(areaCatalog, source.id, {
      title: areaTitleDraft.trim() || source.title,
      alias: areaAliasDraft.trim() || source.alias,
      note: areaNoteDraft.trim() || source.note,
    }, BUILT_IN_ZONE_IDS);
    if (revised === areaCatalog) {
      cancelEditingArea();
      return;
    }
    setAreaCatalog(revised);
    setLessonPhases((phases) => refreshAreaZoneMetadata(phases, customBoards, revised));
    cancelEditingArea();
    setNotice(`${(areaAliasDraft.trim() || source.alias).toUpperCase()} EVENT DETAILS SAVED · SOURCE BOARD STAYS UNCHANGED`);
  }

  function saveCustomBoardDetails(board: CustomBoard) {
    if (activePlanIsReadOnly()) return;
    const title = areaTitleDraft.trim() || board.title;
    updateCustomBoardDetails(board.id, title, areaAliasDraft);
    cancelEditingArea();
    setNotice(`${title.toUpperCase()} EVENT DETAILS SAVED · PHOTO AREA UPDATED`);
  }

  function openCustomBoardForSpotEditing(board: CustomBoard) {
    setLessonPhases((phases) => phases.map((phase) => {
      if (phase.id !== activePhase.id) return phase;
      const isOpenOnPhase = phase.zones.some((zone) => zone.customBoardId === board.id);
      if (isOpenOnPhase && phase.mode !== "TEXT") return phase;
      const catalogZone = customZoneForBoard(board);
      const parked = phase.parkedZones?.find((zone) => zone.customBoardId === board.id);
      return {
        ...phase,
        // A text-only phase would otherwise hide the board the button just
        // opened. MIXED preserves the written plan and reveals the photo.
        mode: phase.mode === "TEXT" ? "MIXED" : phase.mode,
        zones: isOpenOnPhase ? phase.zones : [...phase.zones, copyZone(parked ?? catalogZone)],
        parkedZones: isOpenOnPhase
          ? phase.parkedZones
          : (phase.parkedZones ?? []).filter((zone) => zone.customBoardId !== board.id),
      };
    }));
    setBoardToolById((current) => ({ ...current, [board.id]: "spots" }));
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
    cancelEditingArea();
    setRemovingArea(null);
    setNotice(`${board.title.toUpperCase()} OPENED · EDIT ITS STATION SPOTS ON THIS PHASE`);
  }

  function startReplacingCustomBoardPhoto(board: CustomBoard, keepEventEditor = false) {
    if (activePlanIsReadOnly()) return;
    setReplacingCustomBoardId(board.id);
    setReplacementCustomBoardFile(null);
    if (!keepEventEditor) cancelEditingArea();
    setRemovingArea(null);
  }

  function cancelReplacingCustomBoardPhoto() {
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
  }

  async function replaceCustomBoardPhoto(board: CustomBoard) {
    const photo = replacementCustomBoardFile;
    if (!photo) {
      setNotice("CHOOSE A NEW AREA PHOTO BEFORE SAVING THE REPLACEMENT");
      return;
    }
    if (!isAllowedCustomBoardPhoto(photo)) {
      setNotice("USE A JPEG, PNG, WEBP, HEIC, OR HEIF PHOTO UNDER 35 MB");
      return;
    }
    try {
      const dimensions = await readCustomPhotoDimensions(photo);
      if (!dimensions.width || !dimensions.height) throw new Error("empty image");
      const timestamp = new Date().toISOString();
      const photoId = `photo-${board.id}-${Date.now()}`;
      await saveCustomBoardPhoto({
        id: photoId,
        blob: photo,
        filename: photo.name || board.filename,
        mimeType: photo.type || "image/*",
        width: dimensions.width,
        height: dimensions.height,
        createdAt: timestamp,
      });
      const revised = replaceCustomBoardPhotoMetadata(board, {
        photoId,
        filename: photo.name || board.filename,
        width: dimensions.width,
        height: dimensions.height,
      }, timestamp);
      setCustomBoards((boards) => boards.map((candidate) => candidate.id === board.id ? revised : candidate));
      cancelReplacingCustomBoardPhoto();
      setNotice(`${board.title.toUpperCase()} IMAGE REPLACED · PAST PLANS KEEP THEIR PRIOR PHOTO · REVIEW SAVED SPOTS AGAINST THE NEW IMAGE`);
    } catch {
      setNotice("THE NEW AREA PHOTO COULD NOT BE SAVED IN THIS BROWSER");
    }
  }

  function startRemovingArea(target: AreaEditTarget, keepEventEditor = false) {
    if (activePlanIsReadOnly()) return;
    setRemovingArea(target);
    if (!keepEventEditor) cancelEditingArea();
    setReplacingCustomBoardId(null);
    setReplacementCustomBoardFile(null);
  }

  function cancelRemovingArea() {
    setRemovingArea(null);
  }

  async function confirmRemoveArea(target: AreaEditTarget, zone: ZonePanel) {
    if (activePlanIsReadOnly()) return;
    if (!isRemovingArea(target)) return;
    if (target.kind === "custom") {
      const removedBoard = currentCustomBoardById.get(target.id);
      if (!removedBoard) return;
      const removedCardIds = new Set(lessonPhases.flatMap((phase) => [
        ...phase.zones.filter((candidate) => areaTargetMatchesZone(target, candidate)),
        ...(phase.parkedZones ?? []).filter((candidate) => areaTargetMatchesZone(target, candidate)),
      ]).flatMap((candidate) => candidate.cards.map((card) => card.id)));
      setCustomBoards((boards) => boards.filter((board) => board.id !== target.id));
      setLessonPhases((phases) => phases.map((phase) => ({
        ...phase,
        zones: phase.zones.filter((candidate) => !areaTargetMatchesZone(target, candidate)),
        parkedZones: (phase.parkedZones ?? []).filter((candidate) => !areaTargetMatchesZone(target, candidate)),
      })));
      if (removedCardIds.size) {
        setVisualAnchorByCardId((current) => Object.fromEntries(Object.entries(current).filter(([cardId]) => !removedCardIds.has(cardId))));
        setVisualLabelLayoutByCardId((current) => Object.fromEntries(Object.entries(current).filter(([cardId]) => !removedCardIds.has(cardId))));
      }
      cancelRemovingArea();
      cancelEditingArea();
      setNotice(`${zone.alias.toUpperCase()} PHOTO AREA REMOVED · ITS LIVE SPOTS AND LABELS ARE GONE · SAVED PAST PLANS STAY PROTECTED`);
      return;
    }
    const revisedCatalog = target.kind === "built-in"
      ? setBuiltInAreaHidden(areaCatalog, target.id, true, BUILT_IN_ZONE_IDS)
      : areaCatalog;
    setAreaCatalog(revisedCatalog);
    setLessonPhases((phases) => phases.map((phase) => {
      const removedZones = phase.zones.filter((candidate) => areaTargetMatchesZone(target, candidate));
      if (!removedZones.length) return phase;
      const existingParked = (phase.parkedZones ?? []).filter((candidate) => !areaTargetMatchesZone(target, candidate));
      return {
        ...phase,
        zones: phase.zones.filter((candidate) => !areaTargetMatchesZone(target, candidate)),
        parkedZones: [...existingParked, ...removedZones.map(copyZone)],
      };
    }));
    cancelRemovingArea();
    setNotice(`${zone.alias.toUpperCase()} REMOVED FROM CURRENT/FUTURE STATION CHOICES · RESTORE IT ANYTIME · SOURCE ART IS INTACT`);
  }

  function restoreArea(target: AreaEditTarget, zone: ZonePanel) {
    if (activePlanIsReadOnly()) return;
    const revisedCatalog = target.kind === "built-in"
      ? setBuiltInAreaHidden(areaCatalog, target.id, false, BUILT_IN_ZONE_IDS)
      : setCustomBoardHidden(areaCatalog, target.id, false);
    setAreaCatalog(revisedCatalog);
    setNotice(`${zone.alias.toUpperCase()} RESTORED TO STATION CHOICES · ADD IT TO A PHASE WHEN YOU NEED IT`);
  }

  async function saveNewCustomBoard() {
    if (mode !== "EDIT") return;
    const originPlanId = activeLessonPlanIdRef.current;
    const title = newCustomBoardTitle.trim();
    const photo = newCustomBoardFile;
    if (!title) {
      setNotice("NAME THE PHOTO AREA BEFORE SAVING IT");
      return;
    }
    if (!photo) {
      setNotice("CHOOSE A PHOTO FOR THIS AREA BEFORE SAVING IT");
      return;
    }
    if (!isAllowedCustomBoardPhoto(photo)) {
      setNotice("USE A JPEG, PNG, WEBP, HEIC, OR HEIF PHOTO UNDER 35 MB");
      return;
    }
    try {
      const dimensions = await readCustomPhotoDimensions(photo);
      if (!dimensions.width || !dimensions.height) throw new Error("empty image");
      const timestamp = new Date().toISOString();
      const id = `custom-board-${Date.now()}`;
      const photoId = `photo-${id}`;
      const board: CustomBoard = {
        id,
        title,
        eventName: newCustomBoardEventName.trim() || undefined,
        photoId,
        filename: photo.name || "area-photo",
        width: dimensions.width,
        height: dimensions.height,
        spots: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await saveCustomBoardPhoto({
        id: photoId,
        blob: photo,
        filename: board.filename,
        mimeType: photo.type || "image/*",
        width: dimensions.width,
        height: dimensions.height,
        createdAt: timestamp,
      });
      setCustomBoards((boards) => [...boards, board]);
      if (activeLessonPlanIdRef.current !== originPlanId || lessonModeRef.current !== "EDIT") {
        setNotice(`${title.toUpperCase()} PHOTO AREA SAVED LOCALLY · OPEN IT FROM AN EDITABLE PLAN WHEN READY`);
        return;
      }
      toggleZonePanelForActivePhase(customZoneForBoard(board));
      setBoardToolById((current) => ({ ...current, [board.id]: "spots" }));
      setNewCustomBoardTitle("");
      setNewCustomBoardEventName("");
      setNewCustomBoardFile(null);
      setIsAddingCustomBoard(false);
      setNotice(`${title.toUpperCase()} PHOTO AREA ADDED · TAP THE PHOTO TO ADD STATION SPOTS`);
    } catch {
      setNotice("THE PHOTO AREA COULD NOT BE SAVED IN THIS BROWSER");
    }
  }

  function addCustomStationSpotAtPointer(event: React.PointerEvent<HTMLDivElement>, board: CustomBoard) {
    if (mode !== "EDIT" || customBoardTool(board.id) !== "spots") return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const point = customBoardPhotoPoint(event.clientX, event.clientY, event.currentTarget);
    if (!isInsideCustomPhoto(point)) {
      setNotice("TAP THE PHOTO ITSELF TO ADD A STATION SPOT · THE BLUE GUTTER IS FOR LABELS");
      return;
    }
    const spot: CustomStationSpot = {
      id: `spot-${board.id}-${Date.now()}`,
      name: `Station ${board.spots.length + 1}`,
      x: point.x,
      y: point.y,
    };
    updateCustomBoard(board.id, (current) => addCustomStationSpot(current, spot, new Date().toISOString()));
    setSelectedCustomSpotByBoardId((current) => ({ ...current, [board.id]: spot.id }));
    setNotice(`${spot.name.toUpperCase()} ADDED · DRAG IT, RENAME IT, OR PLACE A LESSON LABEL ON IT`);
  }

  function beginCustomSpotDrag(event: React.PointerEvent<HTMLButtonElement>, boardId: string, spotId: string) {
    if (mode !== "EDIT" || customBoardTool(boardId) !== "spots") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    customBoardDragConflictRef.current = false;
    customBoardDragRef.current = { kind: "spot", boardId, spotId, pointerId: event.pointerId };
    setSelectedCustomSpotByBoardId((current) => ({ ...current, [boardId]: spotId }));
  }

  function customLabelLayoutFor(
    cardId: string,
    spot: CustomStationSpot,
    layouts = visualLabelLayoutByCardId,
  ): VisualLabelLayout {
    const saved = layouts[cardId];
    if (!saved || saved.placement === "spot") {
      return { placement: "spot", x: spot.x, y: spot.y, route: saved?.route ?? "straight" };
    }
    return saved;
  }

  function customLabelGeometriesForZone(
    board: CustomBoard,
    zone: ZonePanel,
    layouts = visualLabelLayoutByCardId,
  ) {
    return resolveVisualAnchors(zone, visualAnchorByCardId, board).flatMap(({ id, card }) => {
      const spot = board.spots.find((candidate) => candidate.id === id);
      if (!spot) return [];
      const size = customLabelSize(shortAnchorLabel(card.title));
      const layout = customLabelLayoutFor(card.id, spot, layouts);
      return [customLabelGeometry(card.id, spot, boundedCustomLabelLayout(layout, size), size.width, size.height)];
    });
  }

  function automaticCustomLabelLayout(
    board: CustomBoard,
    zone: ZonePanel,
    card: LessonCard,
    spot: CustomStationSpot,
  ): VisualLabelLayout | null {
    const label = shortAnchorLabel(card.title);
    const size = customLabelSize(label);
    const others = customLabelGeometriesForZone(board, zone);
    const candidates: VisualLabelLayout[] = [
      { placement: "spot", x: spot.x, y: spot.y, route: "straight" },
      ...[0, -0.14, 0.14, -0.28, 0.28, -0.42, 0.42].flatMap((offset) => [
        { placement: "callout" as const, x: 1.03, y: spot.y + offset, route: "one-turn" as const },
        { placement: "callout" as const, x: -0.03, y: spot.y + offset, route: "one-turn" as const },
        { placement: "callout" as const, x: spot.x + offset, y: 1.03, route: "one-turn" as const },
        { placement: "callout" as const, x: spot.x + offset, y: -0.03, route: "one-turn" as const },
      ]),
    ];
    for (const proposed of candidates) {
      const layout = proposed.placement === "spot"
        ? { ...proposed, x: spot.x, y: spot.y }
        : boundedCustomLabelLayout(proposed, size);
      const candidate = customLabelGeometry(card.id, spot, layout, size.width, size.height);
      if (validateCustomLabelLayout(candidate, others).isValid) return layout;
    }
    return null;
  }

  function trySetCustomLabelLayout(
    board: CustomBoard,
    zone: ZonePanel,
    cardId: string,
    nextLayout: VisualLabelLayout,
    showConflictNotice = true,
  ): boolean {
    const target = resolveVisualAnchors(zone, visualAnchorByCardId, board).find((entry) => entry.card.id === cardId);
    const spot = target ? board.spots.find((candidate) => candidate.id === target.id) : undefined;
    if (!target || !spot) return false;
    const size = customLabelSize(shortAnchorLabel(target.card.title));
    const layout = nextLayout.placement === "spot"
      ? { ...nextLayout, x: spot.x, y: spot.y }
      : boundedCustomLabelLayout(nextLayout, size);
    const candidate = customLabelGeometry(cardId, spot, layout, size.width, size.height);
    const others = customLabelGeometriesForZone(board, zone).filter((geometry) => geometry.id !== cardId);
    const validation = validateCustomLabelLayout(candidate, others);
    if (!validation.isValid) {
      if (showConflictNotice) setNotice("THAT LABEL POSITION WOULD OVERLAP TEXT OR A CONNECTOR · IT STAYED AT THE LAST CLEAR SPOT");
      return false;
    }
    setVisualLabelLayoutByCardId((current) => ({ ...current, [cardId]: layout }));
    return true;
  }

  function beginCustomLabelDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    board: CustomBoard,
    zone: ZonePanel,
    cardId: string,
  ) {
    if (mode !== "EDIT" || customBoardTool(board.id) !== "labels") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    customBoardDragConflictRef.current = false;
    customBoardDragRef.current = { kind: "label", boardId: board.id, zoneId: zone.id, cardId, pointerId: event.pointerId };
    setSelectedCustomLabelByBoardId((current) => ({ ...current, [board.id]: cardId }));
  }

  function moveCustomBoardDrag(event: React.PointerEvent<HTMLDivElement>, board: CustomBoard, zone: ZonePanel) {
    if (mode !== "EDIT" || activePlanIsReadOnly()) return;
    const drag = customBoardDragRef.current;
    if (!drag || drag.boardId !== board.id || drag.pointerId !== event.pointerId) return;
    const point = customBoardPhotoPoint(event.clientX, event.clientY, event.currentTarget);
    if (drag.kind === "spot") {
      if (!isInsideCustomPhoto(point)) return;
      const revisedBoard = updateCustomStationSpot(board, drag.spotId, { x: point.x, y: point.y });
      const geometries = customLabelGeometriesForZone(revisedBoard, zone);
      const canMove = geometries.every((geometry) => (
        validateCustomLabelLayout(geometry, geometries.filter((other) => other.id !== geometry.id)).isValid
      ));
      if (!canMove) {
        customBoardDragConflictRef.current = true;
        return;
      }
      customBoardDragConflictRef.current = false;
      updateCustomBoard(board.id, (current) => updateCustomStationSpot(
        current,
        drag.spotId,
        { x: point.x, y: point.y },
        new Date().toISOString(),
      ));
      return;
    }
    if (drag.zoneId !== zone.id) return;
    const card = zone.cards.find((candidate) => candidate.id === drag.cardId);
    if (!card) return;
    const currentLayout = visualLabelLayoutByCardId[drag.cardId];
    const candidate: VisualLabelLayout = {
      placement: "callout",
      x: point.x,
      y: point.y,
      route: currentLayout?.route ?? "one-turn",
    };
    const accepted = trySetCustomLabelLayout(board, zone, drag.cardId, candidate, false);
    customBoardDragConflictRef.current = !accepted;
  }

  function endCustomBoardDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = customBoardDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    customBoardDragRef.current = null;
    if (customBoardDragConflictRef.current) {
      setNotice(drag.kind === "label"
        ? "LABEL STAYED AT THE LAST CLEAR POSITION · CONNECTORS AND TEXT CANNOT OVERLAP"
        : "STATION SPOT STAYED AT THE LAST CLEAR POSITION · ITS LABELS AND CONNECTORS CANNOT OVERLAP");
    }
    customBoardDragConflictRef.current = false;
  }

  function removeCustomStationSpotFromBoard(board: CustomBoard, spotId: string) {
    const usedByCard = lessonPhases.some((phase) => phase.zones.some((zone) => (
      zone.customBoardId === board.id && zone.cards.some((card) => visualAnchorByCardId[card.id] === spotId)
    )));
    if (usedByCard) {
      setNotice("THAT STATION SPOT HAS A PLACED LABEL · MOVE OR REMOVE THE LESSON LABEL FIRST");
      return;
    }
    updateCustomBoard(board.id, (current) => removeCustomStationSpot(current, spotId, new Date().toISOString()));
    setSelectedCustomSpotByBoardId((current) => ({ ...current, [board.id]: null }));
    setNotice("CUSTOM STATION SPOT REMOVED · THE PHOTO AREA STAYS SAVED");
  }

  function removeSnapshot(cardId: string) {
    if (activePlanIsReadOnly()) return;
    updateActivePhase((phase) => ({
      ...phase,
      textCards: (phase.textCards ?? []).filter((card) => card.id !== cardId),
      zones: phase.zones.map((zone) => ({ ...zone, cards: zone.cards.filter((card) => card.id !== cardId) })),
    }));
    setVisualAnchorByCardId((current) => {
      const { [cardId]: _removedAnchor, ...remaining } = current;
      return remaining;
    });
    setVisualLabelLayoutByCardId((current) => {
      const { [cardId]: _removedLayout, ...remaining } = current;
      return remaining;
    });
    if (detailCard?.id === cardId) setDetailCard(null);
    setPlacedCard(null);
    setNotice("LOCAL SNAPSHOT REMOVED FROM THIS LESSON");
  }

  function addTextNote() {
    updateActivePhase((phase) => ({ ...phase, note: phase.note ?? "" }));
    setNotice("LOCAL TEXT NOTE ADDED · EDIT IT BELOW");
  }

  function updateTextNote(note: string) {
    updateActivePhase((phase) => ({ ...phase, note }));
  }

  function addTextPlanItem() {
    updateActivePhase((phase) => ({ ...phase, text: [...phase.text, "New plan item"] }));
    setNotice("TEXT PLAN ITEM ADDED · TYPE THE COACHING CUE OR ACTIVITY");
  }

  function addSafetyCue() {
    const cue = "Safety: confirm mats, spotting coverage, and lane clearance before starting.";
    updateActivePhase((phase) => ({
      ...phase,
      text: phase.text.includes(cue) ? phase.text : [...phase.text, cue],
    }));
    setNotice("SAFETY CUE ADDED TO THIS LOCAL PHASE");
  }

  function togglePhaseTimer() {
    if (timerSeconds === 0) setTimerSeconds(30 * 60);
    setIsTimerRunning((running) => !running);
  }

  function resetPhaseTimer() {
    setIsTimerRunning(false);
    setTimerSeconds(30 * 60);
    setNotice("PHASE TIMER RESET TO 30:00");
  }

  function scrollToPlannerSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openLibraryWindow() {
    const libraryUrl = new URL(window.location.href);
    libraryUrl.search = "";
    libraryUrl.searchParams.set("library", "1");
    libraryUrl.hash = "";
    const libraryWindow = window.open(libraryUrl.toString(), "lesson-planner-idea-library");
    if (libraryWindow) libraryWindow.focus();
    else window.location.assign(libraryUrl);
  }

  function returnToPlanner() {
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }
    const plannerUrl = new URL(window.location.href);
    plannerUrl.searchParams.delete("library");
    window.location.assign(plannerUrl);
  }

  function updateTextPlanItem(index: number, value: string) {
    updateActivePhase((phase) => ({
      ...phase,
      text: phase.text.map((item, itemIndex) => itemIndex === index ? value : item),
    }));
  }

  function removeTextPlanItem(index: number) {
    updateActivePhase((phase) => ({ ...phase, text: phase.text.filter((_, itemIndex) => itemIndex !== index) }));
    setNotice("TEXT PLAN ITEM REMOVED · THE REST OF THIS PHASE IS UNCHANGED");
  }

  function removeTextNote() {
    updateActivePhase(({ note: _note, ...phase }) => phase);
    setNotice("LOCAL TEXT NOTE REMOVED FROM THIS PHASE");
  }

  function toggleReady() {
    if (activePlanIsReadOnly()) return;
    const nextReady = !isReady;
    setIsReady(nextReady);
    setNotice(nextReady
      ? "READY DEMO FLAG SET · LOCAL BROWSER ONLY · NO MEDIA DOWNLOAD"
      : "RETURNED TO LOCAL DRAFT · NO SHARED VERSION EXISTS");
  }

  function toggleGem(cardId: string) {
    const card = allLibraryItems.find((item) => item.id === cardId);
    const willBeGem = !gemIds.includes(cardId);
    setGemIds((ids) => willBeGem ? [...ids, cardId] : ids.filter((id) => id !== cardId));
    setNotice(`${card?.title.toUpperCase() ?? "CARD"} ${willBeGem ? "SAVED AS A GEM" : "REMOVED FROM GEMS"} · THIS BROWSER ONLY`);
  }

  function toggleArchive(card: LibraryItem) {
    const isDefaultArchived = Boolean(card.defaultArchived);
    const isCurrentlyArchived = archivedIdeaIds.includes(card.id)
      || (isDefaultArchived && !restoredIdeaIds.includes(card.id));
    if (isCurrentlyArchived) {
      setArchivedIdeaIds((ids) => ids.filter((id) => id !== card.id));
      if (isDefaultArchived) setRestoredIdeaIds((ids) => [...new Set([...ids, card.id])]);
      setNotice(`${card.title.toUpperCase()} RESTORED TO ALL IDEAS · THIS BROWSER ONLY`);
      return;
    }
    setRestoredIdeaIds((ids) => ids.filter((id) => id !== card.id));
    setArchivedIdeaIds((ids) => [...new Set([...ids, card.id])]);
    setNotice(`${card.title.toUpperCase()} MOVED TO ARCHIVE · NOTHING WAS DELETED`);
  }

  function startLibraryEdit(card: LibraryItem) {
    setDetailCard(null);
    setRemoveCandidate(null);
    setEditingLibraryItem(copyLibraryItem(card));
    setLibraryEditDraft(libraryEditDraftFor(card));
    setEditingIdeaMediaFile(null);
    setRemoveEditingIdeaMedia(false);
  }

  function closeLibraryEdit() {
    if (isSavingLibraryEdit) return;
    setEditingLibraryItem(null);
    setLibraryEditDraft(null);
    setEditingIdeaMediaFile(null);
    setRemoveEditingIdeaMedia(false);
    if (editIdeaCameraInputRef.current) editIdeaCameraInputRef.current.value = "";
    if (editIdeaMediaInputRef.current) editIdeaMediaInputRef.current.value = "";
  }

  function updateLibraryEditDraft<Key extends keyof LibraryEditDraft>(key: Key, value: LibraryEditDraft[Key]) {
    setLibraryEditDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function chooseLibraryIdeaMedia(file: File | null, target: "new" | "edit") {
    if (!file) return;
    const validationMessage = ideaMediaValidationMessage(file);
    if (validationMessage) {
      setNotice(validationMessage);
      return;
    }
    if (target === "new") {
      setNewIdeaMediaFile(file);
      return;
    }
    setEditingIdeaMediaFile(file);
    setRemoveEditingIdeaMedia(false);
  }

  async function storeLibraryIdeaMedia(ideaId: string, file: File): Promise<LibraryMediaMetadata> {
    const metadata = await libraryMediaMetadataForFile(file);
    const mediaId = createIdeaMediaId(ideaId);
    await saveIdeaMedia({
      id: mediaId,
      ideaId,
      blob: file,
      filename: metadata.mediaFilename ?? file.name,
      mimeType: metadata.mediaMimeType ?? file.type,
      kind: metadata.mediaKind,
      width: metadata.mediaWidth,
      height: metadata.mediaHeight,
      durationSeconds: metadata.mediaDurationSeconds,
      createdAt: new Date().toISOString(),
    });
    return { ...metadata, mediaId };
  }

  async function saveLibraryEdit() {
    if (!editingLibraryItem || !libraryEditDraft || isSavingLibraryEdit) return;
    const title = libraryEditDraft.title.trim();
    if (!title) {
      setNotice("IDEA NAME IS REQUIRED · NOTHING WAS CHANGED");
      return;
    }
    setIsSavingLibraryEdit(true);
    let newMediaId: string | null = null;
    try {
      const currentMedia = normalizedLibraryMedia(editingLibraryItem);
      let nextMedia = removeEditingIdeaMedia ? {} : currentMedia;
      if (editingIdeaMediaFile) {
        nextMedia = await storeLibraryIdeaMedia(editingLibraryItem.id, editingIdeaMediaFile);
        newMediaId = nextMedia.mediaId ?? null;
      }
      const oldMediaId = replacedLibraryMediaId(currentMedia.mediaId, nextMedia.mediaId);
      if (oldMediaId) await removeIdeaMedia(oldMediaId);
      const edited: LibraryItem = {
        ...withoutLibraryMedia(editingLibraryItem),
        ...nextMedia,
        title,
        kind: libraryEditDraft.kind,
        description: libraryEditDraft.description.trim() || "Add the rules, coaching notes, or reference details when you are ready.",
        safety: libraryEditDraft.safety.trim() || undefined,
        mats: parseEditableList(libraryEditDraft.mats),
        tags: parseEditableList(libraryEditDraft.tags),
        events: parseEditableList(libraryEditDraft.events),
        skills: parseEditableList(libraryEditDraft.skills),
        goals: parseEditableList(libraryEditDraft.goals),
        instructions: parseEditableList(libraryEditDraft.instructions),
        coachingCues: parseEditableList(libraryEditDraft.coachingCues),
      };
      if (customLibraryCards.some((card) => card.id === edited.id)) {
        setCustomLibraryCards((cards) => cards.map((card) => card.id === edited.id ? edited : card));
      } else {
        setItemOverridesById((current) => ({ ...current, [edited.id]: edited }));
      }
      setEditingLibraryItem(null);
      setLibraryEditDraft(null);
      setEditingIdeaMediaFile(null);
      setRemoveEditingIdeaMedia(false);
      setNotice(`${edited.title.toUpperCase()} SAVED${edited.mediaId ? ` WITH A LOCAL ${edited.mediaKind === "video" ? "VIDEO" : "PHOTO"}` : ""} · THIS BROWSER'S LIBRARY COPY WAS UPDATED`);
    } catch {
      if (newMediaId) {
        try {
          await removeIdeaMedia(newMediaId);
        } catch {
          // The inaccessible new record is not linked from the saved idea.
        }
      }
      setNotice("THE IDEA OR ITS ATTACHMENT COULD NOT BE SAVED · YOUR EXISTING IDEA WAS LEFT OPEN");
    } finally {
      setIsSavingLibraryEdit(false);
    }
  }

  function requestLibraryRemoval(card: LibraryItem) {
    setDetailCard(null);
    setRemoveCandidate(card);
  }

  function confirmLibraryRemoval() {
    if (!removeCandidate) return;
    const title = removeCandidate.title;
    setRemovedIdeaIds((ids) => [...new Set([...ids, removeCandidate.id])]);
    setRemoveCandidate(null);
    setNotice(`${title.toUpperCase()} HIDDEN FROM ACTIVE LIBRARY · RESTORE IT FROM ARCHIVE · SOURCE UNTOUCHED`);
  }

  async function confirmPermanentLibraryDeletion() {
    if (!removeCandidate || isDeletingIdea) return;
    setIsDeletingIdea(true);
    try {
      const deletion = permanentlyDeleteLibraryIdea({
        gemIds,
        customCards: customLibraryCards,
        recentIdeaIds,
        archivedIdeaIds,
        restoredIdeaIds,
        itemOverridesById,
        removedIdeaIds,
      }, removeCandidate);
      if (deletion.mediaId) await removeIdeaMedia(deletion.mediaId);
      setGemIds(deletion.next.gemIds);
      setCustomLibraryCards(deletion.next.customCards);
      setRecentIdeaIds(deletion.next.recentIdeaIds);
      setArchivedIdeaIds(deletion.next.archivedIdeaIds);
      setRestoredIdeaIds(deletion.next.restoredIdeaIds);
      setItemOverridesById(deletion.next.itemOverridesById);
      setRemovedIdeaIds(deletion.next.removedIdeaIds);
      const title = removeCandidate.title;
      setRemoveCandidate(null);
      setNotice(`${title.toUpperCase()} PERMANENTLY DELETED FROM THIS LIBRARY · PLACED LESSON COPIES WERE KEPT`);
    } catch {
      setNotice("THE IDEA COULD NOT BE COMPLETELY DELETED · NOTHING WAS REMOVED");
    } finally {
      setIsDeletingIdea(false);
    }
  }

  function restoreLibraryItem(card: LibraryItem) {
    if (removedIdeaIds.includes(card.id)) {
      setRemovedIdeaIds((ids) => ids.filter((id) => id !== card.id));
      setNotice(`${card.title.toUpperCase()} RESTORED TO ACTIVE LIBRARY · THIS BROWSER ONLY`);
      return;
    }
    toggleArchive(card);
  }

  function operationTaskIsDone(taskId: string) {
    return operationTaskDoneById[taskId] ?? (taskId === LEGACY_RECURRING_TASK_ID ? todoDone : false);
  }

  function setOperationTaskDone(taskId: string, isDone: boolean) {
    setOperationTaskDoneByPlanId((current) => ({
      ...current,
      [activeLessonPlan.id]: { ...current[activeLessonPlan.id], [taskId]: isDone },
    }));
    if (taskId === LEGACY_RECURRING_TASK_ID) setTodoDone(isDone);
    const task = operationTasks.find((candidate) => candidate.id === taskId);
    setNotice(`${task?.title.toUpperCase() ?? "TASK"} ${isDone ? "MARKED COMPLETE" : "REOPENED"} · LOCAL DEMO ONLY`);
  }

  function recordUpdateDecision(update: Pick<PlannerUpdate, "id" | "revisionId">, decision: UpdateDecision) {
    setUpdateDecisionByRevision((current) => ({ ...current, [revisionKey(update)]: decision }));
    setNotice(`${decision} SAVED FOR ${update.revisionId.toUpperCase()} · LOCAL PLANNER ONLY`);
  }

  function resetLibrarySearch() {
    setLibrarySearch("");
    setLibraryFilter("all");
  }

  function exportIdeaLibrary() {
    const json = serializeLibraryTransfer(allLibraryItems);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = libraryTransferFilename();
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${allLibraryItems.length} IDEA${allLibraryItems.length === 1 ? "" : "S"} EXPORTED · ATTACHMENTS STAYED ON THIS DEVICE`);
  }

  async function previewIdeaLibraryImport(file: File | null) {
    if (!file) return;
    try {
      const parsed = parseLibraryTransferJson(await file.text(), file.size);
      if (!parsed.ok) {
        setLibraryTransferImport({ kind: "error", fileName: file.name, message: parsed.error });
        setNotice(`IDEA LIBRARY IMPORT BLOCKED · ${parsed.error.toUpperCase()}`);
        return;
      }
      const preview = mergeLibraryTransfer(allLibraryItems, parsed.value.ideas);
      setLibraryTransferImport({
        kind: "ready",
        fileName: file.name,
        bundle: parsed.value,
        newCount: preview.newIdeas.length,
        duplicateCount: preview.duplicateCount,
      });
      setNotice(`${preview.newIdeas.length} NEW IDEA${preview.newIdeas.length === 1 ? "" : "S"} READY TO MERGE · ${preview.duplicateCount} ALREADY HERE`);
    } catch {
      const message = "The selected file could not be read.";
      setLibraryTransferImport({ kind: "error", fileName: file.name, message });
      setNotice("IDEA LIBRARY IMPORT BLOCKED · THE SELECTED FILE COULD NOT BE READ");
    } finally {
      if (libraryTransferInputRef.current) libraryTransferInputRef.current.value = "";
    }
  }

  function applyIdeaLibraryImport() {
    if (libraryTransferImport?.kind !== "ready") return;
    const result = mergeLibraryTransfer(allLibraryItems, libraryTransferImport.bundle.ideas);
    if (result.newIdeas.length) {
      setCustomLibraryCards(result.mergedIdeas);
      setLibraryFilter("all");
    }
    setLibraryTransferImport(null);
    setNotice(result.newIdeas.length
      ? `${result.newIdeas.length} NEW IDEA${result.newIdeas.length === 1 ? "" : "S"} IMPORTED · ${result.duplicateCount} DUPLICATE${result.duplicateCount === 1 ? "" : "S"} SKIPPED · NOTHING REPLACED`
      : `NO NEW IDEAS IMPORTED · ${result.duplicateCount} ALREADY HERE · NOTHING REPLACED`);
  }

  function setAttendanceStatus(athleteId: string, status: AttendanceStatus) {
    setAttendanceById((current) => ({ ...current, [athleteId]: status }));
    setViewAttendanceByPlanId((current) => ({
      ...current,
      [activeLessonPlan.id]: { ...current[activeLessonPlan.id], [athleteId]: status },
    }));
    const athlete = attendanceRoster.find((candidate) => candidate.id === athleteId);
    setNotice(`${athlete?.name.toUpperCase() ?? "ATHLETE"} · ${status.toUpperCase()} · SAVED FOR THIS LOCAL LESSON`);
  }

  function resetClassDraft() {
    setEditingClassId(null);
    setClassDraftName("");
    setClassDraftGroup("");
    setClassDraftCoach("");
    setClassDraftNotes("");
    setClassDraftRoster("");
  }

  function openNewClassManager() {
    resetClassDraft();
    setClassImportPreview(null);
    setIsClassManagerOpen(true);
  }

  function editLocalClass(localClass: LocalClass) {
    setEditingClassId(localClass.id);
    setClassDraftName(localClass.name);
    setClassDraftGroup(localClass.group ?? "");
    setClassDraftCoach(localClass.coach ?? "");
    setClassDraftNotes(localClass.notes ?? "");
    setClassDraftRoster(localClass.students.map((student) => student.name).join("\n"));
    setIsClassManagerOpen(true);
  }

  function classDraftStudentNames(): string[] | null {
    const names = classDraftRoster.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
    if (new Set(names.map((name) => name.toLocaleLowerCase())).size !== names.length) return null;
    return names;
  }

  function initializeAttendanceForClass(localClass: LocalClass | null) {
    if (!localClass) return;
    setAttendanceById((current) => {
      const next = { ...current };
      localClass.students.forEach((student) => {
        if (!isAttendanceStatus(next[student.id])) next[student.id] = "unmarked";
      });
      return next;
    });
  }

  function selectClassForLesson(localClass: LocalClass | null) {
    if (activePlanIsReadOnly()) return;
    setActiveClassId(localClass?.id ?? null);
    setClassStorage((current) => localClassStorage(current.classes, localClass?.id ?? null));
    initializeAttendanceForClass(localClass);
    setNotice(localClass
      ? `${localClass.name.toUpperCase()} SELECTED · ROSTER AND SCHEDULE ARE LOCAL TO THIS LESSON`
      : "CLASS CLEARED FROM THIS LESSON · SAMPLE ROSTER STAYS AS A LOCAL FALLBACK");
  }

  function saveLocalClass() {
    const name = classDraftName.trim();
    const studentNames = classDraftStudentNames();
    if (!name) {
      setNotice("NAME THE CLASS BEFORE SAVING IT LOCALLY");
      return;
    }
    if (!studentNames) {
      setNotice("EACH STUDENT NEEDS ONE UNIQUE NAME PER LINE");
      return;
    }

    if (editingClassId) {
      const updatedStorage = updateLocalClass(classStorage, editingClassId, {
        name,
        group: classDraftGroup.trim() || null,
        coach: classDraftCoach.trim() || null,
        notes: classDraftNotes.trim() || null,
        rosterText: studentNames.join("\n"),
      });
      const updated = localClassById(updatedStorage, editingClassId);
      if (!updated || updatedStorage === classStorage) {
        setNotice("CLASS COULD NOT SAVE · CHECK THE CLASS DETAILS AND ROSTER");
        return;
      }
      setClassStorage(updatedStorage);
      initializeAttendanceForClass(updated);
      editLocalClass(updated);
      setNotice(`${updated.name.toUpperCase()} UPDATED · ROSTER IDS STAY LOCAL AND STABLE`);
      return;
    }

    const created = createLocalClass({
      name,
      ...(classDraftGroup.trim() ? { group: classDraftGroup.trim() } : {}),
      ...(classDraftCoach.trim() ? { coach: classDraftCoach.trim() } : {}),
      ...(classDraftNotes.trim() ? { notes: classDraftNotes.trim() } : {}),
      students: studentNames.map((studentName) => ({ name: studentName })),
      schedule: [],
    });
    if (!created || !isLocalClass(created)) {
      setNotice("CLASS COULD NOT SAVE · CHECK THE CLASS NAME AND ROSTER");
      return;
    }
    setClassStorage((current) => addLocalClass(current, created, { makeActive: true }));
    setActiveClassId(created.id);
    initializeAttendanceForClass(created);
    editLocalClass(created);
    setNotice(`${created.name.toUpperCase()} CREATED · THIS LESSON NOW USES ITS LOCAL ROSTER`);
  }

  function previewClassScheduleImport() {
    const preview = parseLocalClassScheduleImport(classImportRaw);
    setClassImportPreview(preview);
    setNotice(preview.ok
      ? `${preview.value.class.name.toUpperCase()} IS READY TO IMPORT AS A NEW LOCAL CLASS`
      : preview.error.toUpperCase());
  }

  function applyClassScheduleImport() {
    const preview = classImportPreview?.ok ? classImportPreview : parseLocalClassScheduleImport(classImportRaw);
    if (!preview.ok) {
      setClassImportPreview(preview);
      setNotice(preview.error.toUpperCase());
      return;
    }
    const appended = appendLocalClassScheduleImport(classStorage, preview.value, { makeActive: true });
    if (!appended) {
      setNotice("IMPORT COULD NOT SAVE · YOUR EXISTING CLASSES WERE NOT CHANGED");
      return;
    }
    setClassStorage(appended.storage);
    setActiveClassId(appended.localClass.id);
    initializeAttendanceForClass(appended.localClass);
    setClassImportRaw("");
    setClassImportPreview(null);
    editLocalClass(appended.localClass);
    setNotice(`${appended.localClass.name.toUpperCase()} IMPORTED · ITS SCHEDULE IS NOW LOCAL AND AUTOMATIC`);
  }

  async function previewSafeScheduleFile(file: File | null) {
    if (!file) {
      setSafeScheduleImportPreview(null);
      return;
    }
    if (!/\.json$/i.test(file.name)) {
      const result: SafeScheduleParseResult = { ok: false, error: "Choose the Lesson Planner safe schedule .json file." };
      setSafeScheduleImportPreview({ fileName: file.name, fileSize: file.size, result });
      setNotice(result.error.toUpperCase());
      return;
    }
    if (file.size > MAX_SAFE_SCHEDULE_FILE_BYTES) {
      const result: SafeScheduleParseResult = { ok: false, error: "Schedule file is too large for this private local importer." };
      setSafeScheduleImportPreview({ fileName: file.name, fileSize: file.size, result });
      setNotice(result.error.toUpperCase());
      return;
    }
    try {
      const result = parseSafeScheduleBundleJson(await file.text(), file.size);
      setSafeScheduleImportPreview({ fileName: file.name, fileSize: file.size, result });
      setNotice(result.ok
        ? `${result.value.schedule.timeBlocks.length} SAFE SCHEDULE BLOCKS READY · APPLY TO STORE THIS BROWSER-LOCAL COPY`
        : result.error.toUpperCase());
    } catch {
      const result: SafeScheduleParseResult = { ok: false, error: "The selected schedule file could not be read." };
      setSafeScheduleImportPreview({ fileName: file.name, fileSize: file.size, result });
      setNotice(result.error.toUpperCase());
    }
  }

  function applySafeScheduleImport() {
    if (!hasLoadedSafeSchedule || !safeScheduleImportPreview?.result.ok) {
      setNotice("CHOOSE AND VALIDATE A SAFE SCHEDULE JSON FILE FIRST");
      return;
    }
    const next = replaceSafeScheduleBundle(safeScheduleStorageState, safeScheduleImportPreview.result.value);
    if (!persistSafeScheduleStorage(next)) return;
    setOpenAreaSelectionByKey({});
    setSafeScheduleImportPreview(null);
    setNotice(`${next.bundle?.schedule.timeBlocks.length ?? 0} FULL-SCHEDULE BLOCKS SAVED · LINK EACH LOCAL CLASS TO ITS EXACT GROUP`);
  }

  function loadSummer2026LocalSchedule() {
    if (!hasLoadedSafeSchedule) {
      setNotice("WAIT FOR THIS BROWSER'S LOCAL SCHEDULE STORAGE TO FINISH LOADING");
      return;
    }
    try {
      const next = replaceSafeScheduleBundle(safeScheduleStorageState, summer2026SafeScheduleFixture);
      if (!persistSafeScheduleStorage(next)) return;
      setOpenAreaSelectionByKey({});
      setSafeScheduleImportPreview(null);
      setNotice(`${summer2026SafeScheduleFixture.schedule.timeBlocks.length} SUMMER 2026 BLOCKS LOADED LOCALLY · LINK EACH CLASS TO ITS EXACT GROUP · ${summer2026SafeScheduleFixture.schedule.collisionWarnings.warningCount} ADVISORY WARNINGS REMAIN`);
    } catch {
      setNotice("THE BUILT-IN SUMMER 2026 COPY COULD NOT BE LOADED · YOUR CURRENT LOCAL SCHEDULE STAYS UNCHANGED");
    }
  }

  function linkLocalClassToSafeSchedule(classId: string, group: string | null) {
    const next = setSafeScheduleClassGroup(safeScheduleStorageState, classId, group);
    if (!next) {
      setNotice("SCHEDULE GROUP LINK WAS REJECTED · CHOOSE AN EXACT IMPORTED GROUP");
      return;
    }
    if (!persistSafeScheduleStorage(next)) return;
    setOpenAreaSelectionByKey({});
    setNotice(group
      ? `${group.toUpperCase()} LINKED TO THIS LOCAL CLASS · NO FUZZY NAME MATCHING USED`
      : "FULL-SCHEDULE GROUP LINK CLEARED · LOCAL CLASS SCHEDULE REMAINS THE FALLBACK");
  }

  function confirmSafeScheduleWeek(week: ScheduleWeek) {
    const next = setSafeScheduleManualWeek(safeScheduleStorageState, activeLessonPlan.date, week);
    if (!next || !persistSafeScheduleStorage(next)) return;
    setOpenAreaSelectionByKey({});
    setNotice(`${week.toUpperCase()} WEEK CONFIRMED FOR ${activeLessonDateLabel.toUpperCase()} · SAVED IN THIS BROWSER`);
  }

  function confirmRemoveLocalClass() {
    if (!removeClassCandidate) return;
    const removed = removeClassCandidate;
    setClassStorage((current) => removeLocalClass(current, removed.id));
    if (activeClassId === removed.id) setActiveClassId(null);
    if (editingClassId === removed.id) resetClassDraft();
    setRemoveClassCandidate(null);
    setNotice(`${removed.name.toUpperCase()} REMOVED FROM THIS BROWSER · NO LESSON PHASES WERE CHANGED`);
  }

  function selectClassSetupGuide() {
    const guide = classSetupGuideRef.current;
    if (!guide) return;
    guide.focus();
    guide.select();
    setNotice("CLASS + SCHEDULE GUIDE SELECTED · COPY IT WITH YOUR DEVICE'S COPY COMMAND");
  }

  function resetNewIdeaDraft() {
    setNewIdeaTitle("");
    setNewIdeaDescription("");
    setNewIdeaTags("");
    setNewIdeaMats("");
    setNewIdeaMediaFile(null);
    if (newIdeaCameraInputRef.current) newIdeaCameraInputRef.current.value = "";
    if (newIdeaMediaInputRef.current) newIdeaMediaInputRef.current.value = "";
  }

  async function saveNewIdea() {
    if (isSavingNewIdea) return;
    const title = newIdeaTitle.trim();
    if (!title) {
      setNotice("NAME THE IDEA BEFORE SAVING IT TO YOUR LOCAL LIBRARY");
      return;
    }
    const tags = newIdeaTags.split(",").map((tag) => tag.trim()).filter(Boolean);
    const ideaId = `local-idea-${Date.now()}`;
    setIsSavingNewIdea(true);
    try {
      const mediaMetadata = newIdeaMediaFile
        ? await storeLibraryIdeaMedia(ideaId, newIdeaMediaFile)
        : {};
      const idea: LibraryItem = {
        ...makeLocalLibraryItem({
          id: ideaId,
          kind: newIdeaKind,
          title,
          description: newIdeaDescription.trim() || "Add the rules, coaching notes, or reference details when you are ready.",
          tags: tags.length ? tags : [newIdeaKind.toLowerCase(), "local"],
          accent: newIdeaKind === "SKILL" ? "pink" : newIdeaKind === "ACTIVITY" ? "green" : newIdeaKind === "REFERENCE" ? "yellow" : "cyan",
          mats: parseEditableList(newIdeaMats),
        }),
        ...mediaMetadata,
      };
      setCustomLibraryCards((cards) => [idea, ...cards]);
      resetNewIdeaDraft();
      setIsAddingIdea(false);
      setLibraryFilter("all");
      setNotice(mode === "VIEW"
        ? `${idea.title.toUpperCase()} SAVED TO YOUR LOCAL IDEA LIBRARY${idea.mediaId ? ` WITH A LOCAL ${idea.mediaKind === "video" ? "VIDEO" : "PHOTO"}` : ""} · READY TO PLACE WHEN YOU RETURN TO EDIT`
        : `${idea.title.toUpperCase()} SAVED TO YOUR LOCAL IDEA LIBRARY${idea.mediaId ? ` WITH A LOCAL ${idea.mediaKind === "video" ? "VIDEO" : "PHOTO"}` : ""} · SELECT IT TO PLACE IT`);
    } catch {
      setNotice("THE IDEA ATTACHMENT COULD NOT BE SAVED · THE IDEA IS STILL OPEN SO YOU CAN TRY AGAIN");
    } finally {
      setIsSavingNewIdea(false);
    }
  }

  const editingSavedMedia = editingLibraryItem ? normalizedLibraryMedia(editingLibraryItem) : {};
  const editingMediaKind = editingIdeaMediaFile
    ? ideaMediaKindForFile(editingIdeaMediaFile)
    : editingSavedMedia.mediaKind;
  const editingMediaUrl = editingIdeaMediaFile
    ? editingIdeaMediaPreviewUrl
    : removeEditingIdeaMedia || !editingSavedMedia.mediaId
      ? null
      : ideaMediaUrls[editingSavedMedia.mediaId] ?? null;
  const editingMediaFilename = editingIdeaMediaFile?.name ?? editingSavedMedia.mediaFilename;

  const newIdeaForm = isAddingIdea ? (
    <form className="new-idea-form" onSubmit={(event) => { event.preventDefault(); void saveNewIdea(); }}>
      <b>NEW IDEA</b>
      <label>NAME<input value={newIdeaTitle} onChange={(event) => setNewIdeaTitle(event.target.value)} placeholder="e.g. Handstand Shape Race" maxLength={80} autoFocus /></label>
      <label>TYPE
        <select value={newIdeaKind} onChange={(event) => setNewIdeaKind(event.target.value as LessonCard["kind"])}>
          <option value="SKILL">SKILL</option>
          <option value="DRILL">DRILL</option>
          <option value="ROUTINE">ROUTINE</option>
          <option value="ACTIVITY">ACTIVITY</option>
          <option value="REFERENCE">REFERENCE</option>
        </select>
      </label>
      <label>RULES / COACHING NOTE<textarea value={newIdeaDescription} onChange={(event) => setNewIdeaDescription(event.target.value)} placeholder="What should you remember or explain?" maxLength={280} /></label>
      <label>MATS NEEDED <small>one per line or comma</small><textarea value={newIdeaMats} onChange={(event) => setNewIdeaMats(event.target.value)} placeholder="panel mat, 8-inch mat" maxLength={220} /></label>
      <label>TAGS<input value={newIdeaTags} onChange={(event) => setNewIdeaTags(event.target.value)} placeholder="floor, L3, warmup" maxLength={120} /></label>
      <div className="new-idea-media-actions">
        <b>REFERENCE PHOTO OR VIDEO <small>optional · one attachment · stays only in this browser</small></b>
        <input
          ref={newIdeaCameraInputRef}
          className="new-idea-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => { chooseLibraryIdeaMedia(event.currentTarget.files?.[0] ?? null, "new"); event.currentTarget.value = ""; }}
        />
        <input
          ref={newIdeaMediaInputRef}
          className="new-idea-file-input"
          type="file"
          accept="image/*,video/*,.mov,.m4v"
          hidden
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => { chooseLibraryIdeaMedia(event.currentTarget.files?.[0] ?? null, "new"); event.currentTarget.value = ""; }}
        />
        <button type="button" onClick={() => newIdeaCameraInputRef.current?.click()}>TAKE PHOTO</button>
        <button type="button" onClick={() => newIdeaMediaInputRef.current?.click()}>CHOOSE PHOTO / VIDEO</button>
        {newIdeaMediaFile ? <button type="button" className="media-clear" onClick={() => setNewIdeaMediaFile(null)}>CLEAR ATTACHMENT</button> : null}
        {newIdeaMediaFile ? <span>{ideaMediaKindForFile(newIdeaMediaFile)?.toUpperCase()} READY: {newIdeaMediaFile.name || "NEW CAMERA PHOTO"}</span> : <span>NO ATTACHMENT</span>}
        {newIdeaMediaFile && newIdeaMediaPreviewUrl ? (
          <figure className="idea-media-preview">
            {ideaMediaKindForFile(newIdeaMediaFile) === "video"
              ? <video src={newIdeaMediaPreviewUrl} controls playsInline preload="metadata" />
              : <img src={newIdeaMediaPreviewUrl} alt="New idea attachment preview" />}
          </figure>
        ) : null}
      </div>
      <div className="new-idea-actions"><button type="submit" disabled={isSavingNewIdea}>{isSavingNewIdea ? "SAVING…" : "SAVE IDEA"}</button><button type="button" disabled={isSavingNewIdea} onClick={() => { resetNewIdeaDraft(); setIsAddingIdea(false); }}>CANCEL</button></div>
    </form>
  ) : null;

  const ideaLibraryPanel = (
    <section id="idea-library" className={`retro-window library-window ${isLibraryWindow ? "library-workspace-window" : ""}`} aria-label={isLibraryWindow ? "Idea Library workspace" : "Idea Library placement tray"}>
      <div className="window-title library-window-title">
        <b>IDEA LIBRARY</b>
        <div className="library-density-controls" aria-label="Idea Library detail size">
          <span aria-live="polite">{allLibraryItems.length} SAVED · {libraryDetailLevel(libraryRowHeight)}</span>
          <button type="button" aria-label="Show less detail in the Idea Library" title="Show less detail" disabled={libraryRowHeight <= LIBRARY_ROW_HEIGHT_MIN} onClick={() => adjustLibraryRowHeight(-LIBRARY_ROW_HEIGHT_STEP)}>−</button>
          <button type="button" aria-label="Show more detail in the Idea Library" title="Show more detail" disabled={libraryRowHeight >= LIBRARY_ROW_HEIGHT_MAX} onClick={() => adjustLibraryRowHeight(LIBRARY_ROW_HEIGHT_STEP)}>+</button>
        </div>
      </div>
      <div className="library-placement-strip">
        <b>{isLibraryWindow ? "VIEW · EDIT · FAVORITE · ARCHIVE · RESTORE" : "PLACE → THEN TAP A HIGHLIGHTED STATION"}</b>
        <span>{isLibraryWindow ? "Use the shelves and search to organize ideas. Changes save locally and appear in the planner window." : "Pinch this list out for details, or in to compact it. One finger still scrolls; normal size shows five ideas."}</span>
      </div>
      <button className="new-idea-trigger" onClick={() => setIsAddingIdea((open) => !open)}>{isAddingIdea ? "CLOSE NEW IDEA" : "+ NEW IDEA"}</button>
      {newIdeaForm}
      <section className="library-transfer" aria-label="Move Idea Library ideas between iPads">
        <div className="library-transfer-heading">
          <b>MOVE IDEAS BETWEEN IPADS</b>
          <span>JSON MERGE · TEXT ONLY · NOTHING REPLACED</span>
        </div>
        <div className="library-transfer-actions">
          <button type="button" disabled={!allLibraryItems.length} onClick={exportIdeaLibrary}>EXPORT JSON</button>
          <button type="button" onClick={() => libraryTransferInputRef.current?.click()}>IMPORT JSON</button>
        </div>
        <input
          ref={libraryTransferInputRef}
          className="new-idea-file-input"
          type="file"
          accept=".json,application/json"
          hidden
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => { void previewIdeaLibraryImport(event.currentTarget.files?.[0] ?? null); }}
        />
        {libraryTransferImport ? (
          <div className={`library-transfer-preview ${libraryTransferImport.kind}`}>
            <strong>{libraryTransferImport.kind === "ready" ? "IMPORT PREVIEW" : "IMPORT BLOCKED"}</strong>
            <span>{libraryTransferImport.fileName}</span>
            {libraryTransferImport.kind === "ready" ? (
              <>
                <p><b>{libraryTransferImport.newCount} NEW</b> · {libraryTransferImport.duplicateCount} ALREADY HERE · ATTACHMENTS NOT INCLUDED</p>
                <div>
                  <button type="button" disabled={!libraryTransferImport.newCount} onClick={applyIdeaLibraryImport}>
                    {libraryTransferImport.newCount ? `MERGE ${libraryTransferImport.newCount} NEW` : "NOTHING NEW"}
                  </button>
                  <button type="button" onClick={() => setLibraryTransferImport(null)}>CANCEL</button>
                </div>
              </>
            ) : (
              <>
                <p>{libraryTransferImport.message}</p>
                <button type="button" onClick={() => setLibraryTransferImport(null)}>CLOSE</button>
              </>
            )}
          </div>
        ) : null}
      </section>
      <label className="library-search">
        <span>FIND TITLE / TAG / SKILL / VARIANT</span>
        <input
          type="search"
          value={librarySearch}
          onChange={(event) => setLibrarySearch(event.target.value)}
          placeholder="shape, bars, game…"
          aria-label="Search local library by title, tag, skill, event, or variant"
        />
      </label>
      <div className="library-filter" aria-label="Local library shelf filter">
        {(["all", "gems", "recent", "archive"] as const).map((filter) => (
          <button
            key={filter}
            className={libraryFilter === filter ? "selected" : ""}
            aria-pressed={libraryFilter === filter}
            onClick={() => setLibraryFilter(filter)}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="library-results-summary" aria-live="polite">
        <b>{libraryCards.length} MATCH{libraryCards.length === 1 ? "" : "ES"}</b>
        <span>{shelfCopy[libraryFilter]}</span>
      </div>
      {!isLibraryWindow && pendingZonePlacement ? (
        <section className="destination-picker" aria-labelledby="destination-picker-title">
          <div className="destination-picker-title">
            <b id="destination-picker-title">CHOOSE A SPOT ON THE PLAN</b>
            <span>NOT SAVED YET</span>
          </div>
          <p><strong>{pendingZonePlacement.card.title}</strong> is selected for <em>{pendingPlacementPhase?.title ?? "the removed phase"}</em>.</p>
          {pendingPlacementPhase ? (
            <>
              {pendingPlacementPhase.id !== activePhase.id ? <button className="open-placement-phase" onClick={() => setActivePhaseId(pendingPlacementPhase.id)}>OPEN THAT PHASE</button> : null}
              <p className="placement-instructions">{pendingPlacementPhase.mode === "TEXT" ? "Tap the highlighted text plan." : pendingPlacementPhase.mode === "MIXED" ? "Tap the highlighted text plan or one highlighted station." : pendingPlacementPhase.zones.length ? "Tap any highlighted station on the map." : "Add a station to this visual phase, or change its format, before placing this idea."}</p>
            </>
          ) : (
            <p className="destination-picker-warning">That phase no longer exists. Cancel this selection; nothing has been saved.</p>
          )}
          <button className="cancel-destination" onClick={cancelPendingSnapshot}>CANCEL</button>
        </section>
      ) : null}
      <div
        ref={libraryStackRef}
        className="library-stack"
        aria-label="Idea Library list. Pinch outward to show more detail or inward to compact the rows."
        onClickCapture={(event) => {
          if (Date.now() - libraryPinchJustEndedRef.current < 360) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {libraryCards.length ? libraryCards.map((card) => {
          const state = card.isRemoved
            ? "HIDDEN LOCALLY"
            : recentIdeaIds.includes(card.id)
              ? "RECENTLY PLACED"
              : card.defaultArchived && card.sourceType === "lesson_plan_activity"
                ? "IMPORTED NOTE · REVIEW"
                : card.id.startsWith("local-idea-")
                  ? "LOCAL IDEA"
                  : card.sourceStatus.toUpperCase();
          const tags = card.tags.slice(0, 2).join(" · ");
          const extraDetail = card.safety ? `⚠ ${card.safety}` : card.skills.slice(0, 3).join(" · ");
          const isUnavailable = Boolean(card.isRemoved || card.isArchived);
          return (
            <article key={card.id} className="library-item">
              <div className="library-item-copy">
                <div className="library-item-kicker"><span>{card.kind}</span><span>{card.variants.length} SETUP{card.variants.length === 1 ? "" : "S"}</span></div>
                <strong title={card.title}>{card.title}</strong>
                <span className="library-item-state" title={tags ? `${state} · ${tags}` : state}>{state}{tags ? ` · ${tags}` : ""}</span>
                <p className="library-item-description">{card.description}</p>
                {extraDetail ? <span className="library-item-extra">{card.safety ? extraDetail : `SKILLS · ${extraDetail}`}</span> : null}
              </div>
              <div className="library-actions" aria-label={`Actions for ${card.title}`}>
                <button className={`gem-toggle ${card.starred ? "gemmed" : ""}`} aria-label={card.starred ? `Remove ${card.title} from gems` : `Save ${card.title} as a gem`} title={card.starred ? "Remove gem" : "Save as gem"} aria-pressed={Boolean(card.starred)} onClick={() => toggleGem(card.id)}>
                  {card.starred ? "★" : "☆"}
                </button>
                <button type="button" className="library-utility" aria-label={`View details for ${card.title}`} title="Details" onClick={() => setDetailCard(card)}>INFO</button>
                <button type="button" className="library-utility" aria-label={`Edit ${card.title}`} title="Edit" onClick={() => startLibraryEdit(card)}>EDIT</button>
                <button
                  type="button"
                  className="library-utility library-remove"
                  aria-label={isUnavailable ? `Restore ${card.title}` : `Remove ${card.title}`}
                  title={isUnavailable ? "Restore" : "Remove"}
                  onClick={() => isUnavailable ? restoreLibraryItem(card) : requestLibraryRemoval(card)}
                >
                  {isUnavailable ? "↺" : "×"}
                </button>
                {isLibraryWindow ? (
                  <span className={`library-organize-status ${isUnavailable ? "archived" : card.starred ? "gem" : "active"}`}>
                    {isUnavailable ? "ARCHIVED · RESTORE ↺" : card.starred ? "GEM SHELF" : "ACTIVE IDEA"}
                  </span>
                ) : isUnavailable ? <span className="library-unavailable">RESTORE FIRST</span> : <button className="add-card" onClick={() => addToLesson(card)}>PLACE →</button>}
              </div>
            </article>
          );
        }) : allLibraryItems.length === 0 ? (
          <div className="library-empty" role="status">
            <strong>NO IDEAS YET</strong>
            <p>This library starts empty. Create your first skill, drill, routine, activity, or reference from scratch.</p>
            <button onClick={() => setIsAddingIdea(true)}>+ CREATE FIRST IDEA</button>
          </div>
        ) : (
          <div className="library-empty" role="status">
            <strong>NO LIBRARY MATCHES</strong>
            <p>Try another skill, event, title, or tag, or reset to all ideas.</p>
            <button onClick={resetLibrarySearch}>RESET SEARCH</button>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <main id="today" className="app-shell">
      <header className="titlebar">
        <div className="titlebar-label"><span className="title-dot" /> <span className="title-spark" aria-hidden="true">✦</span> <span className="routine-builder-title">{isLibraryWindow ? "IDEA LIBRARY" : "LESSON PLANNER"}</span> <small>{isLibraryWindow ? "LOCAL WORKSPACE" : "v0.1 LOCAL"}</small></div>
      </header>

      <section className="terminal" role="status">
        <span>● {isLibraryWindow ? "IDEA LIBRARY READY · CHANGES SAVE IN THIS BROWSER" : notice}</span>
        <span className="demo-indicator">{isLibraryWindow ? "DEDICATED VIEW · EDIT · ORGANIZE" : "LOCAL-ONLY PLAN DATA · THIS BROWSER"}</span>
        <span>WORKSPACE: RYAN / {isLibraryWindow ? "IDEAS" : "PRIVATE LOCAL"}</span>
      </section>

      {isLibraryWindow ? (
        <>
          <nav className="library-workspace-nav" aria-label="Idea Library window controls">
            <button type="button" onClick={returnToPlanner}>← BACK TO PLANNER</button>
            <span>STAR IDEAS FOR GEMS · ARCHIVE IDEAS TO HIDE THEM · EDITS STAY LOCAL</span>
          </nav>
          <section className="library-workspace-body">
            {ideaLibraryPanel}
          </section>
          <footer className="statusbar"><span>☑ LOCAL FIRST</span><span>{allLibraryItems.length} SAVED IDEAS</span><span>LIBRARY WINDOW</span></footer>
        </>
      ) : (
      <>
      <nav className="top-nav" aria-label="Primary">
        <button className={activeLessonPlan.date === lessonToday && !isEventEditorOpen ? "active" : ""} onClick={openTodayLessonPlan}>TODAY</button>
        <button className={planShelf === "PAST" ? "active" : ""} onClick={() => setPlanShelf((current) => current === "PAST" ? null : "PAST")}>PAST PLANS</button>
        <button className={`future-plan-nav ${planShelf === "FUTURE" ? "active" : ""}`} onClick={() => {
          setFuturePlanDate(nextLessonPlanDate(lessonToday));
          setPlanShelf((current) => current === "FUTURE" ? null : "FUTURE");
        }}>+ FUTURE PLAN</button>
        {mode === "EDIT" && !isPastActivePlan ? <button className={isClassManagerOpen ? "active class-manager-trigger" : "class-manager-trigger"} onClick={openNewClassManager}>+ CREATE CLASS</button> : null}
        <button onClick={openLibraryWindow} aria-label="Open the Idea Library in a new window">LIBRARY <b>{allLibraryItems.length} IDEAS</b></button>
        {mode === "VIEW" ? <button className="view-new-idea-nav" onClick={() => setIsAddingIdea((open) => !open)}>{isAddingIdea ? "CLOSE NEW IDEA" : "+ NEW IDEA"}</button> : null}
        <button className={unresolvedUpdateCount ? "pending-shake" : ""} onClick={() => scrollToPlannerSection("daily-updates")}>UPDATES <b className="hot">{unresolvedUpdateCount}</b></button>
        <div className="mode-switch" aria-label="Lesson mode">
          {(["EDIT", "VIEW"] as const).map((entry) => (
            <button key={entry} className={mode === entry ? "selected" : ""} onClick={() => setLessonMode(entry)} disabled={entry === "EDIT" && isPastActivePlan}>{entry}</button>
          ))}
        </div>
      </nav>

      {mode === "EDIT" && isClassManagerOpen ? (
        <section className="class-manager retro-window" aria-label="Create and manage local classes">
          <div className="window-title">LOCAL CLASSES <span>PRIVATE · THIS BROWSER</span><button type="button" onClick={() => { setIsClassManagerOpen(false); setRemoveClassCandidate(null); }} aria-label="Close local classes">×</button></div>
          <section className="class-setup-help" aria-label="Class and schedule setup instructions">
            <div className="class-setup-help-heading">
              <div><b>CLASS + SCHEDULE HELP</b><span>Follow these steps to create a roster, import a class schedule, and connect the full gym schedule.</span></div>
              <button type="button" onClick={selectClassSetupGuide}>SELECT + COPY GUIDE</button>
            </div>
            <ol>
              <li>Create a class above: name it, add one student per line, then tap <b>CREATE + USE FOR THIS LESSON</b>.</li>
              <li>For a class schedule, load the JSON example below, edit it, preview it, then apply it as a new class.</li>
              <li>For open-station availability, load the full gym schedule and choose the class&apos;s exact schedule group.</li>
            </ol>
            <label>COPY/PASTE DETAILED SETUP INSTRUCTIONS
              <textarea ref={classSetupGuideRef} readOnly value={CLASS_AND_SCHEDULE_SETUP_GUIDE} aria-label="Copyable class and schedule setup instructions" />
            </label>
            <details>
              <summary>OPEN PASTE-READY CLASS + SCHEDULE JSON TEMPLATE</summary>
              <textarea readOnly value={LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE} aria-label="Paste-ready local class and schedule JSON template" />
            </details>
          </section>
          <div className="class-manager-body">
            <form className="class-editor-form" onSubmit={(event) => { event.preventDefault(); saveLocalClass(); }}>
              <div className="class-editor-heading">
                <div><b>{editingClassId ? "EDIT CLASS" : "CREATE CLASS"}</b><span>{editingClassId ? "Roster changes keep matching students’ local attendance IDs." : "The saved class is attached to this lesson only when you create or select it."}</span></div>
                {editingClassId ? <button type="button" onClick={resetClassDraft}>NEW CLASS</button> : null}
              </div>
              <div className="class-editor-fields">
                <label>CLASS NAME<input value={classDraftName} onChange={(event) => setClassDraftName(event.target.value)} placeholder="e.g. Level 3 Boys" maxLength={120} autoFocus /></label>
                <label>GROUP / LEVEL<input value={classDraftGroup} onChange={(event) => setClassDraftGroup(event.target.value)} placeholder="e.g. Level 3" maxLength={120} /></label>
                <label>COACH <small>optional</small><input value={classDraftCoach} onChange={(event) => setClassDraftCoach(event.target.value)} placeholder="Coach name" maxLength={120} /></label>
              </div>
              <label className="class-roster-field">STUDENTS <small>one name per line · attendance is never pulled from automation</small><textarea value={classDraftRoster} onChange={(event) => setClassDraftRoster(event.target.value)} placeholder={"Avery Kim\nJordan Lee"} maxLength={8000} /></label>
              <label className="class-notes-field">CLASS NOTES <small>optional · private to this browser</small><textarea value={classDraftNotes} onChange={(event) => setClassDraftNotes(event.target.value)} placeholder="Level notes, coach reminders, or anything useful." maxLength={2000} /></label>
              {editingClassId ? (() => {
                const editing = localClassById(classStorage, editingClassId);
                return editing?.schedule.length ? <div className="class-editor-schedule-summary"><b>LOCAL SCHEDULE</b><span>{editing.schedule.length} imported block{editing.schedule.length === 1 ? "" : "s"} stay with this class. Import a revised schedule as a new class so nothing is overwritten.</span></div> : <div className="class-editor-schedule-summary empty"><b>NO SCHEDULE YET</b><span>Paste a JSON schedule below whenever you are ready.</span></div>;
              })() : null}
              <div className="class-editor-actions"><button type="submit">{editingClassId ? "SAVE CLASS" : "CREATE + USE FOR THIS LESSON"}</button><button type="button" onClick={() => { resetClassDraft(); setIsClassManagerOpen(false); }}>CANCEL</button></div>
            </form>

            <section className="local-class-list" aria-label="Saved local classes">
              <div className="local-class-list-heading"><b>SAVED CLASSES</b><span>{classStorage.classes.length} LOCAL</span></div>
              {classStorage.classes.length ? classStorage.classes.map((localClass) => (
                <article key={localClass.id} className={`local-class-card ${activeClassId === localClass.id ? "selected" : ""}`}>
                  <div><b>{localClass.name}</b><span>{localClass.group ?? "No group / level"}{localClass.coach ? ` · ${localClass.coach}` : ""}</span></div>
                  <p>{localClass.students.length} student{localClass.students.length === 1 ? "" : "s"} · {localClass.schedule.length} schedule block{localClass.schedule.length === 1 ? "" : "s"}</p>
                  {safeScheduleBundle ? (
                    <label className="schedule-group-link">
                      <span>FULL SCHEDULE GROUP · EXACT LINK</span>
                      <select
                        value={safeScheduleStorageState.scheduleGroupByClassId[localClass.id] ?? ""}
                        onChange={(event) => linkLocalClassToSafeSchedule(localClass.id, event.target.value || null)}
                      >
                        <option value="">NOT LINKED</option>
                        {safeScheduleGroupOptions.map((group) => <option key={group} value={group}>{group}</option>)}
                      </select>
                    </label>
                  ) : null}
                  <div className="local-class-actions">
                    <button type="button" className={activeClassId === localClass.id ? "selected" : ""} onClick={() => selectClassForLesson(localClass)}>{activeClassId === localClass.id ? "USED THIS LESSON" : "USE FOR THIS LESSON"}</button>
                    <button type="button" onClick={() => editLocalClass(localClass)}>EDIT</button>
                    <button type="button" className="remove-local-class" onClick={() => setRemoveClassCandidate(localClass)}>REMOVE</button>
                  </div>
                </article>
              )) : <p className="local-class-empty">No local classes yet. Create one above or import a JSON class schedule below.</p>}
              {activeLocalClass ? <button type="button" className="clear-local-class" onClick={() => selectClassForLesson(null)}>USE SAMPLE ROSTER FOR THIS LESSON</button> : null}
            </section>
          </div>

          {removeClassCandidate ? (
            <section className="remove-local-class-confirm" aria-label={`Confirm removal of ${removeClassCandidate.name}`}>
              <div><b>REMOVE {removeClassCandidate.name.toUpperCase()}?</b><span>This is the second confirmation. Its class record and private roster will be removed from this browser; lesson phases stay untouched.</span></div>
              <div><button type="button" onClick={() => setRemoveClassCandidate(null)}>KEEP CLASS</button><button type="button" onClick={confirmRemoveLocalClass}>REMOVE CLASS NOW</button></div>
            </section>
          ) : null}

          <section className="class-import-panel" aria-label="Import a local class schedule as JSON">
            <div className="class-import-heading"><div><b>IMPORT CLASS + SCHEDULE</b><span>JSON ONLY · imports add a new local class and never overwrite an existing roster, schedule, or lesson phase.</span></div><button type="button" onClick={() => { setClassImportRaw(LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE); setClassImportPreview(null); }}>LOAD EXAMPLE</button></div>
            <label>PASTE JSON<textarea value={classImportRaw} onChange={(event) => { setClassImportRaw(event.target.value); setClassImportPreview(null); }} placeholder={LOCAL_CLASS_SCHEDULE_JSON_EXAMPLE} spellCheck={false} /></label>
            <div className="class-import-actions"><button type="button" onClick={previewClassScheduleImport}>PREVIEW JSON</button>{classImportPreview?.ok ? <button type="button" onClick={applyClassScheduleImport}>APPLY AS NEW LOCAL CLASS</button> : null}</div>
            {classImportPreview ? classImportPreview.ok ? (
              <div className="class-import-preview ok"><b>READY: {classImportPreview.value.class.name}</b><span>{classImportPreview.value.class.students.length} students · {classImportPreview.value.class.schedule.length} schedule blocks · choose APPLY to save a separate local class.</span></div>
            ) : <div className="class-import-preview error"><b>CHECK JSON</b><span>{classImportPreview.error}</span></div> : <p className="class-import-help">Use the example’s <code>version</code>, <code>class</code>, <code>students</code>, and <code>schedule</code> fields. SQL is intentionally not run inside the planner.</p>}
          </section>

          <section className="class-import-panel safe-schedule-import-panel" aria-label="Import the privacy-safe full gym schedule as JSON">
            <div className="class-import-heading">
              <div><b>FULL GYM SCHEDULE (.JSON)</b><span>PRIVATE FILE PICKER · schedule groups, times, and equipment only · no roster, media, URL, or live connection.</span></div>
            </div>
            <label className="safe-schedule-file-field">CHOOSE SAFE SCHEDULE FILE
              <input
                key={safeScheduleBundle?.schedule.revision ?? "no-full-schedule"}
                type="file"
                accept=".json,application/json"
                onChange={(event) => { void previewSafeScheduleFile(event.currentTarget.files?.[0] ?? null); }}
              />
            </label>
            {safeScheduleImportPreview ? safeScheduleImportPreview.result.ok ? (() => {
              const preview = safeScheduleImportPreview.result.value;
              const openCount = preview.schedule.timeBlocks.filter((block) => block.activityType === "open").length;
              return (
                <div className="class-import-preview ok">
                  <b>READY: {safeScheduleImportPreview.fileName}</b>
                  <span>{Math.ceil(safeScheduleImportPreview.fileSize / 1024)} KB · {safeScheduleGroups(preview).length} groups · {preview.schedule.timeBlocks.length} blocks · {openCount} explicit Open events · {preview.schedule.collisionWarnings.warningCount} collision warnings.</span>
                  <span>Source: {preview.schedule.sourceId} / {preview.schedule.scheduleId} · range {preview.schedule.effectiveStart ?? "OPEN"}–{preview.schedule.effectiveEnd ?? "ONGOING"} · revision {preview.schedule.revision.slice(0, 12)}…</span>
                </div>
              );
            })() : <div className="class-import-preview error"><b>CHECK SAFE SCHEDULE</b><span>{safeScheduleImportPreview.result.error}</span></div> : safeScheduleBundle ? (
              <div className="class-import-preview ok">
                <b>LOCAL FULL SCHEDULE ACTIVE</b>
                <span>{safeScheduleBundle.schedule.sourceId} / {safeScheduleBundle.schedule.scheduleId} · {safeScheduleGroupOptions.length} groups · {safeScheduleBundle.schedule.timeBlocks.length} blocks · revision {safeScheduleBundle.schedule.revision.slice(0, 12)}…</span>
              </div>
            ) : <p className="class-import-help">Choose <code>lesson-planner-safe-schedule.json</code>. The complete file is validated before anything replaces the current browser-local schedule.</p>}
            <div className="class-import-actions">
              <button type="button" onClick={loadSummer2026LocalSchedule}>{safeScheduleBundle?.schedule.scheduleId === "summer_2026" ? "RELOAD SUMMER 2026 LOCAL COPY" : "LOAD SUMMER 2026 LOCAL COPY"}</button>
              {safeScheduleImportPreview?.result.ok ? <button type="button" onClick={applySafeScheduleImport}>{safeScheduleBundle ? "REPLACE LOCAL SCHEDULE COPY" : "APPLY FULL SCHEDULE"}</button> : null}
            </div>
            <p className="class-import-help">The included Summer 2026 copy is browser-local and advisory only. It retains the source&apos;s accepted-as-is status and unresolved review warnings; it never reserves equipment or changes the source vault.</p>
          </section>
        </section>
      ) : null}

      {planShelf === "PAST" ? (
        <section className="lesson-plan-shelf retro-window" aria-label="Past local lesson plans">
          <div className="window-title">PAST LESSON PLANS <button type="button" onClick={() => setPlanShelf(null)} aria-label="Close past lesson plans">×</button></div>
          <div className="lesson-plan-shelf-body">
            {pastLessonPlans.length ? pastLessonPlans.map((plan) => (
              <button key={plan.id} type="button" className="saved-lesson-plan" onClick={() => openLessonPlan(plan)}>
                <strong>{formatLessonPlanDate(plan.date)}</strong>
                <span>{plan.title} · VIEW READ-ONLY SNAPSHOT</span>
              </button>
            )) : <p>No earlier local lesson plans are saved in this browser yet.</p>}
          </div>
        </section>
      ) : null}

      {planShelf === "FUTURE" ? (
        <section className="lesson-plan-shelf retro-window" aria-label="Start a future local lesson plan">
          <div className="window-title">FUTURE LESSON PLAN <button type="button" onClick={() => setPlanShelf(null)} aria-label="Close future lesson plan">×</button></div>
          <form className="future-lesson-form" onSubmit={(event) => {
            event.preventDefault();
            const requestedDate = new FormData(event.currentTarget).get("future-lesson-date");
            createFutureLessonPlan(typeof requestedDate === "string" ? requestedDate : futurePlanDate);
          }}>
            <label>
              LESSON DATE
              <input name="future-lesson-date" type="date" min={nextLessonPlanDate(lessonToday)} value={futurePlanDate} onInput={(event) => setFuturePlanDate(event.currentTarget.value)} onChange={(event) => setFuturePlanDate(event.currentTarget.value)} />
            </label>
            <p>Starts with the lesson schedule template and empty drill placements. The lesson currently open stays unchanged.</p>
            <button type="submit">START BLANK FUTURE PLAN →</button>
          </form>
        </section>
      ) : null}

      <section className="identity-strip">
        <div>
          <p className="eyebrow">{activeLessonDateLabel}</p>
          <h1>LESSON PLANNER <span>•</span> {activeLocalClass?.name?.toUpperCase() ?? "LEVEL 3"} · {activeLocalClass ? "LOCAL CLASS" : "3:30–5:25 PM"}</h1>
        </div>
        <div className="readiness">
          <span className="pixel-label">READY STATE</span>
          <strong>{isPastActivePlan ? "PAST SNAPSHOT" : isReady ? "READY" : "DRAFT"}</strong>
          {mode === "EDIT" && !isPastActivePlan ? <button onClick={toggleReady}>{isReady ? "RETURN TO DRAFT" : "MARK READY →"}</button> : null}
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="schedule-column" aria-label="Schedule advisory and local lesson phases">
          <section className="retro-window schedule-advisory-window" aria-label="Local schedule advisory preview">
            <div className="window-title">SCHEDULE ADVISORY <span>LOCAL PLAN</span></div>
            <div className="schedule-advisory-body">
              <dl className="schedule-advisory-meta">
                <div><dt>DATE</dt><dd>{activeLessonDateLabel}</dd></div>
                <div><dt>GROUP</dt><dd>{activeScheduleGroup}</dd></div>
                <div><dt>ROSTER</dt><dd>{activeLocalClass ? `${activeLocalClass.students.length} LOCAL` : "SAMPLE"}</dd></div>
              </dl>

              <div className="schedule-advisory-guard">
                <b>{usesSafeScheduleDay
                  ? "FULL SAFE SCHEDULE"
                  : safeScheduleBundle && activeLocalClass && !linkedSafeScheduleGroup
                    ? "LINK AN EXACT SCHEDULE GROUP"
                    : safeScheduleBundle
                      ? "LOCAL SCHEDULE FALLBACK"
                      : activeLocalClass ? "LOCAL CLASS SCHEDULE" : "ADVISORY ONLY"}</b>
                <span>{usesSafeScheduleDay
                  ? "This group’s imported full schedule is active. Open availability checks every group, but nothing is added or reserved automatically."
                  : safeScheduleBundle && activeLocalClass && !linkedSafeScheduleGroup
                    ? "Open Local Classes and choose this class’s exact imported schedule group. Class names are never fuzzy-matched."
                    : activeLocalClass
                      ? "Local class blocks remain visible, but they cannot confirm which gym areas are free without a ready full-schedule link."
                      : "Create or select a local class to replace this sample schedule and roster."}</span>
              </div>

              {safeScheduleDay?.status === "manual_week_confirmation_required" ? (
                <section className="schedule-week-confirm" aria-label="Confirm Odd or Even schedule week">
                  <b>FIFTH SCHEDULE WEEK · CHOOSE ROTATION</b>
                  <span>The planner will not guess Odd or Even for {activeLessonDateLabel}.</span>
                  <div><button type="button" onClick={() => confirmSafeScheduleWeek("Odd")}>USE ODD</button><button type="button" onClick={() => confirmSafeScheduleWeek("Even")}>USE EVEN</button></div>
                </section>
              ) : null}

              {!activeLocalClass ? scheduleDayAdvisoryDemo.advisories.map((advisory) => (
                <p key={advisory} className="schedule-advisory-warning">⚠ {advisory}</p>
              )) : null}
              {safeScheduleBundle?.schedule.collisionWarnings.warningCount ? (
                <p className="schedule-advisory-warning">⚠ {safeScheduleBundle.schedule.collisionWarnings.warningCount} unresolved schedule collision warnings remain. Availability is advisory, not a reservation.</p>
              ) : null}

              <section className="schedule-advisory-section" aria-label="Local schedule blocks for the selected lesson date">
                <div className="schedule-advisory-section-title"><b>{usesSafeScheduleDay ? "FULL SCHEDULE BLOCKS" : activeLocalClass ? "LOCAL SCHEDULE BLOCKS" : "ADVISORY ROTATION BLOCKS"}</b><span>{activeScheduleBlockCount} BLOCKS</span></div>
                <div className="schedule-advisory-block-list">
                  {usesSafeScheduleDay ? safeScheduleDay.nonOpenBlocks.map((block) => (
                    <article key={block.bookingId} className="schedule-advisory-block">
                      <time>{formatScheduleRange(block.startMinute, block.endMinute)}</time>
                      <div>
                        <b>{block.eventLabel}</b>
                        <span>{block.equipment.join(" + ") || block.activityType}</span>
                      </div>
                    </article>
                  )) : activeLocalClass ? localScheduleBlocks.map((block) => (
                    <article key={block.id} className="schedule-advisory-block">
                      <time>{block.start}–{block.end}</time>
                      <div>
                        <b>{block.event}</b>
                        <span>{block.areas?.join(" + ") || "No area listed"}</span>
                      </div>
                    </article>
                  )) : scheduleDayAdvisoryDemo.rotationBlocks.map((block) => (
                    <article key={block.id} className="schedule-advisory-block">
                      <time>{formatScheduleRange(block.startMinute, block.endMinute)}</time>
                      <div>
                        <b>{block.eventLabel}</b>
                        <span>{block.equipment.join(" + ")}</span>
                      </div>
                    </article>
                  ))}
                </div>
                {usesSafeScheduleDay && !safeScheduleDay.nonOpenBlocks.length ? <p className="schedule-advisory-empty">Only scheduled Open blocks match this group and date.</p> : null}
                {!usesSafeScheduleDay && activeLocalClass && !localScheduleBlocks.length ? <p className="schedule-advisory-empty">No local blocks match this lesson’s date. The class schedule remains unchanged.</p> : null}
                {safeScheduleDay?.status === "outside_schedule_range" ? <p className="schedule-advisory-empty">This date is outside the imported full schedule range. Local class blocks remain the fallback.</p> : null}
                {safeScheduleDay?.status === "no_blocks_for_group" ? <p className="schedule-advisory-empty">The linked full-schedule group has no blocks on this date and rotation. Local class blocks remain the fallback.</p> : null}
              </section>

              <section className="schedule-advisory-section optional-openings" aria-label="Optional schedule openings">
                <div className="schedule-advisory-section-title"><b>SCHEDULED OPEN EVENTS</b><span>{usesSafeScheduleDay ? safeScheduleDay.openBlocks.length : 0} BLOCKS</span></div>
                {!safeScheduleBundle ? <p className="schedule-advisory-empty">Import the privacy-safe full gym schedule to calculate which approved areas are free.</p> : !activeLocalClass ? <p className="schedule-advisory-empty">Select a local class, then link its exact imported schedule group.</p> : !linkedSafeScheduleGroup ? <p className="schedule-advisory-empty">Open Local Classes and link this class to an exact full-schedule group.</p> : safeScheduleDay?.status === "manual_week_confirmation_required" ? <p className="schedule-advisory-empty">Confirm Odd or Even above before checking scheduled Open events.</p> : !usesSafeScheduleDay ? <p className="schedule-advisory-empty">No full-schedule availability can be confirmed for this group and date.</p> : !safeScheduleDay.openBlocks.length ? <p className="schedule-advisory-empty">NO SCHEDULED OPEN BLOCK FOR THIS GROUP/DATE.</p> : (
                  <div className="schedule-open-list">
                    {safeScheduleDay.openBlocks.map((block) => {
                      const availability = openAvailabilityByBookingId.get(block.bookingId);
                      const key = safeScheduleSelectionKey(safeScheduleBundle.schedule.revision, block.bookingId);
                      const selectedPanelIds = normalizeOpenPanelSelection(openAreaSelectionByKey[key] ?? [], availability?.availablePanelIds ?? []);
                      const availableZonesForBlock = openScheduleZones.filter((zone) => availability?.availablePanelIds.includes(zone.id));
                      const existingPhase = existingOpenPhaseForBlock(block);
                      return (
                        <details key={block.bookingId} className="schedule-open-card">
                          <summary className="schedule-open-heading"><span><time>{formatScheduleRange(block.startMinute, block.endMinute)}</time><b>OPEN</b></span><em>{availableZonesForBlock.length} AREAS</em></summary>
                          <p>{availableZonesForBlock.length} AVAILABLE ACCORDING TO MAPPED SCHEDULE</p>
                          {availability?.unmappedEquipment.length ? <div className="schedule-open-warning"><b>UNMAPPED SCHEDULE AREA</b><span>{availability.unmappedEquipment.join(" + ")} could not be guessed.</span></div> : null}
                          {!availableZonesForBlock.length ? <p className="schedule-advisory-empty">NO FULL-BLOCK AREA CONFIRMED.</p> : mode === "EDIT" && !isPastActivePlan && !existingPhase ? (
                            <>
                              <div className="open-area-options" aria-label={`Choose free areas for ${formatScheduleRange(block.startMinute, block.endMinute)}`}>
                                {availableZonesForBlock.map((zone) => {
                                  const selected = selectedPanelIds.includes(zone.id);
                                  const conflicts = !selected && !openPanelSelectionAllowed(selectedPanelIds, zone.id);
                                  return <button key={zone.id} type="button" className={selected ? "selected" : ""} aria-pressed={selected} disabled={conflicts} onClick={() => toggleOpenAreaSelection(block, zone.id)}><b>{zone.alias}</b><small>{selected ? "SELECTED" : conflicts ? "OVERLAPS CHOICE" : zone.title}</small></button>;
                                })}
                              </div>
                              <button type="button" className="open-add-action" disabled={!selectedPanelIds.length} onClick={() => addOpenEvent(block)}>ADD OPEN EVENT</button>
                            </>
                          ) : mode === "EDIT" && !isPastActivePlan && existingPhase ? <button type="button" className="open-add-action added" onClick={() => addOpenEvent(block)}>OPEN ADDED EVENT</button> : existingPhase ? <p className="schedule-advisory-empty">THIS OPEN EVENT IS ALREADY SAVED IN THE {isPastActivePlan ? "READ-ONLY SNAPSHOT" : "LESSON"}.</p> : <p className="schedule-advisory-empty">Open choices are read-only in View mode.</p>}
                        </details>
                      );
                    })}
                  </div>
                )}
                <p className="schedule-open-advisory">ADVISORY ONLY · AREAS ARE NOT RESERVED · NOTHING IS ADDED UNTIL YOU CHOOSE AREAS AND TAP ADD OPEN EVENT</p>
              </section>

              <p className="schedule-advisory-source">BROWSER-LOCAL SCHEDULE COPY · NO LIVE SCHEDULE, CALENDAR, AUTOMATION, OR SERVER CONNECTION</p>
            </div>
          </section>

          <section className="retro-window schedule-window">
            <div className="window-title schedule-phase-window-title"><b>YOUR LESSON PHASES</b><div><span>{isPastActivePlan ? "PAST SNAPSHOT · READ-ONLY" : "LOCAL DRAFT"}</span>{mode === "EDIT" && !isPastActivePlan ? <button type="button" onClick={() => { setIsEventEditorOpen(true); scrollToPlannerSection("lesson-plan"); }}>EDIT EVENTS →</button> : null}</div></div>
            <div className="window-body schedule-list">
              {lessonPhases.map((phase) => {
                const eventName = eventNameForPhase(phase);
                const phaseName = phase.title.trim();
                const phaseDetail = phaseName && phaseName.toLocaleLowerCase() !== eventName.toLocaleLowerCase()
                  ? `${phaseName} · `
                  : "";
                return (
                  <button
                    key={phase.id}
                    className={`phase-row ${activePhaseId === phase.id ? "selected" : ""}`}
                    onClick={() => setActivePhaseId(phase.id)}
                  >
                    <time>{displayLessonTimeRange(phase.time)}</time>
                    <span><b>{eventName}</b><small>{phaseDetail}{phase.mode} · {phase.mode === "TEXT" ? "text plan" : phase.zones.length ? phase.zones.map((zone) => zone.alias).join(" + ") : "choose stations"}</small></span>
                  </button>
                );
              })}
            </div>
            <div className="schedule-footer">
              <p>✦ Smart draft surfaced 4 useful ideas. It has not placed any for you.</p>
              <span className="tiny-static-note">PAST PLANS STAY SAVED IN THIS BROWSER</span>
            </div>
          </section>
        </aside>

        <section id="lesson-plan" className="lesson-area">
          {mode === "VIEW" ? <LegacyLessonDocument phases={lessonPhases} attendanceById={attendanceById} attendanceRoster={attendanceRoster} tasks={operationTasks} taskIsDone={operationTaskIsDone} className={activeLocalClass?.name ?? "Level 3"} dateLabel={activeLessonDateLabel} dateIso={activeLessonPlan.date} isCurrentPlan={!isPastActivePlan && activeLessonPlan.date === lessonToday} onSetAttendanceStatus={setAttendanceStatus} onSetTaskDone={setOperationTaskDone} /> : null}
          {mode === "VIEW" && isAddingIdea ? <section className="view-idea-capture" aria-label="Quickly save a new idea while viewing class">{newIdeaForm}</section> : null}
          <div className={`phase-editor-workspace ${mode === "EDIT" ? "editing" : ""}`}>
            <div className="phase-editor-plan">
          {mode === "EDIT" && isEventEditorOpen ? (
            <EventEditor
              events={eventEditorGroups}
              activePhaseId={activePhaseId}
              issues={eventTimingIssues}
              searchingEventId={openStationSearchEventId}
              openStationResults={openStationSearch.stations}
              openStationWarning={openStationSearch.warning}
              canSearchOpenStations={Boolean(usesSafeScheduleDay && linkedSafeScheduleGroup)}
              onClose={() => { setIsEventEditorOpen(false); setOpenStationSearchEventId(null); }}
              onUpdateEvent={updateEventLabelById}
              onUpdatePhaseTitle={(phaseId, value) => updatePhaseDetailsById(phaseId, "title", value)}
              onUpdatePhaseStart={updateEventPhaseStartById}
              onSetPendingEventStart={setPendingEventStart}
              onOpenPhase={(phaseId) => {
                setActivePhaseId(phaseId);
                setIsEventEditorOpen(false);
                setOpenStationSearchEventId(null);
                setNotice("EVENT PHASE OPENED · EDIT ITS STATIONS, CUES, AND VISUAL PLAN");
              }}
              onAddPhase={(eventId) => insertPhase("CONTINUE", eventId)}
              onDeletePhase={deletePhaseById}
              onMoveEvent={moveEventById}
              onRepairTimes={repairAllEventTimes}
              onAddEventBetween={addEventBetween}
              onSearchOpenStations={searchOpenStationsForEvent}
              onAddOpenStation={addOpenStationToEvent}
            />
          ) : null}
          {!isEventEditorOpen ? <>
          <div className="phase-header">
            <div><span className="pixel-label">{eventNameForPhase(activePhase)} · CURRENT PHASE</span><h2>{activePhase.title}</h2></div>
            <div className="phase-tools">
              <span>{displayLessonTimeRange(activePhase.time)}</span>
              {mode === "EDIT" ? <>
                <button aria-pressed={isTimerRunning} onClick={togglePhaseTimer}>{isTimerRunning ? "⏸" : "⏱"} {formatCountdown(timerSeconds)}</button>
                <button onClick={resetPhaseTimer} aria-label="Reset phase timer">↺</button>
              </> : <span>⏱ {formatCountdown(timerSeconds)}</span>}
            </div>
          </div>

          {mode === "EDIT" ? (
            <section className="phase-structure retro-window" aria-label="Local demo phase structure editor">
              <div className="window-title">PHASE STRUCTURE <span>LOCAL DEMO ONLY</span></div>
              <div className="phase-structure-body">
                <div className="phase-detail-fields phase-only">
                  <label>PHASE NAME
                    <input
                      value={activePhase.title}
                      onChange={(event) => updatePhaseDetails("title", event.target.value)}
                      maxLength={80}
                      aria-label="Phase name"
                    />
                  </label>
                  <EventPhaseTimePicker
                    phases={activeEventPhases}
                    phaseId={activePhase.id}
                    label={activePhase.title}
                    onStartChange={(value) => updateEventPhaseStartById(activePhase.id, value)}
                  />
                </div>

                <div className="phase-format-picker" role="group" aria-label="Phase display format">
                  <b>DISPLAY FORMAT</b>
                  {(["TEXT", "MIXED", "VISUAL"] as const).map((format) => (
                    <button
                      key={format}
                      className={activePhase.mode === format ? "selected" : ""}
                      aria-pressed={activePhase.mode === format}
                      onClick={() => setActivePhaseFormat(format)}
                    >
                      {format}
                    </button>
                  ))}
                  <span>TEXT hides boards · VISUAL hides cues · MIXED shows both</span>
                </div>

                {activePhase.mode !== "TEXT" ? (
                  <div className="visual-label-tool">
                    <div>
                      <b>SHORT VISUAL LABEL</b>
                      <span>Make a small label, then tap an empty highlighted anchor in one selected station.</span>
                    </div>
                    <input
                      value={visualLabelDraft}
                      onChange={(event) => setVisualLabelDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          placeVisualLabel();
                        }
                      }}
                      maxLength={56}
                      placeholder="e.g. 3 clean cast shapes"
                      aria-label="Short visual station label"
                    />
                    <button onClick={placeVisualLabel}>PLACE LABEL →</button>
                  </div>
                ) : null}

                <div className="zone-picker">
                  <div className="zone-picker-copy">
                    <b>PHOTO AREAS FOR THIS PHASE</b>
                    <span>Choose only from areas you created. Selecting a photo area never places an idea by itself.</span>
                  </div>
                  <div className="zone-picker-buttons" aria-label="Select your photo areas for this phase">
                    {availableZones.map((zone) => {
                      const selected = activePhase.zones.some((candidate) => candidate.id === zone.id);
                      const parked = activePhase.parkedZones?.some((candidate) => candidate.id === zone.id);
                      return (
                        <button
                          key={zone.id}
                          className={`${selected ? "selected" : ""} ${parked ? "parked" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleZoneForActivePhase(zone.id)}
                        >
                          <b>{zone.alias}</b>
                          <small>{zone.title} · {selected ? "ON THIS PHASE" : parked ? "RESTORE / EDIT" : "OPEN / EDIT PHOTO AREA"}</small>
                        </button>
                      );
                    })}
                  </div>
                  {mode === "EDIT" ? (
                    <div className={`photo-area-picker ${customBoards.length ? "" : "empty"}`}>
                      <div>
                        <b>{customBoards.length ? "YOUR PHOTO AREAS" : "NO PHOTO AREAS YET"}</b>
                        <span>{customBoards.length
                          ? "Private to this browser/device. Every saved photo area stays available above until you remove it."
                          : "Add your first gym-area photo, then mark its station spots and use it in this lesson."}</span>
                      </div>
                      <div className="photo-area-actions">
                        <button type="button" onClick={() => setIsAddingCustomBoard((open) => !open)}>
                          {isAddingCustomBoard ? "CLOSE PHOTO AREA" : "+ PHOTO AREA"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {mode === "EDIT" && hiddenAreaEntries.length ? (
                    <div className="hidden-area-picker" aria-label="Restore locally removed station areas">
                      <div><b>REMOVED EVENTS</b><span>These stay saved locally. Restore one whenever you want it back in your station choices.</span></div>
                      <div className="hidden-area-actions">
                        {hiddenAreaEntries.map(({ target, zone }) => (
                          <button key={`${target.kind}-${target.id}`} type="button" onClick={() => restoreArea(target, zone)}>RESTORE {zone.alias}</button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {isAddingCustomBoard ? (
                    <form className="new-photo-area-form" onSubmit={(event) => { event.preventDefault(); void saveNewCustomBoard(); }}>
                      <b>NEW PHOTO AREA</b>
                      <label>AREA NAME<input value={newCustomBoardTitle} onChange={(event) => setNewCustomBoardTitle(event.target.value)} maxLength={80} placeholder="e.g. North low bars" autoFocus /></label>
                      <label>EVENT NAME <small>short label shown on the plan</small><input value={newCustomBoardEventName} onChange={(event) => setNewCustomBoardEventName(event.target.value)} maxLength={48} placeholder="e.g. Bars" /></label>
                      <label>AREA PHOTO<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setNewCustomBoardFile(event.target.files?.[0] ?? null)} /></label>
                      <small>Saved only in this browser on this device. The original photo is kept uncropped.</small>
                      <div><button type="button" onClick={() => setIsAddingCustomBoard(false)}>CANCEL</button><button type="submit">SAVE PHOTO AREA</button></div>
                    </form>
                  ) : null}
                  {activePhase.mode === "TEXT" && activePhase.zones.length ? (
                    <p className="phase-structure-hint">{activePhase.zones.length} selected panel{activePhase.zones.length === 1 ? " is" : "s are"} safely hidden while this phase is TEXT.</p>
                  ) : null}
                </div>

                <div className="phase-structure-actions">
                  <button onClick={() => insertPhase("CONTINUE")}>+ PHASE IN THIS EVENT</button>
                  <button className="transition-phase" onClick={() => { setIsEventEditorOpen(true); setNotice("USE + NEW EVENT HERE TO SPLIT A PRECEDING EVENT WITHOUT MANUAL TIME MATH"); }}>+ NEW EVENT</button>
                  {activePhase.isRequired ? (
                    <span>CORE DEMO PHASE · PROTECTED</span>
                  ) : (
                    <button className="delete-phase" onClick={deleteActivePhase}>DELETE THIS PHASE</button>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {shouldShowTextLane ? (
            <section className="text-lane retro-window">
              <div className="window-title">TEXT / COACHING CUES <span>{activePhase.mode}</span></div>
              {isActivePhasePlacementMode && pendingZonePlacement && placementAllowsText ? (
                <button
                  className="text-placement-target"
                  onClick={() => placeSnapshot(pendingZonePlacement.card, activePhase.id)}
                >
                  PLACE “{pendingZonePlacement.card.title}” IN THIS TEXT PLAN
                </button>
              ) : null}
              {activePhase.text.length ? (
                <ol>
                  {activePhase.text.map((item, index) => (
                    <li key={index}>
                      {mode === "EDIT" ? (
                        <span className="text-plan-editor"><input value={item} onChange={(event) => updateTextPlanItem(index, event.target.value)} aria-label={`Text plan item ${index + 1}`} /><button onClick={() => removeTextPlanItem(index)}>×</button></span>
                      ) : item}
                    </li>
                  ))}
                </ol>
              ) : null}
              {activePhase.textCards?.length ? (
                <div className="text-card-stack" aria-label="Lesson cards in this text lane">
                  {activePhase.textCards.map((card) => <Card key={card.id} card={card} onRemove={mode === "EDIT" && card.lessonLocal ? () => removeSnapshot(card.id) : undefined} />)}
                </div>
              ) : null}
              {!activePhase.text.length && !activePhase.textCards?.length && !isActivePhasePlacementMode ? <p className="text-lane-empty">Use this space for a simple written plan, or select an idea from the shelf.</p> : null}
              {mode === "EDIT" ? <div className="text-lane-actions"><button onClick={addTextPlanItem}>+ TEXT PLAN ITEM</button></div> : null}
            </section>
          ) : null}

          {activePhase.mode !== "TEXT" && visibleZones.length ? (
            <section className="zone-board" aria-label="Selected gym zones">
              <div className="zone-board-caption">ONLY THESE STATIONS ARE IN THIS PHASE {isActivePhasePlacementMode ? <span>CHOOSE A BLINKING EMPTY ANCHOR</span> : null}</div>
              <div className={`zone-grid ${visibleZones.length > 2 ? "zones-many" : `zones-${visibleZones.length}`}`}>
                {visibleZones.map((zone) => {
                  const customBoard = zone.customBoardId ? renderingCustomBoardById.get(zone.customBoardId) : undefined;
                  const customPhotoUrl = customBoard ? customBoardPhotoUrls[customBoard.photoId] : undefined;
                  const customPhotoPanel = customBoard ? customBoardPhotoPanelLayout(customBoard) : null;
                  const layout = customBoard ? null : gymPanelLayout(zone.id);
                  const builtInStationSpots = layout ? effectiveBuiltInStationSpots(zone, layout) : undefined;
                  const hasBuiltInStationEditor = Boolean(layout && !customBoard);
                  const boardTool = customBoard
                    ? customBoardTool(customBoard.id)
                    : layout ? builtInBoardTool(zone.id) : "none";
                  const usesFreeformGeometry = Boolean(layout?.usesFreeformGeometry);
                  const referenceBoard = layout?.referenceBoard;
                  const hasStationArt = Boolean(customBoard || referenceBoard || usesFreeformGeometry);
                  const placedAnchors = resolveVisualAnchors(zone, visualAnchorByCardId, customBoard, builtInStationSpots);
                  const compatibleAnchors = isActivePhasePlacementMode && pendingZonePlacement
                    ? compatibleVisualAnchors(zone, visualAnchorByCardId, customBoard, builtInStationSpots)
                    : [];
                  const isPlacementTarget = compatibleAnchors.length > 0;
                  const placedAnchorPlacements = placedAnchors.map(({ id, card }) => {
                    const anchor = layout ? anchorForPanel(zone.id, id) : null;
                    const customSpot = customBoard?.spots.find((candidate) => candidate.id === id);
                    const builtInSpot = builtInStationSpots?.find((candidate) => candidate.id === id);
                    return { id, card, anchor, customSpot, builtInSpot };
                  });
                  const emptyAnchorPlacements = compatibleAnchors.map((id) => ({
                    id,
                    anchor: layout ? anchorForPanel(zone.id, id) : null,
                    customSpot: customBoard?.spots.find((candidate) => candidate.id === id),
                    builtInSpot: builtInStationSpots?.find((candidate) => candidate.id === id),
                  }));
                  const builtInManualPlacements = !customBoard
                    ? placedAnchorPlacements.filter(({ card, builtInSpot }) => (
                      Boolean(builtInSpot) && (Boolean(visualLabelLayoutByCardId[card.id]) || builtInSpotHasCoordinateOverride(zone.id, builtInSpot!))
                    ))
                    : [];
                  const builtInRenderedLabelLayouts = layout && builtInStationSpots
                    ? resolvedBuiltInLabelLayoutsForZone(zone, layout, builtInStationSpots)
                    : visualLabelLayoutByCardId;
                  const boardCallouts = layout && builtInStationSpots
                    ? automaticBuiltInCalloutsForZone(zone, layout, builtInStationSpots, builtInRenderedLabelLayouts)
                    : {};
                  const builtInAutomaticPlacements = !customBoard
                    ? placedAnchorPlacements.filter(({ card, builtInSpot }) => (
                      Boolean(builtInSpot) && !visualLabelLayoutByCardId[card.id] && !builtInSpotHasCoordinateOverride(zone.id, builtInSpot!)
                    ))
                    : [];
                  const hasManualExternalCallouts = !customBoard && builtInManualPlacements.some(({ card, builtInSpot }) => {
                    if (!builtInSpot) return false;
                    const size = customLabelSize(shortAnchorLabel(card.title));
                    const labelLayout = boundedBuiltInLabelLayout(
                      builtInLabelLayoutFor(card.id, builtInSpot, builtInRenderedLabelLayouts),
                      size,
                    );
                    if (labelLayout.placement !== "callout") return false;
                    const box = customLabelGeometry(card.id, builtInSpot, labelLayout, size.width, size.height).box;
                    return box.left < 0 || box.top < 0 || box.left + box.width > 1 || box.top + box.height > 1;
                  });
                  const hasExternalCallouts = Object.values(boardCallouts).some((callout) => callout.usesExternalLane)
                    || hasManualExternalCallouts;
                  const stationAnchorStyle = (
                    anchor: ReturnType<typeof anchorForPanel>,
                    customSpot?: CustomStationSpot,
                    builtInSpot?: EffectiveStationBoardSpot,
                  ) => {
                    if (customSpot) {
                      const point = customBoardCanvasPoint(customSpot);
                      return { left: `${point.x * 100}%`, top: `${point.y * 100}%` };
                    }
                    if (builtInSpot) return { left: `${builtInSpot.x * 100}%`, top: `${builtInSpot.y * 100}%` };
                    if (!anchor || !layout) return undefined;
                    return referenceBoard
                      ? stationBoardAnchorStyle(anchor, layout.viewport, referenceBoard)
                      : anchorStyleForViewport(anchor, layout.viewport);
                  };
                  const stationAnchorLayer = customBoard ? <>
                    {placedAnchorPlacements.map(({ id, card, customSpot }) => {
                      if (!customSpot) return null;
                      const label = shortAnchorLabel(card.title);
                      const size = customLabelSize(label);
                      const labelLayout = boundedCustomLabelLayout(customLabelLayoutFor(card.id, customSpot), size);
                      const geometry = customLabelGeometry(card.id, customSpot, labelLayout, size.width, size.height);
                      const leader = visualLabelLeaderPath(geometry).map((point) => customBoardCanvasPoint(point));
                      const labelPoint = customBoardCanvasPoint(labelLayout);
                      const isSelected = selectedCustomLabelByBoardId[customBoard.id] === card.id;
                      return (
                        <Fragment key={card.id}>
                          {leader.length ? (
                            <svg className="custom-board-leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                              <polyline points={pointsAttribute(leader)} fill="none" />
                              <circle cx={customBoardCanvasPoint(customSpot).x * 100} cy={customBoardCanvasPoint(customSpot).y * 100} r="1.05" />
                            </svg>
                          ) : null}
                          <button
                            type="button"
                            className={`visual-anchor placed-anchor custom-placed-anchor ${labelLayout.placement === "callout" ? "custom-callout-label" : ""} ${isSelected ? "selected-custom-label" : ""}`}
                            data-anchor-id={id}
                            style={{
                              left: `${labelPoint.x * 100}%`,
                              top: `${labelPoint.y * 100}%`,
                              width: `${size.width * CUSTOM_PHOTO_FRAME.width}%`,
                              minHeight: `${size.height * CUSTOM_PHOTO_FRAME.height}%`,
                            }}
                            title={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            aria-label={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            onPointerDown={(event) => beginCustomLabelDrag(event, customBoard, zone, card.id)}
                            onClick={() => {
                              if (boardTool === "labels") {
                                setSelectedCustomLabelByBoardId((current) => ({ ...current, [customBoard.id]: card.id }));
                              } else {
                                setDetailCard(card);
                              }
                            }}
                          >
                            {label}
                          </button>
                        </Fragment>
                      );
                    })}
                    {isPlacementTarget && pendingZonePlacement ? emptyAnchorPlacements.map(({ id: anchorId, anchor: emptyAnchor, customSpot }) => customSpot ? (
                      <button
                        key={anchorId}
                        type="button"
                        className="visual-anchor empty-anchor exact-placement-anchor custom-empty-anchor"
                        data-anchor-id={anchorId}
                        style={stationAnchorStyle(emptyAnchor, customSpot)}
                        aria-label={`Place ${pendingZonePlacement.card.title} at ${customSpot.name}`}
                        onClick={() => placePendingSnapshot(zone.id, anchorId)}
                      >
                        <span>＋</span>
                      </button>
                    ) : null) : null}
                    {boardTool === "spots" ? customBoard.spots.map((spot) => (
                      <button
                        key={spot.id}
                        type="button"
                        className={`custom-station-spot ${selectedCustomSpotByBoardId[customBoard.id] === spot.id ? "selected" : ""}`}
                        style={stationAnchorStyle(null, spot)}
                        aria-label={`Edit station spot ${spot.name}`}
                        onPointerDown={(event) => beginCustomSpotDrag(event, customBoard.id, spot.id)}
                      >
                        <span>+</span>
                      </button>
                    )) : null}
                  </> : <>
                    {builtInManualPlacements.map(({ id, card, builtInSpot }) => {
                      if (!builtInSpot) return null;
                      const label = shortAnchorLabel(card.title);
                      const size = customLabelSize(label);
                      const labelLayout = boundedBuiltInLabelLayout(
                        builtInLabelLayoutFor(card.id, builtInSpot, builtInRenderedLabelLayouts),
                        size,
                      );
                      const geometry = customLabelGeometry(card.id, builtInSpot, labelLayout, size.width, size.height);
                      const leader = visualLabelLeaderPath(geometry);
                      const isSelected = selectedBuiltInLabelByZoneId[zone.id] === card.id;
                      return (
                        <Fragment key={card.id}>
                          {leader.length ? (
                            <svg className="built-in-board-leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                              <polyline points={pointsAttribute(leader)} fill="none" />
                              <circle cx={builtInSpot.x * 100} cy={builtInSpot.y * 100} r="1.05" />
                            </svg>
                          ) : null}
                          <button
                            type="button"
                            className={`visual-anchor placed-anchor built-in-manual-label ${labelLayout.placement === "callout" ? "station-callout-label" : ""} ${isSelected ? "selected-built-in-label" : ""}`}
                            data-anchor-id={id}
                            style={{
                              left: `${labelLayout.x * 100}%`,
                              top: `${labelLayout.y * 100}%`,
                              width: `${size.width * 100}%`,
                              minHeight: `${size.height * 100}%`,
                            }}
                            title={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            aria-label={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            onPointerDown={(event) => beginBuiltInLabelDrag(event, zone, card.id)}
                            onClick={() => {
                              if (boardTool === "labels") {
                                setSelectedBuiltInLabelByZoneId((current) => ({ ...current, [zone.id]: card.id }));
                              } else {
                                setDetailCard(card);
                              }
                            }}
                          >
                            {label}
                          </button>
                        </Fragment>
                      );
                    })}
                    {builtInAutomaticPlacements.map(({ id, card, anchor: placedAnchor, builtInSpot }) => {
                      const callout = boardCallouts[`placed:${id}`];
                      const markerId = `callout-${zone.id}-${id}`.replace(/[^a-z0-9_-]/gi, "-");
                      const style = callout?.style ?? stationAnchorStyle(placedAnchor, undefined, builtInSpot);
                      const isSelected = selectedBuiltInLabelByZoneId[zone.id] === card.id;
                      return (
                        <Fragment key={card.id}>
                          {callout ? (
                            <svg className="station-callout-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                              <defs>
                                <marker id={markerId} markerWidth="4" markerHeight="4" refX="3.25" refY="2" orient="auto">
                                  <path d="M 0 0 L 4 2 L 0 4 z" fill="#000080" />
                                </marker>
                              </defs>
                              <polyline
                                points={callout.path}
                                fill="none"
                                markerEnd={`url(#${markerId})`}
                              />
                              <circle cx={callout.targetLeft} cy={callout.targetTop} r="1.15" />
                            </svg>
                          ) : null}
                          <button
                            type="button"
                            className={`visual-anchor visual-anchor-${id} placed-anchor${callout ? " station-callout-label" : ""} ${isSelected ? "selected-built-in-label" : ""}`}
                            data-anchor-id={id}
                            style={style}
                            title={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            aria-label={boardTool === "labels" ? `Move ${card.title}` : `Open details for ${card.title}`}
                            onPointerDown={(event) => beginBuiltInLabelDrag(event, zone, card.id)}
                            onClick={() => {
                              if (boardTool === "labels") {
                                setSelectedBuiltInLabelByZoneId((current) => ({ ...current, [zone.id]: card.id }));
                              } else {
                                setDetailCard(card);
                              }
                            }}
                          >
                            {shortAnchorLabel(card.title)}
                          </button>
                        </Fragment>
                      );
                    })}
                    {isPlacementTarget && pendingZonePlacement ? emptyAnchorPlacements.map(({ id: anchorId, anchor: emptyAnchor, builtInSpot }) => (
                      <button
                        key={anchorId}
                        type="button"
                        className={`visual-anchor visual-anchor-${anchorId} empty-anchor exact-placement-anchor built-in-empty-anchor`}
                        data-anchor-id={anchorId}
                        style={stationAnchorStyle(emptyAnchor, undefined, builtInSpot)}
                        aria-label={`Place ${pendingZonePlacement.card.title} at ${builtInSpot?.name ?? zone.title} station spot`}
                        onClick={() => placePendingSnapshot(zone.id, anchorId)}
                      >
                        <span>＋</span>
                      </button>
                    )) : null}
                    {hasBuiltInStationEditor && boardTool === "spots" ? builtInStationSpots?.map((spot) => (
                      <button
                        key={spot.id}
                        type="button"
                        className={`built-in-station-spot ${selectedBuiltInSpotByZoneId[zone.id] === spot.id ? "selected" : ""}`}
                        style={stationAnchorStyle(null, undefined, spot)}
                        aria-label={`Edit station spot ${spot.name}`}
                        onPointerDown={(event) => beginBuiltInSpotDrag(event, zone.id, spot.id)}
                      >
                        <span>+</span>
                      </button>
                    )) : null}
                  </>;
                  const selectedCustomSpot = customBoard
                    ? customBoard.spots.find((spot) => spot.id === selectedCustomSpotByBoardId[customBoard.id])
                    : undefined;
                  const selectedCustomLabel = customBoard
                    ? placedAnchorPlacements.find(({ card }) => card.id === selectedCustomLabelByBoardId[customBoard.id])
                    : undefined;
                  const selectedCustomLabelSpot = selectedCustomLabel?.customSpot;
                  const selectedCustomLabelLayout = customBoard && selectedCustomLabel && selectedCustomLabelSpot
                    ? customLabelLayoutFor(selectedCustomLabel.card.id, selectedCustomLabelSpot)
                    : undefined;
                  const selectedBuiltInSpot = builtInStationSpots?.find((spot) => spot.id === selectedBuiltInSpotByZoneId[zone.id]);
                  const selectedBuiltInLabel = builtInStationSpots
                    ? placedAnchorPlacements.find(({ card }) => card.id === selectedBuiltInLabelByZoneId[zone.id])
                    : undefined;
                  const selectedBuiltInLabelSpot = selectedBuiltInLabel?.builtInSpot;
                  const selectedBuiltInLabelLayout = selectedBuiltInLabel && selectedBuiltInLabelSpot
                    ? builtInLabelLayoutFor(selectedBuiltInLabel.card.id, selectedBuiltInLabelSpot, builtInRenderedLabelLayouts)
                    : undefined;
                  return (
                    <section
                      key={zone.id}
                      className={`station-panel ${isPlacementTarget ? "station-placement-zone" : ""} ${customBoard ? "custom-board-panel" : ""} ${customPhotoPanel?.shouldSpanRow ? "custom-board-panel-expanded" : ""} ${customPhotoPanel?.isWide ? "custom-board-panel-wide" : ""} ${hasBuiltInStationEditor ? "built-in-board-panel" : ""}`}
                      data-zone-id={zone.id}
                      style={customPhotoPanel ? {
                        "--custom-board-presentation-scale": customPhotoPanel.scale,
                      } as React.CSSProperties : undefined}
                    >
                      {customBoard && mode === "EDIT" ? (
                        <div className="custom-board-toolbar" aria-label={`Tools for ${customBoard.title}`}>
                          <b className="area-tools-heading">AREA TOOLS</b>
                          <button
                            type="button"
                            className={boardTool === "spots" ? "selected" : ""}
                            aria-pressed={boardTool === "spots"}
                            onClick={() => setCustomBoardTool(customBoard.id, "spots")}
                          >
                            {boardTool === "spots" ? "DONE SPOTS" : "EDIT SPOTS"}
                          </button>
                          <button
                            type="button"
                            className={boardTool === "labels" ? "selected" : ""}
                            aria-pressed={boardTool === "labels"}
                            onClick={() => setCustomBoardTool(customBoard.id, "labels")}
                            disabled={!placedAnchorPlacements.length}
                          >
                            {boardTool === "labels" ? "DONE LABELS" : "ARRANGE LABELS"}
                          </button>
                          <button
                            type="button"
                            className={boardTool === "resize" ? "selected" : ""}
                            aria-pressed={boardTool === "resize"}
                            onClick={() => setCustomBoardTool(customBoard.id, "resize")}
                          >
                            {boardTool === "resize" ? "DONE RESIZE" : "RESIZE IMAGE"}
                          </button>
                          <button
                            type="button"
                            className={isEditingArea({ kind: "custom", id: customBoard.id }) ? "selected" : ""}
                            aria-expanded={isEditingArea({ kind: "custom", id: customBoard.id })}
                            onClick={() => startEditingCustomBoard(customBoard)}
                          >
                            EDIT EVENT
                          </button>
                          <span>{boardTool === "spots" ? "Tap photo to add · drag a spot to move it" : boardTool === "labels" ? "Drag a label; clear routes stay separate" : boardTool === "resize" ? "Use − and + to resize the whole photo panel; station markers and labels stay aligned." : "Station spots can be revised anytime"}</span>
                          {boardTool === "resize" ? <div className="custom-board-resize" aria-label={`Resize ${customBoard.title} panel`}><b>PANEL SIZE {Math.round(customBoardPhotoScale(customBoard) * 100)}%</b><button type="button" onClick={() => adjustCustomBoardPhotoScale(customBoard, "smaller")} disabled={customBoardPhotoScale(customBoard) <= 0.5}>−</button><button type="button" onClick={() => adjustCustomBoardPhotoScale(customBoard, "larger")} disabled={customBoardPhotoScale(customBoard) >= 2}>+</button></div> : null}
                          {isEditingArea({ kind: "custom", id: customBoard.id }) ? (
                            <div className="area-event-editor">
                              <label>AREA NAME<input value={areaTitleDraft} onChange={(event) => setAreaTitleDraft(event.target.value)} maxLength={80} placeholder={customBoard.title} autoFocus /></label>
                              <label>EVENT LABEL<input value={areaAliasDraft} onChange={(event) => setAreaAliasDraft(event.target.value)} maxLength={48} placeholder="e.g. Bars" /></label>
                              <small>Event label is the short heading above this photo. Leave it blank to use the area name.</small>
                              <button type="button" onClick={cancelEditingArea}>CANCEL</button>
                              <button type="button" className="custom-board-save-event" onClick={() => saveCustomBoardDetails(customBoard)}>SAVE EVENT</button>
                              <button type="button" className="custom-board-replace-event" onClick={() => startReplacingCustomBoardPhoto(customBoard, true)}>REPLACE IMAGE</button>
                              <button type="button" className="area-remove-trigger" onClick={() => startRemovingArea({ kind: "custom", id: customBoard.id }, true)}>REMOVE EVENT</button>
                              {replacingCustomBoardId === customBoard.id ? (
                                <div className="custom-board-image-replace">
                                  <label>NEW AREA PHOTO<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setReplacementCustomBoardFile(event.target.files?.[0] ?? null)} /></label>
                                  <small>{replacementCustomBoardFile ? replacementCustomBoardFile.name : "Choose a JPEG, PNG, WEBP, HEIC, or HEIF photo under 35 MB."} Station spots and lesson labels stay attached; review their positions after saving.</small>
                                  <button type="button" onClick={cancelReplacingCustomBoardPhoto}>CANCEL</button>
                                  <button type="button" className="custom-board-save-image" onClick={() => void replaceCustomBoardPhoto(customBoard)}>SAVE REPLACEMENT</button>
                                </div>
                              ) : null}
                              {isRemovingArea({ kind: "custom", id: customBoard.id }) ? (
                                <div className="area-remove-confirm">
                                  <b>REMOVE {customBoardEventLabel(customBoard).toUpperCase()}?</b>
                                  <small>This permanently removes this editable photo area, its live station spots, and its labels. Saved past lesson snapshots stay protected.</small>
                                  <button type="button" onClick={cancelRemovingArea}>KEEP EVENT</button>
                                  <button type="button" className="area-remove-confirm-button" onClick={() => void confirmRemoveArea({ kind: "custom", id: customBoard.id }, zone)}>REMOVE EVENT NOW</button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {!customBoard && mode === "EDIT" ? (
                        <div className="custom-board-toolbar built-in-board-toolbar" aria-label={`Tools for ${zone.title}`}>
                          <b className="area-tools-heading">AREA TOOLS</b>
                          {hasBuiltInStationEditor ? <>
                            <button
                              type="button"
                              className={boardTool === "spots" ? "selected" : ""}
                              aria-pressed={boardTool === "spots"}
                              onClick={() => setBuiltInBoardTool(zone.id, "spots")}
                            >
                              {boardTool === "spots" ? "DONE SPOTS" : "EDIT SPOTS"}
                            </button>
                            <button
                              type="button"
                              className={boardTool === "labels" ? "selected" : ""}
                              aria-pressed={boardTool === "labels"}
                              onClick={() => setBuiltInBoardTool(zone.id, "labels")}
                              disabled={!placedAnchorPlacements.length}
                            >
                              {boardTool === "labels" ? "DONE LABELS" : "ARRANGE LABELS"}
                            </button>
                          </> : null}
                          <button
                            type="button"
                            className={isEditingArea({ kind: "built-in", id: zone.id }) ? "selected" : ""}
                            aria-expanded={isEditingArea({ kind: "built-in", id: zone.id })}
                            onClick={() => startEditingBuiltInArea(zone)}
                          >
                            EDIT EVENT
                          </button>
                          <span>{hasBuiltInStationEditor && boardTool === "spots" ? "Tap the supplied image to add · drag a spot to move it" : hasBuiltInStationEditor && boardTool === "labels" ? "Tap or drag a label; clear routes stay separate" : hasBuiltInStationEditor ? "Edit names or spots here; supplied image stays untouched" : "Edit this local event's names and safety note; source data stays untouched"}</span>
                          {isEditingArea({ kind: "built-in", id: zone.id }) ? (
                            <div className="area-event-editor">
                              <label>AREA NAME<input value={areaTitleDraft} onChange={(event) => setAreaTitleDraft(event.target.value)} maxLength={80} placeholder={zone.title} autoFocus /></label>
                              <label>EVENT LABEL<input value={areaAliasDraft} onChange={(event) => setAreaAliasDraft(event.target.value)} maxLength={48} placeholder={zone.alias} /></label>
                              <label className="wide">SETUP / SAFETY NOTE<textarea value={areaNoteDraft} onChange={(event) => setAreaNoteDraft(event.target.value)} maxLength={320} placeholder={zone.note} /></label>
                              <small>These are your local labels and notes. The supplied board image and source contract remain intact.</small>
                              <button type="button" onClick={cancelEditingArea}>CANCEL</button>
                              <button type="button" className="custom-board-save-event" onClick={() => saveBuiltInAreaDetails(zone)}>SAVE EVENT</button>
                              <button type="button" className="area-remove-trigger" onClick={() => startRemovingArea({ kind: "built-in", id: zone.id }, true)}>REMOVE EVENT</button>
                              {isRemovingArea({ kind: "built-in", id: zone.id }) ? (
                                <div className="area-remove-confirm">
                                  <b>REMOVE {zone.alias.toUpperCase()}?</b>
                                  <small>This hides the supplied area from new station choices. Its source image and saved past plans stay intact.</small>
                                  <button type="button" onClick={cancelRemovingArea}>KEEP EVENT</button>
                                  <button type="button" className="area-remove-confirm-button" onClick={() => void confirmRemoveArea({ kind: "built-in", id: zone.id }, zone)}>REMOVE EVENT NOW</button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {customBoard && mode === "EDIT" && boardTool === "spots" ? (
                        <div className="custom-spot-editor">
                          <b>STATION SPOTS</b>
                          {selectedCustomSpot ? <>
                            <label>NAME<input value={selectedCustomSpot.name} onChange={(event) => updateCustomBoard(customBoard.id, (current) => updateCustomStationSpot(current, selectedCustomSpot.id, { name: event.target.value }, new Date().toISOString()))} maxLength={48} /></label>
                            <button type="button" onClick={() => removeCustomStationSpotFromBoard(customBoard, selectedCustomSpot.id)}>REMOVE THIS SPOT</button>
                          </> : <span>Tap the photo to add a spot, then tap/drag that marker to rename, move, or remove it.</span>}
                        </div>
                      ) : null}
                      {hasBuiltInStationEditor && mode === "EDIT" && boardTool === "spots" ? (
                        <div className="custom-spot-editor built-in-spot-editor">
                          <b>STATION SPOTS</b>
                          {selectedBuiltInSpot ? <>
                            <label>NAME<input value={selectedBuiltInSpot.name} onChange={(event) => updateBuiltInSpot(zone.id, selectedBuiltInSpot, { name: event.target.value })} maxLength={80} /></label>
                            {selectedBuiltInSpot.origin === "local" ? (
                              <button className="built-in-spot-remove" type="button" onClick={() => removeBuiltInLocalSpot(zone.id, selectedBuiltInSpot.id)}>REMOVE THIS SPOT</button>
                            ) : (
                              <button className="built-in-spot-reset" type="button" onClick={() => layout && builtInStationSpots && resetBuiltInSourceSpot(zone, layout, builtInStationSpots, selectedBuiltInSpot.id)}>RESET TO SUPPLIED SPOT</button>
                            )}
                          </> : <span>Tap the supplied image to add a spot, then tap or drag a marker to rename or move it. Supplied spots can always be reset.</span>}
                        </div>
                      ) : null}
                      {customBoard && mode === "EDIT" && boardTool === "labels" ? (
                        <div className="custom-label-editor">
                          <b>LABEL ARRANGEMENT</b>
                          {selectedCustomLabel && selectedCustomLabelSpot && selectedCustomLabelLayout ? <>
                            <span>{shortAnchorLabel(selectedCustomLabel.card.title)}</span>
                            <button
                              type="button"
                              className={selectedCustomLabelLayout.placement === "spot" ? "selected" : ""}
                              onClick={() => trySetCustomLabelLayout(customBoard, zone, selectedCustomLabel.card.id, {
                                placement: "spot",
                                x: selectedCustomLabelSpot.x,
                                y: selectedCustomLabelSpot.y,
                                route: selectedCustomLabelLayout.route,
                              })}
                            >KEEP ON SPOT</button>
                            {(["straight", "one-turn"] as const).map((route) => {
                              const callout = selectedCustomLabelLayout.placement === "callout"
                                ? { ...selectedCustomLabelLayout, route }
                                : suggestedCustomCalloutLayout(selectedCustomLabelSpot, shortAnchorLabel(selectedCustomLabel.card.title), route);
                              return <button
                                key={route}
                                type="button"
                                className={selectedCustomLabelLayout.placement === "callout" && selectedCustomLabelLayout.route === route ? "selected" : ""}
                                onClick={() => trySetCustomLabelLayout(customBoard, zone, selectedCustomLabel.card.id, callout)}
                              >{route === "straight" ? "STRAIGHT LINE" : "ONE TURN"}</button>;
                            })}
                          </> : <span>Tap a placed label, then drag it around the photo or choose a line style.</span>}
                        </div>
                      ) : null}
                      {hasBuiltInStationEditor && mode === "EDIT" && boardTool === "labels" && layout && builtInStationSpots ? (
                        <div className="custom-label-editor built-in-label-editor">
                          <b>LABEL ARRANGEMENT</b>
                          {selectedBuiltInLabel && selectedBuiltInLabelSpot && selectedBuiltInLabelLayout ? <>
                            <span>{shortAnchorLabel(selectedBuiltInLabel.card.title)}</span>
                            <button
                              type="button"
                              className={selectedBuiltInLabelLayout.placement === "spot" ? "selected" : ""}
                              onClick={() => trySetBuiltInLabelLayout(zone, layout, builtInStationSpots, selectedBuiltInLabel.card.id, {
                                placement: "spot",
                                x: selectedBuiltInLabelSpot.x,
                                y: selectedBuiltInLabelSpot.y,
                                route: selectedBuiltInLabelLayout.route,
                              })}
                            >KEEP ON SPOT</button>
                            {(["straight", "one-turn"] as const).map((route) => <button
                              key={route}
                              type="button"
                              className={selectedBuiltInLabelLayout.placement === "callout" && selectedBuiltInLabelLayout.route === route ? "selected" : ""}
                              onClick={() => {
                                const candidates = selectedBuiltInLabelLayout.placement === "callout"
                                  ? [{ ...selectedBuiltInLabelLayout, route }]
                                  : suggestedBuiltInCalloutLayouts(layout, selectedBuiltInLabelSpot, shortAnchorLabel(selectedBuiltInLabel.card.title), route);
                                const applied = candidates.some((candidate) => trySetBuiltInLabelLayout(
                                  zone,
                                  layout,
                                  builtInStationSpots,
                                  selectedBuiltInLabel.card.id,
                                  candidate,
                                  false,
                                ));
                                if (!applied) setNotice("NO CLEAR LABEL POSITION IS AVAILABLE · DRAG THE LABEL OR MOVE ANOTHER LABEL FIRST");
                              }}
                            >{route === "straight" ? "STRAIGHT LINE" : "ONE TURN"}</button>)}
                          </> : <span>Tap a placed label, then drag it around the image or choose a line style. Labels and connector lines stay separate.</span>}
                        </div>
                      ) : null}
                      {isPlacementTarget && pendingZonePlacement ? <div className="station-placement-hint">PLACE “{pendingZonePlacement.card.title}” ON AN EMPTY ANCHOR</div> : null}
                      <div
                        className={`panel-canvas ${hasStationArt ? "has-gym-layout" : layout ? "has-neutral-anchor-layer" : ""} ${referenceBoard ? "has-reference-board" : ""} ${hasExternalCallouts ? "has-external-callouts" : ""} ${customBoard ? "has-custom-board" : ""} ${customBoard && boardTool !== "none" ? "custom-board-tool-active" : ""} ${hasBuiltInStationEditor && boardTool !== "none" ? "built-in-board-tool-active" : ""}`}
                        data-anchor-layer="true"
                        style={customBoard && customPhotoPanel
                          ? {
                            aspectRatio: `${customPhotoPanel.sourceAspectRatio * CUSTOM_PHOTO_FRAME.height} / ${CUSTOM_PHOTO_FRAME.width}`,
                            "--custom-board-presentation-scale": customPhotoPanel.scale,
                          } as React.CSSProperties
                          : referenceBoard ? stationBoardCanvasStyle() : layout && hasStationArt ? { aspectRatio: canvasAspectRatio(layout.viewport) } : undefined}
                        onPointerDown={customBoard
                          ? (event) => addCustomStationSpotAtPointer(event, customBoard)
                          : layout && hasBuiltInStationEditor ? (event) => addBuiltInStationSpotAtPointer(event, zone, layout) : undefined}
                        onPointerMove={customBoard
                          ? (event) => moveCustomBoardDrag(event, customBoard, zone)
                          : layout && builtInStationSpots ? (event) => moveBuiltInBoardDrag(event, zone, layout, builtInStationSpots) : undefined}
                        onPointerUp={customBoard ? endCustomBoardDrag : layout ? endBuiltInBoardDrag : undefined}
                        onPointerCancel={customBoard ? endCustomBoardDrag : layout ? endBuiltInBoardDrag : undefined}
                      >
                        {customBoard ? (
                          <>
                            <div className="custom-board-photo-frame">
                              {customPhotoUrl ? <img className="custom-board-photo" src={customPhotoUrl} alt={`${customBoard.title} area photo`} /> : <p>PHOTO UNAVAILABLE ON THIS DEVICE · RE-ADD THIS AREA PHOTO HERE.</p>}
                            </div>
                            {stationAnchorLayer}
                          </>
                        ) : referenceBoard ? (
                          <>
                            <div className="station-board-reference-frame" style={stationBoardFrameStyle(referenceBoard)}>
                              <img className="station-board-reference-art" src={referenceBoard.src} alt={`${referenceBoard.description} station board`} />
                            </div>
                            {stationAnchorLayer}
                          </>
                        ) : <>
                          {layout && usesFreeformGeometry ? <img className="gym-layout-art" src="gym-layout-skeleton.png" alt="" aria-hidden="true" style={imageStyleForViewport(layout.viewport)} /> : null}
                          {stationAnchorLayer}
                        </>}
                      </div>
                      <div className="zone-footer"><span>{zone.people}</span><strong>{zone.openStation ? `OPEN STATION · ${zone.note}` : zone.note}</strong></div>
                      <div className={`station-name ${customBoard ? "custom-board-event-name" : ""}`}>
                        <span>{customBoard ? zone.alias : zone.title}</span><small>{customBoard ? zone.title : zone.alias}</small>
                        {mode === "EDIT" && layout?.requiresGeometryReview ? <em className="station-map-review" title={layout.geometryReviewNote}>MAP DRAFT</em> : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ) : activePhase.mode === "TEXT" ? null : (
            <div className="empty-canvas retro-window">
              <div className="window-title">VISUAL PANEL SETUP</div>
              <p>Create a photo area above or choose one you already saved. New photo areas start empty; no drill is placed automatically.</p>
            </div>
          )}

          {activePhase.note !== undefined ? (
            <section className="phase-note" aria-label="Local phase note">
              <div><b>LOCAL TEXT NOTE</b><span>saved only in this browser</span></div>
              {mode === "EDIT" ? (
                <textarea
                  maxLength={180}
                  value={activePhase.note}
                  onChange={(event) => updateTextNote(event.target.value)}
                  placeholder="Short coaching note for this phase…"
                  aria-label="Short coaching note"
                />
              ) : <p>{activePhase.note || "No note written."}</p>}
              {mode === "EDIT" ? <button onClick={removeTextNote}>REMOVE NOTE</button> : null}
            </section>
          ) : null}

          <div className="canvas-actions">
            {mode === "EDIT" ? <button onClick={addTextNote}>+ TEXT NOTE</button> : <span className="view-lock">VIEW MODE · PLAN IS READ-ONLY · ATTENDANCE + TO-DOS STAY LIVE</span>}
            {mode === "EDIT" ? <button onClick={addSafetyCue}>+ SAFETY CUE</button> : null}
            {mode === "EDIT" ? <span className="tiny-static-note">RECIPES WILL APPEAR HERE AFTER YOU SAVE ONE</span> : null}
            {placedCard ? <span className="placed-note">✓ {placedCard} is saved on this local lesson.</span> : null}
          </div>
          </> : null}
            </div>
            {mode === "EDIT" ? ideaLibraryPanel : null}
          </div>
        </section>

        <aside className="right-rail">
          <section id="daily-updates" className="retro-window operations-window">
            <div className="window-title">PLANNER UPDATES <span>{unresolvedUpdateCount} to review</span></div>
            <div className="operations-demo-strip">
              <b>LOCAL PLANNER ASSISTANT</b>
              <span>Rules check this lesson’s timing, missing plans, explicit safety/setup notes, and linked schedule advisories. No email, calendar, crawler, server, or shared-system connection.</span>
            </div>
            <div className="task-list" aria-label="Local demo tasks">
              {operationTasks.map((task) => {
                const isDone = operationTaskIsDone(task.id);
                return (
                  <label key={task.id} className={`task-row ${isDone ? "completed" : ""}`}>
                    <input type="checkbox" checked={isDone} onChange={(event) => setOperationTaskDone(task.id, event.target.checked)} />
                    <span className="task-copy">
                      <strong>{task.title}</strong>
                      <small>{task.detail}</small>
                    </span>
                    <em>{task.kind}</em>
                    {task.rollForwardCopy ? (
                      <span className="task-roll-forward">
                        {isDone ? "Completed locally · will not roll forward." : task.rollForwardCopy}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
            <div className="safety-callout"><b>⚠ READY CHECK</b><span>Second coach is needed before spotting progressions.</span>{mode === "EDIT" ? <button onClick={() => setNotice("SAFETY CHECK ACKNOWLEDGED FOR READY REVIEW")}>ACKNOWLEDGE</button> : null}</div>
            <section className={`updates-inbox ${unresolvedUpdateCount ? "has-pending" : ""}`} aria-label="Local planner update inbox">
              <div className={`updates-inbox-header ${unresolvedUpdateCount ? "pending-shake" : ""}`}>
                <div><b>UPDATE INBOX</b><span>DECISIONS STAY WITH THIS REVISION</span></div>
                <strong>{unresolvedUpdateCount ? `${unresolvedUpdateCount} OPEN` : "ALL REVIEWED"}</strong>
              </div>
              <p className="updates-inbox-note">Generated from this browser’s current plan and imported local schedule only. Alerts are advisory and do not reserve equipment or change the schedule.</p>
              <div className="update-stack">
                {assistantUpdates.length ? assistantUpdates.map((update) => {
                  const decision = updateDecisionByRevision[revisionKey(update)];
                  return (
                    <article key={revisionKey(update)} className={`update-card ${update.priority.toLocaleLowerCase()}`}>
                      <div className="update-card-meta"><span>{update.priority} · {update.source}</span><span>REV {update.revisionId.split("-").at(-1)?.toUpperCase()}</span></div>
                      <strong>{update.title}</strong>
                      <p>{update.summary}</p>
                      {mode === "EDIT" ? <div className="update-decisions" aria-label={`Decision for ${update.title}`}>
                        {updateDecisionOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`decision-button ${decision === option.value ? `selected ${option.value.toLocaleLowerCase()}` : ""}`}
                            aria-pressed={decision === option.value}
                            onClick={() => recordUpdateDecision(update, option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div> : null}
                      <small className="update-decision-state">
                        {decision
                          ? `LOCAL DECISION FOR ${update.revisionId.toUpperCase()}: ${decision}`
                          : `NO LOCAL DECISION FOR ${update.revisionId.toUpperCase()}`}
                      </small>
                    </article>
                  );
                }) : <p className="updates-inbox-empty">NO LOCAL PLANNER UPDATES RIGHT NOW.</p>}
              </div>
            </section>
          </section>

          <section className="retro-window attendance-window">
            <div className="window-title">ATTENDANCE <span>{isPastActivePlan ? "PAST SNAPSHOT · COMPLETION STAYS LIVE" : activeLocalClass ? `${activeLocalClass.name.toUpperCase()} · LIVE IN VIEW + EDIT` : "SAMPLE ROSTER · CREATE A CLASS"}</span></div>
            {attendanceRoster.length ? attendanceRoster.map((athlete) => {
              const status = attendanceById[athlete.id] ?? "unmarked";
              return (
                <div key={athlete.id} className="attendance-row">
                  <span>{athlete.name}</span>
                  {mode === "VIEW" ? (
                    <label className="attendance-view-check">
                      <input
                        type="checkbox"
                        checked={status === "present" || status === "late"}
                        onChange={(event) => setAttendanceStatus(athlete.id, event.currentTarget.checked ? "present" : "unmarked")}
                        aria-label={`Mark ${athlete.name} ${status === "present" || status === "late" ? "not present" : "present"}`}
                      />
                      <span>{status === "late" ? "LATE" : status === "absent" ? "ABSENT" : status === "present" ? "PRESENT" : "CHECK IN"}</span>
                    </label>
                  ) : (
                    <div className="attendance-statuses" role="group" aria-label={`Attendance for ${athlete.name}`}>
                      {(["unmarked", "present", "late", "absent"] as const).map((option) => (
                        <button
                          key={option}
                          className={`${option} ${status === option ? "selected" : ""}`}
                          aria-pressed={status === option}
                          onClick={() => setAttendanceStatus(athlete.id, option)}
                          disabled={isPastActivePlan}
                        >
                          {option === "unmarked" ? "?" : option === "present" ? "P" : option === "late" ? "L" : "A"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }) : <p className="attendance-empty">This local class has no students yet. Edit the class to add the roster.</p>}
          </section>
        </aside>
      </section>

      <footer className="statusbar"><span>☑ LOCAL FIRST</span><span>MEDIA: MOCK STATUS ONLY</span><span>LAST EDIT: JUST NOW</span><span>LEGACY AUTOMATION: UNTOUCHED</span></footer>
      </>
      )}

      {detailCard ? (
        <div className="idea-detail-scrim" role="presentation" onMouseDown={() => setDetailCard(null)}>
          <section
            className="idea-detail-dialog retro-window"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${detailCard.title}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="window-title">IDEA DETAILS <button type="button" onClick={() => setDetailCard(null)} aria-label="Close idea details">×</button></div>
            <div className="idea-detail-body">
              <Card card={detailCard} />
              {isLibraryItem(detailCard) ? (
                <>
                  {detailCard.mediaId && ideaMediaUrls[detailCard.mediaId] ? (
                    <figure className="idea-reference-media">
                      <figcaption>LOCAL REFERENCE {detailCard.mediaKind === "video" ? "VIDEO" : "PHOTO"} · {detailCard.mediaFilename ?? "IDEA ATTACHMENT"}</figcaption>
                      {detailCard.mediaKind === "video"
                        ? <video src={ideaMediaUrls[detailCard.mediaId]} controls playsInline preload="metadata" aria-label={`Reference video for ${detailCard.title}`} />
                        : <img src={ideaMediaUrls[detailCard.mediaId]} alt={`Reference photo for ${detailCard.title}`} />}
                    </figure>
                  ) : null}
                  <section className="idea-detail-facts" aria-label="Saved coaching details">
                    {detailCard.instructions.length ? <div><b>INSTRUCTIONS</b><ul>{detailCard.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul></div> : null}
                    {detailCard.coachingCues.length ? <div><b>COACHING CUES</b><ul>{detailCard.coachingCues.map((cue) => <li key={cue}>{cue}</li>)}</ul></div> : null}
                    {listedMats(detailCard.mats).length ? <p><b>MATS NEEDED:</b> {listedMats(detailCard.mats).join(" · ")}</p> : null}
                    {detailCard.events.length || detailCard.skills.length ? <p><b>EVENTS / SKILLS:</b> {[...detailCard.events, ...detailCard.skills].join(" · ")}</p> : null}
                  </section>
                  {detailCard.variants.length && mode === "EDIT" && !isLibraryWindow ? (
                    <section className="variant-picker" aria-label={`Saved setups for ${detailCard.title}`}>
                      <b>CHOOSE A SAVED SETUP</b>
                      {detailCard.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            addToLesson(variantPlacementCard(detailCard, variant));
                            setDetailCard(null);
                          }}
                        >
                          <strong>{variant.title}</strong>
                          <span>{variant.instructions[0] ?? "Open the source note for setup details."}</span>
                        </button>
                      ))}
                    </section>
                  ) : null}
                  {mode === "EDIT" || isLibraryWindow ? (
                    <div className="idea-detail-actions">
                      <button type="button" onClick={() => startLibraryEdit(detailCard)}>EDIT THIS IDEA</button>
                      <button
                        type="button"
                        className="detail-remove"
                        onClick={() => requestLibraryRemoval(detailCard)}
                      >
                        REMOVE FROM ACTIVE LIBRARY
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <section className="media-placeholder" aria-label="Media and reference placeholders">
                  <div><b>VIDEO</b><span>LOCAL VIDEO SLOT</span></div>
                  <div><b>PHOTO</b><span>PERFECT-DEMO SLOT</span></div>
                  <div><b>LINK</b><span>REFERENCE SLOT</span></div>
                  <p>Media has not been linked in this local prototype yet. This is where a saved demo video, photo, or reference will open.</p>
                </section>
              )}
              {detailCard.lessonLocal && mode === "EDIT" ? (
                <button className="detail-remove" onClick={() => removeSnapshot(detailCard.id)}>REMOVE FROM THIS PHASE</button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {editingLibraryItem && libraryEditDraft ? (
        <div className="idea-detail-scrim" role="presentation" onMouseDown={closeLibraryEdit}>
          <form
            className="idea-detail-dialog retro-window idea-editor-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editingLibraryItem.title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => { event.preventDefault(); void saveLibraryEdit(); }}
          >
            <div className="window-title">EDIT LOCAL LIBRARY IDEA <button type="button" disabled={isSavingLibraryEdit} onClick={closeLibraryEdit} aria-label="Close idea editor">×</button></div>
            <div className="idea-detail-body idea-editor-body">
              <p className="idea-editor-note">Changes stay in this browser. The saved vault/Freeform source stays untouched.</p>
              <div className="idea-editor-grid">
                <label>NAME<input value={libraryEditDraft.title} onChange={(event) => updateLibraryEditDraft("title", event.target.value)} maxLength={100} autoFocus /></label>
                <label>TYPE
                  <select value={libraryEditDraft.kind} onChange={(event) => updateLibraryEditDraft("kind", event.target.value as LibraryItem["kind"])}>
                    <option value="SKILL">SKILL</option>
                    <option value="DRILL">DRILL</option>
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="ACTIVITY">ACTIVITY</option>
                    <option value="REFERENCE">REFERENCE</option>
                  </select>
                </label>
                <label className="wide">SHORT DESCRIPTION<textarea value={libraryEditDraft.description} onChange={(event) => updateLibraryEditDraft("description", event.target.value)} maxLength={500} /></label>
                <label className="wide">MATS NEEDED <small>one per line or comma</small><textarea value={libraryEditDraft.mats} onChange={(event) => updateLibraryEditDraft("mats", event.target.value)} placeholder="panel mat, 8-inch mat, wedge" /></label>
                <label>TAGS <small>one per line or comma</small><textarea value={libraryEditDraft.tags} onChange={(event) => updateLibraryEditDraft("tags", event.target.value)} /></label>
                <label>EVENTS <small>one per line or comma</small><textarea value={libraryEditDraft.events} onChange={(event) => updateLibraryEditDraft("events", event.target.value)} /></label>
                <label className="wide">SKILLS <small>one per line or comma</small><textarea value={libraryEditDraft.skills} onChange={(event) => updateLibraryEditDraft("skills", event.target.value)} /></label>
                <label>GOALS <small>one per line or comma</small><textarea value={libraryEditDraft.goals} onChange={(event) => updateLibraryEditDraft("goals", event.target.value)} /></label>
                <label>COACHING CUES <small>one per line or comma</small><textarea value={libraryEditDraft.coachingCues} onChange={(event) => updateLibraryEditDraft("coachingCues", event.target.value)} /></label>
                <label className="wide">INSTRUCTIONS <small>one per line or comma</small><textarea value={libraryEditDraft.instructions} onChange={(event) => updateLibraryEditDraft("instructions", event.target.value)} /></label>
                <label className="wide">SAFETY NOTE<input value={libraryEditDraft.safety} onChange={(event) => updateLibraryEditDraft("safety", event.target.value)} maxLength={260} /></label>
              </div>
              <section className="idea-editor-media" aria-label="Idea picture or video attachment">
                <b>REFERENCE PHOTO OR VIDEO <small>one local attachment · 35 MB photo / 100 MB video</small></b>
                <input
                  ref={editIdeaCameraInputRef}
                  className="new-idea-file-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(event) => { chooseLibraryIdeaMedia(event.currentTarget.files?.[0] ?? null, "edit"); event.currentTarget.value = ""; }}
                />
                <input
                  ref={editIdeaMediaInputRef}
                  className="new-idea-file-input"
                  type="file"
                  accept="image/*,video/*,.mov,.m4v"
                  hidden
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(event) => { chooseLibraryIdeaMedia(event.currentTarget.files?.[0] ?? null, "edit"); event.currentTarget.value = ""; }}
                />
                <div>
                  <button type="button" disabled={isSavingLibraryEdit} onClick={() => editIdeaCameraInputRef.current?.click()}>TAKE PHOTO</button>
                  <button type="button" disabled={isSavingLibraryEdit} onClick={() => editIdeaMediaInputRef.current?.click()}>CHOOSE PHOTO / VIDEO</button>
                  <button
                    type="button"
                    className="detail-remove"
                    disabled={isSavingLibraryEdit || (!editingIdeaMediaFile && !editingSavedMedia.mediaId)}
                    onClick={() => { setEditingIdeaMediaFile(null); setRemoveEditingIdeaMedia(true); }}
                  >
                    REMOVE ATTACHMENT
                  </button>
                </div>
                {editingMediaUrl ? (
                  <figure className="idea-media-preview">
                    <figcaption>{editingMediaKind?.toUpperCase()} · {editingMediaFilename}</figcaption>
                    {editingMediaKind === "video"
                      ? <video src={editingMediaUrl} controls playsInline preload="metadata" />
                      : <img src={editingMediaUrl} alt={`Attachment preview for ${editingLibraryItem.title}`} />}
                  </figure>
                ) : <span>{removeEditingIdeaMedia ? "ATTACHMENT WILL BE REMOVED WHEN YOU SAVE" : "NO ATTACHMENT"}</span>}
              </section>
              <div className="idea-editor-actions">
                <button type="button" disabled={isSavingLibraryEdit} onClick={closeLibraryEdit}>CANCEL</button>
                <button type="submit" disabled={isSavingLibraryEdit}>{isSavingLibraryEdit ? "SAVING…" : "SAVE LOCAL EDIT"}</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {removeCandidate ? (
        <div className="idea-detail-scrim" role="presentation" onMouseDown={() => { if (!isDeletingIdea) setRemoveCandidate(null); }}>
          <section
            className="idea-detail-dialog retro-window remove-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Confirm removal of ${removeCandidate.title}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="window-title">ARCHIVE OR DELETE IDEA <button type="button" disabled={isDeletingIdea} onClick={() => setRemoveCandidate(null)} aria-label="Cancel removal">×</button></div>
            <div className="idea-detail-body">
              <p><strong>{removeCandidate.title}</strong> can be moved to Archive or permanently deleted from this browser’s Idea Library.</p>
              <p>Permanent deletion also removes its local attachment and cannot be undone. Copies already placed in current or past lessons stay unchanged.</p>
              <div className="idea-editor-actions">
                <button type="button" disabled={isDeletingIdea} onClick={() => setRemoveCandidate(null)}>KEEP IT</button>
                <button type="button" disabled={isDeletingIdea} onClick={confirmLibraryRemoval}>MOVE TO ARCHIVE</button>
                <button type="button" disabled={isDeletingIdea} className="detail-remove" onClick={() => { void confirmPermanentLibraryDeletion(); }}>
                  {isDeletingIdea ? "DELETING…" : "DELETE PERMANENTLY"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
