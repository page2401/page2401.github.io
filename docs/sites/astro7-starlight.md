---
title: "astro7-starlight 站点与生命周期档案 (Astro 7 + Starlight)"
description: "对应子模块 sites/astro7-starlight：孤岛架构文档标杆、Sätteri 解析器变革与双仓库 GitHub 提交活跃度。"
---

# `astro7-starlight` 站点档案（Astro 7 + Starlight 0.43）

- **本地子模块路径**：`sites/astro7-starlight`（与本档案 `docs/sites/astro7-starlight.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/astro7-starlight`](https://github.com/page2401/astro7-starlight) · **线上实测**：[`/astro7-starlight/`](/astro7-starlight/)
- **锁定核心依赖**：`astro@7.4.13` + `@astrojs/starlight@0.43.1` + `@astrojs/markdown-remark@7.3.10` + `remark-math@6.0.0` + `rehype-katex@7.0.1` + `mermaid@12.3.0`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | 母引擎 `withastro/astro` 始于 `2021-03-15`；独立官方文档框架 **`withastro/starlight` 于 `2023-03-16` 创立开源** |
| **活跃时间** | **`2023–至今` 保持全行业顶级研发密度**（`starlight` 年均提交 `600–1,300+` 次，母引擎 `astro` 仅 `2026` 年即高达 `2,223` 次提交） |
| **废弃 / 演进状态** | **无（当前最活跃的新一代文档框架之一）**；注：Astro 早期旧 `docs` 模板已于 `2023` 废弃，且 Starlight 处于 `0.x` 快速演进期，次版本升级需关注 Changelog |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

> [!NOTE]
> `astro7-starlight` 由官方文档层 `withastro/starlight` 与底层内容引擎 `withastro/astro` 共同驱动，下表同时保留两座官方仓库的 GitHub API 历年提交记录。

<!-- GITHUB_API_TABLE_START -->
> 数据源快照：[`docs/sites/github-activity.json`](./github-activity.json)（GitHub GraphQL API 采样日期：`2026-11-23`）

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`withastro/starlight`](https://github.com/withastro/starlight) | `2023-03-16` | `2026-11-21` | ★ 9,640 | 3,942 | `2023` (1,336) | `@astrojs/starlight@0.43.1` (2026-11-13) |
| [`withastro/astro`](https://github.com/withastro/astro) | `2021-03-15` | `2026-11-23` | ★ 64,144 | 15,467 | `2023` (3,622) | `@astrojs/node@11.1.14` (2026-11-18) |

### 双仓库协同历年提交活跃度表（`2021–2026`）

| 年份 | `withastro/starlight` | `withastro/astro` | 合计提交 | 合计活跃趋势条 |
| :--- | ---: | ---: | ---: | :--- |
| `2021` | — | 1,991 | **1,991** | `██████░░░░░░░░░░` |
| `2022` | — | 3,461 | **3,461** | `███████████░░░░░` |
| `2023` | 1,336 | 3,622 | **4,958** | `████████████████` |
| `2024` | 1,272 | 2,797 | **4,069** | `█████████████░░░` |
| `2025` | 706 | 1,373 | **2,079** | `███████░░░░░░░░░` |
| `2026` | 628 | 2,223 | **2,851** | `█████████░░░░░░░` |
<!-- GITHUB_API_TABLE_END -->

## 3. 本子站实测特色与 Astro 7 关键排障经验

1. **Content Layer Zod 强类型校验 + Pagefind 内置全文检索**：`src/content.config.ts` 在构建期拦截任何元数据拼写错误，打包自动产出按需分片加载的 Pagefind 中文静态搜索索引。
2. **Astro 7 默认解析器切换（Sätteri）排障**：升级 `astro@7.4.13` 后默认 Markdown 解析器换为 Sätteri，配置 `remark-math` + `rehype-katex` 时**必须显式安装 `@astrojs/markdown-remark`**，否则构建报错找不到模块。
3. **目录模型双刃剑**：强制 3 层前置目录 `src/content/docs/` 物理隔离极干净，且支持 `items: [{ autogenerate }]` + `sidebar.order` 免序号污染 URL；但本地文件按字母序与阅读序倒挂，且自动扫描子目录会直接暴露英文目录名 `nested`。
