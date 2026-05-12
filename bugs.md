# 缺陷记录 (Bugs)

## BUG-121: OpenSpec 教程 Frontmatter 嵌套双引号导致解析失败
- **发现时间**: 2026-05-12 14:10
- **自愈轮次**: 1 / 5
- **症状**: 自动化翻译脚本 `translate_openspec_disk.ts` 在处理 `lesson-01.md` 时报错 `YAMLException: can not read a block mapping entry`，导致流程中断。
- **根因**: 中文源文件的 YAML Frontmatter 中 `title` 或 `summary` 字段包含了未转义的双引号（如 `title: "第 01 章 | 为什么需要"AI + 规约 + 多角色""`）。`gray-matter` 将其识别为非法的块映射，因为内部的双引号提前结束了字符串。
- **修复方案**: 编写了 `fix_titles_v2.py` 脚本，利用正则匹配提取标题/摘要内容，并将其内部的双引号统一替换为单引号，从而保证了 YAML 结构的合法性。
- **结果**: PASS。
- **相关文件**: `admin/content/claude-openspec-tutorial/lessons/*.md`

## BUG-120: `purge-stale` API 无法清理失败队列
- **发现时间**: 2026-05-11 09:45
- **自愈轮次**: 1 / 5
- **症状**: 在“失败队列” Tab 点击“清理 3 天前数据”后，后端返回 200 但实际删除条数为 0，且数据库中过期的失败文章依然存在。
- **根因**: 后端 API 只接受字符串格式的 `status` 参数（如 `raw`），但从失败队列发送的是数组格式 `['error', 'dead_letter']`。Prisma 查询时未正确使用 `{ in: [...] }` 运算符，导致查询条件失效。
- **修复方案**: 在 `purge-stale.ts` 中增加了对数组参数的识别逻辑，并统一使用 Prisma 的 `where: { status: { in: statusArray } }` 语法进行批量删除。
- **结果**: PASS。
- **相关文件**: `admin/src/pages/api/articles/purge-stale.ts`

## BUG-119: Admin News 页面脚本 SyntaxError 及分发全选失效
- **发现时间**: 2026-05-11 09:30
- **自愈轮次**: 1 / 5
- **症状**: 访问 `/admin/news` 时控制台报错 `Uncaught SyntaxError: missing ) after argument list`，导致清理旧数据按钮无反应，全网分发面板的“抖音图文”平台无法被全选选中。
- **根因**: ① 在 `news.astro` 的 `define:vars` 脚本块中，`instanceof HTMLElement` 的复杂判断在 Astro 编译注入时触发了括号解析歧义，且模板字符串嵌套三元运算未进行转义。② 全选逻辑使用了不够稳健的 `closest` 查找，漏掉了处于特定 DOM 层级的平台复选框。
- **修复方案**: 简化了事件委派逻辑，移除了不稳定的 `instanceof` 类型检查，改用 `.closest('.batch-btn')` 配合 `target` 基础判定。重写了 `PublishPanel.astro` 的全选逻辑，确保遍历所有非 `disabled` 的输入框。
- **结果**: PASS。
- **相关文件**: `admin/src/pages/admin/news.astro`, `admin/src/components/PublishPanel.astro`

## BUG-118: Admin Dashboard 教程统计数值严重偏低 (仅显示 94)
- **发现时间**: 2026-05-08 10:27
- **自愈轮次**: 1 / 5
- **症状**: 仪表盘显示 "Tutorials: 94"，而实际数据库中有 462 个已发布课时。新发布的 ID 230 课时也不在统计中。
- **根因**: 统计逻辑 `getAdminDailyStats` 中使用了硬编码的 `status: 'published'` 过滤条件。由于迁移了双语支持，绝大多数课时现在使用 `'published_all'` 等状态码，导致它们被统计引擎忽略。
- **修复方案**: 修改 `admin/src/lib/daily-stats.ts`，将过滤条件改为 `status: { in: ['published', 'published_all', 'published_zh', 'published_en'] }`。
- **结果**: PASS。统计数值恢复到 462，且“今日更新”指标显示正常。
- **相关文件**: `admin/src/lib/daily-stats.ts`


