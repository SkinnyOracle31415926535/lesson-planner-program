from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from media_crop_manifest_survey import build_survey, write_survey  # noqa: E402
from vault_importer import BridgeError  # noqa: E402


def _tree_snapshot(root: Path) -> dict[str, str]:
    return {
        str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(root.rglob("*"))
        if path.is_file()
    }


class MediaCropManifestSurveyTests(unittest.TestCase):
    def _write_crop_manifest(self, vault: Path) -> Path:
        manifest = vault / "ACTIVE" / "Freeform pics" / "cropped_versions" / "manifest.json"
        manifest.parent.mkdir(parents=True)
        manifest.write_text(
            json.dumps(
                {
                    "version": 3,
                    "crops": [
                        {
                            "asset_id": "child-identifying-opaque-id",
                            "source_path": "/private/child-perfect-demo.mov",
                            "output_filename": "perfect-demo-for-student.jpg",
                            "caption": "Identifiable child text must never leave the manifest.",
                            "crop_bounds": [1, 2, 3, 4],
                            "event_tags": ["bars"],
                            "source_provenance": "legacy-freeform-board",
                            "duplicate_status": "possible-duplicate",
                        },
                        {
                            "asset_id": "another-private-id",
                            "source_path": "file:///private/other.mov",
                            "output_filename": "another-private-file.jpg",
                            "caption": "Another private caption.",
                            "crop_bounds": [4, 3, 2, 1],
                            "event_tags": ["floor"],
                            "source_provenance": "legacy-freeform-board",
                            "duplicate_status": "reviewed",
                        },
                    ],
                    "provenance": [{"source": "private"}],
                }
            ),
            encoding="utf-8",
        )
        return manifest

    def test_survey_is_aggregate_only_deterministic_and_does_not_change_vault(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            self._write_crop_manifest(vault)

            # An invalid unrelated manifest proves the survey never opens a
            # generic manifest outside cropped_versions.
            unrelated = vault / "unrelated" / "manifest.json"
            unrelated.parent.mkdir(parents=True)
            unrelated.write_text("this is not JSON", encoding="utf-8")
            (vault / "rosters.json").write_text('{"student": "do not read"}', encoding="utf-8")
            (vault / "private-video.mov").write_bytes(b"not opened")
            before = _tree_snapshot(vault)

            survey = build_survey(vault)
            self.assertEqual(survey, build_survey(vault))
            self.assertEqual(before, _tree_snapshot(vault))
            self.assertEqual(survey["source"]["kind"], "crop-manifest")
            self.assertEqual(survey["survey"]["cropRecordCount"], 2)
            self.assertEqual(survey["survey"]["supplementalObjectCollectionCount"], 1)
            self.assertEqual(survey["survey"]["capabilityCoverage"]["cropGeometry"], 2)
            self.assertEqual(survey["survey"]["capabilityCoverage"]["mediaReferences"], 2)
            self.assertEqual(survey["survey"]["capabilityCoverage"]["textAnnotations"], 2)
            self.assertEqual(survey["privacy"]["mediaFilesRead"], False)
            self.assertEqual(survey["privacy"]["mediaRecordTextIncluded"], False)

            rendered = json.dumps(survey)
            for forbidden in (
                "child-identifying-opaque-id",
                "perfect-demo-for-student.jpg",
                "Identifiable child text",
                "/private/child-perfect-demo.mov",
                "file:///private/other.mov",
                "legacy-freeform-board",
            ):
                self.assertNotIn(forbidden, rendered)

            output = write_survey(vault, temporary / "survey.json", survey)
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), survey)
            with self.assertRaises(BridgeError):
                write_survey(vault, vault / "unsafe.json", survey)

    def test_missing_or_ambiguous_crop_manifest_is_rejected_without_path_leakage(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            with self.assertRaisesRegex(BridgeError, "No crop manifest"):
                build_survey(vault)

            self._write_crop_manifest(vault)
            second = vault / "other" / "cropped_versions" / "manifest.json"
            second.parent.mkdir(parents=True)
            second.write_text("{}", encoding="utf-8")
            with self.assertRaisesRegex(BridgeError, "More than one crop manifest"):
                build_survey(vault)


if __name__ == "__main__":
    unittest.main()
