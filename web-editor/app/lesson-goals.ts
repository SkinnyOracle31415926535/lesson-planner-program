export const DEFAULT_LESSON_GOALS =
  "Keep rotations clear and use the lesson plan as the shared coaching reference.";

/** Defaults never replace a coach's written goals. */
export function loadDefaultLessonGoals(currentGoals: string): string {
  return currentGoals.trim() ? currentGoals : DEFAULT_LESSON_GOALS;
}
