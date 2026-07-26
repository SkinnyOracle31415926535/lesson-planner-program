#!/usr/bin/env python3
"""Keyless CAS client for the Lesson Planner's review-only intake queue."""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import re
import sys
import urllib.error
import urllib.request
from typing import Any


DEFAULT_ORIGIN = "https://lesson-planner-photo-library.ryan-666-mp3.chatgpt.site"
API_PATH = "/api/shared-planner-state"
MAX_STDIN_BYTES = 256 * 1024
ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
GOAL_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{2,79}$")
PROJECT_KEYS = {
    "lesson-planner",
    "vault-command-center",
    "calendar",
    "scavenger-hunt",
    "tally-clicker",
    "rate-game",
    "team-games",
    "team-invites",
}
ATTENDANCE_STATUSES = {"unmarked", "present", "late", "absent"}
UPDATE_DECISIONS = {"IMPORTANT", "LATER", "REJECTED"}
LEVEL_3_STANDARD_GOALS = [
    {
        "id": "goal-level-3-behavior",
        "text": "Behavior is controlled for the duration of class",
    },
    {
        "id": "goal-level-3-concentration",
        "text": "Everyone maintains concentration throughout the lesson",
    },
]


class IntakeError(RuntimeError):
    """A safe, user-facing intake failure."""


def is_record(value: object) -> bool:
    return isinstance(value, dict)


def exact_keys(value: dict[str, Any], allowed: set[str]) -> bool:
    return set(value) <= allowed


def valid_text(value: object, maximum: int, allow_empty: bool = False) -> bool:
    return (
        isinstance(value, str)
        and len(value) <= maximum
        and "\0" not in value
        and (allow_empty or bool(value.strip()))
    )


def valid_single_line_text(value: object, maximum: int) -> bool:
    return valid_text(value, maximum) and "\n" not in value and "\r" not in value


def valid_id(value: object) -> bool:
    return isinstance(value, str) and bool(ID_PATTERN.fullmatch(value))


def valid_date(value: object) -> bool:
    if not isinstance(value, str) or not DATE_PATTERN.fullmatch(value):
        return False
    try:
        return dt.date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def valid_timestamp(value: object) -> bool:
    if not valid_text(value, 100):
        return False
    try:
        dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def validate_draft(value: object) -> dict[str, Any]:
    if not is_record(value) or not exact_keys(
        value, {"id", "kind", "createdAt", "source", "target", "details", "phases"}
    ):
        raise IntakeError("The lesson draft has an unsupported shape.")
    target = value.get("target")
    details = value.get("details")
    phases = value.get("phases")
    if (
        value.get("kind") != "lesson-draft"
        or not valid_id(value.get("id"))
        or not valid_timestamp(value.get("createdAt"))
        or not valid_single_line_text(value.get("source"), 200)
        or not is_record(target)
        or set(target) != {"lessonDate", "classId", "className"}
        or not valid_date(target.get("lessonDate"))
        or not (target.get("classId") is None or valid_id(target.get("classId")))
        or not valid_single_line_text(target.get("className"), 200)
        or not is_record(details)
        or not exact_keys(details, {"announcements", "goals"})
        or (
            "announcements" in details
            and not valid_text(details["announcements"], 1_000, allow_empty=True)
        )
        or ("goals" in details and not valid_text(details["goals"], 1_000, allow_empty=True))
        or not isinstance(phases, list)
        or len(phases) > 100
    ):
        raise IntakeError("The lesson draft did not pass strict validation.")
    seen: set[str] = set()
    for phase in phases:
        if (
            not is_record(phase)
            or not exact_keys(phase, {"phaseId", "title", "time", "text", "note"})
            or not valid_id(phase.get("phaseId"))
            or phase["phaseId"] in seen
            or not valid_single_line_text(phase.get("title"), 200)
            or not valid_single_line_text(phase.get("time"), 100)
            or (
                "text" in phase
                and (
                    not isinstance(phase["text"], list)
                    or len(phase["text"]) > 100
                    or not all(valid_text(item, 500) for item in phase["text"])
                )
            )
            or ("note" in phase and not valid_text(phase["note"], 180, allow_empty=True))
            or ("text" not in phase and "note" not in phase)
        ):
            raise IntakeError("One or more lesson draft phases are invalid.")
        seen.add(phase["phaseId"])
    if "announcements" not in details and "goals" not in details and not phases:
        raise IntakeError("The lesson draft does not contain any proposed changes.")
    return copy.deepcopy(value)


