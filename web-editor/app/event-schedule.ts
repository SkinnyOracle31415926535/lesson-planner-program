import {
  formatLessonTimeRange,
  normalizePickerTime,
  parseLessonTimeRange,
} from "./lesson-time";

export type EventSchedulePhase = Readonly<{ id: string; time: string }>;

export type EventScheduleGroup<TPhase extends EventSchedulePhase = EventSchedulePhase> = Readonly<{
  id: string;
  phases: readonly TPhase[];
}>;

export type EventWindow = Readonly<{ start: string; end: string }>;

export type EventScheduleIssue = Readonly<{
  kind: "invalid" | "gap" | "overlap";
  eventId: string;
  relatedEventId?: string;
}>;

export type EventSlotSwap = Readonly<{
  eventOrder: string[];
  timeByPhaseId: ReadonlyMap<string, string>;
}>;

function pickerMinutes(value: string): number | null {
  const normalized = normalizePickerTime(value);
  if (!normalized) return null;
  const [hour, minute] = normalized.split(":").map(Number);
  return (hour * 60) + minute;
}

function pickerValue(totalMinutes: number): string | null {
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0 || totalMinutes >= 1440 || totalMinutes % 5) return null;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function rangesFor(phases: readonly EventSchedulePhase[]) {
  return phases.map((phase) => parseLessonTimeRange(phase.time));
}

/** A complete event window exists only when every phase has a forward time range. */
export function eventWindow(phases: readonly EventSchedulePhase[]): EventWindow | null {
  if (!phases.length) return null;
  const ranges = rangesFor(phases);
  if (ranges.some((range) => range === null)) return null;
  const first = ranges[0]!;
  const last = ranges.at(-1)!;
  if (first.start >= last.end) return null;
  for (let index = 1; index < ranges.length; index += 1) {
    const previous = ranges[index - 1]!;
    const current = ranges[index]!;
    if (previous.end !== current.start || current.start >= current.end) return null;
  }
  return { start: first.start, end: last.end };
}

/** Reports invalid timing plus the gap/overlap between adjacent event windows. */
export function eventScheduleIssues(events: readonly EventScheduleGroup[]): EventScheduleIssue[] {
  const issues: EventScheduleIssue[] = [];
  const windows = events.map((event) => eventWindow(event.phases));
  events.forEach((event, index) => {
    if (!windows[index]) issues.push({ kind: "invalid", eventId: event.id });
  });
  for (let index = 1; index < events.length; index += 1) {
    const previous = windows[index - 1];
    const current = windows[index];
    if (!previous || !current) continue;
    if (previous.end < current.start) {
      issues.push({ kind: "gap", eventId: events[index].id, relatedEventId: events[index - 1].id });
    } else if (previous.end > current.start) {
      issues.push({ kind: "overlap", eventId: events[index].id, relatedEventId: events[index - 1].id });
    }
  }
  return issues;
}

function retimeEvent(phases: readonly EventSchedulePhase[], target: EventWindow): Map<string, string> | null {
  const source = eventWindow(phases);
  const sourceStart = source ? pickerMinutes(source.start) : null;
  const sourceEnd = source ? pickerMinutes(source.end) : null;
  const targetStart = pickerMinutes(target.start);
  const targetEnd = pickerMinutes(target.end);
  if (sourceStart === null || sourceEnd === null || targetStart === null || targetEnd === null) return null;
  const available = targetEnd - targetStart;
  if (available < phases.length * 5) return null;
  const sourceRanges = rangesFor(phases) as NonNullable<ReturnType<typeof parseLessonTimeRange>>[];
  const sourceDuration = sourceEnd - sourceStart;
  let remainingTarget = available;
  let remainingSource = sourceDuration;
  let cursor = targetStart;
  const result = new Map<string, string>();
  for (let index = 0; index < phases.length; index += 1) {
    const sourceRange = sourceRanges[index];
    const last = index === phases.length - 1;
    const phaseSourceDuration = pickerMinutes(sourceRange.end)! - pickerMinutes(sourceRange.start)!;
    const remainingPhases = phases.length - index - 1;
    let duration = last
      ? remainingTarget
      : Math.round((phaseSourceDuration / remainingSource) * remainingTarget / 5) * 5;
    duration = Math.max(5, Math.min(duration, remainingTarget - remainingPhases * 5));
    const start = pickerValue(cursor);
    const end = pickerValue(cursor + duration);
    if (!start || !end || start >= end) return null;
    result.set(phases[index].id, formatLessonTimeRange({ start, end }));
    cursor += duration;
    remainingTarget -= duration;
    remainingSource -= phaseSourceDuration;
  }
  return result;
}

