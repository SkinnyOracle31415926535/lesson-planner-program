# Lesson Planner Mac Editor

This is the private Mac-oriented lesson-planning editor. It is a local-only prototype at this stage: it contains mock data, makes no network-backed data writes, and must not be deployed until the private owner/device access model is implemented.

## What it currently demonstrates

- The intended 90s NGA Routine Builder chrome and bright Freeform-style zone boards.
- Schedule phase selection with text-only, mixed, and visual phase examples.
- A static local schedule-advisory sample with rotation blocks and optional openings kept separate; it cannot add, edit, or overwrite a phase.
- Only the selected zones for a phase, including disconnected areas such as PB/HB + trampoline strip.
- Explicit destination-zone selection before a library snapshot is saved into a multi-zone visual/mixed phase.
- Edit/View modes, Active Shelf cards, safety, task, attendance, and Ready-state affordances.

## Local development

```bash
npm install
npm run dev
npm run build
```

Do not connect D1, R2, a public deployment, account login, or real student/vault data in this project without first implementing the private access and media safeguards in the root architecture documents.
