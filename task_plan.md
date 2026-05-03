# Session Task Plan — 2026-05-03

## [Tutorial & Platform Optimization]

- [x] Migrate "AI Coding Agents Comparison" to bilingual tutorials
    - [x] Create 10 lessons in `admin/content/agents-comparison-tutorial/`
    - [x] Generate and sync cover image
    - [x] Seed lessons into database (Series ID: 225)
- [x] Fix Tutorial Publication Timestamp Issue
    - [x] Update `admin/api/tutorial.ts` to force `updatedAt` update on parent series
    - [x] Update `website/lib/tutorials.ts` to sort by `updatedAt desc`
    - [x] Manually fix Series 222 timestamp
- [x] Add Baidu Verification File
    - [x] Create `website/public/baidu_verify_codeva-8Cfj2Ko6aW.html`
- [x] Session Archive
    - [x] Update `progress.md`
    - [x] Update `bugs.md`
    - [x] Execute multi-repo sync (`session-push-all.sh`)
