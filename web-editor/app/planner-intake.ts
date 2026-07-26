export const PLANNER_INTAKE_VERSION = 1 as const;

export const PLANNER_INTAKE_PROJECTS = [
  { key: "lesson-planner", label: "LESSON PLANNER" },
  { key: "vault-command-center", label: "VAULT COMMAND CENTER" },
  { key: "calendar", label: "SCHEDULE CALENDAR" },
  { key: "scavenger-hunt", label: "SCAVENGER HUNT" },
  { key: "tally-clicker", label: "TALLY CLICKER" },
  { key: "rate-game", label: "RATE GAME" },
  { key: "team-games", label: "TEAM GAMES" },
  { key: "team-invites", label: "TEAM INVITES" },
] as const;

export type PlannerIntakeProjectKey = (typeof PLANNER_INTAKE_PROJECTS)[number]["key"];
export type PlannerIntakeDecision = "applied" | "dismissed";

export type PlannerDraftTarget = {
  lessonDate: string;
  classId: string | null;
  className: string;
};

export type PlannerDraftPhase = {
  phaseId: string;
  title: string;
  time: string;
  text?: string[];
  note?: string;
};

export type PlannerLessonDraft = {
  id: string;
  kind: "lesson-draft";
  createdAt: string;
  source: string;
  target: PlannerDraftTarget;
  details: {
    announcements?: string;
    goals?: string;
  };
  phases: PlannerDraftPhase[];
};

export type PlannerAnnouncementSuggestion = {
  id: string;
  kind: "announcement";
  createdAt: string;
  source: string;
  sourceRef: string;
  classId: string;
  className: string;
  effectiveStart: string;
  effectiveEnd: string;
  text: string;
};

export type PlannerBacklogCapture = {
  id: string;
  kind: "backlog-capture";
  createdAt: string;
  source: {
    lessonId: string;
    lessonDate: string;
    classId: string | null;
    className: string;
  };
  projectKey: PlannerIntakeProjectKey;
  request: string;
};

export type PlannerIntake = {
  version: typeof PLANNER_INTAKE_VERSION;
  lessonDrafts: PlannerLessonDraft[];
  announcementSuggestions: PlannerAnnouncementSuggestion[];
  backlogCaptures: PlannerBacklogCapture[];
  decisionById: Record<string, PlannerIntakeDecision>;
};

export type PlannerDraftCompatibility =
  | { status: "ready" }
  | { status: "target-mismatch"; message: string }
  | { status: "phase-mismatch"; message: string };

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PROJECT_KEYS = new Set<PlannerIntakeProjectKey>(PLANNER_INTAKE_PROJECTS.map((project) => project.key));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isText(value: unknown, maximum: number, allowEmpty = false): value is string {
  return typeof value === "string"
    && value.length <= maximum
    && !value.includes("\0")
    && (allowEmpty || value.trim().length > 0);
}

function isSingleLineText(value: unknown, maximum: number): value is string {
  return isText(value, maximum) && !value.includes("\n") && !value.includes("\r");
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isTimestamp(value: unknown): value is string {
  return isText(value, 100) && Number.isFinite(Date.parse(value));
}

function isOptionalText(value: unknown, maximum: number): value is string | undefined {
  return value === undefined || isText(value, maximum, true);
}

function isTextList(value: unknown, maximumItems: number, maximumLength: number): value is string[] {
  return Array.isArray(value)
    && value.length <= maximumItems
    && value.every((entry) => isText(entry, maximumLength));
}

function isDraftTarget(value: unknown): value is PlannerDraftTarget {
  if (!isRecord(value) || !hasOnlyKeys(value, ["lessonDate", "classId", "className"])) return false;
  return isDate(value.lessonDate)
    && (value.classId === null || isIdentifier(value.classId))
    && isSingleLineText(value.className, 200);
}

function isDraftPhase(value: unknown): value is PlannerDraftPhase {
  if (!isRecord(value) || !hasOnlyKeys(value, ["phaseId", "title", "time", "text", "note"])) return false;
  if (!isIdentifier(value.phaseId)
    || !isSingleLineText(value.title, 200)
    || !isSingleLineText(value.time, 100)
    || (value.text !== undefined && !isTextList(value.text, 100, 500))
    || !isOptionalText(value.note, 180)) return false;
  return value.text !== undefined || value.note !== undefined;
}

function isLessonDraft(value: unknown): value is PlannerLessonDraft {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["id", "kind", "createdAt", "source", "target", "details", "phases"])
    || value.kind !== "lesson-draft"
    || !isIdentifier(value.id)
    || !isTimestamp(value.createdAt)
    || !isSingleLineText(value.source, 200)
    || !isDraftTarget(value.target)
    || !isRecord(value.details)
    || !hasOnlyKeys(value.details, ["announcements", "goals"])
    || !isOptionalText(value.details.announcements, 1_000)
    || !isOptionalText(value.details.goals, 1_000)
    || !Array.isArray(value.phases)
    || value.phases.length > 100
    || !value.phases.every(isDraftPhase)) return false;
  if (value.details.announcements === undefined
    && value.details.goals === undefined
    && value.phases.length === 0) return false;
  const phaseIds = value.phases.map((phase) => phase.phaseId);
  return new Set(phaseIds).size === phaseIds.length;
}

