/**
 * Browser-local lesson-plan metadata and index helpers.
 *
 * Lesson contents stay in their own per-plan storage records. This module
 * deliberately owns only the small index that identifies a lesson by its
 * calendar date and selected local class. Keeping that identity here lets the
 * UI support two different classes on the same day without deriving storage
 * IDs from either the date or class name.
 */

export const LESSON_PLAN_INDEX_VERSION = 2 as const;
export const LEGACY_LESSON_PLAN_INDEX_VERSION = 1 as const;

const MAX_PLAN_ID_LENGTH = 160;
const MAX_CLASS_ID_LENGTH = 120;
const MAX_TITLE_LENGTH = 160;
const OPAQUE_LESSON_PLAN_ID = /^lesson-[a-z0-9][a-z0-9_-]{15,}$/i;
const SAFE_CLASS_ID = /^[a-z0-9][a-z0-9_-]*$/i;

export type LessonPlanStorage = "legacy" | "scoped";

/** The durable planning identity: one plan is allowed for each date/class pair. */
export type LessonPlanIdentity = Readonly<{
  date: string;
  /** Null represents an intentionally unassigned/sample lesson. */
  classId: string | null;
}>;

export type LessonPlanMeta = LessonPlanIdentity & Readonly<{
  /** Opaque plan ID; new IDs never contain a date or class identifier. */
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  storage: LessonPlanStorage;
}>;

export type LessonPlanIndex = Readonly<{
  version: typeof LESSON_PLAN_INDEX_VERSION;
  activePlanId: string;
  plans: readonly LessonPlanMeta[];
}>;

/** The exact on-disk index shape used before class-specific plan identities. */
export type LessonPlanIndexV1 = Readonly<{
  version: typeof LEGACY_LESSON_PLAN_INDEX_VERSION;
  activePlanId: string;
  plans: readonly LessonPlanMetaV1[];
}>;

export type LessonPlanMetaV1 = Readonly<{
  id: string;
  date: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  storage: LessonPlanStorage;
}>;

export type LessonPlanIndexLoadResult = Readonly<{
  index: LessonPlanIndex;
  /** True when older or duplicate local metadata was canonicalized in memory. */
  migrated: boolean;
}>;

export type LessonPlanIdFactory = () => string;

export type CreateLessonPlanMetaOptions = Readonly<{
  identity: LessonPlanIdentity;
  title: string;
  /** New plans are scoped unless a caller is deliberately creating legacy metadata. */
  storage?: LessonPlanStorage;
  now?: string | Date;
  /** Existing IDs are supplied so a custom/test factory cannot collide. */
  existingPlanIds?: Iterable<string>;
  idFactory?: LessonPlanIdFactory;
}>;

export type AddLessonPlanResult = Readonly<{
  index: LessonPlanIndex;
  /** The inserted plan, or the already-existing plan with the same identity. */
  plan: LessonPlanMeta;
  added: boolean;
}>;

/**
 * Explicit outcome for an add-or-update attempt. A duplicate identity never
 * changes the index; `plan` and `duplicate` identify the saved plan to open.
 */
export type UpsertLessonPlanResult = Readonly<{
  index: LessonPlanIndex;
  plan: LessonPlanMeta;
  status: "added" | "updated" | "duplicate-identity";
  duplicate: LessonPlanMeta | null;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** Validates an ISO calendar day without relying on the browser timezone. */
export function isLessonPlanDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= monthLengths[month - 1]!;
}

export function isLessonPlanClassId(value: unknown): value is string | null {
  return value === null || (typeof value === "string"
    && value.length > 0
    && value.length <= MAX_CLASS_ID_LENGTH
    && SAFE_CLASS_ID.test(value));
}

export function isLessonPlanIdentity(value: unknown): value is LessonPlanIdentity {
  return isRecord(value) && isLessonPlanDate(value.date) && isLessonPlanClassId(value.classId);
}

function isPlanId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_PLAN_ID_LENGTH;
}

/** New plan IDs must be opaque rather than date- or class-derived. */
export function isOpaqueLessonPlanId(value: unknown): value is string {
  return isPlanId(value) && OPAQUE_LESSON_PLAN_ID.test(value);
}

