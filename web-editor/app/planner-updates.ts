/**
 * Browser-local advisory rules for the planner update inbox.
 *
 * This module deliberately has no storage, UI, network, calendar, or AI
 * dependency. Callers provide the current lesson and any already-calculated
 * schedule availability; the returned cards explain exactly which local rule
 * produced each update.
 */

import type { LessonPhase } from "./lesson-data";
import {
  formatLessonTimePickerValue,
  parseLessonTimeRange,
} from "./lesson-time";
import type { SafeScheduleDayResolution } from "./local-schedule";

export type PlannerUpdatePriority = "URGENT" | "ATTENTION" | "REMINDER";

export type PlannerUpdateRule =
  | "invalid-phase-time"
  | "phase-time-overlap"
  | "phase-time-gap"
  | "event-time-overlap"
  | "event-time-gap"
  | "missing-phase-title"
  | "missing-phase-plan"
  | "explicit-phase-cue"
  | "explicit-card-safety"
  | "explicit-card-mats"
  | "schedule-not-ready"
  | "schedule-collision-warning"
  | "schedule-event-conflict";

/**
 * This intentionally keeps the five fields used by the existing local update
 * inbox, while adding explicit rule and scope data for future UI treatment.
 */
export type PlannerUpdate = {
  id: string;
  revisionId: string;
  source: "LOCAL PLANNER RULE";
  priority: PlannerUpdatePriority;
  rule: PlannerUpdateRule;
  title: string;
  summary: string;
  phaseIds: string[];
  eventIds: string[];
};

/**
 * These rules mean the lesson itself is incomplete or internally
 * contradictory. A stored inbox decision records review, but does not make a
 * required plan item complete, so these continue to block Ready.
 */
export const READY_BLOCKING_PLANNER_UPDATE_RULES = [
  "invalid-phase-time",
  "phase-time-overlap",
  "phase-time-gap",
  "event-time-overlap",
  "event-time-gap",
  "missing-phase-title",
  "missing-phase-plan",
] as const satisfies readonly PlannerUpdateRule[];

/**
 * Imported schedule availability is advisory: it is never auto-resolved or
 * treated as a reservation. Before Ready, the coach must explicitly record a
 * decision for these schedule-related advisories.
 */
export const READY_REVIEW_PLANNER_UPDATE_RULES = [
  "schedule-not-ready",
  "schedule-collision-warning",
  "schedule-event-conflict",
] as const satisfies readonly PlannerUpdateRule[];

export type LessonReadinessReview = Readonly<{
  /** Required lesson-plan issues that cannot be waived by an inbox decision. */
  blockingPlanUpdates: PlannerUpdate[];
  /** Advisory schedule updates with no explicit local decision yet. */
  pendingScheduleReviewUpdates: PlannerUpdate[];
}>;

/** A caller-supplied advisory conflict; it never makes or changes a reservation. */
export type PlannerScheduleEventConflict = Readonly<{
  eventId: string;
  unavailablePanelIds?: readonly string[];
  detail?: string;
}>;

/**
 * The update helper does not calculate availability itself. That stays in the
 * schedule helper so this function can remain a pure lesson-plan checker.
 */
export type PlannerScheduleAvailability = Readonly<{
  status: SafeScheduleDayResolution["status"] | "not_linked";
  collisionWarningCount?: number;
  eventConflicts?: readonly PlannerScheduleEventConflict[];
}>;

export type PlannerUpdatesInput = Readonly<{
  phases: readonly LessonPhase[];
  schedule?: PlannerScheduleAvailability | null;
}>;

type ParsedPhase = {
  phase: LessonPhase;
  eventId: string;
  range: { start: number; end: number } | null;
};

type EventGroup = {
  id: string;
  label: string;
  phases: ParsedPhase[];
};

type EventWindow = {
  start: number;
  end: number;
};

const SOURCE = "LOCAL PLANNER RULE" as const;

/** A stable key for storing a local review decision for one update revision. */
export function plannerUpdateRevisionKey(update: Pick<PlannerUpdate, "id" | "revisionId">): string {
  return `${update.id}:${update.revisionId}`;
}