def validate_announcement(value: object) -> dict[str, Any]:
    allowed = {
        "id",
        "kind",
        "createdAt",
        "source",
        "sourceRef",
        "classId",
        "className",
        "effectiveStart",
        "effectiveEnd",
        "text",
    }
    if not is_record(value) or set(value) != allowed:
        raise IntakeError("The announcement suggestion has an unsupported shape.")
    if (
        value.get("kind") != "announcement"
        or not valid_id(value.get("id"))
        or not valid_timestamp(value.get("createdAt"))
        or not valid_single_line_text(value.get("source"), 200)
        or not valid_single_line_text(value.get("sourceRef"), 500)
        or not valid_id(value.get("classId"))
        or not valid_single_line_text(value.get("className"), 200)
        or not valid_date(value.get("effectiveStart"))
        or not valid_date(value.get("effectiveEnd"))
        or value["effectiveStart"] > value["effectiveEnd"]
        or not valid_text(value.get("text"), 1_000)
    ):
        raise IntakeError("The announcement suggestion did not pass strict validation.")
    return copy.deepcopy(value)


def validate_backlog_capture(value: object) -> dict[str, Any]:
    if not is_record(value) or set(value) != {
        "id", "kind", "createdAt", "source", "projectKey", "request"
    }:
        raise IntakeError("The backlog capture has an unsupported shape.")
    source = value.get("source")
    if (
        value.get("kind") != "backlog-capture"
        or not valid_id(value.get("id"))
        or not valid_timestamp(value.get("createdAt"))
        or not is_record(source)
        or set(source) != {"lessonId", "lessonDate", "classId", "className"}
        or not valid_id(source.get("lessonId"))
        or not valid_date(source.get("lessonDate"))
        or not (source.get("classId") is None or valid_id(source.get("classId")))
        or not valid_single_line_text(source.get("className"), 200)
        or value.get("projectKey") not in PROJECT_KEYS
        or not valid_single_line_text(value.get("request"), 1_000)
    ):
        raise IntakeError("The backlog capture did not pass strict validation.")
    return copy.deepcopy(value)


def read_stdin_item(kind: str) -> dict[str, Any]:
    raw = sys.stdin.buffer.read(MAX_STDIN_BYTES + 1)
    if not raw or len(raw) > MAX_STDIN_BYTES:
        raise IntakeError("Pass one bounded JSON intake item through stdin.")
    try:
        parsed = json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise IntakeError("The intake item is not valid JSON.") from exc
    return validate_draft(parsed) if kind == "lesson-draft" else validate_announcement(parsed)


def service_url(origin: str) -> str:
    return f"{origin.rstrip('/')}{API_PATH}"


def load_workspace(origin: str, opener=urllib.request.urlopen) -> dict[str, Any]:
    request = urllib.request.Request(
        service_url(origin),
        headers={
            "Accept": "application/json",
            "Cache-Control": "no-store",
            "User-Agent": "Mozilla/5.0 Codex-Planner-Intake/1",
        },
    )
    try:
        with opener(request, timeout=20) as response:
            workspace = json.load(response)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise IntakeError("The public Planner workspace could not be loaded.") from exc
    if (
        not is_record(workspace)
        or workspace.get("version") != 1
        or not isinstance(workspace.get("revision"), int)
        or workspace["revision"] < 1
        or not isinstance(workspace.get("documents"), list)
    ):
        raise IntakeError("The public Planner workspace returned an invalid snapshot.")
    return workspace


def operations_document(workspace: dict[str, Any]) -> dict[str, Any]:
    matches = [
        document
        for document in workspace["documents"]
        if is_record(document)
        and document.get("kind") == "operations"
        and document.get("id") == "default"
    ]
    if len(matches) != 1 or not is_record(matches[0].get("value")):
        raise IntakeError("The Planner operations document is missing.")
    operations = matches[0]["value"]
    if operations.get("version") != 4:
        raise IntakeError(
            "The Planner version 4 intake setup is not online yet."
        )
    if (
        set(operations) != {
            "version",
            "taskDoneByPlanId",
            "attendanceByPlanId",
            "updateDecisionByRevision",
            "goalPreferences",
            "plannerIntake",
        }
        or not valid_nested_record(
            operations.get("taskDoneByPlanId"),
            lambda entry: isinstance(entry, bool),
        )
        or not valid_nested_record(
            operations.get("attendanceByPlanId"),
            lambda entry: entry in ATTENDANCE_STATUSES,
        )
        or not valid_update_decisions(operations.get("updateDecisionByRevision"))
        or not valid_goal_preferences(operations.get("goalPreferences"))
    ):
        raise IntakeError("The Planner operations document did not pass strict validation.")
    validate_planner_intake(operations.get("plannerIntake"))
    return matches[0]


