---
title: "lume 站点与生命周期档案 (Lume)"
description: "预留扩展位 sites/lume：受 Eleventy 启发的 Deno 原生静态生成器：彻底告别 node_modules 黑洞，一行 import 启用 KaTeX、Pagefind 与 LightningCSS"
---

# `lume` 站点档案（Lume · 图鉴扩展位）

- **预留子模块路径**：`sites/lume`（与本档案 `docs/sites/lume.md` 及 `lume.json` 严格 1:1 对应）
- **官方网站**：[https://lume.land/](https://lume.land/) · **上游仓库**：[https://github.com/lumeland/lume](https://github.com/lumeland/lume)
- **底层技术栈**：Deno 2 + Lume + Vento 模板 + markdown-it + 官方开箱插件库

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2020-09-07` 创立开源 |
| **活跃时间** | 2021–至今（Deno 生态头牌静态站点生成器，持续高频活跃） |
| **废弃 / 演进状态** | **无（当前持续活跃维护中）** |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/lume.json`](./lume.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://lume.land/](https://lume.land/) |
| **GitHub 源码仓库** | [lumeland/lume](https://github.com/lumeland/lume) |
| **包管理仓库 (Registry)** | [https://deno.land/x/lume](https://deno.land/x/lume) |
| **分类标签 (Tags)** | `#ssg` · `#deno` · `#zero-node-modules` · `#vento-templates` · `#typescript-native` · `#markdown-it` · `#modern` |
| **运行时与打包器** | Deno >= 2.0（原生 TypeScript 零配置执行） · Lume Pipeline +內置 esbuild / LightningCSS |
| **UI 与 Markdown 引擎** | Vento (.vto) / JSX / Nunjucks 多模板自由混用 · `markdown-it` |
| **高亮与全文检索** | Shiki / Highlight.js 插件 · 内置 lume/plugins/pagefind.ts 一行启用 Pagefind！ |
| **数学公式与流程图库** | lume/plugins/katex.ts 官方内置插件 ； 客户端 Mermaid 或自定义处理器 |
| **核心依赖库 (Core Libs)** | `deno`、`lume`、`vento`、`markdown-it`、`lightningcss`、`pagefind` |
| **本子站实测锁定版本** | `lume@3.3.3` · `deno@2.9.8` · `vento@2.4.2` · `markdown-it@15.0.3` · `@mdit/plugin-alert@2.2.0` · `@mdit/plugin-container@2.2.0` · `@mdit/plugin-katex@1.2.1` · `highlight.js@11.12.0` · `katex@0.19.1` · `mermaid@12.3.0` |

### ⚡ 同源 6 章冷构建、浏览器查看渲染与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 首屏正文就绪 (FCP) | 站内切页 / 图表渲染 | 单页传输 (Gzip) | 整站总体积 | JS 原始 / Gzip | 正文 `<script>` | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **1.21 s (1,211 ms)** | **267 ms** (244 ms) | 52 ms / 2117 ms | 12.5 KB (3 请求) | 6657.1 KB (71 文件) | 5408.0 KB / **1555.4 KB** | `0` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`lumeland/lume`](https://github.com/lumeland/lume) | `2020-09-07` | `2026-11-22` | ★ 2,284 | 4,614 | `2021` (957) | `v3.3.3` (2026-10-20) |

### GitHub 主分支历年提交活跃度表（`2020–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2020` | **214** | 22.4% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **957** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2022` | **831** | 86.8% | `██████████████░░` | 🟢 高频活跃 |
| `2023` | **716** | 74.8% | `████████████░░░░` | 🟢 高频活跃 |
| `2024` | **612** | 63.9% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2025` | **609** | 63.6% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2026` | **675** | 70.5% | `███████████░░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **Deno 时代的“现代完全体 Eleventy”**：保留了 11ty 灵活的数据级联与多模板混编哲学，但借助 Deno 的 URL/JSR 模块机制彻底消灭了本地几百 MB 的 `node_modules`，并且官方核心直接内置了 KaTeX、Pagefind、Tailwind、LightningCSS、og-images 等数十个高质量插件！
2. **选型定位**：喜欢 TypeScript 现代工程体验、又厌倦了传统前端打包器配置泥潭的独立开发者与定制文档站利器。
