---
title: "eleventy 站点与生命周期档案 (Eleventy (11ty))"
description: "预留扩展位 sites/eleventy：前端纯粹主义者的最爱：默认零字节客户端 JS，支持同目录 10+ 种模板引擎自由混排"
---

# `eleventy` 站点档案（Eleventy (11ty) · 图鉴扩展位）

- **预留子模块路径**：`sites/eleventy`（与本档案 `docs/sites/eleventy.md` 及 `eleventy.json` 严格 1:1 对应）
- **官方网站**：[https://www.11ty.dev/](https://www.11ty.dev/) · **上游仓库**：[https://github.com/11ty/buildawesome](https://github.com/11ty/buildawesome)
- **底层技术栈**：Node.js + Eleventy 3 + WebC / Nunjucks / Liquid + markdown-it

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2017-11-27` 创立开源 |
| **活跃时间** | 2018–至今（2024 加入 Font Awesome / Build Awesome 持续活跃） |
| **废弃 / 演进状态** | **无（当前持续活跃维护中）** |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/eleventy.json`](./eleventy.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://www.11ty.dev/](https://www.11ty.dev/) |
| **GitHub 源码仓库** | [11ty/buildawesome](https://github.com/11ty/buildawesome) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) |
| **分类标签 (Tags)** | `#ssg` · `#nodejs` · `#zero-client-js` · `#markdown-it` · `#nunjucks` · `#liquid` · `#webc` · `#pure-html` · `#fast-build` |
| **运行时与打包器** | Node.js >= 18 (v3 原生 ESM) · Eleventy Zero-Bundler Static Compiler |
| **UI 与 Markdown 引擎** | 无客户端框架（支持 WebC / Nunjucks / Liquid / 11ty.js 混编） · `markdown-it` |
| **高亮与全文检索** | @11ty/eleventy-plugin-syntaxhighlight (Prism) · Pagefind（官方推荐静态后置索引） |
| **数学公式与流程图库** | markdown-it-texmath / markdown-it-mathjax3 ； 自定义 markdown-it fence 钩子或客户端 Mermaid |
| **核心依赖库 (Core Libs)** | `@11ty/eleventy`、`markdown-it`、`liquidjs`、`nunjucks`、`@11ty/webc` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`11ty/buildawesome`](https://github.com/11ty/buildawesome) | `2017-11-27` | `2026-11-20` | ★ 20,055 | 3,972 | `2024` (597) | `v3.1.8` (2026-11-03) |

### GitHub 主分支历年提交活跃度表（`2017–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2017` | **135** | 22.6% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2018` | **488** | 81.7% | `█████████████░░░` | 🟢 高频活跃 |
| `2019` | **346** | 58.0% | `█████████░░░░░░░` | 🔵 稳健迭代 |
| `2020` | **293** | 49.1% | `████████░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **424** | 71.0% | `███████████░░░░░` | 🟢 高频活跃 |
| `2022` | **458** | 76.7% | `████████████░░░░` | 🟢 高频活跃 |
| `2023` | **252** | 42.2% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **597** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2025` | **530** | 88.8% | `██████████████░░` | 🟢 高频活跃 |
| `2026` | **449** | 75.2% | `████████████░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **极致纯粹与零客户端税（Zero Client JS）**：区别于把整站水合为 React/Vue SPA 的框架，11ty 只做一件事——将数据和 Markdown 编译成最干净的静态 HTML，性能评分天然满分。
2. **独步业界的“数据级联（Data Cascade）”**：支持在目录放置 `<dir>.11tydata.json` 为整层文件夹批量注入 Layout、Tag 与权限元数据，无需每篇 `.md` 重复粘贴 Frontmatter。
3. **文档站取舍**：11ty 是底层编译引擎而非开箱即用的“文档主题”，侧边栏、暗黑模式与搜索均需自行拼装（不像 VitePress / Starlight 开箱即上线）。
