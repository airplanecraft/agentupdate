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
- [x] Translate "Claude OpenSpec" tutorial series into English (30 lessons)
- [x] Standardize and fix YAML frontmatter in OpenSpec lessons
- [x] Implement database synchronization for OpenSpec bilingual content
- [x] Generate and sync professional cover image for OpenSpec tutorial
- [x] Sync all tutorial assets between Website and Admin public directories
- [x] Set up local self-hosted Firecrawl instance with Docker
- [x] Set up local Firecrawl MCP server for AI integration
- [x] Session Archive

## [Crawler IP Protection & Model Alignment — 2026-05-12/13]

- [x] Cloudflare WARP 代理集成：配置 SOCKS5 隧道 (localhost:40000) 突破 IP 封锁
- [x] Firecrawl 本地服务启动（Docker），并验证 `warp=on` 状态
- [x] Crawler Layer 3 接入 Firecrawl 自动降级（原生抓取失败时切换）
- [x] Crawler Layer 1 (RSS 列表) 接入 Firecrawl 穿透（静默处理 403，不打印日志）
- [x] 编写 `list-models.mjs` 脚本实时查询可用模型 ID
- [x] 根据 ListModels 实际返回结果修正全系统模型配置：
    - [x] 文本改写：`gemini-3-flash-preview` (✅ generateContent 已确认)
    - [x] 图像生成：`imagen-4.0-fast-generate-001` + 备用 `imagen-4.0-generate-001`
- [x] 屏蔽 RSS 抓取失败日志（只保留文章内容层日志）
- [x] Session Archive


## [Admin UI Feature: Visual Tutorial Importer — 2026-05-13]

- [x] Implement backend API `/api/tutorials/scan` to read `admin/content/` folders
- [x] Implement backend API `/api/tutorials/import` for targeted single-series Prisma upsert
- [x] Implement backend API `/api/generate-cover` for AI image generation and local saving
- [x] Build Frontend Admin UI (Dropdown, Dry Run Preview, Visual Warnings for missing frontmatter)
- [x] Implement E2E / Integration tests for the UI importer and targeted sync API
- [x] Session Archive

## [Claude Code Command Tutorial Optimization — 2026-05-13/14]

- [x] Fix Lesson 1: Remove deprecated commands (/scroll-speed, etc.), add /config, /model
- [x] Restore missing sections: Development Phase (Execution & Testing) and MCP Plugins
- [x] Refine /add-dir description to match official behavior (Working Dir, Persistence, Resumability)
- [x] Replace old 6-chapter tutorial with comprehensive 15-file guide from `my-pomodoro` (12 chapters + Intro + 2 Appendices)
- [x] Verify and sync all 15 lessons to database via Import API
- [x] Session Archive

## [GStack Superpowers Tutorial & AI Discovery — 2026-05-14/15]

- [x] Migrate 17-lesson GStack Superpowers tutorial (14 chapters + Intro + 2 Appendices)
- [x] Author bilingual series metadata (series.json)
- [x] Generate professional 3D isometric cover image with AI
- [x] Author bilingual content (.en.md) for all lessons
- [x] Sync series and lessons to database via targeted import API
- [x] Update llms.txt with new tutorial for AI agent discoverability
- [x] Session Archive

## [Antigravity Masterclass Translation & Fixes — 2026-05-15]

- [x] Fix the "---" missing title bug by standardizing `order` to `sortOrder` and `description` to `summary` in frontmatter.
- [x] Translate remaining 24 chapters (07-30) of Antigravity Masterclass into English.
- [x] Write Python script with multithreading and Gemini API for bulk automated translation.
- [x] Synchronize database and verify `titleEn` population for ID 55.
- [x] Session Archive

## [SEO: Robots.txt Open Mode — 2026-05-15]

- [x] Switch robots.txt from strict whitelist (30+ UA) to open mode (`User-agent: *`)
- [x] Keep internal path protections (`/api/`, `/_astro/`, `/pagefind/`)
- [x] Verify live site vs local source consistency
- [ ] Deploy updated robots.txt to production
- [ ] Update llms.txt with missing tutorials (caveman, claude-memory, claude-remote-control, etc.)
- [x] Session Archive

## [Tech Blog Module — Phase 1: Admin Backend — 2026-05-16]

Design: `docs/plans/2026-05-16-tech-blog-design.md`
Plan: `docs/plans/2026-05-16-tech-blog-phase1.md`

- [x] Task 1: DB Migration — Add BlogPost model to schema.prisma
- [x] Task 2: Blog CRUD API (`/api/blog`) with approval workflow
- [x] Task 3: GLM-5.1 AI Chat API (`/api/blog/ai-chat`) with SSE streaming
- [x] Task 4: Admin sidebar + topbar stats integration
- [x] Task 5: Blog list management page (`/admin/blog`)
- [x] Task 6: Blog editor page with AI chat panel (`/admin/blog/[id]`)
- [x] Task 7: Integration testing & smoke test
- [x] Session Archive

## [Product i18n, Layout Sync & Nano Banana Pro Fallback — 2026-05-18]

- [x] Fix i18n nullish coalescing fallback bug (`??` -> `||`) on English list & details pages to handle empty string metadata.
- [x] Align Chinese product detail page: implement tags and related products grid.
- [x] Remove Related AI News (`RelatedNews`) section completely from all product pages to keep clean layout.
- [x] Run full Astro build validation to verify zero compile errors.
- [x] Integrate **Nano Banana Pro (`gemini-3-pro-image-preview`)** as the 3rd priority backup model with intelligent endpoint and protocol auto-routing.
- [x] Execute `patch-covers.ts` to successfully batch generate and upload 37 missing article covers to R2.
- [/] Session Archive



