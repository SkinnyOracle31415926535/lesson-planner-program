"use client";

import { useRef, useState } from "react";
import { emptyLocalClassStorage } from "./local-classes";
import { normalizeLessonPlanIndex } from "./lesson-plan-index";
import { emptySafeScheduleStorage } from "./local-schedule";
import { PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY } from "./personal-alternate-schedule";
import {
  PLANNER_BACKUP_FORMAT,
  isPlannerBackupStorageKey,
  parsePlannerBackupJson,
} from "./planner-backup";
import {
  LOCAL_CLASS_STORAGE_KEY,
  LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY,
  LOCAL_LESSON_STORAGE_KEY,
  LOCAL_OPERATIONS_STORAGE_KEY,
  LOCAL_SAFE_SCHEDULE_STORAGE_KEY,
  emptyPlannerOperationsStorage,
  lessonPlanStorageKey,
  type SharedPlannerStorageSnapshot,
} from "./shared-planner-storage";

const APP_ID = "lesson-planner-program";
const RAW_KIND = "lesson_planner_browser_local_raw_backup";
const TRANSFER_KIND = "ryan_app_settings_data_transfer";
const MAX_FILE_BYTES = 20 * 1024 * 1024;

type StorageRecord = { key: string; present: boolean; raw_value: string | null };

type RawBackup = {
  kind: typeof RAW_KIND;
  version: 1;
  app_id: typeof APP_ID;
  exported_at: string;
  index_valid: boolean;
  records: StorageRecord[];
};

type PreparedImport = { records: StorageRecord[]; preview: TransferPreview; skippedMedia: boolean };

type TransferPreview = {
  classes: number;
  students: number;
  lessonPlans: number;
  savedLessons: number;
  localRecords: number;
};

export type TemporaryPlannerDataTransferProps = {
  /** Uses the legacy planner's own strict roster, schedule, operation, and lesson validators. */
  normalizeWorkspace: (value: SharedPlannerStorageSnapshot) => SharedPlannerStorageSnapshot | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown, depth = 0): boolean {
  if (depth > 64 || value === null) return depth <= 64;
  if (typeof value === "string") return value.length <= 2_000_000;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 50_000 && value.every((entry) => isJsonValue(entry, depth + 1));
  if (!isRecord(value)) return false;
  return Object.entries(value).length <= 50_000 && Object.entries(value).every(([key, entry]) => (
    key !== "__proto__" && key !== "constructor" && key !== "prototype"
    && key.length <= 512 && isJsonValue(entry, depth + 1)
  ));
}

function parseRawValue(raw: string, key: string): unknown {
  if (raw.length > MAX_FILE_BYTES) throw new Error(`${key} is too large to transfer safely.`);
  try {
    const value: unknown = JSON.parse(raw);
    if (!isJsonValue(value)) throw new Error("unsupported JSON value");
    return value;
  } catch {
    throw new Error(`${key} is malformed. No browser data was changed.`);
  }
}

function storageKeyForPlan(plan: { id: string; storage: "legacy" | "scoped" }): string {
  return plan.storage === "legacy" ? LOCAL_LESSON_STORAGE_KEY : lessonPlanStorageKey(plan.id);
}

function recordMap(records: readonly StorageRecord[]): Map<string, string> {
  const values = new Map<string, string>();
  for (const record of records) {
    if (record.present && record.raw_value !== null) values.set(record.key, record.raw_value);
  }
  return values;
}

function valueFor(values: Map<string, string>, key: string, fallback: unknown): unknown {
  const raw = values.get(key);
  return raw === undefined ? fallback : parseRawValue(raw, key);
}

