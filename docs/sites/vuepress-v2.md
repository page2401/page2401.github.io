---
title: "vuepress-v2 站点与生命周期档案 (VuePress 2.0 RC)"
description: "对应子模块 sites/vuepress-v2：Vue 3 + Vite 重构版、官方插件矩阵仓库拆分与历年提交活跃度。"
---

# `vuepress-v2` 站点档案（VuePress 2.0 RC 现代重构版）

- **本地子模块路径**：`sites/vuepress-v2`（与本档案 `docs/sites/vuepress-v2.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/vuepress-v2`](https://github.com/page2401/vuepress-v2) · **线上实测**：[`/vuepress-v2/`](/vuepress-v2/)
- **跨代对照子站**：[`vuepress-v1` (1.9.10 EOL)](./vuepress-v1.md)
- **锁定核心依赖**：`vuepress@2.0.0-rc.32` + `@vuepress/bundler-vite@2.0.0-rc.32` + `@vuepress/theme-default@2.0.0-rc.141` + `@vuepress/plugin-markdown-{hint,math,chart}@2.0.0-rc.141`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2020-05-06`** 独立迁移至 `vuepress/core` 启动基于 Vue 3 + TypeScript 的彻底重写；**`2023-09-05`** 将官方主题与插件拆分至独立仓库 `vuepress/ecosystem` |
| **活跃时间** | **`2020–至今` 持续活跃维护**：前期（`2020–2022`）重心在 `vuepress/core`，后期（`2024–2026`）大量功能迭代集中在 `vuepress/ecosystem`（两仓 `2026` 年合计已超 `430` 次提交） |
| **废弃 / 演进状态** | **无（当前持续活跃）**；虽长期使用 `2.0.0-rc.*` 版本号，但工程质量成熟且 `0` 安全漏洞告警 |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

> [!NOTE]
> VuePress v2 自 `2023-09` 起采用 **核心引擎（`vuepress/core`）+ 官方主题与插件生态（`vuepress/ecosystem`）** 双仓库协同架构，单独看 `core` 会低估其真实迭代活跃度，因此下表同时列出两座官方仓库的 API 数据。

<!-- GITHUB_API_TABLE_START -->
> 数据源快照：[`docs/sites/github-activity.json`](./github-activity.json)（GitHub GraphQL API 采样日期：`2026-11-23`）

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`vuepress/core`](https://github.com/vuepress/core) | `2020-05-06` | `2026-11-23` | ★ 2,833 | 2,071 | `2021` (705) | `v2.0.0-rc.32` (2026-11-12) |
| [`vuepress/ecosystem`](https://github.com/vuepress/ecosystem) | `2023-09-05` | `2026-11-23` | ★ 61 | 1,511 | `2024` (674) | `v2.0.0-rc.141` (2026-11-23) |

### 双仓库协同历年提交活跃度表（`2020–2026`）

| 年份 | `vuepress/core` | `vuepress/ecosystem` | 合计提交 | 合计活跃趋势条 |
| :--- | ---: | ---: | ---: | :--- |
| `2020` | 510 | — | **510** | `█████████░░░░░░░` |
| `2021` | 705 | — | **705** | `█████████████░░░` |
| `2022` | 375 | — | **375** | `███████░░░░░░░░░` |
| `2023` | 150 | 7 | **157** | `███░░░░░░░░░░░░░` |
| `2024` | 217 | 674 | **891** | `████████████████` |
| `2025` | 47 | 466 | **513** | `█████████░░░░░░░` |
| `2026` | 67 | 364 | **431** | `████████░░░░░░░░` |
<!-- GITHUB_API_TABLE_END -->

## 3. 本子站实测特色与工程取舍

1. **业界最省心的官方一等公民 Markdown 插件矩阵**：区别于 VitePress 需要自写组件或找野生插件，VuePress v2 官方团队在 `vuepress/ecosystem` 中统一维护了 `plugin-markdown-hint`（完整支持 `::: info/note/tip/important/warning/caution` 与 GFM `> [!NOTE]`）、`plugin-markdown-math`（KaTeX 0.19 / MathJax 4 一键切换）与 `plugin-markdown-chart`（原生直连 `mermaid@12.3.0`）。
2. **`README.md` 即目录首页 + `.html` 显式后缀**：延续 GitHub 原生目录导读传统，部署在任意静态对象存储子路径下均零路由歧义。
3. **RC 阶段导出名细节**：升级至 `@vuepress/theme-default@2.0.0-rc.141` 时，导出函数名已由旧版 `defaultTheme` 规范化为 `themeDefault`，配置子包版本需严格对齐。
