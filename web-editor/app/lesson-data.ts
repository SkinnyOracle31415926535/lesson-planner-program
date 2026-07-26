export type CardKind = "SKILL" | "DRILL" | "ROUTINE" | "ACTIVITY" | "REFERENCE";
export type LibraryShelf = "all" | "gems" | "recent" | "drafts" | "archive";
export type OperationTaskKind = "RECURRING" | "TEMPORARY";
export const IDEA_LEVELS = [3, 4, 5, 6, 7, 8, 9, 10] as const;
export type IdeaLevel = (typeof IDEA_LEVELS)[number];

export type LessonCard = {
  id: string;
  kind: CardKind;
  title: string;
  description: string;
  tags: string[];
  accent: "cyan" | "green" | "yellow" | "pink";
  starred?: boolean;
  safety?: string;
  /** Explicit equipment/mat setup entered by the coach; never inferred from source prose. */
  mats?: string[];
  /** Explicit Level 3–10 applicability selected by the coach. Legacy cards stay unchecked. */
  levels?: IdeaLevel[];
  /** A card copied from the shelf into this one local lesson. */
  lessonLocal?: boolean;
  sourceIdeaId?: string;
  selectedVariantId?: string;
};

export type LibraryVariant = {
  id: string;
  title: string;
  instructions: string[];
  sourceRefs: string[];
};

export type ZonePanel = {
  id: string;
  title: string;
  alias: string;
  note: string;
  people: string;
  cards: LessonCard[];
  /** A coach-created local photo area. Built-in zone IDs never use this. */
  customBoardId?: string;
  /** Added by the event editor when this area is free for the event's whole duration. */
  openStation?: boolean;
  /**
   * Logical metadata for this browser-local panel renderer. The bounded
   * Skeleton-derived geometry lives in the project contract; this demo file
   * intentionally does not copy its coordinates until the real map renderer
   * consumes it.
   */
  mapGroup?: "FLOOR" | "BARS" | "APPARATUS" | "COMBINED";
  mapRole?: "floor-slice" | "combined-area" | "station";
};

/** Identifies one coach-added phase that came from a local safe-schedule Open block. */
export type ScheduleOpenProvenance = {
  kind: "safe-schedule-open";
  sourceId: string;
  scheduleId: string;
  revision: string;
  bookingId: string;
  lessonDate: string;
  scheduleGroup: string;
};

export type LessonPhase = {
  id: string;
  time: string;
  /** A schedule/event block may contain multiple ordered phases. */
  eventId?: string;
  eventLabel?: string;
  /** A new in-between event waits for its coach-selected start and knows its fixed next-event boundary. */
  pendingEventEnd?: string;
  title: string;
  mode: "TEXT" | "MIXED" | "VISUAL";
  /** Core phases are shown but cannot be deleted in the local demo editor. */
  isRequired?: boolean;
  zones: ZonePanel[];
  /**
   * A zone that was removed from the visible phase stays here locally so
   * unselecting a panel does not discard its lesson-local cards or notes.
   */
  parkedZones?: ZonePanel[];
  text: string[];
  /** A short, lesson-local coaching note. */
  note?: string;
  /** Cards placed in a text-only phase instead of a gym zone. */
  textCards?: LessonCard[];
  /** Optional local provenance prevents duplicate Open events without binding the lesson to future imports. */
  scheduleProvenance?: ScheduleOpenProvenance;
};

/** A schedule/event block can contain one or more ordered planning phases. */
export type LessonEvent = {
  id: string;
  title: string;
  time: string;
  phases: LessonPhase[];
};

/**
 * The non-coordinate gym-map contract used by the prototype. It captures
 * names and relationships (including overlapping/combined areas) without
 * guessing where anything physically sits in the gym.
 */
export type GymMapFoundation = {
  source: "skeleton-freeform-geometry-draft-renderer-pending";
  floorDescription: string;
  combinedAreaIds: string[];
  floorSliceIds: string[];
};

/**
 * Browser-local representation of the safe schedule-day handoff shape.
 *
 * This is deliberately static demo data, not an import of a vault fixture,
 * live calendar, booking system, or shared schedule. It retains only the
 * coach-facing fields needed to explain an advisory schedule preview.
 */
