#!/usr/bin/env python3
"""Propose logical gym-zone boards from the sanitized schedule summary.

This is an intentionally conservative, read-only bridge step.  It reads only
the already-sanitized ``vault-summary.json`` inside the Lesson Planner project;
it never opens the legacy vault, student records, or media.  Its output is a
*review fixture*, never live configuration:

* every candidate is marked ``owner_confirmation_required``;
* a multi-equipment booking is not assumed to be one contiguous physical area;
* blocks with equipment absent from the schedule inventory are retained only as
  unresolved evidence, never partially converted into a zone; and
* output and input paths must both remain inside the Lesson Planner project.

The owner must explicitly confirm, edit, split, merge, or reject these
candidates before a future app treats them as its zone-board configuration.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any


SCHEMA_VERSION = 1

# These are the three intentional combined-area *schedule vocabulary* patterns
# already identified in the source.  They are not a claim about physical
# contiguity: the owner still decides whether each becomes one board or several
# panels.  Every other multi-equipment set is a parallel-area bundle candidate.
KNOWN_COMBINED_AREAS: dict[frozenset[str], tuple[str, str]] = {
    frozenset({"PB", "HB"}): ("pb-hb", "PB / HB"),
    frozenset({"SR", "PH"}): ("sr-ph", "SR / PH"),
    frozenset({"TR", "TT"}): ("tr-tt", "TR / TT"),
}


class ZoneCandidateError(RuntimeError):
    """Raised when an input is outside the safe project boundary or malformed."""


def _is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def resolve_project_root(project_root: Path) -> Path:
    """Resolve and validate the explicit Lesson Planner project root."""

    root = project_root.expanduser().resolve()
    if not root.is_dir():
        raise ZoneCandidateError(f"Project root is not a directory: {root}")
    return root


def _resolve_project_file(project_root: Path, path: Path, *, label: str) -> Path:
    resolved = path.expanduser().resolve()
    if not _is_within(resolved, project_root):
        raise ZoneCandidateError(f"{label} must stay inside the LESSON PLANNER PROGRAM project root.")
    return resolved


def _required_mapping(value: Any, field_name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ZoneCandidateError(f"Expected {field_name!r} to be an object.")
    return value


def _required_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ZoneCandidateError(f"Expected {field_name!r} to be a non-empty string.")
    return value.strip()


def _contains_path_like_value(value: str) -> bool:
    """Catch path-like values without rejecting a valid label such as ``PB/HB``."""

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
    text = _required_string(value, field_name)
    if _contains_path_like_value(text):
        raise ZoneCandidateError(f"Refusing path-like value in safe field {field_name!r}.")
    return text


def _safe_string_list(value: Any, field_name: str) -> list[str]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        raise ZoneCandidateError(f"Expected {field_name!r} to be a list of strings.")
    return [_safe_string(item, f"{field_name} item") for item in value]


def _load_summary(project_root: Path, summary_path: Path) -> Mapping[str, Any]:
    """Read a sanitized summary from the project, never from the legacy vault."""

    resolved = _resolve_project_file(project_root, summary_path, label="Summary input")
    if not resolved.is_file():
        raise ZoneCandidateError(f"Summary input is not a file: {resolved}")
    try:
        payload = json.loads(resolved.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ZoneCandidateError("Summary input is not valid JSON.") from error
    return _required_mapping(payload, "summary")


def _validate_sanitized_privacy(summary: Mapping[str, Any]) -> None:
    """Require the source to assert the importer's core privacy guarantees."""

    privacy = _required_mapping(summary.get("privacy"), "privacy")
    required_false_markers = (
        "studentRecordsIncluded",
        "mediaBytesIncluded",
        "rawWeeklyNoteTextIncluded",
        "absoluteSourcePathsIncluded",
    )
    for marker in required_false_markers:
        if privacy.get(marker) is not False:
            raise ZoneCandidateError(
                "Zone mapping only accepts a sanitized vault summary with "
                f"privacy.{marker} set to false."
            )


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not slug:
        raise ZoneCandidateError("Could not make a stable candidate identifier from equipment.")
    return slug


