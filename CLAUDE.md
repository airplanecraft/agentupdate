# CLAUDE.md - AgentUpdate.ai / OpenClawEco

Welcome to the **AgentUpdate.ai (OpenClawEco)** workspace. This guide provides essential context, architecture overview, common commands, and execution rules for working with this repository in Claude Code.

---

## 🏛️ System Architecture & Submodules

This workspace operates as a multi-repository ecosystem containing independent git modules:

| Directory | Repository / Component | Technology Stack | Description |
|-----------|------------------------|------------------|-------------|
| `website/` | [openclaweco-website](https://github.com/airplanecraft/openclaweco-website) | Astro 7, TailwindCSS v4, TypeScript | Public SEO-optimized news, blog, tools & tutorial site |
| `admin/` | [openclaweco-admin](https://github.com/airplanecraft/openclaweco-admin) | Astro, Prisma, Node.js | Admin console for content moderation & AI workflow |
| `crawler/` | [openclaweco-crawler](https://github.com/airplanecraft/openclaweco-crawler) | Node.js, TypeScript, Gemini API, Readability | Multi-layer RSS poller, AI article rewriter & image generator |
| `database/` | [openclaweco-db](https://github.com/airplanecraft/openclaweco-db) | PostgreSQL, Prisma ORM | Central database schema & SQL dump snapshots |
| `firecrawl/` | Local Firecrawl Docker | Docker Compose, Playwright | Self-hosted Web Scraper & anti-bot bypass service |
| `docs/` | [openclaweco-docs](https://github.com/airplanecraft/openclaweco-docs) | Markdown | Architecture docs, PRDs, & system design records |

---

## 🚀 Key Commands

### Development Servers
- **Website (Dev)**: `cd website && npm run dev` (Runs on `http://localhost:4321`)
- **Admin Console (Dev)**: `cd admin && npm run dev` (Runs on `http://localhost:4322`)
- **Crawler Daemon**: `cd crawler && npm run dev` (Or `npx tsx src/index.ts`)
- **Firecrawl Engine**: `cd firecrawl && ./start-local.sh` (Runs on `http://localhost:3002`)

### Build & Deployment
- **Local Validation (Safe)**: `cd website && npm run local-build`
  - *Generates `dist/`, runs pagefind indexing and link audit locally. Does NOT push to remote.*
- **Production Deploy**: `cd website && npm run build`
  - *Executes `build-deploy.sh`, compiles `dist/`, and git-pushes to `airplanecraft/openclaweco-website-build` for Cloudflare Pages auto-deploy.*
- **Direct Deploy**: `cd website && npm run direct-deploy`
  - *Deploys `dist/` directly via `wrangler pages deploy`.*

### Repository Synchronization
- **One-Click Session Push All**: `bash session-push-all.sh`
  - *Creates DB SQL snapshot, commits and pushes all modified submodules (`admin`, `crawler`, `database`, `website`, etc.) and root repo pointers to GitHub.*

---

## 🔒 Port Configuration Guidelines

| Environment | Website Port | Admin Port | Firecrawl Port | WARP Proxy Port |
|-------------|--------------|------------|----------------|-----------------|
| **Dev (Manual)** | `4321` | `4322` | `3002` | `40000` |
| **E2E Testing** | `14321` | `14322` | - | - |

> **Rule**: Do not hardcode ports in components. Respect `ports.config.json`. E2E tests must never conflict with active dev ports.

---

## 🛡️ Development & Safety Rules

1. **Build Safety Rule**:
   - Always run `npm run local-build` inside `website/` to verify HTML syntax and link integrity after fixing bugs or modifying templates.
   - Do NOT automatically run `npm run build` during automated debugging loops without user request, as `npm run build` triggers remote deployment.
2. **Cloudflare Deployment Limit**:
   - Keep total static file count in `dist/` below 20,000 files to avoid Cloudflare Pages single-deployment limit errors.
3. **Environment Security**:
   - All API keys (Gemini, R2, Cloudflare) live in root `.env`. Never commit `.env` files or credentials to Git repositories.
4. **Blog / News Content Workflow**:
   - When simply writing, importing, or editing news/blog Markdown or DB entries, do NOT trigger unnecessary full site rebuilds unless explicitly requested.

---

## 📁 Key Documentation References

- **System Architecture**: `docs/architecture.md`
- **Product Requirements (PRD)**: `docs/PRD.md`
- **Session Progress Log**: `progress.md`
- **Known Bugs & Resolutions**: `bugs.md`
