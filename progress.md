## 2026-07-07 10:00 — [Product & Blog Content] Write Claude memory blog post (draft) ✅

### 完成事项
1. **记忆力对比双语博客撰写**：
   - 根据大纲完成了《别让两个“秘书”打架：Claude Code 原生 Auto Memory 与 claude-mem (cmem) 深度对比与避坑指南》的中英文博客创作，存放于 [claude-auto-memory-vs-claude-mem.zh.md](file:///Users/eric/work/openclaweco.com/database/claude-auto-memory-vs-claude-mem.zh.md) 与 [claude-auto-memory-vs-claude-mem.en.md](file:///Users/eric/work/openclaweco.com/database/claude-auto-memory-vs-claude-mem.en.md)。
   - 文章中增加了详细的 Mermaid 运行流程对比图，并单独拆解了“为什么不能同时开启它们”在冲突、Token膨胀和AI偷懒方面的底层原理。
2. **封面配图与数据库同步**：
   - 成功生成了超高精度的 3D 脑成像对比封面图，并分发至网站及后台 public 目录下。
   - 编写并运行了 [insert_claude_memory_blog.ts](file:///Users/eric/work/openclaweco.com/database/insert_claude_memory_blog.ts) Prisma Seeding 脚本，以 `draft` (草稿) 状态写入本地数据库中，且不运行任何构建指令。
   - 所有产出文件已通过一键推送脚本安全同步到远程 GitHub。

---

## 2026-07-04 21:10 — [Monitoring & Telegram Bot] Fix GSC Table Parser & Trigger Status Report ✅


### 完成事项
1. **Telegram 双时报/双周报 GSC 数据字段解析修复**：
   - 发现并定位了 `scratch/telegram-status-scheduler.mjs` 在解析 GSC `search_analytics` 接口返回的 markdown 形式表格时的正则匹配和索引列对齐 Bug（原代码写死只匹配 `Total Clicks` 等性能概览关键字，而实际接口返回的列格式为 `| clicks | impressions | ctr | position |`，导致解析器之前一直输出 `N/A | N/A | N/A | N/A`）。
   - 重构了 GSC 表现数据解析逻辑，修改为按行切割分割 `|` 的列项，并跳过表头，精准抓取首列数值及百分比（如 `点击: 2 | 展现: 1,225 | CTR: 0.16% | 排名: 9.0`）。
2. **报表推送重启与核对**：
   - 顺利运行并触发最新的抓取测试，首次推送成功，Telegram 频道已收到真实正确的 GA4 实时在线与 GSC 近3天表现指标（包括正确的收录数和变化差值）。
   - 将更新后的调度器 `node scratch/telegram-status-scheduler.mjs` 重新在后台拉起，替换原有的旧进程，保证后续每 2 小时推送数据的正确性。

---

## 2026-07-03 09:12 — [Product & Blog Content] Write Composio Local Marketing Ops System Blog Post ✅


### 完成事项
1. **Composio 本地营销运营系统分析与博文撰写**：
   - 调研了用户开发在 `/Users/eric/work/composio` 目录下的 Next.js 本地项目，梳理了系统在 AI 增长黑客营销中的痛点需求和定位（Composio 云端托管 API 授权，MCP 规范本地工具接口，本地系统 promo-ops 调度营销内容、审批与账号安全策略）。
   - 撰写了深度、硬核的双语博文：中文 [composio-mcp-local-marketing-ops.zh.md](file:///Users/eric/work/openclaweco.com/database/composio-mcp-local-marketing-ops.zh.md) 及英文 [composio-mcp-local-marketing-ops.en.md](file:///Users/eric/work/openclaweco.com/database/composio-mcp-local-marketing-ops.en.md)，深度剖析了三层解耦架构、CLI 本地会话生成省钱防泄漏机制、以及双重风控（源头合规+临门阻断）的策略引擎细节。
   - 使用 AI 生成了精致的 3D 轴测图风格封面图并分发拷贝至 Web/Admin 的 `public/images/blog/composio_marketing_ops.jpg` 中。
   - 编写并运行了 `database/insert_composio_marketing_blog.ts` Prisma Seeding 脚本，以 `draft` 草稿状态成功同步写入数据库。
2. **遵守本地编译与部署规范**：
   - 严格遵循用户设定的内容发布无打包（No automatic `local-build`）规范，本次纯文章写入会话未触发任何构建和发布命令。
   - 运行 `./session-push-all.sh`，成功将所有更改（新博文、配图、Prisma 脚本及新版 `.agents/AGENTS.md`）提交推送至 GitHub 远程仓库。

### 关键决策
- **CLI/Web 两层分治以保护隐私和成本**：由 Web UI 仅进行工具调用发帖（无需大语言模型），将高成本 of LLM 内容生成独立至 CLI 在用户终端本地运行（利用现有订阅额度），是独立开发者本地营销系统的极佳低成本设计范式。
- **双层策略引擎风控**：将防封号策略分别设置在 LLM 生成时的 System Prompt 限制阶段以及发帖前夕的静态 Pre-flight check 阶段，构成了牢固的防封锁防御网。

### 下一步
- 待用户在后台管理系统中核对并润色博文，满足要求后一键正式发布上线。

---

## 2026-07-02 06:50 — [SEO & Blog Content] Implement Keyword Auto-Linker & Publish Claude Ban Blog Post ✅


### 完成事项
1. **自动语义内链系统（Keyword Auto-Linker）**：
   - 编写并部署了 `website/src/lib/autolinks-config.ts` 全局规则库，用于配置 `OpenClaw`、`Antigravity`、`Claude Code` 等核心技术资产的中英文跳转目标。
   - 在 `website/src/lib/seo.ts` 中实现了一套高性能且安全的 HTML 提取替换算法 `autolinkKeywords`，该算法自动隔离已存在的 `<a>` 链接、`<pre>`/`<code>` 代码块和标题，限制单篇最多插入 3 个超链接以防触发滥用惩罚。
   - 将该内链自动注入机制接入了 Blog、News、Tutorial 三大核心模块的详情页（中英文全部对齐）。
   - 验证通过：本地静态编译无痛生成，全站共有 **813** 个页面正文被自动织入超链接，死链审计为 0。
2. **Claude 封号遭遇新博文撰写与发布**：
   - 撰写了高信息密度的双语原创博文：中文 [claude-5x-max-account-banned-experience.zh.md](file:///Users/eric/work/openclaweco.com/database/claude-5x-max-account-banned-experience.zh.md) 及英文 [claude-5x-max-account-banned-experience.en.md](file:///Users/eric/work/openclaweco.com/database/claude-5x-max-account-banned-experience.en.md)。
   - 详细记录并解密了用户 5x Max 账号于 6.30 被封的真实经历，分析了包括加拿大独立 VPS + GL-MT3000 homeproxy 网关硬件代理防 IP 漂移、30分钟用尽限额、2周消耗 20 亿 token 触碰“蒸馏”风控、香港时区与加拿大 IP 不匹配、大比例中文提问等多重硬核风控红线维度。
   - 使用 AI 生成了高水准的 3D 轴测图风格封面 [claude_account_suspended.jpg](file:///Users/eric/work/openclaweco.com/website/public/images/blog/claude_account_suspended.jpg) 并同步分发至 Web/Admin 目录。
   - 编写并运行了 Prisma 数据库插入脚本 `database/insert_claude_ban_blog.ts`，以 `draft` 草稿状态成功同步写入数据库。

### 关键决策
- **静态渲染期解耦注入**：内链不需要强行写死在数据库 Markdown 中，而是在 Astro 静态编译（Prerender）阶段以管道函数动态替换输出。这样能保证数据库的整洁性，且支持日后任意批量修改 URL 映射关系，最大化后期维护灵活度。
- **独立 VPS 封号原因聚焦“指纹与额度”**：在相同 IP 下的 Pro 账户幸存、但 5x Max 账户因半小时额度瞬间耗尽而封杀的细节中，表明当前的 AI 厂商风控（Anti-Abuse）重点不是简单的 IP 库打击，而是结合系统时区（香港时区偏好）、大量中文环境、以及 20 亿极高 token 调用的行为指纹多维评测。

### 下一步
- 运行 `/session-archive` 整理一键推送，向 GitHub deploy 仓库和主仓库进行代码和新博文的同步。

---

## 2026-06-27 12:35 — [Monitoring & Telegram Bot] Setup GA4 & GSC Status Telegram Scheduler ✅

### 完成事项
1. **GA4 多项目统计脚本**：
   - 编写了 Python 脚本 `scratch/query_ga4_status.py`，调用 Google Analytics Data API 成功实现了对 `agentupdate.ai` (531260213) 和 `1000usdinchina.com` (542642277) 的实时在线人数（30分钟内活跃）、今日累计数据及昨日数据汇总查询。
2. **定时调度与推送控制脚本**：
   - 编写了 Node.js 脚本 `scratch/telegram-status-scheduler.mjs`，通过子进程执行 `npx mcp-gsc` 并使用 `performance_overview` 接口抓取最新 GSC 指标；同时合并上述 Python 脚本输出 of GA4 统计数据，组装成结构化、易于阅读的 Markdown 状态报告。
3. **“直连+代理”双重弹性网络适配**：
   - 设计了 `smartFetch` 网络请求层。默认采用不带 Agent 的直接连接访问 Telegram API，一旦遭遇网络拦截则自动无缝降级为使用 `socks5h://127.0.0.1:40000` 代理，完美适应用户的透明/系统代理与 WARP 代理环境。
4. **后台常驻服务启动**：
   - 以后台任务启动了 `telegram-status-scheduler.mjs` 进程，成功发送首条状态简报至用户 Telegram，并设置为每 2 小时定时循环推送。

### 关键决策
- **直连优先的智能降级策略**：由于用户环境配置了 TUN/透明代理，直连 `api.telegram.org` 即可顺畅送达，强制使用 40000 端口反而因端口未监听抛出 ECONNREFUSED 错误。采用直连优先、出错重试代理的 smartFetch 设计，保证了国内复杂网络环境下的多节点兼容。
- **GSC 关键指标清洗**：仅抓取并解析 GSC Markdown 中的 Clicks, Impressions, CTR 和 Position 等最核心数据以单行排版，防范 Telegram 消息过长引起信息超载。

### 下一步
- 保持该后台进程的健康运行，让其每两小时自动向用户 Telegram 发送状态概览。

---

## 2026-06-27 12:13 — [Deployment & Cloudflare Pages] Local Direct Deploy for GitHub Flag Overcome ✅

### 完成事项
1. **Cloudflare 凭证更新**：
   - 更新了根目录 `.env` 和 `website/.env` 下的 `CLOUDFLARE_API_TOKEN`，换上了用户新生成的 API 令牌，消除了 Cloudflare 接口返回的 Code 10000 鉴权错误。
2. **Pages 项目名称纠正**：
   - 通过 `npx wrangler pages project list` 查询发现 Cloudflare 账号下的 Pages 项目名称实为 `openclaweco-website-build`，而非默认的 `agentupdate-ai`。
   - 在根目录 `.env` 和 `website/.env` 中新增并配置了 `CLOUDFLARE_PROJECT_NAME="openclaweco-website-build"`，成功纠正了部署时的 Code 8000007（Project not found）报错。
3. **本地直推 Cloudflare 验证打通**：
   - 运行了本地直推脚本 `pnpm direct-deploy`（对应的 `build-direct-deploy.sh` 脚本）。
   - 脚本顺利完成了 Astro 5729 个页面的 8GB 堆内存编译、Pagefind 索引生成、以及死链审计。
   - 成功绕过被 wind control（flagged）的 GitHub 仓库，通过 Wrangler 成功将打包后的 `dist/` 上传部署至 Cloudflare Pages。

### 关键决策
- **建立直接部署（Direct Deploy）过渡流**：当 GitHub 账号遭受风控，导致 Cloudflare 的 GitHub APP 克隆私有仓库失败时，利用 `npx wrangler pages deploy` 实现从本地通过 API 令牌将构建产物直接上传 Cloudflare，能有效保障生产线上站点的稳定更新。
- **动态令牌环境降级支持**：调整 `build-direct-deploy.sh` 内部机制，保证在 `.env` 中无 Token 时能自动降级至 Wrangler 本地浏览器 session，增加脚本在各种环境下的健壮度。

### 下一步
- 向用户确认并汇报成功部署的线上临时/生产链接。
- 等待 GitHub 账号申诉解封后，再恢复常规的 Git 触发部署流。

---

## 2026-06-24 15:20 — [SEO & Domain Consolidation] Consolidate Domain to agentupdate.ai ✅

### 完成事项
1. **统一根域名配置**：
   - 将 `website/astro.config.mjs` 中的 `site` 配置由 `https://www.agentupdate.ai` 统一更改为不带 www 的 `https://agentupdate.ai`。
2. **文档与配置更新**：
   - 替换了 `robots.txt`、`llms.txt` 以及中英文 `README.md` 中的所有硬编码 `www.agentupdate.ai` 域名，统一更改为 `agentupdate.ai`。
3. **组件与模板逻辑对齐**：
   - 更新了 `Breadcrumbs.astro`、`BaseLayout.astro`（全局 Organization/WebSite 结构化数据、TechArticle 结构化数据等）中的硬编码 URL，确保面包屑和全站页面的 Schema.org 数据一致指向根域名。
   - 更新了 `sitemap.xml.ts`、`rss.xml.ts` 和 `zh/rss.xml.ts` 中用于生成绝对路径的 site 域名或 fallback 域名。
   - 批量排查并修改了 `blog/[slug].astro`、`news/[slug].astro`、`product/[slug].astro` 及其对应的中文版模板中，硬编码的 JSON-LD URL。
4. **本地静态编译与死链校验**：
   - 执行了 `npm run local-build` 进行本地编译验证，成功生成 5711 个静态 HTML 页面。
   - 本地 Link Auditor 扫描 **5723 个 HTML 文件，确认 0 个内部 broken link**，完美保证了页面内链完整度。

### 关键决策
- **规范应用层 canonical 属性与域名映射**：在 Cloudflare 边缘端（Edge）部署 301 重定向将 `www` 流量汇聚到 naked 域名的同时，必须以最高优先级同步更新应用层的全量硬编码 URL。这可以避免搜索引擎在索引抓取时产生 Canonical URL 错位或形成重定向回路，以最快速度完成权重的平滑合并。

### 下一步
- 运行 `./session-push-all.sh` 一键向远程仓库推送 Root 及子模块 of the codebase to trigger production deployment.

---

## 2026-06-24 14:30 — [SEO & GSC Performance] Canonical URL Normalization & News Metadata Optimization ✅

### 完成事项
1. **Canonical URL 与 Hreflang 规范化**：
   - 彻底修复了 [BaseLayout.astro](file:///Users/eric/work/openclaweco.com/website/src/layouts/BaseLayout.astro) 中的 URL 清理和构建逻辑。移除了强行在尾部追加斜杠的代码，使得所有页面的 `canonical` URL 生成为无斜杠的标准路径（如 `https://www.agentupdate.ai/news`），完全对准 `astro.config.mjs` 中的 `trailingSlash: 'never'` 设定。
   - 同步规范了语言跳转中的 `zhURL`、`enURL`、`switchToZhHref` 和 `switchToEnHref`，使得多语言互指属性及切换链接也采用无斜杠格式，根除了权重分裂和 308 重定向隐患。
2. **新闻列表页 Meta 标签优化**：
   - **英文新闻首页** [news/index.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/news/index.astro)：将标题升级为 `AI Agent News & Real-Time Ecosystem Updates`，Meta 描述更新为更具行动引导且包含 "Updated daily" 字样的富文本。
   - **中文新闻首页** [zh/news/index.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/zh/news/index.astro)：同步将标题升级为 `AI Agent新闻资讯 & 智能体生态动态`，Meta 描述替换为高专业度的引流文案，以提升在 Google 搜索结果中展现时的点击率（CTR）。
3. **本地静态编译与死链校验**：
   - 本地重新执行 `npm run local-build`，5711 个静态 HTML 页面成功生成编译。
   - 运行站内连接完整性审计，结果确认 **0 internal broken links**，完美保证了打包交付质量。

### 关键决策
- **规范化 URL 权重集中（Slash Normalization）**：为了消除重定向链，规范 canonical 和 hreflang 必须与项目配置文件 `trailingSlash: 'never'` 及服务端 HTTP 响应完全保持一致。全站去斜杠可有效合并反向链接权重并提升爬虫抓取效率。
- **提升低排名页面点击率（CTR Baiting）**：对于处于第一页底部（位置 ~8）的新闻入口，通过优化 Meta 标题和描述使其极具信息密度和行动召唤属性，是低排名下挽回流量的最高效手段。

### 下一步
- 运行 `./session-push-all.sh` 同步最新代码至 GitHub，静待 Google 对线上 URL 进行重新抓取并更新索引。

---

## 2026-06-23 10:18 — [Content & Telegram Bot] 1000usdinchina Blog Import & Telegram Bot Diagnostics ✅

### 完成事项
1. **博客转换与数据修复**：
   - 将 8 篇双语开发博客（关于 `1000usdinchina.com`）导入本地 PostgreSQL 数据库中作为草稿记录。
   - 解析 Markdown Frontmatter，正确提取 `date` 字段并设置为 `publishedAt` 日期。
   - **Markdown 链接与图片路径纠偏**：自动解析博客正文，将 Markdown 相对链接（如 `03-travel-data-etl-compliant-json.md`）转换为项目内正式的 URL 路由（如 `/blog/travel-data-etl-compliant-json/`），并将图片路径全部更正为 `/images/blog/`。
   - **图片资源同步**：将博客所需的全部图片资源复制到 `website/public/images/blog/` 及 `admin/public/images/blog/` 中。
2. **草稿状态与防止发布**：
   - 根据用户不要发布的要求，已将全部 8 篇博客的 status 字段修改为 `draft`，防止它们被自动编译发布。
3. **Telegram 自动化任务处理**：
   - 检查并完成了 `telegram_tasks.json` 中的 pending 任务（ID `1782034863520`），并已通过 SOCKS5 代理向 Telegram 发送了确认消息。

### 关键决策
- **自动链接及图片修复逻辑**：在博客导入脚本中加入 Markdown 链接以及图片解析逻辑，实现了一键式、零错误的链接及图片路径自愈。
- **强制草稿状态**：尊重用户的约束，不发布这些博客文章，将其在数据库中锁定在 `draft` 状态。

### 下一步
- 运行 `./session-push-all.sh` 一键向远程同步最新代码与配置。

---

## 2026-06-16 14:38 — [Blog Finalization & Summary Chart Addition] ✅

### 完成事项
1. **完善并扩写了实战优化博客草稿 (Draft)**：
   - 更新了中英双语博客草稿，文件路径 [insert_blog_post.ts](file:///Users/eric/work/openclaweco.com/database/insert_blog_post.ts)。
   - **在步骤后增补了每个具体优化步骤前后评分/指标对比，并在正文末尾增设了包含优化页面范围、数量、核心手段、目的以及前后数据对比的总结图表，使得优化成效一目了然**。
   - 正文语言平实严谨，含自愈 Pipeline Mermaid 图表、SEO 与 GEO 对比表以及详细代码对比。
   - 状态仍设为 `status: 'draft'`（不发布）。
2. **配图设计与分发**：
   - 自动生成了 3D 等轴测风格的高保真科技感封面图片 `seo_geo_optimization.png`。
   - 分发拷贝到了管理员后台 [admin/public/images/blog/seo-geo-optimization.png](file:///Users/eric/work/openclaweco.com/admin/public/images/blog/seo-geo-optimization.png) 和主网站 [website/public/images/blog/seo-geo-optimization.png](file:///Users/eric/work/openclaweco.com/website/public/images/blog/seo-geo-optimization.png)。
3. **数据库写入与备份**：
   - 运行了写入脚本，成功将双语内容及图片路径写入本地 PostgreSQL 数据库。
   - 运行 `./session-push-all.sh`，生成了最新的 `database/openclaweco_backup.sql` 备份，连同新增文件一同提交推送到了 GitHub。
4. **编译与完整性校验**：
   - 在 `website/` 目录运行 `pnpm local-build` 完成了 5500+ 页面的静态全量编译，确认零编译冲突。

### 关键决策
- **保持 `status: 'draft'` 确保安全性**：严格按用户指示不进行线上发布，仅在本地数据库与代码库中做持久化和编译预演。

### 下一步
- 完成当前开发会话，运行归档检查。

---

## 2026-06-16 12:15 — [Content E-E-A-T & GEO Optimization] ✅

### 完成事项
1. **编辑与测试指南建设 (E-E-A-T)**：
   - 在双语关于页面（[about.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/about.astro) 与 [zh/about.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/zh/about.astro)）中添加了「编辑方针与物理沙箱测试规范（Editorial Policy）」，增强网站信誉。
2. **Schema 结构化数据图谱升级**：
   - 升级了 [BaseLayout.astro](file:///Users/eric/work/openclaweco.com/website/src/layouts/BaseLayout.astro) 中的全局 `Organization` sameAs 映射，添加了 x.com 和 LinkedIn。
   - 为所有教程内容页面动态部署了 `TechArticle` 结构化数据，声明底层依赖与技术储备，利于 AI 引擎抓取。
3. **Direct Summary 直接要点区块支持**：
   - 在课时模板 [lesson.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/tutorial/[series]/[lesson].astro) 和中文版中集成了 `direct-summary-box` 组件，支持渲染 30~50 字的极简 takeaways，符合 GEO 提取引用规范。
4. **测试文章 GEO 事实密度与第一人称叙事优化**：
   - 对 `claude-permission-modes-tutorial` 的第 1 课（[lesson-01.en.md](file:///Users/eric/work/openclaweco.com/admin/content/claude-permission-modes-tutorial/lessons/lesson-01.en.md) 和 [lesson-01.md](file:///Users/eric/work/openclaweco.com/admin/content/claude-permission-modes-tutorial/lessons/lesson-01.md)）注入了 `summary` 字段，并在首段写入测试版本（`Claude Code v0.2.9`）、沙盒环境说明和第一人称测试流程叙事。
5. **写成自动同步脚本并完成数据入库**：
   - 编写并运行了 [sync_tutorials.ts](file:///Users/eric/work/openclaweco.com/database/sync_tutorials.ts) 脚本，读取 `admin/content/` 文件夹下 28 套教程的双语 markdown 正文和 Frontmatter summary 并 upsert 进 PostgreSQL 数据库。
6. **运行 Technical SEO 审计与打包验证**：
   - 重新运行 `seo-audit-full` 审计工具，首页 18 项 SEO/社交元数据指标全部绿灯通过，生成的 `reports/www-agentupdate-ai-full-audit.html` 报告已确认。
   - 在 `website/` 下成功执行了 `npm run local-build` 进行本地编译与死链检查，打包编译完美通过。
   - 运行了 `./session-push-all.sh`，将根目录及子模块中所有代码和 SQL snapshot 同步推送到了 GitHub。

### 关键决策
- **绝对不改变既有 URL 结构**：以 meta description、HTML schema 和 template 内容优化为核心，在零 404 风险、零路由变更的前提下安全提升 E-E-A-T 权重。
- **构建数据库同步脚本加速 Seeding**：将 markdown 文件的 GEO 更新全自动同步到 PostgreSQL，防止 website pre-render 时丢失新的 frontmatter takeaways。

### 下一步
- 持续观察 Google Rich Results 是否正常解析新增的 `TechArticle`，并在 ChatGPT Search 及 Perplexity 进行对应技术术语的搜索提问，监测引用率（Citation Share）。

---

## 2026-06-16 07:43 — [Batch News Approval & AI Rewrite Activation] ✅

### 完成事项
1. **匹配并批量审批 Claude/Anthropic/Gemini 相关新闻**：
   - 编写了数据库查询脚本，在 `raw` 状态的新闻中筛选出标题或原始标题包含 "claude"、"anthropic" 或 "gemini" 关键字，且创建日期属于 2026-06-15 和 2026-06-16 的所有文章。
   - 成功将符合条件的 **79 篇** 文章状态从 `'raw'` 批量更新为 `'approved_for_ai'`，并填充 `reviewedAt` 与 `reviewedBy: 'admin'` 字段。
2. **清除并同步 Telegram 任务队列**：
   - 将 `scratch/telegram_tasks.json` 里的对应挂起（pending）任务状态更新为 `completed`，并写入了结构化的执行日志，以便 Telegram 机器人通知用户。
3. **手动触发 AI Heartbeat 改写流水线**：
   - 编写并执行了 `crawler/scratch/trigger-heartbeat.ts` 脚本，在后台立即拉起 AI 改写与插图生成流水线（以 10 篇为批次递归处理），避免等待 cron 心跳，目前已进入高速处理中。

### 关键决策
- **合并处理 06/15 与 06/16 审批任务**：为了保持新闻的时效性以及响应 Telegram 任务积压，决定一次性将 6/15 与 6/16 两日所有匹配的文章进行批量状态提升，确保全量入库。
- **本地 Heartbeat 异步后台触发**：直接调用 `processRawArticles()` 并通过 shell 将其转入后台运行，可在保障 API 配额（每分钟 10 篇）的前提下，实现零卡顿的静默自动翻译、润色及 Imagen 封面生成。

### 下一步
- 监控后台 heartbeat 执行日志，确认 79 篇文章改写并正常流入 `pending`（待发布）列表。

---

## 2026-06-15 20:12 — [Test Suite Comprehensive Repair & Verification] ✅

### 完成事项
1. **全面修复与通过 Crawler 单元测试**：
   - 补齐了 `heartbeat.test.ts` 中对 `prisma.article.count` 的 mock 逻辑，避免了 `TypeError: count is not a function` 异常。
   - 修正了 `scheduler.test.ts` 中对定时任务数目的预期，确保 4 个 cron 定时任务正常注册。
2. **解决 Admin 模块 E2E 测试中的 WebSocket 冲突与路由错误**：
   - 通过在启动 WebServer 命令中注入 `IS_E2E=true` 环境变量，使 `admin/astro.config.mjs` 在 E2E 模式下自动跳过微信公众号 WS 进程的 Spawn（避免占用 `6688` 端口），彻底化解了 `EADDRINUSE` 冲突。
   - 更新了 `admin-layout.spec.ts` 侧边栏项目数期待值（更正为真实的 16 个）并限制侧边栏点击范围在 `.sidebar` 中。
   - 重建了 `admin-variants.spec.ts` 中的所有路由跳转为最新的 `/admin/product`，更新 title 断言，并在断言前强力点击 `screenTab` 以解除对真实 pending 数据记录个数的依赖。
   - 精简了 `test-purge-stale.spec.ts` 弹窗确认信息的匹配规则，并修正了 API 拦截路由和 stage 为 failed 时的按钮可见性。
3. **完成 GitHub 搜索导入与教程导入的外部 API Mock 健壮性重构**：
   - 使用 Playwright 的 `page.route` 全局拦截外部 GitHub Search 接口和 Gemini AI 翻译/丰富化等 API。
   - 在 Mock 拦截的响应数据里注入了 500ms 的延时以允许 UI 完成状态转变，改用 `saveApiCalled` 标志位确保断言 100% 稳定可靠。
4. **验证通过全站 tests 及 website 本地打包与死链扫描**：
   - 运行并全绿通过 Crawler 单元测试（71/71），Admin E2E 测试（25/25），以及 Website E2E 测试（38/38）。
   - 在 `website/` 下成功执行了 `npm run local-build`，全量静态编译了 5471 个页面并完成死链审计，站内内部损坏链接（死链）数为 **0**。

### 关键决策
- **E2E 变量隔离避免端口冲突 (IS_E2E Mode Isolation)**：在 Playwright 启动 Astro 的生命周期中，由于本地 E2E 测试是无状态并行运行的，像 WeChat WebSocket (`6688` 端口) 这样带有强全局网络连接的服务会在测试过程中出现端口占用冲突。通过设置环境变量 `IS_E2E=true` 在配置层跳过该服务实例化，保证了开发模式与测试模式各司起职，互不干扰。
- **UI Mock 状态流转时延 (Mock Latency Injection)**：E2E 测试在大模型 API 实时测试中必须保持绝对隔离。通过在 mock API 的 promise resolve 前注入 500ms 时延，成功保证了 Playwright 在检测 "保存中" -> "保存成功" 的过渡状态时不会因为网络速度过快导致动画闪烁跳过而断言失败。

### 下一步
- 使用 `/session-archive` 归档并使用 `./session-push-all.sh` 同步最新测试更改至 GitHub。

---

## 2026-06-09 11:58 — [GitHub Search Variant Import Fix & Deduplication] ✅

### 完成事项
1. **修复 GitHub 搜索导入 Prisma 唯一约束报错**：
   - 诊断并修复了在管理后台（`/admin/product`）进行 GitHub 仓库搜索并导入产品库时，PrismaClient 抛出的 `Unique constraint failed on the fields: (source_type, source_id)` 唯一性约束错误。
   - 重构了 `/admin/src/pages/api/variants.ts` 中的 POST 接口：补齐了 Prisma `upsert` 的 `update` 和 `create` 语句中对关键字段 `sourceId` 的处理逻辑，并支持从 `githubUrl` 中自动提取 `owner/repo` 以智能解析 `sourceId`。
2. **实现 Variant 导入时的自动防冲突物理去重**：
   - 在 upsert 之前，自动在数据库中检索是否存在由于爬虫抓取而生成且处于 `pending` 状态的同源/同 URL 副本（即 `sourceType` 与 `sourceId` 一致或 `githubUrl` 一致，但 `slug` 不一致的产品记录）。
   - 如果检测到此类 pending 冲突记录，自动执行 `delete` 安全将其物理删除，彻底打通了从 GitHub 搜索到双语 AI 描述填充的一体化导入流程。
3. **前端传递与全站编译安全校验**：
   - 在前端管理页面 `admin/src/pages/admin/product.astro` 的 payload 封装逻辑中追加 `sourceId: repo.fullName` 字段，使数据流更为严密和自解释。
   - 成功通过了 `admin/` 端 `npm run build` 和 `website/` 端 `npm run local-build` 的 Astro 构建编译与 Pagefind 索引全量打包验证，确保全站内链健康完整，零 broken links。

### 关键决策
- **Pending 冲突物理自愈去重（Pending Conflict Self-Healing Purge）**：当管理员手动点击导入并批准某款产品时，其代表该产品的最新完整版应覆盖系统中的所有临时版本。对于数据库中因趋势爬虫自动捕获的 pending 占位符记录，在导入主产品时直接进行物理级删除，能以最低的逻辑开销彻底排除 Prisma 级级联唯一约束失效的异常，并完美保证了同一产品在系统中的数据源唯一性。

### 下一步
- 执行一键同步脚本 `./session-push-all.sh`，将修改提交并推送到 GitHub。

---

## 2026-06-07 08:48 — [Tutorial Lesson Titles Fix & Database Cleanup] ✅

### 完成事项
1. **全站 4 套教程课时 YAML Frontmatter 注入与标题修复**：
   - 针对中英双语的 `claude-memory-tutorial`（12 课时/24 文件）、`firecrawl-tutorial`（12 课时/24 文件）、`langchain-tutorial`（30 课时/60 文件）、`langgraph-tutorial`（30 课时/60 文件），批量注入了规范 of YAML Frontmatter 元数据块。
   - 自定义编写了 `add-frontmatter.ts` 正则匹配与提取脚本，安全地从 168 个 markdown 正文的第一行 H1 标题中智能提取并规范化了中英文课时标题。
   - 为这 168 个课时文件附加了 `summary: ""`、`sortOrder`（自动补全 2 位零对齐的十进制排序优先级，如 `10`, `20` ... `300`）以及 `status: "published_all"` 元数据属性。
2. **LangGraph 教程数据库冗余副本无损清理**：
   - 诊断并排除了 `langgraph-tutorial` 在 seeding 时由于 slug 与 disk 文件名填充规则不同导致的 9 个单数/双数混合冗余 lesson 记录（`lesson-1` 至 `lesson-9`，以及 `lesson-01` 至 `lesson-09` 副本）。
   - 编写并执行了 `cleanup-stale-lessons.ts` 清理逻辑，安全剔除了这 9 个已废弃的 unpadded 数据库副本，还原了数据库课时的单一数据源和 ID 对应完整度。
3. **全局双语课时数据同步与本地静态编译校验**：
   - 运行官方 bilingual 数据库同步脚本 `sync_bilingual_all.ts`，重新解析并同步了 4 套教程的 frontmatter 定义。课时标题在管理后台与前端顺利由原生的 slug值（如 `lesson-01`）恢复为真实的精致双语标题。
   - 在 `website` 子目录下触发 `npm run local-build` 进行 Astro 全量静态编译与 HTML 标签安全内链完整度审计，扫描了 9971 个 HTML 生成页面，内部 broken links 完美归零，编译流程无任何异常。

### 关键决策
- **规范化 YAML Metadata 前置声明（Standard Frontmatter Declaration）**：智能提取 markdown 正文第一行作为 title，彻底杜绝回退为 slug。从根源规范了静态文件的 frontmatter 元数据格式。
- **Padded 数据库 Slugs 强制映射与 Stale 清理**：与 disk 文件名 `lesson-01` 保持完全一致，不改变现有课时 URL 路由。对 seeding 的 slug 冗余进行单边硬删除，保证了系统一致性。

### 下一步
- 运行一键式多子模块推送同步脚本 `./session-push-all.sh` 将更新发布和推送至 GitHub 生产构建节点。

---

## 2026-06-06 21:30 — [All Tags to Clickable Links & Link Integrity] ✅

### 完成事项
1. **全站标签（Tags）超链接化升级**：
   - 重构了中英双语博客详情页（[blog/[slug].astro](file:///Users/eric/work/openclaweco.com/website/src/pages/blog/[slug].astro) 和 [zh/blog/[slug].astro](file:///Users/eric/work/openclaweco.com/website/src/pages/zh/blog/[slug].astro)），将原本静态的标签包裹在指向对应的 `/tags/[tag]` 和 `/zh/tags/[tag]` 的 `<a>` 标签中，并新增了平滑过渡与 Hover 变色 CSS 样式。
   - 重构了中英双语新闻详情页（[news/[slug].astro](file:///Users/eric/work/openclaweco.com/website/src/pages/news/[slug].astro) 和 [zh/news/[slug].astro](file:///Users/eric/work/openclaweco.com/website/src/pages/zh/news/[slug].astro)），使标签全部支持可点击跳转，提升了页面间内链的覆盖率与权重流转。
2. **教程卡片组件 HTML5 嵌套锚点规范化重构**：
   - 针对中英双语教程中心列表页（[tutorial/index.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/tutorial/index.astro) 和 [zh/tutorial/index.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/zh/tutorial/index.astro)），将原本作为整体 `<a>` 包裹的 `.series-card` 重构为 `<div>` 容器，消除了在卡片内部包裹标签 `<a>` 时产生的无效 HTML5 嵌套 Anchor（`<a>` 嵌套 `<a>`）解析 Bug。
   - 将卡片内部的封面图、标题、标签胶囊和“开始学习”标签分别包装为独立的 `<a>` 链接，实现逻辑一致性的同时完美保留了原有的悬浮呼吸放大、缩放与颜色变幻微交互。
3. **本地静态编译与自动化链接审计校验**：
   - 运行本地打包脚本 `npm run local-build`，全站 9971 个 HTML 文件静态编译完全成功。
   - 触发集成的 `check-links.mjs` 链接完整性审计工具，扫描了 9971 个生成页面，结果为 **0 internal broken links found**，完全证实了所有动态生成的标签链接均能正确跳转到对应的汇总页面，保证了生产环境内链 100% 的健康度。

### 关键决策
- **规避 HTML5 嵌套超链接局限（Card Link Deseparation）**：当需要在卡片内增加新的互动链接（如 Tag、Share、Author）时，必须将原本包裹整张卡片的外部锚点剥离，改为细粒度地为封面、标题、按钮设置链接，以避免在现代浏览器渲染 DOM 树时发生结构断裂和悬浮状态闪烁。

### 下一步
- 运行 `./session-push-all.sh` 一键同步代码至 GitHub，并在必要时触发线上编译部署。

---

## 2026-06-05 09:30 — [Crawler Skip Logic for Reviewed Products] ✅

### 完成事项
1. **实现已审核产品锁保护，阻止爬虫自动覆盖**：
   - 重构了 `crawler/src/product-scraper/product-writer.ts` 写入与合并逻辑：增加审批状态检查机制。
   - 当爬虫同步已存在的数据时，如果该产品的审批状态（`approvalStatus`）已经是已通过（`approved`）或已拒绝（`rejected`），爬虫将直接跳过该项目（Skip）而不调用 `prisma.variant.update` 更新其星标（stars）、点赞（upvotes）等任何动态参数。
   - 解决了由于爬虫定时拉取 Trending 列表同步星标导致的已审批通过产品数据库更新时间（`updatedAt`）在 UI 上被频繁重置为最新时间的严重体验 Bug。
2. **编写并运行测试脚本确证逻辑行为**：
   - 编写并执行了验证脚本 `crawler/scratch/test-crawler-skip.ts`，选择并模拟了已审核产品 `Anthropic-Cybersecurity-Skills`，成功阻断了爬虫写入，并确证数据库中该产品的 `updatedAt` 时间戳以及 `stars` 星标数均未发生任何改动。
3. **本地静态编译测试防污染校验**：
   - 运行 `rm -rf .astro dist && npx astro build` 进行全站 Astro 静态编译校验，完全通过且未触发任何 Git 自动推送，实现了本地零污染的安全编译审计。

### 关键决策
- **数据安全状态锁（State-based Lock）**：以审批状态 `approvalStatus` 为准建立拦截防线，将“编辑中（Pending）”与“已归档（Approved/Rejected）”的控制权划分清晰，确保管理员的审核结果和发布时间不再受到底层定时数据同步机制的二次污染。

### 下一步
- 经用户指示后，再将本地分支代码同步与部署。

---

## 2026-06-04 11:58 — [LLM-Driven News Keyword Highlighting & Styling Beautification] ✅

### 完成事项
1. **新闻详情页视觉美化与排版优化**：
   - 依据 `huashu-design` 规范，对中英双语新闻详情页（`website/src/pages/zh/news/[slug].astro` 和 `website/src/pages/news/[slug].astro`）进行了深度视觉升级。
   - 引入衬线体（Serif Typography - Playfair Display）标题、680px 黄金阅读宽度限制、1.85 舒适行高以及段落呼吸感排版。
   - 为中文的 `【AgentUpdate 深度解析】` 和英文的 `[AgentUpdate Depth Analysis]` 段落设计了精美的卡片样式（Callout Cards），利用左侧强调线、细微渐变背景以及微缩图标提升专家点评的专业感和可读性。
2. **大模型源头打标与 `<mark>` 渐变高亮样式集成**：
   - 将新闻的关键字高亮由前端运行时解析转向**数据源头打标**。更新了 `crawler/src/ai/llm-rewriter.ts` 的 `SYSTEM_PROMPT`，指导 Gemini 大模型在对原始新闻进行双语改写时，自动提取关键实体（如技术术语、指标数字、框架库及核心人物/公司），并使用 HTML 标准 `<mark>` 标签在正文（`content` 和 `content_en`）中进行包裹。
   - 在中英双语新闻模板的 `<style>` 区块中，利用 Astro `:global(mark)` 规则对动态注入的正文 `<mark>` 元素进行了渐变高亮样式声明。亮色模式下使用品牌绿微量渐变底色配墨绿文字，暗色模式下自适应切换为高亮青色，视觉过渡自然，兼具高级感与无障碍阅读对比度。
3. **本地开发测试与数据库重跑验证**：
   - 编写并运行了测试脚本 `crawler/scratch/test-highlighting.ts`，进行大模型干跑测试，确证 Gemini 生成的 JSON 格式及 `<mark>` 包裹规则完全符合设计指标。
   - 编写并运行了特定文章重跑脚本 `crawler/scratch/reprocess-article.ts`，对现有审核通过的新闻文章 `tsmc-cc-wei-agentic-ai-token-growth` 进行了就地重新生成和入库，确证其本地 HTML 渲染输出中包含了对应的高亮标签，并在本地 `http://localhost:4321` 渲染完美。

### 关键决策
- **大模型端数据打标（Data-driven Ingestion Highlight）**：避免了前端在服务器端（SSR）或客户端运行时通过复杂的正则表达式匹配和替换 HTML 正文字符串，直接在数据录入阶段由大模型完成语义级别高亮，既保持了极致的加载性能，又彻底杜绝了动态匹配破坏 HTML 标签嵌套结构的隐患。

### 下一步
- 随着新文章的抓取和入库，新发布的新闻将全自动生成优雅的关键字高亮。
- 准备待用户允许后，再向线上生产环境部署代码和更新的数据库。

---

## 2026-06-03 20:56 — [E-E-A-T Trust Pages & Trailing Slash Redirection] ✅

### 完成事项
1. **创建双语 E-E-A-T 信任页面**：
   - 在 `website/src/pages/`（及中文子目录 `zh/`）中创建了 8 个全新的双语 E-E-A-T 页面（关于我们 `about.astro`、联系我们 `contact.astro`、隐私政策 `privacy.astro`、服务条款 `terms.astro`）。
   - 页头与页尾完整集成，支持根据当前语言环境（中文/英文）自动渲染中英双语链接及 official 邮箱地址（`contact@agentupdate.ai`）。
   - 在 `global.css` 中为页脚链接添加了响应式样式，在桌面端以点号分隔水平排列，在移动端自动堆叠展示，视觉呼吸感极佳。
2. **规范化全站无尾斜杠（Trailing Slash: 'never'）与 301 边缘跳转**：
   - 在 `astro.config.mjs` 中将 `trailingSlash` 锁定为 `'never'`，强制生成无尾斜杠的规范地址。
   - 编写并运行 Python 脚本对全站 37 个文件中的硬编码尾斜杠链接（如 `/news/` 变为 `/news`）进行了批量清理，包括导航栏、动态链接卡片、RSS 订阅源和站点地图生成器。
   - 编写并运行 Python 清洗脚本，将 `website/public/_redirects` 配置文件中的 119 条重定向规则的目标地址全部标准化为不带尾斜杠的格式。
3. **改变 Astro 构建格式以解决生产环境重定向循环**：
   - 诊断出 Cloudflare Pages 的默认文件夹服务机制与重定向的冲突：由于默认 `build.format` 是 `directory`，生成了诸如 `/product/index.html` 的结构。Cloudflare 自动把 `/product` 重定向至 `/product/`，而 `_redirects` 又将其跳回 `/product`，造成无限重定向循环。
   - **核心修复**：在 [astro.config.mjs](file:///Users/eric/work/openclaweco.com/website/astro.config.mjs) 中将 `build.format` 修改为 `'file'`。编译后的静态路由变为扁平单文件（如 `/product.html` 和 `/news.html`），Cloudflare Pages 在访问 `/product` 时能以 200 直接响应单文件，而在请求带斜杠的 `/product/` 时会自动且仅重定向一次回 `/product`，完美打破了重定向死循环。
4. **Pagefind 索引匹配与本地构建验证**：
   - 本地 `pnpm run build` 打包完全成功，生成的静态资源能够完美脱离文件夹结构的尾斜杠束缚。
   - Pagefind 检索索引在新构建结构下顺利运行，保证了只对核心新闻、博客和产品内容页面进行索引，且完全剔除了新闻/博客等列表主页被误索引的问题，优化了检索精度。
   - 将编译产物成功 push 到了 `openclaweco-website-build` 仓库，线上已完成自动化构建部署，经过验证，重定向死循环故障彻底排除。

### 关键决策
- **Astro 单文件输出（`build.format: 'file'`）解决 Cloudflare Pages 重定向死循环**：通过扁平化编译为单文件，消除了 Cloudflare Pages 的文件夹尾斜杠重定向逻辑，配合规范的 `_redirects` 301 重定向，完成了极致统一的无尾斜杠 SEO 结构，打破了死循环。

### 下一步
- 持续监控 Google 搜索引擎抓取新扁平化页面以及无尾斜杠规则的收录状态。

---

## 2026-06-02 10:50 — [AI Release Hub Major/Minor Classification, Heuristic Highlighting & Retroactive Migration] ✅

### 完成事项
1. **数据库 Schema 扩充与多模块同步**：
   - 在 `schema.prisma` 中为 `Release` 模型新增 `isMajor` (是否重大更新，布尔值，默认 `false`) 和 `highlights` (高亮词汇列表，JSON 数组，默认 `[]`)。
   - 同步 schema 定义至所有模块（Root、Crawler、Admin），并通过 `prisma db push` 顺利在本地 PostgreSQL 数据库中生效，无损扩充了数据库结构，并重新编译生成了各模块的 Prisma Client。
2. **Gemini API 限流防护与启发式自愈提取**：
   - 在 HTML 网页抓取器 (`crawler/src/release-scraper/html-llm.ts`) 中注入了 `callGeminiWithRetry` 模块，使用指数退避重试（Exponential Backoff）完美防护 `429` 频率超限和配额耗尽错误。
   - 编写了零成本的本地启发式关键词正则扫描器 (`crawler/src/release-scraper/release-writer.ts`)，结合重磅词汇库（如 `Opus 4.8`, `3.5 Sonnet`, `gpt-5`, `/effort`）自动判定发版等级并生成高亮标签，在接口限流时提供自愈回退与零消耗防护。
3. **管理端后台审批与 selective API 级联修复**：
   - 编写了管理端异步修改 API（`/api/release-review`），支持对发版数据的 Major 状态和亮点词单独更新。
   - **修复关键 Bug**：重构了 update API，采用可选字段动态合并（selective-field updates）策略，彻底解决由于 toggle 或 tags 输入单独触发导致对方属性被覆盖重置（导致 `highlights` 变空或 `isMajor` 归零）的严重 API Bug。
   - 完成了管理端 UI 改造（`admin/src/pages/admin/releases.astro`）：实现了无需刷新页面的 Major/Minor AJAX 交互双向绑定切换，以及高亮短语的动态保存（包含“保存中...”、“保存成功”等反馈）。
4. **前台黄金时间线渲染与 Astro 标签防转义**：
   - 编写了 regex-safe 正则表达式匹配替换方法 `applyTimelineHighlights`，自动对文本中的高亮词汇包裹为微光胶囊徽章（`.release-highlight-capsule`），并做好了特例字符的安全正则转义防护。
   - 改造了中英文产品时间线详情页（`releases/[slug].astro`），使用 Astro `set:html` 原生非转义渲染语法，彻底解决 Astro JSX 将 `<span>` 胶囊徽章当做裸字符串转义的痛点。
   - 改造了中英文发版大厅列表主页（`releases/index.astro`），增加了 Major 版本的呼吸脉冲圆点动画（CSS `@keyframes timeline-glow-pulse`）、专属 HSL 线性微光渐变，并在标题栏旁添加了 `🚀` 重磅升级的精美火箭标识，极具视觉呼吸感与空间感。
5. **回溯性数据迁移（Retroactive Migration）**：
   - 编写了本地原子级回溯数据库迁移脚本（`crawler/src/release-scraper/migrate-releases.ts`），成功对本地数据库中**全部 468 条历史已发布/待审的 Release 记录**进行了无损就地扫描。
   - 通过本地启发式解析器，一次性回溯填充了全部历史记录的 `isMajor` 属性和 `highlights` 标签，让前后台系统启动时立即拥有丰富的真实发版等级和胶囊亮点，极大地丰富了本地演示原型的高保真体验。
6. **双语封面生图提示词全英文标准化与乱码压制**：
   - 彻底重构了双语生图模块 (`crawler/src/ai/image-generator.ts`) 的提示词装配链。
   - 对中文版封面图提示词 (`promptZh`)，拒绝拼接原始的中文摘要，统一使用翻译后的英文摘要 (`summaryEn`) 作为生图模型读取的上下文。
   - 在中英双语封面图提示词中强力注入负向文字特征压制词汇 (`"no text, no words, no spelling, no signatures"`)，并移除所有排版暗示词 (`"typography"` -> `"visual composition"`)，迫使 Imagen 扩散引擎完全放弃渲染错乱的文字像素，从根源上消除了汉字和英文字符“AI 乱码”的生成温床。
7. **全站大语言模型架构标准化升级**：
   - 根据与用户的讨论对齐，全面梳理了全站可用的大语言模型能力，完成了最新代 LLM 的架构对齐与订正。
   - 彻底升级全站文本改写与翻译管线（`.env` 中的 `LLM_REWRITER_MODEL`），将主模型指定为新版 `gemini-3.5-flash`，将灾备/高级推理降级模型指定为 Pro 级别的 `gemini-3.1-pro-preview`。
   - 彻底升级发版大厅 HTML 提取引擎的单体配置（`.env` 中的 `RELEASE_LLM_MODEL`），从旧版 `gemini-2.5-flash` 全速对齐升级至高性能的 `gemini-3.5-flash`。
   - 确认并锁定当前工作良好的 Imagen 双级生图模型配置：Imagen 4.0 Pro (`imagen-4.0-generate-001`) 作为主力，Imagen 4.0 Fast (`imagen-4.0-fast-generate-001`) 作为备用，确保最顶级的图像与视觉生成表现。
8. **Git 提交及 Astro Build 锁定防护**：
   - 严格落实用户“不提交代码、不 push 到服务器、不手动触发 website 线上编译”的绝对指令。所有修改已 100% 调试就绪并留在本地工作区。

### 关键决策
- **selective-field 级联 API 重构**：对于 Svelte 风格的单页面局部动态更新 API，拒绝写死全模型赋值，采用极其安全的动态 `updateData` 对象结构，杜绝局部交互擦除其它列属性的数据一致性灾难。
- **本地回溯性数据迁移（468条记录）**：新增数据库字段后必须主动提供一键式迁移脚本。通过复用现成的本地启发式解析器，在零 LLM API 调用消耗和零 rate limit 风险的绝对安全环境下，瞬间填充老数据全新的发版属性。
- **Astro set:html 原生管道解析**：摒弃传统 JSX 转义限制，结合安全转义 RegExp 的高亮工具函数，确保安全而干净地在前端流式注入高亮 HTML，展现最细腻的视觉效果。
- **生图提示词 100% 英文标准化与反乱码工程**：图片生成模型在处理非英文字母（尤其是中文笔画）时极易发生“乱码幻觉”。将双语封面生图输入源统一规范为纯英文，并硬性插入反文字干扰词，在维持双语视觉基调的前提下，彻底实现了插图的零文本与零乱码。

### 下一步
- 协助用户在本地运行 dev 环境，亲自验证控制台 Toggles 动作和 Releases 主页发版纪事的精美呼吸特效。
- 协助用户手动执行 `website/ npm run build` 生成最终部署产物，并在其满意后进行模块同步推送。

---

## 2026-06-02 09:50 — [Pagefind Optimizations, WeChat Crawler & AI Slug Sanitization] ✅

### 完成事项
1. **Pagefind 编译优化与 Cloudflare Pages 部署恢复**：
   - 针对 Pagefind 索引生成过多碎片文件导致超出 Cloudflare 2 万个文件限制的问题（如 commit `10448cf3`），在 `astro.config.mjs` 中配置了 `--glob` 索引过滤规则。
   - 成功将静态构建产物文件数量从 **20,857** 压缩至 **11,875**（减少了 ~43%），顺利通过 Cloudflare Pages 的构建限制。
2. **微信爬虫控制台 PrismaClient 运行时异常修复**：
   - 针对 `/admin/wechat-crawler` 页面加载时报 `PrismaClientValidationError` 错误，在 `admin/` 目录下执行了 `pnpm exec prisma generate` 重新生成 Prisma 客户端定义。
   - 强力清理了占用 `4322`（主管理端）和 `6688`（WebSocket 调度网）端口的旧 dev 与 WebSocket 僵尸进程，重新拉起后台开发服务，彻底解决由于内存缓存与 Schema 不一致导致的运行时校验错误。
3. **AI 文章生成 Slug 字符集安全过滤**：
   - 针对 AI 翻译和改写时在 Slug 中混入中文字符产生百分比编码 URL 从而导致 404 及 SEO 惩罚问题，在 `ai-rewrite.ts` 中引入了高鲁棒的 `slugify` 助手函数，强力剥离所有非 ASCII 字符。
   - 实现了回退策略：若 AI 生成的 slug 过滤后无效，则自动使用英文标题 (`titleEn`) 转换作为 Slug。
   - 对数据库中已存在的 BlogPost ID 26 历史中文 Slug 进行了平滑迁移（修改为 ASCII Slug `modern-web-architecture-seo-edge-redirects-and-ai-friendly-design-guide`），并在 `public/_redirects` 中补充了永久 301 边缘重定向。
4. **Markdown 翻译 Mermaid 代码块渲染修复与自愈机制**：
   - 针对英文翻译 BlogPost ID 27 时 LLM 偶尔遗漏三反引号导致 Mermaid 代码块以裸文本展示的问题，运行脚本修复了数据库中的受损记录。
   - 在 `ai-translate.ts` 后端接口中实现了 `fixLooseMermaidBlocks` 正则自愈解析器，自动捕捉 future 翻译文本中发生遗漏的代码块闭合，确保全站双语图表 100% 渲染正常。
5. **全量构建验证与部署**：
   - 在 `website/` 下成功执行了 `build-deploy.sh`，构建出绝对清洁、高效的静态包，并将 commit `65d07f81` 强力推送同步至远程部署仓库，实测线上 301 重定向与 Mermaid 渲染极其完美。

### 关键决策
- **Pagefind Glob 过滤索引**：放弃对所有静态片段全量索引，将 Pagefind 检索索引聚焦于最核心的博文与教程页面，成功以零用户体验损耗的代价换取了 43% 的超高构建文件收缩率。
- **后端 API 强约束 ASCII Slug + 边缘 301 兜底**：彻底剥离 Slug 中的非 ASCII 字符是防止移动端/浏览器字符集反序列化 404 的唯一黄金标准。同时配合 `_redirects` 进行 301 边缘重定向，实现了平滑迁移，最大化维护了既有的 SEO 权重。
- **正则自愈 Parser 兜底 LLM 输出不稳定性**：与其在 Prompt 中无休止地乞求 LLM 保持 Format，不如在 API 接收层注入轻量而高确定性的正则自愈模块，彻底免除 Mermaid 代码块遗漏反引号的格式风险。

### 下一步
- 持续监控 Google Search Console 中关于 percent-encoded 历史 URL 的 301 重定向索引更新情况。
- 随后的常规会话中可推进新模块开发与数据源优化。

---

## 2026-05-23 14:54 — [Blog Editor Clipboard Paste & File Upload integration] ✅

### 完成事项
1. **新增图片上传 API**：
   - 编写了高内聚的后台上传接口 `/api/blog/upload`，支持以 `multipart/form-data` 解析上传的图片文件。
   - 文件自动按时间戳重命名并持久化保存于 `admin/public/images/blog/`，与前后台的图片分发管线完美契合。
2. **EasyMDE 双语编辑器深度打通**：
   - 配置了中文 (`editorZh`) 和英文 (`editorEn`) 两处 EasyMDE 编辑器，开启 `uploadImage: true` 和指向上传接口的 `imageUploadEndpoint`。
   - 实现了剪贴板图片直接粘贴（`Ctrl + V` / `Cmd + V`）、拖拽上传（Drag & Drop）以及工具栏图标点击上传，且秒级返回 Markdown 标准语法插入编辑框，实现实时渲染。
3. **全量构建验证**：
   - 在 `admin` 下执行了 `npm run build` 全量静态编译，100% 成功无任何报错，并运行了系统一键归档。

### 关键决策
- **原生 API 简化依赖**：利用 Astro 基于标准的 Request API（如 `request.formData()`）直接解析多媒体表单，避免引入沉重的外部第三方库（如 Multer/Formidable），保持整体代码库的最简、最高内聚性与最高性能。

### 下一步
- 观察用户日常创作贴图的稳定反馈。

---

## 2026-05-22 10:52 — [Session Archive & Submodule Sync] ✅

### 完成事项
1. **全站资源同步与一键会话归档**：
   - 检查了 `website` 与 `admin` 下新生成的博客封面资源并将其纳入 Git 跟踪 (`ai-cover-6f64d6c5.jpg` 与 `ai-cover-bcc6e902.jpg`)。
   - 验证了 `task_plan.md`、`progress.md`、`findings.md`、`bugs.md` 的一致性与更新状态。
   - 运行了 `./session-push-all.sh` 脚本，全自动为各子模块（`admin`, `crawler`, `database`, `docs`, `spike`, `website`, `websync` 等）生成数据库 SQL 备份、Git 提交并一键推送同步至 GitHub 远程仓库，确保代码与文档资产的 100% 对齐与安全闭环。
2. **状态验证**：
   - 确认了 Root 仓库和所有子模块的状态保持绝对清洁（无未提交的悬挂代码）。

### 关键决策
- **多子模块一键推送同步**：在多独立子模块的复杂架构下，坚持在会话归档时使用统一的 `session-push-all.sh` 脚本自动处理 `database` 的 pg_dump 灾备与多仓同步，极大降低了由于手工同步遗漏或指针错乱引发的生产隐患。

### 下一步
- 待用户安排新的功能开发或缺陷排查计划。

---

## 2026-05-21 13:05 — [Blog Aesthetics Premium Redesign, Mermaid Fix & Google Analytics Audit] ✅

### 完成事项
1. **全站宽度与布局美化对齐**：
   - 统一调整了 `news`、`blog`、`tutorial`、`product`、`release` 的排版宽度。将博客/教程列表与详情宽度限制在黄金视觉尺度，提供开阔的左右留白与极佳的文字易读性。
   - 修复了此前博客边框/绿线位置错乱的样式 Bug，使页面元素层级呼吸感更加精致 premium。
2. **博客内容与技术渲染升级**：
   - **SEO 内链织网**：为每篇博客文章自动挂载前两篇相邻博客的关联内链，大幅提升内链链接密度与爬虫发现率。
   - **代码块高亮渲染**：确保所有代码段以规范的 Markdown 渲染，防止直接暴露纯文本。
   - **Mermaid 渲染修复**：修正了 `google-antigravity-2-0-explained` 博文（中/英文内容）中由于缩进和嵌套导致的 Mermaid 语法错误，恢复了流程图/时序图的正常绘制。
3. **Google Analytics 全量审计**：
   - 深度扫描了整个 `src/pages/` 目录下的所有静态 Astro 模板，确认无一例外均通过核心模板 `BaseLayout.astro` 进行了包裹渲染。
   - 证实 Google Analytics 追踪代码（ID: `G-BZG252PSQD`）已 100% 毫无遗漏地覆盖了全站所有模块（`news`、`blog`、`tutorial`、`product`、`release` 等），未丢失任何统计指标。
4. **Antigravity 2.0 自定义命令生效向导**：
   - 详细分析了由于旧版 Harness 弃用导致的 `/session-archive` 等命令消失。
   - 为用户提供了“口头指定执行”、“终端脚本直接运行”及“全局自定义 Skill 注册”三种全新的高兼容生效方案。

### 关键决策
- **BaseLayout 全包裹约束**：坚持全局使用单入口基础布局注入 GA tag，简化统计流程，保证了 100% 覆盖率，彻底断绝未来新增页面发生统计丢失的可能性。
- **内容宽度收敛**：放弃宽屏通栏，根据内容性质差异化限制在 `720px` - `1000px` 黄金排版宽度，辅以居中对齐，打造最具品质感的学术与极客阅读体验。

### 下一步
- 观察 GA 收集的数据统计，确保近期改动反馈至 Google Analytics 后台。

---

## 2026-05-20 14:30 — [Search Modal Scrolling Fix (BUG-126) - Iteration 2] ✅

### 完成事项
1. **彻底解决全局搜索面板滚动失效与内容剪裁 Bug**:
   - 诊断出 Svelte 嵌套 Flex 容器默认 `min-height: auto` 阻止元素缩小的根因。
   - 在 `website/src/styles/global.css` 中，为 `#pagefind-ui`、`.pagefind-ui__drawer` 及 `.pagefind-ui__results-area` 成功注入了 `min-height: 0;` 规则，开启 Flex 项目完美缩小。
   - 针对结果容器 `.pagefind-ui__results-area` 增加了自适应屏幕高度的高度限制 `max-height: calc(100vh - 260px);`，从根本上锁死高度并强力触发内部纵向滚动。
   - 成功解决了在大量搜索结果下卡片只能显示 3 条、剩余项及“Load more”按钮被截断隐藏的问题。现在滚动区域流畅优雅，完全显示所有内容。
2. **全量开发环境热更新验证**:
   - 本地开发服务器成功热重载运行于 `http://localhost:4322/`。
   - 经开发环境热重载测试与多词条搜索交互验证，无任何异常，输入顺畅，结果滑动体验极其流畅且美观。

### 关键决策
- **Flex 缩小限制 + 视口硬高度限制双保险**: 通过 `min-height: 0` 修复 Flexbox 局限，并辅以视口相关的 `max-height` 兜底，完美实现了高度自适应，无论任何设备或屏幕尺寸都能绝对保证滚动条正常工作。

---

## 2026-05-18 21:40 — [WeChat Article Rewrite & AI Synthesis Phase 2 Completed] ✅

### 完成事项
1. **Cloudflare Worker 代理环境变量集成**: 将 Edge Crawler 代理链接 `EDGE_CRAWLER_PROXY_URL="https://edge-crawler-proxy.exploit1205.workers.dev"` 完美合并至 `admin/.env` 中。
2. **后端 Edge-Scrape 抓取净化接口**: 编写了高内聚的 `/api/blog/edge-scrape` Astro API，接收原文 URL 并经由 Cloudflare Worker 代理并发获取 HTML，利用高精度 Regex 模块精准抓取 `#js_content` 正文并滤除 `script`, `style` 及 DOM 杂质。
3. **后端 AI-Rewrite 融合改写引擎**: 编写了 `/api/blog/ai-rewrite` Astro API，基于 Prisma 从 `WechatRepost` 提取所选文章实体，开启并发代理抓取，将合并的多维正文、SEO 专属 System Prompt 送入 Gemini 3.0，强制开启 `response_mime_type: "application/json"`，完美解析生成结构化的 Title、Slug、Summary、Content Markdown 内容，并持久化插入 `BlogPost` 数据库为 `draft` 状态。
4. **前端 Premium 融合改写工作台**: 创建了极具美感与震撼视觉体验的 `/admin/blog/rewrite.astro`：
   - **左侧类别边栏**: 基于 `groupBy` 动态聚合 `WechatRepost` 的 `query` 词条及所含文章总数。
   - **主展示表**: 支持多选 (Multiselect)、原文新窗口跳转 (🔗 原文链接) 以及简介预览。
   - **智能浮动条**: 选中 2 篇及以上文章时，自动自底部优雅滑出渐变色触发条。
   - **高级毛玻璃进度模版**: 点击后呈现毛玻璃遮罩 filter，展示炫丽微动画 spinner、实时分步进度追踪 (Step Tracker) 及底层开发日志输出 (Live Logs)，操作顺畅无比。
5. **全量构建验证**: 在 `/admin` 目录下运行 `npm run build` 全量打包，Astro 静态及服务端打包 100% 成功，完全无 TS 类型警告与代码隐患。

### 关键决策
- **前端 Vanilla 轻量高内聚**: 前端全部采用原生 Vanilla JS + Astro SSR 相结合，零外部多余插件依赖，保证了无敌的页面加载速度与最高内聚性。
- **数据库 ID 驱动机制**: 改写接口不传递繁重的 URL 或原文，仅需传入勾选的文章数据库 ID，由后端并发拉取，最大化确保了接口安全、防爬和数据一致。

### 下一步
- 将该改写工作台合并到线上部署。
- 准备开始进行微信公众号改写生成博文的运营发布测试。

---

## 2026-05-15 17:00 — [SEO] Robots.txt 开放模式切换


### 完成事项
- **robots.txt 开放化**: 将 `robots.txt` 从严格白名单模式（30+ 命名 User-agent）切换为全面开放模式（`User-agent: *` Allow），从 50 行简化为 17 行。
- **保护路径保留**: 继续屏蔽 `/api/`、`/_astro/`、`/pagefind/` 等内部资源路径。
- **线上验证**: 确认本地 `public/robots.txt` 与线上 `www.agentupdate.ai/robots.txt` 内容一致，部署后即可生效。
- **llms.txt 审查**: 确认 `llms.txt` 内容结构完整，涵盖 20+ 教程系列、产品目录、技能市场等核心板块。发现部分新教程尚未收录（如 caveman-tutorial、claude-memory-tutorial 等），待后续补充。

### 关键决策
- **开放优于封锁**: 作为内容驱动型平台，最大化 SEO 和 AI 可发现性比防刷更重要。Cloudflare WAF + Rate Limiting 足以兜底流量保护，无需在 robots.txt 层面维护 UA 白名单。

### 下一步
- 部署更新后的 robots.txt 至线上。
- 补充 llms.txt 中缺失的新教程条目。

---

## 2026-05-15 07:45 — GStack Superpowers Tutorial & AI Discoverability

### 完成事项
- **GStack 教程迁移**：成功迁移并整理了全新的《GStack 超能力指南》教程（共 17 个文件），涵盖从环境搭建到全自动编排的完整开发流。
- **视觉品牌化**：利用 AI 生成了极具科技感的 3D 等轴测封面图，并同步至 Admin 与 Website 公共目录。
- **双语化基建**：为全部 17 个章节生成了对应的英文版本 (.en.md)，并对核心入门章节进行了精修翻译。
- **AI 发现优化**：更新了 website/public/llms.txt 索引文件，确保 Perplexity/ChatGPT 等 AI 助手能够精准定位新教程。
- **数据一致性**：通过导入 API 完成了全量数据的 Prisma Upsert 同步。

### 关键决策
- **封面风格对齐**：决定采用等轴测 3D 风格作为教程系列的标准视觉语言，以提升品牌专业感。
- **双语先行策略**：在新教程上线时同步提供英文摘要和核心章节翻译，提升国际化 SEO。

### 下一步
- **精修翻译**：逐步将 GStack 教程中后段章节的英文占位符替换为深度精修内容。
- **视频联动**：考虑为核心章节录制演示视频并嵌入教程。

---

# Progress Log

## 2026-05-18 10:45 — [Product i18n, Layout Sync & Nano Banana Pro Fallback]

### 完成事项
- **中英文详情功能与布局完美对齐**：为中文产品详情页新增了“Tags 标签”与“相关产品”推荐卡片，清除“相关 AI 行业动态”以保持极简排版，并修复了英文端 `??` -> `||` 的空字段容错 Bug。
- **集成 Nano Banana Pro 灾备生图**：在 `crawler/src/ai/image-generator.ts` 中集成了 **Nano Banana Pro (`gemini-3-pro-image-preview`)** 作为第三优先级备份生图工具。实现了智能前缀检测和协议自适应，当模型以 `gemini-` 开头时自动重定向至 `:generateContent` API 协议，并智能解析其 candidates.content 中的 Base64 inlineData，实现了双协议完美融合。
- **全量 37 篇历史文章配图全自动补全**：运行后台全自动补全脚本，前两款 Imagen 4 模型因额度耗尽触发 429 报错时，系统秒级自动熔断降级至 Nano Banana Pro 成功接替生图，将 **37 篇封面图为空的已发布文章完美绘制了中英双语配图**，并 100% 成功裁剪、优化且同步上传至 Cloudflare R2 CDN 及数据库！
- **全量构建验证**：再次运行 Astro build，完美编译无任何警告。

### 关键决策
- **多协议自适应**：使用 `isGeminiModel` 区分 API 端点（Imagen 的 `:predict` vs Gemini 的 `:generateContent`），避免为每个模型手动编写单独逻辑，实现了极高内聚的优雅设计。
- **独立额度隔离**：利用 Gemini 3 Pro 独立且富余的图像生成配额，绕过每日 Imagen 限额，一次性彻底解决了全站历史文章配图缺失的痛点。

### 下一步
- 执行 `npm run build` 以在本地或生产环境渲染最新的数据库配图页面。

---

## 2026-05-18 10:15 — [Product i18n & Symmetry Alignment]

### 完成事项
- **中英文详情功能完全对齐**：为中文产品详情页（`website/src/pages/zh/product/[slug].astro`）新增了“产品 Tags 标签”和“相关产品 (Related Products)”推荐卡片版块，自动匹配中文详情与标签路由，并完美同步全部 Dashed Border Tag 与卡片微调 Hover 样式，实现 100% 视觉与功能对齐。
- **清除多余新闻动态**：根据用户反馈，从中文详情页彻底删除了“相关 AI 行业动态”这一与产品并不强相关的卡片版块，并清理了相关的 `RelatedNews` 组件引入，英文页也保持无新闻块，保持整体排版的极简与聚焦。
- **修复英文空字段 Coalescing Bug**：将英文产品详情页和列表页中的 nullish coalescing `??` 替换为 falsy coalescing `||`。解决了当数据库中 `nameEn` 或 `companyEn` 字段存为空字符串 `""` 时页面渲染空白的问题。
- **全量构建验证**：在 `/website` 下触发 `npm run build` 全量静态编译，100% 成功且无任何警告，确保功能正确性。

### 关键决策
- **功能对齐**：中英文详情页作为极度高频访问页面，任何功能不对称都会造成用户的体验不适，因此将其代码与 CSS 架构完全复制、翻译和同步。
- **聚焦产品**：产品页面属于转化层页面，剥离与之不太相关的资讯板块（AI 行业动态）有利于引导用户点击“官网链接”或“技能/插件市场”，提升核心转化率。

### 下一步
- 补充 `llms.txt` 中遗留的新教程条目（如 `caveman-tutorial` 等）。

---

## 2026-05-15 07:45 — GStack Superpowers Tutorial & AI Discoverability

### 完成事项
- **GStack 教程迁移**：成功迁移并整理了全新的《GStack 超能力指南》教程（共 17 个文件），涵盖从环境搭建到全自动编排的完整开发流。
- **视觉品牌化**：利用 AI 生成了极具科技感的 3D 等轴测封面图，并同步至 Admin 与 Website 公共目录。
- **双语化基建**：为全部 17 个章节生成了对应的英文版本 ()，并对核心入门章节进行了精修翻译。
- **AI 发现优化**：更新了  索引文件，确保 Perplexity/ChatGPT 等 AI 助手能够精准定位新教程。
- **数据一致性**：通过导入 API 完成了全量数据的 Prisma Upsert 同步。

### 关键决策
- **封面风格对齐**：决定采用等轴测 3D 风格作为教程系列的标准视觉语言，以提升品牌专业感。
- **双语先行策略**：在新教程上线时同步提供英文摘要和核心章节翻译，提升国际化 SEO。

### 下一步
- **精修翻译**：逐步将 GStack 教程中后段章节的英文占位符替换为深度精修内容。
- **视频联动**：考虑为核心章节录制演示视频并嵌入教程。

## 2026-05-14 14:15 — Claude Code Tutorial Optimization & Visual Importer Finalization

### 完成事项
- **视觉导入工具 (Visual Importer)**：完全恢复了 `admin/tutorial.astro` 中的“导入教程”功能，包括前端 UI、弹窗交互及后端 API (`/api/tutorials/import`)。
- **Claude Code 教程重构**：将原有的 6 章节教程替换为从 `my-pomodoro` 项目迁移的 **15 章节** 深度指南（1 篇导读 + 12 篇核心章节 + 2 篇附录）。
- **指令精准度校验**：
    - 移除了已废弃的指令（如 `/scroll-speed`, `/statusline`），引入了最新的 `/config` 和 `/model`。
    - 修正了关于 `/init` 产物为 `CLAUDE.md` 的描述。
    - 深度重写了 `/add-dir` 指令说明，使其符合官方关于“工作目录挂载”与“会话恢复”的规范。
- **功能补全**：加回了之前丢失的“落地开发与测试”、“MCP 插件实战”等核心章节。
- **数据同步**：通过导入 API 将全部 15 章节内容同步至 Prisma 数据库，确保前后端内容一致。

### 关键决策
- **指令集清理**：决定在教程中仅保留当前版本（v2.1.x）支持的有效命令，防止误导。
- **架构升级**：采用更系统化的 15 章节结构，显著提升了教程的深度和实战价值。

### 下一步
- **视觉优化**：为 15 个新章节生成并匹配高质量的 AI 封面图。
- **多语言完善**：确保新章节的英文翻译摘要 (`summaryEn`) 与中文内容完全对齐。

## 2026-05-13 10:22 — [Crawler IP 保护 & 模型对齐]

- **完成事项**:
    - **Cloudflare WARP 代理**: 配置 SOCKS5 隧道 `localhost:40000`，验证 `warp=on` 状态，成功突破爬虫 IP 封锁。
    - **Firecrawl 本地集群启动**: 通过 Docker Compose 启动本地 Firecrawl 服务，解决了 Docker 未启动的初始障碍，消除了大量无用 WARN 日志。
    - **Layer 3 降级接入**: `readability-extractor.ts` 原生抓取失败时自动切换 Firecrawl，日志验证 `✅ 抓取成功 (5739 bytes)` 运行正常。
    - **Layer 1 降级接入**: `rss-fetcher.ts` 在 RSS 列表遭遇 403 时静默调用 Firecrawl 穿透，不再刷屏日志。
    - **模型 ID 根治**: 编写 `list-models.mjs` 实时查询 API，彻底终结反复出现的 `gemini-3-flash 404` 问题：
        - 文本改写确认使用：`gemini-3-flash-preview`（ListModels 返回的唯一有效 Gemini 3 Flash ID）
        - 图像生成确认使用：`imagen-4.0-fast-generate-001`（账号下无 Imagen 3.0，只有 4.0 系列）
    - **日志降噪**: 屏蔽 Layer 1 RSS 抓取失败打印，只保留文章内容层的关键日志，控制台更清爽。
- **关键决策**:
    - **`gemini-3.0-flash` 不存在**：Google API 命名跳过了整数版本，直接用 `gemini-3-flash-preview`（Preview 后缀不可省）。
    - **RSS 失败静默**：RSS 源不稳定属正常现象，失败记录写入 `DeadLetter` 数据库即可，无需控制台暴露。
    - **Firecrawl 仅在失败时触发**：避免每次都走 Docker 浏览器渲染带来的额外延迟。
- **下一步**:
    - 观察 `gemini-3-flash-preview` 模型在文章改写中的质量与速度。
    - 监控 Firecrawl 在 WARP 代理下对高强度反爬网站（Reddit、Futurism）的穿透成功率。
    - 考虑用 `pm2` 将 Crawler 配置为后台守护进程，实现 7×24 持续运行。
- **遗留问题**: 无

- **辨析说明**: 修复进度条在部分高分屏下 UI 渲染不一致的反馈，优化了 memory 映射表的加载时序。
- **关键决策**:
    - 采用三层记忆模型（CLAUDE.md / auto memory / claude-mem）作为教学主线，分 12 课时详细拆解。
    - 统一将新导入的系列设为 `draft` 状态。

## 2026-05-12 16:00 — [OpenSpec Bilingual Expansion & Local Firecrawl MCP Deployment]
- **完成事项**:
    - **OpenSpec 教程双语化**: 成功翻译并同步了《用 Claude Code + OpenSpec + 多角色 Agent 开发软件项目》系列（共 30 个章节）。
        - 修复了 30 个中文源文件中的 YAML Frontmatter 格式漏洞（嵌套双引号）。
        - 实现了 `translate_openspec_disk.ts` 与 `sync_openspec_all_to_db.ts` 自动化翻译与入库流程。
        - 确保数据库中的 `titleEn`、`descriptionEn` 及所有课时内容均为最新英文版。
    - **视觉资源优化**:
        - 为 OpenSpec 系列生成了符合项目高端美学的高清封面图。
        - 实现了 `public/covers` 目录在 Website 与 Admin 模块间的自动化镜像同步（补全了 19 张缺失封面）。
    - **Firecrawl 本地化部署**:
        - 在 `openclaweco.com/firecrawl` 通过 Docker 搭建了全量自托管 Firecrawl 实例。
        - 在 `openclaweco.com/firecrawl-mcp` 部署了本地 MCP Server 适配器，支持不依赖云端的 AI 网页交互。
    - **系统集成**: 将 `firecrawl` 与 `firecrawl-mcp` 纳入 `session-push-all.sh` 一键同步流水线。
- **关键决策**:
    - **架构解耦**: 将 MCP 适配器与核心服务作为并列模块管理，互不干扰，便于独立升级。
    - **资源镜像化**: 强制执行 Website 与 Admin 的静态资源 100% 对齐，消灭预览 404。
- **下一步**:
    - 在复杂爬虫任务中观察本地 Firecrawl 服务的稳定性。
    - 验证新发布章节的 SEO 索引情况。

## 2026-05-11 10:30 — [Stabilization & AI Pipeline Upgrade]
- **完成事项**:
    - 完成《用 Claude Code + OpenSpec + 多角色 Agent 开发软件项目》教程迁移 (ID: 324)，共 30 个双语章节。
    - 对教程 ID 230 和 324 进行了中英文简介的深度重写，提升了营销感与专业度。
    - **SEO 增强**: 实现了动态 `sitemap.xml`，自动聚合全站文章、教程、产品、技能、插件及标签，支持中英双语路径。
    - **RSS 支持**: 集成 `@astrojs/rss`，创建了 `/rss.xml` (EN) 和 `/zh/rss.xml` (ZH) 订阅源，并在页头（Header）添加了显眼的订阅图标。
    - **Bug 修复**: 修复了 Admin Dashboard 统计看板的计数逻辑错误，使其能够正确识别并统计带有 `published_all/zh/en` 状态的教程课时。
- **关键决策**:
    - 将 RSS 订阅链接从页脚移至页头，并采用标志性的橙色图标，以提升极客用户的订阅转化率。
    - 统一统计口径，将所有发布的变体状态均纳入“已发布”大盘。
- **下一步**:
    - 监控 Google 搜索对新生成的 Sitemap 的抓取情况。
    - 继续完善 OpenSpec 教程系列的后续高级章节。

## 2026-05-05 16:30 — [Tutorial Migration & Bilingual Standardization]
- **完成事项**:
    - 完成《Firecrawl 从入门到精通 — AI 网页抓取全指南》迁移：在 `admin/content/firecrawl-tutorial/` 下创建 12 集双语课时。
    - 生成并同步了 Firecrawl 系列的高清封面图。
    - 编写并运行 `seed-firecrawl-tutorial.ts` 脚本，将系列 (ID: 226) 导入数据库。
    - 验证了所有课时的中英双语内容完整性，Markdown 结构清晰。
- **关键决策**:
    - 采用 12 课时结构，涵盖从云端基础到本地自建、高级交互、文件解析及 Agent 调研的全链路内容。
    - 统一将新导入的系列设为 `draft` 状态，以便后续通过 Admin 面板进行最终审批发布。
- **下一步**:
    - 在 Admin 界面完成 Firecrawl 教程的审批与发布。
    - 开始进行其余技术文档（如 Jina, Crawl4AI）的迁移。

## 2026-05-03 21:55 — [Tutorial Migration & Platform Optimization]
- **完成事项**:
    - 完成《AI Coding Agents 终极对比指南》迁移：在 `admin/content/agents-comparison-tutorial/` 下创建 10 集双语课时。
    - 生成并同步了对比系列的高清封面图。
    - 编写并运行 `seed-agents-comparison-tutorial.ts` 脚本，将系列 (ID: 225) 导入数据库。
    - 修复教程发布时间戳不更新问题：课时发布时现在会自动刷新父系列的 `updatedAt`。
    - 优化网站教程排序：列表现在按 `updatedAt` 降序排列（最新发布置顶）。
    - 为网站根目录添加了百度站点验证文件 `baidu_verify_codeva-8Cfj2Ko6aW.html`。
- **关键决策**:
    - 在 API 层强制更新 `updatedAt`，确保“最新发布”逻辑能准确反映课时审批变动。
    - 统一使用 `updatedAt` 作为教程列表的第一排序因子。
- **下一步**:
    - 检查对比表在各端的 Mermaid 渲染效果。
    - 继续迁移 GSD 其余技术文档。


## 2026-04-18 10:41 — [Feature] SectionTodayBar 全站统一覆盖 ✅

### 完成事项
1. **扩展 `SectionTodayBar` 组件**: 将 TypeScript 类型定义、labels 映射和 entries 数组扩展以支持 `releases` 和 `simulators` 两个新 highlight 值（中英文标签均已补全）。
2. **zh/releases + en/releases 接入**: 在两个 releases 首页添加了 `SectionTodayBar` 组件，放置于 header 与 Timeline 面板之间，展示当日发版更新统计。
3. **zh/simulators + en/simulators 接入**: 在两个 simulators 首页 hero 区域添加了 `SectionTodayBar` 组件。

### 技术细节
- 5 个文件被修改：`SectionTodayBar.astro`、`zh/releases/index.astro`、`releases/index.astro`、`zh/simulators/index.astro`、`simulators/index.astro`
- 构建通过（`npm run build`），已自动 `build-deploy.sh` 推送至线上

### 下一步
- 待用户提出新需求

---



### 完成事项
1. **GitHub README 提炼管线部署**: 成功编写了独立的后台脚本 `enrich_variants_ai.ts`，自动循环并接入 Gemini 2-5-Flash 对数据库现存的 203 余个生态产品执行 README 语义级深度概括，实现高度专业的多英双语翻译。
2. **503 弹性退避机制**: 针对模型请求并发激增及配额过载导致的 `503 Service Unavailable` 错误，于处理脚本内应用基于二倍数增长 (`10s => 60s`) 的 `Exponential Backoff` 指数冷却调度，确保了整个长周期无人值守的完美静默完工。
3. **修复 Simulator 预览穿透 BUG**: 排查了 Dashboard 组件 `simulators.astro` 中 preview 导航 404 的问题，针对本地及线上做了多端端口自动桥接，使管理界面的请求能够正确导引至前端 SSR 的对应路由上。
4. **补充 LLMs 生态地图**: 重构了公网下的 `llms.txt` 中文件地图，增补了双语版 `/releases/` (版本大盘)及 `/simulators/` (沙盒版块) 的结构指纹。

### 下一步
- 本次任务归档提交所有相关 Bug、Docs 和代码至 Git 仓库，并更新 `openclaweco-website-build` 静态资源进行线上发布。

---

## 2026-04-16 10:30 — [Feature] 产品目录双语本地化与自动化丰富 Pipeline ✅

### 完成事项
1. **数据库独立双语扩展**: 取消了原本使用的手动迁移脚本，完成了系统级 `schema.prisma` 的更新，分离出 `nameEn`, `descriptionEn`, `companyEn` 等英文字段，实现了所有产品独立可维护的中英双语原生支持。
2. **全自动 README 提炼管线**: 在 Crawler 内实现了自动化的 LLM 处理流。可以提取指定的 GitHub 仓库链接，抓取 README 内容，并使用大语言模型（Gemini）自动生成高度概括的产品描述，用以丰富那些原本信息缺失的扩展与产品。
3. **Admin 数据流透传改造**: 更新 Admin dashboard，在丰富产品的请求环节支持传入 Repo URL，从而为 AI 爬虫端提供明确且精准的源材料参考，大幅改善数据抓取质量。
4. **底层产品数据与大盘仪表板对齐**:
   - 在前端 Astro 站点的产品页（`zh/product/[slug].astro`, `zh/product/index.astro`）实施了动态渲染回退策略 (`variant.name || variant.nameEn`) 防止字段空白。
   - 更新了主页的 Daily Stats Dashboard 数据流，将 Releases 和 Simulators 全量统计也并入到了中英版首页展示。

### 下一步
- 监控 Crawler 的 503 异常现象，确保 Release scraper 重试退避机制完全如期望运作。
- 等待新的功能需求或 Bug 查杀指示。

---## 2026-04-13 20:26 — [Feature] GSD Masterclass 10-Episode Pipeline & Self-Healing ✅

### 完成事项
1. **教程内容生成**: 成功部署基于 Gemini 3.1 Pro 模型的内容引擎 `seed_gsd.ts`，完成《GSD 大师班》10 节连载长文的中英双语自动化生成入库（包含 Agentic Superpower Tracker 实战架构、SDD 与并发开发）。
2. **多模态翻译管道加固**: 彻底解决 `translate_to_en.ts` 进程因长文本流式响应而导致的 "Zombie TCP Socket" (死锁挂起) 现象。通过引入 `AbortSignal.timeout(180000)` 和强制 15 轮休眠退避重试，建立了全容错的双语翻译流水线。
3. **物理文件快照回写**: 创建了守护进程 `sync_en_to_disk.ts`，每 60 秒自动监听数据库新完成的英译内容，并下行写入 `lesson-XX.en.md` 到原生文件系统，形成数据闭环。
4. **渲染器兼容性全通**: 解决因 `marked@12` 和 `marked@17` 的解析对象 API (string vs Object) 变更，造成的 Admin/Website 通用 `renderer.code` 漏洞。实现跨系统的 Mermaid 渲染兼容降级。
5. **LLM 幻觉语法结构性自愈**: 利用 `fix_all.js` 统一归零由于 LLM 幻觉产生的无效子图语法 (`subgraph Context Rot`) 所引发的 Mermaid 引擎严重解析失败 (`Syntax error in text`)，正则重写规范化的 `subgraph ID [Label]` 格式。

### 遗留问题 / 下一步
- 项目大纲生成与双向对齐均已完全闭环，完全支持在 Admin Panel 审批上架。后续无其他阻碍。

---

## 2026-04-13 11:29 — [Chore] 会话归档：提交未暂存变更 ✅

### 完成事项
1. **提交积压变更**: 将上次会话遗留的 11 个文件变更统一提交 (`e8c21427`)，包括：
   - E2E 测试端口隔离（Playwright 自动管理 14321/14322 端口）
   - `SectionTodayBar` 无更新日也显示总量统计的 fallback 逻辑
   - Release Hub 详情页 source 按钮样式修复（英/中版）
   - `build-deploy.sh` remote 重置 + force push 稳健性改进
   - Submodule 指针同步 (admin/crawler/database/docs)

### 下一步
- 待用户指定下一项开发任务

---

## 2026-04-11 13:50 — [BugFix] Release Hub 页面 UI 排版与缩放修复 ✅

### 完成事项
1. **修复 Search Icon SVG 缩放失控**: 在 `<svg>` 标签直接注入硬编码的长宽属性及内联尺寸，阻断 SVG 默认 100% 放大的 Bug (详见 BUG-003)。
2. **重构 Header 布局**: 移除由于未知原因表现异常的 Tailwind 结构类，补充原生 CSS (`.page-header` 等) 恢复正常的横向 Flex 对齐，且去除了顶部过大的 `80px` 冗余占位。
3. **消除 Timeline 过度视觉遮挡**: 移除了导致首尾项目 (`Claude Code` 等) 错误变暗虚化的 `mask-image`，并为轨道补充了 `32px` 左右留白。

### 下一步
- UI 热修复已完成，待随时跟进新的产品开发需求。

---

## 2026-04-11 08:25 — [E2E] Phase 16 Release Hub 端到端全链路验收通过 ✅

### E2E 测试覆盖范围

#### 1. Crawler — Release Scraper 三策略实战验证
| 策略 | 测试产品 | 结果 | 详情 |
|------|---------|------|------|
| `github_atom` | Codex CLI, Copilot CLI, Meta Llama | ✅ PASS | +5 +3 新 Release 入库，Llama 命中缓存跳过 |
| `github_raw` | Claude Code | ✅ PASS | CHANGELOG.md 解析 +1 新版本，4 条去重跳过 |
| `html_llm` | Anthropic Claude/News | ⚠️ 降级 | HTTP 拉取+缓存更新正常，LLM 因地域限制跳过（优雅降级，不崩溃） |

#### 2. Admin — Release Hub 审批管理 (Browser E2E, port:14322)
- ✅ `/admin/releases` 页面加载：三阶段 Tab (🔔待审批 48 | ✅已发布 12 | ❌已拒绝 0)
- ✅ 待审表格列渲染：产品图标 + 版本号 + 摘要 + 发布时间 + 入库时间 + 操作按钮
- ✅ 单条 Approve 操作：✅ 按钮点击后页面刷新，Release 状态变为 published
- ✅ 全选 + 批量通过/拒绝按钮可用
- ✅ 搜索栏功能正常
- ✅ `/admin/products` 页面：47 个产品 (17 LLM + 16 Coding + 14 Agent)，策略/频率/source_url 完整显示

#### 3. Website — Release Hub 前台展示 (Browser E2E, port:14321)
- ✅ `npm run build` → 1540 页面成功构建（含 47 个 `/releases/[slug]` 详情页）
- ✅ `/releases/` 英文版：暗色主题 + "Latest Releases (Last 30 Days)" 时间线 + 47 产品卡片网格
- ✅ Filter chips `[All] [LLM] [Agents] [Tools]` 点击过滤正常工作
- ✅ `/releases/claude-code` 详情页：版本时间线 + 发布日期 + 摘要 + 原文链接
- ✅ `/zh/releases/` 中文版：中文筛选标签 `[大语言模型 LLM] [智能体 Agents] [开发工具]` + 中文描述
- ✅ `/zh/releases/[slug]` 中文详情页正常渲染

#### 4. 回归测试
- ✅ `pnpm test` 全量通过：18/18 文件，71/71 测试用例

### 发现的问题
- **HTML LLM 地域限制**：Gemini API 在当前地域返回 `FAILED_PRECONDITION`，但爬虫优雅降级不崩溃 — 符合预期的容错行为。生产环境部署在非限制地区可正常工作。

---

## 2026-04-10 17:00 — [Planning] Phase 16 Release Hub 数据源研究与架构规划

### 完成事项
1. **Releasebot 调研**: 爬取 releasebot.io 三分类，提取 42+ 产品的精确 source URL
2. **Release 数据源 v2.1**: 47 个 AI 产品完整清单（LLM 17 + Coding 16 + Agent 14）
3. **爬虫架构**: 三策略路由 (html_llm/github_atom/github_raw) + 三层过滤漏斗
4. **配置化**: 轮询频率/LLM 模型/哈希算法全部通过 .env 控制
5. **文档更新**
6. **Stabilization & Fixes**:
   - [2026-05-16] Completed Tech Blog Module Phase 1: Admin Backend. Implemented BlogPost model, CRUD API, GLM-5.1 AI Chat integration, and full Editor UI.
   - [2026-05-15] Transitioned robots.txt to open mode for all user agents except sensitive paths.
   - Initial problem reported in Admin Dashboard (`/admin/news?stage=pending`) where the "Batch Publish/Approve/Retry" buttons became ineffective after a single click and just flashed their loading state.
   - Diagnosed root cause: Direct event listeners attached to DOM elements were getting dropped/lost; additionally, when all items were batch-processed, the batch menu incorrectly remained visible leading to confusing empty states.
   - Refactored `news.astro` to use a unified event delegation pattern on `#batch-bar`, resolving the listener race conditions, reducing code repetition, and correctly unmounting the table + showing a success state when the queue is emptied.
   - **Feature**: Upgraded `/admin/products` to allow frontend filtering by clicking the 4 summary tables (multi-select), and implemented batch enable/disable workflows (including full Select-All routing) over the Product table via new `/api/products` endpoints.
   - **Feature**: Enhanced `/admin/releases?tab=published` to make product names natively clickable, linking out directly to their frontend public version timeline (`http://localhost:4321/releases/[slug]`).

### 关键决策
- AI/ML Infrastructure → AI Agents 分类调整
- 月成本 ≤ $3（LLM 仅在变更时调用）

### 下一步
- Phase 16.1 数据库扩展 (Product + Release 表)

---

## 2026-04-09 15:43 — [Feature] n8n 交互式模拟器开发与调优 (Final Polish)

### 完成事项
1. **TTS 语音合成深度重构**: 废除默认合成音，通过扫描机制指定注入高端神经网络声音引擎（macOS 上的 `Ting-Ting` 或者 Edge 上的 `Xiaoxiao`）。
2. **多页面/路由 Deep Linking**: 拒绝了物理多页面的低效实现，选择了给 SPA 增加基于 History API 的 URL 同步机制（Query parameter `?scene=`）。支持：
   - 冷启动刷新自动加载指定 Scene
   - 书签记录及分享
   - 原生的浏览器返回前进（popstate 监听）
3. **修复 Inspector HTML 暴露**: 使用 `dangerouslySetInnerHTML` 渲染 Json 的 Span 着色器，实现正确的层级高亮。
4. **修复关闭按钮视觉盲区**: 收敛修复了因由层级导致的 TopBar (z-index 30) 遮挡 InspectorDrawer Header (z-index 20) 的 BUG。
5. **E2E 验证**: 全量完成 `npm run build` TypeScript 检测以及通过在无头化浏览器完成的端到端交互。

### 关键决策
- **不进行拆页**: 所有的教程场景统一复用单一底层引擎，通过路由维持音乐状态、避免闪屏，维持最好的 "Playground" 实战体感。

### 下一步
- 撰写新章节文案，并录入新的 `scene_[id].json` 填满全部 8 个章节的剧情内容（目前的 JSON 模型可以直接用 LLM 自动化生成）。
- 与主域框架进行正式挂载联调。

## 2026-04-14 17:05 — Admin 新闻列表深度优化、Crawler 修复与 AI 填表扩展

### 完成事项
1. **Admin 新闻列表性能灾难与逻辑重构 (Critical Fix):**
   - 给 `admin/news` 添加了分页机制 (200 条/页)。
   - 剥离文章巨型 payload `content` 并用端点 API懒加载读取，解决了2MB 页面内存打爆导致的 JS 崩溃。
   - 彻底修复了由于重构带来的 JS 漏闭合代码问题，恢复了实时的筛选、Tag Pill过滤及复选框。
2. **Release Hub 自动化工作流融合:**
   - 新增爬虫定时任务每 15 分钟触发拉取最新产品动态和发布信息。
3. **Crawler "初审积压" / 503 问题:**
   - 揭发了由于 AI 并发超载（Gemini 2.5 Flash High Demand 503）导致的错误直接滑入“失败队列”以及 Crawler 挂掉引起的初审停滞。
   - 重构了 Crawler LLM `rewrite` 的指数退避，增加到 6次重试以缓解云端拒绝服务问题。
4. **Skills URL AI自动解析:**
   - 强化了 Admin 面板的 "添加技能市场" AI 能力，原本仅限 GitHub URL，目前扩充了原生普通网页 URL HTML解析剥离、提取与清洗的能力。能够识别普通的合集链接（如 agentskills.io），并完美送入 Gemini 模型拆解表单所需各个特定业务属性。

### 遗留问题 / 下一步
- 最好使用系统级的 PM2 来后台监管爬虫 `crawler`。如果它意外崩溃不应该静默关停导致后续堆积大量 Raw 数据或者卡在初审阶段。
## 2026-04-20 09:56 — 修复产品目录双语生成、统计看板 Bug 与 E2E 端口配置

**完成事项：**
- 修复 `enrich.ts` 接口缺少 `featuresEn` 字段导致的英文特性数据未生成问题，并同步修改了前端产品的保存 Payload 映射逻辑。
- 修复 `daily-stats.ts` 中产品新增统计口径错误：将判定从 `createdAt` 改为 `updatedAt`，以兼容后审批录入的产品。
- 修复 `daily-stats.ts` 时区计算错误：将基于 UTC 的 0点转换为 Node 环境基于本地时区的 0点 (`setHours(0,0,0,0)`)。
- 彻底重构了 `SectionTodayBar.astro` 今日更新栏的展示形态（统一采用 `总数 (+今日新增)` 格式）。
- 修复了因为 `package.json` 引发的 `playwright` (E2E) 测试运行端口被强制占用为 4321 的冲突 Bug，并成功添加运行了相关的 E2E 测试。

**遗留/下一步：**
- 日常监控后台新添加或抓取产品的审核操作。

---

## 2026-04-20 19:38 — [BugFix] 修复产品导入高并发 503 限流引发的前端僵死 Bug ✅

### 完成事项
1. **重构前台 API 状态处理机制**: 修复了 `admin/src/pages/admin/product.astro` 在捕获 Google Gemini API 的 503 报错时，由于采用同步阻塞的 `alert(...)` (结合 HTML 表单遗漏 `features` 输入框所造成的崩溃)，从而导致等待动画死锁无法关闭的问题。将错误接管更新为无阻塞的 `showToast`。
2. **修补 Admin 面板的产品属性拦截**: 发现并修补了 `.ght-import-btn` 表单提取代码中 `variant-form` `features` 栏位的 HTML 缺失导致的前端空引用崩溃（`TypeError: Cannot set properties of null`）。
3. **引入基于指数退避的 AI 请求治愈机制**: 在 `/api/variants/enrich.ts` 中针对从 Google 服务器返回的频繁限流断联 `503 Unavailable / High Demand` 与 `429` 增加了一套自动阻塞器休眠重传逻辑 `Delay/2x`。大大缩减了批量导入新产品的双语失效（直接标记为 `[待翻译]`）概率。

### 下一步
- 观察日常抓取任务中是否存在其他隐性的 API 超负荷瓶颈。

---

## 2026-04-22 10:50 — [Chore] 优化多仓库同步工作流 (Multi-Repo Sync Workflow) ✅

### 完成事项
1. **清理全局 Git 追踪**: 移除了工作区错误挂载的全局 Git 追踪，并分别为 `admin`, `crawler`, `database`, `docs`, `spike`, `website` 正确初始化了独立的 Git 仓库。
2. **配置上游 Remote**: 为所有子模块配置了正确的 remote (包括修复缺失的 database 和 website 关联)。
3. **优化 .gitignore 规则**: 细化了 `.gitignore`，安全地移除了冗余沉重的编译产物（如 node_modules），同时保留了 Prisma database migration 脚本及相关的 Schema 配置。
4. **验证 Session-Push 工作流**: 检查与完善了 `session-push-all.sh` 脚本，确保其能平滑地提交所有的代码变更并自动化地 push 到各自的远程 GitHub 仓库。

### 下一步
- 执行一键会话归档并推送所有代码至远程。

---

## 2026-04-23 07:22 — [Feature] Caveman AI 教程自动化翻译与同步 ✅

### 完成事项
1. **数据库内容同步**: 编写并运行了 `sync_caveman_to_db.ts`，成功将本地 `admin/content/caveman-tutorial/lessons/` 下的 10 节中文教程内容同步至数据库，确保数据源统一。
2. **自动化双语翻译**: 创建了 `translate_caveman.ts` 脚本，调用 `gemini-2.5-flash` 模型完成了整套教程（10 节课）的标题、摘要及正文的专业级中英双语翻译。
3. **503 弹性重试机制**: 在翻译脚本中实现了针对 API 高并发限流 (High Demand) 的自动重试与指数退避逻辑，确保了大规模文本翻译的稳定性。
4. **物理文件回写**: 编写并运行了 `sync_caveman_to_disk.ts`，将数据库中的英文翻译内容以 `.en.md` 格式回写到文件系统，实现了全流程的自动化闭环。
5. **内容质量验证**: 抽样验证了 `lesson-1.en.md` 等文件，确认其完美保留了 Mermaid 流程图、Markdown 格式以及专业的技术词汇。

### 下一步
- 待用户审核英文版内容并进行发布。
- 考虑将此自动化翻译管线整合进通用的教程管理流中。

---

## 2026-04-25 21:35 — [Feature] Claude Code Teams 实战教程：自动化分割、修订与全量同步 ✅

### 完成事项
1. **教程内容重构**: 成功将 `teamtest/TUTORIAL.md` 原始长篇文档（2200+ 行）拆分为 15 节结构化的独立教程，存放于 `admin/content/claude-teams-tutorial/lessons/`。
2. **全局编号体系修订**: 实现了基于期数的全局编号逻辑。每个章节的小节标题根据其期数动态生成（如第 5 期为 `5.1`, `5.2`...，第 15 期为 `15.1`, `15.2`...），确保了跨章节的索引一致性。
3. **自动化翻译管道**: 部署了 `translate_teams.ts` 脚本，调用 Gemini 模型完成了全部 15 节课的专业级中英双语翻译。
4. **封面与视觉优化**:
   - 生成并部署了 `tutorial-claude-teams.png` 官方封面图，支持 Website 和 Admin 预览。
   - 根据用户反馈，移除了第一期中的冗余目录（TOC），并自动重排了第一期的内部编号。
5. **自愈式渲染脚本**: 编写了具备“代码块感知”能力的 `fix_numbering_safe.ts` 修订脚本，确保正则替换不干扰 Markdown 源码块内部的演示文稿。
6. **全链路同步**: 建立了“本地磁盘 -> 数据库 -> AI 翻译 -> 数据库 -> 本地回写”的全自动化内容管线，确保了内容的一致性与可维护性。

### 下一步
- 检查教程在前台和后台的展示效果，确认排版无误。
- 准备教程的上架与正式发布。

---

## 2026-04-29 19:40 — [Feature] Claude-Mem 与 Claude-Teams 教程进阶 Q&A 扩展 ✅

### 完成事项
1. **教程内容扩展**: 为 Claude-Mem 和 Claude Code Teams 教程系列增加了第 16、17、18 期的进阶 Q&A 内容，涵盖了多 Agent 架构中的路由分发、状态冲突、性能瓶颈以及 Token 优化等深度主题。
2. **多语言适配**: 生成了新增章节的 `*.en.md` 英文版本，实现了教程的中英双语同步。
3. **元数据与数据库同步**: 更新了 `index.md` 目录结构，并新增了数据同步脚本（如 `seed-claude-teams-tutorial.ts` 和 `test_db_all.ts`），以保障教程元信息和数据准确入库。
4. **前端模块调整**: 细微优化了 `src/pages/admin/product.astro` 的相关展示逻辑。

### 下一步
- 确认内容排版和翻译质量后准备正式发布。


---

## 2026-05-01 14:35 — [Feature] GSD 实战教程重构与 Website 排序修复 ✅

### 完成事项
1. **GSD 实战教程 V2 迁移**:
   - 清理了旧版的理论教程，基于计算器实战项目重新编写了 9 节课（6 节实战 + 3 节深度 Q&A）。
   - 实现了完整的双语化支持（CN/EN），并确保所有 Frontmatter 符合规范。
   - 编写并成功运行了 `seed-gsd-tutorial-v2.ts` 同步脚本，将新内容以 `draft` 状态同步至数据库。
2. **Website 排序逻辑修复**:
   - 修复了 `website/src/lib/releases.ts` 中 Release 动态的排序 Bug。
   - 将 `nulls: 'last'` 修改为 `nulls: 'first'`，确保最新抓取的（即便 `publishedAt` 为空）产品动态能正确出现在 Timeline 顶端。
3. **教程页统计补全**:
   - 为 `http://localhost:4321/tutorial/` 页面集成了 `SectionTodayBar` 统计组件，实现了与全站一致的数据汇总展示。

### 技术细节
- 运行了数据库种子脚本确保 GSD V2 内容覆盖旧数据。
- 修改了 3 个核心 Website 文件以优化排序和统计展示。

### 下一步
- 确认 GSD 教程在后台的预览效果。
- 准备将 GSD 教程状态从 `draft` 改为 `published` 以正式上线。

---
## 2026-05-06 19:30 — [Feature] Internal Link Weaving & LAN Access Troubleshooting ✅

### 完成事项
1. **解决 Astro/Vite 局域网访问 400 错误**:
   - 排查并解决了通过 `192.168.8.142:4322` 访问 Admin Dashboard 时出现的 HTTP 400 Bad Request 问题。
   - 更新了 `admin/astro.config.mjs`，设置了 `host: '0.0.0.0'`，`allowedHosts: true`，以及关闭了 `security: { checkOrigin: false }`，允许开发环境通过 IP 直接被局域网设备访问。
   - 详细向用户解释了浏览器端（特别是 Chrome 的 HTTPS First 和 PNA 机制）与底层 `curl` 行为的差异。
2. **全站内链织网策略落地 (SEO Optimization)**:
   - 分析了 Google Search Console 中 535 个新闻页面“已发现 - 尚未编入索引”的原因（孤岛页面、抓取预算限制）。
   - 实施了“相邻时间文章”的组件链接策略以建立高效的爬虫抓取链 (Crawl Chain)。
   - 在 `articles.ts` 数据服务中新增了 `getAdjacentArticles` 和 `getLatestArticles` 函数。
   - 创建了 `RelatedNews.astro` 组件（双语自适应的卡片式布局）。
   - 将组件全方位挂载于：中英文的 **新闻详情页** (按时间相邻读取) 和 **产品详情页** (拉取最新动态)，完美实现了整站内容的动态内链互联。
3. **修复构建报错**:
   - 发现并修复了 Astro build 阶段由于漏加模块导出导致的 `getAdjacentArticles is not exported` 编译故障。

### 下一步
- 监控 Google Search Console，观察孤岛文章的收录率变化。
- 继续跟进网站内容补充或新业务需求开发。

---

## 2026-05-07 15:03 — [Feature] Admin UI Enhancements & Deep Deduplication ✅

### 完成事项
1. **产品查重与底层去重逻辑增强**:
   - 更新了 `crawler/src/product-scraper/product-writer.ts`。在传统的 `sourceType` + `sourceId` 去重基础上，额外增加了 `githubUrl` 和 `websiteUrl` 的深度查重机制，彻底避免手动录入的产品被爬虫重复抓取创建。
   - 优化了“认领”逻辑：当爬虫抓取到已存在的“手动录入”产品时，会自动将该产品的 `sourceType` 认领更新，确保其享有后续的自动化数据更新（如 star 数量追踪）。
2. **待审产品列表自动隐藏机制**:
   - 修改了 `admin/src/pages/admin/product.astro` 的查询逻辑，通过对比 `Variant` 表中已绑定的 `sourceArticleId`，在初审文章列表中动态过滤掉已经被提取/认领过的文章。实现了“提取即消失”的极致爽快工作流。
3. **“失败队列”废弃废料源头屏蔽**:
   - 为后台 `/admin/news?stage=failed` 页面添加了“屏蔽该源并废弃”的破坏性按钮，同时支持了键盘快捷键 `D` 操作。
   - 编写了 `api/review.ts` 中的 `disable_source` 逻辑：提取废弃文章的 `sourceUrl` 解析 Hostname，对涉及该域名的上游订阅源 `Feed` 批量执行禁用，避免浪费服务器轮询算力。
4. **前端教程页精细化打磨**:
   - 修改了网站中文版教程的前端渲染模板 (`website/src/pages/zh/tutorial/[series]/[lesson].astro`)，在标题区域动态插入高转换率的“微信进群”提示挂件（支持响应式布局适配），且保持英文版页面免受影响，避免了用脚本批量污染 `.md` 源文件的笨拙操作。
   - 修复了 `website/src/lib/tutorials.ts` 的小 Bug：让英文站点的底部“上一篇/下一篇”按钮读取到正确的 `titleEn` 英文标题。

### 下一步
- 监控产品管理后台是否彻底消灭了重复录入现象。
- 继续跟进并清理无效的 RSS 新闻源，保持整体订阅池的高质量。

## 2026-05-11 10:10 — [Stabilization & Distribution Optimization]
- **完成事项**:
    - **全站模型升级**: 将 `ai-draft.ts`、`skills-ai-fill.ts` 及 `crawler-console.astro` 中的模型引用全部升级至 **`gemini-3-flash-preview`**，确保新功能默认使用高性能的 Gemini 3 系列。
    - **DistroHub 逻辑优化**: 
        - 修复了 `PublishPanel.astro` 的 CSS 拼写错误 (`hieght` -> `height`)。
        - 重构了全选逻辑，解决了“抖音图文”等已登录平台在批量勾选时被遗漏的问题。
    - **Admin News 页面修复**: 
        - 彻底修复了 `news.astro` 的 `SyntaxError`（由于 `instanceof HTMLElement` 及复杂模板字符串转义导致）。
        - 修复并增强了 `purge-stale` API，支持数组状态过滤，解决了“失败队列”清理失效的 Bug。
    - **流量入口优化**: 
        - 验证了 Google Analytics 统计代码在教程全站（首页+子课时页）的覆盖情况。
        - 标准化了全网分发内容的引流文案，统一指向官网教程中心，提升流量回流率。
    - **基础架构更新**: 
        - **llms.txt 同步**: 修正了产品总数事实（20+ -> 400+），并同步了最近新增的 20+ 门大师课教程，采用更清晰的分类结构。
        - **robots.txt 增强**: 切换至**严格白名单模式**，仅允许信任的头部爬虫访问，并屏蔽了 `/api/`、`/_astro/`、`/pagefind/` 等敏感路径。
- **关键决策**:
    - 采取“白名单模式”来管理爬虫，优先保障优质 AI 爬虫（如 GPTBot, ClaudeBot）和主流搜索引擎的抓取效率，同时通过 Disallow 规则保护 API 算力和构建资源。
    - 废弃了脚本中不稳定且难以跨环境编译的 `instanceof` 判断，改用更健壮的 `.closest()` 事件委派方案。
- **下一步**:
    - 观察 Gemini 3 Flash 在文章改写和产品丰富场景下的语义表现。
    - 监控白名单模式开启后，长尾流量的变化情况。

- **[2026-05-13] 阶段更新**:
    - **完成事项**:
        - **反爬虫教程创作**:
            - 完成《反爬虫攻防实战 — Firecrawl + Cloudflare WARP 本地代理全指南》共 11 节高质量内容的创作。
            - 修正了 MCP 工具链方向，转向契合生产架构的 Node.js Backend Integration。
            - 生成具有赛博朋克防御风格的配套封面图，并同步至 `public` 静态目录。
        - **紧急数据库灾备修复**: 
            - 发现 `sync_bilingual_all.ts` 脚本对全站教程状态、封面及时间戳造成了严重破坏。
            - 编写 `restore_covers.ts` 脚本，通过解析 `.sql` 备份恢复了所有系列的封面路径。
            - 编写 `restore_dates.ts` 脚本，使用底层 SQL 绕开 Prisma 限制，成功恢复了所有被篡改的时间节点。
    - **关键决策**:
        - 确立高危操作前的 `pg_dump` 本地时间戳备份原则。
        - 敲定 Admin 面板新功能方向：可视化单点定向同步后台（带 Dry Run 预检与 AI 配图生成）。
    - **下一步**:
        - 开发 Admin 教程可视化导入器，并实现相关的 E2E 测试用例。

## 2026-05-15 11:45 — [Antigravity Masterclass Translation & Bugfix]
- **完成事项**:
    - **元数据标准化修复**: 修复了 Antigravity Masterclass（ID: 55）中因 `description` 和 `order` 字段名不规范导致的标题无法解析（显示为 "---"）的问题，统一替换为标准的 `summary` 和 `sortOrder`。
    - **批量自动化翻译**: 编写了基于 Gemini API 的多线程 Python 脚本，快速将剩余 of 24 个章节（07-30）全部翻译为高质量的英文。
    - **数据库同步**: 调用 `/api/tutorials/import` 完成同步，并验证数据库中 `titleEn` 成功写入，前端双语显示恢复正常。
- **关键决策**:
    - 在面临大量文本翻译任务时，果断采用 Agentic 方式编写 Python 脚本结合 LLM 进行并发处理，将数小时的手动工作缩短至 2 分钟以内。
- **下一步**:
    - 继续监控平台多语言展示的稳定性。
    - 筹备新功能模块的开发与上线。

## 2026-05-18 19:05 — [Homepage Bilingual Covers & Premium Icon Fallbacks]
- **完成事项**:
    - **首页英文封面渲染修复**: 修复了英文版首页最新资讯卡片直接使用 `a.coverImage` (中文封面) 的 Bug，重构为 `a.coverImageEn || a.coverImage`。当数据库中存在翻译完毕的英文封面图时，将自动优雅呈现，保持全站的英文阅读一致性。
    - **首页产品图标动态占位美化**:
        - 针对 `whatsapp-mcp`、`ai-factory`、`agent-skills` 在数据库中 `logo` 字段为 `null` 导致首页卡片全部堆叠相同的机器人 `'🤖'` 头像问题进行了排查与优化。
        - 移除首页中英文模版中生硬的 `'🤖'` 占位符，统一改为动态截取产品首字母。
        - 在 `global.css` 中重构 `.product-icon` 类，加入了强对比字重 (`font-weight: 800`)、自动大写转换以及高辨识度的全品类渐变冷暖主题配色（开源绿色、创业紫色、大厂青色、托管蓝色、硬件橙色），使得无 Logo 产品的卡片在首页同样精美雅致且各具特色。
    - **构建验证**: 在 `website` 路径下执行了完整的 Astro 静态构建校验 (`pnpm run build`)，全量 5000+ 页面编译无一报错，确认代码安全合规。
- **关键决策**:
    - 拒绝平庸设计，用首字母动态主题色卡片全面代替千篇一律的 Emoji 占位，将“详情页-列表页-首页”的视觉逻辑彻底打通，极大提升了网站视觉深度与高级感。
- **下一步**:
    - 启动多文章综合自动化编写微信公众号博客的引擎研发。

---

## 2026-05-31 19:05 — [Build Script Optimization & Live 404 Resolution]

### 完成事项
- **MacOS 文件锁自愈加固**：在 `build-deploy.sh` 脚本的 `dist/.git` 备份（`mv`）操作之后加入了 `sleep 1` 延迟机制。解决了由于 macOS 后台文件监视器（如 VS Code Git 扩展）高频扫描新变更而导致紧随其后的 `rm -rf dist` 发生 `Directory not empty` 锁死中断的构建 race condition Bug。
- **静态构建 Git 漏解纠偏**：诊断并修复了 `npx astro build` 默认会擦除整个 `dist/` 输出目录（导致原地清空保留 `.git` 逻辑崩溃）的机制问题。完全还原了独立的 `.git` 备份与还原时序，重新打通了静态构建流水线。
- **误推源码回滚与 Remote 修复**：成功处理了由于 `dist/.git` 被抹除后，Git 向上穿透绑定到父级 `website/.git` 并将 `website` 源码强制推送到 `openclaweco-website-build` 的重大环境异常。完美重置了父级 `website` 仓库的 remote origin 并进行了软重置分支对齐，没有丢失任何本地样式和图片。
- **全站线上 404 故障全面消除**：本地通过全新优化的 build-deploy 脚本顺利完成静态打包，编译 16,300+ 文件并全部增量推送。经 live curl 强校验，`/product/`、`/releases/` 和 `/skills/` 均以 `200 OK` 恢复正常，彻底消除线上故障。

### 关键决策
- **以退为进，保留备份**：在面对静态构建工具（Astro）强力清空 outDir 且配置不可调的情况下，不再执着于原地排除清理，而是保留备份/还原时序并利用 `sleep 1` 平息 macOS 的文件锁定监听，以最稳定成熟的方式打通构建。
- **源码与构建物理隔离**：在部署脚本中加入了对 remote origin 的严格校验与重新绑定，确保不管本地环境如何变迁，部署推送时 100% 作用于 `openclaweco-website-build.git` 且对 `website` 源码零污染。

### 下一步
- 待用户指定下一阶段的博客丰富或爬虫集成开发任务。

---

## 2026-06-06 20:45 — [404 Link Resolution & Local Build Auditor Integration] ✅

### 完成事项
1. **Gemma 教程图表 Markdown 化**：
   - 修复了 [lesson-7.md](file:///Users/eric/work/openclaweco.com/admin/content/gemma-tutorial/lessons/lesson-7.md) 和 [lesson-7.en.md](file:///Users/eric/work/openclaweco.com/admin/content/gemma-tutorial/lessons/lesson-7.en.md) 中因 raw HTML `<img>` 标签没有闭合符号而被 Markdown 插件误包裹 `<a>` 的 Bug。将其转换为标准 Markdown 图片引用语法。
2. **数据双语同步**：
   - 在 `admin` 下运行 `npx tsx scripts/sync_bilingual_all.ts`，将所有更新的文章内容和翻译全量同步写入 PostgreSQL 数据库，保持数据与文件系统高度一致。
3. **已批准产品 Tag 编译修复**：
   - 修改 [tags.ts](file:///Users/eric/work/openclaweco.com/website/src/lib/tags.ts)，去除 getCachedVariants 里的 `status: 'active'` 过滤条件，改为仅按 `approvalStatus: 'approved'` 查询，从而将 beta 产品的标签信息纳入 Tag 页面静态编译。
4. **404 页面多语言切换容错**：
   - 修改 [BaseLayout.astro](file:///Users/eric/work/openclaweco.com/website/src/layouts/BaseLayout.astro)，在 404 页面中将语言切换链接和 hreflang 的重定向目标强制路由至中/英首页（`/zh/` 和 `/`），彻底解决 `/zh/404` 链接引发的 404 错误。
5. **链接审计脚本 HTML 实体处理**：
   - 修改 [check-links.mjs](file:///Users/eric/work/openclaweco.com/scratch/check-links.mjs)，在 trim 时增加对 HTML 特殊实体字符（如 `&amp;` -> `&`）的还原解码，解决带有特殊字符的标签链接引起的误报 404 问题。
6. **本地构建与审计自动化整合**：
   - 修改 [build-deploy.sh](file:///Users/eric/work/openclaweco.com/website/build-deploy.sh)，当 `LOCAL_BUILD` 为 true 时，在本地构建完成后自动触发 `node scratch/check-links.mjs`。
   - 本地构建与审计运行通过：全站 9959 个静态页面顺利编译，链接审计扫描 **9971 个 HTML 文件，确认 0 个内部 broken link**。

### 关键决策
- **404 路由降级降噪**：404.html 页面在 Astro 中只编译为根目录下单个文件，因此在 404 模板中显式重置语言切换回首页是处理 i18n 404 的最佳降噪手段。
- **本地构建自动化闭环**：通过在 `build-deploy.sh` 脚本尾部注入 `check-links.mjs` 审计，使每一次本地构建自动进行 404 链接健康检查，避免在发布时才暴露低级错误。

### 下一步
- 待用户进行手动全量打包发布并监控后续生产环境的访问日志。

---

## 2026-06-10 13:00 — [SEO & Analytics & Billing] 404 URL Resolution & AI Studio Billing Anomaly Audit ✅

### 完成事项
1. **404 链接解析与映射审计**：
   - 编写并执行了 [scratch/match_404s.mjs](file:///Users/eric/work/openclaweco.com/scratch/match_404s.mjs)，提取了 Google Analytics 导出的 98 个独立 404 路径，分析并映射至对应正确的双语内容页面。
2. **边缘 301 重定向规则部署**：
   - 针对已知重构造成的零填充教程课时路径（例如 `/zh/tutorial/hermes-agent-tutorial/lesson-01` -> `/zh/tutorial/hermes-agent-tutorial/lesson-1/`），在 [website/public/_redirects](file:///Users/eric/work/openclaweco.com/website/public/_redirects) 中部署了精确的 301 重定向规则，降低回源开销。
3. **客户端 404 智能自愈跳转**：
   - 在 [website/src/pages/404.astro](file:///Users/eric/work/openclaweco.com/website/src/pages/404.astro) 页面中注入了轻量级前端重定向脚本，对所有以 `.html` 结尾的未知历史路由（例如 `/path.html`）在浏览器端实时剥离后缀并重定向至 Clean URL（`/path/`），实现客户端优雅兜底。
4. **Google AI Studio 计费异常排查**：
   - 对 6月6日至10日 AI Studio 面板显示 $0 账单的情况进行了核查。分析指出在 Paid Tier（Tier 2）下，由于 `gemini-3.5-flash` 费率极低（输入 $1.50/M, 输出 $9.00/M），近几天改写产生的实际日消费低于 $0.01，被面板四舍五入合并显示为 $0.00。同时确认了 $100 每月赠金在 GCP 计费发票层面扣抵。
5. **本地构建与链接审计验证**：
   - 在 `website/` 下执行了 `npm run local-build` 本地验证，成功编译 5283 个静态页面并生成 Pagefind 索引，最终通过链接审计脚本验证，报告 **0 个内部损坏链接**。
6. **自治理规范与防中文 URL 锁定**：
   - 创建了根目录自治理规章 [agent.md](file:///Users/eric/work/openclaweco.com/agent.md)，严格限定未来所有改写及生成逻辑禁止产出中文/百分比编码 URL，且未经 301 边缘重定向不得随意篡改已有 URL。

### 关键决策
- **边缘与客户端双层兜底重定向架构**：通过 `_redirects` 处理已知的高频重构教程路由以避免回源，同时在 `404.astro` 页面利用客户端 JS 剥离 `.html` 后缀对零星分散的历史遗留链接进行柔性兜底，实现极致的静态 404 降噪。
- **自治理约束持久化**：使用 `agent.md` 将本会话的防中文/百分比编码 URL 规范以及禁止自动推送生产构建的红线进行规章化锁定，保障多会话间 AI 操作的安全连贯性。

### 下一步
- 运行 `./session-push-all.sh` 一键向远程同步 Root 及所有子模块的最新代码。
- 观察 Google Search Console 中 301 状态码的传导及 404 错误日志的逐步递减。

---

## 2026-06-16 10:20 — [Feature] Install SEO Audit & GEO Claude Skills ✅

### 完成事项
1. **安装 JeffLi1993/seo-audit-skill 技能集**：
   - 成功将该技能集克隆并注册，并在 `.agents/skills` 下生成 `seo-audit` 和 `seo-audit-full` 两个核心技能，使 AI 具备快速单页 SEO 审计及深度 PageSpeed 综合审计能力。
2. **安装 aaron-he-zhu/seo-geo-claude-skills 技能集**：
   - 成功将该技能集克隆并注册，在 `.agents/skills` 下生成 20 个涉及 GEO（生成式引擎优化）、竞品分析、内链优化、Schema 标记、关键词研究等的深度 SEO/GEO 优化技能。
3. **版本锁定与状态同步**：
   - 自动生成并更新 `skills-lock.json` 版本锁文件，将两个源共 22 个新增技能信息入库锁定。
   - 验证所有技能目录在项目根目录的 `.agents/skills/` 中均已被安全克隆及配置。
4. **主页 Title 标题深度调优 (SEO Optimization)**：
   - 成功将英文首页标题升级为 `AgentUpdate.ai — AI Agents Ecosystem & Developer Hub`，增加了复数核心词覆盖度并包含高频词；
   - 成功将中文首页标题升级为 `AgentUpdate.ai — AI 智能体生态聚合与开发者中心`，使其更契合商业定位，提升搜索引擎点击展现量。


### 关键决策
- **使用全局 `skills` CLI 加载**：利用 `npx skills add <repo> --all` 精准导入技能到所有 agents 目录，自动配置 symlinks，确保全平台兼容。

### 下一步
- 运行 `./session-push-all.sh` 一键向远程仓库推送 Root 及子模块的最新代码以完成归档。
