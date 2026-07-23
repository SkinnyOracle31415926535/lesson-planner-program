#!/usr/bin/env python3
"""Build the browser-local lesson-idea library from read-only vault sources.

This intentionally keeps the lesson planner on the safe side of the vault
boundary.  It reads only curated drill data, Freeform crop transcriptions, and
plain-text material inside a lesson document's PLAN section.  It never copies
rosters, attendance, schedules, raw Freeform images, automation records, URLs,
or vault paths into the browser fixture.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any

from drill_catalog_exporter import (
    _safe_string_list,
    _unsafe_metadata_reason,
    build_catalog,
)
from vault_importer import BridgeError, _resolve_output, resolve_vault_root


CONTRACT_VERSION = 1
PLAN_STOP_WORDS = {
    "reminders", "todos", "todo", "reflection", "attendance", "openings",
    "collisions", "messages to ai assistant", "announcements", "goals",
}
TEXT_PLAN_PREFIX = "lesson plan: "
APPARATUS_PREFIXES = {
    "floor", "fx", "f1", "f2", "f3", "f4", "f5", "f6", "rings", "sr",
    "pommel", "ph", "high bar", "hb", "parallel bars", "pb", "vault", "ts",
    "tumble strip", "tumble track", "warm up", "conditioning", "activity",
}


def _slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).casefold()
    normalized = "".join(character for character in normalized if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")


def _title(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("_", " ")).strip().title()


def _safe_token(value: str, root: Path) -> str | None:
    value = value.strip()
    return value if value and not _unsafe_metadata_reason(value, root) else None


def _find_crop_root(root: Path) -> Path | None:
    matches = sorted(path.resolve() for path in root.rglob("cropped_versions") if path.is_dir())
    if not matches:
        return None
    if len(matches) > 1:
        raise BridgeError("Expected one Freeform cropped_versions folder in the vault.")
    return matches[0]


def _source_group_refs(item: Mapping[str, Any]) -> set[str]:
    refs = list(item.get("sourceRefs", []))
    for variant in item.get("variants", []):
        if isinstance(variant, Mapping):
            refs.extend(variant.get("sourceRefs", []))
    return {ref for ref in refs if isinstance(ref, str) and ref.startswith("crop_manifest: ")}


def _ocr_instructions(path: Path, root: Path) -> list[str]:
    """Return only the OCR draft's coaching bullets, never source metadata."""

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []
    marker = "## OCR draft"
    if marker not in text:
        return []
    draft = text.split(marker, 1)[1]
    lines: list[str] = []
    pending: list[str] = []
    for raw in draft.splitlines():
        line = raw.strip().lstrip("-•").strip()
        if not line:
            if pending:
                lines.append(" ".join(pending))
                pending = []
            continue
        if line.startswith("#"):
            continue
        pending.append(line)
    if pending:
        lines.append(" ".join(pending))
    return _safe_string_list(lines, f"OCR draft {path.name}", root)


def _plan_section_lines(path: Path, root: Path) -> Iterable[str]:
    """Yield safe handwritten PLAN bullets from a regular lesson document."""

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []
    active = False
    output: list[str] = []
    for raw in text.splitlines():
        normalized = unicodedata.normalize("NFKD", raw).casefold()
        letters = re.sub(r"[^a-z]+", " ", normalized).strip()
        if letters.startswith("plan"):
            active = True
            continue
        if active and any(letters.startswith(stop) for stop in PLAN_STOP_WORDS):
            break
        if not active:
            continue
        line = raw.strip()
        # Plain station/person headings are context for a plan, not reusable
        # ideas.  Author-entered activity content in these plans is expressed
        # as a bullet or Freeform quote.
        if not line.startswith(("-", "*", "•", ">")):
            continue
        if not line or "![[" in line or line.startswith("![") or "http" in line.casefold():
            continue
        line = re.sub(r"^[-*•]\s*", "", line).strip()
        line = line.lstrip(">").strip()
        # A bare apparatus heading (for example, `F2`) is structure rather
        # than an idea. A short real bullet such as `Shape race` must remain
        # available in the archive, so never filter by length alone.
        if _slug(line).replace("-", " ") in APPARATUS_PREFIXES:
            continue
        # A student-specific assignment is not an idea-library record.  Keep
        # apparatus headings, but reject generic Name: drill forms outright.
        if ":" in line:
            prefix = _slug(line.split(":", 1)[0]).replace("-", " ")
            if prefix not in APPARATUS_PREFIXES:
                continue
        if len(line) < 4:
            continue
        safe = _safe_token(line, root)
        if safe:
            output.append(safe)
    return output


def _lesson_document_paths(root: Path) -> list[Path]:
    """Find only authored lesson documents, excluding operational/private trees."""

    paths: list[Path] = []
    dated_lesson_name = re.compile(r"(?:^|_)lesson_\d{2}-\d{2}-\d{4}(?:_v\d+)?\.md$", re.I)
    for path in root.rglob("*.md"):
        parts = {_slug(part) for part in path.relative_to(root).parts}
        if {"rosters", "reflections", "automation", "cropped-versions", "duplicates-removed"} & parts:
            continue
        if not dated_lesson_name.search(path.name):
            continue
        paths.append(path)
    return sorted(paths)


