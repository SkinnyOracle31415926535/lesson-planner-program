# Read-only Vault Bridge

`vault_importer.py` makes a deterministic, sanitized development fixture from the existing gymnastics vault. It is deliberately not an exporter and it does not replace the existing lesson-plan automation. The two downstream tools in this folder build safe development handoffs from that fixture or the drill library without changing either source system.

## Safety boundary

- `--vault-root` is always required.
- SQLite is opened with `mode=ro`.
- The script discovers `drill_ideas.json` and `weekly_notes_ledger.json` by filename so it does not encode the legacy Unicode folder names.
- It never reads roster files, copies media bytes, emits raw weekly-note text, or writes anywhere under the vault.
- `--out` is always required and is rejected if it resolves inside `--vault-root`.

## Run it

```sh
python3 bridge/vault_importer.py \
  --vault-root "/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main" \
  --out fixtures/vault-summary.json
```

The result contains:

- the single active schedule, with flattened `booking_rows` regrouped by `bookingId` and their equipment preserved as an array;
- schedule equipment, calendar-week rule, exceptions, and collision-warning count;
- a drill-library index (parent/variant counts and non-sensitive retrieval fields only); and
- aggregate weekly-ledger metadata without raw announcements or student data.

The bridge returns an error if the source has more than one active schedule, ambiguous source filenames, conflicting flattened booking rows, or an unsafe output target.

## Export detailed drill metadata

This reads `drill_ideas.json` only. It exports parent drills, variants, coaching text, tags, and safe provenance tokens—not media bytes, rosters, raw vault paths, URLs, or arbitrary source fields.

```sh
python3 bridge/drill_catalog_exporter.py \
  --vault-root "/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main" \
  --out fixtures/drill-catalog.json
```

The existing fixture contains 31 parent drills and 106 variants. It remains development data only; do not expose it through a deployed public site.

## Resolve one planning day

`schedule_day_resolver.py` does **not** open the vault. It consumes the already-sanitized schedule fixture from this project, requires a deliberate class/group selection, and writes only inside the project root.

```sh
python3 bridge/schedule_day_resolver.py \
  --project-root "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM" \
  --summary "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/vault-summary.json" \
  --date 2026-07-17 \
  --group B3 \
  --out "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/schedule-day.demo.json"
```

It returns rotation blocks, schedule-defined `open` blocks as separate optional openings, and warmup/conditioning blocks separately. If the date falls in a fifth-or-later calendar week, it emits no plan until `--manual-week-choice Odd` or `Even` is supplied intentionally.

## Propose zone-board mappings for review

This safe helper reads only the sanitized summary inside the project. It does not open the vault. Its result is a review queue, never ready-to-use gym configuration: every candidate requires the owner's explicit confirm/edit/split/merge/reject action.

```sh
python3 bridge/zone_mapping_candidates.py \
  --project-root "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM" \
  --summary "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/vault-summary.json" \
  --out "/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/zone-mapping-candidates.json"
```

The current fixture proposes 31 candidates. It recognizes the schedule vocabulary for `PB/HB`, `SR/PH`, and `TR/TT`, but still marks those combined areas as potentially disconnected and owner-review-only. Unknown equipment stays unresolved instead of being guessed into a visual zone.

## Survey the crop manifest safely

This survey is intentionally not a media importer. It discovers exactly one legacy `cropped_versions/manifest.json`, opens that JSON only, and returns aggregate structural counts outside the vault. It never opens media, Freeform boards, rosters, or unrelated vault documents.

```sh
python3 bridge/media_crop_manifest_survey.py \
  --vault-root "/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main" \
  --out fixtures/media-crop-manifest-survey.json
```

The current survey reports 179 crop records, but no individual record metadata. It is a safe sizing step before the owner approves an actual private media migration.

## Test it

```sh
python3 -m unittest discover -s bridge/tests -v
```

Tests construct a tiny temporary vault and verify that the importer does not alter it, combined bookings stay combined, and the manual week-five rule is explicitly carried into the fixture.