def _load_equipment_inventory(schedule: Mapping[str, Any]) -> tuple[list[str], dict[str, int]]:
    raw_inventory = schedule.get("equipment")
    if not isinstance(raw_inventory, list) or not raw_inventory:
        raise ZoneCandidateError("schedule.equipment must be a non-empty list.")

    inventory: list[tuple[str, int]] = []
    seen_names: set[str] = set()
    seen_orders: set[int] = set()
    for index, raw_item in enumerate(raw_inventory):
        item = _required_mapping(raw_item, f"schedule.equipment[{index}]")
        name = _safe_string(item.get("name"), f"schedule.equipment[{index}].name")
        display_order = item.get("displayOrder")
        if not isinstance(display_order, int):
            raise ZoneCandidateError(
                f"schedule.equipment[{index}].displayOrder must be an integer."
            )
        if name in seen_names or display_order in seen_orders:
            raise ZoneCandidateError("Schedule equipment names and display orders must each be unique.")
        seen_names.add(name)
        seen_orders.add(display_order)
        inventory.append((name, display_order))

    inventory.sort(key=lambda entry: (entry[1], entry[0]))
    return [name for name, _ in inventory], {name: order for name, order in inventory}


def _normalized_signature(equipment: Sequence[str], display_order: Mapping[str, int]) -> tuple[str, ...]:
    return tuple(sorted(set(equipment), key=lambda name: (display_order[name], name)))


def _label_mentions_all_equipment(label: str, equipment: Sequence[str]) -> bool:
    """Return whether the canonical (not raw) label mentions every member."""

    upper_label = label.upper()
    for name in equipment:
        escaped = re.escape(name.upper())
        if not re.search(rf"(?<![A-Z0-9]){escaped}(?![A-Z0-9])", upper_label):
            return False
    return True


def _counter_dict(values: Sequence[str]) -> dict[str, int]:
    counts = Counter(values)
    return {key: counts[key] for key in sorted(counts)}


def _candidate_shape(signature: tuple[str, ...]) -> tuple[str, str, str, bool]:
    known = KNOWN_COMBINED_AREAS.get(frozenset(signature))
    if len(signature) == 1:
        logical_zone_id = _slugify(signature[0])
        return logical_zone_id, signature[0], "single_area", False
    if known is not None:
        logical_zone_id, display_name = known
        return logical_zone_id, display_name, "combined_area", True

    logical_zone_id = "-".join(_slugify(name) for name in signature)
    display_name = " + ".join(signature)
    return logical_zone_id, display_name, "parallel_area_bundle", True


def _candidate_confidence(
    *,
    source_confidence_counts: Mapping[str, int],
    source_review_status_counts: Mapping[str, int],
    label_mentions_all_equipment_count: int,
    total_booking_count: int,
    suggested_board_kind: str,
) -> str:
    """Describe inference confidence without ever auto-approving a candidate."""

    has_low_confidence = source_confidence_counts.get("low", 0) > 0
    has_review_needed = any("needs_review" in value.lower() for value in source_review_status_counts)
    if has_low_confidence:
        return "low"
    if has_review_needed or suggested_board_kind == "parallel_area_bundle":
        return "medium"
    if (
        source_confidence_counts.get("high", 0) == total_booking_count
        and label_mentions_all_equipment_count == total_booking_count
    ):
        return "high"
    return "medium"


