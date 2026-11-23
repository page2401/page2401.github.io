---
title: "docsify-v5 站点与生命周期档案 (Docsify 5.x 新一代)"
description: "对应子模块 sites/docsify-v5：2025–2026 复苏重生的零编译引擎、原生 GFM Callouts 与 core-dark 主题。"
---

# `docsify-v5` 站点档案（Docsify 5.x 新一代正式版）

- **本地子模块路径**：`sites/docsify-v5`（与本档案 `docs/sites/docsify-v5.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/docsify-v5`](https://github.com/page2401/docsify-v5) · **线上实测**：[`/docsify-v5/`](/docsify-v5/)
- **跨代对照子站**：[`docsify-v4` (4.13.1 旧版)](./docsify-v4.md)
- **锁定核心依赖**：`docsify@5.1.0` + `katex@0.19.1` + `mermaid@12.3.0`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | 仓库始于 `2016-11-20`；在经历 `2024` 低谷后于 `2025-05` 启动 `v5.0.0-rc`，并于 **`2026-07-23` 正式发布 `v5.0.0`** |
| **活跃时间** | **`2025–至今` 显著复苏回升**（年提交量从 `2024` 的 `54` 次连续回升至 `2025` 的 `87` 次与 `2026` 的 `108` 次，最新 `v5.1.0` 发布于 `2026-10-30`） |
| **废弃 / 演进状态** | **无（当前零预编译流派的新一代正式主线）** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/docsify-v5.json`](./docsify-v5.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://docsify.js.org/](https://docsify.js.org/) |
| **GitHub 源码仓库** | [docsifyjs/docsify](https://github.com/docsifyjs/docsify) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/docsify](https://www.npmjs.com/package/docsify) |
| **分类标签 (Tags)** | `#spa-runtime` · `#zero-build` · `#marked` · `#gfm-callouts-native` · `#css-variables` · `#dark-mode` · `#hash-router` · `#nojekyll-required` · `#v5` |
| **运行时与打包器** | Browser Client SPA（ESM / UMD） · 无（静态原样托管 *.md） |
| **UI 与 Markdown 引擎** | Vanilla JS DOM + core.min.css / core-dark.min.css · `marked（新版 Token 入参签名）` |
| **高亮与全文检索** | Prism.js · docsify/dist/plugins/search.min.js |
| **数学公式与流程图库** | katex（beforeEach 客户端钩子） ； mermaid@12.3（renderer.code Token 扩展） |
| **核心依赖库 (Core Libs)** | `marked`、`prismjs`、`katex`、`mermaid` |
| **本子站实测锁定版本** | `docsify@5.1.0` · `katex@0.19.1` · `mermaid@12.3.0` |

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

## 3. 本子站实测跨代革新与升级注意事项

1. **零插件内核原生支持 GFM Callouts**：彻底淘汰失修的三方插件，`v5` 内核直接在 `blockquote` 渲染管线中原生解析 `[!NOTE]`、`[!TIP]`、`[!IMPORTANT]`、`[!WARNING]`、`[!CAUTION]` 全套五类警报块，与本站母版 `docs/*.md` 高度契合！
2. **全新模块化 CSS 变量与暗黑模式**：资源路径从旧版 `lib/` 全面重构迁移至 `dist/`，通过 `dist/themes/core.min.css` + `dist/themes/addons/core-dark.min.css` 原生支持深浅色平滑切换。
3. **升级破坏性变更警示（`renderer.code`）**：由于底层 `marked` 大版本升级，自定义代码块渲染器入参由 `v4` 的 `(code, lang)` 变为接收 Token 对象 `({ text, lang })`——直接照搬 `v4` 的 Mermaid 钩子代码会导致页面报错 `[object Object]`。
