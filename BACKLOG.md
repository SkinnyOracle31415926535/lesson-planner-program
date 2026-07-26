# Lesson Planner Program Backlog

## Items

### BL-0001 — INBOX
- Captured: 2026-07-21 15:16 America/Los_Angeles
- Request: i wnat to make pictures of all the mats to have like windows object vibes . like and then have an option to show the mats on the freeform if that makes sense
- Notes: 2026-07-25 — Correction: “freeform” means the Lesson Planner’s own visual setup canvas, not Apple Freeform. Replace the Apple Freeform workflow with editable Windows-style mat/equipment objects directly in Lesson Planner. Deferred until Ryan supplies the mat pictures.

### BL-0006 — DONE
- Captured: 2026-07-22 15:09 America/Los_Angeles
- Request: for the schedule repo as well as the lesson p-lanner repo i want an option to like create an alternate schedule. for example maybe if ts is open even if there is no collision i want to save it for that day/week number that that station is open if that makes sense
- Plan: 2026-07-25 — Add one browser-local versioned alternate-schedule overlay shared by Calendar and Lesson Planner, with exact-date default scope, optional recurring weekday/parity scope, source fingerprints, and an immutable authoritative base schedule.
- Notes: 2026-07-26 — Shipped across gymnastics-vault-calendar PR #21 and lesson-planner-program PR #14. Calendar saves browser-local exact-date or weekday/parity personal opening cards without changing the published schedule; Lesson Planner reads the shared contract as a read-only overlay, requires exact class/date/week scope, and marks mismatched, occupied, or Calendar-stale entries for review. Pages and live phone, iPad, and desktop validation passed.

### BL-0009 — PLAN READY
- Captured: 2026-07-25 12:39 America/Los_Angeles
- Request: I want to add that i want to make a feature where i can talk through chat gpt directly to my lesson planner program when invoking a skill and it like automatically makes the lesson plan for me do u understand me\
- Plan: 2026-07-25 — Add a trusted skill-to-planner draft contract with a visible preview and explicit Apply step; never put an API key in the browser or silently overwrite an existing lesson.

### BL-0010 — DONE
- Captured: 2026-07-25 12:43 America/Los_Angeles
- Request: default goal should be the one on my level 3 lesson plans
- Plan: 2026-07-25 — Add one editable general class-goal list, selectable per-class defaults, and bullet the selected goals on new lessons; seed Level 3 with its two current standard goals and preserve existing lesson goals.
- Notes: 2026-07-26 — Shipped in lesson-planner-program PR #9. Boys Level 3 and Sample Level 3 start new lessons with the two existing standard goals; the shared checklist supports add, edit, select, and per-class defaults, while explicit Apply appends bullets without replacing existing lesson text. Pages and live phone QA passed.

### BL-0011 — DONE
- Captured: 2026-07-25 12:46 America/Los_Angeles
- Request: it should keep track of odd and even weeks. for example next week is an even week
- Plan: 2026-07-25 — Anchor July 27–August 2, 2026 as Even, alternate by Monday-based week, and allow an explicit post-break Odd/Even re-anchor that governs following weeks until another override.
- Notes: 2026-07-26 — Shipped in lesson-planner-program PR #12. The shared rotation schedule now uses a continuous Monday-based Odd/Even cycle anchored to July 27–August 2 as Even, supports later shared re-anchors, safely migrates v1 storage to v2, and no longer asks for fifth-week confirmation when the cycle resolves it. All 146 tests, Pages deployment, and live phone, iPad, and desktop checks passed.

### BL-0012 — DONE
- Captured: 2026-07-25 12:47 America/Los_Angeles
- Request: lesson date box needs to be smaller so it doesnt collide witht he classtupe box
- Plan: 2026-07-25 — Visually test the current date/class layout at iPad and phone widths, then reduce only the date column enough to prevent overlap while preserving responsive stacking.
- Notes: 2026-07-25 — Shipped in lesson-planner-program PR #8. GitHub Pages and live phone, iPad, 801px, and desktop checks confirm the smaller date column with no overlap, overflow, or console errors.

### BL-0013 — PLAN READY
- Captured: 2026-07-25 12:48 America/Los_Angeles
- Request: make the announcements correspond to each class and be automatic based on the codex crawls
- Plan: 2026-07-25 — Convert sanitized crawl results into exact-class announcement suggestions, show their source and effective date, and require preview/apply before changing a lesson.

### BL-0014 — PLAN READY
- Captured: 2026-07-25 12:55 America/Los_Angeles
- Request: there should be a field for each idea called level where i check a box for all of the levels it applies for 3-10
- Plan: 2026-07-25 — Add sorted Level 3–10 checkboxes to idea creation/editing and the compatible storage, sync, import, and export contracts; leave legacy ideas unchecked instead of guessing.

### BL-0015 — DONE
- Captured: 2026-07-25 13:06 America/Los_Angeles
- Request: get rid of the freeform review tag on the ideas
- Plan: 2026-07-25 — Remove the visible Freeform Review tag while retaining its internal source provenance for compatibility and auditability.
- Notes: 2026-07-25 — Verified current source and deployed Lesson Planner contain no visible Freeform Review label; no code change was required.

### BL-0016 — PLAN READY
- Captured: 2026-07-25 14:01 America/Los_Angeles
- Request: in the reflections it should see my notes about $backlog 's and apply them to the corresponding vault. that way i can add things to the backlog through the reflection section during class easily
- Plan: 2026-07-25 — Extract only explicit $backlog marker text from lesson reflections/messages, preview the routed central and allowlisted project backlog entry, and apply both transactionally after approval without copying whole reflections.
