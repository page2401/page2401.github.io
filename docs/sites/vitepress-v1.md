---
title: "vitepress-v1 站点与生命周期档案 (VitePress 1.x)"
description: "对应子模块 sites/vitepress-v1：Vue 3 + Rollup 稳定版技术选型、生命周期与 GitHub 历年提交活跃度。"
---

# `vitepress-v1` 站点档案（VitePress 1.x 稳定版）

- **本地子模块路径**：`sites/vitepress-v1`（与本档案 `docs/sites/vitepress-v1.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/vitepress-v1`](https://github.com/page2401/vitepress-v1) · **线上实测**：[`/vitepress-v1/`](/vitepress-v1/)
- **跨代对照子站**：[`vitepress-v2` (Vite 8 Rolldown Alpha)](./vitepress-v2.md)
- **锁定核心依赖**：`vitepress@1.6.4` + `markdown-it-mathjax3@4.3.2` + `vitepress-plugin-mermaid@2.0.17` + `mermaid@11.17.2`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | 上游 `vuejs/vitepress` 于 **`2020-04-30`** 立项开源；历经四年打磨于 `2024-03` 正式发布 `v1.0.0` |
| **活跃时间** | **`2022–2025` 为绝对生产主力期**（`2023` 年达历史提交峰值 `824` 次，当前稳定锁定 `1.6.4`） |
| **废弃 / 演进状态** | **未废弃（当前生产环境首选稳定版）**；新架构特性已转向 [`vitepress-v2`](./vitepress-v2.md)，待 `2.0` 正式转正后 `1.x` 将转入安全维护 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/vitepress-v1.json`](./vitepress-v1.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://vitepress.dev/](https://vitepress.dev/) |
| **GitHub 源码仓库** | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/vitepress](https://www.npmjs.com/package/vitepress) |
| **分类标签 (Tags)** | `#ssg` · `#vue3` · `#vite` · `#rollup` · `#markdown-it` · `#gfm-alerts` · `#mathjax3-svg` · `#minisearch` · `#clean-urls` · `#stable` |
| **运行时与打包器** | Node.js >= 18 · Vite 5 + Rollup |
| **UI 与 Markdown 引擎** | Vue 3 · `markdown-it` |
| **高亮与全文检索** | Shiki · MiniSearch（内置本地全文索引） |
| **数学公式与流程图库** | markdown-it-mathjax3@^4（构建期输出内联 SVG） ； vitepress-plugin-mermaid + mermaid@11 |
| **核心依赖库 (Core Libs)** | `vite`、`vue`、`markdown-it`、`shiki`、`minisearch` |
| **本子站实测锁定版本** | `vitepress@1.6.4` · `markdown-it-mathjax3@4.3.2` · `vitepress-plugin-mermaid@2.0.17` · `mermaid@11.17.2` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`vuejs/vitepress`](https://github.com/vuejs/vitepress) | `2020-04-30` | `2026-11-12` | ★ 18,521 | 2,958 | `2023` (824) | `v2.0.0-alpha.21` (2026-10-25) |

### GitHub 主分支历年提交活跃度表（`2020–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2020` | **334** | 40.5% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **260** | 31.6% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2022` | **554** | 67.2% | `███████████░░░░░` | 🟢 高频活跃 |
| `2023` | **824** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2024` | **369** | 44.8% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **255** | 30.9% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2026` | **362** | 43.9% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
<!-- GITHUB_API_TABLE_END -->

## 3. 本子站实测特色与工程取舍

1. **双轨标注兼容度极佳**：同时原生支持 `::: info / tip / warning / danger / details` 容器与标准 GitHub `> [!NOTE]` 五类引用警报，从母版 `docs/*.md` 派生的正文改造成本极低。
2. **构建期 MathJax 3 内联 SVG 公式**：开启 `markdown: { math: true }` 并配合 `markdown-it-mathjax3@4.3.2`（注：`peerOptional` 限定 `^4`，不兼容 `5.x`），编译后直接输出矢量 `<svg>`，客户端零字体网络请求。
3. **根目录平铺模型的利弊**：`sites/vitepress-v1` 实测了「仓库根目录直接放 `*.md`」的零层级方案，本地目录最浅，但必须在 `.vitepress/config.mts` 声明 `srcExclude: ['README.md']` 防止把仓库说明页误编译进站点。
4. **三方 Mermaid 插件锁版本边界**：`vitepress-plugin-mermaid@2.0.17` 的 `peerDependencies` 将 `mermaid` 锁在 `10 || 11`，无法升级至 `mermaid@12`。
