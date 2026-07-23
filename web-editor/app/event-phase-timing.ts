import {
  formatLessonTimeRange,
  normalizePickerTime,
  parseLessonTimeRange,
  type LessonTimePickerRange,
} from "./lesson-time";

export type EventPhaseTime = Readonly<{ id: string; time: string }>;

export type EventPhaseTimeBounds = Readonly<{
  start: string;
  end: string;
}>;

function pickerMinutes(value: string): number | null {
  const normalized = normalizePickerTime(value);
  if (!normalized) return null;
  const [hour, minute] = normalized.split(":").map(Number);
  return (hour * 60) + minute;
}

function pickerValue(totalMinutes: number): string {
  const bounded = Math.max(0, Math.min((23 * 60) + 55, totalMinutes));
  return `${String(Math.floor(bounded / 60)).padStart(2, "0")}:${String(bounded % 60).padStart(2, "0")}`;
}

function rangeFor(phase: EventPhaseTime): LessonTimePickerRange | null {
  return parseLessonTimeRange(phase.time);
}

/** The first known start and final known end preserve an event's original window. */
export function eventPhaseTimeBounds(phases: readonly EventPhaseTime[]): EventPhaseTimeBounds | null {
  const first = phases.map(rangeFor).find((range): range is LessonTimePickerRange => range !== null);
  const last = [...phases].reverse().map(rangeFor).find((range): range is LessonTimePickerRange => range !== null);
  return first && last && first.start < last.end ? { start: first.start, end: last.end } : null;
}

/** Returns the fixed automatic end for one phase, including a pending final phase. */
export function eventPhaseEnd(phases: readonly EventPhaseTime[], phaseIndex: number): string | null {
  const bounds = eventPhaseTimeBounds(phases);
  if (!bounds || phaseIndex < 0 || phaseIndex >= phases.length) return null;
  return (phases[phaseIndex + 1] ? rangeFor(phases[phaseIndex + 1])?.start : null) ?? bounds.end;
}

/** Valid start options stay strictly between the neighboring event boundaries. */
export function eventPhaseStartOptions(phases: readonly EventPhaseTime[], phaseIndex: number): string[] {
  const bounds = eventPhaseTimeBounds(phases);
  if (!bounds || phaseIndex < 0 || phaseIndex >= phases.length) return [];
  const minimum = phaseIndex === 0 ? "00:00" : rangeFor(phases[phaseIndex - 1])?.start;
  const maximum = eventPhaseEnd(phases, phaseIndex);
  const minimumMinutes = minimum ? pickerMinutes(minimum) : null;
  const maximumMinutes = maximum ? pickerMinutes(maximum) : null;
  if (minimumMinutes === null || maximumMinutes === null) return [];
  const options: string[] = [];
  for (let minute = minimumMinutes + 5; minute < maximumMinutes; minute += 5) options.push(pickerValue(minute));
  return options;
}

/** Keeps the preceding phase flush with a newly chosen start time. */
export function reflowEventPhaseStart(
  phases: readonly EventPhaseTime[],
  phaseId: string,
  selectedStart: string,
): EventPhaseTime[] {
  const phaseIndex = phases.findIndex((phase) => phase.id === phaseId);
  const start = normalizePickerTime(selectedStart);
  const end = eventPhaseEnd(phases, phaseIndex);
  if (phaseIndex < 0 || !start || !end || !eventPhaseStartOptions(phases, phaseIndex).includes(start)) return [...phases];
  const next = phases.map((phase) => ({ ...phase }));
  next[phaseIndex] = { ...next[phaseIndex], time: formatLessonTimeRange({ start, end }) };
  if (phaseIndex > 0) {
    const previous = rangeFor(next[phaseIndex - 1]);
    if (!previous || previous.start >= start) return [...phases];
    next[phaseIndex - 1] = {
      ...next[phaseIndex - 1],
      time: formatLessonTimeRange({ start: previous.start, end: start }),
    };
  }
  return next;
}

/** Restores the prior phase through the removed phase's former end boundary. */
export function removeEventPhaseTiming(phases: readonly EventPhaseTime[], phaseId: string): EventPhaseTime[] {
  const phaseIndex = phases.findIndex((phase) => phase.id === phaseId);
  if (phaseIndex < 0) return [...phases];
  const removed = phases[phaseIndex];
  const removedRange = rangeFor(removed);
  const next = phases.filter((phase) => phase.id !== phaseId).map((phase) => ({ ...phase }));
  if (phaseIndex > 0 && removedRange) {
    const previous = rangeFor(next[phaseIndex - 1]);
    if (previous && previous.start < removedRange.end) {
      next[phaseIndex - 1] = {
        ...next[phaseIndex - 1],
        time: formatLessonTimeRange({ start: previous.start, end: removedRange.end }),
      };
    }
  }
  return next;
}

export function canAppendEventPhase(phases: readonly EventPhaseTime[]): boolean {
  const bounds = eventPhaseTimeBounds(phases);
  const lastRange = rangeFor(phases[phases.length - 1]);
  const start = bounds ? pickerMinutes(bounds.start) : null;
  const end = bounds ? pickerMinutes(bounds.end) : null;
  return Boolean(lastRange && start !== null && end !== null && end - start >= 10);
}
