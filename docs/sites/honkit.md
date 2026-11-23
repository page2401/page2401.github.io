---
title: "honkit 站点与生命周期档案 (HonKit)"
description: "预留扩展位 sites/honkit：原版 GitBook CLI 停更后的社区正统继任者：零改动复活老 SUMMARY.md 仓库并支持直接导出 PDF / ePub 电子书"
---

# `honkit` 站点档案（HonKit · 图鉴扩展位）

- **预留子模块路径**：`sites/honkit`（与本档案 `docs/sites/honkit.md` 及 `honkit.json` 严格 1:1 对应）
- **官方网站**：[https://honkit.netlify.app/](https://honkit.netlify.app/) · **上游仓库**：[https://github.com/honkit/honkit](https://github.com/honkit/honkit)
- **底层技术栈**：Node.js 18/20/22 + HonKit + Nunjucks + Calibre (PDF/ePub 导出)

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2020-06-13` 创立开源 |
| **活跃时间** | 2020–至今（日本开源社区主导维护，兼容现代 Node 20/22） |
| **废弃 / 演进状态** | **无（当前持续活跃维护中）** |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/honkit.json`](./honkit.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://honkit.netlify.app/](https://honkit.netlify.app/) |
| **GitHub 源码仓库** | [honkit/honkit](https://github.com/honkit/honkit) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/honkit](https://www.npmjs.com/package/honkit) |
| **分类标签 (Tags)** | `#ssg` · `#ebook` · `#gitbook-fork` · `#summary-md` · `#epub-pdf` · `#nodejs` · `#markdown-it` |
| **运行时与打包器** | Node.js >= 18 · HonKit Static & eBook Pipeline |
| **UI 与 Markdown 引擎** | Nunjucks 模板 + 经典三栏电子书阅读器 · `honkit-markdown-legacy / markdown-it` |
| **高亮与全文检索** | highlight.js · honkit-plugin-lunr / search-pro |
| **数学公式与流程图库** | honkit-plugin-katex ； honkit-plugin-mermaid |
| **核心依赖库 (Core Libs)** | `honkit`、`nunjucks`、`highlight.js`、`juicer` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`honkit/honkit`](https://github.com/honkit/honkit) | `2020-06-13` | `2026-11-21` | ★ 3,532 | 3,495 | `2014` (895) | `v7.0.1` (2026-11-21) |

### GitHub 主分支历年提交活跃度表（`2020–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2020` | **812** | 90.7% | `███████████████░` | 🟢 高频活跃 |
| `2021` | **57** | 6.4% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2022` | **60** | 6.7% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2023` | **54** | 6.0% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2024` | **28** | 3.1% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2025` | **27** | 3.0% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2026` | **41** | 4.6% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **存量 GitBook 仓库的零成本救星**：如果你手头有一座 2016–2019 年编写的旧 GitBook 教程仓库在 Node 22 下无法构建，将 `gitbook-cli` 替换为 `honkit` 几乎可以零改代码恢复构建，并保留原汁原味的 **PDF / ePub / Mobi 多格式出版能力**。
2. **局限**：前端阅读界面仍停留在十年前的 jQuery + Nunjucks 时代，交互体验与首屏性能不如现代 VitePress / mdBook。
