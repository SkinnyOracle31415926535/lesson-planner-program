import copy
import importlib.util
import io
import json
import pathlib
import unittest


SCRIPT = pathlib.Path(__file__).parents[1] / "scripts" / "planner_intake_client.py"
SPEC = importlib.util.spec_from_file_location("planner_intake_client", SCRIPT)
client = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(client)


def workspace():
    return {
        "version": 1,
        "revision": 12,
        "updatedAt": "2026-07-25T12:00:00.000Z",
        "documents": [
            {
                "version": 1,
                "kind": "operations",
                "id": "default",
                "documentVersion": 1,
                "revision": 12,
                "updatedAt": "2026-07-25T12:00:00.000Z",
                "value": {
                    "version": 4,
                    "taskDoneByPlanId": {},
                    "attendanceByPlanId": {},
                    "updateDecisionByRevision": {},
                    "goalPreferences": {
                        "version": 1,
                        "generalGoals": [],
                        "defaultGoalIdsByClassId": {},
                    },
                    "plannerIntake": {
                        "version": 1,
                        "lessonDrafts": [],
                        "announcementSuggestions": [],
                        "backlogCaptures": [],
                        "decisionById": {},
                    },
                },
            },
            {
                "version": 1,
                "kind": "lesson-index",
                "id": "default",
                "documentVersion": 1,
                "revision": 12,
                "updatedAt": "2026-07-25T12:00:00.000Z",
                "value": {"version": 2, "activePlanId": "lesson-one", "plans": []},
            },
        ],
    }


DRAFT = {
    "id": "draft-level-3-2026-07-27",
    "kind": "lesson-draft",
    "createdAt": "2026-07-25T12:00:00.000Z",
    "source": "CODEX LESSON PLAN SKILL",
    "target": {
        "lessonDate": "2026-07-27",
        "classId": "class-level-3",
        "className": "Level 3",
    },
    "details": {"goals": "• Tight shapes"},
    "phases": [
        {
            "phaseId": "phase-floor",
            "title": "FLOOR",
            "time": "3:30–4:00",
            "text": ["Roundoff shapes"],
        }
    ],
}


BACKLOG = {
    "id": "backlog-level-3-2026-07-27-1",
    "kind": "backlog-capture",
    "createdAt": "2026-07-27T18:00:00.000Z",
    "source": {
        "lessonId": "lesson-level-3-2026-07-27",
        "lessonDate": "2026-07-27",
        "classId": "class-level-3",
        "className": "Level 3",
    },
    "projectKey": "lesson-planner",
    "request": "make the goal box easier to read",
}


def add_draft_target(state, *, class_id="class-level-3", title="Level 3 Lesson"):
    state["documents"][1]["value"]["plans"].append({
        "id": "lesson-level-3-2026-07-27",
        "date": "2026-07-27",
        "classId": class_id,
        "title": title,
    })
    state["documents"].append({
        "version": 1,
        "kind": "lesson",
        "id": "lesson-level-3-2026-07-27",
        "documentVersion": 1,
        "revision": 12,
        "updatedAt": "2026-07-25T12:00:00.000Z",
        "value": {
            "version": 8,
            "phases": [{
                "id": "phase-floor",
                "title": "FLOOR",
                "time": "3:30–4:00",
                "text": ["private current plan"],
            }],
        },
    })