/** True when the update describes required lesson content that blocks Ready. */
export function isReadyBlockingPlannerUpdate(update: Pick<PlannerUpdate, "rule">): boolean {
  return (READY_BLOCKING_PLANNER_UPDATE_RULES as readonly PlannerUpdateRule[]).includes(update.rule);
}

/** True when an imported-schedule advisory needs an explicit local decision before Ready. */
export function requiresReadyReview(update: Pick<PlannerUpdate, "rule">): boolean {
  return (READY_REVIEW_PLANNER_UPDATE_RULES as readonly PlannerUpdateRule[]).includes(update.rule);
}

/**
 * Separates non-waivable lesson-plan blockers from advisory schedule cards
 * that still need the coach's explicit review. This is intentionally pure:
 * it only reads caller-owned updates and local decision values.
 */
export function getLessonReadinessReview(
  updates: readonly PlannerUpdate[],
  decisionByRevision: Readonly<Record<string, string | undefined>>,
): LessonReadinessReview {
  return {
    blockingPlanUpdates: updates.filter(isReadyBlockingPlannerUpdate),
    pendingScheduleReviewUpdates: updates.filter((update) => {
      if (!requiresReadyReview(update)) return false;
      return !decisionByRevision[plannerUpdateRevisionKey(update)]?.trim();
    }),
  };
}

const priorityRank: Record<PlannerUpdatePriority, number> = {
  URGENT: 0,
  ATTENTION: 1,
  REMINDER: 2,
};

function minutesForPickerValue(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return (hour * 60) + minute;
}