def _candidate_reason_codes(
    *,
    suggested_board_kind: str,
    source_confidence_counts: Mapping[str, int],
    source_review_status_counts: Mapping[str, int],
    label_mentions_all_equipment_count: int,
) -> list[str]:
    reasons = ["equipment_exactly_matches_schedule_inventory"]
    if suggested_board_kind == "combined_area":
        reasons.append("known_combined_area_signature")
        reasons.append("combined_schedule_label_requires_layout_confirmation")
    elif suggested_board_kind == "parallel_area_bundle":
        reasons.append("multi_area_bundle_does_not_assume_contiguous_layout")
    if label_mentions_all_equipment_count:
        reasons.append("canonical_label_mentions_all_member_equipment")
    if source_confidence_counts.get("low", 0):
        reasons.append("source_contains_low_confidence_evidence")
    if any("needs_review" in value.lower() for value in source_review_status_counts):
        reasons.append("source_contains_review_needed_evidence")
    reasons.append("owner_confirmation_required")
    return reasons


def build_zone_mapping_candidates(summary: Mapping[str, Any]) -> dict[str, Any]:
    """Build deterministic, owner-review-only candidates from a safe summary.

    A block only becomes candidate evidence when *all* of its equipment tokens
    occur in the schedule's controlled equipment inventory.  This deliberately
    avoids turning a malformed partial parse (for example ``["PB", "HB", "C"]``)
    into a misleading PB/HB configuration suggestion.
    """

    _validate_sanitized_privacy(summary)
    schedule = _required_mapping(summary.get("schedule"), "schedule")
    source_id = _safe_string(schedule.get("sourceId"), "schedule.sourceId")
    schedule_id = _safe_string(schedule.get("scheduleId"), "schedule.scheduleId")
    revision = _safe_string(schedule.get("revision"), "schedule.revision")
    inventory, display_order = _load_equipment_inventory(schedule)
    known_equipment = set(inventory)

    raw_blocks = schedule.get("timeBlocks")
    if not isinstance(raw_blocks, list) or not all(isinstance(block, Mapping) for block in raw_blocks):
        raise ZoneCandidateError("schedule.timeBlocks must be a list of objects.")

    grouped: dict[tuple[str, ...], list[dict[str, str]]] = defaultdict(list)
    empty_equipment_block_count = 0
    unrecognized_equipment_block_count = 0
    unrecognized_tokens: Counter[str] = Counter()

    for index, raw_block in enumerate(raw_blocks):
        block = _required_mapping(raw_block, f"schedule.timeBlocks[{index}]")
        # Canonical labels are allowed to use a slash as an equipment separator
        # (PB/HB), but raw source labels are never read or emitted.
        label = _safe_string(block.get("canonicalEventLabel"), f"timeBlocks[{index}].canonicalEventLabel")
        equipment = _safe_string_list(block.get("equipment"), f"timeBlocks[{index}].equipment")
        activity_type = _safe_string(block.get("activityType"), f"timeBlocks[{index}].activityType")
        confidence = _safe_string(block.get("confidence", "unknown"), f"timeBlocks[{index}].confidence")
        review_status = _safe_string(
            block.get("reviewStatus", "unknown"), f"timeBlocks[{index}].reviewStatus"
        )

        if not equipment:
            empty_equipment_block_count += 1
            continue
        unknown = sorted(set(equipment) - known_equipment)
        if unknown:
            unrecognized_equipment_block_count += 1
            unrecognized_tokens.update(unknown)
            continue

        signature = _normalized_signature(equipment, display_order)
        grouped[signature].append(
            {
                "label": label,
                "activityType": activity_type,
                "confidence": confidence,
                "reviewStatus": review_status,
            }
        )

    candidates: list[dict[str, Any]] = []
    candidate_ids: set[str] = set()
    recognized_block_count = 0
    for signature in sorted(
        grouped,
        key=lambda items: (
            len(items),
            tuple((display_order[name], name) for name in items),
        ),
    ):
        evidence = grouped[signature]
        recognized_block_count += len(evidence)
        logical_zone_id, display_name, suggested_board_kind, may_be_disconnected = _candidate_shape(signature)
        candidate_id = f"zone-{logical_zone_id}"
        if candidate_id in candidate_ids:
            raise ZoneCandidateError(f"Equipment inference created duplicate candidate id: {candidate_id}")
        candidate_ids.add(candidate_id)

        canonical_labels = sorted({item["label"] for item in evidence})
        label_mentions_count = sum(
            _label_mentions_all_equipment(item["label"], signature) for item in evidence
        )
        source_confidence_counts = _counter_dict([item["confidence"] for item in evidence])
        source_review_status_counts = _counter_dict([item["reviewStatus"] for item in evidence])
        activity_type_counts = _counter_dict([item["activityType"] for item in evidence])
        confidence = _candidate_confidence(
            source_confidence_counts=source_confidence_counts,
            source_review_status_counts=source_review_status_counts,
            label_mentions_all_equipment_count=label_mentions_count,
            total_booking_count=len(evidence),
            suggested_board_kind=suggested_board_kind,
        )
        reasons = _candidate_reason_codes(
            suggested_board_kind=suggested_board_kind,
            source_confidence_counts=source_confidence_counts,
            source_review_status_counts=source_review_status_counts,
            label_mentions_all_equipment_count=label_mentions_count,
        )
        candidates.append(
            {
                "candidateId": candidate_id,
                "logicalZoneId": logical_zone_id,
                "displayName": display_name,
                "suggestedBoardKind": suggested_board_kind,
                "mayRepresentDisconnectedAreas": may_be_disconnected,
                "equipment": list(signature),
                "confidence": confidence,
                "reasonCodes": reasons,
                "ownerReview": {
                    "status": "owner_confirmation_required",
                    "confirmed": False,
                    "configurationEligible": False,
                },
                "sourceEvidence": {
                    "bookingCount": len(evidence),
                    "canonicalLabels": canonical_labels,
                    "labelMentionsAllEquipmentCount": label_mentions_count,
                    "activityTypeCounts": activity_type_counts,
                    "sourceConfidenceCounts": source_confidence_counts,
                    "sourceReviewStatusCounts": source_review_status_counts,
                },
            }
        )

    unknown_token_rows = [
        {"token": token, "blockCount": unrecognized_tokens[token]}
        for token in sorted(unrecognized_tokens, key=lambda token: (-unrecognized_tokens[token], token))
    ]
    return {
        "schemaVersion": SCHEMA_VERSION,
        "status": "owner_confirmation_required",
        "ownerConfirmation": {
            "required": True,
            "confirmed": False,
            "configurationEligible": False,
            "message": (
                "Review every candidate before using it as zone-board configuration. "
                "Confirm, edit, split, merge, or reject it; this generator never approves one."
            ),
        },
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "rawScheduleLabelsIncluded": False,
            "rawVaultPathsIncluded": False,
        },
        "source": {
            "sourceId": source_id,
            "scheduleId": schedule_id,
            "revision": revision,
        },
        "summary": {
            "sourceTimeBlockCount": len(raw_blocks),
            "recognizedInventoryBlockCount": recognized_block_count,
            "candidateCount": len(candidates),
        },
        "candidates": candidates,
        "unresolvedEvidence": {
            "emptyEquipmentBlockCount": empty_equipment_block_count,
            "unrecognizedEquipmentBlockCount": unrecognized_equipment_block_count,
            "unrecognizedEquipmentTokenCounts": unknown_token_rows,
        },
    }


def write_zone_mapping_candidates(
    project_root: Path, output_path: Path, payload: Mapping[str, Any]
) -> Path:
    """Write a deterministic review fixture only inside the project root."""

    output = _resolve_project_file(project_root, output_path, label="Output")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return output


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", required=True, type=Path, help="LESSON PLANNER PROGRAM root.")
    parser.add_argument(
        "--summary",
        required=True,
        type=Path,
        help="Sanitized vault-summary JSON inside the project root.",
    )
    parser.add_argument(
        "--out",
        required=True,
        type=Path,
        help="Owner-review candidate JSON to write inside the project root.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        project_root = resolve_project_root(arguments.project_root)
        summary = _load_summary(project_root, arguments.summary)
        payload = build_zone_mapping_candidates(summary)
        output = write_zone_mapping_candidates(project_root, arguments.out, payload)
    except ZoneCandidateError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
