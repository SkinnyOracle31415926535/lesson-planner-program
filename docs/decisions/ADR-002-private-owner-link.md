# ADR-002: One-owner link access and private student media

**Status:** Accepted — 2026-07-18

## Context

The owner wants private link-only access with no account, password, or PIN in v1, while retaining student names, attendance, and identifiable demo videos.

## Decision

Use a high-entropy owner link to enroll browser/iPad devices into one private workspace. Exchange the link for device-scoped sessions, keep database/media access private, provide link rotation and device revocation, and never create public media URLs.

## Consequences

- This intentionally favors low friction over stronger per-user authentication.
- Anyone given the owner link can enroll, so it must not be forwarded.
- Backend policies and private storage are mandatory; no client service keys or public buckets.

