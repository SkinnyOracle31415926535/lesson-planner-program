# Project Status

**Updated:** 2026-07-19  
**Stage:** Foundation implementation in progress; local/mock data only.

## What is complete

- Product requirements, intentional decisions, architecture direction, migration strategy, and rollout criteria are documented.
- Existing vault structure, schedule database, automation boundaries, drill library, visual lesson boards, and Freeform pattern have been inspected.
- The project folder is established as a portable iCloud handoff packet.
- The generated app projects currently retain their own local Git metadata; a project-wide source-control topology has intentionally not been changed as an incidental setup action. See [`DEVELOPMENT.md`](DEVELOPMENT.md).
- A 90s NGA/Freeform-inspired Mac editor exists in [`web-editor/`](web-editor/) and has not been deployed. It uses mock data only and persists its lesson-local data in that browser's local storage. Its library supports title/tag search, Relevant/Recent/Archive shelves, star-only device-local gems, and browser-local idea creation. A selected idea is not saved until the coach selects an explicit text target or a single visible placement anchor. Normal visual plans show only their compact placed labels; tapping a label opens its fuller local detail/media placeholder. All 24 owner-supplied station boards—including FX-only and F5—are now presented directly at their source proportions rather than re-cropping the larger gym image, with selected zones only. Each direct board fits the same compact 16:10 plan canvas; the image letterboxes inside it, and projected labels are contained in the outer canvas rather than allowed to run off-screen. The PB multi-shape interpretation shows a compact `MAP DRAFT` cue in Edit mode only. Event labels can contain multiple ordered phases; `+ PHASE IN THIS EVENT` and `TRANSITION EARLY` intentionally have different scheduling effects. Edit mode exposes zone selection and plan editing; View mode hides those editor controls, renders a legacy-style text run-of-show, and keeps attendance live. The old inert header zoom-style control is gone; visible controls now either act or are rendered as status text, and coarse-pointer targets are sized for iPad use.
- A native SwiftUI iPad prototype exists in [`ipad-app/LessonPlanner/`](ipad-app/LessonPlanner/). It has an event-block model with ordered phases, direct idea placement into a selected station/text run-list, browser-equivalent new-idea and star flows, live attendance in View mode, and a chronological text lesson view. It uses TS = Tumble Strip and F1–F4 as horizontal floor slices. The same 24 supplied station boards, including FX-only and F5, are bundled as local app assets, take precedence over inferred crops, and retain their source proportions. Its registry contains all 201 current canonical anchors and preserves their relative neutral-layer positions for stations without a direct board. Its static schedule advisory remains advisory only and cannot create, move, or overwrite phases. It still uses local/mock data and has no live schedule, media, or remote sync connection.
- [`contracts/gym-map-semantics.json`](contracts/gym-map-semantics.json) now defines durable gym-zone identities, floor-slice ordering, TS versus Tumble Track, composite PB/HB and SR/PH boards, and overlap rules. [`contracts/gym-layout-geometry-draft.json`](contracts/gym-layout-geometry-draft.json) records only Skeleton-Freeform-derived geometry with explicit confidence/review limits; it does not use PDF visual coordinates.
- [`contracts/gym-layout-placement-anchors.json`](contracts/gym-layout-placement-anchors.json) records 201 one-item label positions from the owner’s yellow-square reference. It has explicit hidden-normal / active-placement-only rules and stays separate from physical geometry. [`docs/GYM_LAYOUT_ASSET.md`](docs/GYM_LAYOUT_ASSET.md) records the owner-open `Skeleton freeform` board as the visual source of truth and the local raster assets derived from it.
- The iPad prototype stores its current demo lesson, lesson-only snapshots, short coach notes, Ready state, task completion, manual gems, and completion-driven local recency in the app sandbox. Its library supports title/tag search plus kind/event/level filters and a separate archive shelf. It does not yet contain real student or vault data.
- Both prototypes now include a clearly marked local daily-operations slice: recurring and finite temporary tasks, visible roll-forward behavior, and a normalized update inbox with Important/Later/Reject decisions scoped to the exact revision. The iPad demo promotes a planned idea to Recent only after an explicit local lesson-complete action; it does not treat placement as use. Neither client reads email, calendar, crawl, or roster data.
- The read-only vault importer in [`bridge/`](bridge/) produces a sanitized schedule/drill/weekly summary in [`fixtures/vault-summary.json`](fixtures/vault-summary.json). Its tests verify no vault writes and reject an output target inside the vault.
- The bridge also exports [`fixtures/drill-catalog.json`](fixtures/drill-catalog.json): 31 detailed parent drills and 106 variants with coaching text and safe provenance tokens only. It excludes media bytes, roster/student records, URLs, paths, and raw vault locations.
- [`bridge/schedule_day_resolver.py`](bridge/schedule_day_resolver.py) turns that safe schedule summary into a class-specific day handoff, keeps schedule openings optional, and requires an explicit Odd/Even choice for a fifth-or-later calendar week rather than guessing.
- [`bridge/zone_mapping_candidates.py`](bridge/zone_mapping_candidates.py) creates an owner-review-only mapping proposal from the safe schedule summary. The current fixture contains 31 candidates, including the known combined signatures `PB/HB`, `SR/PH`, and `TR/TT`; every candidate remains non-configurable until the owner explicitly confirms, edits, splits, merges, or rejects it.
- [`contracts/media-asset-readiness.schema.json`](contracts/media-asset-readiness.schema.json) now defines how image/video/document metadata will represent captions, opaque provenance/storage references, checksum verification, local availability, and Ready/upcoming prefetch policy. [`fixtures/media-assets.demo.json`](fixtures/media-assets.demo.json) contains synthetic metadata only—no actual imported media, paths, URLs, or identifiable people.
- [`bridge/media_crop_manifest_survey.py`](bridge/media_crop_manifest_survey.py) has read one crop-manifest JSON only and produced an aggregate-only migration survey: 179 crop records plus one supplemental object collection. It copied no record text, captions, filenames, paths, URLs, identifiers, or media bytes.

