# Vilica read-only progress endpoint

Vilica exposes a Netlify Function:

`GET /.netlify/functions/project-progress?repo=owner/name&branch=optional`

## Contract

The endpoint returns repository identity, selected/default branch, detected plan/log file paths, the Markdown-derived progress summary, phase checklist details, a short logbook, optional latest commit SHA, source timestamp, and a `readOnly: true` marker.

The progress object is calculated by importing the same `parseMarkdownPlan` and `progressFromPhases` functions that the Vilica dashboard uses. This prevents the HackTony integration from inventing a separate progress percentage.

## Access and privacy

- Public repositories only, consistent with the current Vilica GitHub scope and repository picker.
- No GitHub token is accepted or shared. The function uses unauthenticated reads from the public GitHub API.
- Only GET and OPTIONS are accepted. The endpoint does not write to GitHub or Vilica storage.
- CORS is limited to `https://hacktony.netlify.app` and local development origins `http://localhost:5173` and `http://127.0.0.1:5173`.
- Responses are briefly cached. GitHub unauthenticated API rate limits apply.

## Response fields

- `repository`, `repositoryUrl`
- `branch`, `defaultBranch`
- `planPath`, `logPath`, `planAvailable`
- `progress.done`, `progress.total`, `progress.percent`
- `phases`, `logbook`
- `latestCommitSha`, `repositoryPushedAt`, `generatedAt`
- `source`, `readOnly`, `treeTruncated`

## HackTony usage

HackTony calls this endpoint after the user saves a Vilica app URL and links a public GitHub repository to a hackathon. It sends only the repository full name and optional branch. It does not send an authentication token. HackTony displays the returned progress as a read-only summary, while the complete plan, task list, and project editing remain in Vilica.

The endpoint requires Vilica to be deployed with Netlify Functions enabled. Until then, HackTony can keep repository links and deep links but shows progress as unavailable.
