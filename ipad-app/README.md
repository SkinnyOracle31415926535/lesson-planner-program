# Lesson Planner iPad App

`LessonPlanner/LessonPlanner.xcodeproj` is the native SwiftUI iPad-first prototype.

It currently has local demo data plus app-sandbox persistence for event blocks with ordered phases, Ready state, tasks, editable run-list text, attendance, and lesson-local idea snapshots. Edit mode clearly separates **+ Phase in Event** from **Transition Early**, so a coach can either stay in one event or create a distinct next event without silently changing times. Selecting a library idea enters placement mode: the coach explicitly taps the text list or an empty highlighted anchor; each anchor holds one compact label, and tapping a placed label opens its fuller detail plus local photo/video/reference placeholders. The clean gym art comes only from the owner’s `Skeleton freeform` board. PB/HB, SR/PH, Rings, F1–F4, TS, and Vault use verified selected-zone crops; Strap Bar and other unmapped areas remain neutral anchor panels rather than borrowing geometry from a bad PDF render. The native registry has all 201 canonical placement anchors, so additional approved zones do not require a second anchor catalog. F1–F4 are ordered horizontal floor slices and TS is Tumble Strip. View mode generates a chronological run-list while retaining editable attendance. It also has a static, read-only schedule-advisory sample that keeps optional openings separate and cannot change lesson phases. It does not yet contain real roster, media, vault data, a live schedule connection, or a final gym-map layout.

## Open and run

1. Open `LessonPlanner/LessonPlanner.xcodeproj` in Xcode.
2. Select an iPad simulator or connected iPad.
3. Run the `LessonPlanner` scheme.

For a command-line build, first list available destinations with `xcrun simctl list devices available`, then use an iPad destination:

```bash
xcodebuild \
  -project LessonPlanner/LessonPlanner.xcodeproj \
  -scheme LessonPlanner \
  -destination 'platform=iOS Simulator,name=iPad Air 11-inch (M4)' \
  build
```

TestFlight, real device signing, media storage, sync, and production data are deliberately not configured yet.
