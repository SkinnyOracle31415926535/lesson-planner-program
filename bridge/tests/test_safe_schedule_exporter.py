from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BRIDGE_DIRECTORY.parent
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from safe_schedule_exporter import (  # noqa: E402
    FORMAT,
    OUTPUT_PRIVACY,
    SCHEMA_VERSION,
    SafeScheduleExportError,
    _load_sanitized_fixture,
    build_safe_schedule_bundle,
    resolve_project_root,
    write_safe_schedule_bundle,
)


def make_summary() -> dict[str, object]:
    return {
        "contractVersion": "1.0",
        "privacy": {
            "studentRecordsIncluded": False,
            "mediaBytesIncluded": False,
            "rawWeeklyNoteTextIncluded": False,
            "absoluteSourcePathsIncluded": False,
        },
        "schedule": {
            "sourceId": "schedule:test",
            "scheduleId": "test",
            "revision": "safe-revision",
            "displayName": "excluded schedule display name",
            "timezone": "America/Los_Angeles",
            "effectiveStart": "2026-06-15",
            "effectiveEnd": None,
            "calendarWeekRule": {
                "ruleId": "test-rule",
                "timezone": "America/Los_Angeles",
                "weekStart": "monday",
                "weekEnd": "sunday",
                "monthWeekAnchor": "monday_sunday_week_containing_month_day_1",
                "oddWeekOrdinals": [3, 1],
                "evenWeekOrdinals": [4, 2],
                "weekFiveOrLaterRequiresManualConfirmation": True,
                "overflowWeekBehavior": "manual_confirmation_required",
            },
            "equipment": [
                {"name": "F1", "displayOrder": 1, "isSingleUnit": True},
                {"name": "Vault", "displayOrder": 0, "isSingleUnit": True},
            ],
            "timeBlocks": [
                {
                    "bookingId": "booking-open",
                    "day": "Mon",
                    "week": "Odd",
                    "group": "B3",
                    "startMinute": 600,
                    "endMinute": 630,
                    "canonicalEventLabel": "Open",
                    "rawLabel": "PRIVATE RAW OPEN LABEL",
                    "sourceBookingId": "PRIVATE SOURCE BOOKING",
                    "sourceClassName": "PRIVATE SOURCE CLASS",
                    "equipment": [],
                    "activityType": "open",
                    "confidence": "high",
                    "reviewStatus": "auto_extracted",
                },
                {
                    "bookingId": "booking-rotation",
                    "day": "Mon",
                    "week": "Odd",
                    "group": "B4",
                    "startMinute": 590,
                    "endMinute": 605,
                    "canonicalEventLabel": "Vault/F1",
                    "rawLabel": "PRIVATE RAW ROTATION LABEL",
                    "sourceBookingId": "PRIVATE SOURCE ROTATION",
                    "sourceClassName": "PRIVATE SOURCE CLASS TWO",
                    "equipment": ["Vault", "F1", "Vault"],
                    "activityType": "rotation",
                    "confidence": "medium",
                    "reviewStatus": "needs_review",
                },
            ],
            "collisionWarnings": {
                "warningCount": 2,
                "statusCounts": {"needs_review": 2},
            },
            "exceptions": [{"notes": "PRIVATE EXCEPTION NOTES"}],
        },
        "drillLibrary": {"items": ["PRIVATE DRILL LIBRARY"]},
        "weeklyLedger": {"items": ["PRIVATE WEEKLY LEDGER"]},
    }


