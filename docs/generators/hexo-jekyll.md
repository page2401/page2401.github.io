---
title: "Hexo & Jekyll 特色档案"
description: "初代静态站点双雄：GitHub Pages 幕后引擎 Jekyll (.nojekyll 的由来) 与中文博客启蒙者 Hexo。"
---

# Hexo & Jekyll 特色剖析（图鉴收录 · 经典静态博客双雄）

## 1. Jekyll（Ruby · GitHub Pages 的初代默认引擎）

- **历史地位与 `.nojekyll` 之谜**：GitHub 创始人用 Ruby 编写了 Jekyll 并将其内置为 GitHub Pages 的默认后台编译器。Jekyll 约定所有以 `_` 开头的目录（`_posts`、`_layouts`、`_includes`、`_sass`）都是服务端源码目录而非公开静态资源——**这正是为什么现代框架（如 Astro 的 `/_astro/` 和 Docsify 的 `_sidebar.md`）部署到 GitHub Pages 分支时必须放置 `.nojekyll` 空文件来关停 Jekyll，否则下划线资源会全部 404！**
- **局限**：面向按日期归档的博客（`2026-11-22-title.md`）而非多级树状技术文档；Ruby Gem 原生扩展在现代开发机上环境配置较为繁琐。

## 2. Hexo（Node.js · 中文独立技术博客普及者）

- **核心特色**：以 `hexo new` / `hexo g` / `hexo d` 三板斧和极其庞大的个性化博客主题生态（NexT、Butterfly、Fluid 等）成为一代中文开发者的建站启蒙。
- **方言与局限**：发明了独有的 Tag Plugins 标签语法（如 `{% note info %}...{% endnote %}`），与现代 CommonMark/GFM 互不兼容；核心数据结构围绕时间线文章流（Posts / Tags / Categories）设计，不适合维护深层嵌套的结构化产品手册。