def valid_nested_record(
    value: object,
    entry_validator,
) -> bool:
    return (
        is_record(value)
        and len(value) <= 1_000
        and all(
            valid_id(record_id)
            and is_record(entries)
            and len(entries) <= 1_000
            and all(
                valid_id(entry_id) and entry_validator(entry)
                for entry_id, entry in entries.items()
            )
            for record_id, entries in value.items()
        )
    )


def valid_update_decisions(value: object) -> bool:
    return (
        is_record(value)
        and len(value) <= 2_000
        and all(
            valid_id(revision_key) and entry in UPDATE_DECISIONS
            for revision_key, entry in value.items()
        )
    )


def valid_goal_preferences(value: object) -> bool:
    if (
        not is_record(value)
        or set(value) != {"version", "generalGoals", "defaultGoalIdsByClassId"}
        or value.get("version") != 1
        or not isinstance(value.get("generalGoals"), list)
        or len(value["generalGoals"]) > 60
        or not is_record(value.get("defaultGoalIdsByClassId"))
    ):
        return False
    goals = value["generalGoals"]
    if any(
        not is_record(goal)
        or set(goal) != {"id", "text"}
        or not (
            isinstance(goal.get("id"), str)
            and bool(GOAL_ID_PATTERN.fullmatch(goal["id"]))
        )
        or not valid_single_line_text(goal.get("text"), 200)
        for goal in goals
    ):
        return False
    goal_ids = [goal["id"] for goal in goals]
    known = set(goal_ids)
    if len(known) != len(goal_ids):
        return False
    return all(
        isinstance(class_id, str)
        and class_id.strip() == class_id
        and 0 < len(class_id) <= 100
        and isinstance(ids, list)
        and all(isinstance(item_id, str) and item_id in known for item_id in ids)
        and len(ids) == len(set(ids))
        for class_id, ids in value["defaultGoalIdsByClassId"].items()
    )


def validate_planner_intake(value: object) -> dict[str, Any]:
    if (
        not is_record(value)
        or set(value) != {
            "version",
            "lessonDrafts",
            "announcementSuggestions",
            "backlogCaptures",
            "decisionById",
        }
        or value.get("version") != 1
        or not isinstance(value.get("lessonDrafts"), list)
        or len(value["lessonDrafts"]) > 200
        or not isinstance(value.get("announcementSuggestions"), list)
        or len(value["announcementSuggestions"]) > 200
        or not isinstance(value.get("backlogCaptures"), list)
        or len(value["backlogCaptures"]) > 200
        or not is_record(value.get("decisionById"))
        or len(value["decisionById"]) > 600
    ):
        raise IntakeError("The Planner intake queue did not pass strict validation.")
    lesson_drafts = [validate_draft(item) for item in value["lessonDrafts"]]
    announcements = [
        validate_announcement(item) for item in value["announcementSuggestions"]
    ]
    backlog_captures = [
        validate_backlog_capture(item) for item in value["backlogCaptures"]
    ]
    all_items = [*lesson_drafts, *announcements, *backlog_captures]
    item_ids = [item["id"] for item in all_items]
    decisions = value["decisionById"]
    if (
        len(set(item_ids)) != len(item_ids)
        or any(
            not valid_id(item_id)
            or decision not in {"applied", "dismissed"}
            or item_id not in item_ids
            for item_id, decision in decisions.items()
        )
    ):
        raise IntakeError("The Planner intake queue did not pass strict validation.")
    return {
        "version": 1,
        "lessonDrafts": lesson_drafts,
        "announcementSuggestions": announcements,
        "backlogCaptures": backlog_captures,
        "decisionById": copy.deepcopy(decisions),
    }


