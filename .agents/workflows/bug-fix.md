---
description: Bug 修复完整流程 — 诊断、修复、验证、记录
---

# Bug 修复工作流

## 1. 诊断

1. 调用 `systematic-debugging` Skill

2. 分析错误日志和堆栈信息

3. 定位根因并记录到 `bugs.md`（带时间戳）

## 2. 修复

4. 先写一个复现 Bug 的测试用例（TDD RED）

// turbo 5. 运行测试确认能复现：`pnpm test -- --grep "BUG-XXX"`

6. 编写修复代码（TDD GREEN）

// turbo 7. 运行测试确认修复：`pnpm test -- --grep "BUG-XXX"`

## 3. 回归验证

// turbo 8. 运行全量回归测试：`pnpm test`

9. 如果有 E2E 相关：`pnpm test:e2e`

10. 使用 `verification-before-completion` Skill 确认

10.5 在 `website` 目录下运行 `npm run local-build` 进行本地打包验证，确保打包完全成功，且绝对**不得**自动执行 `npm run build` 进行带部署推送的构建。

## 4. 记录与提交

11. 在 `bugs.md` 更新修复信息：
    - 修复时间
    - 修复方案
    - 回归测试结果

12. Git commit：

```bash
git add -A && git commit -m "fix(scope): BUG-XXX description"
```

13. 更新 `progress.md` 记录修复事项

## 自愈失败处理

如果 5 次自愈尝试后仍失败：

- 在 `bugs.md` 记录所有尝试的方案
- 通知用户人工接管
- 提供：错误日志、已尝试的方案、建议方向
