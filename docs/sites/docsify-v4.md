---
title: "docsify-v4 站点与生命周期档案 (Docsify 4.x 经典版)"
description: "对应子模块 sites/docsify-v4：零编译运行时经典版、2023–2024 停滞低谷与 v5 替代时间线。"
---

# `docsify-v4` 站点档案（Docsify 4.x 经典版 · 已进入替代期）

- **本地子模块路径**：`sites/docsify-v4`（与本档案 `docs/sites/docsify-v4.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/docsify-v4`](https://github.com/page2401/docsify-v4) · **线上实测**：[`/docsify-v4/`](/docsify-v4/)
- **跨代对照子站**：[`docsify-v5` (5.1.0 原生 Callout 新版)](./docsify-v5.md)
- **锁定核心依赖**：`docsify@4.13.1` + `docsify-plugin-flexible-alerts@1.3.1` + `katex@0.19.1` + `mermaid@12.3.0`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `docsifyjs/docsify` 于 **`2016-11-20`** 开源立项，`2017` 年迎来爆发峰值（单年 `657` 次提交）并确立 `v4.x` 架构 |
| **活跃时间** | **`2017–2023` 长达六年主力期**；末个 4.x 版本 `v4.13.1` 发布于 `2023-05`，`2024` 年跌入全周期最低谷（仅 `54` 次提交） |
| **废弃 / 演进状态** | **`2026-07-23` 随 `v5.0.0` 正式发布进入淘汰替代阶段**；周边大量 `v4` 社区插件（如 `flexible-alerts`）早在 `2020–2022` 年间断更 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/docsify-v4.json`](./docsify-v4.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://docsify.js.org/](https://docsify.js.org/) |
| **GitHub 源码仓库** | [docsifyjs/docsify](https://github.com/docsifyjs/docsify) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/docsify/v/4.13.1](https://www.npmjs.com/package/docsify/v/4.13.1) |
| **分类标签 (Tags)** | `#spa-runtime` · `#zero-build` · `#marked` · `#hash-router` · `#sidebar-md` · `#nojekyll-required` · `#legacy-v4` · `#superseded` |
| **运行时与打包器** | Browser Client SPA（零预编译） · 无（静态原样托管 *.md） |
| **UI 与 Markdown 引擎** | Vanilla JS DOM Runtime + vue.css · `marked@4` |
| **高亮与全文检索** | Prism.js · docsify/lib/plugins/search.min.js |
| **数学公式与流程图库** | katex（beforeEach 客户端钩子） ； mermaid + docsify-plugin-flexible-alerts |
| **核心依赖库 (Core Libs)** | `marked@4`、`prismjs`、`docsify-plugin-flexible-alerts` |
| **本子站实测锁定版本** | `docsify@4.13.1` · `docsify-plugin-flexible-alerts@1.3.0` · `katex@0.19.1` · `mermaid@10.9.8` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **440 ms (零编译 SPA)** | 77 | 4814.2 KB | 3.5 KB | 3710.2 KB / **1105.4 KB** | 37.0 KB / 6.9 KB | `7` 个 | 客户端全文扫描 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`docsifyjs/docsify`](https://github.com/docsifyjs/docsify) | `2016-11-20` | `2026-11-14` | ★ 31,609 | 2,025 | `2017` (657) | `v5.1.0` (2026-10-30) |

### GitHub 主分支历年提交活跃度表（`2016–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2016` | **175** | 26.6% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2017` | **657** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2018` | **208** | 31.7% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2019` | **135** | 20.5% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2020` | **299** | 45.5% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **102** | 15.5% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2022` | **68** | 10.4% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2023` | **132** | 20.1% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **54** | 8.2% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2025` | **87** | 13.2% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2026` | **108** | 16.4% | `███░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 本子站实测局限与历史痛点

1. **缺乏原生 GFM Callout 且旧插件残缺**：`v4` 内核仅认独有的 `?>` 与 `!>` 语法；即便引入三方插件 `docsify-plugin-flexible-alerts@1.3.1`，也只能识别 `NOTE/TIP/WARNING/ATTENTION`，遇到新版 GitHub 标准 `[!IMPORTANT]` 与 `[!CAUTION]` 会直接退化失效！
2. **YAML Frontmatter 默认裸露**：不手动挂载 `lib/plugins/front-matter.min.js` 时，文档顶部的 `--- title: ... ---` 会被当成普通分隔线和正文直接印在网页最上方。
3. **`.nojekyll` 生死线与旧版 `vue.css`**：侧边栏 `_sidebar.md` 以下划线开头，GitHub Pages 漏放 `.nojekyll` 即全站侧栏 404；且旧版单体 `lib/themes/vue.css` 缺乏现代原生暗黑模式 CSS 变量体系。
