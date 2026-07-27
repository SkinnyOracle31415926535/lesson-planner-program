import type { ZonePanel } from "./lesson-data";

const IGNORED_AREA_WORDS = new Set([
  "ALL",
  "AREA",
  "EVENT",
  "PHOTO",
  "STATION",
  "THE",
]);

function compactAreaName(value: string): string {
  return value.toLocaleUpperCase().replace(/[^A-Z0-9]/g, "");
}

function singularAreaWord(value: string): string {
  return value.length > 3 && value.endsWith("S") ? value.slice(0, -1) : value;
}

function areaWords(value: string): Set<string> {
  return new Set(
    (value.toLocaleUpperCase().match(/[A-Z]+\d*/g) ?? [])
      .map(singularAreaWord)
      .filter((word) => !IGNORED_AREA_WORDS.has(word)),
  );
}

function zoneMatchesPhaseExactly(phaseName: string, zone: ZonePanel): boolean {
  const compactPhaseName = compactAreaName(phaseName);
  return Boolean(compactPhaseName)
    && [zone.alias, zone.title].some((label) => compactAreaName(label) === compactPhaseName);
}

/**
 * Finds the photo areas a coach has named for a phase. A direct label match
 * wins (PB / HB -> PB/HB); otherwise concise names such as F4 + TS can use
 * their individual areas.
 */
export function suggestedPhotoAreasForPhase(
  phaseName: string,
  availableAreas: readonly ZonePanel[],
): ZonePanel[] {
  const exactMatches = availableAreas.filter((area) => zoneMatchesPhaseExactly(phaseName, area));
  if (exactMatches.length) return exactMatches;

  const phaseWords = areaWords(phaseName);
  if (!phaseWords.size) return [];
  return availableAreas.filter((area) => [area.alias, area.title].some((label) => {
    const words = areaWords(label);
    return words.size > 0 && [...words].every((word) => phaseWords.has(word));
  }));
}

/** A saved choice, even a parked one, always takes precedence over automation. */
export function canAutoSelectPhotoAreas({
  zones,
  parkedZones,
}: Pick<LessonPhaseLike, "zones" | "parkedZones">): boolean {
  return zones.length === 0 && !(parkedZones?.length);
}

type LessonPhaseLike = {
  zones: ZonePanel[];
  parkedZones?: ZonePanel[];
};
