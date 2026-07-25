import type { LessonPhase } from "./lesson-data";
import { formatLessonTimeRange, normalizePickerTime, parseLessonTimeRange } from "./lesson-time";

export type LessonScheduleReconciliation = {
  phases: LessonPhase[];
  preservedCustomCount: number;
  preservedScheduledCount: number;
  removedEmptyCount: number;
  /** Lets the selected phase follow a schedule shell when its source ID changes. */
  replacementPhaseIdByOldId: Record<string, string>;
};

function isScheduleGeneratedPhase(phase: LessonPhase): boolean {
  return phase.id.startsWith("schedule-safe-") || phase.id.startsWith("schedule-local-");
}

function eventIdFor(phase: LessonPhase): string {
  return phase.eventId ?? phase.id;
}

function normalizedTitle(phase: LessonPhase): string {
  return phase.title.trim().toLocaleLowerCase();
}

function sameTimeRange(first: LessonPhase, second: LessonPhase): boolean {
  const firstRange = parseLessonTimeRange(first.time);
  const secondRange = parseLessonTimeRange(second.time);
  return Boolean(firstRange && secondRange
    && firstRange.start === secondRange.start
    && firstRange.end === secondRange.end);
}

function phaseStartSortKey(phase: LessonPhase): { start: number; end: number } | null {
  const range = parseLessonTimeRange(phase.time);
  if (!range) return null;
  const toMinute = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return (hour * 60) + minute;
  };
  return { start: toMinute(range.start), end: toMinute(range.end) };
}

function chronologicallyOrdered(phases: LessonPhase[]): LessonPhase[] {
  const ordered = phases
    .map((phase, index) => ({ phase, index, key: phaseStartSortKey(phase) }))
    .sort((first, second) => {
      if (!first.key || !second.key) {
        if (!first.key && !second.key) return first.index - second.index;
        return first.key ? -1 : 1;
      }
      return first.key.start - second.key.start
        || first.key.end - second.key.end
        || first.index - second.index;
    })
    .map(({ phase }) => phase);
  const pendingBeforeBoundary = ordered.filter((phase) => {
    const boundary = normalizePickerTime(phase.pendingEventEnd ?? "");
    return !parseLessonTimeRange(phase.time)
      && Boolean(boundary)
      && ordered.some((candidate) => parseLessonTimeRange(candidate.time)?.start === boundary);
  });
  if (!pendingBeforeBoundary.length) return ordered;

  const pendingIds = new Set(pendingBeforeBoundary.map((phase) => phase.id));
  const withPendingEventsPlaced = ordered.filter((phase) => !pendingIds.has(phase.id));
  pendingBeforeBoundary.forEach((phase) => {
    const boundary = normalizePickerTime(phase.pendingEventEnd ?? "");
    const insertAt = withPendingEventsPlaced.findIndex(
      (candidate) => parseLessonTimeRange(candidate.time)?.start === boundary,
    );
    if (insertAt >= 0) withPendingEventsPlaced.splice(insertAt, 0, phase);
  });
  return withPendingEventsPlaced;
}

function isEmptyUnscheduledShell(phase: LessonPhase): boolean {
  return phase.id.startsWith("unscheduled-")
    && phase.title === "UNSCHEDULED LESSON"
    && phase.time === "TBD"
    && phase.mode === "MIXED"
    && phase.zones.length === 0
    && !phase.parkedZones?.length
    && phase.text.length === 0
    && !phase.textCards?.length
    && !phase.note?.trim();
}

/**
 * Scheduled phases open in MIXED mode with one blank cue so the coach can
 * write immediately. That UI affordance is not authored planning content and
 * must not survive a schedule refresh as though it were a real coaching cue.
 */
function isEmptyWritableScheduledShell(phase: LessonPhase): boolean {
  return isScheduleGeneratedPhase(phase)
    && phase.mode === "MIXED"
    && phase.zones.length === 0
    && !phase.parkedZones?.length
    && phase.text.length === 1
    && !phase.text[0]?.trim()
    && !phase.textCards?.length
    && !phase.note?.trim();
}

