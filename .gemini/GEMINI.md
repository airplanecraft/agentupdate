# OpenClawEco 全局开发规则 (Global Rules)

> **版本**: v2.0 | **更新**: 2026-03-30 | **适用范围**: openclaweco.com 全仓库

---

## 1. 项目简介

**AgentUpdate.ai** (原 OpenClawEco) 是泛 AI 智能体 (AI Agent) 生态的一站式聚合平台，包含新闻聚合、Agent 产品图谱、技能市场、插件画廊、标签中心、教程等模块。

### 三 Repo 隔离架构

| Repo | 职责 | 技术栈 |
|------|------|--------|
| `openclaweco-crawler` | RSS Poller + Dedup + AI 改写 | Node.js 22, TypeScript, rss-parser, Prisma |
| `openclaweco-admin` | 内容审核、编辑、导出发布 | Node.js 22, Astro SSR, Prisma ORM |
| `openclaweco.com` | 静态前端，消费 JSON 生成 HTML | Astro SSG, TailwindCSS, Alpine.js |

**共享数据层**: PostgreSQL (本地) + Cloudflare R2 (图片)

### 开发语言与结构

- **语言**: 全栈 TypeScript (Node.js 25 + TypeScript 5.x)
- **包管理**: pnpm（每个 Repo 独立 `package.json`）
- **ORM**: Prisma 6（类型安全，自动生成 `@prisma/client`；Prisma 7 与 Node 25 不兼容）
- **前端**: Astro 5.x (SSG/SSR) + TailwindCSS 4.x + Alpine.js 3.x
- **测试**: Playwright (E2E/组件) + Vitest (单元/集成)
- **代码规范**: ESLint + Prettier，TypeScript strict mode

---

## 2. 自治理核心法则

### 2.1 拒绝请示 (Autonomous Execution)

- **绝对准则**: 在 `task_plan.md` 范围内的任务，**必须**直接执行，**禁止**询问"下一步是否继续"或"是否接受"。
- **唯一例外**: 遇到 Blocker（依赖缺失无法自动修复、核心逻辑严重冲突）时，才向用户报告。

### 2.2 自动自愈 (Self-Healing Protocol)

```
Protocol:
  1. Detect  — 测试失败 / 运行时错误
  2. Diagnose — 读取错误日志 (logs/ 或 stderr)
  3. Repair  — 针对性修改代码或测试
  4. Retry   — 重新运行验证
  5. Record  — 在 bugs.md 记录问题和修复（带时间戳）

Constraints:
  - 最大循环次数: 5 次
  - 超过5次失败 → 停止自愈 → 写入 bugs.md → 通知用户人工接管
  - 每次自愈尝试必须在 progress.md 中记录
```

### 2.3 熔断机制 (Circuit Breaker)

| 条件 | 触发动作 |
|------|----------|
| 连续 5 次测试失败 | 停止自治 → 归档日志 → 通知用户 |
| API 持续 429 超过 3 轮重试 | 停止 → 记录 → 等人工 |
| 生成代码结构性错误连续 3 次 | 停止 → 回退 git stash → 通知用户 |
| 依赖安装失败 | 停止 → 记录完整错误 → 通知用户 |

---

## 3. 开发流程

### 3.1 计划驱动开发 (Plan-Driven Development)

**每个功能/任务必须遵循以下流程：**