function validateWorkspace(records: readonly StorageRecord[], props: TemporaryPlannerDataTransferProps): SharedPlannerStorageSnapshot {
  const values = recordMap(records);
  const indexRaw = valueFor(values, LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, { version: 2, activePlanId: "", plans: [] });
  const index = normalizeLessonPlanIndex(indexRaw)?.index;
  if (!index) throw new Error("The lesson-plan index is unsupported. No browser data was changed.");
  const lessonsByPlanId: Record<string, unknown> = {};
  for (const plan of index.plans) {
    const key = storageKeyForPlan(plan);
    if (!values.has(key)) throw new Error(`Lesson plan “${plan.title}” is missing its saved lesson.`);
    lessonsByPlanId[plan.id] = valueFor(values, key, null);
  }
  const candidate: SharedPlannerStorageSnapshot = {
    classes: valueFor(values, LOCAL_CLASS_STORAGE_KEY, emptyLocalClassStorage()),
    rotationSchedule: valueFor(values, LOCAL_SAFE_SCHEDULE_STORAGE_KEY, emptySafeScheduleStorage()),
    lessonIndex: index,
    operations: valueFor(values, LOCAL_OPERATIONS_STORAGE_KEY, emptyPlannerOperationsStorage()),
    lessonsByPlanId,
  };
  const normalized = props.normalizeWorkspace(candidate);
  if (!normalized) throw new Error("This planner data is unsupported. No browser data was changed.");
  return normalized;
}

function preview(records: readonly StorageRecord[], workspace: SharedPlannerStorageSnapshot): TransferPreview {
  const classes = isRecord(workspace.classes) && Array.isArray(workspace.classes.classes)
    ? workspace.classes.classes : [];
  const index = normalizeLessonPlanIndex(workspace.lessonIndex)?.index;
  return {
    classes: classes.length,
    students: classes.reduce((count, localClass) => (
      count + (isRecord(localClass) && Array.isArray(localClass.students) ? localClass.students.length : 0)
    ), 0),
    lessonPlans: index?.plans.length ?? 0,
    savedLessons: Object.keys(workspace.lessonsByPlanId).length,
    localRecords: records.filter((record) => record.present).length,
  };
}

function isStorageRecord(value: unknown): value is StorageRecord {
  return isRecord(value)
    && typeof value.key === "string"
    && value.key.length > 0
    && typeof value.present === "boolean"
    && (typeof value.raw_value === "string" || value.raw_value === null)
    && value.present === (value.raw_value !== null);
}

function validateRecords(records: unknown, props: TemporaryPlannerDataTransferProps): PreparedImport {
  if (!Array.isArray(records) || records.length > 2_000 || !records.every(isStorageRecord)) {
    throw new Error("This Settings & Data file is malformed.");
  }
  const keys = new Set<string>();
  const normalized: StorageRecord[] = records.map((record) => {
    if (!isPlannerBackupStorageKey(record.key) || keys.has(record.key)) {
      throw new Error("This Settings & Data file contains unsupported or duplicate records.");
    }
    keys.add(record.key);
    if (record.raw_value !== null) parseRawValue(record.raw_value, record.key);
    return { ...record };
  });
  const workspace = validateWorkspace(normalized, props);
  return { records: normalized, preview: preview(normalized, workspace), skippedMedia: false };
}

function rawBackup(storage: Storage): RawBackup {
  const records: StorageRecord[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isPlannerBackupStorageKey(key)) continue;
    const raw = storage.getItem(key);
    records.push({ key, present: raw !== null, raw_value: raw });
  }
  // The alternate schedule is covered by isPlannerBackupStorageKey, but keeping
  // this makes the export resilient to an older utility implementation.
  if (!records.some((record) => record.key === PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY)) {
    const raw = storage.getItem(PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY);
    if (raw !== null) records.push({ key: PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY, present: true, raw_value: raw });
  }
  let indexValid = false;
  try {
    const values = recordMap(records);
    indexValid = normalizeLessonPlanIndex(valueFor(values, LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, { version: 2, activePlanId: "", plans: [] })) !== null;
  } catch {
    // The raw backup remains useful even if a damaged old index blocks import.
  }
  return { kind: RAW_KIND, version: 1, app_id: APP_ID, exported_at: new Date().toISOString(), index_valid: indexValid, records: records.sort((a, b) => a.key.localeCompare(b.key)) };
}

function fromRawBackup(value: unknown, props: TemporaryPlannerDataTransferProps): PreparedImport | null {
  if (!isRecord(value) || value.kind !== RAW_KIND) return null;
  if (value.version !== 1) throw new Error("This Lesson Planner backup version is not supported.");
  if (value.app_id !== APP_ID) throw new Error("This backup belongs to a different app.");
  return validateRecords(value.records, props);
}

function recordFor(key: string, value: unknown): StorageRecord | null {
  return value === null || value === undefined
    ? null
    : { key, present: true, raw_value: JSON.stringify(value) };
}

