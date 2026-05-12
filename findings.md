# 发现与决策记录 (Findings & Decisions)

## Finding v1.7 — Local MCP Server Orchestration (2026-05-12 15:50)

### 背景
用户希望在本地环境中完全运行 Firecrawl 服务，并将其作为 MCP 节点供 AI 助手（如 Claude / Cursor）调用，以绕过云端 API 限制或出于数据隐私考虑。

### 发现
1. **服务解耦**: Firecrawl 核心服务（API/Worker/DB/Redis）与 MCP 适配器是两个不同的仓库。核心服务负责数据抓取逻辑，而 MCP 适配器负责 Model Context Protocol 的 stdio 通讯。
2. **多源目录同步**: 后台管理系统 (Admin) 与 官网 (Website) 采用独立的静态资源目录，若不同步 `public/covers`，会导致在管理界面预览时图片“穿透”失败（404）。

### 决策
- **目录级架构隔离**: 在根目录下将 `firecrawl` (核心服务) 与 `firecrawl-mcp` (适配器) 设为并列的 Git 模块。
- **本地启动脚本化**: 创建 `start-local.sh` 整合 Docker 启动与健康检查，并显式指定 `FIRECRAWL_API_URL=http://localhost:3002` 以便 MCP 适配器正确连接本地实例。
- **资源镜像同步策略**: 引入 `rsync` 机制同步 `covers` 目录，确保 Website 生成的所有 AI 封面在 Admin Dashboard 同样立即可见。

### 影响
- 实现了 100% 本地化的“爬虫-AI”闭环，AI 助手现在可以利用本地 Firecrawl 能力执行复杂的网页调研任务。
- 解决了长期困扰管理后台的封面图加载失败问题。

## Finding v1.6 — SEO Discovery Infrastructure (2026-05-08 10:35)

### 背景
随着站点内容（教程、产品、技能）的爆炸式增长，传统的静态 Sitemap 和缺乏自动化更新分发机制（RSS）成为了 SEO 的瓶颈，导致新内容收录缓慢。

### 发现
1. **Sitemap 的局限性**: 仅包含新闻文章的 Sitemap 忽略了站点核心的资产（400+ 篇教程课时）。
2. **RSS 价值回归**: 对于 AI Agent 开发者和极客用户，RSS 仍是获取技术更新的首选方式。同时，RSS 链接在页头显示比页脚更能有效引导用户。
3. **统计口径偏差**: Admin Dashboard 的统计 SQL 若不包含所有的多语言发布状态（如 `published_all`），会导致运营人员对站点活跃度产生严重的判断偏差。

### 决策
- **动态 Sitemap 全量化**: 使用 `Promise.all` 并发查询数据库中所有实体类型，构建支持双语路径的动态 Sitemap 引擎。
- **Header RSS 战略**: 将 RSS 链接移至页头，并使用标志性橙色图标，强化“更新驱动型站点”的品牌印象。
- **状态感知型统计**: 仪表盘统计逻辑必须使用 `in: [...]` 包含所有变体状态，确保数据报表的真实性。

### 影响
- 站点收录广度理论上提升了 400%（从单一新闻收录扩展到全资产收录）。
- 提升了极客用户的留存工具链。
- 运营仪表盘数据恢复真实，能够准确反映今日的发布动态。


## Finding v1.2 — Bilingual Content Modularization (2026-05-05 16:45)

### 背景
初期教程采用单 Markdown 文件混合中英文（通过 `---` 或特定标记分割）。随着内容增长，单文件解析变得复杂，且不利于 SEO 和不同语言下的差异化渲染。

### 发现
- 单文件混合模式在 Admin 预览时容易出现解析错误。
- `website` 模块的前端路由更容易处理独立的 `.md` 和 `.en.md` 文件。
- 独立的英文文件允许针对英文语境进行更地道的调整，而不受中文结构的死板约束。

### 决策
- 统一采用 **Bilingual Split Strategy**:
    - 中文内容：`lesson-XX.md`
    - 英文内容：`lesson-XX.en.md`
- Seeding 脚本必须支持这种双文件模式，自动合并入库。
- 静态资源（插图/封面）必须在 `admin/public` 和 `website/public` 之间保持镜像同步，以确保预览一致性。

### 影响
- 显著提升了内容的维护性。
- 后台预览与前台展示实现了 100% 视觉对齐。
- 为后续支持更多语言（如日语、法语）奠定了可扩展基础。