function pickerValue(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function displayMinute(minutes: number): string {
  return formatLessonTimePickerValue(pickerValue(minutes)) ?? pickerValue(minutes);
}

function durationLabel(minutes: number): string {
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function eventIdFor(phase: LessonPhase): string {
  return nonEmpty(phase.eventId) ?? phase.id;
}

function phaseLabel(phase: LessonPhase): string {
  return nonEmpty(phase.title) ?? "Untitled phase";
}

function eventLabel(phases: readonly ParsedPhase[]): string {
  return phases.map(({ phase }) => nonEmpty(phase.eventLabel)).find((label): label is string => Boolean(label))
    ?? (phases[0] ? phaseLabel(phases[0].phase) : "Untitled event");
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function createUpdate(
  rule: PlannerUpdateRule,
  priority: PlannerUpdatePriority,
  title: string,
  summary: string,
  phaseIds: readonly string[] = [],
  eventIds: readonly string[] = [],
): PlannerUpdate {
  const identity = [rule, ...phaseIds, ...eventIds].join("|");
  const revision = [rule, title, summary, ...phaseIds, ...eventIds].join("|");
  return {
    id: `planner-${rule}-${hash(identity)}`,
    revisionId: `local-rules-v1-${hash(revision)}`,
    source: SOURCE,
    priority,
    rule,
    title,
    summary,
    phaseIds: [...phaseIds],
    eventIds: [...eventIds],
  };
}

function eventGroups(phases: readonly LessonPhase[]): EventGroup[] {
  const groups = new Map<string, EventGroup>();
  phases.forEach((phase) => {
    const eventId = eventIdFor(phase);
    const parsed = parseLessonTimeRange(phase.time);
    const entry: ParsedPhase = {
      phase,
      eventId,
      range: parsed ? { start: minutesForPickerValue(parsed.start), end: minutesForPickerValue(parsed.end) } : null,
    };
    const existing = groups.get(eventId);
    if (existing) existing.phases.push(entry);
    else groups.set(eventId, { id: eventId, label: eventLabel([entry]), phases: [entry] });
  });
  return [...groups.values()];
}

/** Only fully timed events participate in event-to-event timing checks. */
function eventWindow(event: EventGroup): EventWindow | null {
  if (!event.phases.length || event.phases.some(({ range }) => !range)) return null;
  const ranges = event.phases.map(({ range }) => range!);
  return {
    start: Math.min(...ranges.map((range) => range.start)),
    end: Math.max(...ranges.map((range) => range.end)),
  };
}

function hasPlannedContent(phase: LessonPhase): boolean {
  return phase.text.some((item) => Boolean(nonEmpty(item)))
    || Boolean(phase.textCards?.length)
    || phase.zones.some((zone) => zone.cards.length > 0);
}

function explicitPhaseCues(phase: LessonPhase): Array<{ kind: "Safety" | "Setup"; text: string }> {
  const candidates = [phase.note ?? "", ...phase.text];
  const seen = new Set<string>();
  return candidates.flatMap((candidate) => {
    const match = candidate.trim().match(/^(safety|setup)\s*:\s*(.+)$/i);
    if (!match) return [];
    const kind = match[1].toLocaleLowerCase() === "safety" ? "Safety" : "Setup";
    const text = match[2].trim();
    const key = `${kind}|${text}`;
    if (!text || seen.has(key)) return [];
    seen.add(key);
    return [{ kind, text }];
  });
}

function scheduleStatusCopy(status: PlannerScheduleAvailability["status"]): string {
  switch (status) {
    case "not_linked":
      return "Link this lesson’s class to an imported schedule group before availability can be checked.";
    case "group_required":
      return "Choose an imported schedule group before availability can be checked.";
    case "manual_week_confirmation_required":
      return "Confirm the Odd or Even schedule week before availability can be checked.";
    case "outside_schedule_range":
      return "This lesson date is outside the imported schedule range.";
    case "no_blocks_for_group":
      return "The linked schedule group has no blocks for this lesson date.";
    case "ready":
      return "";
  }
}

/**
 * Generates deterministic, local-only advisory cards. It never mutates the
 * provided lesson, stores decisions, calls an API, or reserves any equipment.
 */
export function generatePlannerUpdates(input: PlannerUpdatesInput): PlannerUpdate[] {
  const updates: PlannerUpdate[] = [];
  const groups = eventGroups(input.phases);
  const eventById = new Map(groups.map((event) => [event.id, event]));

  input.phases.forEach((phase) => {
    const eventId = eventIdFor(phase);
    const parsedRange = parseLessonTimeRange(phase.time);
    const label = phaseLabel(phase);

    if (!parsedRange) {
      updates.push(createUpdate(
        "invalid-phase-time",
        "ATTENTION",
        `Set a valid time for ${label}`,
        `${label} has ${nonEmpty(phase.time) ? `“${phase.time.trim()}”` : "no time"}. A time range is needed before timing conflicts can be checked.`,
        [phase.id],
        [eventId],
      ));
    }

    if (!nonEmpty(phase.title)) {
      updates.push(createUpdate(
        "missing-phase-title",
        "ATTENTION",
        "Name this phase",
        "This phase has no name, so it will be difficult to identify in the lesson plan.",
        [phase.id],
        [eventId],
      ));
    }

    if (!hasPlannedContent(phase)) {
      updates.push(createUpdate(
        "missing-phase-plan",
        "ATTENTION",
        `Add a plan for ${label}`,
        `${label} has no activity text, placed lesson card, or area card yet. Notes alone do not count as a planned activity.`,
        [phase.id],
        [eventId],
      ));
    }

    explicitPhaseCues(phase).forEach(({ kind, text }, index) => {
      updates.push(createUpdate(
        "explicit-phase-cue",
        "REMINDER",
        `${kind} cue for ${label}`,
        text,
        [`${phase.id}:cue:${index}`],
        [eventId],
      ));
    });

    [...(phase.textCards ?? []), ...phase.zones.flatMap((zone) => zone.cards)].forEach((card) => {
      const safety = nonEmpty(card.safety);
      if (safety) {
        updates.push(createUpdate(
          "explicit-card-safety",
          "REMINDER",
          `Safety reminder: ${card.title}`,
          safety,
          [`${phase.id}:card:${card.id}:safety`],
          [eventId],
        ));
      }
      const mats = [...new Set((card.mats ?? []).map((mat) => mat.trim()).filter(Boolean))];
      if (mats.length) {
        updates.push(createUpdate(
          "explicit-card-mats",
          "REMINDER",
          `Set up mats for ${card.title}`,
          `Bring: ${mats.join(", ")}.`,
          [`${phase.id}:card:${card.id}:mats`],
          [eventId],
        ));
      }
    });
  });

  groups.forEach((event) => {
    event.phases.slice(1).forEach((current, index) => {
      const previous = event.phases[index];
      if (!previous.range || !current.range) return;
      const difference = current.range.start - previous.range.end;
      if (difference < 0) {
        updates.push(createUpdate(
          "phase-time-overlap",
          "URGENT",
          `Phase overlap in ${event.label}`,
          `${phaseLabel(previous.phase)} runs until ${displayMinute(previous.range.end)}, after ${phaseLabel(current.phase)} starts at ${displayMinute(current.range.start)}.`,
          [previous.phase.id, current.phase.id],
          [event.id],
        ));
      } else if (difference > 0) {
        updates.push(createUpdate(
          "phase-time-gap",
          "ATTENTION",
          `Phase gap in ${event.label}`,
          `${durationLabel(difference)} is unplanned between ${phaseLabel(previous.phase)} and ${phaseLabel(current.phase)}.`,
          [previous.phase.id, current.phase.id],
          [event.id],
        ));
      }
    });
  });

  groups.slice(1).forEach((event, index) => {
    const previous = groups[index];
    const previousWindow = eventWindow(previous);
    const currentWindow = eventWindow(event);
    if (!previousWindow || !currentWindow) return;
    const difference = currentWindow.start - previousWindow.end;
    if (difference < 0) {
      updates.push(createUpdate(
        "event-time-overlap",
        "URGENT",
        `Event overlap: ${previous.label} and ${event.label}`,
        `${previous.label} runs until ${displayMinute(previousWindow.end)}, after ${event.label} starts at ${displayMinute(currentWindow.start)}.`,
        [],
        [previous.id, event.id],
      ));
    } else if (difference > 0) {
      updates.push(createUpdate(
        "event-time-gap",
        "ATTENTION",
        `Event gap before ${event.label}`,
        `${durationLabel(difference)} is unplanned between ${previous.label} and ${event.label}.`,
        [],
        [previous.id, event.id],
      ));
    }
  });

  const schedule = input.schedule;
  if (schedule && schedule.status !== "ready") {
    updates.push(createUpdate(
      "schedule-not-ready",
      "ATTENTION",
      "Schedule availability is not ready",
      `${scheduleStatusCopy(schedule.status)} This is advisory only and does not reserve equipment.`,
    ));
  }
  if (schedule && (schedule.collisionWarningCount ?? 0) > 0) {
    const count = schedule.collisionWarningCount ?? 0;
    updates.push(createUpdate(
      "schedule-collision-warning",
      "ATTENTION",
      "Imported schedule needs review",
      `${count} imported schedule collision warning${count === 1 ? " remains" : "s remain"}. Availability is advisory only.`,
    ));
  }
  schedule?.eventConflicts?.forEach((conflict) => {
    const event = eventById.get(conflict.eventId);
    const panels = [...new Set((conflict.unavailablePanelIds ?? []).map((panelId) => panelId.trim()).filter(Boolean))];
    const detail = nonEmpty(conflict.detail)
      ?? (panels.length ? `${panels.join(", ")} ${panels.length === 1 ? "is" : "are"} unavailable for this event.` : "The linked schedule has an availability conflict for this event.");
    updates.push(createUpdate(
      "schedule-event-conflict",
      "ATTENTION",
      `Schedule conflict${event ? `: ${event.label}` : ""}`,
      `${detail} This is advisory only and does not reserve equipment.`,
      event?.phases.map(({ phase }) => phase.id) ?? [],
      [conflict.eventId],
    ));
  });

  return updates
    .map((update, index) => ({ update, index }))
    .sort((first, second) => priorityRank[first.update.priority] - priorityRank[second.update.priority] || first.index - second.index)
    .map(({ update }) => update);
}
