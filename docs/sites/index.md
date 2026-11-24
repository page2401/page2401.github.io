---
title: "docs/sites/ 站点元数据 JSON、构建性能与 GitHub 活跃度总览（26 款）"
description: "与 sites/<id> 严格 1:1 对齐的 26 组 <id>.md + <id>.json（涵盖 18 个跨语言实测挂载子站 + 8 个主流生态图鉴位，含空缓存冷构建 benchmark 节点与 2008–2026 GitHub 历年提交节点）。"
---

# `docs/sites/` 站点独立元数据 JSON、构建性能与 GitHub 活跃度总览（26 款）

本目录（`docs/sites/`）与仓库子模块目录 **`sites/<id>` 严格保持 1:1 对齐**，当前共收录 **26 款主流静态网站生成器 / 大版本**（包含 **18 个跨语言同源实测子站** 与 **8 个生态图鉴预留位**），每个站点均成对维护两份文件：

1. **结构化元数据与实测数据文件 `docs/sites/<id>.json`**：
   - **站点自身元数据**：`websiteUrl`（官方网站）、`githubUrl`（GitHub 源码地址）、`packageUrl`（包仓库地址）、`tags`（特性与流派标签数组）、`lifecycle`（开始 / 活跃 / 废弃时间）、`libs`（运行时、打包器、UI 框架、Markdown 引擎、代码高亮、全文检索、公式与图表库及 `coreLibs` / `pinnedPackages`）；
   - **`benchmark` 节点**（已挂载实测子站）：通过 `npm run sync:benchmarks`（[`scripts/measure-benchmarks.mjs`](https://github.com/page2401/page2401.github.io/blob/main/scripts/measure-benchmarks.mjs)）在同一环境空缓存实测的冷构建耗时（`coldBuildMs`）、总产物大小、HTML/JS/CSS/字体拆分、Gzip 体积、正文 `<script>` 数及离线搜索索引形态；
   - **`github` 节点**：通过 `npm run sync:github`（[`scripts/fetch-github-activity.mjs`](https://github.com/page2401/page2401.github.io/blob/main/scripts/fetch-github-activity.mjs)）查询 GitHub GraphQL API 持久化的仓库统计与 `2008–2026` 历年提交数。
2. **深度剖析文档 `docs/sites/<id>.md`**：自动读取同名 `./<id>.json` 渲染元数据卡片、构建性能实测表与历年提交活跃度表格，并补充架构优劣与排障实录。

---

## 1. 上游 GitHub 仓库历年提交数全景表（2008–2026 · 27 座官方仓）

<!-- GITHUB_API_INDEX_START -->
> 数据聚合自本目录下 26 个独立的 `docs/sites/<id>.json` 中的 `github` 节点（采样日期：`2026-11-23`）。粗体为单年历史峰值，`·` 表示当年尚未建仓。

| 上游 GitHub 仓库 | 1:1 关联档案 & JSON | 立项月份 | Stars | 总提交 | `08-15`累计 | `16年` | `17年` | `18年` | `19年` | `20年` | `21年` | `22年` | `23年` | `24年` | `25年` | `26年` |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [`vuejs/vitepress`](https://github.com/vuejs/vitepress) | [`vitepress-v1`](./vitepress-v1.md)([json](./vitepress-v1.json)) [`vitepress-v2`](./vitepress-v2.md)([json](./vitepress-v2.json)) | `2020-04` | ★ 18,521 | 2,958 | · | · | · | · | · | 334 | 260 | 554 | **824** | 369 | 255 | 362 |
| [`vuejs/vuepress`](https://github.com/vuejs/vuepress) | [`vuepress-v1`](./vuepress-v1.md)([json](./vuepress-v1.json)) | `2018-04` | ★ 22,715 | 2,152 | · | · | · | **1297** | 521 | 202 | 92 | 16 | 23 | 1 | 0 | 0 |
| [`vuepress/core`](https://github.com/vuepress/core) | [`vuepress-v2`](./vuepress-v2.md)([json](./vuepress-v2.json)) | `2020-05` | ★ 2,833 | 2,071 | · | · | · | · | · | 510 | **705** | 375 | 150 | 217 | 47 | 67 |
| [`vuepress/ecosystem`](https://github.com/vuepress/ecosystem) | [`vuepress-v2`](./vuepress-v2.md)([json](./vuepress-v2.json)) | `2023-09` | ★ 61 | 1,511 | · | · | · | · | · | · | · | · | 7 | **674** | 466 | 364 |
| [`docsifyjs/docsify`](https://github.com/docsifyjs/docsify) | [`docsify-v4`](./docsify-v4.md)([json](./docsify-v4.json)) [`docsify-v5`](./docsify-v5.md)([json](./docsify-v5.json)) | `2016-11` | ★ 31,609 | 2,025 | · | 175 | **657** | 208 | 135 | 299 | 102 | 68 | 132 | 54 | 87 | 108 |
| [`withastro/starlight`](https://github.com/withastro/starlight) | [`astro7-starlight`](./astro7-starlight.md)([json](./astro7-starlight.json)) | `2023-03` | ★ 9,641 | 3,945 | · | · | · | · | · | · | · | · | **1336** | 1272 | 706 | 631 |
| [`withastro/astro`](https://github.com/withastro/astro) | [`astro7-starlight`](./astro7-starlight.md)([json](./astro7-starlight.json)) | `2021-03` | ★ 64,144 | 15,468 | · | · | · | · | · | · | 1991 | 3461 | **3622** | 2797 | 1373 | 2224 |
| [`meta/docusaurus`](https://github.com/meta/docusaurus) | [`docusaurus-v3`](./docusaurus-v3.md)([json](./docusaurus-v3.json)) | `2017-06` | ★ 66,788 | 7,118 | · | · | 556 | 693 | 879 | 1084 | **1139** | 1085 | 350 | 400 | 290 | 642 |
| [`gohugoio/hugo`](https://github.com/gohugoio/hugo) | [`hugo`](./hugo.md)([json](./hugo.json)) | `2013-07` | ★ 90,552 | 10,107 | 1,820 | **1057** | 986 | 1025 | 567 | 703 | 575 | 633 | 658 | 730 | 652 | 701 |
| [`squidfunk/mkdocs-material`](https://github.com/squidfunk/mkdocs-material) | [`mkdocs-material`](./mkdocs-material.md)([json](./mkdocs-material.json)) | `2016-01` | ★ 27,643 | 6,794 | · | 240 | 656 | 195 | 502 | **1321** | 1004 | 882 | 1171 | 484 | 250 | 89 |
| [`web-infra-dev/rspress`](https://github.com/web-infra-dev/rspress) | [`rspress`](./rspress.md)([json](./rspress.json)) | `2023-06` | ★ 2,361 | 2,937 | · | · | · | · | · | · | · | · | 534 | 782 | **875** | 746 |
| [`shuding/nextra`](https://github.com/shuding/nextra) | [`nextra`](./nextra.md)([json](./nextra.json)) | `2020-06` | ★ 13,956 | 2,332 | · | · | · | · | · | 93 | 221 | 577 | **578** | 300 | 553 | 10 |
| [`getzola/zola`](https://github.com/getzola/zola) | [`zola`](./zola.md)([json](./zola.json)) | `2016-12` | ★ 17,620 | 2,625 | · | 11 | 366 | **521** | 286 | 296 | 271 | 170 | 204 | 120 | 154 | 226 |
| [`rust-lang/mdBook`](https://github.com/rust-lang/mdBook) | [`mdbook`](./mdbook.md)([json](./mdbook.json)) | `2015-07` | ★ 22,321 | 3,375 | 205 | 154 | 438 | 324 | 252 | 219 | 244 | 200 | 230 | 146 | **688** | 275 |
| [`hexojs/hexo`](https://github.com/hexojs/hexo) | [`hexo`](./hexo.md)([json](./hexo.json)) | `2012-09` | ★ 41,782 | 3,769 | 2,247 | 86 | 120 | 204 | 462 | 333 | 43 | 90 | 44 | 45 | 51 | 44 |
| [`jekyll/jekyll`](https://github.com/jekyll/jekyll) | [`jekyll`](./jekyll.md)([json](./jekyll.json)) | `2008-10` | ★ 51,793 | 11,881 | 6,369 | 2106 | 1044 | 743 | 452 | 517 | 202 | 163 | 109 | 97 | 55 | 24 |
| [`11ty/buildawesome`](https://github.com/11ty/buildawesome) | [`eleventy`](./eleventy.md)([json](./eleventy.json)) | `2017-11` | ★ 20,055 | 3,972 | · | · | 135 | 488 | 346 | 293 | 424 | 458 | 252 | **597** | 530 | 449 |
| [`fuma-nama/fumadocs`](https://github.com/fuma-nama/fumadocs) | [`fumadocs`](./fumadocs.md)([json](./fumadocs.json)) | `2023-07` | ★ 13,697 | 6,343 | · | · | · | · | · | · | · | · | 1223 | **1927** | 1729 | 1464 |
| [`jackyzha0/quartz`](https://github.com/jackyzha0/quartz) | [`quartz`](./quartz.md)([json](./quartz.json)) | `2021-07` | ★ 13,619 | 2,141 | · | · | · | · | · | · | 82 | 297 | 462 | **539** | 232 | 529 |
| [`nuxt/content`](https://github.com/nuxt/content) | [`nuxt-content`](./nuxt-content.md)([json](./nuxt-content.json)) | `2020-03` | ★ 3,682 | 3,538 | · | · | · | · | · | **873** | 362 | 713 | 344 | 523 | 562 | 161 |
| [`gatsbyjs/gatsby`](https://github.com/gatsbyjs/gatsby) | [`gatsby`](./gatsby.md)([json](./gatsby.json)) | `2015-05` | ★ 55,915 | 21,877 | 217 | 689 | 2236 | 4404 | **5698** | 4289 | 2088 | 1354 | 624 | 115 | 48 | 115 |
| [`GitbookIO/gitbook`](https://github.com/GitbookIO/gitbook) | [`gitbook`](./gitbook.md)([json](./gitbook.json)) | `2014-03` | ★ 29,106 | 2,543 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 169 | 579 | **1037** | 758 |
| [`honkit/honkit`](https://github.com/honkit/honkit) | [`honkit`](./honkit.md)([json](./honkit.json)) | `2020-06` | ★ 3,532 | 3,495 | · | · | · | · | · | 812 | 57 | 60 | 54 | 28 | 27 | 41 |
| [`sphinx-doc/sphinx`](https://github.com/sphinx-doc/sphinx) | [`sphinx`](./sphinx.md)([json](./sphinx.json)) | `2015-01` | ★ 8,104 | 22,461 | 5,470 | 1757 | 2010 | **2633** | 1729 | 2582 | 2059 | 1117 | 692 | 1146 | 775 | 62 |
| [`executablebooks/MyST-Parser`](https://github.com/executablebooks/MyST-Parser) | [`sphinx`](./sphinx.md)([json](./sphinx.json)) | `2020-02` | ★ 904 | 594 | · | · | · | · | · | **209** | 95 | 64 | 95 | 49 | 17 | 65 |
| [`getpelican/pelican`](https://github.com/getpelican/pelican) | [`pelican`](./pelican.md)([json](./pelican.json)) | `2010-10` | ★ 13,378 | 4,045 | 2,625 | 144 | 90 | 200 | 171 | 187 | 112 | 62 | 182 | 139 | 74 | 59 |
| [`lumeland/lume`](https://github.com/lumeland/lume) | [`lume`](./lume.md)([json](./lume.json)) | `2020-09` | ★ 2,284 | 4,614 | · | · | · | · | · | 214 | **957** | 831 | 716 | 612 | 609 | 675 |
<!-- GITHUB_API_INDEX_END -->

---

## 2. 已挂载跨语言实测子站（18 个 · 与 `sites/<id>` 1:1 对应）

| 站点 ID (`sites/<id>`) | 档案与独立 JSON | 底层语言 / 管线 | 线上实测路径 | 开始时间 | 活跃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/vitepress-v1` | [`vitepress-v1.md`](./vitepress-v1.md) · [`json`](./vitepress-v1.json) | Node · Vue 3 + Rollup | [`/vitepress-v1/`](/vitepress-v1/) | `2020-04-30` | 2022–至今主力稳定 |
| `sites/vitepress-v2` | [`vitepress-v2.md`](./vitepress-v2.md) · [`json`](./vitepress-v2.json) | Node · Vite 8 Rolldown | [`/vitepress-v2/`](/vitepress-v2/) | `2025-01` | v2 Rolldown 高频推进 |
| `sites/vuepress-v1` | [`vuepress-v1.md`](./vuepress-v1.md) · [`json`](./vuepress-v1.json) | Node · Vue 2 + Webpack 4 | [`/vuepress-v1/`](/vuepress-v1/) | `2018-04-05` | **已实质废弃 EOL**（25–26 零提交） |
| `sites/vuepress-v2` | [`vuepress-v2.md`](./vuepress-v2.md) · [`json`](./vuepress-v2.json) | Node · Vue 3 + Vite | [`/vuepress-v2/`](/vuepress-v2/) | `2020-05-06` | `core` + `ecosystem` 双仓活跃 |
| `sites/docsify-v4` | [`docsify-v4.md`](./docsify-v4.md) · [`json`](./docsify-v4.json) | Browser SPA Runtime | [`/docsify-v4/`](/docsify-v4/) | `2016-11-20` | **2026-07 起被 v5 替代淘汰** |
| `sites/docsify-v5` | [`docsify-v5.md`](./docsify-v5.md) · [`json`](./docsify-v5.json) | Browser SPA Runtime | [`/docsify-v5/`](/docsify-v5/) | `2025-05-27` | 2025–2026 显著复苏活跃 |
| `sites/astro7-starlight` | [`astro7-starlight.md`](./astro7-starlight.md) · [`json`](./astro7-starlight.json) | Node · Astro 7 Islands | [`/astro7-starlight/`](/astro7-starlight/) | `2023-03-16` | 顶级高频上升期 |
| `sites/docusaurus-v3` | [`docusaurus-v3.md`](./docusaurus-v3.md) · [`json`](./docusaurus-v3.json) | Node · React + MDX 3 | [`/docusaurus-v3/`](/docusaurus-v3/) | `2017-06-20` | v1/v2 淘汰；v3 主力活跃 |
| `sites/rspress` | [`rspress.md`](./rspress.md) · [`json`](./rspress.json) | Rust Rspack + React | [`/rspress/`](/rspress/) | `2023-06-27` | v2.x 极高频迭代上升 |
| `sites/hugo` | [`hugo.md`](./hugo.md) · [`json`](./hugo.json) | Go 单二进制 + Goldmark | [`/hugo/`](/hugo/) | `2013-07-04` | 十三年常青高频活跃 |
| `sites/mkdocs-material` | [`mkdocs-material.md`](./mkdocs-material.md) · [`json`](./mkdocs-material.json) | Python + `pymdownx` | [`/mkdocs-material/`](/mkdocs-material/) | `2016-01-28` | v8 停更；v9.8 成熟活跃 |
| `sites/mdbook` | [`mdbook.md`](./mdbook.md) · [`json`](./mdbook.json) | Rust 单二进制 + `SUMMARY.md` | [`/mdbook/`](/mdbook/) | `2015-07-07` | Rust 官方长青活跃 |
| `sites/zola` | [`zola.md`](./zola.md) · [`json`](./zola.json) | Rust 单二进制 + Tera v2 | [`/zola/`](/zola/) | `2016-12-06` | 十年稳步迭代活跃 |
| `sites/fumadocs` | [`fumadocs.md`](./fumadocs.md) · [`json`](./fumadocs.json) | Node · Next.js 16 + MDX | [`/fumadocs/`](/fumadocs/) | `2023-07-03` | 2024–2026 爆发式增长 |
| `sites/nextra` | [`nextra.md`](./nextra.md) · [`json`](./nextra.json) | Node · Next.js 15 + `_meta.js` | [`/nextra/`](/nextra/) | `2020-06-15` | v4 App Router 架构升级 |
| `sites/quartz` | [`quartz.md`](./quartz.md) · [`json`](./quartz.json) | Node · Preact + Obsidian 双链 | [`/quartz/`](/quartz/) | `2021-07-18` | v4 数字花园标杆 |
| `sites/nuxt-content` | [`nuxt-content.md`](./nuxt-content.md) · [`json`](./nuxt-content.json) | Node · Nuxt 4 + SQLite MDC | [`/nuxt-content/`](/nuxt-content/) | `2020-03-31` | v3 MDC + SQLite 持续活跃 |
| `sites/eleventy` | [`eleventy.md`](./eleventy.md) · [`json`](./eleventy.json) | Node · 11ty v3 零 JS HTML | [`/eleventy/`](/eleventy/) | `2017-11-27` | 零客户端 JS 常青活跃 |

---

## 3. 主流生态图鉴预留扩展位（8 个 · 预留 `sites/<id>` 1:1 命名）

| 预留 ID (`sites/<id>`) | 档案与独立 JSON | 官网地址 | 上游 GitHub 仓库 | 开始时间 | 活跃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/lume` | [`lume.md`](./lume.md) · [`json`](./lume.json) | [lume.land](https://lume.land/) | `lumeland/lume` | `2020-09-07` | Deno 原生高频活跃 |
| `sites/sphinx` | [`sphinx.md`](./sphinx.md) · [`json`](./sphinx.json) | [sphinx-doc.org](https://www.sphinx-doc.org/) | `sphinx-doc/sphinx` | `2008-03-21` | Python 与科学出版不朽基石 |
| `sites/gitbook` | [`gitbook.md`](./gitbook.md) · [`json`](./gitbook.json) | [gitbook.com](https://www.gitbook.com/) | `GitbookIO/gitbook` | `2014-03-31` | 旧 CLI 废弃；转型 Next.js 云端 |
| `sites/honkit` | [`honkit.md`](./honkit.md) · [`json`](./honkit.json) | [honkit.netlify.app](https://honkit.netlify.app/) | `honkit/honkit` | `2020-06-13` | 社区接力维护旧 GitBook 生态 |
| `sites/gatsby` | [`gatsby.md`](./gatsby.md) · [`json`](./gatsby.json) | [gatsbyjs.com](https://www.gatsbyjs.com/) | `gatsbyjs/gatsby` | `2015-05-21` | **2023 后显著衰退（历史教材）** |
| `sites/pelican` | [`pelican.md`](./pelican.md) · [`json`](./pelican.json) | [getpelican.com](https://getpelican.com/) | `getpelican/pelican` | `2010-10-16` | Python 博客经典低频维护 |
| `sites/hexo` | [`hexo.md`](./hexo.md) · [`json`](./hexo.json) | [hexo.io](https://hexo.io/) | `hexojs/hexo` | `2012-09-23` | 核心低频维护；文档站已退场 |
| `sites/jekyll` | [`jekyll.md`](./jekyll.md) · [`json`](./jekyll.json) | [jekyllrb.com](https://jekyllrb.com/) | `jekyll/jekyll` | `2008-10-20` | 核心低频维护；文档站已退场 |
