# RepoPulse

A GitHub-connected project progress tracker. RepoPulse measures completion from repository Markdown plans and checklists—not AI guesses.

## Current status

RepoPulse now includes a working browser-side GitHub integration architecture, persistent local cache, private Gist configuration storage, and a deterministic Markdown checklist progress engine. OAuth setup and a build verification workflow are still pending validation.

### Implemented in this scaffold
- Cinematic light UI with warm ivory surfaces and Good Time-inspired pink / violet / cyan / amber color energy
- Overview dashboard with tracked-project cards and aggregate task stats
- Repository library and track/untrack selection
- Project detail with phase checklist; checkboxes update progress locally
- Development-log display and activity timeline
- Search projects and repository names
- Markdown checklist parser and percentage calculator
- Responsive layouts and reduced-motion support

### Live GitHub integration milestone
- GitHub OAuth Device Flow sign-in (no backend)
- Fetches public repositories for the connected account
- Track/untrack repositories from the real GitHub repo list
- Reads Markdown plan/checklist and logbook files from selected repos
- Recalculates progress locally from repository Markdown
- Private Gist configuration stores selected repository IDs
- Local cache restores instantly; sync runs on return, tab visibility, and every 30 minutes while open
- Live project checklist is read-only: RepoPulse never writes tasks back into project repositories

### Remaining
- Configure OAuth client ID and test actual sign-in in browser
- Add support for private repositories through an explicit permission decision
- Add tests and deploy

### Persistence model
- Browser `localStorage` caches dashboard state for fast reopening.
- A private GitHub Gist named `repopulse-config.json` persists tracked repository IDs across devices.
- Repository plan/logbook files stay in the original GitHub repositories; RepoPulse does not store project copies on a server.
- Sync is browser-side and recalculates progress deterministically.

## GitHub OAuth setup (backend-free)

1. Create a GitHub OAuth App in GitHub Settings → Developer settings → OAuth Apps.
2. Enable **Device Flow** for the OAuth App.
3. Copy its Client ID.
4. Create a local `.env` file from `.env.example` and set `VITE_GITHUB_CLIENT_ID`.
5. Run `npm install` and `npm run dev`.
6. In RepoPulse, click **Connect GitHub** and complete the code-based authorization.

This first implementation requests `read:user` and `gist` scopes. It can list and read public repositories and create/update a private Gist for configuration. It deliberately does **not** request the broad `repo` scope, so private repositories are not yet supported. OAuth access tokens are stored in browser local storage for return-session continuity; this is a backend-free trade-off, and users can disconnect to clear the saved token.

Create a production OAuth App with Device Flow enabled and configure its Client ID in the static hosting provider's build environment. Never add a client secret to frontend code.

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
