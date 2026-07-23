# Test Plan and Rollout

## Test layers

### Domain and bridge tests

- Import schedule database fixtures, preserve source revisions, exceptions, calendar-week context, openings, and collision warnings.
- Verify combined schedule labels map through explicit zone aliases rather than accidental string matching.
- Verify task recurrence, selected-class/phase/lesson scope, and temporary-task roll-forward behavior.
- Verify parent/variant selection creates independent lesson snapshots.
- Verify class template inheritance, optional athlete notes, attendance, reflections, and completed-lesson usage ranking.
- Verify incoming update revision handling: Important is manual, Reject applies only to that revision, and ambiguous inputs remain in review.
- Verify static exports include the selected Ready lesson revision and never alter legacy plan files during the pilot.

### iPad and browser behavior tests

- Create text-only, visual-only, and mixed phases.
- Render a phase with one zone and one with disconnected zones such as F4 + TS; ensure unrelated gym areas do not appear.
- Render simultaneous parallel lanes and a drill-to-activity sequence.
- Add/move/resize/layer visual canvas objects and save/reopen exact layout state.
- Filter/search Active Shelf vs Archive, choose variants, preserve source/provenance, and save a phase recipe.
- Exercise Edit-to-Ready-to-View lifecycle, safety acknowledgment, timer, attendance, phase status, quick note, and reflection.
- Play a local demo video full-screen and use the standard AirPlay/share route.

### Sync, offline, and privacy tests

- Verify a Ready lesson and its media open while the iPad is offline.
- Verify Ready/near-future predownload state, failed-download visibility, and retry behavior.
- Modify drafts on Mac and iPad while disconnected; test non-overlap merge and side-by-side manual conflict resolution.
- Verify new Ready publication supersedes the in-class version only when locally complete.
- Verify all media storage is private, unauthenticated requests fail, link rotation prevents future enrollment by the old link, and revoked devices lose new access.
- Verify backup/history restores a deleted/archived lesson or media record without breaking source provenance.

## Acceptance criteria for the two-week pilot

The owner can successfully:

1. Create a lesson for every currently taught class from the live schedule.
2. See only relevant zones in every visual phase, including multiple disconnected zones and parallel work.
3. Find starred/recent/class-relevant drills without browsing the whole archive.
4. Take attendance, run a plan, play a demo offline, and finish a quick reflection on the work iPad.
5. Edit a lesson on the home Mac, mark it Ready, and see the correct version/media on the iPad after sync.
6. Receive and manually process daily crawl updates without automatic announcements or lost rejections.
7. Keep the legacy automation intact while app-preview exports remain isolated.
8. Recover a prior lesson/version and confirm no student media is public.

## Rollout sequence

1. Build local fixtures, importer, web editor, native app shell, and core tests.
2. Configure private Supabase development project and private storage access policies.
3. Install full Xcode, configure signing, and test on the work iPad.
4. Distribute internal TestFlight build.
5. Run the two-week parallel pilot using app-preview exports.
6. Review acceptance results with the owner and resolve defects.
7. Perform the manual cutover, enable canonical vault exports, and preserve the old system as read-only history.

## Deployment prerequisites

- Full Xcode installed and initialized on the development Mac.
- Apple Developer Program membership/team available for TestFlight.
- Private Supabase project created with backup/storage budget appropriate for local video sync.
- Work iPad able to install TestFlight, periodically sync, and retain sufficient local storage for Ready/upcoming media.

