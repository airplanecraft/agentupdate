---
description: E2E 测试端口规范 — 防止测试端口与用户开发端口冲突
---

# E2E 测试端口规范

> 所有端口统一管理在 `/ports.config.json`，禁止硬编码

## 端口分配

| 用途 | 端口 | 谁使用 |
|------|------|--------|
| Website Dev | 4321 | 用户手动 `npm run dev` |
| Admin Dev | 4322 | 用户手动 `npm run dev` |
| **Website E2E 测试** | **14321** | Playwright / Antigravity 自动测试 |
| **Admin E2E 测试** | **14322** | Playwright / Antigravity 自动测试 |

## 配置文件关系

```
ports.config.json          ← 端口总表 (Single Source of Truth)
├── admin/astro.config.mjs      → server.port = 4322
├── admin/package.json          → dev script: --port 4322
├── admin/playwright.config.ts  → E2E_PORT = 14322
├── website/astro.config.mjs    → server.port = 4321
├── website/package.json        → dev script: --port 4321
└── website/playwright.config.ts → E2E_PORT = 14321
```

## 规则

1. **绝对禁止** 在测试代码中硬编码端口。使用 Playwright `baseURL` (相对路径 `page.goto('/path')`)
2. **绝对禁止** Antigravity 使用 4321/4322 端口启动测试服务器
3. E2E 测试通过 `npm run e2e` 一键运行（Playwright 自动启动测试端口服务器）
4. E2E 测试结束后 Playwright 自动清理测试端口

## 运行 E2E 测试

// turbo-all

```bash
# Admin E2E（端口 14322，Playwright 自动启动/关闭）
cd /Users/eric/work/openclaweco.com/admin && npm run e2e

# Website E2E（端口 14321，Playwright 自动启动/关闭）
cd /Users/eric/work/openclaweco.com/website && npm run e2e
```

## 手动启动测试服务器（仅调试用）

```bash
# Admin 测试服务器
lsof -ti:14322 | xargs kill -9 2>/dev/null
cd /Users/eric/work/openclaweco.com/admin && npm run dev -- --port 14322

# Website 测试服务器
lsof -ti:14321 | xargs kill -9 2>/dev/null
cd /Users/eric/work/openclaweco.com/website && npm run dev -- --port 14321
```

## 关闭手动启动的测试服务器

```bash
lsof -ti:14322,14321 | xargs kill -9 2>/dev/null
```
