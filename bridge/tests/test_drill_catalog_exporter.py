from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from drill_catalog_exporter import build_catalog, write_catalog  # noqa: E402
from vault_importer import BridgeError  # noqa: E402


class DrillCatalogExporterTests(unittest.TestCase):
    def _make_vault(self, root: Path) -> None:
        source_path = root / "legacy" / "drill_ideas.json"
        source_path.parent.mkdir(parents=True)
        source_path.write_text(
            json.dumps(
                {
                    "schema_version": "1.1",
                    "drills": [
                        {
                            "id": "bars-shapes",
                            "name": "Bars Shapes",
                            "status": "tested",
                            "type": "progression",
                            "events": ["high_bar", "../unsafe-event"],
                            "skills": ["cast"],
                            "goals": ["shape"],
                            "instructions": [
                                "Hold shape",
                                "See https://unsafe.example/demo",
                                f"Read {root / 'private' / 'notes'}",
                                "../unsafe-instruction",
                                "A" * 512,
                            ],
                            "coaching_cues": ["Push tall", "Use data:video/mp4;base64,AAAA"],
                            "tags": ["bars"],
                            "sources": [
                                "crop_manifest: high_bar/bars_shapes",
                                "/unsafe/source",
                                "../../unsafe/source",
                                "C:\\unsafe\\source",
                                "file:///unsafe/source",
                            ],
                            "student_records": [{"name": "Student A", "attendance": True}],
                            "media_bytes": "data:image/png;base64,AAAA",
                            "variants": [
                                {
                                    "name": "Tuck",
                                    "instructions": ["Tuck hold", "mailTo:unsafe@example.test"],
                                    "sources": [
                                        "crop_manifest: high_bar/tuck",
                                        "https://unsafe.example",
                                        "nested/../../unsafe",
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )

    def test_catalog_is_detailed_deterministic_and_path_safe(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            self._make_vault(vault)

            catalog = build_catalog(vault)
            self.assertEqual(catalog, build_catalog(vault))
            self.assertEqual(catalog["privacy"]["mediaBytesIncluded"], False)
            self.assertEqual(catalog["privacy"]["urlsIncluded"], False)
            self.assertEqual(catalog["privacy"]["traversalPathsIncluded"], False)
            self.assertEqual(catalog["privacy"]["rawVaultLocationIncluded"], False)
            drill = catalog["items"][0]
            self.assertEqual(drill["events"], ["high_bar"])
            self.assertEqual(drill["instructions"], ["Hold shape"])
            self.assertEqual(drill["coachingCues"], ["Push tall"])
            self.assertEqual(drill["sourceRefs"], ["crop_manifest: high_bar/bars_shapes"])
            self.assertEqual(drill["variants"][0]["sourceRefs"], ["crop_manifest: high_bar/tuck"])
            self.assertEqual(drill["variants"][0]["instructions"], ["Tuck hold"])

            serialized = json.dumps(catalog)
            for forbidden in (
                "https://",
                "mailTo:",
                "data:",
                "../",
                "C:\\unsafe",
                str(vault),
                "Student A",
            ):
                self.assertNotIn(forbidden, serialized)

            output = write_catalog(vault, temporary / "catalog.json", catalog)
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), catalog)
            with self.assertRaises(BridgeError):
                write_catalog(vault, vault / "unsafe.json", catalog)

    def test_unsafe_required_metadata_blocks_export(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            self._make_vault(vault)

            source_path = vault / "legacy" / "drill_ideas.json"
            payload = json.loads(source_path.read_text(encoding="utf-8"))
            payload["drills"][0]["name"] = "https://unsafe.example/title"
            source_path.write_text(json.dumps(payload), encoding="utf-8")

            with self.assertRaises(BridgeError):
                build_catalog(vault)


if __name__ == "__main__":
    unittest.main()
