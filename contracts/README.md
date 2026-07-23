# Shared Contracts

This folder holds the technology-neutral lesson-planner contracts shared by the vault bridge, Mac editor, and iPad app.

`lesson-plan.schema.json` is the initial vocabulary, not a production database schema. Keep compatibility deliberate: add fields additively, retain source revisions, and never mutate historical lesson snapshots when a library card or recipe changes.

`vault-import-summary.schema.json` defines the sanitized, read-only development handoff emitted by `bridge/vault_importer.py`. It intentionally excludes student records, raw weekly-note content, media bytes, and absolute source paths.

`drill-catalog.schema.json` defines the detailed, media-free drill and variant catalog emitted by `bridge/drill_catalog_exporter.py`. It is a whitelist-only bridge output: the catalog contains coaching metadata plus safe provenance tokens, but no student fields, media payloads, URLs, local paths, traversal references, or raw vault locations.

`schedule-day-plan.schema.json` defines the class-specific daily handoff emitted by `bridge/schedule_day_resolver.py`. It keeps schedule openings separate from planned rotations and represents a fifth-or-later month week as an explicit manual-confirmation state rather than choosing a rotation automatically.

`zone-mapping-candidates.schema.json` defines the conservative review queue emitted by `bridge/zone_mapping_candidates.py`. A candidate is evidence for an owner to confirm, edit, split, merge, or reject—not accepted layout configuration. All generated candidates explicitly remain non-configurable until that review occurs.

`media-asset-readiness.schema.json` defines metadata-only image, video, and document references plus their local availability, download, checksum, privacy classification, and Ready/upcoming-prefetch policy. It uses opaque source/storage IDs and deliberately contains no media bytes, filesystem paths, public URLs, raw locations, or person-identifying information. `media-assets.demo.json` is synthetic contract coverage only; it is not imported gym media.

`media-crop-manifest-survey.schema.json` defines an aggregate-only discovery report for the existing crop manifest. It is intentionally one step before importing asset metadata: it records only structure and capability counts plus a source revision, never a media record's text, caption, filename, path, URL, identifier, or bytes.

`incoming-update-feed.schema.json` captures only crawl entries that have already been normalized. It represents revision-scoped Important/Later/Reject decisions so the app can re-surface a later revision without making the user review an already rejected copy forever.

`task-template.schema.json` defines recurring and finite temporary task behavior, including a temporary task's roll-forward-until-completed rule.

`gym-map-semantics.json` is the durable gym identity registry: selectable destinations, landmark-only records, aliases, FX/F4–F1 relationships, and composite PB/HB and SR/PH views. `gym-layout-geometry-draft.json` is a bounded, review-pending normalized layout draft derived only from the owner-provided Skeleton Freeform board. Its currently confirmed physical areas include the floor slices, PB/HB, SR/PH, Tumble Strip, and Vault. It intentionally leaves uncertain zones unmapped rather than using the PDF export as physical truth.

`gym-layout-placement-anchors.json` is the owner-supplied `GYM LAYOUT 2.pdf` anchor layer: 201 normalized, one-item short-label positions and anchor-overlay crop viewports associated with the durable zone IDs. Its anchors stay hidden except while the editor is actively placing one idea or visual-text item. It is not a substitute for Skeleton Freeform physical geometry; consumers must keep the source PDF’s label positions separate from the gym’s visual backdrop.

The current SwiftUI and web prototypes use deliberately fake/demo lesson records while these contracts mature. Do not add a roster, identifiable media, API key, or raw email payload to a fixture merely to make a screen feel more complete.
