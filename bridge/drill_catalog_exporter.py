#!/usr/bin/env python3
"""Export a read-only, media-free drill catalog for local lesson planning.

The full source library remains in the vault. This exporter intentionally
copies coaching text and safe provenance tokens, but not media bytes, roster
data, raw schedule data, absolute paths, or public URLs.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from vault_importer import BridgeError, _discover_source, _resolve_output, _sha256_file, resolve_vault_root


CONTRACT_VERSION = 1
MAX_METADATA_TEXT_LENGTH = 8_192

# The source file is allowed to contain rich coaching prose, so this is not a
# generic PII detector.  Instead, export is deliberately whitelist-based and
# these guards reject the categories that must never cross the bridge: URLs,
# local paths (including traversal), vault-root hints, control characters, and
# likely embedded file payloads.  Student records and media files are never
# read in the first place because only the drill ideas JSON is opened.
_URL_RE = re.compile(
    r"(?i)(?:\b[a-z][a-z0-9+.-]*://|\bwww\.|(?:^|[\s\"'`(])(?:data|file|mailto):)"
)
_WINDOWS_ABSOLUTE_PATH_RE = re.compile(r"(?i)(?:^|[\s\"'`(])(?:[a-z]:[\\/]|\\\\)")
_POSIX_ABSOLUTE_PATH_RE = re.compile(r"(?:^|[\s\"'`(])/(?:[^\s/]+(?:/|$))")
_HOME_PATH_RE = re.compile(r"(?:^|[\s\"'`(])~(?:[\\/]|$)")
_TRAVERSAL_PATH_RE = re.compile(r"(?:^|[\\/])\.\.(?:$|[\\/])")
_BASE64_BLOB_RE = re.compile(r"^[A-Za-z0-9+/]{512,}={0,2}$")
_CONTROL_CHARACTER_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_VAULT_ROOT_HINTS = ("mobile documents/com~apple~clouddocs", "gymnastics_vault-main")


def _string_list(value: Any, field_name: str) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise BridgeError(f"Expected {field_name!r} to be a list of strings.")
    return list(value)


def _unsafe_metadata_reason(value: str, vault_root: Path) -> str | None:
    """Return a privacy/safety reason when text cannot leave the vault."""

    if not value:
        return "empty"
    if len(value) > MAX_METADATA_TEXT_LENGTH:
        return "too long to be coaching metadata"
    if _CONTROL_CHARACTER_RE.search(value):
        return "contains a control character"
    if _URL_RE.search(value):
        return "contains a URL-like value"
    if (
        value.startswith(("/", "~"))
        or _WINDOWS_ABSOLUTE_PATH_RE.search(value)
        or _POSIX_ABSOLUTE_PATH_RE.search(value)
        or _HOME_PATH_RE.search(value)
    ):
        return "contains an absolute path"
    if _TRAVERSAL_PATH_RE.search(value):
        return "contains a traversal path"
    if _BASE64_BLOB_RE.fullmatch(value):
        return "looks like an embedded file payload"

    lowered = value.casefold()
    root_text = vault_root.as_posix().casefold()
    if root_text in lowered or any(marker in lowered for marker in _VAULT_ROOT_HINTS):
        return "contains a vault-location hint"
    return None


def _safe_required_string(value: Any, field_name: str, vault_root: Path) -> str:
    """Validate a required scalar that will be emitted to the catalog."""

    if not isinstance(value, str):
        raise BridgeError(f"Expected {field_name!r} to be a string.")
    normalized = value.strip()
    reason = _unsafe_metadata_reason(normalized, vault_root)
    if reason:
        raise BridgeError(f"Refusing unsafe {field_name!r}: {reason}.")
    return normalized


def _safe_string_list(value: Any, field_name: str, vault_root: Path) -> list[str]:
    """Keep only safe coaching metadata strings from an optional list."""

    refs = _string_list(value, field_name)
    safe_values: list[str] = []
    for ref in refs:
        normalized = ref.strip()
        if _unsafe_metadata_reason(normalized, vault_root):
            continue
        safe_values.append(normalized)
    return safe_values


def _safe_source_refs(value: Any, field_name: str, vault_root: Path) -> list[str]:
    """Keep safe opaque provenance tokens and reject path/URL leakage."""

    return _safe_string_list(value, field_name, vault_root)


def build_catalog(vault_root: Path) -> dict[str, Any]:
    """Return deterministic detailed library data without touching the vault."""

    root = resolve_vault_root(vault_root)
    drill_path = _discover_source(root, "drill_ideas.json", required=True)
    assert drill_path is not None
    with drill_path.open(encoding="utf-8") as source:
        payload = json.load(source)

    if not isinstance(payload, Mapping):
        raise BridgeError("The drill library must be a JSON object.")
    drills = payload.get("drills")
    if not isinstance(drills, list):
        raise BridgeError("The drill library must contain a drills list.")

    items: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for drill in drills:
        if not isinstance(drill, Mapping):
            raise BridgeError("Every drill must be a JSON object.")
        drill_id = _safe_required_string(drill.get("id"), "drill id", root)
        title = _safe_required_string(drill.get("name"), f"drill {drill_id} name", root)
        source_status = _safe_required_string(
            drill.get("status", "unknown"), f"drill {drill_id} status", root
        )
        source_type = _safe_required_string(
            drill.get("type", "unknown"), f"drill {drill_id} type", root
        )
        if drill_id in seen_ids:
            raise BridgeError(f"Duplicate drill id: {drill_id!r}.")
        seen_ids.add(drill_id)

        variants_value = drill.get("variants", [])
        if not isinstance(variants_value, list):
            raise BridgeError(f"Drill {drill_id!r} variants must be a list.")
        variants: list[dict[str, Any]] = []
        for index, variant in enumerate(variants_value):
            if not isinstance(variant, Mapping):
                raise BridgeError(f"Drill {drill_id!r} has a non-object variant.")
            variant_name = _safe_required_string(
                variant.get("name"), f"drill {drill_id} variant name", root
            )
            variants.append(
                {
                    "id": f"{drill_id}:variant:{index}",
                    "title": variant_name,
                    "instructions": _safe_string_list(
                        variant.get("instructions"), f"variant {variant_name} instructions", root
                    ),
                    "sourceRefs": _safe_source_refs(
                        variant.get("sources"), f"variant {variant_name} sources", root
                    ),
                }
            )

        items.append(
            {
                "id": drill_id,
                "title": title,
                "sourceStatus": source_status,
                "sourceType": source_type,
                "events": _safe_string_list(drill.get("events"), f"drill {drill_id} events", root),
                "skills": _safe_string_list(drill.get("skills"), f"drill {drill_id} skills", root),
                "goals": _safe_string_list(drill.get("goals"), f"drill {drill_id} goals", root),
                "instructions": _safe_string_list(
                    drill.get("instructions"), f"drill {drill_id} instructions", root
                ),
                "coachingCues": _safe_string_list(
                    drill.get("coaching_cues"), f"drill {drill_id} coaching_cues", root
                ),
                "tags": _safe_string_list(drill.get("tags"), f"drill {drill_id} tags", root),
                "sourceRefs": _safe_source_refs(drill.get("sources"), f"drill {drill_id} sources", root),
                "variants": variants,
            }
        )

    items.sort(key=lambda item: item["id"])
    source: dict[str, Any] = {
        "kind": "drill_ideas",
        "revision": _sha256_file(drill_path),
    }
    if "schema_version" in payload:
        source["sourceSchemaVersion"] = _safe_required_string(
            payload["schema_version"], "source schema_version", root
        )
    return {
        "schemaVersion": CONTRACT_VERSION,
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "absoluteSourcePathsIncluded": False,
            "publicUrlsIncluded": False,
            "urlsIncluded": False,
            "traversalPathsIncluded": False,
            "rawVaultLocationIncluded": False,
        },
        "source": source,
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
    parser.add_argument("--vault-root", required=True, type=Path, help="Read-only source vault root.")
    parser.add_argument("--out", required=True, type=Path, help="Catalog JSON destination outside the vault.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv or sys.argv[1:])
    try:
        catalog = build_catalog(arguments.vault_root)
        output = write_catalog(arguments.vault_root, arguments.out, catalog)
    except BridgeError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