export type ScheduleAdvisoryBlock = {
  id: string;
  startMinute: number;
  endMinute: number;
  eventLabel: string;
  equipment: string[];
  activityType: "rotation" | "open" | "support";
  confidence?: "high" | "medium" | "low";
  reviewStatus?: "auto_extracted" | "needs_review";
};

export type ScheduleAdvisoryPreview = {
  date: { iso: string; day: string; label: string };
  selectedGroup: string;
  rotation: {
    monthWeekOrdinal: number;
    status: "auto" | "manual_confirmation_required" | "manual_confirmed" | "unmapped";
    resolvedWeek: string | null;
    manualConfirmationRequired: boolean;
  };
  selectionStatus: "ready" | "group_required" | "manual_week_confirmation_required" | "outside_schedule_range" | "no_blocks_for_group";
  advisories: string[];
  rotationBlocks: ScheduleAdvisoryBlock[];
  openings: ScheduleAdvisoryBlock[];
  supportBlocks: ScheduleAdvisoryBlock[];
};

/**
 * Static local sample using the sanitized schedule-day contract's semantics:
 * date + selected group + rotation context, advisory rotations, and optional
 * `open` blocks remain separate. No item here can add or change a phase.
 */
export const scheduleDayAdvisoryDemo: ScheduleAdvisoryPreview = {
  date: { iso: "2026-07-20", day: "Mon", label: "MON · JUL 20, 2026" },
  selectedGroup: "LEVEL 3 BOYS",
  rotation: {
    monthWeekOrdinal: 2,
    status: "auto",
    resolvedWeek: null,
    manualConfirmationRequired: false,
  },
  selectionStatus: "ready",
  advisories: [
    "Local copy of the supplied Level 3 plan. It is a planning reference only and never writes back to the vault.",
  ],
  rotationBlocks: [
    { id: "l3-f2", startMinute: 930, endMinute: 945, eventLabel: "F2", equipment: ["F2"], activityType: "rotation", confidence: "high", reviewStatus: "needs_review" },
    { id: "l3-pbhb", startMinute: 945, endMinute: 975, eventLabel: "PB / HB", equipment: ["PB/HB"], activityType: "rotation", confidence: "high", reviewStatus: "needs_review" },
    { id: "l3-f4-ts", startMinute: 975, endMinute: 1000, eventLabel: "F4 / TS", equipment: ["F4", "TS"], activityType: "rotation", confidence: "high", reviewStatus: "needs_review" },
    { id: "l3-ts", startMinute: 1000, endMinute: 1010, eventLabel: "TS", equipment: ["TS"], activityType: "rotation", confidence: "high", reviewStatus: "needs_review" },
    { id: "l3-srph", startMinute: 1010, endMinute: 1045, eventLabel: "SR / PH", equipment: ["SR/PH"], activityType: "rotation", confidence: "high", reviewStatus: "needs_review" },
  ],
  openings: [],
  supportBlocks: [],
};

export type LibraryMediaKind = "image" | "video";

/** A coach-created idea saved locally in this browser. */
export type LibraryItem = LessonCard & {
  events: string[];
  skills: string[];
  goals: string[];
  instructions: string[];
  coachingCues: string[];
  variants: LibraryVariant[];
  sourceRefs: string[];
  sourceStatus: string;
  sourceType: string;
  defaultArchived?: boolean;
  /** Optional browser-local reference media. The Blob stays in IndexedDB. */
  mediaId?: string;
  mediaKind?: LibraryMediaKind;
  mediaFilename?: string;
  mediaMimeType?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaDurationSeconds?: number;
  /** Browser-local editable pixel station setup. Its document stays in IndexedDB. */
  stationSetupId?: string;
  /** Lets the library distinguish a generated station preview from a normal attachment. */
  stationPreviewKind?: "pixel-station";
  /** Legacy version-5 photo metadata, read only during local migration. */
  photoId?: string;
  photoFilename?: string;
  photoWidth?: number;
  photoHeight?: number;
};

/**
 * Legacy built-in zones retained only so past read-only lesson snapshots can
 * still render their original supplied boards. New planning uses coach-created
 * photo areas instead.
 */
