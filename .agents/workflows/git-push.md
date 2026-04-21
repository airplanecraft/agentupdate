---
description: 代码推送到远程仓库 — 支持多仓库批量 push
---

# Git Push 工作流

随时可用的代码推送流程，支持项目下的多个子仓库。

## 仓库配置

| 仓库目录 | 远程地址 | 说明 |
|----------|---------|------|
| `/Users/eric/work/openclaweco.com/admin` | (同根仓库) | Admin 管理后台 |
| `/Users/eric/work/openclaweco.com/website` | `airplanecraft/openclaweco-website` | 网站源码 |
| `/Users/eric/work/openclaweco.com/website/dist` | `airplanecraft/openclaweco-website-build` | 网站构建产物 |

## 流程

### 1. 检查工作区状态

// turbo
```bash
cd /Users/eric/work/openclaweco.com && git status --short
```

### 2. 暂存并提交（根仓库）

如果有未提交的变更：
```bash
cd /Users/eric/work/openclaweco.com && git add -A && git commit -m "feat: <简要描述>"
```
> 根据变更类型使用恰当的 commit 前缀：`feat:` / `fix:` / `docs:` / `chore:`

### 3. 推送根仓库

// turbo
```bash
cd /Users/eric/work/openclaweco.com && git push
```

### 4. 推送 website 源码（如有更改）

// turbo
```bash
cd /Users/eric/work/openclaweco.com/website && git status --short
```

如有变更：
```bash
cd /Users/eric/work/openclaweco.com/website && git add -A && git commit -m "feat: <简要描述>" && git push origin main
```

### 5. 构建并推送 website 产物（可选）

仅在需要部署时执行：
```bash
cd /Users/eric/work/openclaweco.com/website && bash build-deploy.sh
```
> `build-deploy.sh` 会自动执行 `npm run build`，拷贝 README，并 push 到 build 仓库。

## 验证

// turbo
### 6. 确认所有仓库状态清洁
```bash
echo "=== Root ===" && cd /Users/eric/work/openclaweco.com && git status --short && echo "=== Website ===" && cd website && git status --short
```

如果输出为空，说明所有代码已推送。
