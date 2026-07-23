export type LessonTimePickerRange = {
  start: string;
  end: string;
};

type ParsedClock = {
  hour: number;
  minute: number;
  meridiem: "AM" | "PM" | null;
  paddedHour: boolean;
};

const FIVE_MINUTES = 5;
const LAST_PICKER_MINUTE = (23 * 60) + 55;

function parseClock(value: string): ParsedClock | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([ap])\.?m\.?)?$/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase() as "A" | "P" | undefined;
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  if (meridiem && (hour < 1 || hour > 12)) return null;
  if (!meridiem && (hour < 0 || hour > 23)) return null;

  return {
    hour,
    minute,
    meridiem: meridiem === "A" ? "AM" : meridiem === "P" ? "PM" : null,
    paddedHour: match[1].length === 2,
  };
}

function pickerValue(totalMinutes: number): string {
  const boundedMinutes = Math.max(0, Math.min(totalMinutes, LAST_PICKER_MINUTE));
  const hour = Math.floor(boundedMinutes / 60);
  const minute = boundedMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function roundedPickerValue(hour: number, minute: number): string {
  const roundedMinute = Math.round(minute / FIVE_MINUTES) * FIVE_MINUTES;
  return pickerValue((hour * 60) + roundedMinute);
}

function clockHour24(clock: ParsedClock, legacyUnmarkedTime: boolean): number {
  if (clock.meridiem === "AM") return clock.hour === 12 ? 0 : clock.hour;
  if (clock.meridiem === "PM") return clock.hour === 12 ? 12 : clock.hour + 12;

  // The supplied lesson used unpadded afternoon values such as 3:30–3:45.
  // Padded values come from the 24-hour picker and must remain literal.
  if (legacyUnmarkedTime && !clock.paddedHour && clock.hour >= 1 && clock.hour <= 7) {
    return clock.hour + 12;
  }
  return clock.hour;
}

function rangeIsForward(range: LessonTimePickerRange): boolean {
  return range.end > range.start;
}

/** Converts a browser time-picker value to a valid five-minute `HH:mm` value. */
export function normalizePickerTime(value: string): string | null {
  const clock = parseClock(value);
  if (!clock || clock.meridiem) return null;
  return roundedPickerValue(clock.hour, clock.minute);
}

/**
 * Detaches a saved lesson range from its display format for two time pickers.
 * Legacy unpadded 1:00–7:59 values are the supplied afternoon schedule.
 */
export function parseLessonTimeRange(value: string): LessonTimePickerRange | null {
  if (!value.trim() || value.trim().toUpperCase() === "TBD") return null;

  const parts = value.split(/\s*(?:–|-)\s*/);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const startClock = parseClock(parts[0]);
  const endClock = parseClock(parts[1]);
  if (!startClock || !endClock) return null;

  const legacyUnmarkedRange = !startClock.meridiem && !endClock.meridiem;
  const range = {
    start: roundedPickerValue(clockHour24(startClock, legacyUnmarkedRange), startClock.minute),
    end: roundedPickerValue(clockHour24(endClock, legacyUnmarkedRange), endClock.minute),
  };

  return rangeIsForward(range) ? range : null;
}

/** Gives one `HH:mm` picker option its consistent 12-hour label. */
export function formatLessonTimePickerValue(value: string): string | null {
  const normalized = normalizePickerTime(value);
  if (!normalized) return null;

  const [hourText, minute] = normalized.split(":");
  const hour = Number(hourText);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${meridiem}`;
}

/** Formats a complete picker range consistently, or `TBD` when it is unusable. */
export function formatLessonTimeRange(range: LessonTimePickerRange | null | undefined): string {
  if (!range) return "TBD";

  const start = normalizePickerTime(range.start);
  const end = normalizePickerTime(range.end);
  if (!start || !end || !rangeIsForward({ start, end })) return "TBD";

  const displayStart = formatLessonTimePickerValue(start);
  const displayEnd = formatLessonTimePickerValue(end);
  return displayStart && displayEnd ? `${displayStart}–${displayEnd}` : "TBD";
}

/** Formats parseable saved ranges while retaining unusual legacy notes verbatim. */
export function displayLessonTimeRange(value: string): string {
  const parsed = parseLessonTimeRange(value);
  return parsed ? formatLessonTimeRange(parsed) : value.trim() || "TBD";
}