function isLessonPlanStorage(value: unknown): value is LessonPlanStorage {
  return value === "legacy" || value === "scoped";
}

function isTitle(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_TITLE_LENGTH;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sameIdentity(first: LessonPlanIdentity, second: LessonPlanIdentity): boolean {
  return first.date === second.date && first.classId === second.classId;
}

/** Produces a stable display/debug key; it is never used as a storage ID. */
export function lessonPlanIdentityKey(identity: LessonPlanIdentity): string | null {
  if (!isLessonPlanIdentity(identity)) return null;
  return `${identity.date}\u001f${identity.classId ?? ""}`;
}

export function isLessonPlanMeta(value: unknown): value is LessonPlanMeta {
  if (!isRecord(value)) return false;
  return isPlanId(value.id)
    && isLessonPlanDate(value.date)
    && isLessonPlanClassId(value.classId)
    && isTitle(value.title)
    && isTimestamp(value.createdAt)
    && isTimestamp(value.updatedAt)
    && isLessonPlanStorage(value.storage);
}

function isLessonPlanMetaV1(value: unknown): value is LessonPlanMetaV1 {
  if (!isRecord(value)) return false;
  return isPlanId(value.id)
    && isLessonPlanDate(value.date)
    && isTitle(value.title)
    && isTimestamp(value.createdAt)
    && isTimestamp(value.updatedAt)
    && isLessonPlanStorage(value.storage);
}

function hasUniquePlanIds(plans: readonly Pick<LessonPlanMeta, "id">[]): boolean {
  return new Set(plans.map((plan) => plan.id)).size === plans.length;
}

/** A date/class pair is the durable user-facing uniqueness rule. */
function hasUniquePlanIdentities(plans: readonly LessonPlanIdentity[]): boolean {
  const keys = plans.map((plan) => lessonPlanIdentityKey(plan));
  return keys.every((key): key is string => key !== null) && new Set(keys).size === keys.length;
}

/** Validates the v2 record shape before enforcing the date/class uniqueness rule. */
function isLessonPlanIndexV2Shape(value: unknown): value is LessonPlanIndex {
  if (!isRecord(value)
    || value.version !== LESSON_PLAN_INDEX_VERSION
    || typeof value.activePlanId !== "string"
    || !Array.isArray(value.plans)
    || !value.plans.every(isLessonPlanMeta)) {
    return false;
  }
  return hasUniquePlanIds(value.plans);
}

/** Validates the current v2 shape including the one-plan-per-class-and-date rule. */
export function isLessonPlanIndex(value: unknown): value is LessonPlanIndex {
  return isLessonPlanIndexV2Shape(value) && hasUniquePlanIdentities(value.plans);
}

function isLessonPlanIndexV1(value: unknown): value is LessonPlanIndexV1 {
  if (!isRecord(value)
    || value.version !== LEGACY_LESSON_PLAN_INDEX_VERSION
    || typeof value.activePlanId !== "string"
    || !Array.isArray(value.plans)
    || !value.plans.every(isLessonPlanMetaV1)) {
    return false;
  }
  return new Set(value.plans.map((plan) => plan.id)).size === value.plans.length
    && new Set(value.plans.map((plan) => plan.date)).size === value.plans.length;
}

function activePlanIdFor(plans: readonly LessonPlanMeta[], requestedPlanId: string): string {
  return plans.some((plan) => plan.id === requestedPlanId)
    ? requestedPlanId
    : plans[0]?.id ?? requestedPlanId;
}

function preferredIdentityPlan(
  current: LessonPlanMeta,
  candidate: LessonPlanMeta,
  activePlanId: string,
): LessonPlanMeta {
  if (candidate.id === activePlanId) return candidate;
  if (current.id === activePlanId) return current;
  if (candidate.updatedAt !== current.updatedAt) return candidate.updatedAt > current.updatedAt ? candidate : current;
  if (candidate.createdAt !== current.createdAt) return candidate.createdAt > current.createdAt ? candidate : current;
  return current;
}

/**
 * Older page versions could accidentally write a duplicate identity through
 * a metadata reassignment. Keep one deterministic winner on the requested
 * class/date and preserve every other plan as a detached, missing-class
 * record instead of wiping the entire local index or its payload references.
 */
function canonicalizeDuplicateIdentities(plans: readonly LessonPlanMeta[], activePlanId: string): LessonPlanMeta[] {
  const winnerByIdentity = new Map<string, LessonPlanMeta>();
  plans.forEach((plan) => {
    const key = lessonPlanIdentityKey(plan);
    if (!key) return;
    const current = winnerByIdentity.get(key);
    winnerByIdentity.set(key, current ? preferredIdentityPlan(current, plan, activePlanId) : plan);
  });
  const claimedKeys = new Set([...winnerByIdentity.keys()]);
  return plans.map((plan, index) => {
    const identity = lessonPlanIdentityKey(plan);
    if (identity && winnerByIdentity.get(identity)?.id === plan.id) return { ...plan };

    const safeIdFragment = plan.id.toLocaleLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 88) || `plan-${index + 1}`;
    let classId = `orphan-${index + 1}-${safeIdFragment}`.slice(0, MAX_CLASS_ID_LENGTH);
    let candidateIdentity = lessonPlanIdentityKey({ date: plan.date, classId });
    let retry = 1;
    while (candidateIdentity && claimedKeys.has(candidateIdentity)) {
      classId = `orphan-${index + 1}-${retry}-${safeIdFragment}`.slice(0, MAX_CLASS_ID_LENGTH);
      candidateIdentity = lessonPlanIdentityKey({ date: plan.date, classId });
      retry += 1;
    }
    if (candidateIdentity) claimedKeys.add(candidateIdentity);
    return { ...plan, classId };
  });
}

