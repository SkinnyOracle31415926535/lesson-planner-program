"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LESSON_PLANNER_SYNC_COLLECTIONS,
  applyLessonPlannerRemoteRecord,
  hasCompletedLessonPlannerAppSync,
  lessonPlannerStorageKeysForRecord,
  lessonPlannerSyncRecordKey,
  markLessonPlannerAppSyncComplete,
  rawLessonPlannerBackup,
  readLessonPlannerSyncRecords,
  validateLessonPlannerSyncRecord,
  type LessonPlannerLessonValidator,
  type LessonPlannerSyncCollection,
  type LessonPlannerSyncRecord,
} from "./lesson-planner-app-sync-storage";

const APP_ID = "lesson-planner-program";
const MANIFEST_VERSION = 1;
const CLIENT_URL =
  "https://ryan-app-sync.ryan-666-mp3.chatgpt.site/ryan-app-sync.js";
const STORAGE_LOCK = "lesson-planner-program:registered-storage-v1";
const LOCAL_STABLE_DELAY_MS = 900;

type SyncState = {
  mode: "disconnected" | "review" | "syncing" | "synced" | "offline" | "conflict";
  message: string;
};

type SyncMetadata = {
  source: "local" | "remote" | "migration" | "remote-migration";
  deleted?: boolean;
  revision?: number;
};

type CollectionHandle = {
  save(recordId: string, value: unknown): Promise<unknown>;
  remove(recordId: string): Promise<unknown>;
};

type MigrationPreview = {
  localCount: number;
  remoteCount: number;
  conflictCount: number;
  orphanedCount: number;
  writesPerformed: number;
  review: Array<{
    recordKey: string;
    collection: string;
    recordId: string;
    status: string;
    localPresent?: boolean;
  }>;
};

type MigrationResult = {
  preview: MigrationPreview;
  plan: unknown;
};

type SyncConflict = {
  recordKey: string;
  reason?: string;
  current?: { revision?: number } | null;
};

type SyncClient = {
  registerCollection(registration: {
    scope: string;
    appId: string;
    collection: string;
    schemaVersion: number;
    validate(value: unknown, recordId: string): boolean;
    listLocal(): LessonPlannerSyncRecord[] | Promise<LessonPlannerSyncRecord[]>;
    writeLocal(
      recordId: string,
      value: unknown,
      metadata: SyncMetadata,
    ): void | Promise<void>;
    applyRemote(
      recordId: string,
      value: unknown,
      metadata: SyncMetadata,
    ): void | Promise<void>;
  }): Promise<CollectionHandle>;
  finalizeRegistration(): Promise<unknown>;
  connect(): Promise<unknown>;
  disconnect(): Promise<unknown>;
  resetDevice(): Promise<unknown>;
  sync(): Promise<unknown>;
  previewMigration(options: { downloadBackup: boolean }): Promise<MigrationResult>;
  applyMigration(plan: unknown, resolutions: Record<string, string>): Promise<unknown>;
  listConflicts(): Promise<SyncConflict[]>;
  resolveConflict(
    recordKey: string,
    decision: { strategy: string; expectedRemoteRevision: number },
  ): Promise<unknown>;
  onStateChange(listener: (state: SyncState) => void): () => void;
  getState(): SyncState;
};

type RyanAppSyncGlobal = {
  version: number;
  create(options: { appId: string; manifestVersion: number }): SyncClient;
};

type Setup = {
  client: SyncClient;
  handles: Map<LessonPlannerSyncCollection, CollectionHandle>;
  reloadRequired: boolean;
};

declare global {
  interface Window {
    RyanAppSync?: RyanAppSyncGlobal;
  }
}

let clientScriptPromise: Promise<RyanAppSyncGlobal> | null = null;
let setupPromise: Promise<Setup> | null = null;

