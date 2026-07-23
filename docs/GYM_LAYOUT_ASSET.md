# Gym layout visual asset

## Purpose

`GymLayoutSkeleton` is the clean physical gym diagram used behind the lesson-planning labels. It is intentionally separate from the placement-anchor data.

## Source and use

- Source of truth: the owner-open `Skeleton freeform` board in Apple Freeform.
- The local `Skeleton freeform.pdf` export was used only to create the clean
  raster asset from that board; it is not a competing layout source.
- Derived local assets:
  - `web-editor/public/gym-layout-skeleton.png`
  - `ipad-app/LessonPlanner/LessonPlanner/Assets.xcassets/GymLayoutSkeleton.imageset/gym-layout-skeleton.png`
- The source is used for physical geometry only. It does not define lessons, student information, or a placement action.
- Do **not** use `GYM LAYOUT.pdf`, `GYM LAYOUT ZONES.pdf`, or `GYM LAYOUT 2.pdf`
  to infer or redraw physical equipment. Those files may be used only for
  semantic names or the placement-anchor overlay they were explicitly created
  to communicate.

## Placement behavior

- The yellow-square reference (`GYM LAYOUT 2.pdf`) defines possible label anchors, not a normal visible overlay.
- Normal lesson view shows the gym image and only the compact labels that have actually been placed.
- Empty placement anchors appear only while the coach is actively placing an idea or visual-text item.
- A placed label is a compact summary; opening it shows the fuller lesson idea and its media/reference details.

## Rendering constraint

Show only the gym sections selected for the active phase. Composite views such as PB + HB and SR + PH are one combined viewport, not a new physical destination.

If a station has not yet been mapped to confirmed Freeform bounds, show its
placement labels on a neutral station layer until that mapping is reviewed.
Do not substitute a PDF-derived equipment crop just to make the panel look
complete.

## Direct station-board exception

When the owner supplies an exact cropped station board, that image supersedes
any automatic Skeleton/Freeform crop for that station. It is a presentation
source, not a new geometry measurement: display it at its own aspect ratio,
do not crop it again, and retain the yellow-anchor layer only for active
placement. A narrow board may sit inside a bounded letterbox frame for iPad
readability, but the inner image itself must remain complete and untrimmed.
The durable browser/native asset mapping is maintained in
[`STATION_BOARD_REFERENCES.md`](STATION_BOARD_REFERENCES.md).
