# Changelog

## 2026-07-19 — Coach-supplied station boards and iPad touch pass

- Imported the 24 exact station-board crops supplied by the owner into both the browser editor and the native iPad project. A direct board now takes priority over an inferred Skeleton/Freeform crop and is displayed at its original proportions without automatic re-cropping. Every browser board now fits inside one compact 16:10 planning canvas rather than claiming extra row height or width for its own source ratio; the original image letterboxes inside it. Its label coordinates are projected into the outer canvas, clamped on-screen, and given a small vertical lane when nearby labels would overlap. This covers F6, Weight Room, SR/PH, SR, PH, HB, PB, PB/HB, the three beam views, FX-only, FX/TS, F5, TS, Vault, the supplied pit/UB/strap combinations, Trampoline, Tumble Track, UB3, and Preschool.
- Expanded the station chooser while retaining existing local IDs, so older lesson snapshots still open. The newly supplied FX-only and F5 boards now replace their former source/neutral presentation; neither is filled with a look-alike image.
- Removed the inert title-bar `□` control that read as a zoom button, converted visible planning controls that previously had no action into working controls or clearly non-interactive status text, and added iPad-safe touch-target and text-input rules. The browser keeps normal accessibility zoom available; it simply avoids Safari's automatic input-focus zoom.
- Added [`docs/STATION_BOARD_REFERENCES.md`](docs/STATION_BOARD_REFERENCES.md) as the durable mapping from each owner-provided image to its intended station view.

## 2026-07-19 — Freeform-registered selected-zone map boards

- Added the clean `Skeleton freeform` gym art to both the Mac editor and iPad app. The owner-open Freeform board is the physical-geometry source of truth; PDF exports are not used to draw or crop equipment.
- Added `contracts/gym-layout-placement-anchors.json`: 201 durable one-item, short-label placement anchors. Unused anchors are invisible in normal plans and appear only during an explicit place action; an occupied short label opens the fuller drill/activity/reference detail.
- Replaced the web editor's generic fake station drawings with selected-zone layout boards. PB/HB, SR/PH, Rings, F1–F4, TS, and Vault crop the clean Freeform art; PB/HB and SR/PH remain composite views. The yellow-anchor grid is normalized into verified Freeform bounds when a PDF export placed labels outside the real zone (including F3). Unmapped web panels now use an explicitly neutral square layer, so even their proportions cannot imply PDF-derived physical geometry.
- Added the equivalent native iPad anchor registry, Skeleton-only crop behavior, compact label/detail flow, one-item capacity checks, local photo/video/reference placeholders, and focused map-boundary tests. TS and Vault are now directly verified against the live Freeform board; other PDF-only or not-yet-reviewed areas such as Strap Bar and beams use an honest neutral anchor layer rather than invented physical geometry. The one remaining PB shape ambiguity is marked as a compact `MAP DRAFT` cue in Edit mode only.
- Added `docs/GYM_LAYOUT_ASSET.md` to keep the live Freeform source, clean local raster, and separate placement-anchor layer intentional for future handoffs.

## 2026-07-19 — Planning interactions and bounded gym-map draft

- Reworked both local prototypes around schedule events with one or more ordered phases. Coaches can explicitly add a phase within the current event or transition early into a new event without silently altering an existing time range.
- Updated the Mac editor to use `LESSON PLANNER`, an animated 90s title treatment, a subtle pending-update shake, star-only gems, searchable browser-local idea creation, direct tap-to-place station/text targets, editable structured text-plan rows, and live attendance controls in both Edit and View.
- Added a generated, legacy-style text View for the Mac editor so selected cards and structured text cues become a readable run-of-show rather than a Freeform-only board.
- Updated the SwiftUI iPad prototype with the same event/phase distinction, direct placement, new-idea flow, star-only gems, live View-mode attendance, a chronological text lesson view, TS = Tumble Strip, F1–F4 floor-slice semantics, and reduced-motion-safe animation.
- Added `contracts/gym-map-semantics.json` and `docs/GYM_MAP_SEMANTIC_CONTRACT.md` for durable zone names, composite boards, overlap behavior, TS/Floor corrections, and selected-zone-only planning.
- Added `contracts/gym-layout-geometry-draft.json`, derived only from the owner-provided Skeleton Freeform board. It maps only high-confidence FX/F4–F1, SR/PH, HB, and the explicitly review-pending multi-shape PB area; the known-bad PDF export remains prohibited as a geometry source.