/** True when removing a phase would discard coach-entered planning work. */
export function phaseHasCoachPlanningContent(phase: LessonPhase): boolean {
  if (isEmptyUnscheduledShell(phase) || isEmptyWritableScheduledShell(phase)) return false;
  return phase.mode !== "VISUAL"
    || phase.zones.length > 0
    || Boolean(phase.parkedZones?.length)
    || phase.text.length > 0
    || Boolean(phase.textCards?.length)
    || Boolean(phase.note?.trim());
}

function mergedScheduledPhase(scheduled: LessonPhase, existing: LessonPhase | undefined): LessonPhase {
  if (!existing || !phaseHasCoachPlanningContent(existing)) return scheduled;
  return {
    ...scheduled,
    mode: existing.mode,
    zones: existing.zones,
    parkedZones: existing.parkedZones ?? [],
    text: existing.text,
    textCards: existing.textCards ?? [],
    ...(existing.note?.trim() ? { note: existing.note } : {}),
  };
}

function matchedSchedulePhase(
  current: LessonPhase[],
  scheduled: LessonPhase,
  consumedIds: ReadonlySet<string>,
): LessonPhase | undefined {
  const sameTitleCandidates = current.filter((phase) => (
    !consumedIds.has(phase.id)
    && isScheduleGeneratedPhase(phase)
    && normalizedTitle(phase) === normalizedTitle(scheduled)
  ));
  const sameTimeCandidates = sameTitleCandidates.filter((phase) => sameTimeRange(phase, scheduled));
  if (sameTimeCandidates.length === 1) return sameTimeCandidates[0];
  return sameTitleCandidates.length === 1 ? sameTitleCandidates[0] : undefined;
}

function minuteOf(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return (hour * 60) + minute;
}

