# RepoPulse

A GitHub-connected project progress tracker. RepoPulse measures completion from repository Markdown plans and checklists—not AI guesses.

## Current status

This repository currently contains the **front-end prototype** with local sample repositories and a deterministic Markdown checklist progress engine.

### Implemented in this scaffold
- Cinematic light UI with warm ivory surfaces and Good Time-inspired pink / violet / cyan / amber color energy
- Overview dashboard with tracked-project cards and aggregate task stats
- Repository library and track/untrack selection
- Project detail with phase checklist; checkboxes update progress locally
- Development-log display and activity timeline
- Search projects and repository names
- Markdown checklist parser and percentage calculator
- Responsive layouts and reduced-motion support

### Not connected yet
- GitHub authorization and repository discovery
- Fetch real repository Markdown and commit activity
- GitHub-backed cross-device configuration persistence
- Automatic refresh and cache invalidation
- Test suite and deployment

### Persistence milestone
- Project tracking selection and current checklist state now restore from browser `localStorage` after reload/revisit on the same browser/device.
- This is a local persistence step only; it is not yet GitHub-backed and does not yet synchronize across devices.
- Planned persistent cloud configuration: a small private GitHub-hosted JSON data file (or private Gist), with the user's GitHub account as the storage provider. No RepoPulse-owned database or file storage.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Progress calculation

The parser reads Markdown checklist items:

- `- [x] Completed` counts as complete
- `- [ ] Pending` counts as incomplete

Percentage is `completed tasks / all tasks * 100`, rounded to the nearest integer. Progress is task-weighted across all tracked repositories. Logbook entries are shown as activity, but do not affect the completion percentage.

## GitHub integration plan

Use least-privilege authorization: read repository metadata and contents only. RepoPulse does not need write access to code or repository settings.

Recommended phases:
1. GitHub authorization and repository listing
2. Repository selection and local persistence
3. File detection (PLAN.md, plan.md, ROADMAP.md, TODO.md, TASKS.md, README.md, configured logbook)
4. Markdown parser and phase breakdown
5. Refresh and activity metadata
6. Secure deployment with OAuth secrets stored server-side

## Design direction

A light, smooth, cinematic product interface inspired by the color grading of *Good Time* (2017), translated into warm ivory surfaces, blush pink, coral, violet, cyan, and amber accents. The design uses restrained gradients, soft glass surfaces, gentle transitions, and clean typography—no dark dashboard theme.

## Privacy / no-AI promise

No AI APIs or agents are used. Progress is computed locally in code from explicit Markdown task status. Repository content is not sent to an AI service.
