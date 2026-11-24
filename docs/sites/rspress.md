---
title: "rspress 站点与生命周期档案 (Rspress v2)"
description: "对应实测子模块 sites/rspress：字节跳动 Rust Rspack 超高速文档框架生命周期与 GitHub 提交活跃度。"
---

# `rspress` 站点档案（Rspress v2 · ★ 已挂载实测）

- **本地子模块路径**：`sites/rspress` · **独立子站仓库**：[`page2401/rspress`](https://github.com/page2401/rspress) · **线上实测**：[`/rspress/`](/rspress/)（与本档案 `docs/sites/rspress.md` 严格 1:1 对应）
- **上游官方仓库**：[`web-infra-dev/rspress`](https://github.com/web-infra-dev/rspress)
- **底层技术栈**：Rust Rspack + React + `mdx-rs`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2023-06-27`** 由字节跳动 Web Infra 团队开源立项 |
| **活跃时间** | **`2023–至今` 持续处于极高研发增速期**（`2023` 至 `2026` 每年稳定贡献 `530–875` 次提交，`v2.1.4` 刚于 `2026-11-19` 发布） |
| **废弃 / 演进状态** | `v1` 已演进至 **`v2.x`（当前极度活跃，无任何废弃风险）** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/rspress.json`](./rspress.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://rspress.rs/](https://rspress.rs/) |
| **GitHub 源码仓库** | [web-infra-dev/rspress](https://github.com/web-infra-dev/rspress) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/@rspress/core](https://www.npmjs.com/package/@rspress/core) |
| **分类标签 (Tags)** | `#ssg` · `#react` · `#rust-toolchain` · `#rspack` · `#mdx-rs` · `#meta-json` · `#gfm-alerts` · `#fast-build` · `#bytedance` |
| **运行时与打包器** | Node.js >= 18 · @rspack/core (Rust) |
| **UI 与 Markdown 引擎** | React 18 / 19 · `@rspress/mdx-rs（Rust MDX 编译器）` |
| **高亮与全文检索** | Shiki · 内置本地搜索索引 / Algolia |
| **数学公式与流程图库** | rspress-plugin-katex@1.0.1 ； rspress-plugin-mermaid |
| **核心依赖库 (Core Libs)** | `@rspress/core`、`@rspack/core`、`@rspress/mdx-rs`、`react`、`shiki` |
| **本子站实测锁定版本** | `@rspress/core@2.1.4` · `rspress-plugin-katex@1.0.1` · `rspress-plugin-mermaid@2.0.0` · `react@19.3.1` · `katex@0.19.1` · `mermaid@12.3.0` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **11.80 s (11,805 ms)** | 164 | 7197.1 KB | 204.5 KB | 5790.8 KB / **1642.5 KB** | 99.2 KB / 21.1 KB | `6` 个 | Rspress 内置静态索引 · `llms.txt` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`web-infra-dev/rspress`](https://github.com/web-infra-dev/rspress) | `2023-06-27` | `2026-11-23` | ★ 2,361 | 2,937 | `2025` (875) | `v2.1.4` (2026-11-19) |

### GitHub 主分支历年提交活跃度表（`2023–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2023` | **534** | 61.0% | `██████████░░░░░░` | 🟢 高频活跃 |
| `2024` | **782** | 89.4% | `██████████████░░` | 🟢 高频活跃 |
| `2025` | **875** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2026` | **746** | 85.3% | `██████████████░░` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **Rust 编译管线解决大型 React 文档慢构建痛点**：借助 Rspack 与 Rust 版 MDX 编译器，构建速度比传统 JS 打包管线快 5~10 倍。
2. **`_meta.json` 声明式目录编排 + 双标注兼容**：支持在各目录放置 `_meta.json` 控制排序与中文分组标题，并同时兼容 `:::tip` 容器与 GitHub `> [!NOTE]` 警报语法。
