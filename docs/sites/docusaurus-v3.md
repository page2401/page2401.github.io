---
title: "docusaurus-v3 站点与生命周期档案 (Docusaurus v3)"
description: "预留扩展位 sites/docusaurus-v3：Meta 开源 React 旗舰文档站生命周期、多版本快照与 GitHub 提交活跃度。"
---

# `docusaurus-v3` 站点档案（Docusaurus v3 · 图鉴扩展位）

- **预留子模块路径**：`sites/docusaurus-v3`（与本档案 `docs/sites/docusaurus-v3.md` 严格 1:1 对应）
- **上游官方仓库**：[`facebook/docusaurus`](https://github.com/facebook/docusaurus)
- **底层技术栈**：React 18/19 + MDX 3 + Webpack / Rspack (`@docusaurus/faster`)

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2017-06-20`** 由 Meta 开源团队创立；`2022-08` 发布重写版 `v2.0`，`2023-10` 发布 MDX 3 架构 `v3.0` |
| **活跃时间** | **`2018–至今` 持续稳健迭代**（`2020–2022` 连续三年突破千次提交，`2026` 年显著回升至 `642` 次提交） |
| **废弃 / 演进状态** | **`v1` 已于 `2022` 正式废弃 EOL**；**`v2` 已冻结新特性**；**`v3.x` 当前主力活跃维护中** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/docusaurus-v3.json`](./docusaurus-v3.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://docusaurus.io/](https://docusaurus.io/) |
| **GitHub 源码仓库** | [meta/docusaurus](https://github.com/facebook/docusaurus) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/@docusaurus/core](https://www.npmjs.com/package/@docusaurus/core) |
| **分类标签 (Tags)** | `#ssg` · `#react` · `#mdx3` · `#docs-versioning` · `#i18n` · `#webpack` · `#rspack-faster` · `#category-json` · `#blog-included` |
| **运行时与打包器** | Node.js >= 18 · Webpack 5 / Rspack (@docusaurus/faster) |
| **UI 与 Markdown 引擎** | React 18 / 19 · `MDX 3 + remark / rehype` |
| **高亮与全文检索** | prism-react-renderer · Algolia DocSearch / 本地搜索插件 |
| **数学公式与流程图库** | remark-math + rehype-katex ； @docusaurus/theme-mermaid |
| **核心依赖库 (Core Libs)** | `@docusaurus/core`、`@docusaurus/preset-classic`、`@mdx-js/react`、`react`、`prism-react-renderer` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`meta/docusaurus`](https://github.com/meta/docusaurus) | `2017-06-20` | `2026-11-20` | ★ 66,787 | 7,118 | `2021` (1,139) | `v3.10.2` (2026-07-10) |

### GitHub 主分支历年提交活跃度表（`2017–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2017` | **556** | 48.8% | `████████░░░░░░░░` | 🟢 高频活跃 |
| `2018` | **693** | 60.8% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2019` | **879** | 77.2% | `████████████░░░░` | 🟢 高频活跃 |
| `2020` | **1,084** | 95.2% | `███████████████░` | 🟢 高频活跃 |
| `2021` | **1,139** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2022` | **1,085** | 95.3% | `███████████████░` | 🟢 高频活跃 |
| `2023` | **350** | 30.7% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **400** | 35.1% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **290** | 25.5% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2026` | **642** | 56.4% | `█████████░░░░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **无可替代的原生多版本快照（Docs Versioning）**：一行 `docusaurus docs:version 1.0` 自动归档历史版本快照并生成多版本导航下拉框，大型基础软件首选。
2. **`_category_.json` 解决自动侧边栏中文分组名**：可在任意子目录声明 `{ "label": "嵌套子目录", "position": 2 }`，精准弥补 Starlight `autogenerate` 直接暴露英文文件夹名的短板，代价是文档树散落 JSON 配置文件。
3. **MDX 3 严格语法边界**：存量 Markdown 中未转义的裸 `<`（如 `<= 10ms`）与 `{}` 会触发 JSX 编译报错，从纯 GFM 母版迁移时需做转义清洗。
