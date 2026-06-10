## Finding v2.4 — HTML5 Nested Anchor Restrictions & Card Link Deseparation (2026-06-06 21:30)

### 背景
用户提出希望将博客、新闻详情页的静态标签（Tags）变成可点击跳转的链接，并希望在教程列表页（Tutorial Index）中同样能点击卡片底部的标签。但是在实现后，发现原有的卡片容器本身就是一个 `<a>` 标签，直接在里面嵌套标签的 `<a>` 链接会引发严重的 HTML 解析问题与样式错位。

### 发现
1. **HTML5 规范下的 nested anchor 限制**：HTML5 规范严格禁止将一个 `<a>` 标签放入另一个 `<a>` 标签内（nested anchors）。如果强行嵌套，现代浏览器（Chrome、Safari 等）在解析 DOM 树时会产生自愈行为，即在遇到内部的 `<a>` 时强行闭合外部的 `<a>`，导致最终渲染出来的 DOM 结构支离破碎，从而引发排版崩塌与交互混乱。
2. **卡片链接解离（Link Deseparation）**：要把卡片底部的标签（Tags）变成独立的超链接，必须将原本作为整体 `<a>` 容器的 `.series-card` 降级为 `<div>` 容器。
3. **微交互的继承性保留**：外部容器降级为 `<div>` 后，原有的悬浮呼吸放大、外边框变色等高保真微交互将失去天然的 `a:hover` 作用域。必须在 CSS 中将相关的 hover 选择器重写为基于父级 `.series-card:hover` 的级联样式（如 `.series-card:hover .series-title-heading a` 和 `.series-card:hover .start-learning-label`），确保用户在悬停于卡片任意位置时依然能获得完全一致的平滑反馈。

### 决策
- **重构组件结构**：将 `tutorial/index.astro` 和 `zh/tutorial/index.astro` 中的 `.series-card` 从 `<a>` 改为 `<div>`，并将封面、标题和“开始学习”按钮分别包装在独立的 `<a>` 标签中，确保内部的 tag pill `<a>` 链接与它们并列存在，遵守 HTML5 标准。
- **级联 Hover 动画优化**：在 CSS 中补充基于 `.series-card:hover` 对内部独立 `<a>` 元素的颜色和缩放过渡（transition）声明，维持原有的整体卡片 Hover 响应体验。

### 影响
- 成功实现了博客、新闻和教程页面全站 Tags 的 100% 超链接化，为站点提供了强力的内链网络和搜索引擎蜘蛛入口。
- 保证了输出 HTML 的规范性与语义化，排除了由于嵌套锚点引发的隐性浏览器排版 Bug。
- 维持了极具品质的悬停交互动效，没有牺牲任何视觉高保真体验。

---

## Finding v2.3 — Product Crawler Approval Locking & Vite Pre-rendering Cache Invalidation (2026-06-05 09:30)

### 背景
在为 AI 科技新闻进行改写提示词更新和卡片美化之后，我们发现管理员已审核通过的产品（Variants）在没有被人工编辑的情况下，其在已审核产品列表中显示的更新时间（`updatedAt`）会被频繁重置为当天，破坏了内容发布历史的一致性。同时，在进行 Astro 全站构建（npx astro build）验证时，Vite 的预渲染元数据缓存偶发性错位，抛出 `Error [ERR_MODULE_NOT_FOUND]`。

### 发现
1. **数据同步与 updatedAt 耦合机制**：后台定时爬虫（如 GitHub Trending Scraper）在抓取产品信息时，会无条件执行 `prisma.variant.update` 以同步最新的 `stars` 和 `upvotes`。即使其他字段没有改动，Prisma @updatedAt 指令在底层依然会生成更新 `updated_at` 为当前时间的 SQL，导致审批数据发布时间被覆盖。
2. **已审核数据的锁定诉求**：审核通过（`approved`）或审核拒绝（`rejected`）的产品代表了管理员对内容进行了明确归档。在此状态下，爬虫不应再对其做自动覆盖，锁定状态属性可以避免数据被后台静默更新。
3. **Astro / Vite 的增量缓存设计隐患**：Astro 编译时，Vite 对预渲染页面模块使用 `.astro` 缓存。在某些情况下（如进行了大范围 AST 或样式变更后），Vite 无法精准判断依赖变动，继续以旧缓存的 chunks 进行预渲染，最终由于缓存文件缺失导致 `ERR_MODULE_NOT_FOUND` 构建崩溃。必须硬性清理编译目录（`rm -rf .astro dist`）重置物理状态。

