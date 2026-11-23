---
title: "zola 站点与生命周期档案 (Zola)"
description: "对应实测子模块 sites/zola：Rust 单二进制全能生成器生命周期、十年稳定提交曲线与 Tera 模板特色。"
---

# `zola` 站点档案（Zola · ★ 已挂载实测）

- **本地子模块路径**：`sites/zola` · **独立子站仓库**：[`page2401/zola`](https://github.com/page2401/zola) · **线上实测**：[`/zola/`](/zola/)（与本档案 `docs/sites/zola.md` 严格 1:1 对应）
- **上游官方仓库**：[`getzola/zola`](https://github.com/getzola/zola)
- **底层技术栈**：Rust 单二进制 + Tera 模板引擎（类 Jinja2）+ 内置 Sass / 搜索

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2016-12-06`** 创立开源（初名 Gutenberg，`2018` 更名为 Zola） |
| **活跃时间** | **`2017–至今` 连续十年稳健迭代**（每年保持 `120–520` 次主分支提交，`2026` 年已达 `226` 次提交） |
| **废弃 / 演进状态** | **无（持续活跃）** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/zola.json`](./zola.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://www.getzola.org/](https://www.getzola.org/) |
| **GitHub 源码仓库** | [getzola/zola](https://github.com/getzola/zola) |
| **包管理仓库 (Registry)** | [https://crates.io/crates/zola](https://crates.io/crates/zola) |
| **分类标签 (Tags)** | `#ssg` · `#rust` · `#single-binary` · `#zero-dependencies` · `#tera-templates` · `#jinja2-like` · `#pulldown-cmark` · `#builtin-sass` |
| **运行时与打包器** | Rust 单二进制可执行文件 · Zola All-in-One Binary（内置 grass Sass 编译） |
| **UI 与 Markdown 引擎** | Tera v2（v0.23 组件化模板引擎） · `pulldown-cmark` |
| **高亮与全文检索** | syntect / Giallo · 内置 elasticlunr 离线索引 |
| **数学公式与流程图库** | KaTeX / MathJax Shortcode 或前端脚本 ； Mermaid Shortcode |
| **核心依赖库 (Core Libs)** | `tera`、`pulldown-cmark`、`grass`、`syntect`、`elasticlunr-rs` |
| **本子站实测锁定版本** | `zola@0.23.6` · `tera@builtin` · `katex@0.19.1` · `mermaid@12.3.0` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`getzola/zola`](https://github.com/getzola/zola) | `2016-12-06` | `2026-11-23` | ★ 17,620 | 2,625 | `2018` (521) | `v0.23.6` (2026-09-12) |

### GitHub 主分支历年提交活跃度表（`2016–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2016` | **11** | 2.1% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2017` | **366** | 70.2% | `███████████░░░░░` | 🟢 高频活跃 |
| `2018` | **521** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2019` | **286** | 54.9% | `█████████░░░░░░░` | 🔵 稳健迭代 |
| `2020` | **296** | 56.8% | `█████████░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **271** | 52.0% | `████████░░░░░░░░` | 🔵 稳健迭代 |
| `2022` | **170** | 32.6% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2023` | **204** | 39.2% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **120** | 23.0% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **154** | 29.6% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2026` | **226** | 43.4% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **Rust 版“人性化 Hugo”**：同样具备单二进制零外部依赖与毫秒级编译优势，但采用类 Jinja2 的 Tera 模板语法，比 Hugo 的 Go Template 更容易上手。
2. **目录与方言取舍**：沿用 `content/` + `_index.md` 分支章节约定，提示框等富文本扩展需编写 Tera Shortcode（`{% callout(type="warning") %}...{% end %}`）。
