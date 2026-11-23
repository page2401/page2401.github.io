---
title: "gatsby 站点与生命周期档案 (Gatsby)"
description: "预留扩展位 sites/gatsby：曾开创统一 GraphQL 数据层先河的 React 巨舰，因架构过度复杂与构建缓慢成为前端演进史经典教材"
---

# `gatsby` 站点档案（Gatsby · 图鉴扩展位）

- **预留子模块路径**：`sites/gatsby`（与本档案 `docs/sites/gatsby.md` 及 `gatsby.json` 严格 1:1 对应）
- **官方网站**：[https://www.gatsbyjs.com/](https://www.gatsbyjs.com/) · **上游仓库**：[https://github.com/gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby)
- **底层技术栈**：React + GraphQL Data Layer + Webpack + gatsby-source-filesystem

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2015-05-21` 创立开源 |
| **活跃时间** | 2017–2021 巅峰霸主（55.9k★）；2023 被 Netlify 收购后大幅缩减 |
| **废弃 / 演进状态** | 核心进入极低频维护态，现代文档站已被 Astro / Docusaurus / Next.js 全面替代 |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/gatsby.json`](./gatsby.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://www.gatsbyjs.com/](https://www.gatsbyjs.com/) |
| **GitHub 源码仓库** | [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/gatsby](https://www.npmjs.com/package/gatsby) |
| **分类标签 (Tags)** | `#ssg` · `#react` · `#graphql-data-layer` · `#webpack` · `#remark` · `#heavy-plugins` · `#declining` |
| **运行时与打包器** | Node.js >= 18 · Webpack 5 + Babel |
| **UI 与 Markdown 引擎** | React 18 · `gatsby-transformer-remark / gatsby-plugin-mdx` |
| **高亮与全文检索** | gatsby-remark-prismjs · gatsby-plugin-local-search / Algolia |
| **数学公式与流程图库** | gatsby-remark-katex ； gatsby-remark-mermaid（依赖重型 Puppeteer 预渲染或旧插件） |
| **核心依赖库 (Core Libs)** | `gatsby`、`graphql`、`react`、`gatsby-source-filesystem`、`gatsby-plugin-mdx` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`gatsbyjs/gatsby`](https://github.com/gatsbyjs/gatsby) | `2015-05-21` | `2026-11-20` | ★ 55,915 | 21,877 | `2019` (5,698) | `gatsby@5.16.1` (2026-02-10) |

### GitHub 主分支历年提交活跃度表（`2015–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2015` | **217** | 3.8% | `█░░░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2016` | **689** | 12.1% | `██░░░░░░░░░░░░░░` | 🟢 高频活跃 |
| `2017` | **2,236** | 39.2% | `██████░░░░░░░░░░` | 🟢 高频活跃 |
| `2018` | **4,404** | 77.3% | `████████████░░░░` | 🟢 高频活跃 |
| `2019` | **5,698** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2020` | **4,289** | 75.3% | `████████████░░░░` | 🟢 高频活跃 |
| `2021` | **2,088** | 36.6% | `██████░░░░░░░░░░` | 🟢 高频活跃 |
| `2022` | **1,354** | 23.8% | `████░░░░░░░░░░░░` | 🟢 高频活跃 |
| `2023` | **624** | 11.0% | `██░░░░░░░░░░░░░░` | 🟢 高频活跃 |
| `2024` | **115** | 2.0% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2025` | **48** | 0.8% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2026` | **115** | 2.0% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **极具警示意义的 GitHub 提交盛衰曲线**：Gatsby 曾获数千万美元融资并达到近 5.6 万 Stars，连 React 旧官网都曾用它构建；但为了渲染几篇本地 Markdown 却强制开发者编写冗长的 GraphQL 查询与 `gatsby-node.js`，最终在 Astro 与 VitePress 的“极简静态回归潮”中迅速流失用户。
2. **选型建议**：仅作前端 SSG 架构史研究与存量老项目维护参考，**新建文档站切勿选用**。