/**
 * Swaps two adjacent event positions and moves each event into the other's
 * complete time slot. Internal phases are proportionally re-timed to remain
 * continuous on five-minute boundaries.
 */
export function swapAdjacentEventSlots(
  events: readonly EventScheduleGroup[],
  eventId: string,
  direction: "up" | "down",
): EventSlotSwap | null {
  const index = events.findIndex((event) => event.id === eventId);
  const otherIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || otherIndex < 0 || otherIndex >= events.length) return null;
  const first = events[index];
  const second = events[otherIndex];
  const firstWindow = eventWindow(first.phases);
  const secondWindow = eventWindow(second.phases);
  if (!firstWindow || !secondWindow) return null;
  const firstTimes = retimeEvent(first.phases, secondWindow);
  const secondTimes = retimeEvent(second.phases, firstWindow);
  if (!firstTimes || !secondTimes) return null;
  const eventOrder = events.map((event) => event.id);
  [eventOrder[index], eventOrder[otherIndex]] = [eventOrder[otherIndex], eventOrder[index]];
  return { eventOrder, timeByPhaseId: new Map([...firstTimes, ...secondTimes]) };
}

/** Preserves each valid event duration and removes timing gaps/overlaps. */
export function repairEventTimes(events: readonly EventScheduleGroup[]): ReadonlyMap<string, string> | null {
  const first = events.find((event) => eventWindow(event.phases));
  const initialWindow = first ? eventWindow(first.phases) : null;
  const initialStart = initialWindow ? pickerMinutes(initialWindow.start) : null;
  if (initialStart === null || events.some((event) => !eventWindow(event.phases))) return null;
  let cursor = initialStart;
  const result = new Map<string, string>();
  for (const event of events) {
    const window = eventWindow(event.phases)!;
    const duration = pickerMinutes(window.end)! - pickerMinutes(window.start)!;
    const targetStart = pickerValue(cursor);
    const targetEnd = pickerValue(cursor + duration);
    if (!targetStart || !targetEnd) return null;
    const revised = retimeEvent(event.phases, { start: targetStart, end: targetEnd });
    if (!revised) return null;
    revised.forEach((time, phaseId) => result.set(phaseId, time));
    cursor += duration;
  }
  return result;
}

/** Start choices for a new event strictly inside the preceding/next time boundary. */
export function eventStartOptionsBetween(previousStart: string | null, nextStart: string | null): string[] {
  const previousMinutes = previousStart ? pickerMinutes(previousStart) : null;
  const nextMinutes = nextStart ? pickerMinutes(nextStart) : null;
  if (previousMinutes === null || nextMinutes === null || nextMinutes - previousMinutes < 10) return [];
  const choices: string[] = [];
  for (let minute = previousMinutes + 5; minute < nextMinutes; minute += 5) {
    const value = pickerValue(minute);
    if (value) choices.push(value);
  }
  return choices;
}

export function insertedEventStartOptions(
  previousEvent: readonly EventSchedulePhase[],
  nextEvent: readonly EventSchedulePhase[],
): string[] {
  const previous = eventWindow(previousEvent);
  const next = eventWindow(nextEvent);
  const previousStart = previous?.start ?? null;
  const nextStart = next?.start ?? null;
  return eventStartOptionsBetween(previousStart, nextStart);
}
