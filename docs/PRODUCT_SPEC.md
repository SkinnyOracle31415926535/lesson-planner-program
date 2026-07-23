# Product Specification

## Product goal

Create a private, iPad-first gymnastics lesson planner that lets one coach quickly build, run, revise, and preserve lessons without losing valuable drill ideas or rebuilding the same visual setup every week.

The system must combine the useful parts of the current workflow—schedule-aware automation, Freeform spatial boards, drill inspiration, recurring setup work, weekly/email updates, and stored media—into one searchable, offline-capable tool.

## Primary user and contexts

- **Owner/coach:** plans from a Mac at home and runs the lesson on a work iPad at the gym.
- **Planning context:** the coach selects a date/class, sees the real schedule, chooses optional openings, and builds only the relevant phases/zones.
- **In-gym context:** the coach needs a fast, glanceable lesson runner, not a dense editing screen.
- **Content context:** drills, activities, references, setup photos, perfect-demo videos, student names, attendance, and class/athlete notes are private internal material.

## Required outcomes

### Lesson creation

- Select a day and class from the schedule database.
- Start with an editable smart draft that fills schedule structure, class goals/reminders, recurring tasks, and a small relevant idea tray. It must **suggest, not place** lesson content.
- Support one or more time phases. A phase can be:
  - text-only;
  - visual with one or more station panels;
  - mixed text and visual;
  - a sequence such as drill first, activity second; or
  - multiple parallel lanes for simultaneous work.
- Treat schedule openings as optional availability hints. The coach must tap to add one; the app must never reserve or auto-insert it.
- If the schedule changes after planning begins, flag the difference and offer a manual apply/keep choice. Never overwrite manual text, layouts, cards, or safety decisions.

### Gym-space planning

- Maintain named physical zones separately from event/equipment labels. A gym can have multiple floor areas and combined or distinct apparatus areas.
- Start with one main layout. Its zones can include examples such as F1–F4, trampoline strip, straps bar, P-bars, high bar, rings, mushroom, vault, and form area.
- Map incoming schedule shorthand such as `F4`, `TS`, and `PB/HB` to named zones through a prefilled, owner-confirmed mapping table.
- A phase displays only the zones selected for that time frame. It can show multiple disconnected zones, such as F4 + trampoline strip, without showing the entire gym.
- Each visual zone panel supports drag/drop cards, photos, local video thumbnails, captions, text/sticky notes, arrows, markers, equipment/setup objects, resize, layer order, and grouping.

### Content library

- Use three content types: **drill**, **activity**, and **reference**. An activity can contain only written rules/explanation or a full visual setup.
- Preserve parent drills and variants. When a card enters a lesson, choose one or more variants and create editable lesson snapshots.
- When a visual or mixed phase has multiple selected zones, require the coach to choose the destination station for a snapshot. Never infer the first panel from storage or screen order.
- Store title, explanation/rules, event, levels, skills, apparatus/zone, setup/equipment, group size, safety requirements, media, source/provenance, status, captions, and tags.
- Provide consistent core filters plus freeform custom tags.
- Keep an Inbox, Active Shelf, and Archive. Only manual stars/pins promote a card to the Active Shelf. Archive is hidden from ordinary planning but always searchable.
- Rank suggestions using class/event/level fit, explicit stars, and completed-lesson history. A card becomes recently used only when its class is marked completed.
- Import all existing ideas and media, retain source links/crops, and warn about likely duplicates without deleting or merging automatically.
- Allow whole phase/circuit recipes to be saved and reused. Recipe edits affect future uses only; existing lessons remain snapshots.

### Media and references

- Capture/import photos and videos from iPad or Mac, add captions, crop/rotate images, attach local files or external references, and retain source metadata.
- Save private media locally on devices and relay private copies through sync storage.
- Guarantee local availability for Ready and near-future lessons; cache other assets when opened.
- Play local “perfect demo” videos full-screen in View mode and expose the normal iPad AirPlay/share route.

### View mode and end-of-class behavior

- Provide distinct Edit and View modes.
- View mode is optimized for coaching: phase navigation, clean station panels/text instructions, countdown timer, attendance, done/skip state, short notes, optional athlete-specific alternate assignments, and demo playback.
- Record attendance as present/absent/late plus a short note. Do not push attendance to Jackrabbit in v1.
- On completion, optionally collect a quick reflection: what worked, what to adjust, and a note. Completion updates recently-used history.

### Daily operations

- Support recurring tasks and temporary tasks scoped to all/chosen classes, an individual lesson, or a phase. Temporary tasks roll forward until completed.
- Receive structured results from existing email/weekly-note crawls; do not add a direct email login.
- Show a daily update inbox on first open of the day. The coach can mark an item Important, Later, or Reject.
- Important updates remain in review until manually turned into an announcement, task, or lesson note. Reject hides only that source revision, allowing future revised information to return.
- Announcements are always reviewed before inclusion in a lesson.

## Privacy and access

- The system includes student names, attendance, and identifiable student video. It is internal only.
- V1 deliberately uses no email/password/PIN. Access comes from a high-entropy owner link and device enrollment; the owner must not forward the link.
- Private assets must not use public buckets/URLs. The owner can rotate the link and revoke an enrolled device.
- Keep a recoverable version history and archive-first deletion model.

## Explicit v1 boundaries

- No built-in conversational AI or automatic lesson writer. Existing Codex crawls are inputs; the coach remains the final planner.
- No Apple Pencil/freehand canvas drawing in v1; use editable objects, text, media, and arrows instead.
- No external attendance-system posting in v1.
- No team/multi-user permissions, public sharing, or public student-media URLs.
- No automatic schedule booking or collision resolution. Conflicts/openings are advisory.
