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
- [x] Fix i18n navigation (prev/next) title localization bug.
- [x] Implement English-centric illustration strategy for AI cover generation.
- [x] Add cover image management to the Tutorial Lesson editor.
- [x] Monitor indexation improvements.
- [x] Standardization: Bilingual File Splitting
    - [x] Split mixed `.md` files into `.md` (ZH) and `.en.md` (EN) for both tutorials
    - [x] Update seeding scripts to support dual-file reading
- [x] UI/UX Fix: Illustration Syncing
    - [x] Restore missing illustrations in admin dashboard by syncing `website/public/illustrations` to `admin/public/illustrations`
- [x] Session Archive (Part 1)
- [x] Content & SEO Infrastructure (2026-05-08)
    - [x] Migrate "Claude Code + OpenSpec + 多角色 Agent 开发软件项目" (ID: 324)
    - [x] Rewrite bilingual descriptions for ID 230 and 324
    - [x] SEO: Implement comprehensive dynamic Sitemap generation
    - [x] Feature: Add dual-language RSS Feed support
    - [x] Bugfix: Admin Dashboard Stats counting logic for bilingual statuses
    - [x] Session Archive (Part 2)

## [Admin UI & Crawler Deduplication]

- [x] Implement database-level deduplication for product scraping
    - [x] Add GitHub URL and Website URL deduplication checks in `product-writer.ts`
    - [x] Automatically claim manual entries when the crawler encounters them
- [x] Implement product screening filtering
    - [x] Exclude articles already converted to products from the screening view (`product.astro`)
- [x] Implement Failed News management improvements
    - [x] Add "Disable Source" UI button in the `news.astro` admin view
    - [x] Implement `disable_source` batch action in `review.ts` to set Feed `enabled=false` by hostname
    - [x] Add keyboard shortcut (D) and confirm dialog for the action
- [x] Implement WeChat community badge dynamically in Chinese tutorials frontend template
- [x] Fix missing localization of `nav.prev` and `nav.next` titles in `website/src/lib/tutorials.ts`
- [x] [Stabilization] Fix Admin News UI SyntaxError and Batch Selection logic
- [x] [Stabilization] Fix `purge-stale` API to support array-based status filters
- [x] [Optimization] Upgrade all Gemini endpoints to `gemini-3-flash-preview`
- [x] [SEO] Standardize robots.txt whitelist and sync llms.txt with 400+ products
- [x] [SEO] Verify Google Analytics coverage across all tutorial routes
- [x] [Social] Standardize CTA for multi-platform content distribution
- [/] Session Archive
