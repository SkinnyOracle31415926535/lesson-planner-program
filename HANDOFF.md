# Handoff: Lesson Planner Program

**Last consolidated:** 2026-07-19  
**Purpose:** Give a new Mac, engineer, or Codex session the complete project context without depending on prior chat history.

## Read this first

This is a personal gymnastics lesson-planning system for one coach. It is not a generic classroom planner. The owner wants to stop rebuilding lesson plans manually, retrieve strong drill ideas quickly, preserve a large visual/media archive, and plan from the real gym schedule without losing Freeform-style spatial thinking.

The folder now contains implementation foundation code as well as documentation. No existing vault content or legacy automation has been changed.

## Current implementation snapshot

- [`web-editor/`](web-editor/) contains a local-only 90s Mac planning editor built from mock lesson data. It persists lesson-local snapshots, notes, task state, revision-scoped update decisions, event/phase structure, attendance, browser-local ideas, and manual gem preferences only in that browser's local storage. One schedule event may contain several ordered phases; `+ PHASE IN THIS EVENT` and `TRANSITION EARLY` are intentional different actions. A library idea remains transient until the coach taps the highlighted text plan or selected station itself—no zone is silently chosen. View mode hides the editor controls, produces a legacy-style text run-of-show, and keeps attendance live. The Active Shelf supports title/tag search, Relevant/Recent/Archive shelves, star-only gems, and new local drills/activities/references. It is not deployed and has no production backend or authentication.
- [`ipad-app/LessonPlanner/`](ipad-app/LessonPlanner/) contains a native SwiftUI iPad prototype. Its local sandbox persistence covers event blocks/ordered phases, attendance, short coach notes, lesson-local snapshots, Ready/task state, manual gems, daily operations, and recently used items **only after explicit local lesson completion**. It has the same direct placement, star, new-idea, event/phase, and text-View concepts as the Mac editor, plus TS = Tumble Strip and F1–F4 floor-slice semantics. Deselecting a panel parks its lesson-local contents for restoration; text-only phases hide panels and visual/mixed phases show only selected ones. Its static schedule-advisory sample is read-only, keeps optional openings separate, and cannot modify a lesson phase. The source passed an iOS simulator type-check; do not claim a new full simulator test pass until `xcodebuild` succeeds.
- [`bridge/`](bridge/) contains read-only tools. The importer opens the schedule SQLite database read-only and creates a sanitized summary fixture; the detailed catalog exporter reads the drill JSON only; the schedule-day resolver reads the safe summary only. All refuse their unsafe write boundary and do not import rosters, raw update text, media bytes, URLs, or absolute paths.
- [`fixtures/vault-summary.json`](fixtures/vault-summary.json) is safe development metadata only: active schedule facts, grouped schedule blocks, drill parent/variant counts, and weekly aggregate counts. [`fixtures/drill-catalog.json`](fixtures/drill-catalog.json) contains the safe detailed coaching catalog (31 parents / 106 variants). [`fixtures/schedule-day.demo.json`](fixtures/schedule-day.demo.json) demonstrates the advisory single-class day resolver. [`fixtures/zone-mapping-candidates.json`](fixtures/zone-mapping-candidates.json) is a non-configurable owner-review queue—its 31 candidates are not gym-layout truth until affirmed by the owner. [`contracts/gym-map-semantics.json`](contracts/gym-map-semantics.json) is the durable selected-zone/composite-map registry, while [`contracts/gym-layout-geometry-draft.json`](contracts/gym-layout-geometry-draft.json) is the bounded Skeleton-Freeform-derived geometry draft; it intentionally leaves uncertain equipment unmapped. [`fixtures/media-assets.demo.json`](fixtures/media-assets.demo.json) is three synthetic metadata-only references that exercise the local-readiness contract; no real media has been copied. [`fixtures/media-crop-manifest-survey.json`](fixtures/media-crop-manifest-survey.json) shows there are 179 crop records to plan for, without revealing a single record's text or asset identity.

## Non-negotiable product decisions

