# Vilica Roadmap

## 1. Prototype
- [x] React + Vite scaffold
- [x] Cinematic light visual direction
- [x] Dashboard with sample data
- [x] Project selection interactions
- [x] Markdown checklist parser
- [x] Phase/task detail screen
- [x] Local task toggle interactions
- [x] Activity and logbook sample view
- [x] Responsive layout

## 2. GitHub integration
- [ ] Decide OAuth app vs GitHub App (recommend GitHub App)
- [ ] Create secure server-side authorization callback
- [ ] Store access tokens securely server-side
- [ ] Fetch authenticated user's repositories
- [ ] Repository search and selection
- [ ] Persist tracked repositories

## 3. Real repository progress
- [ ] Detect candidate plan and logbook files
- [ ] Add per-project file configuration
- [ ] Fetch plan Markdown
- [ ] Parse checklist tasks and headings
- [ ] Handle no-task plans and malformed Markdown
- [ ] Calculate weighted completion
- [ ] Display source file and sync timestamp

## 4. Sync & polish
- [ ] Manual refresh
- [ ] Optional scheduled refresh
- [ ] Fetch latest commit metadata
- [ ] Activity timeline from logbook and commits
- [ ] Empty, loading, offline, error states
- [ ] Tests for parser and calculation
- [ ] Deployment
