from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from zone_mapping_candidates import (  # noqa: E402
    ZoneCandidateError,
    _load_summary,
    build_zone_mapping_candidates,
    resolve_project_root,
    write_zone_mapping_candidates,
)


def make_summary() -> dict[str, object]:
    return {
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "rawWeeklyNoteTextIncluded": False,
            "absoluteSourcePathsIncluded": False,
        },
        "schedule": {
            "sourceId": "schedule:test",
            "scheduleId": "test",
            "revision": "fixture-revision",
            "equipment": [
                {"name": "PB", "displayOrder": 1},
                {"name": "HB", "displayOrder": 2},
                {"name": "SR", "displayOrder": 3},
                {"name": "PH", "displayOrder": 4},
                {"name": "TR", "displayOrder": 5},
                {"name": "TT", "displayOrder": 6},
                {"name": "F4", "displayOrder": 7},
                {"name": "TS", "displayOrder": 8},
            ],
            "timeBlocks": [
                {
                    "canonicalEventLabel": "PB/HB",
                    "equipment": ["PB", "HB"],
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
                {
                    "canonicalEventLabel": "SR/PH",
                    "equipment": ["SR", "PH"],
                    "activityType": "rotation",
                    "confidence": "medium",
                    "reviewStatus": "color_inferred_needs_review",
                },
                {
                    "canonicalEventLabel": "TR/TT",
                    "equipment": ["TR", "TT"],
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
                {
                    "canonicalEventLabel": "F4 + TS",
                    "equipment": ["F4", "TS"],
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
                {
                    "canonicalEventLabel": "F4",
                    "equipment": ["F4"],
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
                {
                    "canonicalEventLabel": "Unmapped",
                    "equipment": ["MYSTERY"],
                    "activityType": "rotation",
                    "confidence": "low",
                    "reviewStatus": "needs_review",
                },
                {
                    "canonicalEventLabel": "Open",
                    "equipment": [],
                    "activityType": "open",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
            ],
        },
    }


class ZoneMappingCandidateTests(unittest.TestCase):
    def test_combined_and_disconnected_candidates_stay_review_only(self) -> None:
        payload = build_zone_mapping_candidates(make_summary())

        self.assertEqual(payload["status"], "owner_confirmation_required")
        self.assertFalse(payload["ownerConfirmation"]["configurationEligible"])
        self.assertFalse(payload["privacy"]["studentRecordsIncluded"])
        self.assertEqual(payload["summary"]["candidateCount"], 5)

        by_id = {candidate["candidateId"]: candidate for candidate in payload["candidates"]}
        bars = by_id["zone-pb-hb"]
        self.assertEqual(bars["displayName"], "PB / HB")
        self.assertEqual(bars["suggestedBoardKind"], "combined_area")
        self.assertTrue(bars["mayRepresentDisconnectedAreas"])
        self.assertEqual(bars["ownerReview"]["status"], "owner_confirmation_required")

        rings_pommel = by_id["zone-sr-ph"]
        self.assertEqual(rings_pommel["suggestedBoardKind"], "combined_area")
        self.assertEqual(rings_pommel["confidence"], "medium")
        self.assertIn("source_contains_review_needed_evidence", rings_pommel["reasonCodes"])

        trampoline_tumble = by_id["zone-tr-tt"]
        self.assertEqual(trampoline_tumble["suggestedBoardKind"], "combined_area")
        self.assertEqual(trampoline_tumble["confidence"], "high")

        disconnected = by_id["zone-f4-ts"]
        self.assertEqual(disconnected["suggestedBoardKind"], "parallel_area_bundle")
        self.assertTrue(disconnected["mayRepresentDisconnectedAreas"])
        self.assertIn("multi_area_bundle_does_not_assume_contiguous_layout", disconnected["reasonCodes"])

    def test_unknown_equipment_is_not_partially_promoted_to_a_zone(self) -> None:
        summary = make_summary()
        summary["schedule"]["timeBlocks"].append(  # type: ignore[index]
            {
                "canonicalEventLabel": "PB/HB/C",
                "equipment": ["PB", "HB", "C"],
                "activityType": "rotation",
                "confidence": "high",
                "reviewStatus": "auto_extracted",
            }
        )
        payload = build_zone_mapping_candidates(summary)
        bars = next(candidate for candidate in payload["candidates"] if candidate["candidateId"] == "zone-pb-hb")

        self.assertEqual(bars["sourceEvidence"]["bookingCount"], 1)
        unresolved = payload["unresolvedEvidence"]
        self.assertEqual(unresolved["unrecognizedEquipmentBlockCount"], 2)
        self.assertIn(
            {"token": "C", "blockCount": 1},
            unresolved["unrecognizedEquipmentTokenCounts"],
        )
        self.assertIn(
            {"token": "MYSTERY", "blockCount": 1},
            unresolved["unrecognizedEquipmentTokenCounts"],
        )

    def test_project_boundary_and_path_like_input_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            project = temporary / "project"
            project.mkdir()
            fixtures = project / "fixtures"
            fixtures.mkdir()
            summary_path = fixtures / "vault-summary.json"
            summary_path.write_text(json.dumps(make_summary()), encoding="utf-8")
            project_root = resolve_project_root(project)

            summary = _load_summary(project_root, summary_path)
            payload = build_zone_mapping_candidates(summary)
            output = write_zone_mapping_candidates(project_root, fixtures / "zone-candidates.json", payload)
            self.assertTrue(output.is_file())

            with self.assertRaises(ZoneCandidateError):
                _load_summary(project_root, temporary / "outside.json")
            with self.assertRaises(ZoneCandidateError):
                write_zone_mapping_candidates(project_root, temporary / "outside.json", payload)

        unsafe = copy.deepcopy(make_summary())
        unsafe["schedule"]["equipment"][0]["name"] = "/Users/not-safe"  # type: ignore[index]
        with self.assertRaises(ZoneCandidateError):
            build_zone_mapping_candidates(unsafe)


if __name__ == "__main__":
    unittest.main()
