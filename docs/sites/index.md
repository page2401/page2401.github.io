---
title: "docs/sites/ 站点元数据 JSON 与 GitHub 活跃度总览"
description: "与 sites/<id> 严格 1:1 对齐的 16 组 <id>.md + <id>.json（含官网地址、GitHub 地址、Tag 属性、依赖 Lib 与 github 历年提交节点）。"
---

# `docs/sites/` 站点独立元数据 JSON 与 GitHub 活跃度总览

本目录（`docs/sites/`）与仓库子模块目录 **`sites/<id>` 严格保持 1:1 对齐**，每个站点均成对维护两份文件：

1. **结构化元数据与 API 数据文件 `docs/sites/<id>.json`**：
   - **站点自身元数据**：`websiteUrl`（官方网站）、`githubUrl`（GitHub 源码地址）、`packageUrl`（包仓库地址）、`tags`（特性与流派标签数组）、`lifecycle`（开始 / 活跃 / 废弃时间）、`libs`（运行时、打包器、UI 框架、Markdown 引擎、代码高亮、全文检索、公式与图表库及 `coreLibs` / `pinnedPackages`）；
   - **`github` 节点**：通过 `npm run sync:github`（[`scripts/fetch-github-activity.mjs`](https://github.com/page2401/page2401.github.io/blob/main/scripts/fetch-github-activity.mjs)）查询 GitHub GraphQL API 持久化的仓库统计与 `2008–2026` 历年提交数。
2. **深度剖析文档 `docs/sites/<id>.md`**：自动读取同名 `./<id>.json` 渲染元数据卡片与历年提交活跃度表格，并补充架构优劣与排障实录。

---

## 1. 上游 GitHub 仓库历年提交数全景表（2008–2026）

<!-- GITHUB_API_INDEX_START -->
> 数据聚合自本目录下 16 个独立的 `docs/sites/<id>.json` 中的 `github` 节点（采样日期：`2026-11-23`）。粗体为单年历史峰值，`·` 表示当年尚未建仓。

| 上游 GitHub 仓库 | 1:1 关联档案 & JSON | 立项月份 | Stars | 总提交 | `08-15`累计 | `16年` | `17年` | `18年` | `19年` | `20年` | `21年` | `22年` | `23年` | `24年` | `25年` | `26年` |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [`vuejs/vitepress`](https://github.com/vuejs/vitepress) | [`vitepress-v1`](./vitepress-v1.md)([json](./vitepress-v1.json)) [`vitepress-v2`](./vitepress-v2.md)([json](./vitepress-v2.json)) | `2020-04` | ★ 18,521 | 2,958 | · | · | · | · | · | 334 | 260 | 554 | **824** | 369 | 255 | 362 |
| [`vuejs/vuepress`](https://github.com/vuejs/vuepress) | [`vuepress-v1`](./vuepress-v1.md)([json](./vuepress-v1.json)) | `2018-04` | ★ 22,714 | 2,152 | · | · | · | **1297** | 521 | 202 | 92 | 16 | 23 | 1 | 0 | 0 |
| [`vuepress/core`](https://github.com/vuepress/core) | [`vuepress-v2`](./vuepress-v2.md)([json](./vuepress-v2.json)) | `2020-05` | ★ 2,833 | 2,071 | · | · | · | · | · | 510 | **705** | 375 | 150 | 217 | 47 | 67 |
| [`vuepress/ecosystem`](https://github.com/vuepress/ecosystem) | [`vuepress-v2`](./vuepress-v2.md)([json](./vuepress-v2.json)) | `2023-09` | ★ 61 | 1,511 | · | · | · | · | · | · | · | · | 7 | **674** | 466 | 364 |
| [`docsifyjs/docsify`](https://github.com/docsifyjs/docsify) | [`docsify-v4`](./docsify-v4.md)([json](./docsify-v4.json)) [`docsify-v5`](./docsify-v5.md)([json](./docsify-v5.json)) | `2016-11` | ★ 31,609 | 2,025 | · | 175 | **657** | 208 | 135 | 299 | 102 | 68 | 132 | 54 | 87 | 108 |
| [`withastro/starlight`](https://github.com/withastro/starlight) | [`astro7-starlight`](./astro7-starlight.md)([json](./astro7-starlight.json)) | `2023-03` | ★ 9,640 | 3,942 | · | · | · | · | · | · | · | · | **1336** | 1272 | 706 | 628 |
| [`withastro/astro`](https://github.com/withastro/astro) | [`astro7-starlight`](./astro7-starlight.md)([json](./astro7-starlight.json)) | `2021-03` | ★ 64,144 | 15,467 | · | · | · | · | · | · | 1991 | 3461 | **3622** | 2797 | 1373 | 2223 |
| [`meta/docusaurus`](https://github.com/meta/docusaurus) | [`docusaurus-v3`](./docusaurus-v3.md)([json](./docusaurus-v3.json)) | `2017-06` | ★ 66,787 | 7,118 | · | · | 556 | 693 | 879 | 1084 | **1139** | 1085 | 350 | 400 | 290 | 642 |
| [`gohugoio/hugo`](https://github.com/gohugoio/hugo) | [`hugo`](./hugo.md)([json](./hugo.json)) | `2013-07` | ★ 90,550 | 10,107 | 1,820 | **1057** | 986 | 1025 | 567 | 703 | 575 | 633 | 658 | 730 | 652 | 701 |
| [`squidfunk/mkdocs-material`](https://github.com/squidfunk/mkdocs-material) | [`mkdocs-material`](./mkdocs-material.md)([json](./mkdocs-material.json)) | `2016-01` | ★ 27,642 | 6,794 | · | 240 | 656 | 195 | 502 | **1321** | 1004 | 882 | 1171 | 484 | 250 | 89 |
| [`web-infra-dev/rspress`](https://github.com/web-infra-dev/rspress) | [`rspress`](./rspress.md)([json](./rspress.json)) | `2023-06` | ★ 2,360 | 2,937 | · | · | · | · | · | · | · | · | 534 | 782 | **875** | 746 |
| [`shuding/nextra`](https://github.com/shuding/nextra) | [`nextra`](./nextra.md)([json](./nextra.json)) | `2020-06` | ★ 13,955 | 2,332 | · | · | · | · | · | 93 | 221 | 577 | **578** | 300 | 553 | 10 |
| [`getzola/zola`](https://github.com/getzola/zola) | [`zola`](./zola.md)([json](./zola.json)) | `2016-12` | ★ 17,619 | 2,625 | · | 11 | 366 | **521** | 286 | 296 | 271 | 170 | 204 | 120 | 154 | 226 |
| [`rust-lang/mdBook`](https://github.com/rust-lang/mdBook) | [`mdbook`](./mdbook.md)([json](./mdbook.json)) | `2015-07` | ★ 22,321 | 3,375 | 205 | 154 | 438 | 324 | 252 | 219 | 244 | 200 | 230 | 146 | **688** | 275 |
| [`hexojs/hexo`](https://github.com/hexojs/hexo) | [`hexo`](./hexo.md)([json](./hexo.json)) | `2012-09` | ★ 41,783 | 3,769 | 2,247 | 86 | 120 | 204 | 462 | 333 | 43 | 90 | 44 | 45 | 51 | 44 |
| [`jekyll/jekyll`](https://github.com/jekyll/jekyll) | [`jekyll`](./jekyll.md)([json](./jekyll.json)) | `2008-10` | ★ 51,793 | 11,881 | 6,369 | 2106 | 1044 | 743 | 452 | 517 | 202 | 163 | 109 | 97 | 55 | 24 |
<!-- GITHUB_API_INDEX_END -->

---

## 2. 已挂载实测子站（与 `sites/<id>` 1:1 对应）

| 站点 ID (`sites/<id>`) | 档案与独立 JSON | 官网地址 | 线上实测路径 | 开始时间 | 活跃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/vitepress-v1` | [`vitepress-v1.md`](./vitepress-v1.md) · [`json`](./vitepress-v1.json) | [vitepress.dev](https://vitepress.dev/) | [`/vitepress-v1/`](/vitepress-v1/) | `2020-04-30` | 2022–至今主力稳定 |
| `sites/vitepress-v2` | [`vitepress-v2.md`](./vitepress-v2.md) · [`json`](./vitepress-v2.json) | [vitepress.dev](https://vitepress.dev/) | [`/vitepress-v2/`](/vitepress-v2/) | `2025-01` | v2 Rolldown 高频推进 |
| `sites/vuepress-v1` | [`vuepress-v1.md`](./vuepress-v1.md) · [`json`](./vuepress-v1.json) | [v1.vuepress.vuejs.org](https://v1.vuepress.vuejs.org/) | [`/vuepress-v1/`](/vuepress-v1/) | `2018-04-05` | **已实质废弃 EOL**（25–26 零提交） |
| `sites/vuepress-v2` | [`vuepress-v2.md`](./vuepress-v2.md) · [`json`](./vuepress-v2.json) | [vuejs.press](https://vuejs.press/) | [`/vuepress-v2/`](/vuepress-v2/) | `2020-05-06` | `core` + `ecosystem` 双仓活跃 |
| `sites/docsify-v4` | [`docsify-v4.md`](./docsify-v4.md) · [`json`](./docsify-v4.json) | [docsify.js.org](https://docsify.js.org/) | [`/docsify-v4/`](/docsify-v4/) | `2016-11-20` | **2026-07 起被 v5 替代淘汰** |
| `sites/docsify-v5` | [`docsify-v5.md`](./docsify-v5.md) · [`json`](./docsify-v5.json) | [docsify.js.org](https://docsify.js.org/) | [`/docsify-v5/`](/docsify-v5/) | `2025-05-27` | 2025–2026 显著复苏活跃 |
| `sites/astro7-starlight` | [`astro7-starlight.md`](./astro7-starlight.md) · [`json`](./astro7-starlight.json) | [starlight.astro.build](https://starlight.astro.build/) | [`/astro7-starlight/`](/astro7-starlight/) | `2023-03-16` | 当前最活跃现代文档框架之一 |

---

## 3. 主流生态图鉴扩展位（预留 `sites/<id>` 1:1 命名）

| 预留 ID (`sites/<id>`) | 档案与独立 JSON | 官网地址 | 上游 GitHub 仓库 | 开始时间 | 活跃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/docusaurus-v3` | [`docusaurus-v3.md`](./docusaurus-v3.md) · [`json`](./docusaurus-v3.json) | [docusaurus.io](https://docusaurus.io/) | `meta/docusaurus` | `2017-06-20` | v1/v2 已淘汰；v3 稳健活跃 |
| `sites/hugo` | [`hugo.md`](./hugo.md) · [`json`](./hugo.json) | [gohugo.io](https://gohugo.io/) | `gohugoio/hugo` | `2013-07-04` | 十三年常青高频活跃 |
| `sites/mkdocs-material` | [`mkdocs-material.md`](./mkdocs-material.md) · [`json`](./mkdocs-material.json) | [squidfunk.github.io/mkdocs-material](https://squidfunk.github.io/mkdocs-material/) | `squidfunk/mkdocs-material` | `2016-01-28` | v8 停更；v9.x 稳定活跃 |
| `sites/rspress` | [`rspress.md`](./rspress.md) · [`json`](./rspress.json) | [rspress.rs](https://rspress.rs/) | `web-infra-dev/rspress` | `2023-06-27` | v2.x 极度活跃 |
| `sites/nextra` | [`nextra.md`](./nextra.md) · [`json`](./nextra.json) | [nextra.site](https://nextra.site/) | `shuding/nextra` | `2020-06-15` | v1/v2 淘汰；2026 提交趋缓 |
| `sites/zola` | [`zola.md`](./zola.md) · [`json`](./zola.json) | [getzola.org](https://www.getzola.org/) | `getzola/zola` | `2016-12-06` | 十年稳步迭代活跃 |
| `sites/mdbook` | [`mdbook.md`](./mdbook.md) · [`json`](./mdbook.json) | [rust-lang.github.io/mdBook](https://rust-lang.github.io/mdBook/) | `rust-lang/mdBook` | `2015-07-07` | Rust 官方长青活跃 |
| `sites/hexo` | [`hexo.md`](./hexo.md) · [`json`](./hexo.json) | [hexo.io](https://hexo.io/) | `hexojs/hexo` | `2012-09-23` | 核心低频维护；文档站已退场 |
| `sites/jekyll` | [`jekyll.md`](./jekyll.md) · [`json`](./jekyll.json) | [jekyllrb.com](https://jekyllrb.com/) | `jekyll/jekyll` | `2008-10-20` | 核心低频维护；文档站已退场 |
