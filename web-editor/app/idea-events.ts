/** Shared, coach-facing event choices for Idea Library records. */
export const IDEA_EVENT_OPTIONS = [
  "VAULT",
  "BARS",
  "BEAM",
  "FLOOR",
  "TRAMPOLINE",
  "TUMBLE TRACK",
] as const;

function rawEventValues(value: string | readonly string[]): string[] {
  return typeof value === "string" ? value.split(/[\n,]/) : [...value];
}

/** Comparison key only; preserve the first coach-entered display spelling. */
export function ideaEventKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Remove empty/equivalent entries without dropping recognized custom events. */
export function normalizeIdeaEvents(value: string | readonly string[]): string[] {
  const seen = new Set<string>();
  return rawEventValues(value).flatMap((raw) => {
    const label = raw.trim().replace(/\s+/g, " ");
    const key = ideaEventKey(label);
    if (!label || !key || seen.has(key)) return [];
    seen.add(key);
    return [label];
  });
}

export function toggleIdeaEvent(current: readonly string[], candidate: string): string[] {
  const key = ideaEventKey(candidate);
  const normalized = normalizeIdeaEvents(current);
  if (!key) return normalized;
  return normalized.some((event) => ideaEventKey(event) === key)
    ? normalized.filter((event) => ideaEventKey(event) !== key)
    : normalizeIdeaEvents([...normalized, candidate]);
}

/** Adds a custom event without treating a duplicate as a removal request. */
export function addIdeaEvent(current: readonly string[], candidate: string): string[] {
  const key = ideaEventKey(candidate);
  const normalized = normalizeIdeaEvents(current);
  if (!key || normalized.some((event) => ideaEventKey(event) === key)) return normalized;
  return normalizeIdeaEvents([...normalized, candidate]);
}
