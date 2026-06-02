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
- [x] Fix homepage cover image rendering bug: support bilingual English covers on the English homepage.
- [x] Fix homepage product icon fallback: replace duplicate robot emoji 🤖 fallback with dynamic capitalized product initials and premium color palettes.
- [x] Session Archive

## [Tech Blog Module — Phase 2: WeChat Article Rewrite & AI Synthesis — 2026-05-18]

Design: `/Users/eric/.gemini/antigravity/brain/9e66e54f-2b4b-4cbd-8598-e79985882527/wechat_article_rewrite_architecture.md`

- [x] Task 1: Environment Integration — Add EDGE_CRAWLER_PROXY_URL to admin/.env
- [x] Task 2: Backend Scraper API — Create `/api/blog/edge-scrape` utilizing the Cloudflare Worker proxy and cleaning js_content
- [x] Task 3: Backend AI Synthesis Route — Create `/api/blog/ai-rewrite` to aggregate multiple scraper results, synthesize with Gemini, and Prisma upsert Draft BlogPost
- [x] Task 4: Frontend UI Dashboard — Create `/admin/blog/rewrite.astro` (Keywords group sidebar, WeChat articles table with multiselect, live dynamic progress modal, and auto-redirect)
- [x] Task 5: Integration & E2E Validation
- [x] Session Archive


## [博客细节调整与封面同步 — 2026-05-19]

Design: `docs/plans/2026-05-19-blog-fixes-design.md`
Plan: `docs/plans/2026-05-19-blog-fixes-implementation.md`

- [x] 任务 1: 头部菜单排序调整
- [x] 任务 2: 每日统计升级 `daily-stats.ts`
- [x] 任务 3: 数据统计栏 SectionTodayBar 展示
- [x] 任务 4: 封面资源同步设定

## [全站宽度美化与 Google Analytics 审计 — 2026-05-21]

- [x] 修复搜索结果面板大量数据时无法向上滚动只能显示3条的 Bug (BUG-126)
- [x] 优化博客详情页：为每个博客自动生成前两个博客的内链，提升 SEO 内链织网效果
- [x] 优化博客代码块渲染：确保 Markdown 内的代码正常渲染，显示语法高亮，而非纯文本
- [x] 重新设计博客及全站内容宽度：统一调整 `news`, `blog`, `tutorial`, `product`, `release` 的页面排版宽度，保证极佳的视觉呼吸感与空间感
- [x] 修复博客页面绿线/边框错位与 Mermaid 图表语法错误引发的渲染异常
- [x] 全面排查静态页面生成后的 Google Analytics 埋点完整性，确认 100% 覆盖所有模块，无统计丢失
- [x] 答复用户关于升级 Antigravity 2.0 后自定义会话命令消失的疑问，并指导如何使用/重新生效

## [Tech Blog Module — Editor Clipboard & Image Upload support — 2026-05-23]

- [x] Create backend API `/api/blog/upload` for robust image upload parsing
- [x] Configure EasyMDE client editor in `[id].astro` for Chinese and English tabs
- [x] Enable seamless clipboard paste (pasteboard) and drag-and-drop support
- [x] Verify complete Astro build success with zero errors
- [x] Session Archive

## [Build Script Optimization & Live 404 Resolution — 2026-05-31]

- [x] Fix build-deploy.sh to prevent macOS file locking race conditions by introducing settle delay (sleep 1)
- [x] Fix Astro build outDir clearing bug deleting dist/.git and corrupting parent git repository remote config
- [x] Restore corrupted parent website git remote and soft-reset build commits while keeping local improvements
- [x] Completely rebuild and redeploy static build output, restoring live status of product/release/skills pages
- [x] Session Archive

## [Cloudflare Pages 20k File Limit, WeChat Crawler Fixes & AI Content Sanitization — 2026-06-01]

- [x] Fix Cloudflare Pages 20k file limit error by configuring Pagefind glob content filter in `astro.config.mjs`
- [x] Compile and push slimmed-down build folder (11,875 files, ~43% reduction) to deploy repository
- [x] Verify live 404 page client-side redirectsMap integration and confirm Karpathy news 301 redirection works perfectly
- [x] Fix WeChat Crawler `PrismaClientValidationError` by regenerating Prisma Client in `admin` and restarting dev/websocket servers
- [x] Fix AI Chinese slug generation bug by adding `slugify` helper in `ai-rewrite.ts` to enforce clean ASCII slugs
- [x] Migrate BlogPost ID 26 slug in database to clean ASCII format and append 301 edge redirects to `_redirects`
- [x] Fix English blog post ID 27 rendering error by repairing broken Mermaid backticks in database record
- [x] Implement self-healing `fixLooseMermaidBlocks` parser inside `ai-translate.ts` to prevent future code block formatting errors
- [x] Rebuild and redeploy website, confirming clean HTML generation and live 301 redirections
- [x] Session Archive

## [AI Release Hub classification, Keyphrase Highlighting & Rate-Limit Safekeeping — 2026-06-02]

- [x] Phase 1: Database Schema Expansion
    - [x] Add `isMajor` and `highlights` columns in `database/prisma/schema.prisma`
    - [x] Synchronize `schema.prisma` to `admin` and `crawler` modules
    - [x] Execute `db push` to apply migration to PostgreSQL database
    - [x] Regenerate Prisma clients for `database`, `admin`, and `crawler` folders
- [x] Phase 2: Ingestion & Crawler Logic
    - [x] Add exponential backoff retry handler `callGeminiWithRetry` in `html-llm.ts` to guard Gemini API against `429` quota exhaustion
    - [x] Implement local semantic keyword heuristic parser to classify releases and extract key highlights
- [x] Phase 3: Admin Review Dashboard
    - [x] Support `isMajor` and `highlights` updates in the review API action
    - [x] Fix critical bug in the update API to support selective-field updates, avoiding accidental data erasure
    - [x] Implement interactive Major/Minor list toggle and dynamic editable tag input in admin Releases UI
- [x] Phase 4: Frontend Website Rendering
    - [x] Implement regex-safe timeline keyphrase highlighting capsule engine
    - [x] Update product detail timeline templates (EN/ZH) to render glowing Major cards and compact Minor versions using raw HTML unescaping (`set:html`)
    - [x] Standardize releases list dashboard (EN/ZH) to display breathing pulses, gradient glows, and rocket status micro-indicators for Major versions
- [x] Phase 5: Retroactive Data Migration
    - [x] Author and execute a retroactive migration script to process all 468 existing releases in the database, automatically mapping historical major milestones and key phrase tags
- [x] Phase 6: Image Generator Prompts English Standardization & Gibberish Suppression
    - [x] Convert Chinese cover prompts (`promptZh`) to use the English summary (`summaryEn`) as base text
    - [x] Inject strict negative indicators (`no text, no words, no spelling`) and replace typography keywords with layout composition styling
- [x] Phase 7: Environment LLM Model Architecture Standardization
    - [x] Update `LLM_REWRITER_MODEL` to establish Gemini 3.5 Flash as primary and Gemini 3.1 Pro as backup in `.env`
    - [x] Standardize `RELEASE_LLM_MODEL` to use Gemini 3.5 Flash for high-speed HTML scraping in `.env`
    - [x] Confirm and lock Imagen 4.0 models for cover image generation as approved
- [x] Session Archive