```
1. 📋 Planning (计划)
   - 使用 planning-with-files Skill 创建:
     - task_plan.md   — 任务清单
     - findings.md    — 研究发现
     - progress.md    — 实时进度
     - bugs.md        — Bug 记录与修复日志
   - 计划需要用户 Approve 后才能进入执行

2. 🔨 Execution (执行) — TDD 驱动
   - 每个功能点按 🔴 RED → 🟢 GREEN → 🔵 REFACTOR 循环
   - 🔴 先写失败测试（验证测试确实失败）
   - 🟢 写最小代码通过测试
   - 🔵 重构代码，保持测试通过
   - ✅ 测试通过后 git commit
   - 使用 test-driven-development Skill
   - 使用 systematic-debugging Skill 调试
   - 完成后标记 task_plan.md 对应项为 [x]
   - **禁止**: 跳过 RED 直接写实现 / 注释失败测试 / 降低断言

3. ✅ Verification (验证)
   - 使用 verification-before-completion Skill
   - 运行全部测试，确认输出
   - 证据先于断言（截图/日志/测试输出）

4. 📝 Archival (归档)
   - 更新 progress.md、findings.md、bugs.md
   - 检查所有归档文件的完整性
```

### 3.2 并行执行 (Parallel Execution)

- **使用场景**: 多个独立模块开发任务
- **工具**: `dispatching-parallel-agents` Skill
- **约束**: 仅当任务之间无共享状态或顺序依赖时才可并行

### 3.3 上下文清洗 (Context Hygiene)

- **规则**: 防止 Token 溢出
- **时机**: 每个 Task（如 `Phase 1 Task 1`）完成后
- **动作**: 调用 `task_boundary` 清理任务状态，在 `progress.md` 中记录摘要

---

## 4. 测试策略

### 4.1 测试层级

| 层级 | 工具 | 何时运行 | 失败策略 |
|------|------|----------|----------|
| **单元测试** | Vitest | 每次代码变更后 | 自愈（最多 5 次） |
| **集成测试** | Vitest + Prisma (test DB) | 功能完成后 | 自愈（最多 5 次） |
| **E2E 测试** | Playwright | 功能验证阶段 | 自愈（最多 3 次），失败人工接管 |
| **视觉回归** | Playwright screenshots | PR 前 | 对比基线截图 |
| **Browser 测试** | agent-browser Skill | UI 交互验证 | 截图证据 |

### 4.2 测试执行规则

```
功能测试 (Feature Test) — TDD 驱动:
  - 🔴 RED:   先写失败测试 (必须验证测试确实失败)
  - 🟢 GREEN: 写最小代码通过测试
  - 🔵 REFACTOR: 重构，保持测试通过
  - ✅ COMMIT: 测试全过后 git commit
  - 范围: 当前功能相关的测试文件

回归测试 (Regression Test):
  - 触发时机: 每个 Phase 完成后 + 代码提交前
  - 范围: 全量测试套件 (pnpm test)
  - 通过标准: 100% Pass

失败处理:
  - 自动自愈最多 5 次
  - 第 5 次失败后 → 记录 bugs.md (含自愈轮次) → 通知用户人工接管
  - 禁止: 跳过失败测试 / 注释测试 / 降低断言 / 测试未过提交
```

### 4.3 Browser 测试 (agent-browser + Playwright)

```
Playwright 使用规范:
  - 配置: playwright.config.ts (项目根目录)
  - 浏览器: Chromium (默认), Firefox (回归)
  - 截图: 每个关键步骤自动截图存入 test-results/
  - 超时: 单测 30s, E2E 60s, 导航 10s

agent-browser Skill 使用场景:
  - UI 交互验证（点击、表单提交、导航）
  - 视觉回归检查
  - 响应式布局测试
  - SEO meta 标签验证

Browser Subagent 卡死兜底方案 (Timeout Override):
  - 发现异常: 如果 Browser 挂起或其中一个步骤卡死超过 5-10 分钟。
  - 第一准则: 立即无情换方案！禁止在此单点死磕。
  - 可选切线方案: 改用命令行 Curl、直接分析前端 React Component 代码逻辑验证、或使用 Node.js 脚本测试、或直接向用户表明已自走查代码并邀请用户手工复核。
```

---

## 5. Git 与代码审查

### 5.1 提交规则

