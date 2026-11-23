---
title: "00. 基准母版总览 (Master GFM Suite)"
description: "page2401.github.io 静态网站对比平台的标准 CommonMark / GitHub Flavored Markdown 原始母版文档。"
---

# 静态网站生成基准母版（Canonical Master `*.md`）

本目录（`page2401.github.io/docs/`）存放全站所有测试章节的**唯一原始母版（Single Source of Truth）**。母版严格使用不绑定任何特定生成器的 **标准 GitHub Flavored Markdown（GFM）+ LaTeX 数学语法 + Mermaid 代码块** 编写。

各个独立子模块仓库（`sites/vitepress-v1`、`sites/vitepress-v2`、`sites/vuepress-v1`、`sites/vuepress-v2`、`sites/docsify-v4`、`sites/docsify-v5`、`sites/astro7-starlight`）中的文档均由本母版**派生适配（Derived）**而来——凡是子模块与本母版存在差异的行，即为该框架特定大版本所要求的**方言妥协或元数据侵入成本**。

## 母版五大标准测试章节

| 章节路径 | 测试维度 | 母版采用的中立标准语法 | 各子模块派生时的典型改造点 |
| :--- | :--- | :--- | :--- |
| [`00-dialects.md`](./00-dialects.md) | **导览：Markdown 方言谱系** | 梳理 CommonMark → GFM → `markdown-it` / `remark-directive` / MDX / Docsify / MkDocs / Hugo 演进脉络 | 解释为什么同为 `*.md` 却存在语法壁垒与迁移锁定成本 |
| [`01-annotations.md`](./01-annotations.md) | 专属标注与元数据 | 基础 YAML `title`/`description`、GFM `> [!NOTE]` 五类警报、原生 `<details>` | VitePress / VuePress 派生出 `::: tip` 容器与 `<Badge>`；Starlight 被迫改为 `:::caution[标题]` 与强类型 `tableOfContents`；Docsify 派生出 `?>` / `!>` |
| [`02-diagrams.md`](./02-diagrams.md) | 流程图与时序图 | 标准围栏代码块 ```` ```mermaid ````（含 `flowchart`、`sequenceDiagram`、`stateDiagram-v2`） | Markdown 原文几乎无需改动，差异集中体现在工程配置文件与 Mermaid 大版本锁死（v10 / v11 / v12） |
| [`03-math.md`](./03-math.md) | 数学公式排版 | 标准行内 `$...$`、块级 `$$...$$`（含 `aligned`、`bmatrix`、`cases`）及字面量 `\$` 转义 | 原文高度一致，检验各引擎构建期 SVG（MathJax 3）、HTML+Webfont（KaTeX）或客户端钩子防 `\\` 吞噬的表现 |
| [`04-directory/`](./04-directory/index.md) | 目录结构与路由取舍 | `04-directory/index.md` + `nested/` 两篇子文档 | VuePress 派生为 `README.md`；Starlight 迁入 3 层深的 `src/content/docs/` 并去掉数字前缀改用 `order`；Docsify 增加 `_sidebar.md` |
