import { operationTasks } from "./lesson-data";

export const PLANNER_CHECKLIST_STORAGE_KEY = "gym-lesson-planner-local-checklist-v1";
export const PLANNER_CHECKLIST_VERSION = 1 as const;

export type PlannerChecklistItem = {
  id: string;
  title: string;
  detail: string;
};

export type PlannerChecklist = {
  version: typeof PLANNER_CHECKLIST_VERSION;
  items: PlannerChecklistItem[];
};

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/;
const MAX_ITEMS = 100;
const MAX_TITLE_LENGTH = 140;
const MAX_DETAIL_LENGTH = 280;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= maximum ? normalized : null;
}

function item(value: unknown): PlannerChecklistItem | null {
  if (!isRecord(value) || Object.keys(value).length !== 3) return null;
  const id = typeof value.id === "string" && ID_PATTERN.test(value.id) ? value.id : null;
  const title = text(value.title, MAX_TITLE_LENGTH);
  const detail = text(value.detail, MAX_DETAIL_LENGTH);
  return id && title && detail ? { id, title, detail } : null;
}

function detached(entry: PlannerChecklistItem): PlannerChecklistItem {
  return { ...entry };
}

/** The former fixed checklist stays as editable examples on a new browser. */
export function starterPlannerChecklist(): PlannerChecklist {
  return {
    version: PLANNER_CHECKLIST_VERSION,
    items: operationTasks.map((task) => ({
      id: task.id,
      title: task.title,
      detail: task.detail,
    })),
  };
}

export function parsePlannerChecklist(value: unknown): PlannerChecklist | null {
  if (!isRecord(value)
    || Object.keys(value).length !== 2
    || value.version !== PLANNER_CHECKLIST_VERSION
    || !Array.isArray(value.items)
    || value.items.length > MAX_ITEMS) return null;
  const items = value.items.map(item);
  if (items.some((entry) => entry === null)) return null;
  const parsed = items as PlannerChecklistItem[];
  if (new Set(parsed.map((entry) => entry.id)).size !== parsed.length) return null;
  return { version: PLANNER_CHECKLIST_VERSION, items: parsed.map(detached) };
}

export function addPlannerChecklistItem(
  checklist: PlannerChecklist,
  entry: PlannerChecklistItem,
): PlannerChecklist | null {
  const normalized = item(entry);
  if (!parsePlannerChecklist(checklist)
    || !normalized
    || checklist.items.length >= MAX_ITEMS
    || checklist.items.some((candidate) => candidate.id === normalized.id)) return null;
  return { version: PLANNER_CHECKLIST_VERSION, items: [...checklist.items.map(detached), normalized] };
}

export function updatePlannerChecklistItem(
  checklist: PlannerChecklist,
  id: string,
  title: string,
  detail: string,
): PlannerChecklist | null {
  if (!parsePlannerChecklist(checklist) || !ID_PATTERN.test(id)) return null;
  const replacement = item({ id, title, detail });
  if (!replacement || !checklist.items.some((candidate) => candidate.id === id)) return null;
  return {
    version: PLANNER_CHECKLIST_VERSION,
    items: checklist.items.map((candidate) => candidate.id === id ? replacement : detached(candidate)),
  };
}

export function removePlannerChecklistItem(checklist: PlannerChecklist, id: string): PlannerChecklist | null {
  if (!parsePlannerChecklist(checklist) || !ID_PATTERN.test(id)) return null;
  const items = checklist.items.filter((candidate) => candidate.id !== id).map(detached);
  return items.length === checklist.items.length ? null : { version: PLANNER_CHECKLIST_VERSION, items };
}
