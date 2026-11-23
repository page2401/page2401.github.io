---
title: "VuePress 特色档案 (v1 & v2)"
description: "前端静态文档站鼻祖：从 v1 Webpack 4 时代印记到 v2 官方一等公民插件矩阵的蜕变。"
---

# VuePress 特色剖析（已挂载：`vuepress-v1` / `vuepress-v2`）

- **实测子站**：[vuepress-v1 (`1.9.10`)](/vuepress-v1/) · [vuepress-v2 (`2.0.0-rc.32`)](/vuepress-v2/)
- **底层技术栈**：v1 为 Vue 2 + Webpack 4（CommonJS）；v2 重构为 Vue 3 + Vite / Webpack 5 双打包器可选（ESM）

## 1. 最核心的差异化特色

1. **开创 `README.md` 即目录首页的 GitHub 友好传统**：在 VuePress 哲学中，`docs/` 目录在未编译前就应该是一份能在 GitHub 网页端顺畅阅读的文档库，每个文件夹下的 `README.md` 既是 GitHub 目录导读，也是编译后的 `index.html`。
2. **v2 极其强大的官方一等公民插件矩阵（Official Ecosystem）**：这是 VuePress v2 相比 VitePress 最大的护城河！官方团队亲自维护 `@vuepress/plugin-markdown-hint`、`@vuepress/plugin-markdown-math`（一键切换 KaTeX / MathJax 4）与 `@vuepress/plugin-markdown-chart`（原生支持 Mermaid 12、ECharts、Flowchart、Markmap），彻底告别野生插件无人维护的痛点。
3. **显式 `.html` 路由后缀**：默认生成 `/01-annotations.html`，在任何对象存储、内网静态目录或老旧服务器上均不依赖服务端无后缀重写。

## 2. v1 与 v2 的跨代断层与痛点

- **v1 的沉重历史包袱**：本站实测安装 `vuepress@1.9.10` 拉取多达 **1,507 个 npm 包（含 115 个历史漏洞告警）**；在 Node 18/20/22 下因 Webpack 4 调用旧版哈希算法必须注入 `NODE_OPTIONS=--openssl-legacy-provider`；且默认缺失 `::: info` 容器与 GFM Alert。
- **v2 的漫长 RC 周期与碎片化版本号**：核心包与各官方插件虽功能完备，但长期处于 `2.0.0-rc.*` 阶段，不同 RC 小版本间偶有导出名变更（如 `defaultTheme` 改为 `themeDefault`），必须严格锁定精确版本号。

## 3. 最佳适用场景

重度依赖丰富图表/数学/增强 Markdown 插件、或者配合社区重型全能主题（如 `vuepress-theme-hope`）构建大型中文知识库与技术专栏。
