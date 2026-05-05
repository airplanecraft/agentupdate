# Session Task Plan — 2026-05-05

## [Tutorial Migration & Bilingual Standardization]

- [x] Migrate "Claude Code Remote Control" to bilingual tutorials
    - [x] Author 12 modular lessons (ZH/EN)
    - [x] Generate and sync cover image
    - [x] Generate and embed technical illustrations
    - [x] Seed lessons into database (Series ID: 228)
- [x] Migrate "Claude Code Permission Modes" to bilingual tutorials
    - [x] Author 12 modular lessons (ZH/EN)
    - [x] Generate and sync cover image
    - [x] Generate and embed technical illustrations
    - [x] Seed lessons into database (Series ID: 230)
- [x] Standardization: Bilingual File Splitting
    - [x] Split mixed `.md` files into `.md` (ZH) and `.en.md` (EN) for both tutorials
    - [x] Update seeding scripts to support dual-file reading
- [x] UI/UX Fix: Illustration Syncing
    - [x] Restore missing illustrations in admin dashboard by syncing `website/public/illustrations` to `admin/public/illustrations`
- [x] Session Archive
    - [x] Update `progress.md`
    - [x] Update `findings.md`
    - [x] Update `bugs.md`
    - [x] Execute multi-repo sync (`session-push-all.sh`)