- Build in this folder as a **native SwiftUI iPad app** plus a **private Mac browser editor**. The iPad is the primary in-gym device.
- Distribute the iPad app through **TestFlight**.
- The app is one-owner/private. It uses a high-entropy owner link and device enrollment; there is **no email/password or PIN in v1**. It contains student names, attendance, and identifiable student demo videos, so assets must never be public.
- The Mac is for editing the same lesson remotely, not remote-control streaming of the iPad screen.
- Media is local-first: keep local copies on devices, relay encrypted/private copies through the backend, and guarantee downloads for Ready and near-future lessons. Remaining media caches on demand.
- Start with one reusable main gym layout, but support multiple layouts in the data model later.
- A lesson phase shows **only the physical zones used in that time frame**. A phase may include several disconnected zones, such as `F4 + TS` or `strap bar + F3`; unrelated zones must not appear.
- A phase can be visual, text-only, or mixed. It can sequence drill content into an activity and can have parallel lanes for simultaneous work.
- Use the term **activity**, not “group activity.” Activities may be rule/explanation-only or fully visual.
- Visual boards use separate Freeform-style zone panels with draggable cards, media, text, captions, sticky notes, arrows, markers, resize/layer controls, and setup objects. No freehand/Pencil drawing in v1.
- New lessons open from the schedule into a **smart draft that suggests but does not place content**.
- View mode is a quick-run coaching mode: attendance, timers, phase done/skip, short notes, full-screen demo video/AirPlay, and optional athlete-specific notes. Attendance stays inside the planner/vault export in v1; do not post to Jackrabbit.
- Library import preserves all legacy ideas, crops, photos, videos, variants, and provenance. Daily planning shows an Active Shelf/relevant items; Archive is hidden by default. Only manual stars create “gems.”
- Adding a drill selects one or more variants as editable **lesson snapshots**. Editing source drills/phase recipes never rewrites an existing lesson.
- A multi-zone phase requires an explicit destination station for a new snapshot. It never defaults to the first selected zone; text/no-zone phases add a text cue instead.
- Safety requirements create a visible setup checklist and require owner acknowledgment before a lesson becomes Ready; they do not hard-block planning.
- TODOs can target all/selected classes, a phase, or one lesson. Recurring tasks repeat; temporary tasks roll forward until completed.
- Daily crawl updates appear on the first app open of the day. Important updates remain manual until turned into an announcement/task/note. Reject hides only that revision; later revisions may reappear.
- Schedule openings are optional suggestions, never auto-added or reserved. A schedule change flags the draft and requires a manual apply; it never overwrites the owner’s station plan.
- No conversational or generative AI inside the app in v1. Existing Codex crawls supply structured inputs only.
- Keep the existing automation running while building. Pilot the app for two weeks across all current classes, export only into a separate app-preview folder, then manually cut over. After cutover, automatically export readable Markdown/HTML snapshots back into the vault.

## Visual direction

The UI must feel intentionally 90s-internet and closely echo the existing NGA Routine Builder: dark navy surfaces, neon cyan/blue/green/yellow, beveled rounded panels, dense but legible control-panel structure, large iPad touch targets, and explicit status colors. Retain the best Freeform qualities—visual grouping, media-first station planning, stars, collage-like setup boards—without inheriting Freeform’s retrieval friction.

## Existing source material

The source vault is:

`/Users/ryansadler/Library/Mobile Documents/com~apple~CloudDocs/gymnastics_vault-main`

Important sources are documented in [docs/INTEGRATIONS_AND_MIGRATION.md](docs/INTEGRATIONS_AND_MIGRATION.md). Highlights:

- Versioned SQLite schedule database and current schedule/booking data.
- Existing daily lesson-plan generator and templates.
- Drill idea library with parent drills, variants, tags, provenance, and statuses.
- Freeform-derived crops and visual lesson boards.
- Roster data, weekly-note ledger, and email crawler ledger.
- Existing NGA Routine Builder HTML as a visual reference.

## Immediate execution order

1. Review the zone-mapping candidate queue and build a safe crop-manifest/media-metadata importer without copying media.
2. Connect safe bridge output to local development adapters without putting it into a publicly deployable browser bundle.
3. Wire the reviewed high-confidence Skeleton geometry into selected-zone map rendering, then add spatial drag/drop, activity recipes, and the remaining durable coaching controls while keeping all data local/mock. Daily operations are now a local prototype slice but are not connected to a real feed.
4. Add private sync/media storage, Ready-state downloads, conflict handling, and backups only after the owner controls the backend.
5. Connect the bridge to live schedule/crawl inputs, send exports only to app-preview, run the two-week pilot, then perform the explicit cutover after acceptance checks pass.

## External prerequisites

These do not block most coding:

- Full Xcode 26.6 is installed and the local iPad simulator build works.
- An Apple Developer Program team is needed for TestFlight signing.
- A private managed backend project is needed for real sync/media deployment; the planned choice is Supabase.
- The owner will review the initial inferred mappings from schedule labels (`F4`, `TS`, `PB/HB`, and so on) to named gym zones. Inference must always remain advisory until confirmed.

## Working rules for the next session

- Keep all new project files inside this folder.
- Preserve the existing vault and automation during the pilot.
- Do not re-open high-level product choices already recorded above; use the ADRs as the source of truth.
- Favor safe, reversible migration steps. Never silently discard media, historical ideas, manually composed plans, or offline edits.
- When the owner supplies a gym-layout photo or mapping feedback, treat it as configuration/data—not as a reason to change the phase/zone model.