def seeded_goal_preferences() -> dict[str, Any]:
    goal_ids = [goal["id"] for goal in LEVEL_3_STANDARD_GOALS]
    return {
        "version": 1,
        "generalGoals": copy.deepcopy(LEVEL_3_STANDARD_GOALS),
        "defaultGoalIdsByClassId": {
            "class-boys-level-3": list(goal_ids),
            "sample-level-3": list(goal_ids),
        },
    }


def migrate_intake(workspace: dict[str, Any]) -> bool:
    matches = [
        document
        for document in workspace["documents"]
        if is_record(document)
        and document.get("kind") == "operations"
        and document.get("id") == "default"
    ]
    if len(matches) != 1 or not is_record(matches[0].get("value")):
        raise IntakeError("The Planner operations document is missing.")
    operations = matches[0]["value"]
    if operations.get("version") == 4:
        operations_document(workspace)
        return False
    common_keys = {
        "taskDoneByPlanId",
        "attendanceByPlanId",
        "updateDecisionByRevision",
    }
    if (
        not valid_nested_record(
            operations.get("taskDoneByPlanId"),
            lambda entry: isinstance(entry, bool),
        )
        or not valid_nested_record(
            operations.get("attendanceByPlanId"),
            lambda entry: entry in ATTENDANCE_STATUSES,
        )
        or not valid_update_decisions(operations.get("updateDecisionByRevision"))
    ):
        raise IntakeError("The legacy Planner operations document is invalid.")
    if operations.get("version") == 2 and set(operations) == {"version", *common_keys}:
        goal_preferences = seeded_goal_preferences()
    elif (
        operations.get("version") == 3
        and set(operations) == {"version", *common_keys, "goalPreferences"}
        and valid_goal_preferences(operations.get("goalPreferences"))
    ):
        goal_preferences = copy.deepcopy(operations["goalPreferences"])
    else:
        raise IntakeError("The Planner operations version cannot be migrated safely.")
    matches[0]["value"] = {
        "version": 4,
        "taskDoneByPlanId": copy.deepcopy(operations["taskDoneByPlanId"]),
        "attendanceByPlanId": copy.deepcopy(operations["attendanceByPlanId"]),
        "updateDecisionByRevision": copy.deepcopy(operations["updateDecisionByRevision"]),
        "goalPreferences": goal_preferences,
        "plannerIntake": {
            "version": 1,
            "lessonDrafts": [],
            "announcementSuggestions": [],
            "backlogCaptures": [],
            "decisionById": {},
        },
    }
    return True


def all_intake_ids(intake: dict[str, Any]) -> set[str]:
    return {
        item.get("id")
        for key in ("lessonDrafts", "announcementSuggestions", "backlogCaptures")
        for item in intake[key]
        if is_record(item) and valid_id(item.get("id"))
    }