## BUG-116: Astro 构建因类型导入未分离导致崩溃 (getAdjacentArticles is not exported)
- **发现时间**: 2026-05-06 19:40
- **自愈轮次**: 1 / 5
- **症状**: 运行 `npm run build` 时报错 `src/components/RelatedNews.astro (2:9): "getAdjacentArticles" is not exported by "src/lib/articles.ts"`，导致整个 Website 模块静态生成失败退出。
- **根因**: 由于在利用工具自动注入内链代码时，正则表达式或替换块匹配失误，不仅没有正确在 `articles.ts` 追加方法，反而删除了原有的正常函数。
- **修复方案**: 重新在 `articles.ts` 的尾部安全地追加所需的 `getAdjacentArticles` 和 `getLatestArticles` 逻辑，同时在 `RelatedNews.astro` 中修正了 `import` 引用，隔离了 TS 类型导入。
- **结果**: PASS。二次构建已成功生成全部静态文件。
- **相关文件**: `website/src/lib/articles.ts`, `website/src/components/RelatedNews.astro`

## BUG-115: 教程列表排序失效 (时间戳不更新)
- **发现时间**: 2026-05-03 09:00
- **自愈轮次**: 1 / 5
- **症状**: 后台审批发布新课时后，前端教程列表排序无变化，日期显示陈旧。
- **根因**: ① 修改课时未触碰父系列 `updatedAt`；② 列表排序仍在使用静态 `sortOrder`。
- **修复方案**: 在发布 API 中显式强制更新系列 `updatedAt`，并修改 Website 排序为 `updatedAt desc`。
- **结果**: PASS。
- **相关文件**: `admin/src/pages/api/tutorial.ts`, `website/src/lib/tutorials.ts`


## BUG-001: Inspector Drawer Header Hidden under TopBar

- **发现时间**: 2026-04-09 15:20
- **自愈轮次**: 1 / 5
- **症状**: 用户反馈无法看到右侧抽屉（Inspector Drawer）的关闭按钮和头部标题，它似乎隐入了深色背景。
- **根因**: UI 叠层（`z-index`）冲突。`TopBar` 的 z-index 是 `30`，而 `InspectorDrawer` 的 z-index 仅为 `20`。当抽屉滑出时，抽屉顶部的 Header 被顶部的整体容器完全遮挡。
- **修复方案**: 在 `index.css` 中将 `.inspector-drawer` 的 `z-index` 调整为 `40`，保证侧滑抽屉层级高于顶部导航栏（这是标准的 Modal/Offcanvas 行为规范）。
- **结果**: PASS。利用 Browser Subagent 测试看到 UI 交互正常。
- **相关文件**: `admin/simulator/n8n/app/src/index.css`

## BUG-002: JSON Viewer 出现原生 HTML 标签泄漏

- **发现时间**: 2026-04-09 07:15
- **自愈轮次**: 1 / 5
- **症状**: 右侧 Inspector Drawer 的 Output 选项卡中，本应展示代码高亮 JSON 的位置，直接吐出了带有 `<span class="json-key">` 这样的裸露 HTML 字符串代码。
- **根因**: 在 React 环境中直接将 `String` 返回为节点，React 默认会转义特殊序列以防止 XSS，导致我们手写的语法着色标签全部失效并渲染成纯文本。
- **修复方案**: 改用 `<div dangerouslySetInnerHTML={{ __html: renderJson(data[tab]) }} />` 封装渲染对象，迫使 DOM 引擎正常解析这些着色 Span。
- **结果**: PASS。
- **相关文件**: `admin/simulator/n8n/app/src/components/Inspector/InspectorDrawer.tsx`

## BUG-003: Release Hub 搜索图标尺寸暴涨巨大化

- **发现时间**: 2026-04-11 13:37
- **自愈轮次**: 1 / 5
- **症状**: 在 `http://localhost:4321/releases/` 页面中，搜索框的 SVG 放大镜图标突然失去了尺寸控制，渲染得如同屏幕一样巨大，严重破坏了整个页面的 UI 布局。
- **根因**: `<svg>` 标签中虽然可能存在 Tailwind 的 `h-4 w-4` class，但由于某些编译限制或特殊的 flex/absolute 排版上下文环境，外部类没有成功限制住 SVG 原生视口，导致 SVG 使用了默认的100%容器填充行为。
- **修复方案**: 在两个 Astro 页面中（`/releases/index.astro` 和 `/zh/releases/index.astro`），为搜索 SVG 图标显式增加了 `width="16" height="16"` 的硬编码属性，并辅以内联 `style="width: 16px; min-width: 16px;"` 以彻底切断浏览器的扩展行为。
- **结果**: PASS。
- **相关文件**: `website/src/pages/releases/index.astro`, `website/src/pages/zh/releases/index.astro`
## BUG-004: Mermaid 子图语法中的空白符导致解析崩溃

