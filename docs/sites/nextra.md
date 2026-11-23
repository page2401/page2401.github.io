---
title: "nextra 站点与生命周期档案 (Nextra)"
description: "预留扩展位 sites/nextra：Vercel 生态 Next.js 文档框架生命周期、2026 提交放缓曲线与选型边界。"
---

# `nextra` 站点档案（Nextra · 图鉴扩展位）

- **预留子模块路径**：`sites/nextra`（与本档案 `docs/sites/nextra.md` 严格 1:1 对应）
- **上游官方仓库**：[`shuding/nextra`](https://github.com/shuding/nextra)
- **底层技术栈**：Next.js (App Router) + React Server Components + MDX

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2020-06-15`** 由 Shu Ding 创立开源 |
| **活跃时间** | **`2021–2025` 为高速迭代期**（`2022`、`2023`、`2025` 年提交均超 `550` 次）；**`2026` 年提交量陡降至 `10` 次**，进入低频平缓维护期 |
| **废弃 / 演进状态** | **Nextra v1 / v2（基于旧 Pages Router）已淘汰**；v3 / v4（App Router）存续但近期迭代明显放缓，新项目选型需留意社区向 Fumadocs / Starlight 的分流趋势 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/nextra.json`](./nextra.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://nextra.site/](https://nextra.site/) |
| **GitHub 源码仓库** | [shuding/nextra](https://github.com/shuding/nextra) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/nextra](https://www.npmjs.com/package/nextra) |
| **分类标签 (Tags)** | `#ssg-ssr` · `#nextjs` · `#app-router` · `#rsc` · `#react` · `#mdx3` · `#meta-ts` · `#pagefind` · `#vercel` |
| **运行时与打包器** | Node.js >= 18 · Next.js (Webpack / Turbopack) |
| **UI 与 Markdown 引擎** | React + Next.js App Router (RSC) · `@mdx-js/loader + remark / rehype` |
| **高亮与全文检索** | rehype-pretty-code (Shiki) · Pagefind (v4) / FlexSearch (v2–v3) |
| **数学公式与流程图库** | 内置 latex: true (KaTeX / MathJax) ； @theguild/remark-mermaid |
| **核心依赖库 (Core Libs)** | `next`、`nextra`、`nextra-theme-docs`、`react`、`rehype-pretty-code`、`pagefind` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`shuding/nextra`](https://github.com/shuding/nextra) | `2020-06-15` | `2026-07-31` | ★ 13,956 | 2,332 | `2023` (578) | `nextra-theme-docs@4.6.1` (2025-12-04) |

### GitHub 主分支历年提交活跃度表（`2020–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2020` | **93** | 16.1% | `███░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2021` | **221** | 38.2% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2022` | **577** | 99.8% | `████████████████` | 🟢 高频活跃 |
| `2023` | **578** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2024` | **300** | 51.9% | `████████░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **553** | 95.7% | `███████████████░` | 🟢 高频活跃 |
| `2026` | **10** | 1.7% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **与 Next.js 全栈主站同仓无缝融合**：适合主业务本身就是大型 Next.js 应用、需要在 `/docs` 复用同一套鉴权与 React 组件库的场景。
2. **深度耦合 Next.js 路由代际迁移**：采用 `_meta.js` / `_meta.ts` 编程式导航，每逢 Next.js 底层路由模型大改（如 Pages Router 迁 App Router）均伴随较大升级成本。
