---
description: 新功能开发完整流程 — 从计划到验证到归档
---

# 新功能开发工作流

## 阶段 1: 计划 (Planning)

1. 调用 `planning-with-files` Skill，创建以下文件：
   - `task_plan.md` — 任务清单
   - `findings.md` — 研究发现
   - `progress.md` — 实时进度
   - `bugs.md` — Bug 记录

2. 分析需求，研究现有代码结构，在 `findings.md` 记录发现

3. 在 `task_plan.md` 中细化任务清单（用 `[ ]` 标记）

4. 请用户 Review 计划

## 阶段 2: TDD 开发 (Execution)

5. 从 `task_plan.md` 读取下一个 `[ ]` 任务，标记为 `[/]`

6. 调用 `test-driven-development` Skill：
   - RED: 写一个失败的测试
   - GREEN: 写最小代码通过测试
   - REFACTOR: 重构

// turbo
7. 运行测试：`pnpm test`

8. 测试通过 → 标记 `task_plan.md` 对应项为 `[x]`

9. 测试失败 → 调用 `systematic-debugging` Skill，进入自愈循环（最多5次）

10. 功能点完成后 Git commit：
```bash
git add -A && git commit -m "feat(scope): description"
```

11. 重复步骤 5-10 直到所有任务完成

## 阶段 3: 验证 (Verification)

12. 调用 `verification-before-completion` Skill

// turbo
13. 运行全量测试：`pnpm test && pnpm test:e2e`

14. 使用 browser_subagent 进行 UI 交互验证（如适用）

15. 确认所有测试通过，截图/日志作为证据

## 阶段 4: 代码审查 (Review)

16. 调用 `requesting-code-review` Skill

17. 等待用户反馈

18. 收到反馈后调用 `receiving-code-review` Skill

## 阶段 5: 归档 (Archival)

19. 更新所有归档文件：
    - `task_plan.md` — 确认所有项为 `[x]`
    - `progress.md` — 追加会话摘要 + 时间戳
    - `findings.md` — 记录新技术发现
    - `bugs.md` — 记录新 Bug 及修复

20. Git commit 文档变更：
```bash
git add -A && git commit -m "docs: archive session progress"
```
