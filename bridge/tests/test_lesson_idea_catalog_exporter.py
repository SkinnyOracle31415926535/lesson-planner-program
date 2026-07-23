from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from lesson_idea_catalog_exporter import build_library_catalog  # noqa: E402


class LessonIdeaCatalogExporterTests(unittest.TestCase):
    def test_merges_crop_variants_and_filters_private_lesson_sections(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "vault"
            (root / "inspo").mkdir(parents=True)
            (root / "inspo" / "drill_ideas.json").write_text(json.dumps({"drills": [{
                "id": "floor-shapes", "name": "Floor Shapes", "status": "tested",
                "type": "drill", "events": ["floor"], "skills": ["handstand"],
                "sources": ["crop_manifest: floor/shape_drill"],
            }]}), encoding="utf-8")
            crop = root / "lesson plans" / "freeform pics" / "cropped_versions" / "floor" / "shape_drill"
            crop.mkdir(parents=True)
            (crop / "L3_lesson_01-01-2026.md").write_text(
                "# crop\n\n## OCR draft\n\n- Hold a tight handstand\n", encoding="utf-8"
            )
            duplicate = root / "lesson plans" / "freeform pics" / "cropped_versions" / "_duplicates_removed" / "floor"
            duplicate.mkdir(parents=True)
            (root / "lesson plans" / "past").mkdir(parents=True)
            (root / "lesson plans" / "past" / "L3_lesson_01-01-2026.md").write_text(
                "PLAN:\n- Shape race\nREMINDERS:\n- Student A https://private.example\nATTENDANCE:\n- Student A\n",
                encoding="utf-8",
            )

            catalog = build_library_catalog(root)
            self.assertEqual(catalog["audit"]["eligibleFreeformGroupCount"], 1)
            self.assertEqual(len(catalog["items"]), 2)
            floor = next(item for item in catalog["items"] if item["id"] == "floor-shapes")
            self.assertEqual(floor["variants"][0]["instructions"], ["Hold a tight handstand"])
            serialized = json.dumps(catalog)
            self.assertNotIn("Student A", serialized)
            self.assertNotIn("https://", serialized)


if __name__ == "__main__":
    unittest.main()
