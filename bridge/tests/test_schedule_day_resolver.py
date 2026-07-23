from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from schedule_day_resolver import (  # noqa: E402
    ScheduleResolutionError,
    _load_summary,
    build_day_plan,
    resolve_project_root,
    write_day_plan,
)


def make_summary() -> dict[str, object]:
    return {
        "schedule": {
            "sourceId": "schedule:test",
            "scheduleId": "test",
            "revision": "fixture-revision",
            "effectiveStart": "2026-07-01",
            "effectiveEnd": "2026-07-31",
            "calendarWeekRule": {
                "oddWeekOrdinals": [1, 3],
                "evenWeekOrdinals": [2, 4],
                "weekFiveOrLaterRequiresManualConfirmation": True,
            },
            "collisionWarnings": {"warningCount": 1},
            "timeBlocks": [
                {
                    "bookingId": "l3-odd-bars",
                    "day": "Fri",
                    "week": "Odd",
                    "group": "L3",
                    "canonicalEventLabel": "PB/HB",
                    "equipment": ["PB", "HB"],
                    "startMinute": 960,
                    "endMinute": 975,
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "approved",
                },
                {
                    "bookingId": "l3-odd-open",
                    "day": "Fri",
                    "week": "Odd",
                    "group": "L3",
                    "canonicalEventLabel": "Open",
                    "equipment": [],
                    "startMinute": 975,
                    "endMinute": 990,
                    "activityType": "open",
                    "confidence": "high",
                    "reviewStatus": "approved",
                },
                {
                    "bookingId": "l3-even-floor",
                    "day": "Fri",
                    "week": "Even",
                    "group": "L3",
                    "canonicalEventLabel": "F4",
                    "equipment": ["F4"],
                    "startMinute": 960,
                    "endMinute": 975,
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "approved",
                },
                {
                    "bookingId": "l4-odd-floor",
                    "day": "Fri",
                    "week": "Odd",
                    "group": "L4",
                    "canonicalEventLabel": "F4",
                    "equipment": ["F4"],
                    "startMinute": 960,
                    "endMinute": 975,
                    "activityType": "rotation",
                    "confidence": "high",
                    "reviewStatus": "approved",
                },
            ],
        }
    }


class ScheduleDayResolverTests(unittest.TestCase):
    def test_auto_rotation_returns_only_one_groups_blocks_and_openings(self) -> None:
        # July 17 is in the third Monday–Sunday week of July 2026 → Odd.
        payload = build_day_plan(make_summary(), date(2026, 7, 17), group="L3")

        self.assertEqual(payload["rotation"]["status"], "auto")
        self.assertEqual(payload["rotation"]["resolvedWeek"], "Odd")
        self.assertEqual(payload["selection"]["status"], "ready")
        self.assertEqual([block["bookingId"] for block in payload["plan"]["rotationBlocks"]], ["l3-odd-bars"])
        self.assertEqual([block["bookingId"] for block in payload["plan"]["openings"]], ["l3-odd-open"])
        self.assertNotIn("rawLabel", payload["plan"]["rotationBlocks"][0])
        self.assertTrue(payload["advisories"])

    def test_fifth_week_requires_intentional_choice_before_blocks_return(self) -> None:
        unresolved = build_day_plan(make_summary(), date(2026, 7, 31), group=None)
        self.assertEqual(unresolved["rotation"]["status"], "manual_confirmation_required")
        self.assertEqual(unresolved["selection"]["status"], "manual_week_confirmation_required")
        self.assertEqual(unresolved["plan"]["rotationBlocks"], [])

        confirmed = build_day_plan(
            make_summary(), date(2026, 7, 31), group="L3", manual_week_choice="Even"
        )
        self.assertEqual(confirmed["rotation"]["status"], "manual_confirmed")
        self.assertEqual(confirmed["plan"]["rotationBlocks"][0]["bookingId"], "l3-even-floor")

    def test_project_boundary_rejects_summary_or_output_outside_project(self) -> None:
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
            payload = build_day_plan(summary, date(2026, 7, 17), group="L3")
            output = write_day_plan(project_root, fixtures / "day-plan.json", payload)
            self.assertTrue(output.is_file())

            with self.assertRaises(ScheduleResolutionError):
                _load_summary(project_root, temporary / "outside.json")
            with self.assertRaises(ScheduleResolutionError):
                write_day_plan(project_root, temporary / "outside.json", payload)


if __name__ == "__main__":
    unittest.main()
