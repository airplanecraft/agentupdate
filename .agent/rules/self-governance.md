---
trigger: always_on
---

# 自治理与自愈规则 (Self-Governance Rules)

> 自动执行、自动修复、自动归档的核心行为准则

---

## 1. 自治理三原则

### 原则一：拒绝请示

在 `task_plan.md` 范围内的任务，**直接执行**，不询问用户。

### 原则二：先修后报

遇到错误先自动修复（最多 5 次），成功则不打扰用户。

### 原则三：证据先于断言

声称"修复完成"之前，必须有测试通过的证据（日志/截图/命令输出）。

---

## 2. 自愈循环 (Self-Healing Loop)

```
MAX_RETRIES = 5

for attempt in range(1, MAX_RETRIES + 1):
    result = run_tests()

    if result == PASS:
        update_progress(f"[{timestamp}] 自愈成功 (第{attempt}次)")
        break

    if attempt == MAX_RETRIES:
        record_bug(error, all_attempts)
        notify_user("⚠️ 自愈失败，需要人工介入")
        stop()

    diagnosis = systematic_debugging(error)
    apply_fix(diagnosis)
    record_attempt(attempt, diagnosis, fix)
```

---

## 3. 熔断触发条件

| 条件                  | 自动动作                       |
| --------------------- | ------------------------------ |
| 连续 5 次测试失败     | 停止 → bugs.md 记录 → 通知用户 |
| API 429 超 3 轮       | 暂停 → 等待 → 通知用户         |
| 代码结构性错误 ≥ 3 次 | 停止 → `git stash` → 通知用户  |
| pnpm install 失败     | 停止 → 记录完整日志 → 通知用户 |
| 数据库迁移失败        | 停止 → 不回滚 → 通知用户       |

---

## 4. 每次自愈必须记录

在 `bugs.md` 中追加：

```markdown
## BUG-XXX: [标题]

- **发现时间**: YYYY-MM-DD HH:MM
- **自愈轮次**: N / 5
- **症状**: [错误现象]
- **根因**: [分析结果]
- **修复方案**: [采取的措施]
- **结果**: PASS / FAIL
- **相关文件**: [受影响的文件]
```

---

## 5. Blocker 定义

以下情况视为 Blocker，直接停止并通知用户：

- 第三方服务不可用（PostgreSQL、Cloudflare、Gemini API 完全无响应）
- 需求理解歧义导致无法判断正确行为
- 安全风险（发现密钥泄露、SQL 注入风险）
- 破坏性操作（DROP TABLE、删除生产数据）

---

## 6. 构建与部署安全规则 (Build & Deploy Safety Rules)

- **Bug 修复后验证**: 每次进行 Bug 修复或自愈循环中，**必须**运行本地打包指令 `npm run local-build` 进行验证。
- **禁止自动构建推送**: 严禁在自动任务、自愈脚本中直接触发带推送的部署构建命令 `npm run build`。
- **手动触发构建**: 自动构建发布 (`npm run build`) 必须由用户手动执行，或仅在本地验证 `local-build` 成功通过后再在必要时手动执行。
- **Cloudflare 构建文件限制**: 必须确保生成的打包文件（如 `dist/` 目录）的总文件数量严格控制在 20,000 个以下，以避免触发 Cloudflare Pages 的单次部署文件数量限制错误。

