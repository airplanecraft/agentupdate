# 测试驱动开发规则 (TDD Rules)

> 适用于 openclaweco.com 全仓库的测试策略

---

## 1. 测试工具链

| 工具 | 用途 | 配置 |
|------|------|------|
| **Vitest** | 单元测试 + 集成测试 | `vitest.config.ts` |
| **Playwright** | E2E 测试 + 视觉回归 | `playwright.config.ts` |
| **agent-browser** | AI 驱动的 UI 交互验证 | Antigravity Skill |

---

## 2. TDD 循环规则

```
每个功能点必须遵循:

1. RED   — 先写一个失败的测试
2. GREEN — 写最小代码通过测试
3. REFACTOR — 重构代码，保持测试通过
4. COMMIT — 测试通过后提交

禁止:
  - 跳过 RED 阶段直接写实现
  - 注释掉失败的测试
  - 降低断言标准让测试"假通过"
```

---

## 3. 测试分层

### 3.1 单元测试 (Unit)
- **文件约定**: `*.test.ts` 或 `*.spec.ts`，与被测文件同目录
- **运行命令**: `pnpm test` 或 `pnpm vitest run`
- **覆盖率**: 关键业务逻辑 ≥ 80%
- **运行时机**: 每次代码变更后

### 3.2 集成测试 (Integration)
- **文件约定**: `tests/integration/*.test.ts`
- **运行命令**: `pnpm test:integration`
- **数据库**: 使用独立的测试数据库 (`DATABASE_URL_TEST`)
- **运行时机**: 功能完成后

### 3.3 E2E 测试 (End-to-End)
- **文件约定**: `tests/e2e/*.spec.ts`
- **运行命令**: `pnpm test:e2e` 或 `npx playwright test`
- **浏览器**: Chromium (默认), Firefox (回归)
- **超时**: 单测 30s，E2E 60s
- **运行时机**: 功能验证阶段 + 提交前

### 3.4 视觉回归测试
- **工具**: Playwright `toHaveScreenshot()`
- **基线**: `tests/e2e/screenshots/` 目录
- **运行时机**: UI 变更后

---

## 4. 失败处理协议

```
测试失败处理流程:

Round 1-3: 自动自愈
  → systematic-debugging Skill 分析错误
  → 修复代码
  → 重新运行测试

Round 4-5: 升级处理
  → 记录完整错误到 bugs.md（带时间戳）
  → 尝试最后一次修复

Round 5 失败: 人工接管
  → 停止自愈循环
  → 在 bugs.md 记录详细诊断
  → 通知用户接管
  → 附上: 错误日志、已尝试的修复方案、建议方向
```

---

## 5. Playwright 配置规范

```typescript
// playwright.config.ts 必须包含:
{
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4321',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
}
```

---

## 6. agent-browser 使用规则

```
使用场景:
  - UI 交互流验证（登录、表单提交、导航跳转）
  - 响应式布局确认（桌面/移动端截图对比）
  - SEO meta 验证（检查 title/description/og:image）
  - 多页面流程测试（审核 → 发布 → 前端展示）

输出要求:
  - 每个关键步骤截图
  - 异常时录制视频
  - 最终结果需要截图证据，不能仅靠文字声称
```
