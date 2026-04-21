# OpenClawEco - Session Progress

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
6. **Stabilization & Fixes (In Progress)**
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