function isAnnouncementSuggestion(value: unknown): value is PlannerAnnouncementSuggestion {
  if (!isRecord(value)
    || !hasOnlyKeys(value, [
      "id", "kind", "createdAt", "source", "sourceRef", "classId", "className",
      "effectiveStart", "effectiveEnd", "text",
    ])) return false;
  return value.kind === "announcement"
    && isIdentifier(value.id)
    && isTimestamp(value.createdAt)
    && isSingleLineText(value.source, 200)
    && isSingleLineText(value.sourceRef, 500)
    && isIdentifier(value.classId)
    && isSingleLineText(value.className, 200)
    && isDate(value.effectiveStart)
    && isDate(value.effectiveEnd)
    && value.effectiveStart <= value.effectiveEnd
    && isText(value.text, 1_000);
}

function isProjectKey(value: unknown): value is PlannerIntakeProjectKey {
  return typeof value === "string" && PROJECT_KEYS.has(value as PlannerIntakeProjectKey);
}

function isBacklogCapture(value: unknown): value is PlannerBacklogCapture {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ["id", "kind", "createdAt", "source", "projectKey", "request"])
    || value.kind !== "backlog-capture"
    || !isIdentifier(value.id)
    || !isTimestamp(value.createdAt)
    || !isRecord(value.source)
    || !hasOnlyKeys(value.source, ["lessonId", "lessonDate", "classId", "className"])) return false;
  return isIdentifier(value.source.lessonId)
    && isDate(value.source.lessonDate)
    && (value.source.classId === null || isIdentifier(value.source.classId))
    && isSingleLineText(value.source.className, 200)
    && isProjectKey(value.projectKey)
    && isSingleLineText(value.request, 1_000);
}

function isDecisionRecord(value: unknown): value is Record<string, PlannerIntakeDecision> {
  return isRecord(value)
    && Object.keys(value).length <= 600
    && Object.entries(value).every(([id, decision]) => (
      isIdentifier(id) && (decision === "applied" || decision === "dismissed")
    ));
}

function jsonValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left)
      && Array.isArray(right)
      && left.length === right.length
      && left.every((entry, index) => jsonValuesEqual(entry, right[index]));
  }
  if (!isRecord(left) || !isRecord(right)) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => (
      key === rightKeys[index] && jsonValuesEqual(left[key], right[key])
    ));
}

function detachedIntake(intake: PlannerIntake): PlannerIntake {
  return {
    version: PLANNER_INTAKE_VERSION,
    lessonDrafts: intake.lessonDrafts.map((draft) => ({
      ...draft,
      target: { ...draft.target },
      details: { ...draft.details },
      phases: draft.phases.map((phase) => ({
        ...phase,
        ...(phase.text === undefined ? {} : { text: [...phase.text] }),
      })),
    })),
    announcementSuggestions: intake.announcementSuggestions.map((suggestion) => ({ ...suggestion })),
    backlogCaptures: intake.backlogCaptures.map((capture) => ({ ...capture, source: { ...capture.source } })),
    decisionById: { ...intake.decisionById },
  };
}

export function emptyPlannerIntake(): PlannerIntake {
  return {
    version: PLANNER_INTAKE_VERSION,
    lessonDrafts: [],
    announcementSuggestions: [],
    backlogCaptures: [],
    decisionById: {},
  };
}

export function parsePlannerIntake(value: unknown): PlannerIntake | null {
  if (!isRecord(value)
    || !hasOnlyKeys(value, [
      "version", "lessonDrafts", "announcementSuggestions", "backlogCaptures", "decisionById",
    ])
    || value.version !== PLANNER_INTAKE_VERSION
    || !Array.isArray(value.lessonDrafts)
    || value.lessonDrafts.length > 200
    || !value.lessonDrafts.every(isLessonDraft)
    || !Array.isArray(value.announcementSuggestions)
    || value.announcementSuggestions.length > 200
    || !value.announcementSuggestions.every(isAnnouncementSuggestion)
    || !Array.isArray(value.backlogCaptures)
    || value.backlogCaptures.length > 200
    || !value.backlogCaptures.every(isBacklogCapture)
    || !isDecisionRecord(value.decisionById)) return null;

  const allIds = [
    ...value.lessonDrafts.map((item) => item.id),
    ...value.announcementSuggestions.map((item) => item.id),
    ...value.backlogCaptures.map((item) => item.id),
  ];
  if (new Set(allIds).size !== allIds.length) return null;
  if (Object.keys(value.decisionById).some((id) => !allIds.includes(id))) return null;
  return detachedIntake(value as PlannerIntake);
}

