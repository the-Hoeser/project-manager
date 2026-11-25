# RepoPulse Research & Build Log

## 2026-11-25 — Initial concept
- Goal: monitor only selected active repositories from a larger GitHub account.
- User selects which repositories to track.
- Project progress should be derived from plans, Markdown checklists, and logbooks.
- Hard requirement: no AI APIs and no AI agent.
- Progress should be deterministic and explainable.
- Design direction: smooth, light, cinematic; inspired by *Good Time* color grading, not dark mode.

## Initial implementation
- Created a React + TypeScript + Vite scaffold.
- Added sample projects and interactive tracked/untracked state.
- Implemented Markdown checklist parsing and task-weighted progress.
- Added detail view with interactive checkboxes.
- Added project activity display from sample logbook entries.

## Next
- Integrate GitHub securely with read-only repository and contents permissions.
- Replace sample projects with authenticated repository data.