function loadClientScript(): Promise<RyanAppSyncGlobal> {
  if (window.RyanAppSync) return Promise.resolve(window.RyanAppSync);
  if (clientScriptPromise) return clientScriptPromise;
  clientScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-lesson-planner-app-sync-client="true"]',
    );
    const script = existing ?? document.createElement("script");
    const fail = (message: string) => {
      script.remove();
      clientScriptPromise = null;
      reject(new Error(message));
    };
    const finish = () => {
      if (window.RyanAppSync) resolve(window.RyanAppSync);
      else fail("The Ryan App Sync client did not initialize.");
    };
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => fail("The Ryan App Sync client could not be loaded."),
      { once: true },
    );
    if (!existing) {
      script.src = CLIENT_URL;
      script.async = true;
      script.dataset.lessonPlannerAppSyncClient = "true";
      document.head.append(script);
    }
  });
  return clientScriptPromise;
}

function serialized(value: unknown): string {
  return JSON.stringify(value);
}

function recordMap(records: LessonPlannerSyncRecord[]): Map<string, LessonPlannerSyncRecord> {
  return new Map(records.map((record) => [lessonPlannerSyncRecordKey(record), record]));
}

function editorIsBusy(): boolean {
  const active = document.activeElement;
  if (active instanceof HTMLInputElement
    || active instanceof HTMLTextAreaElement
    || active instanceof HTMLSelectElement
    || (active instanceof HTMLElement && active.isContentEditable)) {
    return true;
  }
  return Array.from(
    document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"][aria-modal="true"]'),
  ).some((dialog) => !dialog.classList.contains("lesson-app-sync-dialog"));
}

async function waitForEditorIdle(): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (editorIsBusy()) {
    if (Date.now() >= deadline) {
      throw new Error(
        "A planner editor is still open. Its local data was preserved for later review.",
      );
    }
    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }
}

async function withStorageLock<T>(task: () => T | Promise<T>): Promise<T> {
  if (!navigator.locks || typeof navigator.locks.request !== "function") {
    throw new Error(
      "Shared browser locking is unavailable. Planner data was not changed.",
    );
  }
  return navigator.locks.request(STORAGE_LOCK, { mode: "exclusive" }, task);
}

function collectionRecords(
  collection: LessonPlannerSyncCollection,
  validateLesson: LessonPlannerLessonValidator,
  allowUnavailable = false,
): LessonPlannerSyncRecord[] {
  try {
    return readLessonPlannerSyncRecords(window.localStorage, validateLesson)
      .filter((record) => record.collection === collection);
  } catch (error) {
    if (allowUnavailable) return [];
    throw error;
  }
}

function verifyLocalWrite(
  collection: LessonPlannerSyncCollection,
  recordId: string,
  value: unknown,
  metadata: SyncMetadata,
  validateLesson: LessonPlannerLessonValidator,
): void {
  if (metadata.source !== "local" && metadata.source !== "remote-migration") {
    throw new Error("The sync client requested an invalid local planner write.");
  }
  const current = collectionRecords(collection, validateLesson)
    .find((record) => record.recordId === recordId);
  if (metadata.deleted) {
    if (current) throw new Error("The local planner record still exists.");
    return;
  }
  if (!current || serialized(current.value) !== serialized(value)) {
    throw new Error("A newer local planner edit was preserved.");
  }
}

