# Architecture

## Chosen shape

```text
Mac browser editor ─┐
                    ├── Private sync service ── private media storage
Native iPad app ────┘             ▲
                                 │
                 Vault bridge ───┴── schedule DB, crawl feeds, exports
```

- **iPad app:** native SwiftUI, optimized for touch and offline use.
- **Mac editor:** private browser application, implemented in TypeScript/React, for remote lesson creation and visual editing.
- **Sync service:** managed Supabase project with Postgres, Realtime, Edge Functions, and private object storage. Use row-level policies on every exposed table and private media bucket. Official references: [Swift client](https://supabase.com/docs/reference/swift/introduction), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [storage access control](https://supabase.com/docs/guides/storage/security/access-control).
- **Vault bridge:** a Python command/service alongside the existing automation. It is the only component that reads the local iCloud vault and writes static exports.

## Access model

There is one private workspace and no user-facing account screen in v1.

1. The owner opens a high-entropy workspace link in the browser or uses it to enroll an iPad.
2. A server function exchanges that capability for a device-scoped session; the raw link is not repeatedly used as an API credential.
3. Every client query and media request is scoped to that workspace/device through server-side authorization and row-level policies.
4. The owner can rotate the workspace link and revoke enrolled devices. Rotation invalidates new enrollment through the old link.

This is intentionally lower-friction than an account/PIN system, but it is still sensitive data. Never use public storage buckets, permanent public asset URLs, or client-exposed service keys.

## Local-first behavior

- The iPad owns a local SQLite-backed content cache and a protected local media store.
- The browser maintains a local draft cache for transient offline work.
- Draft edits sync automatically when a network is available.
- `Ready` creates an explicit immutable lesson version for in-class use. Marking a revised plan Ready replaces the published version only after required media is confirmed locally available.
- Ready and near-future lesson media are proactively downloaded to the iPad. Other media downloads/caches when opened.
- Offline edits carry a base revision. Non-overlapping edits merge; overlapping edits create a reviewable conflict showing both versions. Never silently apply last-write-wins.
- Keep server revisions and recoverable archives for lessons, library records, and media metadata.

## Core domain contracts

These contracts should live in a shared, versioned schema package before UI work begins.

| Contract | Key responsibilities |
| --- | --- |
| `Workspace` / `DeviceEnrollment` | Private workspace, active device sessions, revocation, link rotation. |
| `ClassProfile` / `ClassTemplate` | Class metadata, required sections, goals, fixed reminders, schedule identifiers, roster association. |
| `Student` / `AttendanceEntry` | Private roster data, attendance status/note, optional athlete-specific lesson notes. |
| `GymLayout` / `GymZone` / `ScheduleAlias` | Base gym layouts, named physical zones, display geometry, schedule-label mappings. |
| `LibraryItem` / `LibraryVariant` | Drill/activity/reference data, parent/variant relationship, tags, safety, source, media, state, usage data. |
| `MediaAsset` | Object reference, checksums, local availability, thumbnail/caption/orientation, privacy and provenance. |
| `PhaseRecipe` | Reusable template containing selected zones, lanes, station objects, timing, and text. |
| `Lesson` / `LessonPhase` / `LessonLane` | Scheduled date/class, imported schedule revision, selected zones, text/visual/mixed content, status, safety/readiness. |
| `CanvasObject` | Lesson-local visual object: snapshot card, photo, video, text, sticky note, arrow, marker, equipment object; position, size, layer, group. |
| `TaskTemplate` / `TaskOccurrence` | Recurrence, class/phase/lesson scope, roll-forward state, completion history. |
| `IncomingUpdate` / `Announcement` | Crawl source/revision, scope, action state, manual conversion into lesson content. |
| `Revision` / `Conflict` | Change log, published Ready versions, manual conflict-resolution record. |

## Lesson lifecycle

```text
draft → ready → in_class → completed → archived
          ↘ revised draft → ready
```

- `draft`: editable and automatically synced.
- `ready`: explicitly published, safety-confirmed, and media-verified for iPad use.
- `in_class`: the View-mode run session; it can record attendance, phase status, timers, and notes.
- `completed`: reflection is optional; used library items become recent.
- `archived`: historical, read-only by default but recoverable/exportable.

## Bridge interfaces

The bridge must use versioned JSON contracts, not fragile parsing of rendered Markdown.

- **Schedule input:** schedule source ID/revision, class/time blocks, labels, availability/openings, collision warnings, exceptions, and calendar-week rule context.
- **Update input:** stable source ID, source revision, title/detail, scope, dates/deadline, confidence, status, and suggested action. Ambiguous input stays `needs_review`.
- **Export output:** a static lesson snapshot containing schedule, announcement, goals, plan text, visual-panel representation/links, tasks, attendance, and reflection. During the pilot it targets app-preview only.

### Local development bridge chain

```text
read-only vault schedule DB ──> vault-summary.json ──> schedule-day-plan.json
read-only drill_ideas.json ──────────────────────────> drill-catalog.json
```

- The vault summary is a sanitized schedule/aggregate handoff, not a client data store.
- The day resolver requires a selected class/group and keeps schedule openings separate from rotations. It provides a manual-confirmation state for an ambiguous fifth-or-later calendar week.
- The detailed drill catalog is whitelist-only coaching metadata. It has no media bytes, student records, public URLs, local paths, or raw vault location.
- The media readiness manifest is metadata-only. It stores opaque IDs, caption/duration, checksum and local-readiness state, delivery tier, and privacy classification; device paths, actual bytes, and public URLs remain outside the contract.
- Until private owner-link/device authorization exists, real bridge fixtures remain project-local development artifacts and are not bundled into a deployable browser client.

## Design system implementation

Define shared named tokens for navy backgrounds, cyan/blue/green/yellow accents, warning/safety colors, beveled panel treatment, dense grid spacing, and accessible touch targets. The web and SwiftUI implementations may use platform-native components but must consume the same semantic token names and status colors.
