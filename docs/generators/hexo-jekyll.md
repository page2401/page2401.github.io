---
title: "Hexo & Jekyll 特色与生命周期档案"
description: "初代静态站点双雄：Jekyll (2008 至今) 与 Hexo (2012 至今) 的历史黄金期与现代演进定位。"
---

# Hexo & Jekyll 特色剖析（图鉴收录 · 经典静态博客双雄）

## 生命周期档案对照

| 阶段指标 | Jekyll (`jekyll/jekyll`) | Hexo (`hexojs/hexo`) |
| :--- | :--- | :--- |
| **开始时间** | **`2008-10-20`**（由 GitHub 联合创始人 Tom Preston-Werner 创立，SSG 概念鼻祖） | **`2012-09-23`**（由中国台湾开发者 Tommy Chen 创立） |
| **活跃时间** | **`2009–2017` 为全球静态站黄金统治期**；`2018–至今` 处于**保守低频维护态**（最近提交 `2026-10-13`） | **`2014–2020` 为中文独立技术博客黄金统治期**；`2021–至今` 处于社区低频维护态（`v7.x`，最近提交 `2026-10-26`） |
| **废弃 / 演进时间** | **核心未正式废弃**（因深度绑定 GitHub Pages 默认构建而长期存续），但**在现代技术文档站选型中已基本退场**（甚至连 GitHub 官方文档也早已迁离 Jekyll） | **核心未正式废弃**，但**大量早期知名三方博客主题（`2015–2019`）已断更废弃**，且在结构化技术文档场景已被 VitePress / Starlight 等全面替代 |

---

## 1. Jekyll（Ruby · GitHub Pages 的初代默认引擎）

- **历史地位与 `.nojekyll` 之谜**：GitHub 创始人用 Ruby 编写了 Jekyll 并将其内置为 GitHub Pages 的默认后台编译器。Jekyll 约定所有以 `_` 开头的目录（`_posts`、`_layouts`、`_includes`、`_sass`）都是服务端源码目录而非公开静态资源——**这正是为什么现代框架（如 Astro 的 `/_astro/` 和 Docsify 的 `_sidebar.md`）部署到 GitHub Pages 分支时必须放置 `.nojekyll` 空文件来关停 Jekyll，否则下划线资源会全部 404！**
- **局限**：面向按日期归档的博客（`2026-11-22-title.md`）而非多级树状技术文档；Ruby Gem 原生扩展在现代开发机上环境配置较为繁琐。

## 2. Hexo（Node.js · 中文独立技术博客普及者）

- **核心特色**：以 `hexo new` / `hexo g` / `hexo d` 三板斧和极其庞大的个性化博客主题生态（NexT、Butterfly、Fluid 等）成为一代中文开发者的建站启蒙。
- **方言与局限**：发明了独有的 Tag Plugins 标签语法（如 `{% note info %}...{% endnote %}`），与现代 CommonMark/GFM 互不兼容；核心数据结构围绕时间线文章流（Posts / Tags / Categories）设计，不适合维护深层嵌套的结构化产品手册。