async function setupClient(
  validateLesson: LessonPlannerLessonValidator,
): Promise<Setup> {
  if (setupPromise) return setupPromise;
  setupPromise = (async () => {
    const RyanAppSync = await loadClientScript();
    const client = RyanAppSync.create({
      appId: APP_ID,
      manifestVersion: MANIFEST_VERSION,
    });
    const setup: Setup = {
      client,
      handles: new Map(),
      reloadRequired: false,
    };
    let registering = true;

    for (const collection of LESSON_PLANNER_SYNC_COLLECTIONS) {
      const handle = await client.registerCollection({
        scope: APP_ID,
        appId: APP_ID,
        collection,
        schemaVersion: 1,
        validate: (value, recordId) => validateLessonPlannerSyncRecord(
          { collection, recordId, value },
          validateLesson,
        ),
        listLocal: () => collectionRecords(collection, validateLesson, registering),
        writeLocal: (recordId, value, metadata) => verifyLocalWrite(
          collection,
          recordId,
          value,
          metadata,
          validateLesson,
        ),
        applyRemote: async (recordId, value, metadata) => {
          if (metadata.source !== "remote" && metadata.source !== "migration") {
            throw new Error("The sync client requested an invalid remote planner write.");
          }
          const record = { collection, recordId, value };
          const keys = lessonPlannerStorageKeysForRecord(record, validateLesson);
          const before = new Map(keys.map((key) => [key, window.localStorage.getItem(key)]));
          await waitForEditorIdle();
          await withStorageLock(() => {
            if (keys.some((key) => window.localStorage.getItem(key) !== before.get(key))) {
              throw new Error("A newer local planner edit was preserved.");
            }
            applyLessonPlannerRemoteRecord(
              window.localStorage,
              record,
              Boolean(metadata.deleted),
              validateLesson,
            );
          });
          if (!metadata.deleted || collection === "lesson_z_index") {
            setup.reloadRequired = true;
          }
        },
      });
      setup.handles.set(collection, handle);
    }
    await client.finalizeRegistration();
    registering = false;
    return setup;
  })().catch((error: unknown) => {
    setupPromise = null;
    throw error;
  });
  return setupPromise;
}

export function lessonPlannerMigrationGate(
  preview: MigrationPreview,
  resolutions: Record<string, string>,
): { safe: boolean; message: string } {
  if (!Number.isInteger(preview.writesPerformed)
    || !Number.isInteger(preview.remoteCount)
    || !Number.isInteger(preview.orphanedCount)
    || preview.writesPerformed < 0
    || preview.remoteCount < 0
    || preview.orphanedCount < 0) {
    return {
      safe: false,
      message: "Migration is blocked because its safety counts are invalid.",
    };
  }
  if (preview.writesPerformed !== 0) {
    return {
      safe: false,
      message: "Migration is blocked because the preview performed a write.",
    };
  }
  if (preview.orphanedCount !== 0) {
    return {
      safe: false,
      message:
        `Migration is blocked because ${preview.orphanedCount} preserved local sync intent` +
        `${preview.orphanedCount === 1 ? "" : "s"} need review.`,
    };
  }
  for (const item of preview.review) {
    if (item.status === "content-conflict"
      && !["keep-local", "accept-remote"].includes(resolutions[item.recordKey])) {
      return {
        safe: false,
        message: "Choose a result for every local and synchronized conflict.",
      };
    }
    if (item.status === "schema-conflict") {
      if (!item.localPresent) {
        return {
          safe: false,
          message:
            "A synchronized record uses an unsupported schema. Local data was preserved.",
        };
      }
      if (resolutions[item.recordKey] !== "keep-local") {
        return {
          safe: false,
          message: "Choose Keep this device for every unsupported synchronized schema.",
        };
      }
    }
  }
  return {
    safe: true,
    message:
      `Preview confirmed: 0 writes and 0 orphaned intents. ` +
      `${preview.remoteCount} synchronized record${preview.remoteCount === 1 ? "" : "s"} reviewed.`,
  };
}

