# ADR-003: Named physical zones and phase-local panels

**Status:** Accepted — 2026-07-18

## Context

Existing Freeform lessons organize drills by actual gym area. Schedule labels are not enough: there can be multiple floor areas, combined PB/HB areas, and disconnected simultaneous areas such as F4 + trampoline strip.

## Decision

Model physical `GymZone` records independently of event/equipment labels. Build one main reusable layout first, map schedule aliases through owner-confirmed configuration, and show only selected zones inside each phase. Allow a phase to include parallel lanes and text-only content.

## Consequences

- The planner preserves the coach’s real station-thinking instead of forcing a generic dashboard.
- Multiple layouts can be added later without redesigning lessons.
- The app must never infer that a schedule equipment token is automatically one visual panel.

