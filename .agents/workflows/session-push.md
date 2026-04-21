---
description: 一键同步所有模块代码（Root及子模块）到 GitHub
---

# 代码一键同步工作流 (/session-push)

这个命令用于快速将包含根目录以及 `admin`, `crawler`, `database`, `docs`, `spike` 等所有独立项目模块的变更同步（commit + push）到远端 GitHub 仓库。

## 阶段 1: 一键执行代码同步

// turbo
1. 执行一键同步脚本：
```bash
cd /Users/eric/work/openclaweco.com && ./session-push-all.sh
```

## 阶段 2: 确认

2. 查看上方脚本输出结果，确保所有的库都已经 `Root workspace pushed successfully` 和 `✅ <module> synced`。
3. 若遇到因为网络问题或是 `push` 冲突无法同步的模块，请依据 `[!]` 输出信息，进入响应目录手动进行 `git pull` 与冲突合并解决操作。
