# Integrations and Migration

## Source vault boundary

The existing source of historical lessons and automation is:

`/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main`

The new app is built and documented only in:

`/Users/ryansadler/Documents/LESSON PLANNER PROGRAM`

The bridge is read-only against the vault during development and the two-week pilot. It must not rewrite existing lesson plans, Freeform boards, automation files, or schedule data.

## Existing sources to ingest

| Source | Use in the app |
| --- | --- |
| `logistics/schedules/data/schedule.db` | Canonical schedule, booking, equipment, exception, collision, and calendar-week data. |
| `ACTIVE/.../automation/run_daily_lesson_plans.py` | Legacy behavior reference; remains running during the pilot. |
| `ACTIVE/.../automation/lesson_plan_templates.json` | Existing class templates and recurring tasks to migrate into configurable class templates. |
| `ACTIVE/.../automation/lesson_plan_automation_config.json` | Legacy automation rules and safety boundaries. |
| `ACTIVE/.../inspo/drill_ideas.json` | Parent drills, variants, statuses, tags, skills, provenance, sources, and initial library content. |
| `ACTIVE/.../Freeform pics/cropped_versions/manifest.json` | Freeform-derived crop/media metadata and source provenance. |
| `ACTIVE/.../rosters/class_rosters.json` | Initial private rosters for attendance and optional athlete notes. |
| `ACTIVE/automation_state/weekly_notes_ledger.json` | Structured weekly-note source/revision/status data. |
| `ACTIVE/automation_state/email_message_ledger.md` | Existing email crawl output; normalize it into the update-feed contract rather than scrape it in the client. |
| `xarchives/HTMLS/NGA_Routine_Builder.html` | Visual/design reference only. |
| Existing Freeform lesson boards and media | Visual setup examples, original media, zone layouts, and provenance. |

The `ACTIVE/...` abbreviations above refer to the lesson-plans subtree with stylized Unicode folder names. Locate source files by filename with `rg --files` rather than renaming or moving the existing vault.

## Schedule bridge

### Database facts

The schedule database includes schedule, booking, equipment, exception, collision-review, and calendar-week-rule data. The known tables/views include:

- `schedules`
- `schedule_bookings`
- `booking_equipment`
- `schedule_equipment`
- `schedule_exceptions`
- `collision_reviews`
- `calendar_week_rules`
- `booking_rows` view

The current active schedule previously identified is `summer_2026`. Combined labels are expanded in `booking_rows`, but UI mapping must not assume that an equipment token equals a visual planning zone.

### Current safe implementation boundary

The local build now separates schedule work into two deliberate steps:

1. `bridge/vault_importer.py` opens the source database read-only and writes [`fixtures/vault-summary.json`](../fixtures/vault-summary.json) outside the vault.
2. `bridge/schedule_day_resolver.py` consumes that sanitized summary, a selected date, and a selected class/group. It emits a class-specific day handoff under the project root only.

The resolver returns `rotationBlocks`, `openings`, and `supportBlocks` separately. An `open` block is an optional planning suggestion—not an automatic reservation or a phase added to the lesson. The resolver keeps source collision warnings advisory. For a fifth-or-later calendar week, it returns `manual_confirmation_required` and no blocks until the coach supplies an intentional Odd/Even choice; it must never infer a rotation.

Neither client imports this real schedule fixture yet. Both prototypes instead show a fully synthetic, contract-shaped local advisory sample that has no bridge, file, network, or phase-mutating path. That prevents a future accidental public web deployment from becoming an implicit schedule-data release before the private access layer exists.

### Zone mapping candidates, not configuration

`bridge/zone_mapping_candidates.py` reads only the safe summary inside this project and produces [`fixtures/zone-mapping-candidates.json`](../fixtures/zone-mapping-candidates.json). It identifies obvious single-area tokens plus three known combined schedule signatures (`PB/HB`, `SR/PH`, `TR/TT`) and flags other multi-equipment signatures as possible parallel/disconnected bundles.

This is deliberately conservative: every candidate is marked `owner_confirmation_required` and `configurationEligible: false`. Unknown equipment tokens and empty-equipment blocks remain unresolved evidence rather than being partially mapped. During onboarding, the owner can confirm, edit, split, merge, or reject each candidate before it becomes a reusable named `GymZone` configuration.

