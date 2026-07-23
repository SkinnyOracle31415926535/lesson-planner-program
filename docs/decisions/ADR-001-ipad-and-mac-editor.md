# ADR-001: Native iPad app plus private Mac editor

**Status:** Accepted — 2026-07-18

## Context

The coach primarily teaches from a work iPad but needs to prepare/repair a lesson from a home Mac when away from the iPad.

## Decision

Build a native SwiftUI iPad application for in-gym use and a private browser editor for the Mac. Both edit the same synced lesson data. The Mac editor is not a remote-control screen for the iPad.

## Consequences

- The iPad can provide strong offline media and touch-first coaching behavior.
- The Mac can provide a larger visual-editor surface without requiring the work iPad.
- Both clients need shared, versioned domain contracts and explicit sync/conflict behavior.