## 2026-07-19 — Foundation implementation started

- Created the Mac editor project and native SwiftUI iPad project without touching legacy vault automation.
- Added initial shared lesson-planner contract, local mock lesson data, and the first 90s/Freeform-inspired Mac planning screen.
- Added the Apple Watch companion idea as a future, non-v1 backlog item.
- Added a local-first iPad interaction slice: lesson-only snapshots, short coach notes, Ready/task state, sandbox persistence, and a lightweight View-mode run timer/status control.
- Built the initial iPad prototype with Xcode 26.6 and checked its layout in an iPad Air 11-inch simulator; the newer Swift source has additionally passed direct iOS type-checking.
- Added a tested read-only vault bridge and a sanitized fixture; it refuses vault output targets and excludes rosters, media bytes, raw update text, and absolute source paths.
- Added versioned contracts and safe demo fixtures for revision-scoped crawl updates and recurring/temporary task behavior.
- Added local library retrieval on both clients: manual gems, Relevant/Recent/Archive organization, search/filtering, lesson-local snapshot placement, and real local recency only after an idea is used.
- Added a hardened detailed drill-catalog export: 31 parent drills / 106 variants with safe coaching metadata and provenance tokens, while structurally excluding media, student fields, URLs, paths, and raw vault locations.
- Added a schedule-day resolver that produces one class-specific, advisory planning handoff from the sanitized schedule, treats schedule-defined openings as optional, and refuses to guess an unconfirmed fifth-week rotation.
- Added conservative, owner-review-only zone-board candidates from the sanitized schedule: known combined signatures are surfaced, parallel/disconnected bundles remain explicit, and unknown schedule tokens stay unresolved rather than becoming misleading setup zones.
- Added a metadata-only media/readiness contract for future private images, videos, and documents: captions, opaque provenance/storage IDs, integrity checks, local availability, and Ready/upcoming prefetch policy are modeled without importing a media byte, path, URL, or person record.
- Added an aggregate-only crop-manifest survey to size the media migration safely: it confirms 179 crop records and one supplemental collection while intentionally exporting no record metadata or media.
- Added local daily operations on both clients: recurring and finite temporary tasks with roll-forward visibility plus revision-scoped Important/Later/Reject update decisions. The demos explicitly have no email/crawl/calendar connection. On iPad, planned library snapshots become Recent only after an explicit local lesson completion.
- Added browser-local phase structure editing: create/delete a non-core phase, edit its label/time, choose Text/Visual/Mixed, and select only the relevant generic zone panels. Removing a panel parks its lesson-local contents for restoration rather than destroying it.
- Added native iPad phase structure editing: create/delete a non-core phase, edit its label/time, choose Text/Visual/Mixed, and select generic local-demo zone panels. Deselecting a panel preserves its lesson-local contents for restoration; text-only phases retain their selection without rendering panels.
- Added contract-shaped, static local schedule-advisory previews to both clients. They show date/group/rotation, warnings, rotation blocks, and optional openings separately, while explicitly never adding, editing, moving, or overwriting lesson phases.
- Added explicit snapshot destinations for multi-zone visual/mixed phases on both clients. A pending library card is not saved or placed until the coach chooses its station; text/no-zone phases remain deliberate text-cue snapshots. Spatial drag/drop within a real mapped layout remains later work.

## 2026-07-18 — Initial portable project packet

- Added a complete handoff, product specification, architecture, UX/content model, integration/migration guide, test/rollout guide, and architecture decision records.
- Recorded all product decisions made before implementation.
- Confirmed that no application code or existing vault files have been changed.