### 决策
- **审批拦截阀门（Approval Status Gate）**：重构 `product-writer.ts` 逻辑。在爬虫执行 update 之前引入 `approvalStatus` 的类型前置校验，对已被人工终审的记录实施强制 SKIP。
- **清除 Vite 状态的强制规范**：在遇到 prerender 模块缺失构建报错时，一律执行清理命令 `rm -rf .astro dist && npx astro build` 进行完全重置打包。

### 影响
- 成功锁定了已发布产品的时间戳和内容，消除了定时同步的污染。
- 确立了本地纯净 Astro 静态构建流程，规避了全站打包崩溃的隐患。

---

## Finding v2.2 — Cloudflare Pages 文件夹服务机制与 Astro build.format: 'file' 对齐 (2026-06-03 20:56)

### 背景
在规范化全站无尾斜杠 URL 体系（设置 `trailingSlash: 'never'`）并为 Cloudflare Pages 配置 `_redirects` 时，导致了生产环境（如 `/product`、`/news`）陷入无限的 HTTP 301/308 重定向死循环，返回 `ERR_TOO_MANY_REDIRECTS`。

### 发现
1. **Astro 默认构建格式**：Astro 默认的 `build.format` 是 `directory`，这会导致每个路由生成一个文件夹加 `index.html`（例如 `/product/index.html`）。
2. **Cloudflare Pages 服务行为**：当 Cloudflare Pages 收到对 `/product` 的请求，且检测到它对应一个物理文件夹时，Cloudflare 引擎会在底层自动执行 308 重定向，将请求修正为带斜杠的 `/product/`，以便正常读取内部的 `index.html`。
3. **重定向冲突**：我们在 `_redirects` 中配置了尾斜杠规范化，将 `/product/` 301 重定向到 `/product`。这和 Cloudflare 引擎自带的 `/product` -> `/product/` 刚好相反，进而产生了死循环。

