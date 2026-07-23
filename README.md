# Lesson Planner Program

Private, local-first lesson planning for gymnastics coaching: an iPad-first app with a private Mac editor, a visual gym-zone planner, a drill/activity library, offline media, and a bridge to the existing gymnastics vault.

## Current status

**Foundation implementation is underway.** The project now has a local-only Mac editor, a native SwiftUI iPad prototype, shared contracts, and a read-only vault bridge. Both prototypes have a usable local library layer; the bridge can safely resolve a class day from the schedule snapshot and export detailed drill text/variants without media or roster data. No production sync, TestFlight build, or live vault write exists yet.

Start here on any new computer or Codex session:

1. Read [HANDOFF.md](HANDOFF.md).
2. Read [PROJECT_STATUS.md](PROJECT_STATUS.md).
3. Read the product, architecture, integration, UX, and rollout documents in [`docs/`](docs/).
4. Treat the decision records in [`docs/decisions/`](docs/decisions/) as intentional constraints unless the owner changes them.
5. Use [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the current implementation and validation state rather than assuming the handoff is documentation-only.

## Documentation map

| File | Purpose |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | Complete portable context for the next Mac/session. |
| [NEXT_SESSION_PROMPT.md](NEXT_SESSION_PROMPT.md) | Copy-paste instructions for a new Mac or Codex session. |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | What exists, what is next, and what is externally blocked. |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Local run, build, test, and safety-boundary commands. |
| [bridge/README.md](bridge/README.md) | Read-only import, drill-catalog, and schedule-day-resolver commands. |
| [contracts/README.md](contracts/README.md) | Versioned safe handoff contracts shared by the bridge and clients. |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | User-facing requirements and non-goals. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Chosen technical architecture and data model. |
| [docs/UX_AND_CONTENT_MODEL.md](docs/UX_AND_CONTENT_MODEL.md) | Screens, behaviors, visual boards, and content taxonomy. |
| [docs/INTEGRATIONS_AND_MIGRATION.md](docs/INTEGRATIONS_AND_MIGRATION.md) | Vault/schedule/crawl bridge and cutover plan. |
| [docs/TEST_AND_ROLLOUT.md](docs/TEST_AND_ROLLOUT.md) | Test coverage, TestFlight, pilot, and acceptance criteria. |
| [docs/IMPLEMENTATION_BACKLOG.md](docs/IMPLEMENTATION_BACKLOG.md) | Ordered engineering milestones and work items. |
| [docs/GYM_MAP_SEMANTIC_CONTRACT.md](docs/GYM_MAP_SEMANTIC_CONTRACT.md) | Durable gym-zone names, composite views, and the bounded Skeleton-based geometry handoff. |
| [docs/decisions/](docs/decisions/) | Architecture Decision Records (ADRs): the why behind the plan. |
| [CHANGELOG.md](CHANGELOG.md) | Material changes to this project packet. |

## Project boundary

Keep new app code, documentation, generated previews, local configuration, and future assets inside this folder:

`/Users/ryansadler/Documents/LESSON PLANNER PROGRAM`

Do **not** modify the existing gymnastics vault or its current automation during the build unless a documented bridge/cutover step explicitly calls for it. During the pilot, app exports go to a separate preview location.

## Transfer and versioning

iCloud makes this folder a good handoff medium between Macs, but it is not source control. Once implementation begins, initialize a private Git repository in this folder and make small, descriptive commits. Keep the Markdown documents in Git alongside the code; they are the durable decision history.
