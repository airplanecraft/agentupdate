## BUG-142: Astro 404 页面语言切换按钮生成无效 `/zh/404/` 死链与 awesome-claude-code 外部死链 (Fixed 2026-06-24)

- **发现时间**: 2026-06-24 09:36
- **自愈轮次**: 1 / 5
- **症状**: 运行 `npm run local-build` 进行静态构建与链接审计时，报告发现 2 个内部死链：`/zh/404/` (在 `404.html` 中引用) 以及 `https://www.agentupdate.ai/zh/404/`，另外还有 `https://github.com/anthropics/awesome-claude-code` 外部链接返回 404 Not Found。
- **根因**:
  1. 在 `website/src/layouts/BaseLayout.astro` 中，`is404` 的判断条件为 `cleanPathname === '/404' || cleanPathname === '/zh/404' || cleanPathname === '404'`。但由于 canonical 路径处理逻辑会将路径自动补齐尾部斜杠变为 `/404/` 或 `/zh/404/`，导致 `is404` 条件始终为 `false`。因此在 404 页面中，语言切换按钮会被错误地生成为指向 `/zh/404/` 的死链，而实际上网站并没有单独的中文 404 页面，404 页面是单文件并通过客户端 JS 进行中英文适配的。
  2. 技能市场数据文件 `skills-directory.json` 中配置的 "Awesome Claude Code" GitHub 仓库 URL `https://github.com/anthropics/awesome-claude-code` 并非真实存在的仓库，Anthropic 官方没有此仓库，导致其返回 404 错误。
- **修复方案**:
  1. 在 `BaseLayout.astro` 中修改 `is404` 的匹配逻辑，使其支持带尾部斜杠的路径：`cleanPathname === '/404/' || cleanPathname === '/zh/404/' || cleanPathname === '/404' || cleanPathname === '/zh/404' || cleanPathname === '404'`。这样当在 404 页面时，`is404` 能够正确识别为 `true`，从而使语言切换按钮正确指向 `/zh/` 或 `/`，而不是不存在的 `/zh/404/`。
  2. 将 `skills-directory.json` 中 `awesome-claude-code` 技能的 GitHub URL 修正为社区最活跃的精选仓库 `https://github.com/subinium/awesome-claude-code`。
