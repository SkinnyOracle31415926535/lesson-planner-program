#!/usr/bin/env python3
"""Resolve one class day from the sanitized schedule fixture.

This is deliberately downstream of ``vault_importer.py``: it reads the
already-sanitized summary in the LESSON PLANNER PROGRAM project and produces a
small, class-specific planning handoff.  It never opens the legacy vault,
copies student data, or accesses media.

The resolver makes the calendar-week rule explicit.  A fifth (or later) month
week that requires confirmation never guesses Odd or Even; it returns an empty
schedule until the caller supplies an intentional manual choice.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Mapping


SCHEMA_VERSION = 1
DAY_LABELS = ("Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun")


class ScheduleResolutionError(RuntimeError):
    """Raised when the safe schedule summary is incomplete or misused."""


def _is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def resolve_project_root(project_root: Path) -> Path:
    root = project_root.expanduser().resolve()
    if not root.is_dir():
        raise ScheduleResolutionError(f"Project root is not a directory: {root}")
    return root


def _resolve_project_file(project_root: Path, path: Path, *, label: str) -> Path:
    resolved = path.expanduser().resolve()
    if not _is_within(resolved, project_root):
        raise ScheduleResolutionError(
            f"{label} must stay inside the LESSON PLANNER PROGRAM project root."
        )
    return resolved


def _load_summary(project_root: Path, summary_path: Path) -> Mapping[str, Any]:
    resolved = _resolve_project_file(project_root, summary_path, label="Summary input")
    if not resolved.is_file():
        raise ScheduleResolutionError(f"Summary input is not a file: {resolved}")
    try:
        payload = json.loads(resolved.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ScheduleResolutionError("Summary input is not valid JSON.") from error
    if not isinstance(payload, Mapping):
        raise ScheduleResolutionError("Summary input must be a JSON object.")
    return payload


def _required_mapping(value: Any, field_name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ScheduleResolutionError(f"Expected {field_name!r} to be an object.")
    return value


def _required_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value:
        raise ScheduleResolutionError(f"Expected {field_name!r} to be a non-empty string.")
    return value


def _string_list(value: Any, field_name: str) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(item, str) and item for item in value):
        raise ScheduleResolutionError(f"Expected {field_name!r} to be a list of non-empty strings.")
    return list(value)


def _month_week_ordinal(target_date: date) -> int:
    """Return the Monday–Sunday ordinal of ``target_date`` within its month."""

    first_of_month = target_date.replace(day=1)
    monday_anchor = first_of_month - timedelta(days=first_of_month.weekday())
    return ((target_date - monday_anchor).days // 7) + 1


def _date_is_in_schedule_range(schedule: Mapping[str, Any], target_date: date) -> bool:
    start_value = schedule.get("effectiveStart")
    end_value = schedule.get("effectiveEnd")
    try:
        start = date.fromisoformat(start_value) if isinstance(start_value, str) and start_value else None
        end = date.fromisoformat(end_value) if isinstance(end_value, str) and end_value else None
    except ValueError as error:
        raise ScheduleResolutionError("Schedule effective range must use ISO dates.") from error
    return (start is None or target_date >= start) and (end is None or target_date <= end)


def _normalize_time_block(block: Mapping[str, Any]) -> dict[str, Any]:
    booking_id = _required_string(block.get("bookingId"), "bookingId")
    label = _required_string(block.get("canonicalEventLabel"), "canonicalEventLabel")
    activity_type = _required_string(block.get("activityType"), "activityType")
    equipment = _string_list(block.get("equipment"), "equipment")
    start_minute = block.get("startMinute")
    end_minute = block.get("endMinute")
    if not isinstance(start_minute, int) or not isinstance(end_minute, int) or not 0 <= start_minute < end_minute <= 1440:
        raise ScheduleResolutionError(f"Booking {booking_id!r} has invalid start/end minute values.")

    record: dict[str, Any] = {
        "bookingId": booking_id,
        "startMinute": start_minute,
        "endMinute": end_minute,
        "eventLabel": label,
        "equipment": sorted(set(equipment)),
        "activityType": activity_type,
    }
    for optional_field in ("confidence", "reviewStatus"):
        value = block.get(optional_field)
        if isinstance(value, str) and value:
            record[optional_field] = value
    return record


def _rotation_for_date(
    calendar_rule: Mapping[str, Any],
    target_date: date,
    available_weeks: list[str],
    manual_week_choice: str | None,
) -> dict[str, Any]:
    ordinal = _month_week_ordinal(target_date)
    odd_ordinals = calendar_rule.get("oddWeekOrdinals", [])
    even_ordinals = calendar_rule.get("evenWeekOrdinals", [])
    if not all(isinstance(value, int) for value in odd_ordinals) or not all(isinstance(value, int) for value in even_ordinals):
        raise ScheduleResolutionError("Calendar week ordinals must be integer lists.")

    resolved_week: str | None = None
    status = "unmapped"
    if ordinal in odd_ordinals:
        resolved_week = "Odd"
        status = "auto"
    elif ordinal in even_ordinals:
        resolved_week = "Even"
        status = "auto"
    elif bool(calendar_rule.get("weekFiveOrLaterRequiresManualConfirmation")):
        if manual_week_choice is None:
            status = "manual_confirmation_required"
        elif manual_week_choice in available_weeks:
            resolved_week = manual_week_choice
            status = "manual_confirmed"
        else:
            raise ScheduleResolutionError(
                f"Manual week choice must be one of: {', '.join(available_weeks)}."
            )
    elif manual_week_choice is not None:
        if manual_week_choice not in available_weeks:
            raise ScheduleResolutionError(
                f"Manual week choice must be one of: {', '.join(available_weeks)}."
            )
        resolved_week = manual_week_choice
        status = "manual_confirmed"

    return {
        "monthWeekOrdinal": ordinal,
        "status": status,
        "resolvedWeek": resolved_week,
        "availableWeekChoices": available_weeks,
        "manualConfirmationRequired": status == "manual_confirmation_required",
    }


def build_day_plan(
    summary: Mapping[str, Any],
    target_date: date,
    *,
    group: str | None = None,
    manual_week_choice: str | None = None,
) -> dict[str, Any]:
    """Resolve schedule blocks for one date and optional class/group.

    A class is intentionally required before blocks are returned.  That keeps
    the planning surface narrow instead of presenting every gym schedule at
    once.  Schedule-defined ``open`` blocks are returned separately so the UI
    can offer them as optional openings instead of automatically using them.
    """

    schedule = _required_mapping(summary.get("schedule"), "schedule")
    source_id = _required_string(schedule.get("sourceId"), "schedule.sourceId")
    schedule_id = _required_string(schedule.get("scheduleId"), "schedule.scheduleId")
    revision = _required_string(schedule.get("revision"), "schedule.revision")
    calendar_rule = _required_mapping(schedule.get("calendarWeekRule"), "calendarWeekRule")
    time_blocks_value = schedule.get("timeBlocks")
    if not isinstance(time_blocks_value, list) or not all(isinstance(block, Mapping) for block in time_blocks_value):
        raise ScheduleResolutionError("Schedule timeBlocks must be a list of objects.")

    all_blocks = list(time_blocks_value)
    available_weeks = sorted({_required_string(block.get("week"), "time block week") for block in all_blocks})
    if not available_weeks:
        raise ScheduleResolutionError("Schedule has no week choices.")

    day_label = DAY_LABELS[target_date.weekday()]
    date_is_in_range = _date_is_in_schedule_range(schedule, target_date)
    rotation = _rotation_for_date(calendar_rule, target_date, available_weeks, manual_week_choice)

    matching_day_blocks: list[Mapping[str, Any]] = []
    if date_is_in_range and rotation["resolvedWeek"] is not None:
        matching_day_blocks = [
            block for block in all_blocks
            if block.get("day") == day_label and block.get("week") == rotation["resolvedWeek"]
        ]

    available_groups = sorted(
        {
            _required_string(block.get("group"), "time block group")
            for block in matching_day_blocks
        }
    )
    if group is not None and group not in available_groups:
        if not date_is_in_range:
            raise ScheduleResolutionError("The selected date is outside the schedule effective range.")
        if rotation["manualConfirmationRequired"]:
            raise ScheduleResolutionError("Confirm this fifth-week rotation before selecting a class.")
        raise ScheduleResolutionError(
            f"Class/group {group!r} is not scheduled on {target_date.isoformat()} for {rotation['resolvedWeek']} week."
        )

    selected_blocks = [block for block in matching_day_blocks if block.get("group") == group] if group else []
    normalized_blocks = sorted(
        (_normalize_time_block(block) for block in selected_blocks),
        key=lambda block: (block["startMinute"], block["endMinute"], block["bookingId"]),
    )

    if not date_is_in_range:
        selection_status = "outside_schedule_range"
    elif rotation["manualConfirmationRequired"]:
        selection_status = "manual_week_confirmation_required"
    elif group is None:
        selection_status = "group_required"
    elif not normalized_blocks:
        selection_status = "no_blocks_for_group"
    else:
        selection_status = "ready"

    unresolved_warnings = _required_mapping(schedule.get("collisionWarnings"), "collisionWarnings").get("warningCount", 0)
    if not isinstance(unresolved_warnings, int) or unresolved_warnings < 0:
        raise ScheduleResolutionError("Schedule collision warning count must be a non-negative integer.")
    advisories = []
    if unresolved_warnings:
        advisories.append(
            "The source schedule has unresolved collision warnings; treat this draft as advisory until reviewed."
        )
    if rotation["manualConfirmationRequired"]:
        advisories.append(
            "This is a fifth-or-later calendar week. Confirm Odd or Even before creating a lesson draft."
        )

    return {
        "schemaVersion": SCHEMA_VERSION,
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "rawSourceLabelsIncluded": False,
        },
        "source": {
            "sourceId": source_id,
            "scheduleId": schedule_id,
            "revision": revision,
        },
        "date": {
            "iso": target_date.isoformat(),
            "day": day_label,
        },
        "rotation": rotation,
        "selection": {
            "status": selection_status,
            "selectedGroup": group,
            "availableGroups": available_groups,
        },
        "plan": {
            "rotationBlocks": [block for block in normalized_blocks if block["activityType"] == "rotation"],
            "openings": [block for block in normalized_blocks if block["activityType"] == "open"],
            "supportBlocks": [
                block
                for block in normalized_blocks
                if block["activityType"] not in {"rotation", "open"}
            ],
        },
        "advisories": advisories,
    }


def write_day_plan(project_root: Path, output_path: Path, payload: Mapping[str, Any]) -> Path:
    output = _resolve_project_file(project_root, output_path, label="Output")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return output


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", required=True, type=Path, help="LESSON PLANNER PROGRAM project root.")
    parser.add_argument("--summary", required=True, type=Path, help="Sanitized vault-summary JSON inside the project.")
    parser.add_argument("--date", required=True, help="Planning date in ISO format (YYYY-MM-DD).")
    parser.add_argument("--group", help="Exact class/group name selected by the coach.")
    parser.add_argument("--manual-week-choice", help="Intentional rotation choice for a fifth-or-later calendar week.")
    parser.add_argument("--out", required=True, type=Path, help="Output JSON inside the project.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        target_date = date.fromisoformat(arguments.date)
    except ValueError:
        print("error: --date must use YYYY-MM-DD.", file=sys.stderr)
        return 2

    try:
        project_root = resolve_project_root(arguments.project_root)
        summary = _load_summary(project_root, arguments.summary)
        payload = build_day_plan(
            summary,
            target_date,
            group=arguments.group,
            manual_week_choice=arguments.manual_week_choice,
        )
        output = write_day_plan(project_root, arguments.out, payload)
    except ScheduleResolutionError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