function pickerValue(minute: number): string | null {
  if (!Number.isInteger(minute) || minute < 0 || minute >= 1440 || minute % 5) return null;
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

/**
 * Keeps coach-created phases inside one scheduled event continuous when the
 * schedule changes that event's outer time window. The relative duration of
 * each existing phase is retained where possible.
 */
function retimeScheduledEvent(
  phases: LessonPhase[],
  scheduledTime: string,
  sourceTimingPhases: LessonPhase[] = phases,
): LessonPhase[] | null {
  const target = parseLessonTimeRange(scheduledTime);
  if (!target || !phases.length) return null;

  const targetStart = minuteOf(target.start);
  const targetEnd = minuteOf(target.end);
  const available = targetEnd - targetStart;
  if (available < phases.length * 5) return null;

  const sourceRanges = sourceTimingPhases.map((phase) => parseLessonTimeRange(phase.time));
  const sourceDurations = sourceRanges.every((range) => range !== null)
    ? sourceRanges.map((range) => minuteOf(range!.end) - minuteOf(range!.start))
    : phases.map(() => 1);
  let remainingSource = sourceDurations.reduce((total, duration) => total + duration, 0);
  let remainingTarget = available;
  let cursor = targetStart;

  const retimed: LessonPhase[] = [];
  for (let index = 0; index < phases.length; index += 1) {
    const remainingPhases = phases.length - index - 1;
    const last = index === phases.length - 1;
    let duration = last
      ? remainingTarget
      : Math.round((sourceDurations[index] / remainingSource) * remainingTarget / 5) * 5;
    duration = Math.max(5, Math.min(duration, remainingTarget - remainingPhases * 5));
    const start = pickerValue(cursor);
    const end = pickerValue(cursor + duration);
    if (!start || !end || start >= end) return null;
    retimed.push({ ...phases[index], time: formatLessonTimeRange({ start, end }) });
    cursor += duration;
    remainingTarget -= duration;
    remainingSource -= sourceDurations[index];
  }
  return retimed;
}

function shouldPreserveUnmatchedPhase(phase: LessonPhase): boolean {
  if (phaseHasCoachPlanningContent(phase)) return true;
  return !isScheduleGeneratedPhase(phase) && !isEmptyUnscheduledShell(phase);
}

function recordBoundaryRevision(
  revisions: Map<string, string | null>,
  existing: LessonPhase,
  scheduled: LessonPhase,
): void {
  const previousStart = parseLessonTimeRange(existing.time)?.start;
  const nextStart = parseLessonTimeRange(scheduled.time)?.start;
  if (!previousStart || !nextStart) return;
  const priorReplacement = revisions.get(previousStart);
  if (priorReplacement === undefined) {
    revisions.set(previousStart, nextStart);
  } else if (priorReplacement !== nextStart) {
    revisions.set(previousStart, null);
  }
}

function revisedPendingBoundary(
  phase: LessonPhase,
  revisions: ReadonlyMap<string, string | null>,
): LessonPhase {
  const currentBoundary = normalizePickerTime(phase.pendingEventEnd ?? "");
  const replacement = currentBoundary ? revisions.get(currentBoundary) : undefined;
  return typeof replacement === "string" && replacement !== currentBoundary
    ? { ...phase, pendingEventEnd: replacement }
    : phase;
}

function detachedEventId(existingEventId: string, occupiedEventIds: Set<string>): string {
  const base = `local-event-detached-${existingEventId}`;
  let candidate = base;
  let suffix = 2;
  while (occupiedEventIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  occupiedEventIds.add(candidate);
  return candidate;
}

/**
 * Rebuilds schedule-owned phase structure without discarding coaching work.
 * Schedule fields always come from the incoming template; coach-entered cues,
 * cards, stations, and display format survive when a shell can be matched.
 */
export function reconcileLessonSchedulePhases(
  current: LessonPhase[],
  scheduledPhases: LessonPhase[],
): LessonScheduleReconciliation {
  const currentById = new Map(current.map((phase) => [phase.id, phase]));
  const consumedIds = new Set<string>();
  const replacementPhaseIdByOldId: Record<string, string> = {};
  const pendingBoundaryRevisions = new Map<string, string | null>();
  const occupiedEventIds = new Set(
    [...current, ...scheduledPhases].flatMap((phase) => [phase.id, eventIdFor(phase)]),
  );
  let preservedScheduledCount = 0;

  const reconciledSchedule = scheduledPhases.flatMap((scheduled) => {
    const existingById = currentById.get(scheduled.id);
    const existing = existingById && !consumedIds.has(existingById.id)
      ? existingById
      : matchedSchedulePhase(current, scheduled, consumedIds);
    if (existing) {
      consumedIds.add(existing.id);
      replacementPhaseIdByOldId[existing.id] = scheduled.id;
      recordBoundaryRevision(pendingBoundaryRevisions, existing, scheduled);
      if (phaseHasCoachPlanningContent(existing)) preservedScheduledCount += 1;
    }
    const merged = mergedScheduledPhase(scheduled, existing);
    if (!existing) return [merged];

    const existingEventId = eventIdFor(existing);
    const existingEventPhases = current.filter((phase) => eventIdFor(phase) === existingEventId);
    if (existingEventPhases.length < 2) return [merged];

    const nextEventId = eventIdFor(scheduled);
    const sourceEventPhasesInOrder = [
      existing,
      ...existingEventPhases.filter((phase) => phase.id !== existing.id),
    ];
    const eventPhases = [
      merged,
      ...sourceEventPhasesInOrder
        .filter((phase) => phase.id !== existing.id)
        .map((phase) => ({ ...phase, eventId: nextEventId, eventLabel: scheduled.eventLabel ?? scheduled.title })),
    ];
    const retimed = retimeScheduledEvent(eventPhases, scheduled.time, sourceEventPhasesInOrder);
    if (!retimed) {
      const detachedId = detachedEventId(existingEventId, occupiedEventIds);
      const detachedPhases = sourceEventPhasesInOrder
        .filter((phase) => phase.id !== existing.id)
        .map((phase) => ({ ...phase, eventId: detachedId }));
      existingEventPhases.forEach((phase) => consumedIds.add(phase.id));
      return [merged, ...detachedPhases];
    }

    existingEventPhases.forEach((phase) => consumedIds.add(phase.id));
    return retimed;
  });

  const preservedCustom = current
    .filter((phase) => !consumedIds.has(phase.id) && shouldPreserveUnmatchedPhase(phase))
    .map((phase) => revisedPendingBoundary(phase, pendingBoundaryRevisions));
  const removedEmptyCount = current.filter((phase) => !consumedIds.has(phase.id) && !shouldPreserveUnmatchedPhase(phase)).length;

  return {
    phases: chronologicallyOrdered([...reconciledSchedule, ...preservedCustom]),
    preservedCustomCount: preservedCustom.length,
    preservedScheduledCount,
    removedEmptyCount,
    replacementPhaseIdByOldId,
  };
}