def _append_variant(item: dict[str, Any], variant: dict[str, Any]) -> None:
    existing = {(entry["title"], tuple(entry.get("instructions", []))) for entry in item["variants"]}
    key = (variant["title"], tuple(variant.get("instructions", [])))
    if key not in existing:
        item["variants"].append(variant)


def build_library_catalog(vault_root: Path) -> dict[str, Any]:
    """Return a deterministic, source-auditable browser library fixture."""

    root = resolve_vault_root(vault_root)
    canonical = build_catalog(root)
    items = [json.loads(json.dumps(item)) for item in canonical["items"]]
    item_by_id = {item["id"]: item for item in items}
    parent_by_crop_ref: dict[str, dict[str, Any]] = {}
    for item in items:
        for ref in _source_group_refs(item):
            parent_by_crop_ref.setdefault(ref, item)

    represented_groups: list[str] = []
    imported_groups: list[str] = []
    crop_variant_count = 0
    crop_root = _find_crop_root(root)
    if crop_root:
        for event_path in sorted(path for path in crop_root.iterdir() if path.is_dir()):
            if event_path.name.startswith("_"):
                continue
            for focus_path in sorted(path for path in event_path.iterdir() if path.is_dir()):
                event = event_path.name.strip()
                focus = focus_path.name.strip()
                if not event or not focus:
                    continue
                source_ref = f"crop_manifest: {event}/{focus}"
                represented_groups.append(f"{event}/{focus}")
                parent = parent_by_crop_ref.get(source_ref)
                if parent is None:
                    parent_id = f"freeform-{_slug(event)}-{_slug(focus)}"
                    parent = {
                        "id": parent_id,
                        "title": _title(focus),
                        "sourceStatus": "imported",
                        "sourceType": "freeform_drill",
                        "events": [event],
                        "skills": [part for part in re.split(r"[_-]", focus) if part],
                        "goals": [],
                        "instructions": [],
                        "coachingCues": [],
                        "tags": sorted({event, *re.split(r"[_-]", focus)}),
                        "sourceRefs": [source_ref],
                        "variants": [],
                    }
                    items.append(parent)
                    item_by_id[parent_id] = parent
                    parent_by_crop_ref[source_ref] = parent
                    imported_groups.append(f"{event}/{focus}")

                for transcript in sorted(focus_path.glob("*.md")):
                    instructions = _ocr_instructions(transcript, root)
                    safe_name = _safe_token(transcript.stem, root)
                    if not safe_name:
                        continue
                    variant = {
                        "id": f"{parent['id']}:crop:{_slug(transcript.stem)}",
                        "title": f"{_title(focus)} · {_title(transcript.stem)}",
                        "instructions": instructions,
                        "sourceRefs": [source_ref, f"crop_note: {event}/{focus}/{safe_name}"],
                    }
                    _append_variant(parent, variant)
                    crop_variant_count += 1

    plan_lines: dict[str, dict[str, Any]] = {}
    for document in _lesson_document_paths(root):
        relative = document.relative_to(root).as_posix()
        safe_relative = _safe_token(relative, root)
        if not safe_relative:
            continue
        for line in _plan_section_lines(document, root):
            key = _slug(line)
            if not key:
                continue
            entry = plan_lines.setdefault(key, {"title": line, "sourceRefs": []})
            entry["sourceRefs"].append(f"{TEXT_PLAN_PREFIX}{safe_relative}")

    for key, entry in sorted(plan_lines.items()):
        item_id = f"lesson-plan-{key[:72]}"
        if item_id in item_by_id:
            continue
        items.append({
            "id": item_id,
            "title": entry["title"][:100],
            "sourceStatus": "imported",
            "sourceType": "lesson_plan_activity",
            "events": [],
            "skills": [],
            "goals": [],
            "instructions": [entry["title"]],
            "coachingCues": [],
            "tags": ["lesson-plan", "activity"],
            # Lesson-plan snippets are retained for recall, but the curated
            # catalog and Freeform groups remain the focused planning shelf.
            "defaultArchived": True,
            "sourceRefs": sorted(set(entry["sourceRefs"])),
            "variants": [],
        })

    for item in items:
        item["variants"].sort(key=lambda entry: entry["id"])
        item["sourceRefs"] = sorted(set(item["sourceRefs"]))
    items.sort(key=lambda item: item["title"].casefold())
    return {
        "schemaVersion": CONTRACT_VERSION,
        "privacy": canonical["privacy"],
        "source": {
            "kind": "lesson_idea_catalog",
            "canonicalRevision": canonical["source"]["revision"],
            "canonicalIdeaCount": len(canonical["items"]),
        },
        "audit": {
            "eligibleFreeformGroupCount": len(represented_groups),
            "representedFreeformGroups": represented_groups,
            "importedFreeformGroups": imported_groups,
            "freeformCropVariantCount": crop_variant_count,
            "lessonPlanTextIdeaCount": len(plan_lines),
        },
        "items": items,
    }


def write_catalog(vault_root: Path, output_path: Path, catalog: Mapping[str, Any]) -> Path:
    root = resolve_vault_root(vault_root)
    output = _resolve_output(root, output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(catalog, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return output


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault-root", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        output = write_catalog(arguments.vault_root, arguments.out, build_library_catalog(arguments.vault_root))
    except BridgeError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