function parsePlannerIntakeItem(
  value: unknown,
): PlannerLessonDraft | PlannerAnnouncementSuggestion | PlannerBacklogCapture | null {
  if (!isRecord(value)) return null;
  const candidate = emptyPlannerIntake();
  if (value.kind === "lesson-draft") candidate.lessonDrafts = [value as PlannerLessonDraft];
  else if (value.kind === "announcement") {
    candidate.announcementSuggestions = [value as PlannerAnnouncementSuggestion];
  } else if (value.kind === "backlog-capture") {
    candidate.backlogCaptures = [value as PlannerBacklogCapture];
  } else return null;
  const parsed = parsePlannerIntake(candidate);
  if (!parsed) return null;
  return parsed.lessonDrafts[0]
    ?? parsed.announcementSuggestions[0]
    ?? parsed.backlogCaptures[0]
    ?? null;
}

export function addPlannerIntakeItem(
  intake: PlannerIntake,
  item: PlannerLessonDraft | PlannerAnnouncementSuggestion | PlannerBacklogCapture,
): PlannerIntake | null {
  const parsed = parsePlannerIntake(intake);
  const parsedItem = parsePlannerIntakeItem(item);
  if (!parsed || !parsedItem) return null;
  const existingItem = [
    ...parsed.lessonDrafts,
    ...parsed.announcementSuggestions,
    ...parsed.backlogCaptures,
  ].find((candidate) => candidate.id === parsedItem.id);
  if (existingItem) return jsonValuesEqual(existingItem, parsedItem) ? parsed : null;
  const candidate: PlannerIntake = {
    ...parsed,
    lessonDrafts: parsedItem.kind === "lesson-draft"
      ? [...parsed.lessonDrafts, parsedItem]
      : parsed.lessonDrafts,
    announcementSuggestions: parsedItem.kind === "announcement"
      ? [...parsed.announcementSuggestions, parsedItem]
      : parsed.announcementSuggestions,
    backlogCaptures: parsedItem.kind === "backlog-capture"
      ? [...parsed.backlogCaptures, parsedItem]
      : parsed.backlogCaptures,
  };
  return parsePlannerIntake(candidate);
}

export function decidePlannerIntakeItem(
  intake: PlannerIntake,
  id: string,
  decision: PlannerIntakeDecision,
): PlannerIntake | null {
  const parsed = parsePlannerIntake(intake);
  if (!parsed) return null;
  const ids = new Set([
    ...parsed.lessonDrafts.map((item) => item.id),
    ...parsed.announcementSuggestions.map((item) => item.id),
    ...parsed.backlogCaptures.map((item) => item.id),
  ]);
  if (!ids.has(id)) return null;
  return parsePlannerIntake({
    ...parsed,
    decisionById: { ...parsed.decisionById, [id]: decision },
  });
}

/** Extracts only same-line text after an explicit `$backlog` marker. */
export function extractBacklogMarkers(reflection: string): string[] {
  const requests = reflection.split(/\r?\n/).flatMap((line) => {
    const marker = line.match(/\$backlog\b\s*:?\s*(.+)$/i);
    const request = marker?.[1]?.trim() ?? "";
    return request && request.length <= 1_000 ? [request] : [];
  });
  return [...new Set(requests)];
}

export function lessonDraftCompatibility(
  draft: PlannerLessonDraft,
  target: PlannerDraftTarget,
  phases: ReadonlyArray<Pick<PlannerDraftPhase, "phaseId" | "title" | "time">>,
): PlannerDraftCompatibility {
  const normalizedClassName = (value: string) => value
    .trim()
    .replace(/\s+LESSON$/i, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
  const classMatches = draft.target.classId === target.classId
    && (draft.target.classId !== null
      || normalizedClassName(draft.target.className) === normalizedClassName(target.className));
  if (draft.target.lessonDate !== target.lessonDate || !classMatches) {
    return {
      status: "target-mismatch",
      message: `This draft is for ${draft.target.className} on ${draft.target.lessonDate}.`,
    };
  }
  const phaseById = new Map(phases.map((phase) => [phase.phaseId, phase]));
  const mismatch = draft.phases.find((phase) => {
    const current = phaseById.get(phase.phaseId);
    return !current || current.title !== phase.title || current.time !== phase.time;
  });
  return mismatch
    ? {
      status: "phase-mismatch",
      message: `${mismatch.title} ${mismatch.time} no longer matches this saved lesson.`,
    }
    : { status: "ready" };
}

export function announcementApplies(
  suggestion: PlannerAnnouncementSuggestion,
  classId: string | null,
  lessonDate: string,
): boolean {
  return suggestion.classId === classId
    && suggestion.effectiveStart <= lessonDate
    && lessonDate <= suggestion.effectiveEnd;
}

export function appendAnnouncement(current: string, suggestion: string): string {
  const normalizedSuggestion = suggestion.trim();
  if (!normalizedSuggestion) return current;
  const lines = current.split(/\r\n|\n|\r/).map((line) => line.trim()).filter(Boolean);
  if (lines.includes(normalizedSuggestion)) return current;
  if (!current) return normalizedSuggestion;
  const newline = current.includes("\r\n") ? "\r\n" : current.includes("\r") ? "\r" : "\n";
  const separator = current.endsWith("\n") || current.endsWith("\r") ? "" : newline;
  return `${current}${separator}${normalizedSuggestion}`;
}
