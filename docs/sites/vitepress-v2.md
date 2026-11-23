---
title: "vitepress-v2 站点与生命周期档案 (VitePress 2.0 Alpha)"
description: "对应子模块 sites/vitepress-v2：Vite 8 Rolldown 3.4 倍提速、srcDir 隔离与 GitHub 历年提交活跃度。"
---

# `vitepress-v2` 站点档案（VitePress 2.0 Alpha 预览版）

- **本地子模块路径**：`sites/vitepress-v2`（与本档案 `docs/sites/vitepress-v2.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/vitepress-v2`](https://github.com/page2401/vitepress-v2) · **线上实测**：[`/vitepress-v2/`](/vitepress-v2/)
- **跨代对照子站**：[`vitepress-v1` (1.6.4 稳定版)](./vitepress-v1.md)
- **锁定核心依赖**：`vitepress@2.0.0-alpha.21` + `vue@3.6.0-beta.10` + `markdown-it-mathjax3@4.3.2` + `mermaid@12.3.0`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | 上游 `vuejs/vitepress` 始于 `2020-04-30`；**`2025` 年正式开启 `2.0.0-alpha` 下一代打包管线分支** |
| **活跃时间** | **`2025–至今` 高频推进中**（`2026` 年已累计 `362` 次主分支提交，`2.0.0-alpha.21` 发布于 `2026-10-25`） |
| **废弃 / 演进状态** | **无（Vue 官方文档引擎下一代演进主线）**；目前仍带 `alpha` 标签，适合技术预研与尝鲜 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/vitepress-v2.json`](./vitepress-v2.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://vitepress.dev/](https://vitepress.dev/) |
| **GitHub 源码仓库** | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/vitepress](https://www.npmjs.com/package/vitepress) |
| **分类标签 (Tags)** | `#ssg` · `#vue3` · `#vite8` · `#rolldown` · `#rust-bundler` · `#markdown-it` · `#gfm-alerts` · `#mathjax3-svg` · `#mermaid12` · `#alpha` |
| **运行时与打包器** | Node.js >= 20 · Vite 8 + Rolldown (Rust) |
| **UI 与 Markdown 引擎** | Vue 3.6 Beta · `markdown-it` |
| **高亮与全文检索** | Shiki · MiniSearch（内置本地全文索引） |
| **数学公式与流程图库** | markdown-it-mathjax3@^4（构建期输出内联 SVG） ； 原生主题组件 MermaidBlock.vue + mermaid@12.3 |
| **核心依赖库 (Core Libs)** | `vite@8`、`rolldown`、`vue`、`markdown-it`、`shiki`、`minisearch` |
| **本子站实测锁定版本** | `vitepress@2.0.0-alpha.21` · `vue@3.5.13` · `markdown-it-mathjax3@4.3.2` · `mermaid@12.3.0` |

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

1. **Vite 8 Rolldown 带来 3.4 倍编译提速**：在完全一致的 5 章基准测试集下，构建耗时从 `vitepress-v1` 的 **28.4 秒骤降至 8.2 秒**。
2. **`srcDir: 'docs'` + `rewrites` 目录隔离实测**：无需再配 `srcExclude` 排除根 `README.md`，并可通过 `rewrites` 抹除本地排序前缀 `01-` 生成干净 URL；但暴露了两个真实副作用——**静态目录被迫从根 `public/` 迁入 `docs/public/`**，且重写后的链接破坏了编辑器离线跳转。
3. **抛弃旧三方插件直连 `mermaid@12.3.0`**：旧版 `vitepress-plugin-mermaid` 因 `peer vitepress@^1.0.0` 无法直接安装；本子站仅用 35 行原生主题扩展 `.vitepress/theme/MermaidBlock.vue` 即完美渲染最新 Mermaid 12 并支持深浅色实时重绘。