class SafeScheduleExporterTests(unittest.TestCase):
    def test_exports_only_the_strict_allowlist(self) -> None:
        bundle = build_safe_schedule_bundle(make_summary())

        self.assertEqual(set(bundle), {"format", "version", "privacy", "schedule"})
        self.assertEqual(bundle["format"], FORMAT)
        self.assertEqual(bundle["version"], SCHEMA_VERSION)
        self.assertEqual(bundle["privacy"], OUTPUT_PRIVACY)
        self.assertTrue(all(value is False for value in bundle["privacy"].values()))

        schedule = bundle["schedule"]
        self.assertEqual(
            set(schedule),
            {
                "sourceId",
                "scheduleId",
                "revision",
                "timezone",
                "effectiveStart",
                "effectiveEnd",
                "calendarWeekRule",
                "equipment",
                "timeBlocks",
                "collisionWarnings",
            },
        )
        self.assertEqual(
            set(schedule["timeBlocks"][0]),
            {
                "bookingId",
                "day",
                "week",
                "group",
                "startMinute",
                "endMinute",
                "canonicalEventLabel",
                "eventLabel",
                "equipment",
                "activityType",
                "confidence",
                "reviewStatus",
            },
        )
        open_block = next(
            block for block in schedule["timeBlocks"] if block["bookingId"] == "booking-open"
        )
        self.assertEqual(open_block["eventLabel"], "Open")
        self.assertEqual(open_block["canonicalEventLabel"], "Open")

        rendered = json.dumps(bundle, sort_keys=True)
        for forbidden in (
            '"rawLabel":',
            '"sourceBookingId":',
            '"sourceClassName":',
            '"exceptions":',
            '"drillLibrary":',
            '"weeklyLedger":',
            "PRIVATE",
        ):
            self.assertNotIn(forbidden, rendered)

    def test_normalizes_lists_for_deterministic_output(self) -> None:
        first = make_summary()
        second = copy.deepcopy(first)
        second_schedule = second["schedule"]
        second_schedule["timeBlocks"].reverse()
        second_schedule["equipment"].reverse()
        second_schedule["calendarWeekRule"]["oddWeekOrdinals"].reverse()
        second_schedule["calendarWeekRule"]["evenWeekOrdinals"].reverse()
        second_schedule["timeBlocks"][0]["equipment"].reverse()

        first_bundle = build_safe_schedule_bundle(first)
        second_bundle = build_safe_schedule_bundle(second)
        self.assertEqual(first_bundle, second_bundle)
        self.assertEqual(
            json.dumps(first_bundle, indent=2, sort_keys=True, ensure_ascii=False),
            json.dumps(second_bundle, indent=2, sort_keys=True, ensure_ascii=False),
        )

    def test_requires_every_source_privacy_assertion(self) -> None:
        for marker in (
            "studentRecordsIncluded",
            "mediaBytesIncluded",
            "rawWeeklyNoteTextIncluded",
            "absoluteSourcePathsIncluded",
        ):
            with self.subTest(marker=marker):
                summary = make_summary()
                summary["privacy"][marker] = True
                with self.assertRaisesRegex(SafeScheduleExportError, marker):
                    build_safe_schedule_bundle(summary)

    def test_rejects_duplicate_ids_and_invalid_time_boundaries(self) -> None:
        duplicate = make_summary()
        duplicate["schedule"]["timeBlocks"][1]["bookingId"] = "booking-open"
        with self.assertRaisesRegex(SafeScheduleExportError, "Duplicate schedule bookingId"):
            build_safe_schedule_bundle(duplicate)

        non_five_minute = make_summary()
        non_five_minute["schedule"]["timeBlocks"][0]["startMinute"] = 601
        with self.assertRaisesRegex(SafeScheduleExportError, "five-minute"):
            build_safe_schedule_bundle(non_five_minute)

        reversed_time = make_summary()
        reversed_time["schedule"]["timeBlocks"][0]["endMinute"] = 595
        with self.assertRaisesRegex(SafeScheduleExportError, "invalid time range"):
            build_safe_schedule_bundle(reversed_time)

    def test_rejects_values_the_browser_contract_cannot_import(self) -> None:
        manual_week = make_summary()
        manual_week["schedule"]["calendarWeekRule"][
            "weekFiveOrLaterRequiresManualConfirmation"
        ] = False
        with self.assertRaisesRegex(SafeScheduleExportError, "must be true"):
            build_safe_schedule_bundle(manual_week)

        invalid_values = (
            ("activityType", "free", "activity type"),
            ("confidence", "certain", "confidence"),
            ("reviewStatus", "approved", "review status"),
        )
        for field_name, value, message in invalid_values:
            with self.subTest(field_name=field_name):
                summary = make_summary()
                summary["schedule"]["timeBlocks"][0][field_name] = value
                with self.assertRaisesRegex(SafeScheduleExportError, message):
                    build_safe_schedule_bundle(summary)

        invalid_calendar = make_summary()
        invalid_calendar["schedule"]["calendarWeekRule"]["weekStart"] = "sunday"
        with self.assertRaisesRegex(SafeScheduleExportError, "weekStart"):
            build_safe_schedule_bundle(invalid_calendar)

    def test_rejects_path_and_url_values_in_safe_fields(self) -> None:
        path_value = make_summary()
        path_value["schedule"]["timeBlocks"][0]["group"] = "/Users/private/roster"
        with self.assertRaisesRegex(SafeScheduleExportError, "path-like or URL"):
            build_safe_schedule_bundle(path_value)

        url_value = make_summary()
        url_value["schedule"]["timeBlocks"][0]["canonicalEventLabel"] = (
            "https://example.test/private"
        )
        with self.assertRaisesRegex(SafeScheduleExportError, "path-like or URL"):
            build_safe_schedule_bundle(url_value)

    def test_loads_only_the_fixed_sanitized_fixture_and_enforces_output_boundary(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project_root = Path(temporary_directory) / "project"
            fixtures = project_root / "fixtures"
            fixtures.mkdir(parents=True)
            (fixtures / "another-summary.json").write_text(
                json.dumps(make_summary()), encoding="utf-8"
            )
            root = resolve_project_root(project_root)
            with self.assertRaisesRegex(SafeScheduleExportError, "vault-summary.json"):
                _load_sanitized_fixture(root)

            source = fixtures / "vault-summary.json"
            source.write_text(json.dumps(make_summary()), encoding="utf-8")
            summary = _load_sanitized_fixture(root)
            bundle = build_safe_schedule_bundle(summary)

            output = project_root / "local/imports/safe.json"
            written = write_safe_schedule_bundle(root, output, bundle)
            self.assertEqual(written, output.resolve())
            self.assertEqual(json.loads(output.read_text(encoding="utf-8")), bundle)
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)

            outside = project_root.parent / "outside.json"
            with self.assertRaisesRegex(SafeScheduleExportError, "inside"):
                write_safe_schedule_bundle(root, outside, bundle)
            with self.assertRaisesRegex(SafeScheduleExportError, "must not replace"):
                write_safe_schedule_bundle(root, source, bundle)

    def test_current_fixture_has_expected_safe_schedule_boundaries(self) -> None:
        root = resolve_project_root(PROJECT_ROOT)
        bundle = build_safe_schedule_bundle(_load_sanitized_fixture(root))
        schedule = bundle["schedule"]

        self.assertEqual(schedule["effectiveStart"], "2026-06-15")
        self.assertIsNone(schedule["effectiveEnd"])
        self.assertEqual(len(schedule["equipment"]), 22)
        self.assertEqual(len(schedule["timeBlocks"]), 2106)
        self.assertEqual(
            sum(block["activityType"] == "open" for block in schedule["timeBlocks"]), 73
        )
        self.assertEqual(schedule["collisionWarnings"]["warningCount"], 189)
        self.assertTrue(
            all(
                block["startMinute"] % 5 == 0 and block["endMinute"] % 5 == 0
                for block in schedule["timeBlocks"]
            )
        )
        self.assertNotIn("rawLabel", json.dumps(bundle, sort_keys=True))


if __name__ == "__main__":
    unittest.main()
