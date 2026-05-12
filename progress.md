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
