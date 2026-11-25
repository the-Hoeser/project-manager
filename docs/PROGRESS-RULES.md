# Progress Rules

## Primary source of truth
Explicit Markdown checklists in the configured plan file.

- `- [x]`, `- [X]`: completed
- `- [ ]`: incomplete
- Other bullet points: not counted unless explicitly configured later

## Calculation
`percent = round(completed / total * 100)`

Tracked repositories aggregate by task count, not by equal-project average, so plans with more explicit tasks carry proportionally more weight.

## Phases
Markdown headings divide tasks into phases. Tasks are assigned to the most recent heading. Headingless tasks fall into a default Tasks section.

## Logbook
Logbook entries are activity context only. They do not increment progress. A project can be active and have recent activity without its completion percentage changing.

## Manual configuration
When automatic file detection is ambiguous, let the user explicitly choose:
- Plan file
- Logbook file
- Optional ignore patterns
