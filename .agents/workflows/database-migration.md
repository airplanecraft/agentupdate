---
description: 数据库 schema 变更流程 — Prisma migrate + 文档同步
---

# 数据库变更工作流

## 1. Schema 变更

1. 编辑 `prisma/schema.prisma`

2. 在 `findings.md` 记录变更原因

## 2. 迁移

// turbo
3. 生成迁移：`npx prisma migrate dev --name descriptive_name`

// turbo
4. 生成 Prisma Client：`npx prisma generate`

## 3. 测试

// turbo
5. 运行数据库相关测试：`pnpm test:integration`

6. 如果测试失败，进入自愈循环（最多 5 次）

## 4. 文档同步

7. 更新 `docs/architecture.md` §4 数据库设计

8. 如果涉及 JSON Schema 变更，同步更新 `docs/architecture.md` §5

## 5. 提交

9. Git commit：
```bash
git add -A && git commit -m "feat(db): migration - descriptive_name"
```
