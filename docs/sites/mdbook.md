---
title: "mdbook 站点与生命周期档案 (mdBook)"
description: "对应实测子模块 sites/mdbook：Rust 官方技术电子书引擎生命周期、SUMMARY.md 目录驱动与历年提交记录。"
---

# `mdbook` 站点档案（mdBook · ★ 已挂载实测）

- **本地子模块路径**：`sites/mdbook` · **独立子站仓库**：[`page2401/mdbook`](https://github.com/page2401/mdbook) · **线上实测**：[`/mdbook/`](/mdbook/)（与本档案 `docs/sites/mdbook.md` 严格 1:1 对应）
- **上游官方仓库**：[`rust-lang/mdBook`](https://github.com/rust-lang/mdBook)
- **底层技术栈**：Rust 单二进制 + `pulldown-cmark`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2015-07-07`** 作为《The Rust Programming Language》官方构建工具诞生 |
| **活跃时间** | **`2016–至今` 十一年稳健活跃**（`2025` 年因 `v0.5` 架构大升级创下历史最高 `688` 次提交，`2026` 年延续 `275` 次高频提交） |
| **废弃 / 演进状态** | **无（Rust 语言官方核心基础设施，长期稳固）** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/mdbook.json`](./mdbook.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://rust-lang.github.io/mdBook/](https://rust-lang.github.io/mdBook/) |
| **GitHub 源码仓库** | [rust-lang/mdBook](https://github.com/rust-lang/mdBook) |
| **包管理仓库 (Registry)** | [https://crates.io/crates/mdbook](https://crates.io/crates/mdbook) |
| **分类标签 (Tags)** | `#ssg` · `#rust` · `#ebook` · `#linear-tutorial` · `#summary-md` · `#single-binary` · `#pulldown-cmark` · `#official-rust` |
| **运行时与打包器** | Rust 单二进制可执行文件 · mdBook Native Static Renderer |
| **UI 与 Markdown 引擎** | Handlebars 模板 + 内置电子书阅读器 · `pulldown-cmark` |
| **高亮与全文检索** | highlight.js（支持 Rust Playground 在线运行） · elasticlunr.js 内置搜索 |
| **数学公式与流程图库** | book.toml 原生内置 mathjax-support = true ； mdbook-mermaid 独立预处理器二进制 |
| **核心依赖库 (Core Libs)** | `pulldown-cmark`、`handlebars`、`elasticlunr`、`highlight.js`、`toml` |
| **本子站实测锁定版本** | `mdbook@0.5.4` · `pulldown-cmark@builtin` · `katex@0.19.1` · `mermaid@12.3.0` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **168 ms** | 47 | 7170.9 KB | 228.5 KB | 6036.2 KB / **1725.0 KB** | 408.1 KB / 270.8 KB | `17` 个 | Elasticlunr 静态索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`rust-lang/mdBook`](https://github.com/rust-lang/mdBook) | `2015-07-07` | `2026-11-22` | ★ 22,321 | 3,375 | `2025` (688) | `v0.5.4` (2026-07-06) |

### GitHub 主分支历年提交活跃度表（`2015–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2015` | **205** | 29.8% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2016` | **154** | 22.4% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2017` | **438** | 63.7% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2018` | **324** | 47.1% | `████████░░░░░░░░` | 🔵 稳健迭代 |
| `2019` | **252** | 36.6% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2020` | **219** | 31.8% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **244** | 35.5% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2022` | **200** | 29.1% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2023` | **230** | 33.4% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **146** | 21.2% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **688** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2026` | **275** | 40.0% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **`src/SUMMARY.md` 单文件定义整本书结构**：阅读顺序与章节层级 100% 由一份纯 Markdown 列表文件决定，若列表中的 `.md` 尚不存在，构建时甚至会自动创建骨架文件。
2. **专注线性书籍场景**：内置 `mathjax-support = true` 与新版 GFM `> [!NOTE]` 支持，但界面高度固定为电子书形态，不适合多维产品门户定制。