/**
 * Accepts the old v1 local index and retains every plan's original ID/storage
 * reference. Class identity was not stored in v1, so those plans become
 * explicitly unassigned (`classId: null`) rather than being guessed.
 */
export function normalizeLessonPlanIndex(value: unknown): LessonPlanIndexLoadResult | null {
  if (isLessonPlanIndex(value)) {
    const plans = value.plans.map((plan) => ({ ...plan }));
    return {
      index: {
        version: LESSON_PLAN_INDEX_VERSION,
        activePlanId: activePlanIdFor(plans, value.activePlanId),
        plans,
      },
      migrated: false,
    };
  }

  if (isLessonPlanIndexV2Shape(value)) {
    const plans = canonicalizeDuplicateIdentities(value.plans, value.activePlanId);
    return {
      index: {
        version: LESSON_PLAN_INDEX_VERSION,
        activePlanId: activePlanIdFor(plans, value.activePlanId),
        plans,
      },
      migrated: true,
    };
  }

  if (!isLessonPlanIndexV1(value)) return null;
  const plans: LessonPlanMeta[] = value.plans.map((plan) => ({ ...plan, classId: null }));
  return {
    index: {
      version: LESSON_PLAN_INDEX_VERSION,
      activePlanId: activePlanIdFor(plans, value.activePlanId),
      plans,
    },
    migrated: true,
  };
}

/** Returns the existing lesson for an exact date/class pair, if any. */
export function lessonPlanForIdentity(
  index: Pick<LessonPlanIndex, "plans"> | null | undefined,
  identity: LessonPlanIdentity,
): LessonPlanMeta | null {
  if (!index || !isLessonPlanIdentity(identity)) return null;
  const plan = index.plans.find((candidate) => sameIdentity(candidate, identity));
  return plan ? { ...plan } : null;
}

let fallbackIdSequence = 0;