- **发现时间**: 2026-04-13 13:55
- **自愈轮次**: 1 / 5
- **症状**: Admin Dashboard 课程预览框中，含有 Mermaid 图表的代码无法顺利渲染出 SVG 图形，而是降级退回显示成了原生的带有背景色的纯文本代码块，并报告 `Syntax error in text mermaid version 11.14.0` 错误。
- **根因**: 第一，最新版 `marked` 渲染器函数签名发生了由多参退化为对象传参的变化，导致新旧版本间的参数漏传触发样式降级。第二，生成的内容中存在非法的 `subgraph Context Rot 衰减曲线` 语法，Mermaid V11 强行要求带有空格的 subgraph ID 必须进行节点重命名或加引号，这属于 LLM 的输出幻觉。
- **修复方案**: 在 `website` 和 `admin` 双端的 Markdown 解析器里加入了全参安全适配 `renderer.code = function(arg1, arg2, arg3)` 应对 Marked 大版本差异。并通过正则替换脚本 `fix_all.js`，将所有带有非法语义空格的子图重组为规范的 `subgraph ID [Label]` 格式并写回 DB。
- **结果**: PASS。前后端均可正常查看并解析关系图。
- **相关文件**: `website/src/pages/tutorial/[series]/[lesson].astro`, `admin/src/pages/admin/tutorial/[seriesId].astro`

## BUG-005: 获取翻译 API 时触发 Fetch Zombie Sockets 导致管道死锁挂起

- **发现时间**: 2026-04-13 14:07
- **自愈轮次**: 1 / 5
- **症状**: 用户观察到双语化生成脚本 `translate_to_en.ts` 长时间卡在某一篇翻译条目上毫无进展，误以为是 `503 High Demand` 重复降级，但实际上错误日志已然不再滚动，进程彻底停止了响应。
- **根因**: 由于源文本课件超大（4000多字），调用 API 时的底层 TCP Socket 发生了长时间闲置传输，触发了 Google Cloud 或内部负载均衡的“静默丢弃（Silent Drop）”，而原生的 Node 运行时 `await fetch` 默认并没有提供超时中断机制（Timeout），使得网络监听钩子陷入无限地等待服务器关闭包。
- **修复方案**: 在流式 Fetch 选项之中，果断挂载硬件级别的重连斩杀器：`signal: AbortSignal.timeout(180_000)`，限定3分钟的最迟无响应容限，引发原有的重试退避机制生效。
- **结果**: PASS。僵尸进程被屠杀，新管道顺利跨越该网络陷阱。
- **相关文件**: `admin/scripts/translate_to_en.ts`

## BUG-003: Admin News 页面渲染崩溃，所有 JS 交互失效
- **发现时间**: 2026-04-14 13:00
- **自愈轮次**: 1 / 5
- **症状**: http://localhost:4322/admin/news 页面加载缓慢并直接崩溃，导致顶部的 Tab 切换、实时的关键词搜索框以及所有的复选框操作全部失效，无法点击（闪烁一下就重置）。
- **根因**: 由于在 `news.astro` 文件中，20,000 多条抓取文章（带有大量富文本的 `content`）全量被放入了 `define:vars` 中执行序列化，导致 HTML payload 超过10MB 爆掉内存。同时我通过分页优化该问题后又无意删掉了搜索过滤区 JS 里的闭合括号（缺少 `});`），从而导致 `<script>` block 出现彻底的语法错误，彻底挂断页面的所有动态脚本执行。
- **修复方案**: 
  1. 通过引入 `PAGE_SIZE=200` 实现了后端到前端文章列表的分页。
  2. 移除了传递到前端的大体积 `content` 变量，改由 `api/articles/[id]` 的端点懒加载弹窗预览内容，使得页面体积降低 5 倍（降至 366KB）。
  3. 补齐了 JS 闭合块。
- **结果**: PASS。
- **相关文件**: `admin/src/pages/admin/news.astro`, `admin/src/pages/api/articles/[id].ts`

## BUG-110: 导入产品库未生成 featuresEn 字段
- **发现时间**: 2026-04-19 16:30
- **自愈轮次**: N/A 
- **症状**: 通过 GitHub import 录入到 Variant 表的产品数据，英文 `featuresEn` 为空，只有中文特性。
- **根因**: `admin/src/pages/api/variants/enrich.ts` 接口未将 `featuresEn` 添加到期望的大模型 JSON 约束中，同时 `product.astro` 保存侧也未解析此字段。
- **修复方案**: 在 Prompt JSON 要求中显式加入 `featuresEn` 字段，并在保存 Payload 映射上进行容错赋传。
- **结果**: PASS