class PlannerIntakeClientTests(unittest.TestCase):
    def test_draft_validation_and_deduplicated_enqueue(self):
        state = workspace()
        add_draft_target(state)
        item = client.validate_draft(copy.deepcopy(DRAFT))
        self.assertTrue(client.enqueue(state, item))
        self.assertFalse(client.enqueue(state, item))
        intake = client.operations_document(state)["value"]["plannerIntake"]
        self.assertEqual([DRAFT["id"]], [entry["id"] for entry in intake["lessonDrafts"]])
        collision = copy.deepcopy(DRAFT)
        collision["source"] = "A DIFFERENT SOURCE"
        with self.assertRaisesRegex(client.IntakeError, "different payload"):
            client.enqueue(state, collision)
        malformed_retry = copy.deepcopy(DRAFT)
        malformed_retry["source"] = "safe source\nhidden payload"
        with self.assertRaises(client.IntakeError):
            client.enqueue(state, malformed_retry)

    def test_draft_validation_rejects_unknown_or_mismatched_fields(self):
        unsafe = {**DRAFT, "apiKey": "never"}
        with self.assertRaises(client.IntakeError):
            client.validate_draft(unsafe)
        stale = copy.deepcopy(DRAFT)
        stale["phases"][0]["text"] = ["x" * 501]
        with self.assertRaises(client.IntakeError):
            client.validate_draft(stale)
        null_details = copy.deepcopy(DRAFT)
        null_details["details"]["announcements"] = None
        with self.assertRaises(client.IntakeError):
            client.validate_draft(null_details)
        multiline_source = copy.deepcopy(DRAFT)
        multiline_source["source"] = "safe id\nraw body"
        with self.assertRaises(client.IntakeError):
            client.validate_draft(multiline_source)

    def test_pending_backlog_returns_only_undecided_allowlisted_captures(self):
        state = workspace()
        intake = client.operations_document(state)["value"]["plannerIntake"]
        intake["backlogCaptures"] = [copy.deepcopy(BACKLOG)]
        self.assertEqual([BACKLOG], client.pending_backlog(state))
        client.mark_backlog(state, BACKLOG["id"], "applied")
        self.assertEqual([], client.pending_backlog(state))
        injected = {**BACKLOG, "request": "first line\ninjected line"}
        with self.assertRaises(client.IntakeError):
            client.validate_backlog_capture(injected)

    def test_enqueue_requires_one_exact_current_target_and_phase_identity(self):
        missing = workspace()
        with self.assertRaisesRegex(client.IntakeError, "exact current Planner target"):
            client.enqueue(missing, copy.deepcopy(DRAFT))

        null_target = workspace()
        add_draft_target(null_target, class_id=None, title="  LEVEL   3 LESSON  ")
        null_draft = copy.deepcopy(DRAFT)
        null_draft["target"]["classId"] = None
        self.assertTrue(client.enqueue(null_target, null_draft))

        wrong_name = workspace()
        add_draft_target(wrong_name, class_id=None, title="Level 4 Lesson")
        with self.assertRaisesRegex(client.IntakeError, "exact current Planner target"):
            client.enqueue(wrong_name, null_draft)

        stale_phase = workspace()
        add_draft_target(stale_phase)
        stale_draft = copy.deepcopy(DRAFT)
        stale_draft["phases"][0]["time"] = "4:00–4:30"
        with self.assertRaisesRegex(client.IntakeError, "phase identity"):
            client.enqueue(stale_phase, stale_draft)

    def test_every_noop_and_write_requires_a_fully_valid_v4_operations_record(self):
        malformed_queue = workspace()
        add_draft_target(malformed_queue)
        malformed_queue["documents"][0]["value"]["plannerIntake"]["lessonDrafts"] = [
            {**DRAFT, "unsupported": True}
        ]
        before = copy.deepcopy(malformed_queue)
        with self.assertRaisesRegex(client.IntakeError, "unsupported shape"):
            client.enqueue(malformed_queue, copy.deepcopy(DRAFT))
        self.assertEqual(before, malformed_queue)

        dangling_decision = workspace()
        dangling_decision["documents"][0]["value"]["plannerIntake"]["decisionById"] = {
            "missing-item": "applied"
        }
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(dangling_decision)

        extra_operations_field = workspace()
        extra_operations_field["documents"][0]["value"]["unexpected"] = "unsafe"
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(extra_operations_field)

        invalid_nested_key = workspace()
        invalid_nested_key["documents"][0]["value"]["taskDoneByPlanId"] = {
            "lesson one": {"task-one": True}
        }
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(invalid_nested_key)

        oversized_nested_record = workspace()
        oversized_nested_record["documents"][0]["value"]["taskDoneByPlanId"] = {
            f"lesson-{index}": {} for index in range(1_001)
        }
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(oversized_nested_record)

        whitespace_class_id = workspace()
        whitespace_class_id["documents"][0]["value"]["goalPreferences"][
            "defaultGoalIdsByClassId"
        ] = {" class-level-3": []}
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(whitespace_class_id)

        non_string_goal_id = workspace()
        non_string_goal_id["documents"][0]["value"]["goalPreferences"][
            "defaultGoalIdsByClassId"
        ] = {"class-level-3": [["not", "an", "id"]]}
        with self.assertRaisesRegex(client.IntakeError, "strict validation"):
            client.workspace_write_body(non_string_goal_id)

    def test_workspace_write_preserves_every_document_and_drops_server_metadata(self):
        body = json.loads(client.workspace_write_body(workspace()))
        self.assertEqual(1, body["version"])
        self.assertEqual(2, len(body["documents"]))
        self.assertEqual(
            {"kind", "id", "value"},
            set(body["documents"][0]),
        )

    def test_target_listing_exposes_only_exact_plan_and_phase_identity(self):
        state = workspace()
        state["documents"].append({
            "version": 1,
            "kind": "lesson",
            "id": "lesson-one",
            "documentVersion": 1,
            "revision": 12,
            "updatedAt": "2026-07-25T12:00:00.000Z",
            "value": {
                "version": 8,
                "reflection": "must not leave the lesson document",
                "attendanceById": {"athlete": "present"},
                "phases": [{
                    "id": "phase-floor",
                    "title": "FLOOR",
                    "time": "3:30–4:00",
                    "text": ["private current plan"],
                }],
            },
        })
        state["documents"][1]["value"]["plans"] = [{
            "id": "lesson-one",
            "date": "2026-07-27",
            "classId": "class-level-3",
            "title": "BOYS LEVEL 3 LESSON",
        }]
        targets = client.list_targets(state, "2026-07-27")
        self.assertEqual([{
            "lessonId": "lesson-one",
            "lessonDate": "2026-07-27",
            "classId": "class-level-3",
            "className": "BOYS LEVEL 3",
            "phases": [{"phaseId": "phase-floor", "title": "FLOOR", "time": "3:30–4:00"}],
        }], targets)
        self.assertNotIn("reflection", json.dumps(targets))
        self.assertNotIn("attendance", json.dumps(targets))
        self.assertNotIn("private current plan", json.dumps(targets))

    def test_version_three_operations_are_not_mutated(self):
        state = workspace()
        state["documents"][0]["value"]["version"] = 3
        del state["documents"][0]["value"]["plannerIntake"]
        with self.assertRaisesRegex(client.IntakeError, "version 4 intake setup"):
            client.operations_document(state)

    def test_version_two_operations_migrate_once_without_losing_existing_state(self):
        state = workspace()
        state["documents"][0]["value"] = {
            "version": 2,
            "taskDoneByPlanId": {"lesson-one": {"task-one": True}},
            "attendanceByPlanId": {"lesson-one": {"athlete-one": "present"}},
            "updateDecisionByRevision": {"update-one:revision-one": "LATER"},
        }
        self.assertTrue(client.migrate_intake(state))
        operations = client.operations_document(state)["value"]
        self.assertEqual(4, operations["version"])
        self.assertEqual({"lesson-one": {"task-one": True}}, operations["taskDoneByPlanId"])
        self.assertEqual(
            {"lesson-one": {"athlete-one": "present"}},
            operations["attendanceByPlanId"],
        )
        self.assertEqual(
            {"update-one:revision-one": "LATER"},
            operations["updateDecisionByRevision"],
        )
        self.assertEqual(
            ["goal-level-3-behavior", "goal-level-3-concentration"],
            operations["goalPreferences"]["defaultGoalIdsByClassId"]["class-boys-level-3"],
        )
        self.assertFalse(client.migrate_intake(state))


if __name__ == "__main__":
    unittest.main()
