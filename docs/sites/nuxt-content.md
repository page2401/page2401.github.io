---
title: "nuxt-content 站点与生命周期档案 (Nuxt Content)"
description: "预留扩展位 sites/nuxt-content：Nuxt 官方内容引擎：独创 ::component 双冒号 MDC 语法 + SQL 数据库级内容检索查询"
---

# `nuxt-content` 站点档案（Nuxt Content · 图鉴扩展位）

- **预留子模块路径**：`sites/nuxt-content`（与本档案 `docs/sites/nuxt-content.md` 及 `nuxt-content.json` 严格 1:1 对应）
- **官方网站**：[https://content.nuxt.com/](https://content.nuxt.com/) · **上游仓库**：[https://github.com/nuxt/content](https://github.com/nuxt/content)
- **底层技术栈**：Nuxt 3/4 + Vue 3 + @nuxtjs/mdc + SQLite Content Layer

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2020-03-31` 创立开源 |
| **活跃时间** | 2020–至今（随 Nuxt 3/4 演进至 Content v3 持续活跃） |
| **废弃 / 演进状态** | v1 (Nuxt 2) 已废弃；v3 全面改用 SQLite 驱动的 Collections |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/nuxt-content.json`](./nuxt-content.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://content.nuxt.com/](https://content.nuxt.com/) |
| **GitHub 源码仓库** | [nuxt/content](https://github.com/nuxt/content) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/@nuxt/content](https://www.npmjs.com/package/@nuxt/content) |
| **分类标签 (Tags)** | `#ssg-ssr` · `#vue3` · `#nuxt` · `#mdc-syntax` · `#sqlite-query` · `#zod-collections` · `#full-stack` |
| **运行时与打包器** | Node.js >= 18 / Cloudflare Workers / Edge · Nuxt 3/4 (Vite + Nitro) |
| **UI 与 Markdown 引擎** | Vue 3 + Nuxt UI Pro · `@nuxtjs/mdc (remark + MDC AST)` |
| **高亮与全文检索** | Shiki · 内置全文分片搜索 API |
| **数学公式与流程图库** | remark-math + rehype-katex ； 自定义 ProseCode / Mermaid Vue 组件 |
| **核心依赖库 (Core Libs)** | `nuxt`、`@nuxt/content`、`@nuxtjs/mdc`、`vue`、`shiki`、`better-sqlite3` |
| **本子站实测锁定版本** | `@nuxt/content@3.17.0` · `nuxt@4.7.0` · `better-sqlite3@13.2.0` · `remark-math@6.0.0` · `rehype-katex@7.0.1` · `katex@0.19.1` · `mermaid@12.3.0` · `vue@3.5.46` |

### ⚡ 同源 6 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **15.22 s (15,216 ms)** | 215 | 8135.4 KB | 212.7 KB | 5766.3 KB / **1683.4 KB** | 46.1 KB / 12.4 KB | `4` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`nuxt/content`](https://github.com/nuxt/content) | `2020-03-31` | `2026-11-22` | ★ 3,682 | 3,538 | `2020` (873) | `v3.17.0` (2026-11-17) |

### GitHub 主分支历年提交活跃度表（`2020–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2020` | **873** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2021` | **362** | 41.5% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2022` | **713** | 81.7% | `█████████████░░░` | 🟢 高频活跃 |
| `2023` | **344** | 39.4% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **523** | 59.9% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2025` | **562** | 64.4% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2026` | **161** | 18.4% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **极具巧思的“数字前缀自动剥离”目录方案**：在 Nuxt Content 中把文件命名为 `content/1.guide/2.installation.md`，本地 IDE 天然有序，而编译出的路由自动剥离数字变为干净的 `/guide/installation`——优雅化解了 VitePress 污染 URL 与 Starlight 本地乱序的两难！
2. **MDC（Markdown Components）语法**：用 `::alert{color="amber"}` 在纯 Markdown 中调用 Vue 组件，无需将文件改成 `.mdx`。
3. **代价**：背负完整 Nuxt 全栈框架与 Nitro 服务端概念，相比轻量纯粹的 VitePress 构建更重、冷启动更慢。