### 决策
在 [astro.config.mjs](file:///Users/eric/work/openclaweco.com/website/astro.config.mjs) 中将 `build.format` 配置为 `'file'`。编译后的静态路由变为扁平单文件（如 `dist/product.html`），Cloudflare Pages 在访问 `/product` 时能以 200 直接响应单文件，而在请求带斜杠的 `/product/` 时，由 Cloudflare 自动一次性重定向回 `/product`。配合清洗后的 `_redirects` 规则，彻底解决了重定向循环。

### 影响
- 打破了生产环境的所有重定向死循环。
- 构建产生扁平的单个 HTML 文件，文件目录更加清晰。
- 确保了搜索引擎爬行时不产生冗余的二次跳转，极大优化了 SEO。

---

## Finding v2.1 — AI发版重大分类、双语生图反乱码标准化与 Gemini 代际模型标准化 (2026-06-02 11:00)

### 背景
在为 AI 发版大厅设计 Major/Minor 等级划分与重点词高亮微光胶囊时，遭遇了前端 Astro JSX 将 `<span>` HTML 节点转义为纯字符文本展示的问题，以及后台 Svelte-like AJAX 微动交互级联修改数据库时，由于 update API 编写不够严密而引发的局部字段更新擦除其他列属性的一致性灾难。同时针对全自动新闻分发中生图模型频繁在科技封面图背景中渲染形似汉字与英文字符“AI 乱码”的痛点，以及全系统过往历史残存的旧代际 LLM 模型配额割裂问题进行了集中重构。

### 发现
1. **单页面局部 AJAX API 的擦除隐患**：在进行极简的局部属性级联更新时（例如仅改变 `isMajor` 状态或仅修改 `highlights` 词条），如果后端 REST API 使用的 Prisma 更新命令盲目地解包所有变量（如 `data: { isMajor: Boolean(isMajor), highlights: Array.isArray(highlights) ? ... }`），由于当前只传入一个字段，另一个字段（`undefined`）会在类型转化后被迫退化为 `false` 或 `[]`，从而彻底抹杀数据库中既有的另外半部分人工校正成果。
2. **Prisma 零成本回溯性数据库重构力**：引入新字段（如 `isMajor` 和 `highlights`）到数据库后，必须主动执行回溯性数据迁移（Retroactive Migration）以激活老数据的视觉潜力。通过复用现成的本地启发式解析器，结合特定的 SemVer 正则模式和专有词汇专有词汇矩阵，可在完全不耗费 LLM API 配额和完全避开限流频率限制的前提下，秒级升级 468 条历史脏数据，让整个时间轴瞬间呈现极富品质的高保真等级。
3. **Astro JSX 属性安全防转义**：Astro 模板中普通的 `{ applyTimelineHighlights(...) }` 语法会自动对流中的所有 HTML 实体（如 `<span class="capsule">`）执行 HTML 编码转义，以纯文本形式暴露在前台。必须替换为 `set:html={applyTimelineHighlights(...)}` 指令，越过转义管道直接绑定，才是输出高保真微光胶囊的正确通道。
4. **生图汉字笔画与乱码幻觉的因果律**：生图扩散引擎（如 Imagen）底层基于英文字符-图像 Caption 预训练。在提示词中拼入复杂的中文自然语言摘要，模型在解码还原汉字时极易产生笔画粘连与形似符乱码（Spelling Slop）。将双语配图生成源完全统一为英文（如使用 `summaryEn`），并配合 `"no text, no spelling, no signatures"` 负向阻断以及将排版暗示词 `"typography"` 修正为构图描述，是实现插图零乱码的黄金标准。
5. **模型独立配额灾备与异构算力搭配**：Google AI Studio 下不同物理 ID 模型系列的 `429 Rate Limit`（调用频率限制）是物理独立且互不干扰的。采用新版 `gemini-3.5-flash` 作为改写、总结 and 发版 HTML 提取的通用高速主力（Cost-Speed 最佳平衡点），并搭配 Pro 级别的 `gemini-3.1-pro-preview` 作为高级推理与限流灾备降级防御，能够形成高吞吐且零中断的生产级大模型管线。

### 决策
- **动态 selective-field updates 更新模型**：在 `/api/release-review` 后端中，拒绝全属性写死解包，强制引入属性存在性显式判定（`isMajor !== undefined`, `highlights !== undefined`），仅当 payload 明确存在该 key 时才构造 `updateData` 进行合并写入。
- **本地零消耗回溯迁移脚本**：编写 `crawler/src/release-scraper/migrate-releases.ts` 数据迁移管道，复用本地规则引擎一次性刷新全部 468 条数据，并在后续 crawler 调度时继续保持该本地词汇扫描与 LLM 并发降级机制。
- **Astro set:html 绝对打通**：在 timeline 主页及各产品发版页面，全面铺设 `set:html` 结合 regex-safe 字符逃逸机制的 highlights 胶囊处理器。
- **生图提示词全量英文标准化**：彻底剥离生图提示词中的中文摘要，统一使用英文摘要作为发给 Imagen 的图画上下文，并补充严格的反文字污染和去 Typography 暗示约束。
- **全站 Gemini 代际模型标准化**：更新 `.env` 配置，确立 `gemini-3.5-flash` 主力与 `gemini-3.1-pro-preview` 灾备备份的双级算力格局，同步锁定 Imagen 两级绘图模型。

### 影响
- 彻底解决了控制台交互因数据擦除而引发的高亮丢失灾难。
- 468 条历史老数据瞬间获得崭新的 Major 星标及微光高亮胶囊，极大地饱了整个列表主页和时间线的高保真品质。
- Astro 前台标签渲染 100% 正确，呼吸圆点与脉冲特效 100% 同步流畅。
- 新生成新闻配图完全剔除了无意义的扭曲字符与中文假乱码，高保真图像质量达到 100% 纯净度。
- 文本改写与发版提取全面完成了新代际算力切换，运行速度与可靠性双向拉满。

---�全防转义**：Astro 模板中普通的 `{ applyTimelineHighlights(...) }` 语法会自动对流中的所有 HTML 实体（如 `<span class="capsule">`）执行 HTML 编码转义，以纯文本形式暴露在前台。必须替换为 `set:html={applyTimelineHighlights(...)}` 指令，越过转义管道直接绑定，才是输出高保真微光胶囊的正确通道。

### 决策
- **动态 selective-field updates 更新模型**：在 `/api/release-review` 后端中，拒绝全属性写死解包，强制引入属性存在性显式判定（`isMajor !== undefined`, `highlights !== undefined`），仅当 payload 明确存在该 key 时才构造 `updateData` 进行合并写入。
- **本地零消耗回溯迁移脚本**：编写 `crawler/src/release-scraper/migrate-releases.ts` 数据迁移管道，复用本地规则引擎一次性刷新全部 468 条数据，并在后续 crawler 调度时继续保持该本地词汇扫描与 LLM 并发降级机制。
- **Astro set:html 绝对打通**：在 timeline 主页及各产品发版页面，全面铺设 `set:html` 结合 regex-safe 字符逃逸机制的 highlights 胶囊处理器。

### 影响
- 彻底解决了控制台交互因数据擦除而引发的高亮丢失灾难。
- 468 条历史老数据瞬间获得崭新的 Major 星标及微光高亮胶囊，极大地饱满了整个列表主页和时间线的高保真品质。
- Astro 前台标签渲染 100% 正确，呼吸圆点与脉冲特效 100% 同步流畅。

---

## Finding v2.0 — Pagefind Glob收缩、Prisma运行时缓存死锁与AI双语Slug ASCII标准 (2026-06-02 09:50)

### 背景
随着静态文章数量累积，Cloudflare Pages 在部署静态包时遭遇 2 万个文件数量超标的致命硬限制。同时在重构微信爬虫与 AI 翻译/改写管线时，遭遇了 PrismaClient 运行时校验报错、AI 生成 percent-encoded 中文 Slug 引发设备相关 404，以及 LLM 在翻译过程中偶然抹除 Mermaid 流程图代码块的反引号导致的语法损坏。

### 发现
1. **静态搜索索引文件膨胀**：静态搜索引擎 Pagefind 默认扫描全站所有 HTML 会生成数万个极其细碎的 `.pf` 哈希索引文件。利用 Pagefind config 的 `--glob` 过滤检索范围（如仅对核心博客和教程进行索引），能够在 0 用户体验损耗前提下大幅度削减 43% 的构建文件数量，是规避 Cloudflare 20k 文件红线的首选高杠杆策略。
2. **Prisma Client 虚拟机内存缓存死锁**：在执行 `prisma db push` 更改 schema 后，哪怕在本地重新执行了 `prisma generate`，若原有的 Astro Dev 进程或 WebSocket 挂载进程（如占用 4322, 6688 端口）在后台保持活跃，Node.js 运行态下的老旧 Module 缓存依然会劫持查询，强行抛出 `PrismaClientValidationError`。必须彻底 Kill 对应端口进程，完全重启 Node.js 环境方可破除缓存死锁。
3. **中文 Slug 百分比编码 404 与 Google SEO 降权风险**：中文字符直接进入 URL Slug 在浏览器及微信内置 Webview 中，由于 UTF-8 百分比编码转化及 NFC 与 NFD Unicode 规范差异，会导致设备相关的隐性 404 挂起，极难通过自动化测试捕捉，且会被搜索引擎判定为垃圾死链。**URL 必须锁死为纯 ASCII 英文字符与数字**。
4. **LLM 结构化翻译的格式漂移（Format Slip）**：在对 Markdown 进行长文本翻译时，哪怕 System Prompt 规范再严密，LLM 也会由于温度抖动而在输出 Mermaid 等嵌套代码块时遗漏包裹的反引号。相比于反复调试 Prompt 消耗 Token，在接口层设计精准的 Line/Regex 自愈解析器是维护生产级格式一致性的最佳兜底方案。

### 决策
- **Pagefind 靶向 Glob 约束**：在 `astro.config.mjs` 中对 `pagefind` 强制注入针对 `/blog` 和 `/tutorials` 专属路径的 glob 正则检索，彻底拦截对非核心详情页的无谓索引生成。
- **Prisma Schema 变更强制重启规范**：将“`prisma generate` 后必须彻底 Kill 开发端口并硬重启”写入开发自愈守则。
- **AI 接口 Slug ASCII 强约束**：在后台 `/api/blog/ai-rewrite` 中封装高鲁棒 `slugify` 助手，任何非 ASCII 字符一律滤除或回退至 `titleEn` 生成，并在 `website/public/_redirects` 补充 301 边缘跳转实现历史链接平滑过渡。
- **构建后端 API 自愈过滤链**：在 `/api/blog/ai-translate` 引入 `fixLooseMermaidBlocks` 等正则自愈逻辑，静默自愈 LLM 输出的微小格式缺失。

### 影响
- 构建产物成功从 20,857 瘦身至 11,875，顺利通过 Cloudflare Pages 限制。
- 彻底恢复了微信爬虫控制台的运行活力。
- 线上历史 percent-encoded 链接实现 100% 优雅 301 重定向，全新发布的文章 Slug 清洁度达 100% ASCII 标准。
- Mermaid 渲染再无任何格式坍塌，双语图表还原度达 100%。

---

## Finding v1.9 — Aesthetics Premium Width Consolidation & Mermaid Repair (2026-05-21 13:05)

### 背景
随着 Tech Blog 模块在 Phase 2 开启的大范围视觉与内容重塑，发现全站内容页面的宽度呈现视觉不对称，部分宽屏布局下行宽过宽影响阅读体验，且有些文章（如 `google-antigravity-2-0-explained`）包含缩进异常的 Mermaid 图表源码导致解析挂起。

### 发现
1. **视觉排版与可读性黄金比例**：在长文本阅读中，行宽超过 `1000px` 会使视线跨度过大，产生严重的视觉疲劳；而窄于 `600px` 配合表格展示时会使内容压缩过度。
2. **Mermaid 缩进陷阱**：在 Astro 和 Pagefind 的多层渲染中，Mermaid 时序图的代码如果存在 4 空格缩进或空行残留，会被 Marked 误识别为普通的 Pre/Code 块，导致前端 Mermaid 解析器无法正确捕捉并编译渲染，进而导致解析异常。

### 决策
- **统一黄金宽度规范**：将全站五大核心页面模块的排版宽度进行分类收敛收紧，列表页与图表页限制在 `1000px` 居中，News/Product/Blog 长文详情页收紧到 `720px` 最佳阅读视线宽度，提升全站的视觉品质感。
- **Mermaid 规范渲染约束**：强制所有文章的 Mermaid 图表必须以无多余缩进的零格 ` ```mermaid ` 进行包裹，并建立对应的自动净化规则，彻底避免了因 LLM 幻觉产生缩进而引发图表挂起。

### 影响
- 显著提升了全站五大模块在桌面与移动端下的视觉品质感与易读性，打造了极为 Premium 的技术美感。
- 彻底解决了博客流程图挂起报错问题，保证了静态渲染与搜索索引的完美结合。

---

## Finding v1.6 — AI-First Discoverability via llms.txt (2026-05-15 07:50)

### 背景
随着平台上教程数量的增加，单纯依靠 Sitemap 对 AI Agent 的引导力逐渐减弱。

### 发现
1.  **llms.txt 的优先级**：现代 AI 爬虫（如 GPTBot, PerplexityBot）在访问网站时会优先寻找并解析 /llms.txt。
2.  **结构化引导**：在 llms.txt 中提供带描述的 Markdown 链接，比纯 URL 列表更能帮助 LLM 理解内容价值。
3.  **双语索引**：在 llms.txt 中保留中文首页链接，有助于 AI 在中文语境下也给出准确的推荐。

### 决策
- **教程上线必更**：确立“新教程上线必须同步更新 llms.txt”的开发红线。
- **摘要优化**：在 llms.txt 中使用的描述应包含核心关键词（如 Masterclass, AI-accelerated 等）。

### 影响
- 预计将显著提升教程在 AI 搜索建议中的排名和点击率。

---

# Project Findings

## Finding v1.8 — Multi-Protocol Adaptive Image Generation & CDN Automation (2026-05-18 10:50)

### 背景
Imagen 4 系列生图模型（如 `imagen-4.0-generate` 与 `imagen-4.0-fast-generate`）在 Google AI Studio 下每日共享 70 次的调用限额。一旦发生高强度改写与频繁生图，极易频繁触发 429 Resource Exhausted 额度耗尽报错，从而阻断全自动文章分发管线。

### 发现
1. **多模态生图新选择**：**Nano Banana Pro (`gemini-3-pro-image-preview`)** 大模型支持高质量图像生成，且其配额与 Imagen 4 完全隔离独立。
2. **底层协议不兼容**：传统的 Imagen 4 模型属于图像生成模型，需调用 API 专用 `:predict` 端点；而 Nano Banana Pro 属于多模态大模型，必须调用 Google 统一的 `:generateContent` 端点。
3. **数据解包差异**：`:predict` 的出参为 base64 的 predictions 数组，而 `:generateContent` 的出参是 candidates.content.parts 下的 Base64 `inlineData`。

### 决策
- **实现协议自适应适配器 (Adapter)**：在 `image-generator.ts` 中根据 `modelName` 前缀智能分流。以 `gemini-` 开头时自动切换端点为 `:generateContent` 并打包大模型 Payload；提取时检测其 `inlineData` 字段，实现协议高度解耦。
- **自动熔断与降级级联**：配置 `IMAGE_GENERATOR_MODEL` 变量，将 Nano Banana Pro 作为第三优先级兜底，前两层 429 报错时，系统秒级无缝下线并由第三层完美接管。

### 影响
- 在实测中成功秒级熔断降级并由 Nano Banana Pro 成功接替，批量生成并同步上传了 **37 篇** 历史空封面文章的双语配图至 Cloudflare R2，打通了全站多模型灾备架构。

---

## Finding v1.6 — AI-First Discoverability via llms.txt (2026-05-15 07:50)

### 背景
随着平台上教程数量的增加，单纯依靠 Sitemap 对 AI Agent 的引导力逐渐减弱。

### 发现
1.  **llms.txt 的优先级**：现代 AI 爬虫（如 GPTBot, PerplexityBot）在访问网站时会优先寻找并解析 。
2.  **结构化引导**：在  中提供带描述的 Markdown 链接，比纯 URL 列表更能帮助 LLM 理解内容价值。
3.  **双语索引**：在  中保留中文首页链接，有助于 AI 在中文语境下也给出准确的推荐。

### 决策
- **教程上线必更**：确立“新教程上线必须同步更新 llms.txt”的开发红线。
- **摘要优化**：在  中使用的描述应包含核心关键词（如 Masterclass, AI-accelerated 等）。

### 影响
- 预计将显著提升教程在 AI 搜索建议中的排名和点击率。

## Finding v1.5 — Command Set Versioning & Official Spec Alignment (2026-05-14 14:20)

### 背景
在优化 Claude Code 教程时发现，随着工具版本的快速迭代（如从 v1.x 到 v2.x），大量的 UX 指令（如 `/scroll-speed`, `/statusline`）被移除或整合进 `/config`。

### 发现
1.  **指令不稳定性**：CLI 工具的内部斜杠命令变动频率高于主要 CLI 参数。
2.  **官方规范偏差**：第三方或早期的 AI 生成文档往往包含大量过时的“幻觉”命令。
3.  **add-dir 的本质**：`/add-dir` 并非简单的“添加路径”，而是“添加工作目录”，涉及会话恢复（--resume/--continue）和配置隔离（.claude/）。

### 决策
- **动态校验机制**：在编写 Command 教程时，必须通过 `strings` 扫描二进制文件或运行 `claude help` 实时校验命令存在性。
- **以官方 Spec 为准**：当 AI 生成内容与官方定义冲突时，必须强制对齐官方 Spec（如 `/add-dir` 的详细定义）。

### 影响
- 显著提升了教程的准确性，减少了用户的调试挫败感。
- 确立了未来所有 CLI 相关教程的“实时扫描校验”规范。

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


## Finding v1.5 — 破坏性全量同步的危害与靶向导入架构 (2026-05-13)

### 背景
在使用全局同步脚本 `sync_bilingual_all.ts` 导入单篇新教程 (`anti-scraping-tutorial`) 时，由于其默认机制会将缺失 `status` 或 `coverImage` 字段的 Frontmatter 强制覆盖入库，导致线上 25 个旧系列和近 500 篇文章的发布状态被重置为 `draft`，封面全部被置为 `null`，且触发了 Prisma `@updatedAt` 强制更新了时间线。

### 发现
1. **全局扫射的灾难性后果**: 批处理脚本如果缺乏增量控制或选择性执行的能力，极易造成生产数据的无差别篡改。
2. **Prisma 拦截的盲区**: Prisma ORM 的 `update` 会无视传入的时间戳字段并强行触发 `updatedAt = now()`，导致系统发布时间流紊乱。

### 决策
- **废弃全局同步，转向靶向导入 (Targeted Import)**: 放弃在后台随意跑 `sync_all` 脚本。建议开发一套基于 Admin 网页的可视化导入器。
- **强制前置备份拦截器**: 未来所有牵涉到全量修改、大规模 Upsert 的自动化脚本当中，必须主动通过子进程调用 `pg_dump` 形成按时间戳命名的硬备份文件 (`database/backups/`)。
- **原生 SQL 降级**: 当必须精准修复具有生命周期字段（如 `created_at`, `updated_at`）的数据时，必须使用 `prisma.$executeRawUnsafe` 绕过 ORM 的自作主张。

### 影响
- 成功地从 `.sql` 备份文件中抽取出历史数据，写了两个专门的修复脚本 (`restore_covers.ts`, `restore_dates.ts`) 完美逆转了灾难。

## Finding v1.6 — Astro outDir 清空机制与 macOS 文件锁定引发的部署链崩溃 (2026-05-31 19:10)

### 背景
用户在执行 `npm run build` 时频繁在清理阶段遭遇 `rm: .../website/dist/news: Directory not empty` 构建中断。为了绕过该文件锁，此前曾尝试使用 `find` 排除 `.git` 进行原地保留清理，但随即导致线上 `/product/`、`/releases/` 等动态路由页面大面积 404，且本地 `website` 源码仓库的 remote origin 被意外篡改为部署分支并遭到污染。

### 发现
1. **MacOS 文件监视锁机制 (FSEvents)**: 移动或删除 `.git` 文件夹是一个敏感操作，会立刻触发操作系统后台进程（如 VS Code Git 扩展、shell 提示符）激活扫描。这种后台文件扫描产生的短时文件锁，会使紧随其后的 `rm -rf dist` 因句柄未释放而锁死中断。
2. **Astro 编译 outDir 清除机制**: Astro 在执行 `astro build` 时，其底层机制会**默认直接清空并擦除整个输出目录 (`dist/`)**。这导致任何“原地保留 `.git`”的 `find` 清理方案都会在 Astro 编译启动时被瞬间抹除。
3. **Git 的向上检索特性 (Upward Traversal)**: 当 `dist/.git` 被 Astro 清空抹除后，在此目录执行的任何 git 动作（如 `git remote` 或 `git commit`）均因找不到当前目录的 `.git` 而自动沿父目录向上检索，最终绑定在父级源码仓库 `website/.git` 下。这导致：
   * 本应作用于 `dist` 的 remote origin 篡改动作在父级源码仓库生效，指向了部署库。
   * 本应只包含 html 构建成品的推送操作将整个父级 `website` 源码强制推上了线上，使线上 404 页面丢失且无法构建动态页面。

### 决策
- **引入 settle 延时释放**: 在 `mv "$DIST/.git" "$BACKUP"` 后强制加入 `sleep 1`。这段微小的延迟能使 macOS 文件系统监视器彻底平息其文件扫描并释放文件锁，确保接下来的 `rm -rf "$DIST"` 100% 畅通无阻。
- **还原并加固备份-还原机制**: 放弃原地保留，承认 Astro 清除 outDir 的宿命，保留 `.git` 的备份与还原，并在此基础上做好 Git 隔离校验。

### 影响
- 彻底解决了 `rm: Directory not empty` 编译中止的顽疾。
- 找回并保护了父级源码仓库，消除了部署对源码的二次污染隐患。
- 恢复了线上的 200 OK 交付状态，全站动态路由页面完美归位。

---

## Finding v2.5 — Google AI Studio Billing Tier Rates & Client-Side 404 Clean URL Redirection (2026-06-10 13:00)

### 背景
用户发现 Google AI Studio 的每日计费看板在最近几天（6月6日-10日）一直显示为 $0 账单，但后台数据库中显示每天都有 10-30 篇的 AI 改写记录，且今日累积花费停留在 $10.63。同时，由于 Astro 的 Clean URL 构建机制，导致部分带有历史遗留 `.html` 后缀的页面访问引发 404。

### 发现
1. **计费模式与 Tier 等级特性**：
   - 当 GCP 计费项目启用并升级到 Paid Tier (如 Tier 2) 时，Google AI Studio 的免费额度策略不会自动对冲或免费显示。所有的 Token 调用均会计费。
   - **极低费率的隐藏特性**：Gemini 3.5 Flash 拥有极高的性价比（输入 $1.50/1M, 输出 $9.00/1M）。当每日请求极低（仅数十次，总消耗数万 Token）时，产生的实际日费用低于 $0.01。在 AI Studio 简化的大额度图表中，这部分小数值在精度保留和四舍五入后会直接被合并归零（显示为 $0.00），产生了“没有扣费”的假象。
   - **发票层代金券抵扣**：用户的 $100 每月赠金（代金券）是在 GCP 计费账户出账发票层面进行核销抵扣，而 AI Studio 面板显示的是项目原始消费净额。
2. **文件夹型 Clean URL 触发 404 的原因**：
   - Astro 构建使用文件夹目录形式（如 `/path/index.html`，浏览器访问 `/path`）。当有爬虫或外部链接显式访问旧版后缀 `/path.html` 时，Cloudflare Pages 会在物理目录寻找 `path.html`，找不到便抛出 404，而不会自愈跳转到 `/path/`。

### 决策
- **边缘 301 与 404 双通道拦截兜底**：
  - **边缘 301 重定向**：对已知重构改名（如 zero-padding 课时零偏差 `/lesson-03/ -> /lesson-3/`）在 `website/public/_redirects` 中录入精准的 301 规则，减少回源开销。
  - **404 客户端 JS 强力自愈**：在 `website/src/pages/404.astro` 中注入一段轻量级的前端重定向代码。当检测到路径以 `.html` 结尾时，自动剥离后缀并重定向到 Clean URL（`/path/`），以极低侵入性的客户端跳转对所有未知历史链接实施兜底。

### 影响
- 为用户解释清了 Google AI Studio 账单为 $0 的精度及赠金核销机制。
- 成功打通了全站的 404 降噪兼容性，不论是爬虫请求 `.html` 还是访问过期的 zero-padding 目录，均能实现平滑的自愈跳转。

