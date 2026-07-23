#!/usr/bin/env python3
"""Build a sanitized, read-only handoff from the existing gymnastics vault.

This bridge deliberately has a small boundary:

* it opens the source SQLite database using SQLite's ``mode=ro`` URI;
* it discovers source JSON by filename, so stylized legacy directories are not
  coupled to the new project;
* it never reads rosters or copies media bytes; and
* it refuses to write an output anywhere inside the source vault.

The resulting JSON is an import *summary*, not a replacement for the eventual
private sync service.  In particular, it contains no student records, raw
weekly-note text, absolute paths, or media files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from collections import Counter
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any


CONTRACT_VERSION = "1.0"
SAFE_COLLISION_STATUSES = frozenset({"accepted", "allowed", "dismissed", "resolved"})


class BridgeError(RuntimeError):
    """Raised when a source is ambiguous, incomplete, or unsafe to use."""


def _is_within(path: Path, parent: Path) -> bool:
    """Return whether ``path`` is equal to or contained by ``parent``."""

    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def resolve_vault_root(vault_root: Path) -> Path:
    """Resolve and validate the explicitly supplied vault root."""

    root = vault_root.expanduser().resolve()
    if not root.is_dir():
        raise BridgeError(f"Vault root is not a directory: {root}")
    return root


def _resolve_output(vault_root: Path, output_path: Path) -> Path:
    """Resolve an output path and reject any write back into the vault."""

    output = output_path.expanduser().resolve()
    if _is_within(output, vault_root):
        raise BridgeError(
            "Refusing to write inside the source vault. Choose an output under "
            "the LESSON PLANNER PROGRAM project instead."
        )
    return output


def _discover_source(root: Path, filename: str, *, required: bool) -> Path | None:
    """Find one source file by filename without encoding legacy Unicode paths."""

    matches: list[Path] = []
    for candidate in root.rglob(filename):
        resolved = candidate.resolve()
        if not _is_within(resolved, root):
            raise BridgeError(f"Source symlink escapes the vault: {candidate}")
        if resolved.is_file():
            matches.append(resolved)

    matches.sort(key=lambda item: item.as_posix())
    if not matches:
        if required:
            raise BridgeError(f"Could not find required source file: {filename}")
        return None
    if len(matches) > 1:
        choices = ", ".join(str(path.relative_to(root)) for path in matches)
        raise BridgeError(f"Ambiguous {filename}; found {len(matches)} files: {choices}")
    return matches[0]


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _open_read_only_sqlite(path: Path) -> sqlite3.Connection:
    """Open SQLite without any ability to alter the source database."""

    # Keep literal spaces in this file URI.  The macOS SQLite library used by
    # Python can report a spurious disk-I/O error for percent-encoded iCloud
    # paths (``Mobile%20Documents``), while its read-only URI mode works with
    # literal spaces.  Escape only characters that would change URI parsing.
    raw_path = path.resolve().as_posix()
    uri_path = raw_path.replace("%", "%25").replace("?", "%3F").replace("#", "%23")
    connection = sqlite3.connect(f"file:{uri_path}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


def _fetch_one_active_schedule(connection: sqlite3.Connection) -> sqlite3.Row:
    rows = connection.execute(
        """
        SELECT schedule_id, display_name, status, effective_start, effective_end,
               source_sha256, imported_at, activated_at
        FROM schedules
        WHERE status = 'active'
        ORDER BY schedule_id
        """
    ).fetchall()
    if len(rows) != 1:
        raise BridgeError(f"Expected exactly one active schedule; found {len(rows)}.")
    return rows[0]


def _json_list(value: str, field_name: str) -> list[int]:
    try:
        decoded = json.loads(value)
    except json.JSONDecodeError as error:
        raise BridgeError(f"Invalid JSON in calendar rule field {field_name!r}.") from error
    if not isinstance(decoded, list) or not all(isinstance(item, int) for item in decoded):
        raise BridgeError(f"Calendar rule field {field_name!r} must be a list of integers.")
    return sorted(decoded)


def _load_calendar_rule(connection: sqlite3.Connection, schedule_id: str) -> dict[str, Any]:
    row = connection.execute(
        """
        SELECT rule_id, schedule_id, timezone, week_start, week_end,
               month_week_anchor, odd_week_ordinals_json, even_week_ordinals_json,
               overflow_week_behavior
        FROM calendar_week_rules
        WHERE schedule_id = ? OR is_default = 1
        ORDER BY CASE WHEN schedule_id = ? THEN 0 ELSE 1 END, rule_id
        LIMIT 1
        """,
        (schedule_id, schedule_id),
    ).fetchone()
    if row is None:
        raise BridgeError(f"No calendar-week rule exists for active schedule {schedule_id!r}.")

    overflow_behavior = str(row["overflow_week_behavior"])
    return {
        "ruleId": row["rule_id"],
        "timezone": row["timezone"],
        "weekStart": row["week_start"],
        "weekEnd": row["week_end"],
        "monthWeekAnchor": row["month_week_anchor"],
        "oddWeekOrdinals": _json_list(row["odd_week_ordinals_json"], "odd_week_ordinals_json"),
        "evenWeekOrdinals": _json_list(row["even_week_ordinals_json"], "even_week_ordinals_json"),
        "overflowWeekBehavior": overflow_behavior,
        # This is intentionally explicit rather than inferred by the clients.
        "weekFiveOrLaterRequiresManualConfirmation": (
            overflow_behavior == "manual_confirmation_required"
        ),
    }


def _load_time_blocks(connection: sqlite3.Connection, schedule_id: str) -> list[dict[str, Any]]:
    """Group flattened ``booking_rows`` back into complete booking records."""

    rows = connection.execute(
        """
        SELECT booking_id, source_booking_id, day, week, "group" AS group_name,
               raw_label, equipment, start_min, end_min, source_class_name,
               canonical_event_label, activity_type, confidence, review_status
        FROM booking_rows
        WHERE schedule_id = ?
        ORDER BY booking_id, equipment
        """,
        (schedule_id,),
    ).fetchall()

    grouped: dict[str, dict[str, Any]] = {}
    expected_fields = {
        "sourceBookingId": "source_booking_id",
        "day": "day",
        "week": "week",
        "group": "group_name",
        "rawLabel": "raw_label",
        "startMinute": "start_min",
        "endMinute": "end_min",
        "sourceClassName": "source_class_name",
        "canonicalEventLabel": "canonical_event_label",
        "activityType": "activity_type",
        "confidence": "confidence",
        "reviewStatus": "review_status",
    }

    for row in rows:
        booking_id = row["booking_id"]
        if not booking_id:
            raise BridgeError("Encountered a booking_rows entry without a booking_id.")
        booking_id = str(booking_id)
        record = grouped.get(booking_id)
        if record is None:
            record = {"bookingId": booking_id, "equipment": []}
            for output_name, source_name in expected_fields.items():
                record[output_name] = row[source_name]
            grouped[booking_id] = record
        else:
            for output_name, source_name in expected_fields.items():
                if record[output_name] != row[source_name]:
                    raise BridgeError(
                        "Flattened booking rows disagree for booking "
                        f"{booking_id!r} on {output_name!r}."
                    )

        equipment = row["equipment"]
        if equipment:
            record["equipment"].append(str(equipment))

    time_blocks: list[dict[str, Any]] = []
    for booking_id in sorted(grouped):
        record = grouped[booking_id]
        record["equipment"] = sorted(set(record["equipment"]))
        time_blocks.append(record)
    return time_blocks


def _load_schedule_equipment(connection: sqlite3.Connection, schedule_id: str) -> list[dict[str, Any]]:
    rows = connection.execute(
        """
        SELECT equipment, display_order, is_single_unit
        FROM schedule_equipment
        WHERE schedule_id = ?
        ORDER BY display_order, equipment
        """,
        (schedule_id,),
    ).fetchall()
    return [
        {
            "name": row["equipment"],
            "displayOrder": row["display_order"],
            "isSingleUnit": bool(row["is_single_unit"]),
        }
        for row in rows
    ]


def _load_exceptions(connection: sqlite3.Connection, schedule_id: str) -> list[dict[str, Any]]:
    rows = connection.execute(
        """
        SELECT start_date, end_date, kind, notes
        FROM schedule_exceptions
        WHERE schedule_id = ?
        ORDER BY start_date, end_date, kind, exception_id
        """,
        (schedule_id,),
    ).fetchall()
    return [
        {
            "startDate": row["start_date"],
            "endDate": row["end_date"],
            "kind": row["kind"],
            "notes": row["notes"],
        }
        for row in rows
    ]


def _load_collision_summary(connection: sqlite3.Connection, schedule_id: str) -> dict[str, Any]:
    rows = connection.execute(
        """
        SELECT status
        FROM collision_reviews
        WHERE schedule_id = ?
        """,
        (schedule_id,),
    ).fetchall()
    statuses = Counter(str(row["status"] or "unknown") for row in rows)
    warning_count = sum(
        count for status, count in statuses.items() if status.lower() not in SAFE_COLLISION_STATUSES
    )
    return {
        "warningCount": warning_count,
        "statusCounts": {status: statuses[status] for status in sorted(statuses)},
    }


def _load_schedule_summary(database_path: Path) -> dict[str, Any]:
    with _open_read_only_sqlite(database_path) as connection:
        active_schedule = _fetch_one_active_schedule(connection)
        schedule_id = str(active_schedule["schedule_id"])
        calendar_rule = _load_calendar_rule(connection, schedule_id)
        revision = active_schedule["source_sha256"] or _sha256_file(database_path)

        return {
            "sourceId": f"schedule:{schedule_id}",
            "revision": revision,
            "scheduleId": schedule_id,
            "displayName": active_schedule["display_name"],
            "effectiveStart": active_schedule["effective_start"],
            "effectiveEnd": active_schedule["effective_end"],
            "timezone": calendar_rule["timezone"],
            "calendarWeekRule": calendar_rule,
            "timeBlocks": _load_time_blocks(connection, schedule_id),
            "equipment": _load_schedule_equipment(connection, schedule_id),
            "exceptions": _load_exceptions(connection, schedule_id),
            "collisionWarnings": _load_collision_summary(connection, schedule_id),
        }


def _require_list(value: Any, field_name: str) -> list[Any]:
    if not isinstance(value, list):
        raise BridgeError(f"Expected {field_name!r} to be a JSON list.")
    return value


def _string_list(value: Any, field_name: str) -> list[str]:
    items = _require_list(value, field_name)
    if not all(isinstance(item, str) for item in items):
        raise BridgeError(f"Expected every {field_name!r} entry to be a string.")
    return sorted(set(items))


def _load_drill_summary(drill_path: Path) -> dict[str, Any]:
    with drill_path.open(encoding="utf-8") as source:
        payload = json.load(source)
    if not isinstance(payload, Mapping):
        raise BridgeError("The drill library must be a JSON object.")

    drills = _require_list(payload.get("drills"), "drills")
    summaries: list[dict[str, Any]] = []
    status_counts: Counter[str] = Counter()
    type_counts: Counter[str] = Counter()
    event_counts: Counter[str] = Counter()
    variant_count = 0

    for drill in drills:
        if not isinstance(drill, Mapping):
            raise BridgeError("Every drill must be a JSON object.")
        drill_id = drill.get("id")
        name = drill.get("name")
        if not isinstance(drill_id, str) or not drill_id:
            raise BridgeError("Every drill needs a non-empty string id.")
        if not isinstance(name, str) or not name:
            raise BridgeError(f"Drill {drill_id!r} needs a non-empty string name.")

        source_status = drill.get("status", "unknown")
        source_type = drill.get("type", "unknown")
        if not isinstance(source_status, str) or not isinstance(source_type, str):
            raise BridgeError(f"Drill {drill_id!r} has an invalid status or type.")
        events = _string_list(drill.get("events", []), f"drill {drill_id} events")
        skills = _string_list(drill.get("skills", []), f"drill {drill_id} skills")
        tags = _string_list(drill.get("tags", []), f"drill {drill_id} tags")
        variants = _require_list(drill.get("variants", []), f"drill {drill_id} variants")

        if any(not isinstance(variant, Mapping) for variant in variants):
            raise BridgeError(f"Drill {drill_id!r} contains a non-object variant.")

        status_counts[source_status] += 1
        type_counts[source_type] += 1
        event_counts.update(events)
        variant_count += len(variants)
        summaries.append(
            {
                "id": drill_id,
                "title": name,
                "sourceStatus": source_status,
                "sourceType": source_type,
                "events": events,
                "skills": skills,
                "tags": tags,
                "variantCount": len(variants),
            }
        )

    summaries.sort(key=lambda item: item["id"])
    return {
        "sourceFile": drill_path.name,
        "sourceRevision": _sha256_file(drill_path),
        "sourceSchemaVersion": payload.get("schema_version"),
        "parentCount": len(summaries),
        "variantCount": variant_count,
        "statusCounts": {key: status_counts[key] for key in sorted(status_counts)},
        "typeCounts": {key: type_counts[key] for key in sorted(type_counts)},
        "eventCounts": {key: event_counts[key] for key in sorted(event_counts)},
        "items": summaries,
    }


def _load_weekly_ledger_summary(ledger_path: Path | None) -> dict[str, Any]:
    if ledger_path is None:
        return {
            "present": False,
            "recordCount": 0,
            "itemCount": 0,
            "statusCounts": {},
            "sourceIds": [],
        }

    with ledger_path.open(encoding="utf-8") as source:
        payload = json.load(source)
    if not isinstance(payload, Mapping):
        raise BridgeError("The weekly ledger must be a JSON object.")
    records = payload.get("records", {})
    if not isinstance(records, Mapping):
        raise BridgeError("The weekly ledger records field must be a JSON object.")

    statuses: Counter[str] = Counter()
    source_ids: list[str] = []
    item_count = 0
    revision_count = 0
    for record_key in sorted(records):
        record = records[record_key]
        if not isinstance(record, Mapping):
            raise BridgeError(f"Weekly ledger record {record_key!r} must be a JSON object.")
        source_id = record.get("source_id", record_key)
        if not isinstance(source_id, str):
            raise BridgeError(f"Weekly ledger record {record_key!r} has an invalid source id.")
        source_ids.append(source_id)
        items = _require_list(record.get("items", []), f"weekly ledger record {record_key} items")
        revisions = _require_list(
            record.get("revisions", []), f"weekly ledger record {record_key} revisions"
        )
        revision_count += len(revisions)
        for item in items:
            if not isinstance(item, Mapping):
                raise BridgeError(f"Weekly ledger record {record_key!r} has an invalid item.")
            status = item.get("status", "unknown")
            if not isinstance(status, str):
                raise BridgeError(f"Weekly ledger item in {record_key!r} has an invalid status.")
            statuses[status] += 1
            item_count += 1

    return {
        "present": True,
        "sourceFile": ledger_path.name,
        "sourceRevision": _sha256_file(ledger_path),
        "ledgerVersion": payload.get("version"),
        "recordCount": len(records),
        "itemCount": item_count,
        "revisionCount": revision_count,
        "statusCounts": {key: statuses[key] for key in sorted(statuses)},
        "sourceIds": sorted(source_ids),
    }


def build_summary(vault_root: Path) -> dict[str, Any]:
    """Read a vault and return a deterministic, sanitized bridge summary.

    This function performs no writes.  It intentionally does not discover or
    process roster files, videos, photos, or Freeform canvas binaries.
    """

    root = resolve_vault_root(vault_root)
    database_path = _discover_source(root, "schedule.db", required=True)
    drill_path = _discover_source(root, "drill_ideas.json", required=True)
    weekly_ledger_path = _discover_source(root, "weekly_notes_ledger.json", required=False)
    assert database_path is not None
    assert drill_path is not None

    return {
        "contractVersion": CONTRACT_VERSION,
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "rawWeeklyNoteTextIncluded": False,
            "absoluteSourcePathsIncluded": False,
        },
        "schedule": _load_schedule_summary(database_path),
        "drillLibrary": _load_drill_summary(drill_path),
        "weeklyLedger": _load_weekly_ledger_summary(weekly_ledger_path),
    }


def write_summary(vault_root: Path, output_path: Path, summary: Mapping[str, Any]) -> Path:
    """Write a deterministic JSON result outside the source vault."""

    root = resolve_vault_root(vault_root)
    output = _resolve_output(root, output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(summary, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_text(rendered, encoding="utf-8")
    temporary.replace(output)
    return output


def _parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a sanitized, read-only lesson-planner vault import summary."
    )
    parser.add_argument(
        "--vault-root",
        type=Path,
        required=True,
        help="Explicit path to the existing gymnastics vault (read-only source).",
    )
    parser.add_argument(
        "--out",
        type=Path,
        required=True,
        help="JSON output outside --vault-root; typically project fixtures/vault-summary.json.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    try:
        arguments = _parse_args(argv)
        root = resolve_vault_root(arguments.vault_root)
        summary = build_summary(root)
        output = write_summary(root, arguments.out, summary)
    except (BridgeError, OSError, sqlite3.Error, json.JSONDecodeError) as error:
        print(f"vault-importer: {error}", file=sys.stderr)
        return 2

    print(f"Wrote sanitized bridge summary: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
