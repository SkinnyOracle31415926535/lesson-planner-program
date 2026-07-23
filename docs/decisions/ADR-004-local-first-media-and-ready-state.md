# ADR-004: Local-first media and explicit Ready state

**Status:** Accepted — 2026-07-18

## Context

The coach needs videos/photos to load quickly at the gym and wants to edit the same lesson from the home Mac. Devices can be offline, and edits must not disappear.

## Decision

Keep local media/data caches on devices, synchronize private copies through the backend, and use an explicit `Ready` lesson version. Ready and near-future lesson media are guaranteed local; other library media caches when opened. Offline edit collisions show both changes for manual resolution.

## Consequences

- Drafts may auto-sync, but View mode remains protected from accidental unfinished edits.
- A Ready indicator must include media readiness, not only text/data sync.
- Conflict review and version history are required; last-write-wins is prohibited.