## BUG-111: 今日更新看板 E2E 测试运行挂起
- **发现时间**: 2026-04-20 09:35
- **自愈轮次**: N/A
- **症状**: 运行 `npm run e2e` 测试抛出 WebServer 30s 启动超时异常。
- **根因**: `playwright.config.ts` 指定 14321 端口启动服务 `npm run dev -- --port 14321`，但由于 `package.json` 中的命令写死为 `astro dev --port 4321`，导致覆盖参数失效，启动仍然在 4321 上，引发 Playwright 通信断开。
- **修复方案**: 移除 `package.json` 中的硬编码端口 `--port 4321`，由 `astro.config.mjs` 和外部环境变量控制端口。
- **结果**: PASS

## BUG-112: 今日更新看板的新增统计及 timezone 判定错误
- **发现时间**: 2026-04-20 09:50
- **自愈轮次**: N/A
- **症状**: 某日新增的新闻文章无法正确反映到 Today 统计，同时 Products 也由于时区判定永远为 0。
- **根因**: ① 前者由于使用 `Date.UTC()` 强行把 UTC 午夜作为一天的 start (导致早于北京时间早上 8 点的新鲜发布都被划给前一天)。② 后者由于取用 `createdAt` (被爬虫创建的时机)，错过了管理员实际 approved 释出的时间。
- **修复方案**: `todayStart` 替换为 Local 约束 (`setHours(0,0,0,0)`)；以及将产品的计数下限从 `createdAt` 迁移到了 `updatedAt`。
- **结果**: PASS

## BUG-113: 产品导入高并发 503 报错引发的 UI 死锁
- **发现时间**: 2026-04-20 19:40
- **自愈轮次**: N/A
- **症状**: 用户点击导入产品或“AI丰富”按钮后，由于大模型正处于 503 请求排队（负载高），导致前台弹出网络连接异常的瞬间 JS 同步崩溃，无限期卡死在 Loading 转圈动画。
- **根因**: 原有的表单填充函数并未针对 HTML Element 的意外缺失（表单页面竟然遗漏了 features 输入框）设置空值核验。当遭遇错误时未防范该 TypeError (Setting null .value) 进行外围 `try/catch`。
- **修复方案**: 通过采用 `if(el) el.value = val;` 安全兜底处理前端属性填充，并额外为 API 层（`enrich.ts`）补全基于指数退避的 `Delay 2000ms -> Retry 3 Times` 自愈重发防线。最后将硬核打断网页行为的 `alert` 换血为 `showToast`。
- **结果**: PASS
- **相关文件**: `admin/src/pages/admin/product.astro`, `admin/src/pages/api/variants/enrich.ts`

## BUG-114: Website Release Timeline 排序错乱 (Nulls Last)
- **发现时间**: 2026-05-01 14:20
- **自愈轮次**: 1 / 5
- **症状**: 网站 Release Hub 页面显示的最新版本是 4 月 23 日，而管理后台显示今日已有多次更新发布。新发现的 Release 动态在前端页面被推到了列表最末尾。
- **根因**: 在 `website/src/lib/releases.ts` 的 `orderBy` 逻辑中使用了 `nulls: 'last'`。新抓取的 Release 动态由于尚未提取到官方发布日期，`publishedAt` 字段为 `null`，导致它们在降序排列时被错误地视为“最旧”的内容。
- **修复方案**: 将 `orderBy` 中的 `nulls: 'last'` 修改为 `nulls: 'first'`。这样，没有日期的最新动态将排在最前，并辅助以 `createdAt` 降序排列，确保 Timeline 的时效性。
- **结果**: PASS。

## BUG-117: 英文教程底部上下篇导航仍显示中文标题
- **发现时间**: 2026-05-07 14:54
- **自愈轮次**: 1 / 5
- **症状**: 在访问英文版教程（如 `http://localhost:4321/tutorial/agents-comparison-tutorial/lesson-01/`）时，虽然正文和侧边目录均为英文，但页面底部的 "Next" 按钮中的标题依然显示为中文。
- **根因**: `website/src/lib/tutorials.ts` 里的 `getLessonWithNav` 方法在组合返回对象的 `nav.prev` 和 `nav.next` 时，直接将数据库查询出的原始实体塞了进去，并没有像 `mappedLesson` 和 `allLessons` 那样应用 `lang === 'en'` 时切换到 `titleEn` 的多语言判断逻辑，导致前端模板总是读取到默认存为中文的 `.title` 字段。
- **修复方案**: 在拼接 `nav` 对象时，对 `series.lessons` 中的前后文章节点执行相同的扩展映射：当 `lang === 'en'` 时使用 `titleEn` 覆盖 `title`，确保向模板输出正确的语种文字。
- **结果**: PASS。
- **相关文件**: `website/src/lib/tutorials.ts`
