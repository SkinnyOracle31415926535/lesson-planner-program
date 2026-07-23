# ADR-006: Normalized vault bridge and manual pilot cutover

**Status:** Accepted — 2026-07-18

## Context

The current vault automation generates Markdown plans and crawls weekly/email context. It must keep running while the new system is proven, and manual lesson work must not be overwritten.

## Decision

Build a read-only normalized bridge from the schedule database and crawler ledgers into the app. During a two-week pilot, write app exports only to this project’s `app-preview/` directory. Cut over manually after acceptance; then export static Markdown/HTML snapshots back to the vault.

## Consequences

- The app consumes structured inputs rather than parsing rendered legacy plans.
- Existing automation remains untouched during the pilot.
- Schedule changes, collisions, openings, and ambiguous updates remain advisory/reviewable rather than automatic destructive changes.

