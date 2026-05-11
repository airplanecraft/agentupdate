---
description: 开发会话结束时的归档检查流程
---

# 会话归档工作流

每次开发会话结束前**必须**执行以下检查步骤。

## 阶段 1: 文档归档

1. 检查 `task_plan.md`：
   - 所有完成的任务标记为 `[x]`
   - 进行中的任务标记为 `[/]`
   - 阻塞的任务标记为 `[!]` 并附说明

2. 更新 `progress.md`：
   - 追加本次会话摘要
   - 格式：`## YYYY-MM-DD HH:MM — [会话标题]`
   - 包含：完成事项、关键决策、下一步、遗留问题

3. 更新 `findings.md`（如有新发现）：
   - 格式：`## Finding vX.Y — [标题] (YYYY-MM-DD HH:MM)`
   - 包含：背景、发现、决策、影响

4. 更新 `bugs.md`（如有新 Bug 或修复）：
   - 使用标准 BUG-XXX 格式
   - 所有字段填写完整（时间戳、根因、修复方案）

## 阶段 2: Git Commit 与多模块同步

5. 提交并同步所有模块的代码与文档（覆盖 root, website, admin, crawler, database, docs, websync 等）：
   本项目含有多个独立的 Git 子模块。现在提供了一键式的归档与同步脚本。
   
// turbo
```bash
cd /Users/eric/work/openclaweco.com && ./session-push-all.sh
```

6. *可选：* 若需为部分模块拆分 commit message 或精确提交，可单独进入 `/admin`, `/crawler`, `/database`, `/docs` 内执行标准的 `git commit`。

## 阶段 3: 执行构建（如需部署）

7. 构建并推送 website 产物（如果有前端界面变更，则执行以更新到 GitHub Pages 或其它托管）：
```bash
cd /Users/eric/work/openclaweco.com/website && bash build-deploy.sh
```

## 阶段 4: 验证

// turbo
10. 确认所有仓库状态清洁：
```bash
echo "=== Root ===" && cd /Users/eric/work/openclaweco.com && git status --short && echo "=== Website ===" && cd website && git status --short
```

11. 确认以下文件均已更新（如适用）：
   - [ ] `task_plan.md`
   - [ ] `progress.md`
   - [ ] `findings.md`
   - [ ] `bugs.md`

12. 如果有文件未更新，说明原因（如"本次无新 Bug"）
