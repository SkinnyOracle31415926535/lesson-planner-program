function isLessonPlanDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

/** Returns the coach's local calendar date without a UTC timezone shift. */
export function localLessonPlanDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Past snapshots are any valid lesson dates before the local current date. */
export function isPastLessonPlanDate(date: string, today = localLessonPlanDate()): boolean {
  return isLessonPlanDate(date) && date < today;
}
