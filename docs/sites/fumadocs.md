---
title: "fumadocs 站点与生命周期档案 (Fumadocs)"
description: "预留扩展位 sites/fumadocs：Shadcn UI 时代的 Next.js 新王：无黑盒可定制组件 + 原生 OpenAPI 交互演练场 + Twoslash 类型提示"
---

# `fumadocs` 站点档案（Fumadocs · 图鉴扩展位）

- **预留子模块路径**：`sites/fumadocs`（与本档案 `docs/sites/fumadocs.md` 及 `fumadocs.json` 严格 1:1 对应）
- **官方网站**：[https://fumadocs.dev/](https://fumadocs.dev/) · **上游仓库**：[https://github.com/fuma-nama/fumadocs](https://github.com/fuma-nama/fumadocs)
- **底层技术栈**：Next.js App Router + React 19 RSC + Fumadocs MDX + Tailwind CSS + Orama

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2023-07-03` 创立开源 |
| **活跃时间** | 2024–至今（React/Next.js 社区增速最快的现代文档框架） |
| **废弃 / 演进状态** | **无（当前持续活跃维护中）** |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/fumadocs.json`](./fumadocs.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://fumadocs.dev/](https://fumadocs.dev/) |
| **GitHub 源码仓库** | [fuma-nama/fumadocs](https://github.com/fuma-nama/fumadocs) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/fumadocs-ui](https://www.npmjs.com/package/fumadocs-ui) |
| **分类标签 (Tags)** | `#ssg-ssr` · `#nextjs` · `#app-router` · `#rsc` · `#shadcn-ui` · `#tailwind` · `#mdx` · `#openapi` · `#rising-star` |
| **运行时与打包器** | Node.js >= 20 / Bun · Next.js (Turbopack / Webpack) + Fumadocs MDX |
| **UI 与 Markdown 引擎** | React 19 + Next.js RSC + Tailwind CSS + Radix/Shadcn · `fumadocs-mdx (remark / rehype)` |
| **高亮与全文检索** | Shiki Twoslash（内置 TypeScript 类型悬浮提示！） · Orama 内置搜索 / Algolia / Pagefind |
| **数学公式与流程图库** | remark-math + rehype-katex ； Mermaid MDX 组件或 remark 插件 |
| **核心依赖库 (Core Libs)** | `fumadocs-core`、`fumadocs-ui`、`fumadocs-mdx`、`next`、`shiki`、`@orama/orama` |
| **本子站实测锁定版本** | `fumadocs-ui@16.19.7` · `fumadocs-core@16.19.7` · `fumadocs-mdx@15.6.4` · `next@16.4.6` · `tailwindcss@4.3.5` · `react@19.3.1` · `remark-math@6.0.0` · `rehype-katex@7.0.1` · `katex@0.19.1` · `mermaid@12.3.0` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **57.50 s (57,502 ms)** | 211 | 8857.6 KB | 611.9 KB | 6344.4 KB / **1831.9 KB** | 109.6 KB / 18.1 KB | `24` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`fuma-nama/fumadocs`](https://github.com/fuma-nama/fumadocs) | `2023-07-03` | `2026-11-22` | ★ 13,697 | 6,343 | `2024` (1,927) | `fumadocs@16.19.7` (2026-11-22) |

### GitHub 主分支历年提交活跃度表（`2023–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2023` | **1,223** | 63.5% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2024` | **1,927** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2025` | **1,729** | 89.7% | `██████████████░░` | 🟢 高频活跃 |
| `2026` | **1,464** | 76.0% | `████████████░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **为什么大量 Next.js 团队从 Nextra 转向 Fumadocs？**：Fumadocs 彻底拥抱 Shadcn UI 的“代码归属开发者”理念，UI 层透明可定制，同时内置极其惊艳的 **OpenAPI 接口在线调试页生成** 与 **TypeScript Twoslash 类型悬浮气泡**。
2. **`meta.json` 根级文档切换（Root Toggle）**：天然支持在同一个文档站内划分多个子产品线（如 `CLI` / `SDK` / `Cloud`），左侧顶部一键切换独立侧边栏树。
3. **代价与边界**：完整继承了 Next.js App Router 工程复杂度，纯静态写手上手门槛显著高于 VitePress 与 Docsify。