### Required normalized input

```json
{
  "sourceId": "schedule:summer_2026",
  "revision": "stable-fingerprint",
  "timezone": "America/Los_Angeles",
  "classes": [],
  "timeBlocks": [],
  "scheduleLabels": [],
  "openings": [],
  "collisionWarnings": [],
  "exceptions": [],
  "calendarWeekContext": {}
}
```

- Preserve original labels, source IDs, time ranges, and revisions.
- Expand a combined schedule label only for availability analysis; map it to one or more named visual zones through owner-confirmed configuration.
- Keep known collision/opening results advisory. The current source has unresolved warnings, so the app must say “available according to schedule,” never imply a booking was made.
- Preserve odd/even/calendar-week ambiguity as a reviewable schedule condition instead of guessing.

## Crawl/update bridge

The app consumes a structured feed generated by the existing Codex/automation workflows; it does not log into email directly.

```json
{
  "sourceId": "weekly-note:example-item",
  "sourceRevision": "fingerprint",
  "sourceType": "weekly_note|email",
  "status": "open|needs_review|resolved|cancelled|superseded",
  "title": "...",
  "detail": "...",
  "classScope": [],
  "dates": [],
  "deadline": null,
  "confidence": "high|medium|low",
  "suggestedAction": "announcement|task|note|none"
}
```

- Stable source IDs and revision fingerprints prevent duplicate updates.
- Low-confidence or ambiguous information stays in review and never modifies a lesson automatically.
- Reject records the rejected revision, not a permanent mute of the source.
- Important/Later/Reject and later conversion actions are stored by the app so the decision is auditable.

## Drill-library bridge

`bridge/drill_catalog_exporter.py` reads the drill-ideas JSON only and emits [`fixtures/drill-catalog.json`](../fixtures/drill-catalog.json). The current local catalog contains 31 parent drills and 106 variants, preserving coaching instructions, tags, goals, skills, statuses, and safe provenance tokens.

It is whitelist-based rather than a general vault copy. It structurally excludes media bytes, roster/student fields, raw vault locations, public URLs, local or traversal paths, control characters, and embedded file-like payloads. It does **not** import crop-manifest or media metadata yet; those need a separate contract and owner-controlled private storage flow.

### Crop-manifest sizing survey

Before importing any private image/video metadata, `bridge/media_crop_manifest_survey.py` discovers exactly one legacy `cropped_versions/manifest.json`, opens that JSON only, and emits an aggregate-only survey outside the vault. The first survey found 179 crop records and one supplemental object collection.

The survey carries only a SHA-256 revision, collection/field-shape counts, and high-level capability coverage. It deliberately does not carry captions, filenames, paths, URLs, record identifiers, file bytes, or any source record value. This tells us the migration shape without exposing identifiable-child media or making irreversible media import decisions.

## Import plan

1. Copy/ingest the existing drill library as parent drills plus variants; retain all existing tags/statuses/provenance.
2. Import Freeform crop manifests, originals, captions/OCR notes, bounding boxes, event labels, and duplicate states as source records. Do not flatten them into untraceable images.
3. Register photos, MOV files, documents, and external links as `MediaAsset` records with checksums and local/private-storage state.
4. Import rosters as private data and migrate template tasks/goals by class.
5. Infer schedule-label-to-zone mappings from schedule/lesson evidence, then require a one-time owner review before using them in Ready lessons.
6. Import historic lesson snapshots as read-only references; do not attempt to rewrite them into the new model during the initial implementation.

## Parallel pilot and cutover

### Pilot

- Leave the current generator and its launch-agent schedule untouched.
- App exports write only under:

  `/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/app-preview/`

- Run both systems across all current classes for two weeks.
- Compare schedule blocks, announcements, tasks, outputs, readiness, and media availability. Fix bridge/template defects before cutover.

### Cutover

- Cutover is manual and owner-triggered; never automatic after an elapsed date.
- At cutover, stop the legacy generator from creating new lesson-plan files, but retain its schedule/crawl source functions until their bridge equivalents are proven.
- The app becomes source of truth for future lesson plans.
- The bridge automatically writes readable Markdown/HTML snapshots to the agreed vault export location. Existing historic files remain untouched.
- Keep an export audit record containing lesson ID, revision, export path, source schedule revision, and timestamp.