def normalized_class_name(value: str) -> str:
    without_suffix = re.sub(r"\s+LESSON\s*$", "", value.strip(), flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", without_suffix).casefold()


def verify_draft_target(workspace: dict[str, Any], draft: dict[str, Any]) -> None:
    target = draft["target"]
    possible_targets = list_targets(workspace, target["lessonDate"])
    matches = [
        candidate
        for candidate in possible_targets
        if (
            candidate["classId"] == target["classId"]
            and (
                target["classId"] is not None
                or normalized_class_name(candidate["className"])
                == normalized_class_name(target["className"])
            )
        )
    ]
    if len(matches) != 1:
        raise IntakeError(
            "The lesson draft does not match one exact current Planner target."
        )
    phase_by_id = {phase["phaseId"]: phase for phase in matches[0]["phases"]}
    if len(phase_by_id) != len(matches[0]["phases"]):
        raise IntakeError("The Planner target has duplicate phase identities.")
    for proposed in draft["phases"]:
        current = phase_by_id.get(proposed["phaseId"])
        if (
            current is None
            or current["title"] != proposed["title"]
            or current["time"] != proposed["time"]
        ):
            raise IntakeError(
                "The lesson draft does not match the current Planner phase identity."
            )


def verify_announcement_target(
    workspace: dict[str, Any],
    announcement: dict[str, Any],
) -> None:
    class_documents = [
        document
        for document in workspace["documents"]
        if is_record(document)
        and document.get("kind") == "classes"
        and document.get("id") == "default"
    ]
    if len(class_documents) != 1 or not is_record(class_documents[0].get("value")):
        raise IntakeError("The Planner classes document is unavailable.")
    storage = class_documents[0]["value"]
    classes = storage.get("classes")
    if storage.get("version") != 1 or not isinstance(classes, list) or len(classes) > 200:
        raise IntakeError("The Planner classes document is invalid.")
    identities: list[tuple[str, str]] = []
    for local_class in classes:
        if (
            not is_record(local_class)
            or not valid_id(local_class.get("id"))
            or not valid_single_line_text(local_class.get("name"), 200)
        ):
            raise IntakeError("The Planner classes document is invalid.")
        identities.append((local_class["id"], local_class["name"]))
    if len({class_id for class_id, _name in identities}) != len(identities):
        raise IntakeError("The Planner classes document has duplicate class identities.")
    matches = [
        class_name
        for class_id, class_name in identities
        if class_id == announcement["classId"]
    ]
    if (
        len(matches) != 1
        or normalized_class_name(matches[0])
        != normalized_class_name(announcement["className"])
    ):
        raise IntakeError(
            "The announcement does not match one exact current Planner class."
        )


def enqueue(workspace: dict[str, Any], item: dict[str, Any]) -> bool:
    operations = operations_document(workspace)["value"]
    intake = operations["plannerIntake"]
    if item.get("kind") == "lesson-draft":
        validated_item = validate_draft(item)
        key = "lessonDrafts"
    elif item.get("kind") == "announcement":
        validated_item = validate_announcement(item)
        key = "announcementSuggestions"
    else:
        raise IntakeError("Only lesson drafts and announcements can be enqueued here.")
    existing = [
        candidate
        for queue_key in ("lessonDrafts", "announcementSuggestions", "backlogCaptures")
        for candidate in intake[queue_key]
        if candidate["id"] == validated_item["id"]
    ]
    if existing:
        if existing[0] == validated_item:
            return False
        raise IntakeError(
            "That Planner intake ID already exists with a different payload."
        )
    if validated_item["kind"] == "lesson-draft":
        verify_draft_target(workspace, validated_item)
    else:
        verify_announcement_target(workspace, validated_item)
    if len(intake[key]) >= 200:
        raise IntakeError("The Planner intake queue is full.")
    intake[key].append(validated_item)
    return True


def pending_backlog(workspace: dict[str, Any]) -> list[dict[str, Any]]:
    intake = operations_document(workspace)["value"]["plannerIntake"]
    decisions = intake["decisionById"]
    pending = []
    for raw in intake["backlogCaptures"]:
        capture = validate_backlog_capture(raw)
        if capture["id"] not in decisions:
            pending.append(capture)
    return pending


def list_targets(workspace: dict[str, Any], lesson_date: str | None = None) -> list[dict[str, Any]]:
    if lesson_date is not None and not valid_date(lesson_date):
        raise IntakeError("The requested target date is invalid.")
    index_documents = [
        document
        for document in workspace["documents"]
        if is_record(document)
        and document.get("kind") == "lesson-index"
        and document.get("id") == "default"
        and is_record(document.get("value"))
    ]
    if len(index_documents) != 1 or not isinstance(index_documents[0]["value"].get("plans"), list):
        raise IntakeError("The Planner lesson index is unavailable.")
    lesson_by_id = {
        document["id"]: document["value"]
        for document in workspace["documents"]
        if is_record(document)
        and document.get("kind") == "lesson"
        and valid_id(document.get("id"))
        and is_record(document.get("value"))
    }
    targets = []
    for plan in index_documents[0]["value"]["plans"]:
        if (
            not is_record(plan)
            or not valid_id(plan.get("id"))
            or not valid_date(plan.get("date"))
            or not (plan.get("classId") is None or valid_id(plan.get("classId")))
            or not valid_single_line_text(plan.get("title"), 200)
            or (lesson_date is not None and plan["date"] != lesson_date)
        ):
            continue
        lesson = lesson_by_id.get(plan["id"])
        phases = lesson.get("phases") if lesson else None
        if not isinstance(phases, list):
            continue
        safe_phases = []
        for phase in phases:
            if (
                not is_record(phase)
                or not valid_id(phase.get("id"))
                or not valid_single_line_text(phase.get("title"), 200)
                or not valid_single_line_text(phase.get("time"), 100)
            ):
                raise IntakeError("A Planner target contains an invalid phase identity.")
            safe_phases.append(
                {"phaseId": phase["id"], "title": phase["title"], "time": phase["time"]}
            )
        targets.append(
            {
                "lessonId": plan["id"],
                "lessonDate": plan["date"],
                "classId": plan.get("classId"),
                "className": re.sub(
                    r"\s+LESSON\s*$", "", plan["title"], flags=re.IGNORECASE
                ).strip(),
                "phases": safe_phases,
            }
        )
    return sorted(targets, key=lambda target: (target["lessonDate"], target["className"], target["lessonId"]))


def mark_backlog(
    workspace: dict[str, Any],
    item_id: str,
    decision: str,
) -> None:
    intake = operations_document(workspace)["value"]["plannerIntake"]
    captures = {capture["id"] for capture in map(validate_backlog_capture, intake["backlogCaptures"])}
    if item_id not in captures:
        raise IntakeError("That backlog capture is not present in the Planner queue.")
    intake["decisionById"][item_id] = decision


def workspace_write_body(workspace: dict[str, Any]) -> bytes:
    operations_document(workspace)
    documents = []
    for document in workspace["documents"]:
        if (
            not is_record(document)
            or not valid_text(document.get("kind"), 100)
            or not valid_text(document.get("id"), 200)
            or "value" not in document
        ):
            raise IntakeError("The Planner workspace contains an unsupported document.")
        documents.append(
            {"kind": document["kind"], "id": document["id"], "value": document["value"]}
        )
    return json.dumps(
        {"version": 1, "documents": documents},
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")


def save_workspace(
    origin: str,
    workspace: dict[str, Any],
    opener=urllib.request.urlopen,
) -> int:
    request = urllib.request.Request(
        service_url(origin),
        data=workspace_write_body(workspace),
        method="PUT",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "If-Match": f'"{workspace["revision"]}"',
            "User-Agent": "Mozilla/5.0 Codex-Planner-Intake/1",
        },
    )
    try:
        with opener(request, timeout=20) as response:
            saved = json.load(response)
    except urllib.error.HTTPError as exc:
        if exc.code == 412:
            raise IntakeError(
                "The Planner changed concurrently. Reload its queue and retry once."
            ) from exc
        raise IntakeError("The Planner intake update was rejected.") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise IntakeError("The Planner intake update could not be confirmed.") from exc
    revision = saved.get("revision") if is_record(saved) else None
    if not isinstance(revision, int) or revision <= workspace["revision"]:
        raise IntakeError("The Planner returned an invalid save confirmation.")
    return revision


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    root.add_argument("--origin", default=DEFAULT_ORIGIN)
    commands = root.add_subparsers(dest="command", required=True)
    commands.add_parser("enqueue-draft")
    commands.add_parser("enqueue-announcement")
    commands.add_parser("migrate-intake")
    commands.add_parser("pending-backlog")
    targets = commands.add_parser("list-targets")
    targets.add_argument("--date")
    mark = commands.add_parser("mark-backlog")
    mark.add_argument("--id", required=True)
    mark.add_argument("--decision", required=True, choices=("applied", "dismissed"))
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        workspace = load_workspace(args.origin)
        if args.command == "migrate-intake":
            migrated = migrate_intake(workspace)
            revision = save_workspace(args.origin, workspace) if migrated else workspace["revision"]
            print(json.dumps({"version": 4, "migrated": migrated, "revision": revision}))
            return 0
        if args.command == "list-targets":
            targets = list_targets(workspace, args.date)
            print(json.dumps({"version": 1, "targets": targets}, ensure_ascii=False))
            return 0
        if args.command == "pending-backlog":
            print(json.dumps({"version": 1, "items": pending_backlog(workspace)}, ensure_ascii=False))
            return 0
        if args.command == "mark-backlog":
            if not valid_id(args.id):
                raise IntakeError("The backlog capture ID is invalid.")
            mark_backlog(workspace, args.id, args.decision)
            revision = save_workspace(args.origin, workspace)
            print(json.dumps({"id": args.id, "decision": args.decision, "revision": revision}))
            return 0
        kind = "lesson-draft" if args.command == "enqueue-draft" else "announcement"
        item = read_stdin_item(kind)
        changed = enqueue(workspace, item)
        revision = save_workspace(args.origin, workspace) if changed else workspace["revision"]
        print(json.dumps({"id": item["id"], "kind": item["kind"], "queued": changed, "revision": revision}))
        return 0
    except IntakeError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