/** Allows a current private-site bundle to be brought back to this legacy export page if needed. */
function fromStandardBundle(value: unknown, props: TemporaryPlannerDataTransferProps): PreparedImport | null {
  if (!isRecord(value) || value.kind !== TRANSFER_KIND) return null;
  if (value.version !== 1) throw new Error("This Settings & Data export version is not supported.");
  if (value.app_id !== APP_ID || !isRecord(value.data)) throw new Error("This Settings & Data export belongs to a different app.");
  const snapshot = value.data.planner_workspace;
  if (!isRecord(snapshot)) throw new Error("This Settings & Data export is malformed.");
  const index = normalizeLessonPlanIndex(snapshot.lessonIndex)?.index;
  if (!index) throw new Error("This Settings & Data export has an unsupported lesson-plan index.");
  const lessonsByPlanId = isRecord(snapshot.lessonsByPlanId) ? snapshot.lessonsByPlanId : {};
  const lessonRecords = index.plans.map((plan) => {
    if (!(plan.id in lessonsByPlanId)) {
      throw new Error(`This Settings & Data export is missing the saved lesson for “${plan.title}”.`);
    }
    return recordFor(storageKeyForPlan(plan), lessonsByPlanId[plan.id]);
  });
  const records = [
    recordFor(LOCAL_CLASS_STORAGE_KEY, snapshot.classes),
    recordFor(LOCAL_SAFE_SCHEDULE_STORAGE_KEY, snapshot.rotationSchedule),
    recordFor(LOCAL_OPERATIONS_STORAGE_KEY, snapshot.operations),
    recordFor(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, snapshot.lessonIndex),
    ...lessonRecords,
    recordFor("gym-lesson-planner-local-library-v1", value.data.library_preferences),
    typeof value.data.library_view === "string" ? { key: "gym-lesson-planner-local-library-view-v1", present: true, raw_value: value.data.library_view } : null,
    recordFor(PERSONAL_ALTERNATE_SCHEDULE_STORAGE_KEY, value.data.personal_alternate_schedule),
    ...(isRecord(snapshot.userState) && isRecord(snapshot.userState.values)
      ? Object.entries(snapshot.userState.values).map(([key, state]) => recordFor(key, state)) : []),
  ].filter((record): record is StorageRecord => record !== null);
  return validateRecords(records, props);
}

function fromExistingFullBackup(value: unknown, props: TemporaryPlannerDataTransferProps): PreparedImport | null {
  if (!isRecord(value) || value.format !== PLANNER_BACKUP_FORMAT) return null;
  const parsed = parsePlannerBackupJson(JSON.stringify(value));
  if (!parsed.ok) throw new Error(parsed.error);
  const records = Object.entries(parsed.value.localStorage).map(([key, raw]) => ({ key, present: true, raw_value: raw }));
  const prepared = validateRecords(records, props);
  return { ...prepared, skippedMedia: parsed.value.media.areaPhotos.length > 0 || parsed.value.media.ideaMedia.length > 0 };
}

function parseImport(value: unknown, props: TemporaryPlannerDataTransferProps): PreparedImport {
  return fromRawBackup(value, props)
    ?? fromStandardBundle(value, props)
    ?? fromExistingFullBackup(value, props)
    ?? (() => { throw new Error("Choose a Lesson Planner Settings & Data export file."); })();
}

/** Testable parser used by the temporary import control. */
export function parseTemporaryPlannerTransferFile(
  value: unknown,
  props: TemporaryPlannerDataTransferProps,
): PreparedImport {
  return parseImport(value, props);
}

/** Testable exact browser-local backup used by the temporary export control. */
export function createTemporaryPlannerRawBackup(storage: Storage): RawBackup {
  return rawBackup(storage);
}

