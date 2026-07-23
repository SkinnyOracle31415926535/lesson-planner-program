#!/usr/bin/env python3
"""Survey a legacy crop manifest without importing media or record metadata.

This is intentionally narrower than a media importer.  It discovers exactly
one ``cropped_versions/manifest.json`` beneath an explicitly supplied vault,
reads that JSON file only, and writes aggregate structural counts outside the
vault.  It never opens image/video files, Freeform boards, rosters, or any
other vault document.

The output has no per-record values: no captions, filenames, paths, URLs,
identifiers, or image/video record text.  Its purpose is simply to size and
design a future owner-controlled media migration.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from vault_importer import BridgeError, _is_within, _resolve_output, _sha256_file, resolve_vault_root


CONTRACT_VERSION = 1
MAX_STRUCTURAL_DEPTH = 32
_SAFE_REVISION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def _discover_crop_manifest(root: Path) -> Path:
    """Find exactly one crop manifest without opening any other vault file.

    The directory-name filter is intentional: a generic ``manifest.json`` in
    another tool or project is not source material for this survey.  Directory
    traversal reads names only; the selected JSON is the sole vault file that
    this module opens.
    """

    matches: list[Path] = []
    for candidate in root.rglob("manifest.json"):
        # Only this established crop-manifest location is in scope.  Do not
        # inspect the contents of other manifest files.
        if candidate.parent.name != "cropped_versions":
            continue
        resolved = candidate.resolve()
        if not _is_within(resolved, root):
            raise BridgeError("A crop-manifest symlink escapes the supplied vault.")
        if resolved.is_file():
            matches.append(resolved)

    matches.sort(key=lambda item: item.as_posix())
    if not matches:
        raise BridgeError("No crop manifest was found in a cropped_versions directory.")
    if len(matches) != 1:
        raise BridgeError("More than one crop manifest was found; choose a single source first.")
    return matches[0]


def _read_manifest(path: Path) -> Any:
    """Read JSON metadata from the already-selected crop manifest only."""

    try:
        with path.open(encoding="utf-8") as source:
            return json.load(source)
    except (OSError, json.JSONDecodeError) as error:
        # Do not put a source path or raw JSON excerpt in a public error.
        raise BridgeError("The selected crop manifest could not be read as JSON metadata.") from error


def _record_collection_candidates(payload: Any) -> list[tuple[int, int, list[Mapping[str, Any]]]]:
    """Return mapping-array candidates as ``(depth, position, records)``.

    We intentionally inspect only JSON shape and field *names* internally.
    Values are not copied, stringified, or emitted.  The largest mapping array
    is treated as the crop-record collection; smaller mapping arrays are
    reported only as an aggregate supplemental-collection count.
    """

    candidates: list[tuple[int, int, list[Mapping[str, Any]]]] = []
    position = 0

    def walk(value: Any, depth: int) -> None:
        nonlocal position
        if depth > MAX_STRUCTURAL_DEPTH:
            raise BridgeError("The crop manifest is too deeply nested to survey safely.")
        if isinstance(value, Mapping):
            for child in value.values():
                walk(child, depth + 1)
            return
        if isinstance(value, list):
            mapped_items = [item for item in value if isinstance(item, Mapping)]
            if value and len(mapped_items) == len(value):
                candidates.append((depth, position, mapped_items))
                position += 1
            for child in value:
                walk(child, depth + 1)

    walk(payload, 0)
    return candidates


def _choose_records(payload: Any) -> tuple[list[Mapping[str, Any]], str, int]:
    """Select the most likely record collection without retaining record text."""

    candidates = _record_collection_candidates(payload)
    if not candidates:
        return [], "no-mapping-record-collection", 0

    # Prefer the largest collection, then the shallowest source structure,
    # then first discovery order for deterministic ties.
    depth, _, records = min(candidates, key=lambda item: (-len(item[2]), item[0], item[1]))
    if isinstance(payload, list):
        shape = "array-record-collection"
    elif depth == 1:
        shape = "object-record-collection"
    else:
        shape = "nested-record-collection"
    return records, shape, max(0, len(candidates) - 1)


def _tokens(field_name: str) -> set[str]:
    """Normalize a metadata field name without exposing it in output."""

    camel_split = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", field_name)
    return {token.casefold() for token in re.split(r"[^A-Za-z0-9]+", camel_split) if token}


def _has_any(tokens: set[str], choices: set[str]) -> bool:
    return bool(tokens & choices)


def _capability_coverage(records: Sequence[Mapping[str, Any]]) -> dict[str, int]:
    """Count high-level metadata capabilities without serializing any values."""

    categories: dict[str, set[str]] = {
        "cropGeometry": {
            "crop", "geometry", "bounds", "bound", "bbox", "box", "rect", "rectangle",
            "coordinate", "coordinates", "rotation", "scale", "offset", "left", "right",
            "top", "bottom", "width", "height", "x", "y",
        },
        "mediaReferences": {
            "media", "image", "images", "video", "videos", "photo", "photos", "file",
            "filename", "path", "uri", "url", "asset", "original", "cropped", "thumbnail",
        },
        "textAnnotations": {
            "caption", "description", "note", "notes", "annotation", "text", "ocr", "title",
            "label", "alt", "comment",
        },
        "sourceProvenance": {
            "source", "provenance", "origin", "freeform", "board", "canvas", "imported", "parent",
        },
        "classificationLabels": {
            "event", "events", "skill", "skills", "tag", "tags", "level", "levels", "category",
            "categories", "group", "groups", "type",
        },
        "duplicateOrReviewState": {
            "duplicate", "duplicates", "dupe", "dedupe", "hash", "checksum", "review", "reviewed",
            "status", "active", "archived", "approved", "verified",
        },
    }
    coverage = {category: 0 for category in categories}
    for record in records:
        field_tokens = set().union(*(_tokens(str(field_name)) for field_name in record))
        for category, choices in categories.items():
            if _has_any(field_tokens, choices):
                coverage[category] += 1
    return coverage


def _format_revision(payload: Any) -> int | str | None:
    """Return only a safe scalar revision, never arbitrary source text."""

    if not isinstance(payload, Mapping):
        return None
    for candidate_key in ("schema_version", "schemaVersion", "manifest_version", "manifestVersion", "version"):
        value = payload.get(candidate_key)
        if isinstance(value, int) and not isinstance(value, bool):
            return value
        if isinstance(value, str) and _SAFE_REVISION_RE.fullmatch(value):
            return value
    return None


def build_survey(vault_root: Path) -> dict[str, Any]:
    """Build a deterministic, aggregate-only survey from one crop manifest."""

    root = resolve_vault_root(vault_root)
    manifest_path = _discover_crop_manifest(root)
    payload = _read_manifest(manifest_path)
    if not isinstance(payload, (Mapping, list)):
        raise BridgeError("The crop manifest must contain an object or array of metadata.")

    records, shape, supplemental_count = _choose_records(payload)
    coverage = _capability_coverage(records)
    field_counts = [len(record) for record in records]
    return {
        "schemaVersion": CONTRACT_VERSION,
        "privacy": {
            "mediaFilesRead": False,
            "mediaBytesIncluded": False,
            "mediaRecordTextIncluded": False,
            "filenamesIncluded": False,
            "filesystemPathsIncluded": False,
            "urlsIncluded": False,
            "identifiersIncluded": False,
            "studentRecordsIncluded": False,
            "unrelatedVaultDocumentsRead": False,
        },
        "source": {
            "kind": "crop-manifest",
            "revisionSha256": _sha256_file(manifest_path),
            "manifestFormatRevision": _format_revision(payload),
        },
        "survey": {
            "manifestShape": shape,
            "cropRecordCount": len(records),
            "supplementalObjectCollectionCount": supplemental_count,
            "recordFieldShape": {
                "minimumFieldCount": min(field_counts, default=0),
                "maximumFieldCount": max(field_counts, default=0),
                "uniformFieldShape": len(set(field_counts)) <= 1,
            },
            "capabilityCoverage": coverage,
        },
    }


def write_survey(vault_root: Path, output_path: Path, survey: Mapping[str, Any]) -> Path:
    """Write the aggregate survey outside the source vault."""

    root = resolve_vault_root(vault_root)
    output = _resolve_output(root, output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(survey, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return output


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault-root", required=True, type=Path, help="Explicit read-only source vault root.")
    parser.add_argument("--out", required=True, type=Path, help="Survey JSON destination outside the vault.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        survey = build_survey(arguments.vault_root)
        output = write_survey(arguments.vault_root, arguments.out, survey)
    except BridgeError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