```
提交时机:
  1. 功能点完成 + 测试通过 → git commit
  2. Bug 修复 + 回归测试通过 → git commit
  3. 重构完成 + 全量测试通过 → git commit
  4. 禁止: 测试未通过时提交

提交格式 (Conventional Commits):
  feat: 新功能
  fix: Bug 修复
  refactor: 重构
  test: 测试
  docs: 文档
  chore: 构建/工具

示例: feat(crawler): implement L1 URL dedup with UNIQUE INDEX
```

### 5.2 代码审查 (Code Review)

```
Review 时机:
  - 每个 Phase/Sprint 完成后
  - 使用 requesting-code-review Skill
  - 使用 receiving-code-review Skill 处理反馈

Review 范围:
  - 变更文件 diff
  - 测试覆盖率
  - 架构一致性（是否符合 architecture.md）
  - 安全性（密钥硬编码检查）
```

---

## 6. 状态记录与文档更新

### 6.1 实时文档维护

| 文件 | 更新时机 | 内容 |
|------|----------|------|
| `task_plan.md` | 任务开始/完成时 | `[ ]` → `[/]` → `[x]` 进度标记 |
| `progress.md` | 每个 Task 完成后 | 带时间戳的进度摘要 |
| `findings.md` | 关键技术决策时 | 带版本号 (vX.Y) 和时间戳 |
| `bugs.md` | 每次 Bug 发现/修复时 | Bug 描述 + 根因 + 修复 + 时间戳 |

### 6.2 Bug 记录格式

```markdown
## BUG-XXX: [简短标题]
- **发现时间**: 2026-03-25 21:00
- **严重程度**: Critical / Major / Minor
- **症状**: [错误现象]
- **根因**: [根本原因]
- **修复**: [修复方案]
- **修复时间**: 2026-03-25 21:15
- **回归测试**: PASS / FAIL
- **相关文件**: [受影响的文件列表]
```

### 6.3 会话归档 (Session Archival)

```
每次开发会话结束时，自动执行:
  1. ✅ 检查并更新 task_plan.md（标记完成项）
  2. ✅ 更新 progress.md（本次会话摘要 + 时间戳）
  3. ✅ 更新 findings.md（新发现的技术要点）
  4. ✅ 更新 bugs.md（新发现/修复的 Bug）
  5. ✅ Git commit 所有文档变更

归档检查清单:
  - [ ] progress.md 已更新
  - [ ] findings.md 已更新
  - [ ] bugs.md 已更新
  - [ ] task_plan.md 已更新
```

---

## 7. Skill 调用规则

### 7.1 开发流程中的 Skill 链

```
阶段 1: 任务启动
  → planning-with-files（创建 task_plan.md / findings.md / progress.md / bugs.md）

阶段 2: TDD 开发
  → test-driven-development（Red-Green-Refactor 循环）

阶段 3: 调试
  → systematic-debugging（遇到 Bug 时必须调用）

阶段 4: 验证
  → verification-before-completion（提交前必须调用）

阶段 5: 代码审查
  → requesting-code-review（Phase 完成后）
  → receiving-code-review（收到反馈后）
```

### 7.2 强制调用规则

| 场景 | 必须调用的 Skill |
|------|------------------|
| 开始新任务 | `planning-with-files` |
| 写代码前 | `test-driven-development` |
| 遇到 Bug | `systematic-debugging` |
| 声称完成之前 | `verification-before-completion` |
| Phase 结束 | `requesting-code-review` |

---

## 8. 密钥与安全

```
强制规则:
  - 所有密钥从 .env 读取，禁止硬编码
  - .env 文件在 .gitignore 中
  - 数据库连接串: DATABASE_URL, DATABASE_URL_TEST
  - AI API: GEMINI_API_KEY
  - R2 存储: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT
  - Cloudflare: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
```

---

## 9. 文档同步规则

```
自动更新触发:
  - 新增 Renderer / 数据表 → 更新 docs/architecture.md
  - 需求变动 → 更新 docs/PRD.md
  - 新增 ADR → 更新 docs/architecture.md §9 ADR 索引
  - 所有更新视为"自动确认"，无需用户逐项 accept
```
