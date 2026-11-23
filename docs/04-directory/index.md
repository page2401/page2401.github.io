---
title: "04. 目录结构与路由取舍"
description: "标准 GFM 母版多级目录结构：检验派生至不同框架时如何处理首页命名、排序前缀与嵌套侧边栏。"
---

# 04. 目录结构与路由取舍（母版多级目录基准）

本章节在母版 `docs/04-directory/` 下建立了一个标准的多级嵌套子目录 `nested/`，用于检验同一套物理文档树在派生到五大不同目录流派时被迫发生的结构变形：

1. **母版结构（`docs/`）**：纯语义目录 + 相对路径 Markdown 文件链接（`./nested/01-order-and-url.md`），在本地编辑器、Obsidian 或 GitHub 网页端均可直接点击跳转阅读。
2. **派生变形实录**：
   - 派生至 **VitePress v1**：平铺至仓库根目录，需在配置中用 `srcExclude` 屏蔽仓库 `README.md`；
   - 派生至 **VitePress v2**：保留 `docs/` 但需将静态资源迁入 `docs/public/`，若启用 `rewrites` 抹除 `01-` 前缀则会破坏离线 `.md` 相对链接；
   - 派生至 **VuePress (v1 / v2)**：必须将目录入口 `index.md` 改名为 `README.md`，链接后缀改为 `.html`；
   - 派生至 **Astro Starlight**：整体深迁入 3 层前置目录 `src/content/docs/`，去掉 `01-` 文件名前缀改由 Frontmatter `order` 排序（导致物理文件树字母乱序，且 `autogenerate` 直接暴露英文目录名 `nested`）；
   - 派生至 **Docsify (v4 / v5)**：需额外创建 `_sidebar.md` 索引文件并强绑定 `.nojekyll`。

## 母版嵌套子文档入口

- [进入子文档 A：排序前缀与 URL 纯净度权衡](./nested/01-order-and-url.md)
- [进入子文档 B：多级子目录与侧边栏同步机制](./nested/02-sidebar-sync.md)