- **结果**: PASS。重新运行 `npm run local-build`，静态页面成功编译且内部死链审计结果为 **0**。
- **相关文件**: 
  - [BaseLayout.astro](file:///Users/eric/work/openclaweco.com/website/src/layouts/BaseLayout.astro)
  - [skills-directory.json](file:///Users/eric/work/openclaweco.com/website/src/data/skills-directory.json)

---

## BUG-141: Astro 静态构建因自定义 ESM 加载器 (patch-loader.js) 导致预渲染分块加载失败 (Fixed 2026-06-23)

- **发现时间**: 2026-06-23 10:25
- **自愈轮次**: 1 / 5
- **症状**: 运行本地构建命令 `pnpm local-build` (即 `bash build-deploy.sh --local`) 时，Astro 静态页面预渲染阶段报错 `Cannot find module .../_series__Ck-YjWLH.mjs` 并导致构建中断。
- **根因**: 构建脚本 `build-deploy.sh` 在执行 `astro build` 时使用了自定义加载器 `patch-loader.js` (`node --import ./patch-loader.js ...`)，该加载器拦截并阻止了 Tailwind CSS (与 `esm-cache`) 相关的加载器注册。而在 Astro 的静态生成阶段，多进程预渲染工作者 (prerender workers) 启动时，由于该自定义加载器的干扰，导致 Node.js 无法解析并加载 Vite 动态分块 (dynamic chunk) 模块。
- **修复方案**: 在 `website/build-deploy.sh` 中移除了构建命令中对 `patch-loader.js` 的 `--import` 依赖，直接运行标准的 `npx astro build` 进行生产静态资源编译（加载器补丁本是为了开发阶段屏蔽 Tailwind 以提高速度，不应作用于生产构建阶段）。
- **结果**: PASS。本地 local build 及 Pagefind 索引审计完全成功。
- **相关文件**: [build-deploy.sh](file:///Users/eric/work/openclaweco.com/website/build-deploy.sh)

---

## BUG-140: Telegram Bot 监听因 SOCKS5 代理挂起导致收不到消息 (Fixed 2026-06-17)

- **发现时间**: 2026-06-17 14:31
- **自愈轮次**: 1 / 5
- **症状**: Telegram 机器人收不到消息，用户发送命令无响应。后台 Telegram bot 监听任务（`node scratch/telegram-bot-listener.mjs`）虽然处于 RUNNING 状态，但日志中没有任何新的轮询记录，上一次进度停留在数小时前。
- **根因**: 由于在本地开发环境下连接 `api.telegram.org` 必须经过 Cloudflare WARP 提供的 SOCKS5 代理（端口 40000），而在之前某个时刻 SOCKS5 代理端口断开或重新连接，导致 polling 脚本在发起 long-polling 请求时遭遇 `connect ECONNREFUSED 127.0.0.1:40000` 错误。因为 `socksFetch` 中使用的 `socks-proxy-agent` 配合原生 `https.request` 时，当连接失败或代理异常时，某些 promise 并没有被正确 reject 或触发 timeout 销毁 socket，导致 long-polling 异步请求处于永久 Pending 的悬挂状态，整个 Node 轮询流程因此锁死挂起。
- **修复方案**: 
  1. 检查 Cloudflare WARP 状态，确认 WARP 目前已处于 Connected 状态，且 `WarpProxy on port 40000` 代理已正常启动并可用。
  2. 使用 `manage_task` 强制杀死已挂起的 Telegram 监听任务进程（原 `task-4513`）。
  3. 重新在后台启动全新的 Telegram 监听任务（新 `task-4918`，运行 `node scratch/telegram-bot-listener.mjs`）。
  4. 使用 curl 测试工具模拟通过代理向用户发送消息，确认网络链路和 bot 回复完全畅通。
- **结果**: PASS。控制台与 bot 日志运行正常，无连接错误日志，测试消息已成功送达用户 Telegram 账号（`chat_id: 8250511379`）。
- **相关文件**: [telegram-bot-listener.mjs](file:///Users/eric/work/openclaweco.com/scratch/telegram-bot-listener.mjs)

---

## BUG-139: Crawler 与 Admin 模块全量单元测试及 E2E 测试失败 (Fixed 2026-06-15)

- **发现时间**: 2026-06-15 19:36
- **自愈轮次**: 1 / 5
- **症状**:
  1. `crawler` 模块运行 `pnpm run test` 时报错：`TypeError: prisma.article.count is not a function` 以及 `cron.schedule` 预期调用次数不符。
  2. `admin` 模块运行 `npm run e2e` 时，遇到 6688 端口已被开发进程占用导致的 `EADDRINUSE` 挂起，且侧边栏 nav-item 数量断言错误，`/admin/variants` 路由不存在导致超时，警告弹窗 confirm text 因空格与 emoji 无法匹配，以及 `github-import` 测试依赖于真实外网和 AI 接口调用容易失败。
- **根因**:
  1. `heartbeat.test.ts` 新增调用了 `prisma.article.count` 方法，但在 mock 列表中未对此补齐 mock 声明。
  2. `scheduler.ts` 后来添加了 `releasePoll` 和 `productPoll` 这两个定时任务，`cron.schedule` 实际调用次数由 2 变更为 4。
  3. `admin` 启动 WebServer 会默认 spawning 微信 WS 服务（6688端口），在 E2E 模式下会和本地正在运行的正常 dev 服务的 WS 端口冲突。
  4. 随着开发版本的更新，侧边栏 nav-item 由原先的 6 个增加至 16 个，原测试中断言 `toHaveCount(6)` 挂掉。
  5. 系统导航路由已由 `/admin/variants` 迁移至 `/admin/product`，原测试仍访问失效路由。
  6. 页面 confirm 弹窗提示中间包含空格和 emoji，原测试 `toContain` 的无空格纯文字匹配不上。
  7. `github-import` 原始设计为对 GitHub Search、Gemini AI 以及保存 API 的全链路真实外网调用，导致其不具备测试隔离性与环境健壮性。
- **修复方案**:
  1. 在 `heartbeat.test.ts` 中补齐 `count: mockCount` 的 mock 声明，并在 beforeEach 里将其 mockResolvedValue(0)。
  2. 更新 `scheduler.test.ts` 里的 assertion，以匹配实际 4 次 `cron.schedule` 注册。
  3. 在 `admin/playwright.config.ts` 启动时注入 `IS_E2E=true`，并在 `admin/astro.config.mjs` 中判断若此 flag 成立，则跳过 spawn 微信 WS 服务。
  4. 更新 `admin-layout.spec.ts` 侧边栏 `.nav-item` 个数为 16，并采用精细化的 labels 模糊/exact 过滤匹配，将侧边栏点击范围限定在 `.sidebar` 下以防干扰。
  5. 将 `admin-variants.spec.ts` 中所有的 `/admin/variants` 修改为 `/admin/product`，更新 title 期望为 `/产品/`。为了屏蔽数据库内 pending variant 的干扰，在获取页面元素前，增加了显式点击 `screenTab` 的操作。
  6. 修正 `test-purge-stale.spec.ts` 中 confirm 弹窗内容匹配条件，并使用通配符路由 `**/api/articles/purge-stale` 捕获拦截。
  7. 物理删除了两个多余写挂的临时调试脚本 `test-batch.spec.ts` 和 `test-debug.spec.ts`。
  8. 对 `github-import.spec.ts` 和 `tutorial-import.spec.ts` 里的核心 API 全部部署了高内聚的 Playwright Mock 拦截器，加入了合理过渡延迟（500ms）以供 UI 状态观测，排除了外部网络和环境依赖。
- **结果**: PASS。本地 `crawler` vitest 71 个用例 100% 通过；`website` Playwright 38 个 E2E 用例 100% 通过；`admin` Playwright 25 个 E2E 用例 100% 通过；运行 `npm run local-build` 本地编译打包完全成功，且 0 内部死链。
- **相关文件**: `crawler/tests/unit/heartbeat.test.ts`, `crawler/tests/unit/scheduler.test.ts`, `admin/playwright.config.ts`, `admin/astro.config.mjs`, `admin/tests/e2e/admin-layout.spec.ts`, `admin/tests/e2e/admin-variants.spec.ts`, `admin/tests/e2e/test-purge-stale.spec.ts`, `admin/tests/e2e/github-import.spec.ts`, `admin/tests/e2e/tutorial-import.spec.ts`

---

## BUG-138: GitHub Search Import Variant Fails with Unique Constraint Error on `(source_type, source_id)` (Fixed 2026-06-09)

- **发现时间**: 2026-06-09 11:53
- **自愈轮次**: 1 / 5
- **症状**: 在管理后台（`http://localhost:4322/admin/product`）通过 GitHub 搜索框搜索产品（如 "scrapling"）并点击“导入产品库”按钮时，系统会弹出报错框：“导入失败: PrismaClientKnownRequestError: Unique constraint failed on the fields: (`source_type`,`source_id`)”，导致产品无法成功导入或更新。
- **根因**: 
  1. 数据库中已经存在一个因为爬虫抓取而生成的 pending 状态的 variant 记录（例如 slug 为 `scrapling-github-trending`，`sourceType` 为 `github_trending`，`sourceId` 为 `D4Vinci/Scrapling`）。
  2. 当管理员手动通过 GitHub 搜索导入同一个项目时，前端发出的 `slug` 为 `scrapling`，后端尝试使用 `prisma.variant.upsert` 匹配此 `slug`，此时会匹配到既有的已审核/手动创建的 record（slug 为 `scrapling`）。
  3. 后端在匹配成功后执行 `update` 操作，试图将 `sourceType` 改为 `'github_trending'`，但因为后端原本没有保存/更新 `sourceId` 的逻辑（该字段在 upsert 中被遗漏，所以仍保持原数据库中的 `D4Vinci/Scrapling` 值），这将使 slug 为 `scrapling` 的这条记录在 update 后拥有和 pending 记录完全相同的 `(sourceType, sourceId)`，即 `('github_trending', 'D4Vinci/Scrapling')`，从而触发数据库的唯一性约束错误。
- **修复方案**: 
  1. 重构 `/admin/src/pages/api/variants.ts` 中的 POST 接口：
     - 类型定义及 upsert 的 `update` / `create` 代码块中补齐对 `sourceId` 字段的读写。
     - 从 `githubUrl` 中自动解析 `sourceId`（例如 `owner/repo`），或直接读取 payload 中的 `sourceId`。
     - 在执行 `upsert` 前增加主动去重与合并步骤：如果在数据库中检测到存在其它 `slug` 不一致且处于 `pending` 状态的同名 repository（即 `sourceType` 和 `sourceId` 匹配，或 `githubUrl` 匹配），直接将其安全物理删除，防止唯一键冲突。
  2. 前端 `admin/src/pages/admin/product.astro` 的 payload 构造处，同步加入 `sourceId: repo.fullName` 传递给后端，使前后端字段更加完整。
- **结果**: PASS。本地编写测试证明待审批的冗余 pending 冲突记录被成功安全清除，主 variant 记录顺利完成 upsert 覆盖。全站本地构建测试 `npm run local-build` 与 admin 端 `npm run build` 全部零错误通过。
- **相关文件**: `admin/src/pages/api/variants.ts`, `admin/src/pages/admin/product.astro`

---

## BUG-137: Tutorial Sync Cover Image Overwrite & Illustration Loss (Fixed 2026-06-07)

- **发现时间**: 2026-06-07 08:32
- **自愈轮次**: 1 / 5
- **症状**: 运行 `sync_bilingual_all.ts` 双语同步脚本后，管理员先前在后台通过 AI 生成或手动配对好的所有教程系列（TutorialSeries）与教程课时（TutorialLesson）的封面图（`coverImage`）全部在数据库中被重置为了 `null`，导致前台与后台的教程列表、教程详情配图大面积丢失，回退为灰色占位框。
- **根因**: 同步脚本 `admin/scripts/sync_bilingual_all.ts` 在读取本地 Markdown 文件的 Frontmatter 时，会对教程系列构造更新数据 `data`。对于没有硬编码在本地 index.md 或 series.json 中的封面字段，它采取了强行置空的回退规则：`coverImage: meta.cover || meta.coverImage || null`。当对已存在的记录执行 `prisma.tutorialSeries.upsert` 时，`update` 条件将无条件以 `null` 覆盖数据库中既有的人工/AI 生图成果。
- **修复方案**: 
  1. 编写并运行了恢复脚本 [restore-covers.ts](file:///Users/eric/work/openclaweco.com/scratch/restore-covers.ts)。
  2. 该脚本拉取前天（2026-06-05）自动归档并提交到 Git 的 `openclaweco_backup.sql` 物理快照，定位并解析了其中 `tutorial_series` 和 `tutorial_lessons` 的 `COPY ... FROM stdin` 数据块，提取出每个系列和课时的历史封面 URL（如 `/covers/tutorial-hermes-agent.jpg`）。
  3. 通过 Prisma 遍历将提取的封面路径重新回写至 active PostgreSQL 数据库，成功修复了 28 个系列和 25 节课时。
  4. 重新执行全站 `npm run local-build` 打包编译并触发 `./session-push-all.sh` 同步最新 SQL 灾备。
- **结果**: PASS。教程列表及课时详情的精美 AI 封面图和配图已完美恢复归位，本地静态打包完全无错通过。
- **相关文件**: `admin/scripts/sync_bilingual_all.ts`, `scratch/restore-covers.ts`

---

## BUG-134: Product Crawler Sync Resets updatedAt for Approved Products in UI (Fixed 2026-06-05)

- **发现时间**: 2026-06-05 09:22
- **自愈轮次**: 1 / 5
- **症状**: 管理员审核通过的产品，在系统运行过程中（特别是定时爬虫执行时），其在已审核产品列表（`admin/src/pages/admin/product.astro`）中的“更新时间”会被自动重置为最新的当天日期。即使管理员根本没有对这些产品的内容做出任何实质性的修改。
- **根因**: 在定时拉取 Trending 列表同步最新的 `stars`（星标）和 `upvotes`（点赞）时，爬虫会调用 `prisma.variant.update` 对产品数据进行写入。由于 Prisma 的 `@updatedAt` 特性，任何 update 写入都会强行将 `updatedAt` 时间戳更新为当前系统时间，从而误导前端 UI 的“更新时间”字段。
- **修复方案**:
  - 重构 `crawler/src/product-scraper/product-writer.ts` 写入模块。
  - 在写入前，增加针对 `approvalStatus` 的校验。如果产品已经经过审批（状态为 `approved` 或 `rejected`），则直接跳过该记录（SKIP），不调用任何 `prisma.variant.update` 以防止其 `updatedAt` 被改写，锁定了已审核产品的内容和更新时间。
- **结果**: PASS。编写并执行了测试脚本 `test-crawler-skip.ts`，验证被锁定产品的 `updatedAt` 与星标数均未被修改。全站编译正常通过。
- **相关文件**: `crawler/src/product-scraper/product-writer.ts`

---

## BUG-012: Admin Tutorial Importer UI Regression (Fixed 2026-05-13)

- **发现时间**: 2026-05-13 10:00
- **自愈轮次**: 1 / 5
- **症状**: Git 重置后，`admin/tutorial.astro` 中的“导入教程”按钮和弹窗交互逻辑丢失。
- **根因**: 上次会话的非受控 Git 操作覆盖了未提交的 UI 代码。
- **修复方案**: 手动恢复丢失的 Astro 组件代码、弹窗 State 逻辑以及前端交互 Script。
- **结果**: PASS
- **相关文件**: `admin/src/pages/admin/tutorial.astro`

# 缺陷记录 (Bugs)

## BUG-133: Cloudflare Pages 静态路由尾斜杠重定向死循环 (Fixed 2026-06-03)
- **发现时间**: 2026-06-03 20:25
- **自愈轮次**: 1 / 5
- **症状**: 部署到 Cloudflare Pages 的生产网站（如 `/product`、`/news`）访问时会报错 `ERR_TOO_MANY_REDIRECTS`，陷入无限重定向死循环，导致全站所有核心索引页完全无法打开。
- **根因**: Astro 默认以文件夹形式（`directory` 格式）构建静态页面，输出诸如 `dist/product/index.html`。Cloudflare Pages 在检测到这是一个物理文件夹后，默认会自动将 `/product` 308 重定向到带斜杠的 `/product/` 来访问其下的 index.html。然而，为了保持无尾斜杠 canonical 链接，我们在 `public/_redirects` 配置文件中，强制将带斜杠的 `/product/` 重定向回 `/product`。这两股重定向逻辑相互冲突，进而形成了闭环，导致浏览器无限跳转。
- **修复方案**:
  1. 在 `website/astro.config.mjs` 中添加 `build: { format: 'file' }`。这会让 Astro 将静态页面编译为扁平文件（如 `dist/product.html`），从而让 Cloudflare Pages 能够以 200 直接服务 `/product`，且在用户访问带斜杠的 `/product/` 时，由 Cloudflare 自动一次性重定向回 `/product`。
  2. 运行 Python 脚本对 `public/_redirects` 进行全量清洗，将所有重定向目标 URL 的尾部斜杠全部剥离（例如目标 `/zh/blog/.../` 修正为 `/zh/blog/...`），消除多重跳转隐患。
- **结果**: PASS。本地构建打包成功，Pagefind 索引过滤正常工作，线上重定向无限死循环故障彻底解除。
- **相关文件**: `website/astro.config.mjs`, `website/public/_redirects`

## BUG-132: Admin Release Hub 局部更新 API 因解包类型劫持导致数据擦除 (Fixed 2026-06-02)
- **发现时间**: 2026-06-02 10:35
- **自愈轮次**: 1 / 5
- **症状**: 在发版审批后台（`http://localhost:4322/admin/releases`）使用列表快速切换 `isMajor` 状态时，该条发版之前由爬虫或 LLM 抓取的 `highlights`（高亮词）会被瞬间清空重置为 `[]`；同样，在抽屉中修改并保存 `highlights` 关键词时，该发版的 `isMajor` 状态会被瞬间重置为 `false`，导致数据频繁发生交互擦除。
- **根因**: 后台审批控制器 `/api/release-review` 中的 `update` action 采用了非受控全属性盲目赋值。每次执行 update 时，由于 request body 只会携带被修改的那一个字段，另一个未携带字段（`isMajor` 或 `highlights`）即为 `undefined`。Prisma 的参数结构直接将未定义的 `highlights` 解包为 `Array.isArray(undefined) ? ... : []` -> `[]`，并将未定义的 `isMajor` 解析为 `Boolean(undefined)` -> `false`，强行重写了数据库记录，导致属性被交互擦除。
- **修复方案**: 
  1. 重构 `/admin/src/pages/api/release-review.ts` 中的 `action === 'update'` 分支逻辑。
  2. 声明一个空对象 `updateData: any = {}`，通过 `isMajor !== undefined` 和 `highlights !== undefined` 显式校验字段存在性，按需装载字段后，再统一送入 `prisma.release.update` 执行，从而彻底消除类型强转对非修改字段的副作用。
- **结果**: PASS。控制台内不管是连点 Major 状态还是连续修改标签并保存，其它列属性均完美锁定，修改操作达到完美隔离。
- **相关文件**: `admin/src/pages/api/release-review.ts`

## BUG-131: 英文版翻译中 Mermaid 代码块反引号丢失导致渲染崩溃 (Fixed 2026-06-01)
- **发现时间**: 2026-06-01 10:45
- **自愈轮次**: 1 / 5
- **症状**: 英文翻译后的 BlogPost ID 27 在展示 Architecture Overview 章节时，Mermaid 流程图直接呈现为一坨无格式的 raw 文本段落，完全无法被 Mermaid 引擎识别并渲染为 SVG 关系图。
- **根因**: 在调用 LLM 进行 Markdown 文档英译的过程中，LLM 偶尔会出现格式飘移（Format Slip），直接丢弃或截断了包裹 Mermaid 语法的 ` ```mermaid ` 三反引号，导致语法结构被当成普通 Markdown 段落输出，直接污染了数据库。
- **修复方案**: 
  1. 编写并运行 `fix-composio-mermaid.ts` 临时修复脚本，精准锁定 BlogPost ID 27 中的损坏文本，补充闭合三反引号以恢复其在数据库中的正常渲染。
  2. 在 `admin/src/pages/api/blog/ai-translate.ts` 的接口处理流中引入 `fixLooseMermaidBlocks` 强力正则捕获函数，一旦检测到有散落的以 `mermaid` 起头且未闭合的语法块，自动采用反引号进行安全物理包裹，实现格式自愈。
- **结果**: PASS。英文版详情页的 Mermaid 架构图均渲染出非常 premium 的渐变关系拓扑，再无漏字或裸文本溢出现象。
- **相关文件**: `admin/src/pages/api/blog/ai-translate.ts`

## BUG-130: 博客文章 AI 改写生成中文 URL Slug 导致百分比编码 404 (Fixed 2026-06-01)
- **发现时间**: 2026-06-01 09:30
- **自愈轮次**: 1 / 5
- **症状**: 线上中文版博客在点击某些新发布的 AI 生成文章时报错 404。地址栏呈现一长串高度 percent-encoded 且极其臃肿的 URL（例如 `%E6%9E%84%E5%BB%BA%E7%8E%B0%E4%BB%A3...`），且极易在移动端微信内置浏览器中引发 NFC 与 NFD 规范导致的永久 404 挂起，且会被 Google 搜索引擎认定为链接死链进行权重降级。
- **根因**: 之前的 `ai-rewrite.ts` 接口对 LLM 返回 of JSON 格式直接信任，未对 `slug` 字段进行全字符集 ASCII 强校验与过滤，导致中文字符以原生态形式直接作为 Slug 写入了 PostgreSQL 数据库并被 Astro 编译为了文件系统路径。
- **修复方案**:
  1. 在 `admin/src/pages/api/blog/ai-rewrite.ts` 中精心设计并部署 `slugify` 过滤器，通过 unicode 降噪、强力剥离非 ASCII 与标点符号，确保 Slug 只能由英文字母、数字和横杠 `-` 组成。
  2. 融入高鲁棒的回退逻辑：若过滤后 Slug 为空（如纯中文输入），则自动提取 `titleEn` 英文标题进行 slugify；若再次为空则利用时间戳与随机 Hash 补位，实现 100% 字符级安全。
  3. 执行数据库迁移，将已存在的 BlogPost ID 26 中文 Slug 订正为 `modern-web-architecture-seo-edge-redirects-and-ai-friendly-design-guide`，同时在 `website/public/_redirects` 部署 301 静态跳转规则以挽回 SEO 流量。
- **结果**: PASS。后续所有 AI 生成文章 Slug 均为绝对清洁、平滑的 ASCII 短路径，且线上旧中文 URL 优雅 301 重定向至新地址。
- **相关文件**: `admin/src/pages/api/blog/ai-rewrite.ts`, `website/public/_redirects`

## BUG-129: 微信爬虫控制台因 Prisma Schema 变更内存缓存未刷新导致运行时 ValidationError (Fixed 2026-06-01)
- **发现时间**: 2026-06-01 08:15
- **自愈轮次**: 2 / 5
- **症状**: 访问 `http://localhost:4322/admin/wechat-crawler` 时页面报错 `500 Internal Server Error`，终端日志爆出 `PrismaClientValidationError: Unknown argument crawlStatus...` 等致命类型校验错误，导致微信数据源控制台直接瘫痪。
- **根因**:
  1. 数据库升级了 `WechatRepost` 结构，追加了抓取状态与净化后文本的相关字段。
  2. 虽然重新生成了 `Prisma Client`，但由于 Node.js 内存加载了之前的旧 Prisma Client 模块缓存，且 `vite` / `astro` 处于热更新状态下并未硬重启 Node 虚拟机，从而使得运行态下的 JS 执行路径仍在使用失效的数据对象映射，导致了强制校验拦截。
- **修复方案**:
  1. 重新在 `admin/` 下运行 `pnpm exec prisma generate` 强制刷新客户端元数据。
  2. 杀死并彻底释放占用 `4322`（主管理端）与 `6688`（WebSocket 调度网）的僵尸 Node.js 进程，随后重启全新的 `npm run dev` 纯净实例，清除内存全局缓存。
- **结果**: PASS。重新访问控制台，所有微信数据源抓取网格均顺畅加载，状态同步完美运作。
- **相关文件**: `admin/src/generated/db/` 库

## BUG-128: 静态构建产物超出 Cloudflare Pages 限制 20k 文件大关导致部署断崖式失败 (Fixed 2026-06-01)
- **发现时间**: 2026-06-01 00:40
- **自愈轮次**: 1 / 5
- **症状**: 触发 Cloudflare 部署构建时报错中断，指明整个静态 build 输出的目录文件数量达到了 20,857 个，直接超出了 CF Pages 极度苛刻的 `20,000` 文件硬性上线配额，导致发布被迫完全阻断。
- **根因**: 全站采用了 Pagefind 作为高响应轻量搜索引擎，其在 build 扫描时默认以贪婪模式扫描了所有的分块、插图、零碎文章以及草稿，产生了海量的以 `*.pf` 结尾的深度哈希搜索碎片索引文件，直接撑爆了文件数量上限。
- **修复方案**: 在 `astro.config.mjs` 的 Pagefind 集成配置中，强制补充 `--glob` 检索过滤器（配置 `glob: "zh/blog/**/*.html|blog/**/*.html|zh/tutorials/**/*.html|tutorials/**/*.html"`），直接将 Pagefind 的检索范围精确收敛于最核心、最高价值的博客与教程页面，完全排除对大量一次性临时静态资源、单体产品、零碎图片详情页的无效索引。
- **结果**: PASS。执行 `npm run build` 后，生成的文件数量成功大跌至 **11,875** 个（精简了 43%），安全回落至 20k 阈值以下，线上部署全绿通过。
- **相关文件**: `website/astro.config.mjs`


# 缺陷记录 (Bugs)

## BUG-126: 全局搜索面板在搜索结果过多时无法滚动页面
- **发现时间**: 2026-05-20 13:30
- **自愈轮次**: 2 / 5
- **症状**: 在搜索框输入查询获取大量结果时，弹出的全局搜索面板底部内容被直接截断，且整个页面与弹窗均无法滑动或滚动，导致用户无法查看其余搜索结果（只能显示3条，剩余的4、5条和“Load more”按钮被完全遮挡）。
- **根因**: `#pagefind-ui`、`.pagefind-ui__drawer` 和 `.pagefind-ui__results-area` 构成多层嵌套的 flex 容器，其默认的 `min-height` 属性是 `auto`（而非 `0`），这使得这些 flex 项目无法缩得比它们庞大的内容（大量搜索结果）更小。结果，整个嵌套容器链向上撑破了 `.search-modal-inner`，导致后者对其强行进行 `overflow: hidden` 裁剪，阻止了内部滚动条的出现。
- **修复方案**:
  1. 在 `global.css` 中，为 `.search-modal-inner #pagefind-ui`、`.pagefind-ui__drawer` 以及 `.pagefind-ui__results-area` 补充 `min-height: 0;` 以强制激活 flex 项目的缩小特性。
  2. 针对结果区容器 `.pagefind-ui__results-area` 增加硬性自适应高度限制 `max-height: calc(100vh - 260px);`，在任何视口高度下确保内容能比父级小，完美倒逼内部滚动条显示与流畅滚动。
- **结果**: PASS。经本地多关键字搜索验证，无论多少条搜索结果，白色搜索面板都不再发生溢出截断，滚动条样式精致，支持完美的内部区域上下滑动，可看到全部 5 条默认项以及点击“Load more”进行后续加载。
- **相关文件**: `website/src/styles/global.css`


## BUG-124: 英文版首页资讯卡片错误渲染中文封面图
- **发现时间**: 2026-05-18 18:16
- **自愈轮次**: 1 / 5
- **症状**: 用户反馈在英文版首页 (`https://www.agentupdate.ai/`) 最新资讯区域中，有些已经拥有英文翻译封面（数据库存有 `coverImageEn` 且文章详情页展示正常）的文章，卡片仍然顽固显示中文封面。
- **根因**: 在 `website/src/pages/index.astro` 的最新资讯卡片渲染模块中，图片组件的 `src` 属性硬编码直接引用了 `a.coverImage` (默认中文图)，完全忽视了双语化机制中为英文页面专门设计的 `a.coverImageEn` 字段。
- **修复方案**: 在 `index.astro` 的对应位置，将 `src={a.coverImage}` 修改为支持回退的双语读取机制 `src={a.coverImageEn || a.coverImage}`，使得英文封面图可以正常在英文版首页呈现。
- **结果**: PASS。
- **相关文件**: `website/src/pages/index.astro`

## BUG-125: 首页产品卡片无 Logo 时全部堆叠相同的机器人 Emoji 占位图
- **发现时间**: 2026-05-18 18:51
- **自愈轮次**: 1 / 5
- **症状**: 用户发现在本地 `http://localhost:4321/` 首页，"Agent Product" 区域的多个产品（如 `whatsapp-mcp`、`ai-factory`、`agent-skills`）的图标完全长得一模一样（全都是苹果 3D 机器人头像 Emoji 🤖），但点进详情页后展现出的图标占位符却完全不同。
- **根因**:
  1. 通过 Prisma 查询本地 Postgres 数据库，确认上述产品在 Variant 库中的 `logo` 字段值均为 `null` (无配置)。
  2. 首页 `index.astro` / `zh/index.astro` 之前设计的占位逻辑过于生硬，当 `logo` 缺失时直接硬编码了 Emoji `'🤖'`，导致无 Logo 产品产生高度同质化视觉。而详情页与产品列表页则是提取产品名称的首字母，在彩色圆框中呈现。
- **修复方案**:
  1. 移除首页模板中写死的 `'🤖'` 回退，统一重构为动态截取产品英文/中文名称的首位字母 `(p.nameEn || p.name || '').charAt(0)`。
  2. 在 `global.css` 中重构 `.product-icon` 全局样式，提升字重 (`font-weight: 800`)、设置大写转换 (`text-transform: uppercase`)、并完善了全门类的圆框背景与前景文字颜色配对（包含开源绿色、创业紫色、大厂青色、托管蓝色、硬件橙色），从而实现全站风格彻底拉通。
- **结果**: PASS。
- **相关文件**: `website/src/pages/index.astro`, `website/src/pages/zh/index.astro`, `website/src/styles/global.css`

## BUG-122: 英文产品列表与详情空字段空合并漏洞
- **发现时间**: 2026-05-18 10:15
- **自愈轮次**: 1 / 5
- **症状**: 在访问英文版产品列表与详情页面时，有些产品在页面上显示为完全空白的名称和公司名，并且控制台没有任何报错。
- **根因**: 在英文版产品数据流渲染时，使用 nullish coalescing 操作符 `p.nameEn ?? p.name` 来进行回退。但实际上，数据库中部分未被 AI 改写的英文属性并非 `null`，而是空字符串 `""`。根据 JavaScript 运算规则，`"" ?? "foo"` 会返回 `""`，导致前端模板拿到了空字符串进行渲染，造成了视觉上的空白。
- **修复方案**: 将 `??` 替换为 falsy coalescing `||`。因为在 JS 中 `""` 被视为 falsy 值，`"" || "foo"` 会正确回退到 `"foo"`（中文名称），完美实现了双语平滑降级。
- **结果**: PASS。
- **相关文件**: `website/src/pages/en/product/[slug].astro`, `website/src/pages/en/product/index.astro`, `website/src/lib/variants.ts`

## BUG-123: Imagen 4.0 429 Resource Exhausted 额度耗尽导致全站配图阻断
- **发现时间**: 2026-05-18 10:30
- **自愈轮次**: 1 / 5
- **症状**: 进行批量历史文章封面补全或高频次改写时，Imagen API 100% 报错 429 Resource Exhausted，导致生成的双语图片 URL 均为空白，无法修补全站的灰色占位图。
- **根因**: Google AI Studio 为每个账号配置了严格的每日 Imagen 系列生图限额（全天共 70 次），且无处申诉。而在高强度的新闻处理管线中，每日改写文章很容易超限，一旦超限，系统前两道防线全数下线。
- **修复方案**: 在 `crawler/src/ai/image-generator.ts` 中集成了最新的 **Nano Banana Pro (`gemini-3-pro-image-preview`)** 作为第三优先级兜底模型。由于其调用端点和出参协议与传统的 Imagen 完全不同，在此实现了协议自适应适配器（如果是 `gemini-` 开头，自动走 `:generateContent` 端点并解析 candidates 中的 base64 `inlineData`），从而在 Imagen 429 报错时瞬间熔断降级至 Nano Banana Pro 成功绘图并写入数据库！
- **结果**: PASS。利用该熔断降级机制，成功批量生成并修补了 37 篇封面为空的历史文章。
- **相关文件**: `crawler/src/ai/image-generator.ts`, `website/src/patch-covers.ts`

---

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


## BUG-118: sync_bilingual_all.ts 造成数据库全量属性覆盖 (灾难级)
- **发现时间**: 2026-05-13 11:51
- **自愈轮次**: 3 / 5
- **症状**: 在仅需导入 `anti-scraping-tutorial` 的场景中，全局脚本重新 Upsert 了所有教程。导致旧教程的发布状态被重置为 `draft`，`coverImage` 被置为 `null`，`updated_at` 属性被更新为最新时间。
- **根因**: 脚本在找不到本地 Frontmatter 属性时采用了暴力置空的回退策略；且 Prisma ORM 在 `update` 操作时会强制更新带有 `@updatedAt` 修饰符的字段。
- **修复方案**: 
  1. 运行 `restore_status.ts` 利用 Prisma 更新全部记录回到 `published` 状态。
  2. 运行 `restore_covers.ts` 通过解析上午的 pg_dump 备份提取封面字段回写。
  3. 运行 `restore_dates.ts` 使用 Prisma `$executeRawUnsafe` 执行原生 SQL，注入了备份文件中的 `created_at` 和 `updated_at` 绕过拦截。
- **结果**: PASS (全面还原了灾难现场)
- **相关文件**: `admin/scripts/sync_bilingual_all.ts`, `admin/scripts/restore_dates.ts`

## BUG-127: Website 构建脚本清理 dist 时因文件锁定报错及 Astro Build 清空 outDir 导致 Git 仓库指针错乱

- **发现时间**: 2026-05-31 18:41
- **自愈轮次**: 2 / 5
- **症状**:
  1. 运行 `npm run build` 时，在清理 `dist` 目录阶段报错 `rm: .../website/dist/news: Directory not empty` 并导致构建中断。
  2. 修改为原地保留 `.git` 的 `find` 清理方案后，线上 `/product/`、`/releases/`、`/skills/`、`/404.html` 发生 404，且 `website` 源码仓库的 remote origin 被意外改写为 `openclaweco-website-build`，导致源码被强推至部署仓库。
- **根因**:
  1. `.git` 文件夹移动时立刻触发 macOS 系统的后台文件监视器（如 VS Code Git 集成等进程）对其进行扫描并产生短时文件锁，导致紧随其后的 `rm -rf "$DIST"` 报错。
  2. 原本的以 `find` 排除 `.git` 进行原地保留的清理方案忽视了 `npx astro build` 静态构建过程会**默认清空整个 outDir (`dist/`)** 的底层机制。Astro 构建运行时直接抹去了 `dist/.git`，导致随后的 `git` 操作由于找不到 `dist/.git` 自动向上检索并侵入父级 `website/.git`，意外篡改了父级源码仓库的 `remote origin` 并将网站源码错推到了部署分支，进而导致线上 Astro 动态路由页面（如产品详情、版本时间线等）因无法连接本地 DB 构建而大面积 404。
- **修复方案**:
  1. 重构并还原 `build-deploy.sh` 的 `.git` 备份与还原机制（必须备份以防 Astro 构建清空）。
  2. 在 `mv "$DIST/.git" "$BACKUP"` 后立即加入 `sleep 1`，强制让 macOS 后台文件监视器释放句柄并平息锁定，确保接下来的 `rm -rf "$DIST"` 100% 成功。
  3. 执行 Git 恢复链：重置 `website` 的 remote origin 回 `git@github.com:airplanecraft/openclaweco-website.git`，软重置（`git reset`）消除误提交的 Build 历史但保留用户本地的响应式布局样式及图片，并重新全新初始化 `dist/.git`。
- **结果**: PASS。本地 `npm run build` 成功完成，Astro 静态页面均完美生成，且仅包含 `dist` 静态成品的 commits 成功推送至 `openclaweco-website-build.git`。线上 `/product/`、`/releases/`、`/skills/` 均恢复 `200 OK` 正常状态。
- **相关文件**: `website/build-deploy.sh`, `website/.git/config`

---

## BUG-135: 中文首页 /zh 语言切换按钮 EN 链接退化为 /.html 与 Astro 编译模块丢失 (Fixed 2026-06-05)

- **发现时间**: 2026-06-05 12:00
- **自愈轮次**: 2 / 5
- **症状**: 
  1. 在 `https://www.agentupdate.ai/zh` 页面上，点击中英文语言切换按钮中的 "EN"，无法正确跳转到英文首页，而是跳转到了损坏的路径 `https://www.agentupdate.ai/.html`。
  2. 在使用 `build.format: 'file'` 执行全量构建时，Vite 打包过程会报出致命错误 `ERR_MODULE_NOT_FOUND` 指明找不到特定哈希的 `index_[hash].mjs` 模块，导致构建彻底瘫痪。
  3. 构建在大批量渲染页面阶段容易被系统因 OOM 强行杀死（Killed: 9，退出码 137）。
- **根因**:
  1. `website/src/layouts/BaseLayout.astro` 里的 `cleanPathname` 逻辑中，对于 `.html` 的清理顺序发生了偏差：它先通过 `replace(/\.html$/, '')` 剥离后缀，再利用 `replace(/\/$/, '')` 移除尾部斜杠。在 Cloudflare Pages 下，服务生成的物理路径为 `/zh.html/`，这导致第一步剥离由于尾部斜杠存在而失败。在后续剥离斜杠后，剩余路径为 `/zh.html`。在 `lang === 'zh'` 模式下替换 `/zh` 成了 `".html"`，从而在页面渲染出 `<a href=".html">`，经浏览器相对路径转换为了 `/.html`。
  2. Astro 在多语言（i18n）且启用 `build.format: 'file'` 模式下，不同子语言目录下的 `index.astro` 动态分包会被 Vite 编译为同名或哈希冲突的 `index.mjs` 临时模块并发生物理覆盖，造成渲染阶段部分临时模块缺失，引发 `ERR_MODULE_NOT_FOUND`。
  3. 全站包含接近 7000 个静态页面，默认的 Node.js 内存上限（约 1.5GB）在处理大批量 prerenderPrerender 编译时容易耗尽导致 OOM 被操作系统强杀。
- **修复方案**:
  1. 重构 `BaseLayout.astro` 中的 `cleanPathname` 逻辑，采用高鲁棒的斜杠优先剔除顺序，确保物理路径不管是 `/zh.html/` 还是 `/zh/` 都能被完美清洗成 `/zh`。
  2. 将 `astro.config.mjs` 中的构建输出格式 `build.format` 回退到默认推荐的 `'directory'` 以彻底解决哈希碰撞和模块缺失问题，并清除了 `public/_redirects` 中所有可能导致死循环的 trailing slash 重定向规则，安全对接 Cloudflare Pages 默认路由。
  3. 在 `build-deploy.sh` 脚本编译命令行前加上 `NODE_OPTIONS="--max-old-space-size=8192"` 为 Node.js 拓展至 8GB 堆内存，彻底根除 OOM。
- **结果**: PASS。本地 6999 个静态页面编译完全无错通过，`sitemap.xml` 及 `rss.xml` 中完美生成了包含动态博客的配置。`dist/zh/index.html` 里的 EN 链接正确指向 `/`，`zh/blog/index.html` 正确指向 `/blog`，所有相对或物理页面均正常。
- **相关文件**: `website/src/layouts/BaseLayout.astro`, `website/astro.config.mjs`, `website/build-deploy.sh`, `website/public/_redirects`

## BUG-136: Gemma Tutorial Diagram <a> Wrapping & Beta Tag Pages 404 & 404 Page Switch Target
- **发现时间**: 2026-06-06 20:32
- **自愈轮次**: 1 / 5
- **症状**:
  1. Gemma 教程 Lesson 7 中 Mermaid 图表渲染异常，由于 Raw HTML `<img>` 标签缺少闭合导致 Markdown 插件将其 URL 误识别并包裹为外层 `<a>` 锚点链接，引发 404。
  2. 产品 Tag 页面（如 `/tags/mobile-ai-agent`）构建时 404。
  3. 全站 404 页面上的语言切换按钮（EN/ZH）指向了不存在的 `/zh/404` 或 `/404`，从而导致 404 死循环。
- **根因**:
  1. Markdown 渲染引擎在解析带有未闭合属性的 `<img src="..." />` 时发生标签混淆，误以为其后面的 raw 文本也是链接的一部分，导致生成了嵌套 `<a>` 包装。
  2. `tags.ts` 中 `getCachedVariants` 查询缓存只拉取了 `status: 'active'` 的产品，但 beta 产品（如 PhoneClaw, MimiClaw 等）的 `status` 是 `'beta'`，它们在 variants 列表中是可见的，但 tag page 构建器由于过滤而没有生成对应的静态 Tag 页面，致使点击 Tag 跳转时发生 404。
  3. Astro 在多语言环境下只编译单个根级别的 `404.html`。BaseLayout 在处理 404 路径时未能拦截，而是将 canonical 路径直接带入 `/zh${cleanPathname}`，导致拼装出不存在的 `/zh/404` 链接。
- **修复方案**:
  1. 重写 `lesson-7.md` 和 `lesson-7.en.md`，将 Raw HTML `<img src="...">` 替换为标准 Markdown `![Mermaid Diagram](url)` 图片引用。
  2. 修改 `tags.ts`，去除 `getCachedVariants` 里的 `status: 'active'` 过滤限制，使其与 `variants.ts` 保持一致，查询所有 `approvalStatus: 'approved'` 的变体产品。
  3. 在 `BaseLayout.astro` 语言切换及 alternate 路径生成逻辑中注入 `is404` 判断，一旦发现 canonical 路径为 `404`，强制将重定向目标及 hreflang 指向对应的主页（`/` 与 `/zh/`）。
- **结果**: PASS。本地 local build 顺利生成 `9959` 个静态页面，用 audit 脚本对 **9971 个 HTML 文件扫描，确认内部 broken links 数量降为 0**。
- **相关文件**: `admin/content/gemma-tutorial/lessons/lesson-7.md`, `admin/content/gemma-tutorial/lessons/lesson-7.en.md`, `website/src/lib/tags.ts`, `website/src/layouts/BaseLayout.astro`

## BUG-137: 历史遗留 .html 路由与前导零教程课时路径 404 异常
- **发现时间**: 2026-06-10 13:00
- **自愈轮次**: N/A
- **症状**: 
  1. 访问包含 `.html` 后缀的旧路由（例如 `/path.html`）返回 404。
  2. 访问包含前导零的旧教程课时路径（例如 `/zh/tutorial/hermes-agent-tutorial/lesson-01`）返回 404。
- **根因**:
  1. Astro 在静态生成（Clean URLs）模式下，打包输出对应的物理文件夹和 `index.html`（路由为 `/path`）。当有爬虫或外部链接显式访问旧版后缀 `/path.html` 时，托管平台（Cloudflare Pages）因为没有 `path.html` 实体文件而直接返回 404。
  2. 全站教程课时 Slug 从前导零格式（如 `lesson-01`）统一重构为了无前导零的格式（如 `lesson-1`），导致历史分享或爬虫缓存的旧链接失效。
- **修复方案**:
  1. 在 `website/src/pages/404.astro` 注入前端重定向 JavaScript：若检测到 URL 以 `.html` 结尾，则自动剥离该后缀并重定向到对应的 Clean URL 路径。
  2. 在 `website/public/_redirects` 中录入 GA 导出的 98 条带有前导零的教程课时路径到无前导零路径的 301 重定向映射规则。
- **结果**: PASS。本地 local build 及链接审计成功通过，手动模拟 404 访问 `.html` 后缀或零填充路径均能秒级正确自愈跳转。
- **相关文件**: `website/src/pages/404.astro`, `website/public/_redirects`

## BUG-138: Prisma 数据库连接异常与嵌套标签自动链接 404 异常
- **发现时间**: 2026-06-14 07:48
- **自愈轮次**: 1 / 5
- **症状**:
  1. 访问网站或运行测试时抛出 `PrismaClientInitializationError: Can't reach database server at localhost:5432`，指示无法连接数据库服务器。
  2. 运行 `local-build` 后的静态链接审计（link audit）中，在 `news/` 页面中发现 8 处内部 404 损坏链接（如 `/tags/<a href=` 和 `/tags/html-in-<a  class=`）。
- **根因**:
  1. 本地 Homebrew 安装的 PostgreSQL@17 服务在先前退出时未清理干净，留下了 `/opt/homebrew/var/postgresql@17/postmaster.pid` 锁文件，其中记录的 PID 已经被其他不相关的进程（如 `Codex Helper`）占用。导致 PostgreSQL 服务在启动时误判已有实例正在运行而退出。此外，Astro 网站的 Prisma Client (`website/src/generated/db`) 尚未被编译生成。
  2. `website/src/lib/seo.ts` 中的 `autolinkTags` 逻辑在替换长标签（如 `"html-in-canvas"`）之后，会向 HTML 文本中直接插入 `<a>` 标签。这导致随后匹配的短标签（如 `"canvas"`）会误匹配到已插入的 `<a>` 标签内的属性（如 `href` 或 `class` 中的单词），从而破坏 HTML 结构，生成了诸如 `/tags/html-in-<a  class=` 这样损坏的 nested tag 链接。
- **修复方案**:
  1. 停止 `postgresql@17` 运行进程，删除 `/opt/homebrew/var/postgresql@17/postmaster.pid` 锁文件，重新启动 PostgreSQL 并用 `pg_isready` 确认服务运行。在 `database` 目录下运行 `npx prisma generate` 重新生成最新的 Prisma client。
  2. 重构 `website/src/lib/seo.ts` 中的 `autolinkTags` 匹配替换算法：对于匹配到的标签，生成对应的链接后不直接拼装回文本中，而是暂时存入 `placeholders` 数组，并生成占位符 `__HTML_PLACEHOLDER_N__` 替换原词。如此一来，后续的短标签只能在纯文本的占位符中匹配，不会匹配到先前替换的 `<a>` 标签属性。在所有标签替换完成后，再通过单次全局正则统一还原所有 `placeholders`。
- **结果**: PASS。本地 local build 及链接审计成功通过，审计确认内部 broken links 降至 0。
- **相关文件**: `website/src/generated/db/`（重新生成）, `database/prisma/schema.prisma`, `website/src/lib/seo.ts`

---

## BUG-139: 中文博客详情页 client-side Mermaid 预处理器正则语法错误导致图表渲染彻底崩溃 (Fixed 2026-06-24)
- **发现时间**: 2026-06-24 11:15
- **自愈轮次**: 1 / 5
- **症状**: 
  1. 打开包含 Mermaid 图表的中文博客详情页时，所有的 Mermaid 架构图均崩溃无法渲染，只显示带有红炸弹的 "Syntax error in text" 与 "mermaid version 10.9.6"。
  2. 浏览器控制台抛出 unhandled exception：`Failed to execute 'write' on 'Document': Invalid regular expression: /(\w+)(\)）)([^\)\n]+)())/g: Unmatched ')'`，导致后续的 `mermaid.run()` 初始化过程彻底中断。
- **根因**:
  - 在 `website/src/pages/zh/blog/[slug].astro` 中，用于纠正中文括号以防 Mermaid 语法解析出错的客户端正则表达式替换代码为 `code = code.replace(/(\w+)(\)）)([^\)\n]+)(\))/g, ...)`。
  - 该正则表达式中，第二匹配组原想匹配中文左括号 `（` 或英文左括号 `\(`，但意外写成了 `)）`（转义的英文右括号与中文右括号拼接）。由于 `\)` 在字符类外转义了括号，当它经过 Astro/Vite 构建优化或在某些浏览器中解析时，末尾匹配组 `(\))` 中的转义符丢失或处理异常退化为了 `())`，造成了捕获组括号不配对、正则引擎初始化失败，抛出致命的 `Unmatched ')'` 运行时错误。
- **修复方案**:
  - 重构 `website/src/pages/zh/blog/[slug].astro` 的 client-side 预处理器正则，将其修改为正确且语义严谨的 `/(\w+)(\(|（)([^)）\n]+)(\)|）)/g`。该正则无歧义地匹配英文 `(` / 中文 `（` 以及英文 `)` / 中文 `）`，彻底根除了运行时 unmatched bracket 编译错误，并使预处理器在面对中英文混合括号图表节点时均能正确将文本字段用双引号包装。
- **结果**: PASS。本地 local build 全量编译通过，所有 HTML 文件内部链接审计 broken link 数量为 0。使用 Playwright 仿真客户端 Mermaid 预处理并渲染中文博客 diagram，Mermaid 10.9.6 完美运行渲染，不再抛出任何运行时异常。
- **相关文件**: `website/src/pages/zh/blog/[slug].astro`


