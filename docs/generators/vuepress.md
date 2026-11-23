---
title: "VuePress 特色与生命周期档案 (v1 & v2)"
description: "前端静态文档站鼻祖：v1 (2018–2023 EOL) 与 v2 (2020–至今持续活跃) 跨代生命周期与特色剖析。"
---

# VuePress 特色剖析（已挂载：`vuepress-v1` / `vuepress-v2`）

- **实测子站**：[vuepress-v1 (`1.9.10`)](/vuepress-v1/) · [vuepress-v2 (`2.0.0-rc.32`)](/vuepress-v2/)
- **上游仓库**：v1 为 `vuejs/vuepress`；v2 迁移至独立组织 `vuepress/core`
- **底层技术栈**：v1 为 Vue 2 + Webpack 4（CommonJS）；v2 重构为 Vue 3 + Vite / Webpack 5 双打包器可选（ESM）

## 生命周期档案

| 阶段指标 | `vuepress-v1` (`vuejs/vuepress`) | `vuepress-v2` (`vuepress/core`) |
| :--- | :--- | :--- |
| **开始时间** | `2018-04-05` 由尤雨溪首次开源发布 | `2020-05-06` 启动基于 Vue 3 的推倒重构 |
| **活跃时间** | `2018–2021` 为中文前端文档绝对霸主；`2022–2023` 仅做零星修补 | `2021–至今` 由社区核心团队持续高频迭代（`2.0.0-rc.32` 发布于 `2026-11-12`） |
| **废弃 / 演进时间** | **已实质废弃 / EOL**：末次发版 `v1.9.10` 定格在 **`2023-08-14`**，底层 Vue 2 于 **`2023-12-31`** 正式 EOL，仓库自 **`2024-08-07`** 后零提交冻结 | **无（当前活跃维护中）**；轻量新项目多已分流至 VitePress，重度插件项目继续留守 v2 |

## 1. 最核心的差异化特色

1. **开创 `README.md` 即目录首页的 GitHub 友好传统**：在 VuePress 哲学中，`docs/` 目录在未编译前就应该是一份能在 GitHub 网页端顺畅阅读的文档库，每个文件夹下的 `README.md` 既是 GitHub 目录导读，也是编译后的 `index.html`。
2. **v2 极其强大的官方一等公民插件矩阵（Official Ecosystem）**：这是 VuePress v2 相比 VitePress 最大的护城河！官方团队亲自维护 `@vuepress/plugin-markdown-hint`、`@vuepress/plugin-markdown-math`（一键切换 KaTeX / MathJax 4）与 `@vuepress/plugin-markdown-chart`（原生支持 Mermaid 12、ECharts、Flowchart、Markmap），彻底告别野生插件无人维护的痛点。
3. **显式 `.html` 路由后缀**：默认生成 `/01-annotations.html`，在任何对象存储、内网静态目录或老旧服务器上均不依赖服务端无后缀重写。

## 2. v1 与 v2 的跨代断层与痛点

- **v1 的沉重历史包袱**：本站实测安装 `vuepress@1.9.10` 拉取多达 **1,507 个 npm 包（含 115 个历史漏洞告警）**；在 Node 18/20/22 下因 Webpack 4 调用旧版哈希算法必须注入 `NODE_OPTIONS=--openssl-legacy-provider`；且默认缺失 `::: info` 容器与 GFM Alert。
- **v2 的漫长 RC 周期与碎片化版本号**：核心包与各官方插件虽功能完备，但长期处于 `2.0.0-rc.*` 阶段，不同 RC 小版本间偶有导出名变更（如 `defaultTheme` 改为 `themeDefault`），必须严格锁定精确版本号。

## 3. 最佳适用场景

**严禁新项目再选用 `vuepress-v1`**；若重度依赖丰富图表/数学/增强 Markdown 插件、或配合社区全能主题（如 `vuepress-theme-hope`）构建大型中文知识库，推荐选用 `vuepress-v2`。
