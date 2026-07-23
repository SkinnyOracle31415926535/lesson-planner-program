from __future__ import annotations

import hashlib
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


BRIDGE_DIRECTORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BRIDGE_DIRECTORY))

from vault_importer import BridgeError, build_summary, write_summary  # noqa: E402


def _tree_snapshot(root: Path) -> dict[str, str]:
    """Fingerprint every source file so a test can prove the vault was unchanged."""

    snapshot: dict[str, str] = {}
    for path in sorted(root.rglob("*")):
        if path.is_file():
            snapshot[str(path.relative_to(root))] = hashlib.sha256(path.read_bytes()).hexdigest()
    return snapshot


def _write_test_database(path: Path) -> None:
    connection = sqlite3.connect(path)
    try:
        connection.executescript(
            """
            CREATE TABLE schedules (
                schedule_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                status TEXT NOT NULL,
                effective_start TEXT,
                effective_end TEXT,
                source_sha256 TEXT,
                imported_at TEXT,
                activated_at TEXT
            );
            CREATE TABLE booking_rows (
                booking_id TEXT,
                schedule_id TEXT,
                source_booking_id TEXT,
                day TEXT,
                week TEXT,
                "group" TEXT,
                raw_label TEXT,
                equipment TEXT,
                start_min INTEGER,
                end_min INTEGER,
                source_class_name TEXT,
                canonical_event_label TEXT,
                activity_type TEXT,
                confidence TEXT,
                review_status TEXT
            );
            CREATE TABLE calendar_week_rules (
                rule_id TEXT PRIMARY KEY,
                schedule_id TEXT,
                is_default INTEGER NOT NULL,
                timezone TEXT NOT NULL,
                week_start TEXT NOT NULL,
                week_end TEXT NOT NULL,
                month_week_anchor TEXT NOT NULL,
                odd_week_ordinals_json TEXT NOT NULL,
                even_week_ordinals_json TEXT NOT NULL,
                overflow_week_behavior TEXT NOT NULL
            );
            CREATE TABLE schedule_equipment (
                schedule_id TEXT,
                equipment TEXT,
                display_order INTEGER,
                is_single_unit INTEGER
            );
            CREATE TABLE schedule_exceptions (
                exception_id INTEGER PRIMARY KEY,
                schedule_id TEXT,
                start_date TEXT,
                end_date TEXT,
                kind TEXT,
                notes TEXT
            );
            CREATE TABLE collision_reviews (
                schedule_id TEXT,
                status TEXT
            );
            """
        )
        connection.execute(
            """
            INSERT INTO schedules VALUES
            ('summer_test', 'Summer Test', 'active', '2026-06-15', NULL, 'source-revision',
             '2026-06-15T00:00:00Z', '2026-06-15T00:00:00Z')
            """
        )
        connection.executemany(
            """
            INSERT INTO booking_rows VALUES (?, 'summer_test', ?, 'Mon', 'Odd', 'L3',
                'PB/HB', ?, 930, 945, 'L3', 'PB/HB', 'rotation', 'high', 'approved')
            """,
            [
                ('booking-combined', 'source-combined', 'PB'),
                ('booking-combined', 'source-combined', 'HB'),
            ],
        )
        connection.execute(
            """
            INSERT INTO booking_rows VALUES
            ('booking-floor', 'summer_test', 'source-floor', 'Mon', 'Odd', 'L3',
             'F4', 'F4', 945, 1000, 'L3', 'F4', 'rotation', 'high', 'approved')
            """
        )
        connection.execute(
            """
            INSERT INTO calendar_week_rules VALUES
            ('default', NULL, 1, 'America/Los_Angeles', 'monday', 'sunday',
             'monday_sunday_week_containing_month_day_1', '[1,3]', '[2,4]',
             'manual_confirmation_required')
            """
        )
        connection.executemany(
            "INSERT INTO schedule_equipment VALUES ('summer_test', ?, ?, 1)",
            [('PB', 1), ('HB', 2), ('F4', 3)],
        )
        connection.execute(
            """
            INSERT INTO schedule_exceptions VALUES
            (1, 'summer_test', '2026-07-04', '2026-07-04', 'closure', 'Closed')
            """
        )
        connection.executemany(
            "INSERT INTO collision_reviews VALUES ('summer_test', ?)",
            [('needs_review',), ('resolved',)],
        )
        connection.commit()
    finally:
        connection.close()


def _make_test_vault(root: Path) -> None:
    database_path = root / "logistics" / "schedules" / "data" / "schedule.db"
    database_path.parent.mkdir(parents=True)
    _write_test_database(database_path)

    drills_path = root / "legacy" / "stylized" / "drill_ideas.json"
    drills_path.parent.mkdir(parents=True)
    drills_path.write_text(
        json.dumps(
            {
                "schema_version": "1.1",
                "drills": [
                    {
                        "id": "bars-shapes",
                        "name": "Bars Shapes",
                        "status": "tested",
                        "type": "drill",
                        "events": ["bars"],
                        "skills": ["cast"],
                        "tags": ["form", "bars"],
                        "variants": [{"name": "Tuck"}, {"name": "Straight"}],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    ledger_path = root / "ACTIVE" / "automation_state" / "weekly_notes_ledger.json"
    ledger_path.parent.mkdir(parents=True)
    ledger_path.write_text(
        json.dumps(
            {
                "version": 1,
                "records": {
                    "weekly-1": {
                        "source_id": "weekly-1",
                        "items": [{"status": "needs_review"}],
                        "revisions": [{"fingerprint": "one"}],
                    }
                },
            }
        ),
        encoding="utf-8",
    )


class VaultImporterTests(unittest.TestCase):
    def test_read_only_grouping_and_manual_week_five_rule(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            _make_test_vault(vault)
            before = _tree_snapshot(vault)

            summary = build_summary(vault)
            self.assertEqual(summary, build_summary(vault))
            output = write_summary(vault, temporary / "fixture.json", summary)
            first_render = output.read_bytes()
            write_summary(vault, output, build_summary(vault))

            self.assertEqual(before, _tree_snapshot(vault))
            self.assertTrue(output.is_file())
            self.assertEqual(first_render, output.read_bytes())
            self.assertEqual(summary["privacy"]["studentRecordsIncluded"], False)
            self.assertEqual(summary["schedule"]["collisionWarnings"]["warningCount"], 1)
            self.assertTrue(
                summary["schedule"]["calendarWeekRule"]
                ["weekFiveOrLaterRequiresManualConfirmation"]
            )

            time_blocks = summary["schedule"]["timeBlocks"]
            self.assertEqual(len(time_blocks), 2)
            combined = next(block for block in time_blocks if block["bookingId"] == "booking-combined")
            self.assertEqual(combined["equipment"], ["HB", "PB"])
            self.assertEqual(summary["drillLibrary"]["parentCount"], 1)
            self.assertEqual(summary["weeklyLedger"]["itemCount"], 1)

    def test_refuses_output_inside_vault(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            vault = temporary / "vault"
            vault.mkdir()
            _make_test_vault(vault)

            with self.assertRaises(BridgeError):
                write_summary(vault, vault / "unsafe.json", build_summary(vault))


if __name__ == "__main__":
    unittest.main()
