---
title: "hugo 站点与生命周期档案 (Hugo)"
description: "对应实测子模块 sites/hugo：Go 单二进制编译极速之王、十三年常青 GitHub 提交曲线与 _index.md 机制。"
---

# `hugo` 站点档案（Hugo · ★ 已挂载实测）

- **本地子模块路径**：`sites/hugo` · **独立子站仓库**：[`page2401/hugo`](https://github.com/page2401/hugo) · **线上实测**：[`/hugo/`](/hugo/)（与本档案 `docs/sites/hugo.md` 严格 1:1 对应）
- **上游官方仓库**：[`gohugoio/hugo`](https://github.com/gohugoio/hugo)
- **底层技术栈**：Go 语言单二进制（Extended）+ Goldmark 解析器 + Go `html/template`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2013-07-04`** 创立开源，累计主分支提交突破 `10,100+` 次，GitHub Stars 突破 `90,500+` |
| **活跃时间** | **`2014–至今` 连续十三年长跑高频活跃**（`2018–2026` 每年稳定保持 `560–1,025` 次提交，无任何衰退迹象） |
| **废弃 / 演进状态** | **核心常青无废弃**；仅需避开 `2016–2020` 年间停更且使用已移除旧模板语法的第三方老主题 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/hugo.json`](./hugo.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://gohugo.io/](https://gohugo.io/) |
| **GitHub 源码仓库** | [gohugoio/hugo](https://github.com/gohugoio/hugo) |
| **包管理仓库 (Registry)** | [https://pkg.go.dev/github.com/gohugoio/hugo](https://pkg.go.dev/github.com/gohugoio/hugo) |
| **分类标签 (Tags)** | `#ssg` · `#golang` · `#single-binary` · `#zero-node-modules` · `#goldmark` · `#millisecond-build` · `#page-bundles` · `#branch-index` |
| **运行时与打包器** | Go 单二进制可执行文件（Hugo Extended） · Hugo Pipes + esbuild + LibSass/Dart Sass |
| **UI 与 Markdown 引擎** | Go html/template · `yuin/goldmark` |
| **高亮与全文检索** | alecthomas/chroma（Go 原生高亮） · Pagefind / Fuse.js / Algolia（主题集成） |
| **数学公式与流程图库** | Goldmark passthrough + KaTeX / MathJax ； render-codeblock-mermaid.html 渲染钩子 |
| **核心依赖库 (Core Libs)** | `yuin/goldmark`、`alecthomas/chroma`、`evanw/esbuild`、`tdewolff/minify`、`spf13/cobra` |
| **本子站实测锁定版本** | `hugo@0.170.1` · `goldmark@builtin` · `katex@0.19.1` · `mermaid@12.3.0` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **266 ms** | 72 | 6862.2 KB | 108.5 KB | 5678.1 KB / **1631.3 KB** | 24.2 KB / 3.4 KB | `5` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`gohugoio/hugo`](https://github.com/gohugoio/hugo) | `2013-07-04` | `2026-11-19` | ★ 90,552 | 10,107 | `2016` (1,057) | `v0.170.1` (2026-11-17) |

### GitHub 主分支历年提交活跃度表（`2013–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2013` | **346** | 32.7% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2014` | **487** | 46.1% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2015` | **987** | 93.4% | `███████████████░` | 🟢 高频活跃 |
| `2016` | **1,057** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2017` | **986** | 93.3% | `███████████████░` | 🟢 高频活跃 |
| `2018` | **1,025** | 97.0% | `████████████████` | 🟢 高频活跃 |
| `2019` | **567** | 53.6% | `█████████░░░░░░░` | 🟢 高频活跃 |
| `2020` | **703** | 66.5% | `███████████░░░░░` | 🟢 高频活跃 |
| `2021` | **575** | 54.4% | `█████████░░░░░░░` | 🟢 高频活跃 |
| `2022` | **633** | 59.9% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2023` | **658** | 62.3% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2024` | **730** | 69.1% | `███████████░░░░░` | 🟢 高频活跃 |
| `2025` | **652** | 61.7% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2026` | **701** | 66.3% | `███████████░░░░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **千页毫秒级编译 + 零 `node_modules` 依赖**：单个可执行文件下载即跑，彻底免疫 Node 生态供应链膨胀与依赖老化。
2. **Goldmark 渲染钩子原生接管图表与警报**：支持通过 `render-codeblock-mermaid.html`、`passthrough` 数学扩展与 `render-blockquote.html` 原生解析 Mermaid、LaTeX 公式及 GFM `> [!NOTE]`。
3. **`_index.md` vs `index.md` 心智陷阱**：在 `content/` 下放 `index.md` 会变为叶子包导致同级子页面全部丧失独立路由（404），拥有子页面的章节目录必须命名为带下划线的 `_index.md`（Branch Bundle）。