export const zoneCatalog: ZonePanel[] = [
  {
    id: "pb-hb",
    title: "PB / HB AREA",
    alias: "PB/HB",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "BARS",
    mapRole: "combined-area",
  },
  {
    id: "sr-ph",
    title: "STILL RINGS / POMMEL HORSE",
    alias: "SR/PH",
    note: "Combined-area panel; its bounded Skeleton geometry draft awaits renderer integration.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "ts",
    title: "TUMBLE STRIP",
    alias: "TS",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "f1",
    title: "FLOOR 1",
    alias: "F1",
    note: "Horizontal slice of the full floor; the bounded geometry draft awaits renderer integration.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "floor-slice",
  },
  {
    id: "f2",
    title: "FLOOR 2",
    alias: "F2",
    note: "Horizontal slice of the full floor; the bounded geometry draft awaits renderer integration.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "floor-slice",
  },
  {
    id: "f4",
    title: "FLOOR 4",
    alias: "F4",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "floor-slice",
  },
  {
    id: "f3",
    title: "FLOOR 3",
    alias: "F3",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "floor-slice",
  },
  {
    id: "strap-bar",
    title: "STRAP BAR",
    alias: "STRAP BAR",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "rings",
    title: "STILL RINGS",
    alias: "SR",
    note: "Owner-supplied station board; add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "vault",
    title: "VAULT",
    alias: "VAULT",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "beam",
    title: "BEAM",
    alias: "BEAM",
    note: "Add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "f6",
    title: "FLOOR 6",
    alias: "F6",
    note: "Owner-supplied station board; use the exact F6 view for this phase.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "station",
  },
  {
    id: "wr",
    title: "WEIGHT ROOM",
    alias: "WR",
    note: "Owner-supplied station board; add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "hb",
    title: "HIGH BAR",
    alias: "HB",
    note: "Owner-supplied station board; add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "BARS",
    mapRole: "station",
  },
  {
    id: "pb",
    title: "PARALLEL BARS",
    alias: "PB",
    note: "Owner-supplied station board; add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "BARS",
    mapRole: "station",
  },
  {
    id: "ph",
    title: "POMMEL HORSE",
    alias: "PH",
    note: "Owner-supplied station board; add local setup and safety detail when this panel is used.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "beam-1",
    title: "BEAM 1",
    alias: "B1",
    note: "Owner-supplied station board for Beam 1.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "beam-2",
    title: "BEAM 2",
    alias: "B2",
    note: "Owner-supplied station board for Beam 2.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "beam-all",
    title: "ALL BEAMS",
    alias: "BEAMS",
    note: "Owner-supplied combined beam board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "fx",
    title: "FULL FLOOR",
    alias: "FX",
    note: "Owner-supplied FX-only station board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "combined-area",
  },
  {
    id: "fx-ts",
    title: "FLOOR + TUMBLE STRIP",
    alias: "FX + TS",
    note: "Owner-supplied combined Floor and Tumble Strip board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "f5",
    title: "FLOOR 5",
    alias: "F5",
    note: "Owner-supplied F5 station board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "FLOOR",
    mapRole: "floor-slice",
  },
  {
    id: "pit-pb",
    title: "PIT PARALLEL BARS",
    alias: "PIT PB",
    note: "Owner-supplied Pit PB board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "BARS",
    mapRole: "station",
  },
  {
    id: "pit-highbar-rings-pb",
    title: "PIT HIGH BAR / RINGS / PB",
    alias: "PIT HB+SR+PB",
    note: "Owner-supplied combined pit board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "ub1-ub2-strap",
    title: "UB1 / UB2 / STRAP BAR",
    alias: "UB1+UB2+STRAP",
    note: "Owner-supplied combined UB and Strap Bar board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "pit-strap",
    title: "PIT + STRAP BAR",
    alias: "PIT+STRAP",
    note: "Owner-supplied Pit and Strap Bar board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "COMBINED",
    mapRole: "combined-area",
  },
  {
    id: "trampoline",
    title: "TRAMPOLINE",
    alias: "TRAMP",
    note: "Owner-supplied Trampoline board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "tumble-track",
    title: "TUMBLE TRACK",
    alias: "TT",
    note: "Owner-supplied Tumble Track board; this remains distinct from TS.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
  {
    id: "ub3",
    title: "UB3",
    alias: "UB3",
    note: "Owner-supplied UB3 board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "BARS",
    mapRole: "station",
  },
  {
    id: "preschool",
    title: "PRESCHOOL",
    alias: "PRESCHOOL",
    note: "Owner-supplied Preschool board.",
    people: "Assign a group in this lesson",
    cards: [],
    mapGroup: "APPARATUS",
    mapRole: "station",
  },
];

export const gymMapFoundation: GymMapFoundation = {
  source: "skeleton-freeform-geometry-draft-renderer-pending",
  floorDescription: "F1, F2, F3, and F4 are horizontal slices of one full floor.",
  combinedAreaIds: ["pb-hb", "sr-ph"],
  floorSliceIds: ["f1", "f2", "f3", "f4"],
};

export const phaseData: LessonPhase[] = [
  {
    id: "l3-f2",
    time: "3:30–3:45",
    eventId: "l3-f2",
    eventLabel: "LEVEL 3 BOYS",
    title: "F2",
    mode: "VISUAL",
    isRequired: true,
    zones: [],
    text: [],
  },
  {
    id: "l3-pbhb",
    time: "3:45–4:15",
    eventId: "l3-pbhb",
    eventLabel: "LEVEL 3 BOYS",
    title: "PB / HB",
    mode: "VISUAL",
    isRequired: true,
    zones: [],
    text: [],
  },
  {
    id: "l3-f4-ts",
    time: "4:15–4:40",
    eventId: "l3-f4-ts",
    eventLabel: "LEVEL 3 BOYS",
    title: "F4 + TS",
    mode: "VISUAL",
    isRequired: true,
    zones: [],
    text: [],
  },
  {
    id: "l3-ts",
    time: "4:40–4:50",
    eventId: "l3-ts",
    eventLabel: "LEVEL 3 BOYS",
    title: "TS",
    mode: "VISUAL",
    isRequired: true,
    zones: [],
    text: [],
  },
  {
    id: "l3-srph",
    time: "4:50–5:25",
    eventId: "l3-srph",
    eventLabel: "LEVEL 3 BOYS",
    title: "SR / PH",
    mode: "VISUAL",
    isRequired: true,
    zones: [],
    text: [],
  },
];

export type AttendanceStatus = "unmarked" | "present" | "late" | "absent";

export const attendance: Array<{ id: string; name: string; status: AttendanceStatus }> = [
  { id: "l3-fabian-fernandes", name: "Fabian Fernandes", status: "unmarked" },
  { id: "l3-ethan-grinberg", name: "Ethan Grinberg", status: "unmarked" },
  { id: "l3-weston-schomaker", name: "Weston Schomaker", status: "unmarked" },
  { id: "l3-daniel-shatil", name: "Daniel Shatil", status: "unmarked" },
  { id: "l3-ariel-shatil", name: "Ariel Shatil", status: "unmarked" },
  { id: "l3-logan-huynh", name: "Logan Huynh", status: "unmarked" },
];

/**
 * Static examples for the browser-local daily-operations prototype. They are
 * intentionally not connected to a schedule, email account, crawler, or
 * production task system.
 */
export type DemoOperationTask = {
  id: string;
  title: string;
  kind: OperationTaskKind;
  detail: string;
  rollForwardCopy?: string;
};

export const operationTasks: DemoOperationTask[] = [
  {
    id: "set-bar-station-mats",
    title: "Set bar station mats",
    kind: "RECURRING",
    detail: "Every class · demo checkmark stays only in this browser.",
  },
  {
    id: "summer-skill-card-reminder",
    title: "Bring summer skill-card reminders",
    kind: "TEMPORARY",
    detail: "Finite demo task · scheduled for the next 2 class days only.",
    rollForwardCopy: "Rolls forward to each remaining class until completed · ends after JUL 26.",
  },
];

export type DemoDailyUpdate = {
  id: string;
  revisionId: string;
  source: string;
  title: string;
  summary: string;
};

/**
 * Normalized, synthetic inbox cards. A future import can create new
 * revisionIds without replacing a coach's decision on an older revision.
 */
export const dailyUpdates: DemoDailyUpdate[] = [
  {
    id: "l3-form-reminder",
    revisionId: "weekly-notes-2026-07-20-r1",
    source: "WEEKLY NOTES DIGEST",
    title: "Form reminder for Level 3",
    summary: "Keep the opening shape review short before the first bars rotation.",
  },
  {
    id: "pickup-note",
    revisionId: "daily-digest-2026-07-20-r1",
    source: "DEMO DAILY DIGEST",
    title: "Pickup timing note",
    summary: "A normalized placeholder to review later; no message, student, or email data is stored here.",
  },
];
