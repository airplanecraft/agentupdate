---
description: 教程/课程创建与审批上架规范
---

# 教程/课程创建与审批流程

为了保证教程内容的拼写、质量以及双语翻译的完整性，在为 `openclaweco.com` 仓库创建任何新的课程或批量导入 Markdown 内容时，必须遵守以下核心规则：

## 1. 默认不上架原则 (Default to Draft)
**禁止系统自动审批上架**。任何新导入、抓取或 AI 生成的 `TutorialSeries` 和 `TutorialLesson`，其数据库初始 `status` 字段必须默认为 `"draft"`，绝不可硬编码默认为 `"published"`。
- `import-md-to-db.ts` 等同步脚本在 Upsert 数据时，如果 Frontmatter 中未显式提供 status，则默认降级为 `draft`，要求后台管理员手动校阅后再切换到 `published`。

## 2. 审批发布流程 (Manual Approval Workflow)
教程编写完成后，必须通过 Admin Dashboard：
1. 检查中英文排版是否美观、对齐。
2. 确认图片或外链没有安全/跨域错误。
3. 检查代码块等资产是否存在编译期隐患。
4. **手动点击“发布/审批”按钮** 将状态转换为 Published。

**强制约束**: 任何 Agent 发起的自动化内容生产和发布 Pipeline 都必须在此处阻断，不得在无人值守情况下将教程内容直接暴露在面向公网的官网 (Website) 侧。