function downloadJson(value: unknown, filename: string): void {
  const text = JSON.stringify(value, null, 2);
  if (text.length > MAX_FILE_BYTES) throw new Error("This transfer file is too large to download safely.");
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function applyRecords(storage: Storage, records: readonly StorageRecord[]): void {
  const incoming = new Map(records.filter((record) => record.present && record.raw_value !== null).map((record) => [record.key, record.raw_value!]));
  const currentKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isPlannerBackupStorageKey(key)) currentKeys.push(key);
  }
  // Lesson payloads publish before the index just as normal planner saves do.
  for (const [key, raw] of incoming) {
    if (key !== LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY) storage.setItem(key, raw);
  }
  const index = incoming.get(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY);
  if (index !== undefined) storage.setItem(LOCAL_LESSON_PLAN_INDEX_STORAGE_KEY, index);
  currentKeys.filter((key) => !incoming.has(key)).forEach((key) => storage.removeItem(key));
}

export function TemporaryPlannerDataTransfer({ normalizeWorkspace }: TemporaryPlannerDataTransferProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [prepared, setPrepared] = useState<PreparedImport | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const props = { normalizeWorkspace };

  const exportData = () => {
    try {
      downloadJson(rawBackup(window.localStorage), `lesson-planner-settings-data-${timestamp()}.json`);
      setMessage("Settings & Data exported. Photos and videos are intentionally not included.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The export could not be created.");
    }
  };

  const selectImport = async (file: File | undefined) => {
    if (!file) return;
    setPrepared(null);
    if (file.size > MAX_FILE_BYTES) {
      setMessage("That file is too large to import safely.");
      return;
    }
    try {
      const preparedImport = parseImport(JSON.parse(await file.text()) as unknown, props);
      setPrepared(preparedImport);
      const count = preparedImport.preview;
      setMessage(`Preview ready: ${count.classes} classes, ${count.students} students, ${count.lessonPlans} plans, and ${count.localRecords} saved records. No data has changed.${preparedImport.skippedMedia ? " Photos and videos are excluded from this temporary transfer." : ""}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That Settings & Data file could not be read.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!prepared || busy) return;
    if (!window.confirm("Replace this browser’s Lesson Planner settings and data? A safety backup will download first.")) return;
    setBusy(true);
    try {
      const current = rawBackup(window.localStorage);
      // Validation happens before the safety backup or the first browser write.
      validateWorkspace(current.records, props);
      downloadJson(current, `lesson-planner-pre-import-backup-${timestamp()}.json`);
      try {
        applyRecords(window.localStorage, prepared.records);
      } catch (error) {
        applyRecords(window.localStorage, current.records);
        throw error;
      }
      setMessage("Import complete. Restarting the planner so its private workspace can reconcile safely.");
      window.setTimeout(() => window.location.reload(), 400);
    } catch (error) {
      setMessage(error instanceof Error ? `${error.message} The destination data was preserved.` : "The import failed and the destination data was preserved.");
      setBusy(false);
    }
  };

  return (
    <section className="temporary-planner-transfer" aria-label="Temporary data transfer">
      <button type="button" className="temporary-planner-transfer-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>TEMPORARY DATA TRANSFER</button>
      {open ? <div className="temporary-planner-transfer-panel" role="region" aria-label="Import or export planner settings and data">
        <strong>IMPORT / EXPORT SETTINGS &amp; DATA</strong>
        <p>Transfers classes, lesson plans, records, history, templates, and saved settings. Photos and videos stay out of this JSON bundle.</p>
        <div className="temporary-planner-transfer-actions">
          <button type="button" onClick={exportData} disabled={busy}>Export Settings &amp; Data</button>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>Import Settings &amp; Data</button>
          <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={(event) => { void selectImport(event.currentTarget.files?.[0]); }} />
        </div>
        {prepared ? <div className="temporary-planner-transfer-preview" aria-live="polite">
          <b>IMPORT PREVIEW</b>
          <span>{prepared.preview.classes} classes · {prepared.preview.students} students · {prepared.preview.lessonPlans} plans · {prepared.preview.savedLessons} saved lessons</span>
          <span>{prepared.preview.localRecords} settings and local records will replace this browser copy.</span>
          <button type="button" onClick={confirmImport} disabled={busy}>{busy ? "IMPORTING…" : "Confirm replacement & download safety backup"}</button>
          <button type="button" onClick={() => setPrepared(null)} disabled={busy}>Cancel import</button>
        </div> : null}
        {message ? <p className="temporary-planner-transfer-message" role="status">{message}</p> : null}
        <small>Temporary migration controls. Validation and the pre-import backup complete before any browser data changes.</small>
      </div> : null}
    </section>
  );
}
