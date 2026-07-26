# Copy/Paste Prompt for a New Mac or Codex Session

```text
Continue the Lesson Planner Program from the canonical GitHub checkout:
/Users/ryansadler/Developer/Live Pages/lesson-planner-program

Before working in a shell, resolve the root and stay inside it:
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

Before doing any work, read in this order:
1. README.md
2. HANDOFF.md
3. PROJECT_STATUS.md
4. docs/PRODUCT_SPEC.md
5. docs/ARCHITECTURE.md
6. docs/UX_AND_CONTENT_MODEL.md
7. docs/INTEGRATIONS_AND_MIGRATION.md
8. docs/TEST_AND_ROLLOUT.md
9. docs/IMPLEMENTATION_BACKLOG.md
10. docs/decisions/README.md and every ADR

Treat the documentation as the source of truth. Do not re-ask the owner for high-level product decisions already recorded there.

Implementation foundation already exists in this project folder: `web-editor/` is a local-only Mac editor with browser-local idea retrieval/creation, event blocks with ordered phases, direct tap-to-place station/text targets, live View-mode attendance, and a static read-only schedule-advisory sample; `ipad-app/LessonPlanner/` is a SwiftUI prototype with equivalent local persistence and event/placement/View behavior; and `bridge/` is a tested read-only import/export-resolver layer. `contracts/gym-map-semantics.json` preserves durable gym identities and `contracts/gym-layout-geometry-draft.json` contains only the high-confidence geometry derived from the owner-provided Skeleton Freeform board. `fixtures/drill-catalog.json` is a safe detailed catalog (31 parents / 106 variants) and `fixtures/schedule-day.demo.json` is an advisory schedule-day example. The clients do not import real vault fixtures. Continue from that state; do not restart or replace the recorded product decisions. Do not modify the existing gymnastics vault or its legacy automation during the build/pilot. Read the vault only through the bridge/import process.

The next engineering goal is to wire the bounded Skeleton-based geometry draft into a selected-zone map renderer without guessing the intentionally unmapped equipment, then add spatial drag/drop and the remaining local planning core in Milestone 2/3 of docs/IMPLEMENTATION_BACKLOG.md. Build against local/mock data before requiring TestFlight or production backend credentials. Xcode 26.6 is installed; current iPad source passed an iOS simulator type-check, while a full simulator `xcodebuild` still needs a successful rerun.

Important constraints: native SwiftUI iPad app + private Mac browser editor; 90s NGA visual language; private owner link/no PIN in v1; student data/media is sensitive and never public; phases show only chosen physical zones and can have multiple disconnected zones/parallel lanes; local-first media and explicit Ready state; legacy automation remains active during a two-week preview-only pilot.
```

## Moving to a new Mac

1. Clone the private GitHub repository at `/Users/ryansadler/Developer/Live Pages/lesson-planner-program` and open `README.md` from that clone.
2. Run `PROJECT_ROOT="$(git rev-parse --show-toplevel)"` from the clone before using project commands.
3. Do not transfer `.env`, API keys, signing certificates, or service-role credentials through the repository. Recreate secure local configuration separately.
4. iCloud can retain archives and non-code documents, but do not use it as a code workspace or source-control transport.
5. Give a new Codex session the prompt above. It will have the complete context even without access to this conversation.
