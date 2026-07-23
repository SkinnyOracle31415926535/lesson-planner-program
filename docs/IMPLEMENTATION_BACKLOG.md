# Implementation Backlog

This is the initial traditional engineering backlog. Keep it updated as work starts; move completed work into `CHANGELOG.md` and preserve decision changes through new ADRs.

## Milestone 0 — Foundation

- [ ] Initialize a private Git repository in this folder and make the documentation packet the first commit.
- [x] Create workspace structure for `ipad-app/`, `web-editor/`, `bridge/`, `contracts/`, and `fixtures/`.
- [ ] Add repository conventions, formatting, linting, test commands, and secret-handling instructions.
- [ ] Create versioned domain JSON schemas/types from `ARCHITECTURE.md`.
- [x] Build design tokens for the 90s NGA-inspired visual system.

## Milestone 1 — Import and bridge foundation

- [x] Create read-only Python bridge scaffolding.
- [x] Import active schedule DB metadata and grouped booking rows into a versioned sanitized fixture.
- [x] Import drill parent/variant metadata into the sanitized fixture.
- [x] Export a detailed, whitelist-only, media-free drill catalog with coaching text, variants, and safe source tokens.
- [x] Define private media metadata/local-readiness/Ready-prefetch contract without copying media bytes.
- [x] Survey crop-manifest structure/capabilities without copying media bytes or record metadata.
- [ ] Add crop-manifest, source-provenance, and media metadata references without copying media bytes.
- [ ] Import roster/class template fixtures without copying or changing original vault files.
- [x] Define a normalized `IncomingUpdate` feed contract with revision-scoped decisions; adapters for live weekly-note/email ledgers remain pending.
- [x] Resolve an advisory class-specific daily schedule handoff, keeping `open` blocks optional and requiring manual fifth-week confirmation.
- [x] Produce conservative inferred schedule-label-to-zone mapping candidates for owner review; all remain non-configurable until confirmed.

## Milestone 2 — Local lesson planning core

- [ ] Complete local/mock persistence and version-history behavior. The iPad and browser prototypes now persist local lesson edits, snapshots, and library preferences; revision history is not built.
- [ ] Build classes/calendar/day selection and smart-draft structure. A bridge-level safe day resolver is complete; both clients now show a static contract-shaped advisory preview, but neither connects to real schedule data or may auto-apply it to phases.
- [ ] Build library Inbox, Active Shelf, Archive, filter/search, star, recent-use, variants, and sources. Both prototypes now have local retrieval slices, but real imported catalog data and sources are not wired into either client.
- [ ] Build Lesson/Phase/Lane data and text-only/mixed visual phases. Both prototypes now have event blocks with ordered phases, explicit add-within-event versus transition-early behavior, title/time/mode editing, selected-only station rendering, parked-zone preservation, structured text plans, direct tap-to-place targets, and legacy-style View output. Confirmed selected zones render against the owner’s Freeform geometry; spatial drag/drop, parallel lanes, reusable recipes, and mapping of every remaining gym area remain pending.
- [ ] Build reusable phase recipes with snapshot semantics.
- [ ] Build configurable class templates, tasks, announcements, and optional athlete notes. Local mock tasks/update decisions now demonstrate recurrence, finite roll-forward, and revision-scoped review; real template/feed adapters remain pending.

## Milestone 3 — Visual editor and View mode

- [ ] Implement zone panels, canvas-object manipulation, layers/groups, text, sticky notes, arrows, media, and setup markers.
- [ ] Implement only-selected-zones rendering and parallel lanes. Both local prototypes render only selected station panels; confirmed zones use their clean Skeleton Freeform crops, while zones not yet mapped stay neutral rather than borrowing the broken PDF geometry. A parallel-lane data model and the remaining zone mappings are pending.
- [ ] Build Edit/View mode switch and quick-run coaching controls. Edit/View controls and generated text View exist; run timers and phase complete/skip remain pending.
- [ ] Add attendance, timers, phase complete/skip, quick notes, safety acknowledgment, and optional reflection. Live attendance and short notes exist locally; the remaining controls are pending.
- [ ] Add full-screen local demo playback and standard AirPlay/share entry point.

## Milestone 4 — Private sync and media

- [ ] Provision Supabase development project with private tables, private storage, row-level policies, and backup plan.
- [ ] Implement owner-link enrollment, device session, link rotation, and device revocation.
- [ ] Add draft auto-sync, Ready publication, download readiness, media checksums, and background prefetch.
- [ ] Implement offline operation log and manual conflict review.
- [ ] Verify no public media URLs or secret leakage.

## Milestone 5 — Vault preview and pilot

- [ ] Build Markdown/HTML preview exporter under `app-preview/` only.
- [ ] Compare preview output against legacy lesson output across all current classes.
- [ ] Configure Xcode, iPad signing, and internal TestFlight.
- [ ] Execute two-week pilot, record defects, and verify acceptance criteria.
- [ ] Perform owner-approved manual cutover and switch static exports to the vault.

## Definition of done for v1

All acceptance criteria in [TEST_AND_ROLLOUT.md](TEST_AND_ROLLOUT.md) pass during the pilot, the owner explicitly approves cutover, and the legacy system has not been overwritten during evaluation.

## Future backlog — not part of v1

- [ ] **Apple Watch companion:** show the currently Ready phase at a glance with timer, next-step/safety cue, and simple done/skip controls. It is not a Watch-based visual editor, media player, or replacement for the iPad.
