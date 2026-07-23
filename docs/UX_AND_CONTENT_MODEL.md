# UX and Content Model

## Design language

- 90s internet/control-panel atmosphere, inspired by the existing NGA Routine Builder rather than generic productivity software.
- Dark navy background; bright cyan, electric blue, green, and yellow accents; beveled rounded panels; compact but legible control groups.
- Large touch targets and clear state labels on iPad. Dense editing controls belong on the Mac editor or Edit mode, never the normal coaching screen.
- Preserve Freeform’s collage/station-planning character while making cards searchable, reusable, and safe to edit.

## Main navigation

1. **Today / Calendar** — scheduled classes, readiness state, alerts, and daily update badge.
2. **Lesson** — the selected date/class, switching between Edit and View.
3. **Library** — Inbox, Active Shelf, Archive, filters, search, import, and media.
4. **Recipes** — saved phase/circuit templates.
5. **Updates** — crawl-derived daily inbox.
6. **Settings** — class templates, layout/zone mappings, device/media state, link rotation, backup/export status.

## New lesson flow

1. Choose a date and scheduled class.
2. Load schedule blocks, class template, recurring tasks, existing announcements, and an optional-openings tray.
3. Display suggested starred/recent/relevant library content, but do not put it into phases automatically.
4. Add or edit phases. Each phase can link to one or more scheduled blocks and choose its own visual/text/mixed treatment.
5. For a visual phase, select only the relevant named zones. Create one or more parallel lanes where simultaneous work matters.
6. Add drill/activity/reference snapshots, free text, media, and setup objects. When more than one visual zone is active, choose the destination station explicitly; never silently choose the first panel. Reorder sequence segments as needed.
7. Resolve visible safety checklists, confirm readiness, then mark Ready to publish/download the in-class version.

## Phase model

### Text-only phase

Use ordered text segments for simple event plans, game rules, coaching cues, or a drill-to-activity sequence. Text blocks can later be saved as a library item or recipe when the owner chooses.

### Visual phase

Display one Freeform-style panel per selected physical zone. A zone is not merely an event label: it is a reusable named part of the actual gym. Panels contain independently positioned objects and can coexist in parallel lanes.

### Mixed phase

Show text/cues alongside selected zone panels. This is the default for a visual station setup that also needs an explanation, fallback rule, or rotation sequence.

## Canvas objects

| Object | Behavior |
| --- | --- |
| Drill/activity snapshot | Opens lesson-local instructions, selected variant, media, safety, and notes. |
| Reference/demo | Opens a local video, image, document, or external URL. |
| Photo/video setup asset | Supports caption, crop/rotate/thumbnail, placement, and layer order. |
| Text/sticky note | Fast coaching cue, conditional rule, rep target, or setup warning. |
| Arrow/line | Shows sequence, rotation, direction, or relationship. |
| Marker/person/equipment | Visual placement and setup annotation. |

Objects are always lesson-local unless explicitly saved back to a library item or recipe.

## Library behavior

- **Inbox:** uncategorized/new import ideas awaiting review.
- **Active Shelf:** manually starred or pinned gems; primary planning surface.
- **Archive:** all retained history, hidden by default but searchable/filterable.
- **Recent:** ordered only by content used in completed lessons.
- **Variants:** shown beneath a parent drill. A planner chooses one or more at placement time.
- **Source drawer:** displays original Freeform board/crop, file/source path, provenance, captions, and import context without cluttering the main card.

## View mode

- Focus on the current phase; hide editing chrome and unrelated zones.
- Allow previous/next phase, timer, attendance, phase done/skip, quick note, and full-screen demo playback.
- Keep safety notes prominent, even in View mode.
- Support a concise alternate assignment/note for named athletes while keeping the main lesson group-oriented.

## Daily operations

- **Tasks:** recurring tasks instantiate by scope; temporary tasks move to the next matching class until done. The task history remains visible.
- **Updates:** first open each day shows an inbox summary. Important/Later/Reject are reversible and auditable; only manual actions create lesson announcements/tasks/notes.
- **Completion:** a compact reflection prompt records worked/adjust/notes. It is optional to avoid paperwork fatigue.