## Finding v1.3 — Astro/Vite 6 局域网访问限制与 SEO 内链织网 (2026-05-06 19:35)

### 背景
开发阶段发现局域网内的其他设备（如手机或同网段 PC）无法通过 IP 直接访问 Astro 开发服务器（报 HTTP 400 Bad Request）。同时，GSC 报告显示网站有超 500 个新闻页面处于“已发现 - 尚未编入索引”的状态。

### 发现
1. **Vite 6 的安全收紧**: Vite 6 默认开启了严格的 `Host` Header 校验以防 DNS 重绑定攻击。即使绑定了 `0.0.0.0`，如果不显式配置 `allowedHosts: true`，也会拒绝外部 IP 访问。
2. **现代浏览器（Chrome）的 HTTP 限制**: 即使底层 TCP/HTTP 连通，Chrome 会视内网 IP 为 Insecure Context，进而强制拦截、阻断 API，或触发自动升级 HTTPS，表现为假性的“无法访问”。
3. **爬虫行为机制**: 批量生成的内容如果只有深层列表结构而缺乏横向联结，Googlebot 会认为其重要性低，加上抓取预算限制，导致大量页面搁浅在“未索引”状态。

### 决策
- 在 `astro.config.mjs` 中全局配置允许局域网 IP (`allowedHosts: true`, `security.checkOrigin: false`) 用于开发联调。
- **SEO 内链织网**: 彻底摒弃孤岛结构。在所有新闻详情页底层追加时间轴相邻的 3 篇文章链接；在所有产品页底部追加最新新闻。通过硬编码组件 `RelatedNews.astro` 串联全站页面。

### 影响
- 解决了多端跨设备开发调试的痛点。
- **UX/Security**: Added `confirm` dialogs for destructive actions like disabling sources to prevent accidental operational errors.
- **Maintainability**: Favored frontend-side template injection over batch-editing markdown files to ensure the "source of truth" remains clean and portable.

## Finding v1.5: English-Centric Illustration Strategy
- **Context**: The user requested that both Chinese and English versions of tutorials share the same "English-style" illustration to maintain a professional, global tech aesthetic.
- **Decision**: 
  - Standardized the AI generation prompt to always include `ensure all text/labels in the image are in English` and `professional typography`.
  - Prefer `titleEn` for the illustration's conceptual context even when generated from the Chinese admin interface.
- **Benefit**: Reduces asset management overhead (one image per tutorial) while ensuring high visual quality that fits the "AI Ecosystem" theme across all languages.
- **Implementation**: Updated both Series and Lesson admin editors to support this standardized generation logic.

## Finding v1.4 — Deep Deduplication & Non-Intrusive Frontend Injection (2026-05-07 15:05)

### 背景
随着数据体量的增长，出现了爬虫重复抓取已被手动录入系统的产品（导致重复 Variant 和展示）的问题。同时，运营侧需要对全部（400+ 篇）的中文教程插入“微信加群引流”模块，而在原始的 Markdown 中逐一修改极易污染语料源。

### 发现
1. **Deduplication 漏洞**: `Variant` 表的 `sourceType` + `sourceId` 联合唯一索引只能防爬虫同源重抓，但无法阻止同一产品既被手动录入（manual），又被爬虫录入（如 GitHub / Website）。
2. **静态文件维护成本**: 当运营需求频繁变动（如更换微信号、调整引流话术），若采用脚本直接修改海量 `.md` 源文件，会导致灾难性的 Git 提交与维护负担。

### 决策
- **深度多键防重 (Deep Deduplication)**: 在爬虫写入器 (`product-writer.ts`) 中，不再仅依赖 unique 约束，而是在写入前主动通过 `githubUrl` 或 `websiteUrl` 去数据库中查重。若命中“手动录入”产品，则**不创建新记录，而是主动更新并接管该产品的 `sourceType`**，将其纳入后续自动化更新链条。
- **前端模板动态挂载 (Non-Intrusive Injection)**: 在 Astro 前端模板 (`[lesson].astro`) 渲染阶段通过判断 `lang === 'zh'`，动态将引流组件在 `<Content />` 渲染时无缝注入页面顶部。

### 影响
- 极大提升了数据入库质量，彻底消灭了双源冗余产品。
- 确保了 Markdown 纯语料文件的干净程度，大幅降低了运营需求的开发和维护成本。
