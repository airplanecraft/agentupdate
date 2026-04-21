# Git 提交与代码审查规则 (Git & Code Review Rules)

---

## 1. 提交时机

| 时机 | 前置条件 | 禁止 |
|------|----------|------|
| 功能点完成 | 单元测试通过 | 测试未通过时提交 |
| Bug 修复 | 回归测试通过 | 跳过回归测试 |
| 重构完成 | 全量测试通过 | 破坏已有测试 |
| 文档更新 | 内容正确 | — |

---

## 2. Commit Message 格式

```
格式: <type>(<scope>): <description>

类型:
  feat     — 新功能
  fix      — Bug 修复
  refactor — 重构（不改变行为）
  test     — 测试
  docs     — 文档
  chore    — 构建/工具/依赖
  style    — 代码格式（不影响逻辑）
  perf     — 性能优化

范围 (scope): crawler | admin | website | db | docs | config

示例:
  feat(crawler): implement L1 URL dedup with UNIQUE INDEX
  fix(admin): correct Prisma query for pending articles
  test(website): add Playwright E2E for news listing page
  docs: update architecture.md with Phase 1 funnel diagram
```

---

## 3. 代码审查

### 触发时机
- 每个 Phase/Sprint 完成后
- 关键架构变更后
- 数据库 schema 变更后

### 审查使用的 Skill
- `requesting-code-review` — 提交审查
- `receiving-code-review` — 处理反馈

### 审查清单
- [ ] 变更文件 diff 合理
- [ ] 测试覆盖新增代码
- [ ] 与 `architecture.md` 一致
- [ ] 无硬编码密钥
- [ ] 无 `console.log` 残留
- [ ] TypeScript 无 `any` 类型

---

## 4. 分支策略

```
main          — 生产分支，只接受 PR
dev           — 开发主分支
feat/xxx      — 功能分支 (从 dev 分出)
fix/xxx       — 修复分支 (从 dev 分出)
```