function defaultLessonPlanId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `lesson-${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
  }
  fallbackIdSequence += 1;
  const randomPart = Math.random().toString(36).slice(2, 18);
  return `lesson-${Date.now().toString(36)}${fallbackIdSequence.toString(36)}${randomPart}`;
}

function timestampFor(value: string | Date | undefined): string | null {
  if (value === undefined) return new Date().toISOString();
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

/**
 * Creates detached metadata for a new plan. The optional existing IDs protect
 * against collisions from an injected/test ID factory; identity duplicates
 * are intentionally handled by addLessonPlan instead of silently replacing a
 * saved plan here.
 */
export function createLessonPlanMeta(options: CreateLessonPlanMetaOptions): LessonPlanMeta | null {
  if (!isLessonPlanIdentity(options.identity) || !isTitle(options.title)) return null;
  const timestamp = timestampFor(options.now);
  if (!timestamp) return null;
  const existingIds = new Set(options.existingPlanIds ?? []);
  const makeId = options.idFactory ?? defaultLessonPlanId;
  let id: string | null = null;
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const candidate = makeId();
    if (isOpaqueLessonPlanId(candidate) && !existingIds.has(candidate)) {
      id = candidate;
      break;
    }
  }
  if (!id) return null;
  return {
    id,
    date: options.identity.date,
    classId: options.identity.classId,
    title: options.title,
    createdAt: timestamp,
    updatedAt: timestamp,
    storage: options.storage ?? "scoped",
  };
}

/** Creates a detached v2 index around one known plan. */
export function lessonPlanIndexFor(plan: LessonPlanMeta): LessonPlanIndex | null {
  if (!isLessonPlanMeta(plan)) return null;
  return {
    version: LESSON_PLAN_INDEX_VERSION,
    activePlanId: plan.id,
    plans: [{ ...plan }],
  };
}

/**
 * Adds or updates a plan only when no other saved plan has its date/class
 * identity. A duplicate identity returns the saved plan unchanged, so callers
 * can open it instead of overwriting its lesson payload.
 */
export function upsertLessonPlan(
  current: LessonPlanIndex | null | undefined,
  plan: LessonPlanMeta,
  activePlanId = plan.id,
): UpsertLessonPlanResult | null {
  if (!isLessonPlanMeta(plan) || typeof activePlanId !== "string") return null;
  const source = current ? normalizeLessonPlanIndex(current)?.index : null;
  if (current && !source) return null;
  const matchingId = source?.plans.find((candidate) => candidate.id === plan.id);
  if (matchingId) {
    const existing = source!.plans.find((candidate) => candidate.id !== plan.id && sameIdentity(candidate, plan));
    if (existing) {
      const duplicate = { ...existing };
      return {
        index: source!,
        plan: { ...duplicate },
        status: "duplicate-identity",
        duplicate,
      };
    }
    const plans = source!.plans.map((candidate) => candidate.id === plan.id ? { ...plan } : { ...candidate });
    return {
      index: {
        version: LESSON_PLAN_INDEX_VERSION,
        activePlanId: activePlanIdFor(plans, activePlanId),
        plans,
      },
      plan: { ...plan },
      status: "updated",
      duplicate: null,
    };
  }
  const existing = lessonPlanForIdentity(source, plan);
  if (existing) {
    return {
      index: source!,
      plan: existing,
      status: "duplicate-identity",
      duplicate: { ...existing },
    };
  }

  const plans = source
    ? [...source.plans.map((candidate) => ({ ...candidate })), { ...plan }]
    : [{ ...plan }];
  return {
    index: {
      version: LESSON_PLAN_INDEX_VERSION,
      activePlanId: activePlanIdFor(plans, activePlanId),
      plans,
    },
    plan: { ...plan },
    status: "added",
    duplicate: null,
  };
}

/**
 * Adds a plan only when no saved plan already has its date/class identity.
 * A duplicate identity returns that saved plan unchanged, so callers can open
 * it instead of overwriting its lesson payload.
 */
export function addLessonPlan(
  current: LessonPlanIndex | null | undefined,
  plan: LessonPlanMeta,
  activePlanId = plan.id,
): AddLessonPlanResult | null {
  const result = upsertLessonPlan(current, plan, activePlanId);
  if (!result) return null;
  return {
    index: result.index,
    plan: result.plan,
    added: result.status === "added",
  };
}

/** Updates metadata for a known ID or appends it when no ID exists yet. */
export function indexWithLessonPlan(
  current: LessonPlanIndex | null | undefined,
  plan: LessonPlanMeta,
  activePlanId = plan.id,
): LessonPlanIndex | null {
  const result = upsertLessonPlan(current, plan, activePlanId);
  return result?.status === "duplicate-identity" ? null : result?.index ?? null;
}
