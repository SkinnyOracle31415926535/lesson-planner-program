# Development Guide

## Safety boundary

- Work only inside this folder unless a read-only bridge invocation explicitly names the source vault.
- Do not alter the legacy lesson automation, schedule database, Freeform boards, media, or rosters during the local-build phase.
- Do not put student names, identifiable media, raw email bodies, API keys, signing credentials, or a public media URL in fixtures, source control, or the Mac editor.
- The browser editor is local-only until private device enrollment and backend access controls exist.

## Source-control note

The project uses the private `SkinnyOracle31415926535/lesson-planner-program` root monorepo because the contracts and bridge are shared by both clients. The former nested Git metadata was preserved outside the project before the root repository was initialized.

## Mac editor

From `web-editor/`:

```bash
npm install
npm run dev
npm run build
```

The app currently uses local/mock data. `npm run build` is the required validation before considering a browser-editing change complete.

## Native iPad app

Open `ipad-app/LessonPlanner/LessonPlanner.xcodeproj` in Xcode, select an iPad simulator, and run the `LessonPlanner` scheme.

For command-line validation, list local simulator destinations first:

```bash
xcrun simctl list devices available
```

Then build and test with the selected iPad simulator identifier:

```bash
xcodebuild -project ipad-app/LessonPlanner/LessonPlanner.xcodeproj \
  -scheme LessonPlanner \
  -destination 'platform=iOS Simulator,id=SIMULATOR_IDENTIFIER' \
  build

xcodebuild -project ipad-app/LessonPlanner/LessonPlanner.xcodeproj \
  -scheme LessonPlanner \
  -destination 'platform=iOS Simulator,id=SIMULATOR_IDENTIFIER' \
  -only-testing:LessonPlannerTests \
  test
```

## Read-only vault import

The bridge requires an explicit source root and output location. It refuses any output path inside the source vault.

```bash
python3 bridge/vault_importer.py \
  --vault-root '/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main' \
  --out fixtures/vault-summary.json

python3 -B -m unittest discover -s bridge/tests -v
```

The generated summary intentionally excludes student records, raw weekly-note text, media bytes, and absolute source paths.

To create the separate safe drill catalog and resolve a specific class day from the safe summary:

```bash
python3 bridge/drill_catalog_exporter.py \
  --vault-root '/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main' \
  --out fixtures/drill-catalog.json

python3 bridge/schedule_day_resolver.py \
  --project-root '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM' \
  --summary '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/vault-summary.json' \
  --date 2026-07-17 \
  --group B3 \
  --out '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/schedule-day.demo.json'
```

The day resolver needs an intentional `--manual-week-choice Odd` or `Even` for a fifth-or-later calendar week. It is intentionally advisory and never reserves a schedule opening.

To generate the non-authoritative owner-review mapping queue from the safe summary:

```bash
python3 bridge/zone_mapping_candidates.py \
  --project-root '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM' \
  --summary '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/vault-summary.json' \
  --out '/Users/ryansadler/Documents/LESSON PLANNER PROGRAM/fixtures/zone-mapping-candidates.json'
```

Every generated zone candidate is deliberately marked as requiring owner confirmation. Do not treat the fixture as finalized gym-layout configuration.

To survey the existing crop manifest without opening any media asset:

```bash
python3 bridge/media_crop_manifest_survey.py \
  --vault-root '/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main' \
  --out fixtures/media-crop-manifest-survey.json
```

This is an aggregate-only sizing step. It refuses vault output and does not expose captions, filenames, paths, URLs, identifiers, record text, or media bytes.

## Before remote work

Do not deploy the web editor or create a production backend merely because local development works. The next remote stage needs an owner-controlled backend, private access policies, device enrollment, non-public media storage, backup/recovery, and explicit approval before any student data is uploaded.