## Current validation note

- The current SwiftUI source, including the selected-zone anchor registry and direct station-board registry, passed a direct iOS-simulator Swift type-check. Focused native map-boundary tests were added; a full simulator `xcodebuild` previously stalled while talking to the simulator, so it is not recorded as passing.
- The Mac editor's focused TypeScript syntax check, direct board-asset checks, local Next development server (HTTP 200), and a fresh `tsc --noEmit` pass completed after the station-board/touch changes. A new ESLint or bundled production-build pass is not recorded here. At an iPad-sized 1024×768 browser viewport, PB/HB and TS both render as complete uncropped art in equal 340×213 compact plan canvases; their labels were verified inside the canvas, non-overlapping, and separately tappable.
- Bridge contract JSON parses and its unit suite passed (12 tests) after the catalog, schedule-day resolver, zone-candidate, and crop-manifest survey work. Re-run the suite after any bridge/schema edit.

## Intentionally not started

- No production backend, device enrollment, media synchronization, TestFlight build, or export bridge exists yet.
- The Mac editor and iPad app currently use safe local/mock data. They do not import rosters, identifiable student media, or raw email data.
- No existing vault lesson files, Freeform boards, automations, or media have been altered.

## Next implementation milestone

Turn the foundation into a planning core:

1. Review the generated zone-alias candidates and add a safe crop-manifest/media metadata importer without copying media.
2. Wire normalized bridge output into private local development adapters without copying sensitive roster/media records or bundling real schedule fixtures into the browser client.
3. Owner-review and map the remaining Freeform zones (starting with Strap Bar, beams, and Tumble Track), then add an explicit move/reposition action without guessing their geometry.
4. Set up private source control intentionally around the two generated app repositories.
5. Add private sync/media only after an owner-controlled backend is available.

## External setup needed later

| Item | Needed for | Current state |
| --- | --- | --- |
| Full Xcode | Compile/run native iPad app | Installed: Xcode 26.6; local simulator build works. |
| Apple Developer Program team | TestFlight | Owner setup required. |
| Supabase project | Real remote sync and private media | Owner setup required; local mocks can proceed. |
| Work iPad/TestFlight | Device and offline-media validation | Needed after initial build. |
| Zone-map review | Final geometry and schedule-alias configuration | A bounded Skeleton-based draft is ready for owner review. |

## Product decisions still open

None that block local implementation. Configuration choices, such as exact zone alias mappings and class-specific templates, are intentionally deferred to onboarding screens rather than treated as architecture gaps.
