---
title: "docs/sites/ 站点档案与 GitHub 历年提交活跃度总览"
description: "与 sites/<id> 严格 1:1 对齐的 16 个站点档案，以及基于 GitHub GraphQL API 快照渲染的 2008–2026 历年提交数全景表。"
---

# `docs/sites/` 站点特色档案与 GitHub 活跃度总览

本目录（`docs/sites/`）与仓库根目录下的子模块挂载目录 **`sites/<id>` 严格保持 1:1 命名对齐**：

- **已挂载实测子站（7 个）**：每个 `sites/<id>` 子模块均在 `docs/sites/<id>.md` 拥有唯一同名档案；
- **图鉴预留扩展位（9 个）**：每个待扩展的主流静态网站生成器同样按预留挂载名建立独立 `docs/sites/<id>.md`，未来接入子模块时直接沿用同一 `<id>`，彻底消除目录命名脱节；
- **GitHub API 原始快照持久化**：通过 `npm run sync:github`（[`scripts/fetch-github-activity.mjs`](https://github.com/page2401/page2401.github.io/blob/main/scripts/fetch-github-activity.mjs)）查询 GitHub GraphQL API 并将完整响应保存在 [`docs/sites/github-activity.json`](./github-activity.json)，自动驱动下方及各子档案中的**历年提交记录表格（2008–2026）**。

---

## 1. 上游 GitHub 仓库历年提交数全景表（2008–2026）

<!-- GITHUB_API_INDEX_START -->
> 采样时间：`2026-11-23` · 原始 API 数据文件：[`github-activity.json`](./github-activity.json) · 粗体数字代表该仓库 `2016–2026` 期间最高峰年份，`·` 表示当年尚未立项建仓。

| 上游 GitHub 仓库 | 关联 `sites/<id>` | 立项月份 | Stars | 总提交 | `08-15`累计 | `16年` | `17年` | `18年` | `19年` | `20年` | `21年` | `22年` | `23年` | `24年` | `25年` | `26年` |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [`vuejs/vitepress`](https://github.com/vuejs/vitepress) | [`vitepress-v1`](./vitepress-v1.md) [`vitepress-v2`](./vitepress-v2.md) | `2020-04` | ★ 18,521 | 2,958 | · | · | · | · | · | 334 | 260 | 554 | **824** | 369 | 255 | 362 |
| [`vuejs/vuepress`](https://github.com/vuejs/vuepress) | [`vuepress-v1`](./vuepress-v1.md) | `2018-04` | ★ 22,714 | 2,152 | · | · | · | **1297** | 521 | 202 | 92 | 16 | 23 | 1 | 0 | 0 |
| [`vuepress/core`](https://github.com/vuepress/core) | [`vuepress-v2`](./vuepress-v2.md) | `2020-05` | ★ 2,833 | 2,071 | · | · | · | · | · | 510 | **705** | 375 | 150 | 217 | 47 | 67 |
| [`vuepress/ecosystem`](https://github.com/vuepress/ecosystem) | [`vuepress-v2`](./vuepress-v2.md) | `2023-09` | ★ 61 | 1,511 | · | · | · | · | · | · | · | · | 7 | **674** | 466 | 364 |
| [`docsifyjs/docsify`](https://github.com/docsifyjs/docsify) | [`docsify-v4`](./docsify-v4.md) [`docsify-v5`](./docsify-v5.md) | `2016-11` | ★ 31,609 | 2,025 | · | 175 | **657** | 208 | 135 | 299 | 102 | 68 | 132 | 54 | 87 | 108 |
| [`withastro/starlight`](https://github.com/withastro/starlight) | [`astro7-starlight`](./astro7-starlight.md) | `2023-03` | ★ 9,640 | 3,942 | · | · | · | · | · | · | · | · | **1336** | 1272 | 706 | 628 |
| [`withastro/astro`](https://github.com/withastro/astro) | [`astro7-starlight`](./astro7-starlight.md) | `2021-03` | ★ 64,144 | 15,467 | · | · | · | · | · | · | 1991 | 3461 | **3622** | 2797 | 1373 | 2223 |
| [`meta/docusaurus`](https://github.com/meta/docusaurus) | [`docusaurus-v3`](./docusaurus-v3.md) | `2017-06` | ★ 66,787 | 7,118 | · | · | 556 | 693 | 879 | 1084 | **1139** | 1085 | 350 | 400 | 290 | 642 |
| [`web-infra-dev/rspress`](https://github.com/web-infra-dev/rspress) | [`rspress`](./rspress.md) | `2023-06` | ★ 2,360 | 2,937 | · | · | · | · | · | · | · | · | 534 | 782 | **875** | 746 |
| [`shuding/nextra`](https://github.com/shuding/nextra) | [`nextra`](./nextra.md) | `2020-06` | ★ 13,955 | 2,332 | · | · | · | · | · | 93 | 221 | 577 | **578** | 300 | 553 | 10 |
| [`gohugoio/hugo`](https://github.com/gohugoio/hugo) | [`hugo`](./hugo.md) | `2013-07` | ★ 90,550 | 10,107 | 1,820 | **1057** | 986 | 1025 | 567 | 703 | 575 | 633 | 658 | 730 | 652 | 701 |
| [`getzola/zola`](https://github.com/getzola/zola) | [`zola`](./zola.md) | `2016-12` | ★ 17,619 | 2,625 | · | 11 | 366 | **521** | 286 | 296 | 271 | 170 | 204 | 120 | 154 | 226 |
| [`rust-lang/mdBook`](https://github.com/rust-lang/mdBook) | [`mdbook`](./mdbook.md) | `2015-07` | ★ 22,321 | 3,375 | 205 | 154 | 438 | 324 | 252 | 219 | 244 | 200 | 230 | 146 | **688** | 275 |
| [`squidfunk/mkdocs-material`](https://github.com/squidfunk/mkdocs-material) | [`mkdocs-material`](./mkdocs-material.md) | `2016-01` | ★ 27,642 | 6,794 | · | 240 | 656 | 195 | 502 | **1321** | 1004 | 882 | 1171 | 484 | 250 | 89 |
| [`hexojs/hexo`](https://github.com/hexojs/hexo) | [`hexo`](./hexo.md) | `2012-09` | ★ 41,783 | 3,769 | 2,247 | 86 | 120 | 204 | 462 | 333 | 43 | 90 | 44 | 45 | 51 | 44 |
| [`jekyll/jekyll`](https://github.com/jekyll/jekyll) | [`jekyll`](./jekyll.md) | `2008-10` | ★ 51,793 | 11,881 | 6,369 | 2106 | 1044 | 743 | 452 | 517 | 202 | 163 | 109 | 97 | 55 | 24 |
<!-- GITHUB_API_INDEX_END -->

---

## 2. 已挂载实测子站（与 `sites/<id>` 1:1 对应）

| 站点 ID (`sites/<id>`) | 对应档案 (`docs/sites/<id>.md`) | 线上实测路径 | 开始时间 | 活跃时间 | 废弃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/vitepress-v1` | [`vitepress-v1.md`](./vitepress-v1.md) | [`/vitepress-v1/`](/vitepress-v1/) | `2020-04-30` | `2022–2025` 主力稳定 | 未废弃（生产首选稳定版） |
| `sites/vitepress-v2` | [`vitepress-v2.md`](./vitepress-v2.md) | [`/vitepress-v2/`](/vitepress-v2/) | `2025` (v2 分支) | `2025–至今` 高频推进 | 无（下一代 Rolldown 主线） |
| `sites/vuepress-v1` | [`vuepress-v1.md`](./vuepress-v1.md) | [`/vuepress-v1/`](/vuepress-v1/) | `2018-04-05` | `2018–2020` 黄金期 | **已实质废弃 EOL**（`2025–2026` 零提交） |
| `sites/vuepress-v2` | [`vuepress-v2.md`](./vuepress-v2.md) | [`/vuepress-v2/`](/vuepress-v2/) | `2020-05-06` | `2020–至今` 双仓活跃 | 无（`core` + `ecosystem` 持续迭代） |
| `sites/docsify-v4` | [`docsify-v4.md`](./docsify-v4.md) | [`/docsify-v4/`](/docsify-v4/) | `2016-11-20` | `2017–2023` 六年主力 | **`2026-07` 起被 v5 取代进入淘汰期** |
| `sites/docsify-v5` | [`docsify-v5.md`](./docsify-v5.md) | [`/docsify-v5/`](/docsify-v5/) | `2025-05` (RC) | `2025–至今` 显著复苏 | 无（`2026-07` 首发 `v5.0`，当前活跃） |
| `sites/astro7-starlight` | [`astro7-starlight.md`](./astro7-starlight.md) | [`/astro7-starlight/`](/astro7-starlight/) | `2023-03-16` | `2023–至今` 顶级高频 | 无（当前最活跃现代文档框架之一） |

---

## 3. 主流生态图鉴扩展位（预留 `sites/<id>` 1:1 命名）

| 预留 ID (`sites/<id>`) | 对应档案 (`docs/sites/<id>.md`) | 上游官方仓库 | 开始时间 | 活跃时间 | 废弃 / EOL 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sites/docusaurus-v3` | [`docusaurus-v3.md`](./docusaurus-v3.md) | `facebook/docusaurus` | `2017-06-20` | `2018–至今` 稳健活跃 | `v1` (`2022`) 与 `v2` 已淘汰；`v3` 活跃 |
| `sites/hugo` | [`hugo.md`](./hugo.md) | `gohugoio/hugo` | `2013-07-04` | `2014–至今` 十三年常青 | 无（每年稳定 `560–1,000+` 次提交） |
| `sites/mkdocs-material` | [`mkdocs-material.md`](./mkdocs-material.md) | `squidfunk/mkdocs-material` | `2016-01-28` | `2016–至今` 十年主力 | `v8` 已停更；`v9.x` 成熟维护 |
| `sites/rspress` | [`rspress.md`](./rspress.md) | `web-infra-dev/rspress` | `2023-06-27` | `2023–至今` 极高频上升 | 无（`v2.x` 极度活跃） |
| `sites/nextra` | [`nextra.md`](./nextra.md) | `shuding/nextra` | `2020-06-15` | `2021–2025` 高速期 | `v1/v2` 已淘汰；`2026` 提交明显趋缓 |
| `sites/zola` | [`zola.md`](./zola.md) | `getzola/zola` | `2016-12-06` | `2017–至今` 稳步迭代 | 无（持续活跃） |
| `sites/mdbook` | [`mdbook.md`](./mdbook.md) | `rust-lang/mdBook` | `2015-07-07` | `2016–至今` 官方长青 | 无（`2025` 刚创单年 `688` 次提交峰值） |
| `sites/hexo` | [`hexo.md`](./hexo.md) | `hexojs/hexo` | `2012-09-23` | `2013–2020` 博客黄金期 | 核心低频维护；文档站场景已退场 |
| `sites/jekyll` | [`jekyll.md`](./jekyll.md) | `jekyll/jekyll` | `2008-10-20` | `2009–2017` 鼻祖黄金期 | 核心低频维护；现代文档站已退场 |
