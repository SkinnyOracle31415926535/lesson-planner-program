import assert from "node:assert/strict";
import test from "node:test";
import {
  createTemporaryPlannerRawBackup,
  parseTemporaryPlannerTransferFile,
  type TemporaryPlannerDataTransferProps,
} from "../app/temporary-planner-data-transfer";
import { LOCAL_LESSON_STORAGE_KEY } from "../app/shared-planner-storage";

function localStorageFixture(values: Record<string, string>) {
  const keys = () => Object.keys(values);
  return {
    get length() { return keys().length; },
    key(index: number) { return keys()[index] ?? null; },
    getItem(key: string) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key]! : null; },
    setItem(key: string, value: string) { values[key] = value; },
    removeItem(key: string) { delete values[key]; },
    clear() { Object.keys(values).forEach((key) => delete values[key]); },
  } as Storage;
}

const validators: TemporaryPlannerDataTransferProps = { normalizeWorkspace: (value) => value };
const indexKey = "gym-lesson-planner-local-plan-index-v1";

test("exports and re-reads the app-scoped raw migration bundle", () => {
  const browser = localStorageFixture({ [indexKey]: JSON.stringify({ version: 2, activePlanId: "", plans: [] }) });
  const backup = createTemporaryPlannerRawBackup(browser);
  assert.equal(backup.kind, "lesson_planner_browser_local_raw_backup");
  assert.equal(backup.app_id, "lesson-planner-program");
  assert.equal(parseTemporaryPlannerTransferFile(backup, validators).preview.lessonPlans, 0);
});

test("rejects incompatible and malformed bundles before any browser write", () => {
  const browser = localStorageFixture({ [indexKey]: JSON.stringify({ version: 2, activePlanId: "", plans: [] }) });
  const backup = createTemporaryPlannerRawBackup(browser);
  const before = JSON.stringify(browser);
  assert.throws(() => parseTemporaryPlannerTransferFile({ ...backup, app_id: "color-game" }, validators), /different app/);
  assert.throws(() => parseTemporaryPlannerTransferFile({ ...backup, records: [{ key: indexKey, present: true, raw_value: "not json" }] }, validators), /malformed/);
  assert.equal(JSON.stringify(browser), before);
});

test("maps a private-site legacy lesson to the legacy storage record", () => {
  const legacyPlan = {
    id: "legacy-current",
    date: "2026-07-24",
    classId: null,
    title: "LEVEL 3 LESSON",
    createdAt: "2026-07-24T19:00:00.000Z",
    updatedAt: "2026-07-24T19:00:00.000Z",
    storage: "legacy",
  };
  const imported = parseTemporaryPlannerTransferFile({
    kind: "ryan_app_settings_data_transfer",
    version: 1,
    app_id: "lesson-planner-program",
    data: {
      planner_workspace: {
        lessonIndex: { version: 2, activePlanId: legacyPlan.id, plans: [legacyPlan] },
        lessonsByPlanId: { [legacyPlan.id]: { rows: [] } },
      },
    },
  }, validators);
  assert.ok(imported.records.some((record) => record.key === LOCAL_LESSON_STORAGE_KEY));
  assert.ok(!imported.records.some((record) => record.key === `gym-lesson-planner-local-plan-${legacyPlan.id}-v1`));
});