function downloadJson(value: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadRawBackup(): ReturnType<typeof rawLessonPlannerBackup> {
  const backup = rawLessonPlannerBackup(window.localStorage);
  const date = new Date().toISOString().slice(0, 10);
  downloadJson(backup, `lesson-planner-browser-local-raw-backup-${date}.json`);
  return backup;
}

function stateLabel(mode: SyncState["mode"]): string {
  if (mode === "review") return "Migration review required";
  if (mode === "syncing") return "Syncing";
  if (mode === "synced") return "Synced";
  if (mode === "offline") return "Offline";
  if (mode === "conflict") return "Conflict needs review";
  return "Disconnected";
}

export function LessonPlannerAppSync({
  validateLesson,
  onStatus,
}: {
  validateLesson: LessonPlannerLessonValidator;
  onStatus?: (status: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const mountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const initializingRef = useRef<Promise<void> | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({
    mode: "disconnected",
    message: "Local planner records stay on this device.",
  });
  const [preview, setPreview] = useState<MigrationResult | null>(null);
  const [migrationResolutions, setMigrationResolutions] =
    useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [alert, setAlert] = useState("");
  const [busy, setBusy] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const refreshConflicts = useCallback(async (client: SyncClient) => {
    setConflicts(await client.listConflicts());
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  const initializeSync = useCallback(async () => {
    if (setup) return;
    if (initializingRef.current) return initializingRef.current;
    setInitializing(true);
    setAlert("");
    const pending = (async () => {
      try {
        const ready = await setupClient(validateLesson);
        if (!mountedRef.current) return;
        const showState = (state: SyncState) => {
          if (!mountedRef.current) return;
          setSyncState(state);
          onStatus?.(`RYAN APP SYNC · ${stateLabel(state.mode).toUpperCase()}`);
          if (state.mode === "conflict") void refreshConflicts(ready.client);
          if (state.mode === "synced" && ready.reloadRequired) window.location.reload();
        };
        setSetup(ready);
        showState(ready.client.getState());
        unsubscribeRef.current?.();
        unsubscribeRef.current = ready.client.onStateChange(showState);
      } catch (error: unknown) {
        if (!mountedRef.current) return;
        const message = error instanceof Error
          ? error.message
          : "Ryan App Sync could not be initialized.";
        setAlert(message);
        onStatus?.("RYAN APP SYNC · LOCAL COPY AVAILABLE");
      } finally {
        if (mountedRef.current) setInitializing(false);
      }
    })();
    initializingRef.current = pending;
    try {
      await pending;
    } finally {
      if (initializingRef.current === pending) initializingRef.current = null;
    }
  }, [onStatus, refreshConflicts, setup, validateLesson]);

  useEffect(() => {
    if (!setup || !hasCompletedLessonPlannerAppSync(window.localStorage)) return;
    let active = true;
    let baseline: Map<string, LessonPlannerSyncRecord>;
    try {
      baseline = recordMap(readLessonPlannerSyncRecords(window.localStorage, validateLesson));
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Local planner records need review.";
      const timer = window.setTimeout(() => {
        if (active) setAlert(message);
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }
    let candidateSignature = "";
    let candidateSince = 0;
    let staging = false;

    const stageChanges = async () => {
      if (!active || staging || setup.reloadRequired) return;
      let current: Map<string, LessonPlannerSyncRecord>;
      try {
        current = recordMap(readLessonPlannerSyncRecords(window.localStorage, validateLesson));
      } catch (error) {
        setAlert(error instanceof Error ? error.message : "Local planner records need review.");
        return;
      }
      const signature = serialized(Array.from(current.values()));
      const baselineSignature = serialized(Array.from(baseline.values()));
      if (signature === baselineSignature) {
        candidateSignature = "";
        candidateSince = 0;
        return;
      }
      if (signature !== candidateSignature) {
        candidateSignature = signature;
        candidateSince = Date.now();
        return;
      }
      if (Date.now() - candidateSince < LOCAL_STABLE_DELAY_MS || editorIsBusy()) return;

      staging = true;
      try {
        const keys = new Set([...baseline.keys(), ...current.keys()]);
        for (const key of keys) {
          const before = baseline.get(key);
          const after = current.get(key);
          if (before && after && serialized(before.value) === serialized(after.value)) continue;
          const record = after ?? before;
          if (!record) continue;
          const handle = setup.handles.get(record.collection);
          if (!handle) throw new Error("A planner sync collection is unavailable.");
          if (after) await handle.save(after.recordId, after.value);
          else await handle.remove(before!.recordId);
        }
        baseline = current;
        candidateSignature = "";
        candidateSince = 0;
      } catch (error) {
        setAlert(
          error instanceof Error
            ? error.message
            : "A local planner change could not be queued. Its local copy was preserved.",
        );
      } finally {
        staging = false;
      }
    };

    const interval = window.setInterval(() => { void stageChanges(); }, 500);
    const onStorage = () => { void stageChanges(); };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [setup, validateLesson]);

  const run = async (task: (ready: Setup) => Promise<void>) => {
    if (!setup || busy) return;
    setBusy(true);
    setAlert("");
    try {
      await task(setup);
    } catch (error) {
      setAlert(
        error instanceof Error
          ? error.message
          : "That action did not finish. Local planner records were preserved.",
      );
    } finally {
      setBusy(false);
    }
  };

  const gate = preview
    ? lessonPlannerMigrationGate(preview.preview, migrationResolutions)
    : null;

  return (
    <>
      <button
        type="button"
        className="lesson-app-sync-open"
        data-state={syncState.mode}
        onClick={() => {
          dialogRef.current?.showModal();
          void initializeSync();
        }}
      >
        SYNC &amp; BACKUP
      </button>
      <dialog
        ref={dialogRef}
        className="lesson-app-sync-dialog"
        aria-labelledby="lesson-app-sync-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="lesson-app-sync-window">
          <header>
            <div>
              <small>RYAN-ONLY APP SYNC</small>
              <h2 id="lesson-app-sync-title">Sync &amp; backup</h2>
            </div>
            <button
              type="button"
              aria-label="Close sync and backup"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </header>
          <p>
            Classes, rotations, attendance and operations, the lesson index, and
            individual lesson plans can sync between Ryan’s browsers.
          </p>
          <p className="lesson-app-sync-safety">
            Idea Library media, photos, device-only preferences, and unrelated browser
            keys are never registered. The exact backup reads only the five known
            planner keys plus lesson keys from a validated index.
          </p>
          <div className="lesson-app-sync-state" data-state={syncState.mode}>
            <strong>{stateLabel(syncState.mode)}</strong>
            <span>{syncState.message}</span>
          </div>
          {alert ? <p className="lesson-app-sync-alert" role="alert">{alert}</p> : null}
          <div className="lesson-app-sync-actions">
            <button
              type="button"
              disabled={busy || initializing}
              onClick={() => {
                if (!setup) {
                  void initializeSync();
                  return;
                }
                void run(async (ready) => {
                  await ready.client.connect();
                });
              }}
            >
              {initializing
                ? "Loading sync controls…"
                : setup
                  ? "Connect as Ryan"
                  : "Retry loading sync controls"}
            </button>
            <button
              type="button"
              disabled={!setup || busy}
              onClick={() => void run(async (ready) => {
                await ready.client.sync();
              })}
            >
              Sync now
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                try {
                  downloadRawBackup();
                  setAlert("");
                } catch (error) {
                  setAlert(error instanceof Error ? error.message : "The backup failed.");
                }
              }}
            >
              Download exact local backup
            </button>
            <button
              type="button"
              disabled={!setup || busy}
              onClick={() => void run(async (ready) => {
                readLessonPlannerSyncRecords(window.localStorage, validateLesson);
                const backup = downloadRawBackup();
                if (!backup.index_valid) {
                  throw new Error(
                    "The lesson index is invalid. The fixed keys were backed up, but migration is blocked.",
                  );
                }
                setMigrationResolutions({});
                setPreview(await ready.client.previewMigration({ downloadBackup: true }));
              })}
            >
              Create backup &amp; preview
            </button>
            <button
              type="button"
              disabled={!setup || busy}
              onClick={() => void run(async (ready) => {
                await ready.client.disconnect();
              })}
            >
              Disconnect
            </button>
            <button
              type="button"
              disabled={!setup || busy}
              onClick={() => void run(async (ready) => {
                await ready.client.resetDevice();
                setPreview(null);
                setMigrationResolutions({});
              })}
            >
              Reset device connection
            </button>
          </div>

          {preview ? (
            <section className="lesson-app-sync-review" aria-labelledby="lesson-sync-review">
              <h3 id="lesson-sync-review">Migration preview</h3>
              <p>
                {preview.preview.localCount} local · {preview.preview.remoteCount} synchronized ·{" "}
                {preview.preview.conflictCount} conflicts · {preview.preview.orphanedCount} orphaned
              </p>
              <p data-safe={String(gate?.safe)}>{gate?.message}</p>
              <ul>
                {preview.preview.review.map((item) => (
                  <li key={item.recordKey}>
                    <strong>{item.collection} · {item.recordId}</strong>
                    <span>{item.status.replaceAll("-", " ")}</span>
                    {item.status === "content-conflict" ? (
                      <label>
                        Choose result
                        <select
                          value={migrationResolutions[item.recordKey] ?? ""}
                          onChange={(event) => setMigrationResolutions((current) => ({
                            ...current,
                            [item.recordKey]: event.currentTarget.value,
                          }))}
                        >
                          <option value="">Choose…</option>
                          <option value="keep-local">Keep this device</option>
                          <option value="accept-remote">Use synchronized record</option>
                        </select>
                      </label>
                    ) : null}
                    {item.status === "schema-conflict" && item.localPresent ? (
                      <label>
                        Unsupported synchronized schema
                        <select
                          value={migrationResolutions[item.recordKey] ?? ""}
                          onChange={(event) => setMigrationResolutions((current) => ({
                            ...current,
                            [item.recordKey]: event.currentTarget.value,
                          }))}
                        >
                          <option value="">Choose…</option>
                          <option value="keep-local">Keep this device</option>
                        </select>
                      </label>
                    ) : null}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!gate?.safe || busy}
                onClick={() => void run(async (ready) => {
                  if (!gate?.safe) throw new Error(gate?.message ?? "Review is required.");
                  await ready.client.applyMigration(preview.plan, migrationResolutions);
                  markLessonPlannerAppSyncComplete(window.localStorage);
                  window.location.reload();
                })}
              >
                Apply reviewed migration
              </button>
            </section>
          ) : null}

          {conflicts.length ? (
            <section className="lesson-app-sync-conflicts" aria-labelledby="lesson-sync-conflicts">
              <h3 id="lesson-sync-conflicts">Sync conflicts</h3>
              <p>Choose each result deliberately. No result is selected automatically.</p>
              {conflicts.map((conflict) => {
                const revision = Number.isSafeInteger(conflict.current?.revision)
                  ? Number(conflict.current?.revision)
                  : 0;
                return (
                  <div key={conflict.recordKey}>
                    <strong>{conflict.recordKey.split("\u001f").slice(-2).join(" · ")}</strong>
                    <span>{(conflict.reason ?? "record conflict").replaceAll("-", " ")}</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(async (ready) => {
                        await ready.client.resolveConflict(conflict.recordKey, {
                          strategy: "keep-local",
                          expectedRemoteRevision: revision,
                        });
                        await refreshConflicts(ready.client);
                      })}
                    >
                      Keep this device
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(async (ready) => {
                        await ready.client.resolveConflict(conflict.recordKey, {
                          strategy: "accept-remote",
                          expectedRemoteRevision: revision,
                        });
                        await refreshConflicts(ready.client);
                      })}
                    >
                      Use synchronized record
                    </button>
                  </div>
                );
              })}
            </section>
          ) : null}
          <p className="lesson-app-sync-footnote">
            Authentication lasts only in this open page. Local queued work remains
            preserved if the page closes or the network disconnects.
          </p>
        </div>
      </dialog>
    </>
  );
}
