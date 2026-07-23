#!/usr/bin/env python3
"""Export the sanitized schedule fixture for local Lesson Planner import.

This bridge reads exactly ``fixtures/vault-summary.json`` inside the Lesson
Planner project.  It never accepts a vault path and never opens the legacy
vault, rosters, drill library, weekly ledger, or media.  The result is a
strict, deterministic projection containing only the schedule fields needed
for browser-local availability advice.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections.abc import Mapping, Sequence
from datetime import date
from pathlib import Path
from typing import Any


FORMAT = "lesson-planner-safe-schedule"
SCHEMA_VERSION = 1
SOURCE_FIXTURE_RELATIVE_PATH = Path("fixtures/vault-summary.json")
DEFAULT_OUTPUT_RELATIVE_PATH = Path("local/imports/lesson-planner-safe-schedule.json")
DAY_LABELS = ("Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun")
WEEK_LABELS = ("Odd", "Even")
ACTIVITY_TYPES = ("rotation", "open", "support", "conditioning", "warmup")
CONFIDENCE_VALUES = ("high", "medium", "low")
REVIEW_STATUS_VALUES = (
    "auto_extracted",
    "color_inferred",
    "color_inferred_needs_review",
    "needs_review",
)

SOURCE_PRIVACY_FALSE_MARKERS = (
    "studentRecordsIncluded",
    "mediaBytesIncluded",
    "rawWeeklyNoteTextIncluded",
    "absoluteSourcePathsIncluded",
)

OUTPUT_PRIVACY = {
    "studentRecordsIncluded": False,
    "rostersIncluded": False,
    "mediaBytesIncluded": False,
    "urlsIncluded": False,
    "absoluteSourcePathsIncluded": False,
    "rawScheduleLabelsIncluded": False,
    "rawWeeklyNoteTextIncluded": False,
    "sourceClassNamesIncluded": False,
    "sourceBookingIdsIncluded": False,
    "drillLibraryIncluded": False,
    "weeklyLedgerIncluded": False,
}


class SafeScheduleExportError(RuntimeError):
    """Raised when the safe fixture or requested output is invalid."""


def _is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def resolve_project_root(project_root: Path) -> Path:
    root = project_root.expanduser().resolve()
    if not root.is_dir():
        raise SafeScheduleExportError(f"Project root is not a directory: {root}")
    return root


def _source_fixture_path(project_root: Path) -> Path:
    source = (project_root / SOURCE_FIXTURE_RELATIVE_PATH).resolve()
    if not _is_within(source, project_root):
        raise SafeScheduleExportError("Sanitized schedule fixture must stay inside the project root.")
    if not source.is_file():
        raise SafeScheduleExportError(f"Sanitized schedule fixture is not a file: {source}")
    return source


def _load_sanitized_fixture(project_root: Path) -> Mapping[str, Any]:
    source = _source_fixture_path(project_root)
    try:
        payload = json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise SafeScheduleExportError("Sanitized schedule fixture is not valid JSON.") from error
    return _required_mapping(payload, "summary")


def _required_mapping(value: Any, field_name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise SafeScheduleExportError(f"Expected {field_name!r} to be an object.")
    return value


def _contains_path_or_url(value: str) -> bool:
    lowered = value.lower()
    if not value or "\x00" in value or "\n" in value or "\r" in value:
        return True
    if value.startswith(("/", "~")) or "\\" in value or "://" in value:
        return True
    return bool(
        re.search(
            r"(?:^|/)(?:users|var|private|volumes|library|applications|system)(?:/|$)",
            lowered,
        )
        or "/../" in lowered
        or lowered.startswith("../")
        or lowered.endswith("/..")
    )


def _safe_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise SafeScheduleExportError(f"Expected {field_name!r} to be a non-empty string.")
    text = value.strip()
    if _contains_path_or_url(text):
        raise SafeScheduleExportError(f"Refusing path-like or URL value in {field_name!r}.")
    return text


def _safe_string_list(value: Any, field_name: str) -> list[str]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        raise SafeScheduleExportError(f"Expected {field_name!r} to be a list of strings.")
    return sorted({_safe_string(item, f"{field_name} item") for item in value})


def _required_integer(value: Any, field_name: str, *, minimum: int = 0) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise SafeScheduleExportError(
            f"Expected {field_name!r} to be an integer of at least {minimum}."
        )
    return value


def _optional_iso_date(value: Any, field_name: str) -> str | None:
    if value is None:
        return None
    text = _safe_string(value, field_name)
    try:
        date.fromisoformat(text)
    except ValueError as error:
        raise SafeScheduleExportError(f"Expected {field_name!r} to use YYYY-MM-DD.") from error
    return text


def _validate_source_privacy(summary: Mapping[str, Any]) -> None:
    privacy = _required_mapping(summary.get("privacy"), "privacy")
    for marker in SOURCE_PRIVACY_FALSE_MARKERS:
        if privacy.get(marker) is not False:
            raise SafeScheduleExportError(
                "Safe schedule export requires the sanitized source fixture to assert "
                f"privacy.{marker} is false."
            )


def _normalize_calendar_week_rule(value: Any, schedule_timezone: str) -> dict[str, Any]:
    rule = _required_mapping(value, "schedule.calendarWeekRule")
    odd_ordinals = rule.get("oddWeekOrdinals")
    even_ordinals = rule.get("evenWeekOrdinals")
    if not isinstance(odd_ordinals, list) or not odd_ordinals:
        raise SafeScheduleExportError("Odd calendar week ordinals must be a non-empty list.")
    if not isinstance(even_ordinals, list) or not even_ordinals:
        raise SafeScheduleExportError("Even calendar week ordinals must be a non-empty list.")
    if any(isinstance(item, bool) or not isinstance(item, int) or item < 1 for item in odd_ordinals):
        raise SafeScheduleExportError("Odd calendar week ordinals must be positive integers.")
    if any(isinstance(item, bool) or not isinstance(item, int) or item < 1 for item in even_ordinals):
        raise SafeScheduleExportError("Even calendar week ordinals must be positive integers.")

    normalized_odd = sorted(set(odd_ordinals))
    normalized_even = sorted(set(even_ordinals))
    if set(normalized_odd) & set(normalized_even):
        raise SafeScheduleExportError("Odd and Even calendar week ordinals must not overlap.")

    rule_timezone = _safe_string(rule.get("timezone"), "calendarWeekRule.timezone")
    if rule_timezone != schedule_timezone:
        raise SafeScheduleExportError("Schedule and calendar-week-rule timezones must match.")

    manual_confirmation = rule.get("weekFiveOrLaterRequiresManualConfirmation")
    if manual_confirmation is not True:
        raise SafeScheduleExportError(
            "calendarWeekRule.weekFiveOrLaterRequiresManualConfirmation must be true."
        )

    fixed_values = {
        "weekStart": "monday",
        "weekEnd": "sunday",
        "monthWeekAnchor": "monday_sunday_week_containing_month_day_1",
        "overflowWeekBehavior": "manual_confirmation_required",
    }
    for field_name, expected in fixed_values.items():
        if rule.get(field_name) != expected:
            raise SafeScheduleExportError(
                f"calendarWeekRule.{field_name} must be {expected!r}."
            )

    return {
        "ruleId": _safe_string(rule.get("ruleId"), "calendarWeekRule.ruleId"),
        "timezone": rule_timezone,
        "weekStart": fixed_values["weekStart"],
        "weekEnd": fixed_values["weekEnd"],
        "monthWeekAnchor": fixed_values["monthWeekAnchor"],
        "oddWeekOrdinals": normalized_odd,
        "evenWeekOrdinals": normalized_even,
        "weekFiveOrLaterRequiresManualConfirmation": manual_confirmation,
        "overflowWeekBehavior": fixed_values["overflowWeekBehavior"],
    }


def _normalize_equipment_inventory(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value:
        raise SafeScheduleExportError("schedule.equipment must be a non-empty list.")

    inventory: list[dict[str, Any]] = []
    names: set[str] = set()
    display_orders: set[int] = set()
    for index, raw_item in enumerate(value):
        item = _required_mapping(raw_item, f"schedule.equipment[{index}]")
        name = _safe_string(item.get("name"), f"schedule.equipment[{index}].name")
        display_order = _required_integer(
            item.get("displayOrder"), f"schedule.equipment[{index}].displayOrder"
        )
        is_single_unit = item.get("isSingleUnit")
        if not isinstance(is_single_unit, bool):
            raise SafeScheduleExportError(
                f"schedule.equipment[{index}].isSingleUnit must be a boolean."
            )
        if name in names or display_order in display_orders:
            raise SafeScheduleExportError(
                "Schedule equipment names and display orders must each be unique."
            )
        names.add(name)
        display_orders.add(display_order)
        inventory.append(
            {
                "name": name,
                "displayOrder": display_order,
                "isSingleUnit": is_single_unit,
            }
        )
    return sorted(inventory, key=lambda item: (item["displayOrder"], item["name"]))


def _normalize_time_blocks(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value:
        raise SafeScheduleExportError("schedule.timeBlocks must be a non-empty list.")

    blocks: list[dict[str, Any]] = []
    booking_ids: set[str] = set()
    for index, raw_block in enumerate(value):
        block = _required_mapping(raw_block, f"schedule.timeBlocks[{index}]")
        booking_id = _safe_string(
            block.get("bookingId"), f"schedule.timeBlocks[{index}].bookingId"
        )
        if booking_id in booking_ids:
            raise SafeScheduleExportError(f"Duplicate schedule bookingId: {booking_id}")
        booking_ids.add(booking_id)

        day = _safe_string(block.get("day"), f"schedule.timeBlocks[{index}].day")
        week = _safe_string(block.get("week"), f"schedule.timeBlocks[{index}].week")
        if day not in DAY_LABELS:
            raise SafeScheduleExportError(f"Unsupported schedule day label: {day}")
        if week not in WEEK_LABELS:
            raise SafeScheduleExportError(f"Unsupported schedule week label: {week}")

        start_minute = _required_integer(
            block.get("startMinute"), f"schedule.timeBlocks[{index}].startMinute"
        )
        end_minute = _required_integer(
            block.get("endMinute"), f"schedule.timeBlocks[{index}].endMinute"
        )
        if not 0 <= start_minute < end_minute <= 1440:
            raise SafeScheduleExportError(f"Booking {booking_id!r} has an invalid time range.")
        if start_minute % 5 or end_minute % 5:
            raise SafeScheduleExportError(
                f"Booking {booking_id!r} must use five-minute time boundaries."
            )

        canonical_label = _safe_string(
            block.get("canonicalEventLabel"),
            f"schedule.timeBlocks[{index}].canonicalEventLabel",
        )
        activity_type = _safe_string(
            block.get("activityType"), f"schedule.timeBlocks[{index}].activityType"
        )
        confidence = _safe_string(
            block.get("confidence"), f"schedule.timeBlocks[{index}].confidence"
        )
        review_status = _safe_string(
            block.get("reviewStatus"), f"schedule.timeBlocks[{index}].reviewStatus"
        )
        if activity_type not in ACTIVITY_TYPES:
            raise SafeScheduleExportError(f"Unsupported schedule activity type: {activity_type}")
        if confidence not in CONFIDENCE_VALUES:
            raise SafeScheduleExportError(f"Unsupported schedule confidence: {confidence}")
        if review_status not in REVIEW_STATUS_VALUES:
            raise SafeScheduleExportError(f"Unsupported schedule review status: {review_status}")
        blocks.append(
            {
                "bookingId": booking_id,
                "day": day,
                "week": week,
                "group": _safe_string(
                    block.get("group"), f"schedule.timeBlocks[{index}].group"
                ),
                "startMinute": start_minute,
                "endMinute": end_minute,
                "canonicalEventLabel": canonical_label,
                "eventLabel": canonical_label,
                "equipment": _safe_string_list(
                    block.get("equipment"), f"schedule.timeBlocks[{index}].equipment"
                ),
                "activityType": activity_type,
                "confidence": confidence,
                "reviewStatus": review_status,
            }
        )

    day_order = {label: index for index, label in enumerate(DAY_LABELS)}
    week_order = {label: index for index, label in enumerate(WEEK_LABELS)}
    return sorted(
        blocks,
        key=lambda block: (
            day_order[block["day"]],
            week_order[block["week"]],
            block["group"].casefold(),
            block["startMinute"],
            block["endMinute"],
            block["bookingId"],
        ),
    )


def _normalize_collision_warnings(value: Any) -> dict[str, Any]:
    warnings = _required_mapping(value, "schedule.collisionWarnings")
    warning_count = _required_integer(
        warnings.get("warningCount"), "schedule.collisionWarnings.warningCount"
    )
    raw_status_counts = _required_mapping(
        warnings.get("statusCounts"), "schedule.collisionWarnings.statusCounts"
    )
    status_counts: dict[str, int] = {}
    for raw_status, raw_count in raw_status_counts.items():
        status = _safe_string(raw_status, "collision warning status")
        if status in status_counts:
            raise SafeScheduleExportError(f"Duplicate collision warning status: {status}")
        status_counts[status] = _required_integer(
            raw_count, f"collision warning status {status!r}"
        )
    if warning_count > sum(status_counts.values()):
        raise SafeScheduleExportError(
            "Collision warning count cannot exceed the total status count."
        )
    return {
        "warningCount": warning_count,
        "statusCounts": {status: status_counts[status] for status in sorted(status_counts)},
    }


def build_safe_schedule_bundle(summary: Mapping[str, Any]) -> dict[str, Any]:
    """Return a strict schedule-only projection of a sanitized summary."""

    _validate_source_privacy(summary)
    schedule = _required_mapping(summary.get("schedule"), "schedule")
    timezone = _safe_string(schedule.get("timezone"), "schedule.timezone")
    return {
        "format": FORMAT,
        "version": SCHEMA_VERSION,
        "privacy": dict(OUTPUT_PRIVACY),
        "schedule": {
            "sourceId": _safe_string(schedule.get("sourceId"), "schedule.sourceId"),
            "scheduleId": _safe_string(schedule.get("scheduleId"), "schedule.scheduleId"),
            "revision": _safe_string(schedule.get("revision"), "schedule.revision"),
            "timezone": timezone,
            "effectiveStart": _optional_iso_date(
                schedule.get("effectiveStart"), "schedule.effectiveStart"
            ),
            "effectiveEnd": _optional_iso_date(
                schedule.get("effectiveEnd"), "schedule.effectiveEnd"
            ),
            "calendarWeekRule": _normalize_calendar_week_rule(
                schedule.get("calendarWeekRule"), timezone
            ),
            "equipment": _normalize_equipment_inventory(schedule.get("equipment")),
            "timeBlocks": _normalize_time_blocks(schedule.get("timeBlocks")),
            "collisionWarnings": _normalize_collision_warnings(
                schedule.get("collisionWarnings")
            ),
        },
    }


def write_safe_schedule_bundle(
    project_root: Path, output_path: Path, payload: Mapping[str, Any]
) -> Path:
    """Atomically write deterministic JSON inside the Lesson Planner project."""

    output = output_path.expanduser().resolve()
    if not _is_within(output, project_root):
        raise SafeScheduleExportError("Output must stay inside the LESSON PLANNER PROGRAM root.")
    if output == _source_fixture_path(project_root):
        raise SafeScheduleExportError("Output must not replace the sanitized source fixture.")

    output.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(payload, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_text(rendered, encoding="utf-8")
    temporary.chmod(0o600)
    temporary.replace(output)
    return output


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--project-root", required=True, type=Path, help="LESSON PLANNER PROGRAM root."
    )
    parser.add_argument(
        "--out",
        type=Path,
        help=(
            "Safe schedule JSON destination inside the project. Defaults to "
            "local/imports/lesson-planner-safe-schedule.json."
        ),
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        project_root = resolve_project_root(arguments.project_root)
        output_path = arguments.out or project_root / DEFAULT_OUTPUT_RELATIVE_PATH
        if not output_path.is_absolute():
            output_path = project_root / output_path
        summary = _load_sanitized_fixture(project_root)
        payload = build_safe_schedule_bundle(summary)
        output = write_safe_schedule_bundle(project_root, output_path, payload)
    except SafeScheduleExportError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
