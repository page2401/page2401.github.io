---
title: "Docsify 特色档案 (v4 & v5)"
description: "零预编译浏览器端运行时渲染引擎：_sidebar.md 极简维护与 v5 原生 GFM Callouts 跨代进化。"
---

# Docsify 特色剖析（已挂载：`docsify-v4` / `docsify-v5`）

- **实测子站**：[docsify-v4 (`4.13.1`)](/docsify-v4/) · [docsify-v5 (`5.1.0`)](/docsify-v5/)
- **底层技术栈**：纯前端单页运行时（基于 `marked` 解析器，浏览器端动态 `fetch('*.md')` 实时渲染）

## 1. 最核心的差异化特色

1. **真正零 HTML 预编译**：无论仓库里有 10 篇还是 10,000 篇 `.md` 文档，都不需要漫长的构建期静态页面生成——只需一个 `index.html` 入口壳文件加上原始 `.md` 文件即可直接上线，CI 耗时恒定接近 0 秒。
2. **`_sidebar.md` 极低维护门槛**：不需要编写复杂的 JSON/TS 嵌套对象，直接用普通 Markdown 缩进无序列表维护侧边栏，产品经理与非研发写作者也能零门槛调整目录。
3. **Docsify v5 (`5.1.0`) 的重大跨代革新**：
   - **内核零插件原生支持 GFM Callouts**：v4 时代靠三方插件仍不支持 `[!IMPORTANT]` / `[!CAUTION]`，而 v5 已将全套 `> [!TYPE]` 编译逻辑内置进核心 `blockquote.js`；
   - **模块化暗色主题**：引入 `dist/themes/core.min.css` + `addons/core-dark.min.css` CSS 变量体系，原生支持深浅色切换。

## 2. 架构妥协与真实痛点

- **GitHub Pages `.nojekyll` 生死线**：因为 `_sidebar.md`、`_navbar.md`、`_coverpage.md` 全部以下划线开头，一旦忘记放置 `.nojekyll` 空文件，Jekyll 会直接屏蔽这些控制文件导致整站侧边栏 404 消失！
- **SEO 薄弱与客户端渲染瀑布流**：默认采用 `#/` Hash 路由，所有页面共享同一个空壳 `index.html`，对搜索引擎收录与社交卡片预览不友好；且遇到超长公式页时需在浏览器主线程实时计算。
- **v4 → v5 渲染器签名破坏性升级**：因底层升级新版 `marked`，`markdown.renderer.code` 由 `(code, lang)` 改为接收 Token 对象 `({ text, lang })`。

## 3. 最佳适用场景

团队内部手册、轻量级开源小工具文档、不想在文档仓库配置复杂 Node 编译环境的纯 Markdown 笔记发布。
