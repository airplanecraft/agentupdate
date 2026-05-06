# 发现与决策记录 (Findings & Decisions)

## Finding v1.2 — Bilingual Content Modularization (2026-05-05 16:45)

### 背景
初期教程采用单 Markdown 文件混合中英文（通过 `---` 或特定标记分割）。随着内容增长，单文件解析变得复杂，且不利于 SEO 和不同语言下的差异化渲染。

### 发现
- 单文件混合模式在 Admin 预览时容易出现解析错误。
- `website` 模块的前端路由更容易处理独立的 `.md` 和 `.en.md` 文件。
- 独立的英文文件允许针对英文语境进行更地道的调整，而不受中文结构的死板约束。

### 决策
- 统一采用 **Bilingual Split Strategy**:
    - 中文内容：`lesson-XX.md`
    - 英文内容：`lesson-XX.en.md`
- Seeding 脚本必须支持这种双文件模式，自动合并入库。
- 静态资源（插图/封面）必须在 `admin/public` 和 `website/public` 之间保持镜像同步，以确保预览一致性。

### 影响
- 显著提升了内容的维护性。
- 后台预览与前台展示实现了 100% 视觉对齐。
- 为后续支持更多语言（如日语、法语）奠定了可扩展基础。

## Finding v1.3 — Astro/Vite 6 局域网访问限制与 SEO 内链织网 (2026-05-06 19:35)

### 背景
开发阶段发现局域网内的其他设备（如手机或同网段 PC）无法通过 IP 直接访问 Astro 开发服务器（报 HTTP 400 Bad Request）。同时，GSC 报告显示网站有超 500 个新闻页面处于“已发现 - 尚未编入索引”的状态。

### 发现
1. **Vite 6 的安全收紧**: Vite 6 默认开启了严格的 `Host` Header 校验以防 DNS 重绑定攻击。即使绑定了 `0.0.0.0`，如果不显式配置 `allowedHosts: true`，也会拒绝外部 IP 访问。
2. **现代浏览器（Chrome）的 HTTP 限制**: 即使底层 TCP/HTTP 连通，Chrome 会视内网 IP 为 Insecure Context，进而强制拦截、阻断 API，或触发自动升级 HTTPS，表现为假性的“无法访问”。
3. **爬虫行为机制**: 批量生成的内容如果只有深层列表结构而缺乏横向联结，Googlebot 会认为其重要性低，加上抓取预算限制，导致大量页面搁浅在“未索引”状态。

### 决策
- 在 `astro.config.mjs` 中全局配置允许局域网 IP (`allowedHosts: true`, `security.checkOrigin: false`) 用于开发联调。
- **SEO 内链织网**: 彻底摒弃孤岛结构。在所有新闻详情页底层追加时间轴相邻的 3 篇文章链接；在所有产品页底部追加最新新闻。通过硬编码组件 `RelatedNews.astro` 串联全站页面。

### 影响
- 解决了多端跨设备开发调试的痛点。
- 为爬虫构建了极其友好的 Crawl Chain（爬虫网），理论上能显著加速被雪藏页面的收录速度并降低跳出率。
