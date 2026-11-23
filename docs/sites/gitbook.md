---
title: "gitbook 站点与生命周期档案 (GitBook)"
description: "预留扩展位 sites/gitbook：定义了 README.md + SUMMARY.md 电子书范式的开山鼻祖，历经旧 CLI 停更断层后转型云端协同 SaaS 与 Next.js 渲染端"
---

# `gitbook` 站点档案（GitBook · 图鉴扩展位）

- **预留子模块路径**：`sites/gitbook`（与本档案 `docs/sites/gitbook.md` 及 `gitbook.json` 严格 1:1 对应）
- **官方网站**：[https://www.gitbook.com/](https://www.gitbook.com/) · **上游仓库**：[https://github.com/GitbookIO/gitbook](https://github.com/GitbookIO/gitbook)
- **底层技术栈**：新版：Next.js 渲染端 + GitBook Cloud Git Sync；旧版（已废弃）：Node 6–10 + Nunjucks

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2014-03-31` 创立开源 |
| **活跃时间** | 2014–2018 开源 CLI 风靡全球；2019 闭源转向 SaaS；2024 重新开源 Next.js 渲染端 |
| **废弃 / 演进状态** | 原版 gitbook-cli (v3.2.3) 早已彻底废弃不可用（社区由 HonKit / mdBook 承接） |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/gitbook.json`](./gitbook.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://www.gitbook.com/](https://www.gitbook.com/) |
| **GitHub 源码仓库** | [GitbookIO/gitbook](https://github.com/GitbookIO/gitbook) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/gitbook-cli](https://www.npmjs.com/package/gitbook-cli) |
| **分类标签 (Tags)** | `#ebook` · `#summary-md` · `#commercial-pivot` · `#nextjs` · `#saas-docs` · `#historical-pioneer` |
| **运行时与打包器** | Node.js / Cloudflare Workers (新版 GitBook Open) · Next.js + OpenNext (新版渲染端) |
| **UI 与 Markdown 引擎** | React + Tailwind CSS · `GitBook Custom Document AST / Markdown Sync` |
| **高亮与全文检索** | Shiki · GitBook AI Search & Cloud Index |
| **数学公式与流程图库** | KaTeX（{% math %} 或 $...$ 块） ； 原生内置 Mermaid 代码块渲染 |
| **核心依赖库 (Core Libs)** | `next`、`react`、`shiki`、`katex`、`mermaid` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`GitbookIO/gitbook`](https://github.com/GitbookIO/gitbook) | `2014-03-31` | `2026-11-23` | ★ 29,106 | 2,543 | `2025` (1,037) | `@gitbook/react-contentkit@0.7.7` (2025-10-15) |

### GitHub 主分支历年提交活跃度表（`2014–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2014` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2015` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2016` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2017` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2018` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2019` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2020` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2021` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2022` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2023` | **169** | 16.3% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **579** | 55.8% | `█████████░░░░░░░` | 🟢 高频活跃 |
| `2025` | **1,037** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2026` | **758** | 73.1% | `████████████░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **深刻影响后续十年的 `SUMMARY.md` 遗产**：今天 Rust 官方的 `mdBook`、社区的 `HonKit` 乃至 `Docsify` 的 `_sidebar.md`，全都直接脱胎于 2014 年 GitBook 初代 CLI 确立的「一份 Markdown 列表驱动整站目录」设计。
2. **开源商业化断层教训**：2018–2019 年官方突然废弃本地 `gitbook-cli` 全面转向付费商业云平台，导致全球数以万计依赖 `gitbook build` 的开源仓库在升级 Node 12+ 后集体报错 `cb.apply is not a function`，促成了 `HonKit` 与 `VitePress` 的大迁移。
