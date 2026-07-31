/**
 * Tag helpers deliberately normalize only when a coach saves an Idea. Older
 * records retain their original text until then, while new choices avoid
 * duplicate spellings such as `warmup`, `warm-up`, and `Warm Up`.
 */
export type IdeaTagOption = Readonly<{
  key: string;
  label: string;
  count: number;
}>;

function rawTagValues(value: string | readonly string[]): string[] {
  return typeof value === "string" ? value.split(/[\n,]/) : [...value];
}

/** A case/spacing/punctuation-insensitive comparison key, not a display label. */
export function ideaTagKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Retains the first sensible label while removing empty and equivalent tags. */
export function normalizeIdeaTags(value: string | readonly string[]): string[] {
  const seen = new Set<string>();
  return rawTagValues(value).flatMap((raw) => {
    const label = raw.trim().replace(/\s+/g, " ");
    const key = ideaTagKey(label);
    if (!label || !key || seen.has(key)) return [];
    seen.add(key);
    return [label];
  });
}

/** Builds stable selectable choices from every saved Idea tag. */
export function ideaTagOptions(items: readonly Pick<{ tags: string[] }, "tags">[]): IdeaTagOption[] {
  const options = new Map<string, IdeaTagOption>();
  items.forEach((item) => normalizeIdeaTags(item.tags).forEach((label) => {
    const key = ideaTagKey(label);
    const existing = options.get(key);
    options.set(key, existing ? { ...existing, count: existing.count + 1 } : { key, label, count: 1 });
  }));
  return [...options.values()].sort((first, second) => second.count - first.count || first.label.localeCompare(second.label));
}

/** Adds or removes one tag using the same canonical comparison as the picker. */
export function toggleIdeaTag(current: readonly string[], candidate: string): string[] {
  const key = ideaTagKey(candidate);
  if (!key) return normalizeIdeaTags(current);
  const normalized = normalizeIdeaTags(current);
  return normalized.some((tag) => ideaTagKey(tag) === key)
    ? normalized.filter((tag) => ideaTagKey(tag) !== key)
    : normalizeIdeaTags([...normalized, candidate]);
}
